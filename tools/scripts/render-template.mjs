#!/usr/bin/env node

import { cp, mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const placeholderPattern = /__[A-Z0-9_]+__/g;
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build']);
const defaultCliOutputPath = 'dist';

export async function renderTemplate(options = {}) {
  const args = options.args ?? [];
  const parsedArgs = parseArgs(args);
  const cwd = resolve(options.cwd ?? process.cwd());
  const hasInput = options.inputPath !== undefined || parsedArgs.input !== undefined;
  const hasInlineArgs = parsedArgs.variant !== undefined
    || parsedArgs.output !== undefined
    || (parsedArgs.sets?.length ?? 0) > 0;
  const fileMode = hasInput || !hasInlineArgs;
  const starter = await readStructuredFile(join(repoRoot, 'starter.yaml'));
  const rootPackage = JSON.parse(await readFile(join(repoRoot, 'package.json'), 'utf8'));
  let input;
  let inputPath;
  let variant;
  let outputPath;

  if (fileMode) {
    inputPath = resolve(cwd, options.inputPath ?? parsedArgs.input ?? 'starter.render.yaml');
    input = await readStructuredFile(inputPath);
    if (hasInput && hasInlineArgs) {
      console.warn('Ignored --variant/--output/--set because --input is present.');
    }
    validateInput(input);
    variant = input.variant;
    outputPath = options.outputPathOverride !== undefined
      ? resolve(cwd, options.outputPathOverride)
      : resolveOutputPath(inputPath, input);
  } else {
    const cliPlaceholders = parseSetArgs(parsedArgs.sets ?? []);
    input = {
      output: { path: parsedArgs.output ?? defaultCliOutputPath },
      placeholders: Object.fromEntries(cliPlaceholders),
    };
    variant = options.variant ?? parsedArgs.variant;
    outputPath = options.outputPathOverride !== undefined
      ? resolve(cwd, options.outputPathOverride)
      : resolve(cwd, parsedArgs.output ?? defaultCliOutputPath);
  }

  validateStarter(starter);
  validateOutputPath(outputPath);
  const selectedVariant = validateVariant(starter, variant);
  const placeholders = buildPlaceholderMap({ input, rootPackage, selectedVariant, starter });

  await ensureOutputWritable(outputPath);
  await cp(resolve(repoRoot, starter.template.path), outputPath, {
    recursive: true,
    filter: shouldCopyPath,
  });

  if (selectedVariant?.overlay?.path) {
    await cp(resolve(repoRoot, selectedVariant.overlay.path), outputPath, {
      force: true,
      filter: shouldCopyPath,
      recursive: true,
    });
  }

  await normalizeIgnoreFile(outputPath);
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

    if (arg === '--output') {
      parsed.output = readOptionValue(args, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--set') {
      const value = readOptionValue(args, index, arg);
      parsed.sets ??= [];
      parsed.sets.push(value);
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

export function parseSetArgs(sets = []) {
  const values = new Map();

  for (const entry of sets) {
    const equalsIndex = entry.indexOf('=');
    const key = equalsIndex >= 0 ? entry.slice(0, equalsIndex).trim() : '';
    if (
      equalsIndex < 0
      || !key
      || !/^[A-Z0-9_]+$/.test(key)
      || key.includes('__')
    ) {
      throw new Error(`Malformed --set: ${entry}`);
    }

    values.set(key, entry.slice(equalsIndex + 1));
  }

  return values;
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

function shouldCopyPath(sourcePath) {
  return !ignoredDirectories.has(basename(sourcePath));
}

async function normalizeIgnoreFile(directory) {
  const npmIgnorePath = join(directory, '.npmignore');
  const gitIgnorePath = join(directory, '.gitignore');
  if (existsSync(npmIgnorePath) && !existsSync(gitIgnorePath)) {
    await rename(npmIgnorePath, gitIgnorePath);
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
  console.log(`Usage: starter-foundation-render [options]

Local invocation:
  pnpm starter:render -- [options]

Published invocation:
  npx @mood481/starter-foundation-nx-pnpm@0.4.0 [options]

Modes:
  File mode: provide --input <filepath>. The input file supplies output.path,
             variant, and placeholders. Concurrent --variant, --output, and
             --set flags are ignored with a warning.
  CLI mode: omit --input. Use --variant and repeatable --set; --output is
            optional and defaults to dist/ relative to the current directory.

Options:
  --input <filepath>  YAML or JSON render input for file mode.
  --variant <name>    Declared variant to apply in CLI mode.
  --output <path>     Generated project destination in CLI mode.
  --set <KEY=VALUE>   Placeholder assignment; repeatable.
  --help, -h          Print this help without writing files.

Examples:
  starter-foundation-render --input ./render-input.mws.yaml
  starter-foundation-render --variant mws --output ./my-project --set PROJECT_ID=my-project --set "PROJECT_NAME=My Project" --set PROJECT_SLUG=my-project --set "PROJECT_DESCRIPTION=My project" --set DEFAULT_PACKAGE_SCOPE=@my-project
  npx @mood481/starter-foundation-nx-pnpm@0.4.0 --input ./render-input.mws.yaml
  npx @mood481/starter-foundation-nx-pnpm@0.4.0 --variant mws --output ./my-project --set PROJECT_ID=my-project --set "PROJECT_NAME=My Project" --set PROJECT_SLUG=my-project --set "PROJECT_DESCRIPTION=My project" --set DEFAULT_PACKAGE_SCOPE=@my-project`);
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

const isMain = process.argv[1] !== undefined
  && existsSync(process.argv[1])
  && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
