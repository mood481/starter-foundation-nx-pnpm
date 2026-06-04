import { cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import YAML from 'yaml';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const placeholderPattern = /__[A-Z0-9_]+__/g;
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build']);

export async function renderTemplate(options = {}) {
  const args = options.args ?? [];
  const parsedArgs = parseArgs(args);
  const inputPath = resolve(options.cwd ?? process.cwd(), options.inputPath ?? parsedArgs.input ?? 'starter.render.yaml');
  const input = await readStructuredFile(inputPath);
  const starter = await readStructuredFile(join(repoRoot, 'starter.yaml'));
  const rootPackage = JSON.parse(await readFile(join(repoRoot, 'package.json'), 'utf8'));
  const variant = resolveVariant(input.variant, options.variant ?? parsedArgs.variant);
  const outputPath = options.outputPathOverride
    ? resolve(options.outputPathOverride)
    : resolveOutputPath(inputPath, input);

  validateStarter(starter);
  validateInput(input);
  validateOutputPath(outputPath);
  const selectedVariant = validateVariant(starter, variant);
  const placeholders = buildPlaceholderMap({ input, rootPackage, selectedVariant, starter });

  await ensureOutputWritable(outputPath);
  await cp(resolve(repoRoot, starter.template.path), outputPath, { recursive: true });

  if (selectedVariant?.overlay?.path) {
    await cp(resolve(repoRoot, selectedVariant.overlay.path), outputPath, {
      force: true,
      recursive: true,
    });
  }

  await renderDirectory(outputPath, placeholders);
  const unresolved = await findUnresolvedPlaceholders(outputPath);
  if (unresolved.length > 0) {
    throw new Error(formatUnresolvedPlaceholders(unresolved));
  }

  return { outputPath, variant: variant ?? null };
}

export function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--input') {
      parsed.input = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--variant') {
      parsed.variant = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return parsed;
}

export async function findUnresolvedPlaceholders(directory) {
  const matches = [];

  for await (const filePath of walkFiles(directory)) {
    const content = await readFile(filePath, 'utf8');
    const found = content.match(placeholderPattern);
    if (found) {
      matches.push({ filePath, placeholders: [...new Set(found)] });
    }
  }

  return matches;
}

export function formatUnresolvedPlaceholders(matches) {
  const lines = ['Unresolved placeholders remain after rendering:'];
  for (const match of matches) {
    lines.push(`- ${relative(repoRoot, match.filePath)}: ${match.placeholders.join(', ')}`);
  }
  return lines.join('\n');
}

function readOptionValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}

async function readStructuredFile(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Input file does not exist: ${filePath}`);
  }

  const source = await readFile(filePath, 'utf8');
  const extension = extname(filePath).toLowerCase();

  if (extension === '.json') {
    return JSON.parse(source);
  }

  if (['.yaml', '.yml'].includes(extension)) {
    return YAML.parse(source);
  }

  throw new Error(`Unsupported input file extension: ${filePath}`);
}

function validateStarter(starter) {
  if (!starter || typeof starter !== 'object') {
    throw new Error('starter.yaml must contain an object.');
  }

  if (!starter.template?.path) {
    throw new Error('starter.yaml must declare template.path.');
  }

  const templatePath = resolve(repoRoot, starter.template.path);
  if (!existsSync(templatePath)) {
    throw new Error(`Template directory does not exist: ${templatePath}`);
  }

  const placeholders = starter.template.placeholders;
  if (!Array.isArray(placeholders?.required)) {
    throw new Error('starter.yaml must declare template.placeholders.required.');
  }
}

function validateInput(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Render input must contain an object.');
  }

  if (!input.output || typeof input.output !== 'object' || typeof input.output.path !== 'string') {
    throw new Error('Render input must declare output.path.');
  }

  if (!input.output.path.trim()) {
    throw new Error('Render input output.path must not be empty.');
  }

  if (!input.placeholders || typeof input.placeholders !== 'object' || Array.isArray(input.placeholders)) {
    throw new Error('Render input must declare placeholders as an object.');
  }

  for (const key of Object.keys(input.placeholders)) {
    if (key.startsWith('__') || key.endsWith('__')) {
      throw new Error(`Placeholder key must omit double-underscore delimiters: ${key}`);
    }
  }
}

function validateOutputPath(outputPath) {
  if (!outputPath || outputPath === repoRoot) {
    throw new Error(`Refusing to render into invalid output path: ${outputPath}`);
  }
}

function resolveVariant(inputVariant, cliVariant) {
  if (inputVariant && cliVariant && inputVariant !== cliVariant) {
    throw new Error(`Variant conflict: input declares '${inputVariant}' but CLI declares '${cliVariant}'.`);
  }
  return cliVariant || inputVariant || undefined;
}

function validateVariant(starter, variant) {
  if (!variant) {
    return undefined;
  }

  const selectedVariant = starter.variants?.[variant];
  if (!selectedVariant) {
    throw new Error(`Unknown variant '${variant}'.`);
  }

  if (selectedVariant.overlay?.path) {
    const overlayPath = resolve(repoRoot, selectedVariant.overlay.path);
    if (!existsSync(overlayPath)) {
      throw new Error(`Overlay path does not exist for variant '${variant}': ${overlayPath}`);
    }
  }

  return selectedVariant;
}

function resolveOutputPath(inputPath, input) {
  return resolve(dirname(inputPath), input.output.path);
}

function buildPlaceholderMap({ input, rootPackage, selectedVariant, starter }) {
  const derived = getDerivedPlaceholders({ rootPackage, starter });
  const values = new Map();

  for (const [key, value] of Object.entries(input.placeholders)) {
    values.set(key, String(value));
  }

  for (const [key, value] of Object.entries(derived)) {
    values.set(key, String(value));
  }

  const required = [
    ...starter.template.placeholders.required,
    ...(selectedVariant?.placeholders?.required ?? []),
  ];

  for (const key of required) {
    const value = values.get(key);
    if (value === undefined || value === '') {
      throw new Error(`Missing required placeholder: ${key}`);
    }
  }

  return new Map([...values.entries()].map(([key, value]) => [`__${key}__`, value]));
}

function getDerivedPlaceholders({ rootPackage, starter }) {
  const pnpmVersion = String(rootPackage.packageManager || '').split('@').at(1)
    || cleanVersion(rootPackage.engines?.pnpm)
    || '10.0.0';
  const nodeVersion = cleanVersion(rootPackage.engines?.node) || process.versions.node;

  return {
    NODE_VERSION: nodeVersion,
    PNPM_VERSION: pnpmVersion,
    STARTER_ID: starter.id || 'foundation-nx-pnpm',
    STARTER_VERSION: starter.version || String(rootPackage.version || '0.1.0'),
  };
}

function cleanVersion(value) {
  return String(value || '').replace(/^[^0-9]*/, '').trim();
}

async function ensureOutputWritable(outputPath) {
  if (existsSync(outputPath)) {
    const outputStat = await stat(outputPath);
    if (!outputStat.isDirectory()) {
      throw new Error(`Output path already exists and is not a directory: ${outputPath}`);
    }

    const entries = await readdir(outputPath);
    if (entries.length > 0) {
      throw new Error(`Output path already exists and is not empty: ${outputPath}`);
    }
    return;
  }

  await mkdir(dirname(outputPath), { recursive: true });
}

async function renderDirectory(directory, replacements) {
  for await (const filePath of walkFiles(directory)) {
    let content = await readFile(filePath, 'utf8');
    for (const [placeholder, value] of replacements) {
      content = content.split(placeholder).join(value);
    }
    await writeFile(filePath, content, 'utf8');
  }
}

async function* walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }
      yield* walkFiles(entryPath);
      continue;
    }

    if (entry.isFile()) {
      yield entryPath;
    }
  }
}

function printHelp() {
  console.log(`Usage: pnpm starter:render -- [--input <path>] [--variant <id>]\n\nOptions:\n  --input <path>    YAML or JSON render input. Defaults to starter.render.yaml.\n  --variant <id>    Optional variant override. Must match input variant when both are set.`);
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    printHelp();
    return;
  }

  const result = await renderTemplate({ args: process.argv.slice(2) });
  console.log(`Rendered starter template: ${result.outputPath}`);
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
