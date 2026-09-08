import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const placeholderPattern = /__[A-Z0-9_]+__/g;
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build']);

const keepTemp = process.env.TEMPLATE_VALIDATE_KEEP_TEMP === '1';
const testUnresolvedPlaceholderScanner = process.env.TEMPLATE_VALIDATE_TEST_UNRESOLVED_PLACEHOLDER === '1';

let workDir;
let renderedDir;
let exitCode = 0;

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const inputPath = resolve(repoRoot, args.input ?? 'examples/render.neutral.yaml');
  const starterPath = join(repoRoot, 'starter.yaml');

  await mkdir(await parentDir(), { recursive: true });
  workDir = await mkdtempIn(parentDir(), 'starter-template-render-');
  renderedDir = join(workDir, 'output');

  validateContract('starter', starterPath);
  validateContract('render', inputPath);

  renderWithCanonical(inputPath, renderedDir, args.variant);

  if (!args.variant) {
    await validateNeutralOutput(renderedDir);
  }

  if (testUnresolvedPlaceholderScanner) {
    console.log('Injecting unresolved placeholder to test the scanner failure path.');
    await writeFile(
      join(renderedDir, 'unresolved-placeholder-scanner-check.txt'),
      'Intentional unresolved placeholder for validation: __UNRESOLVED_PLACEHOLDER__\n',
      'utf8',
    );
  }

  const unresolved = await findUnresolvedPlaceholders(renderedDir);
  if (unresolved.length > 0) {
    throw new Error(formatUnresolvedPlaceholders(unresolved));
  }

  runPnpm(['install'], renderedDir);
  if (!await exists(join(renderedDir, 'pnpm-lock.yaml'))) {
    throw new Error('Rendered project install did not produce pnpm-lock.yaml.');
  }
  runPnpm(['install', '--frozen-lockfile'], renderedDir);
  runPnpm(['validate'], renderedDir);
  runPnpm(['nx', 'graph', '--file=tmp/nx-graph.json'], renderedDir);

  console.log(`Template render validation passed: ${renderedDir}`);
} catch (error) {
  exitCode = 1;
  console.error(error instanceof Error ? error.message : error);
} finally {
  if (renderedDir && keepTemp) {
    console.log(`Keeping rendered template directory: ${renderedDir}`);
    console.log(`Keeping template validation work directory: ${workDir}`);
  } else if (workDir) {
    await rm(workDir, { force: true, recursive: true });
  }
}

process.exit(exitCode);

function parentDir() {
  return process.env.TEMPLATE_VALIDATE_TMPDIR || tmpdir();
}

async function mkdtempIn(parent, prefix) {
  const { mkdtemp } = await import('node:fs/promises');
  return mkdtemp(join(parent, prefix));
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function canonicalCli(packageName) {
  return join(dirname(require.resolve(packageName)), 'cli.js');
}

function runNode(scriptPath, scriptArgs, displayArgs) {
  const display = [`node`, scriptPath, ...displayArgs].join(' ');
  console.log(`\nRunning: ${display}`);
  const result = spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command failed: ${display}`);
  }
}

function validateContract(type, filePath) {
  runNode(
    canonicalCli('@mood481/starter-validator'),
    ['--type', type, filePath],
    ['--type', type, relative(repoRoot, filePath)],
  );
}

function renderWithCanonical(inputPath, output, variant) {
  const renderArgs = ['--starter', repoRoot, '--input', inputPath, '--output', output];
  const displayArgs = ['--input', relative(repoRoot, inputPath), '--output', '<temp>', ...(variant ? ['--variant', variant] : [])];
  if (variant) {
    renderArgs.push('--variant', variant);
  }
  runNode(canonicalCli('@mood481/starter-renderer'), renderArgs, displayArgs);
}

async function findUnresolvedPlaceholders(directory) {
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

function formatUnresolvedPlaceholders(matches) {
  const lines = ['Unresolved placeholders remain after rendering:'];
  for (const match of matches) {
    lines.push(`- ${relative(repoRoot, match.filePath)}: ${match.placeholders.join(', ')}`);
  }
  return lines.join('\n');
}

async function validateNeutralOutput(directory) {
  await validateNeutralDirectories(directory);
  for await (const filePath of walkFiles(directory)) {
    const pathParts = relative(directory, filePath).split(/[\\/]/);
    if (pathParts.some((part) => part.toLowerCase() === 'openspec')) {
      throw new Error(`Neutral output contains forbidden OpenSpec path: ${relative(directory, filePath)}`);
    }
  }

  const packageJson = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.optionalDependencies,
  };
  const forbiddenDependency = Object.keys(dependencies).find((name) => name.toLowerCase().includes('openspec'));
  if (forbiddenDependency) {
    throw new Error(`Neutral output contains forbidden SDD dependency: ${forbiddenDependency}`);
  }

  const forbiddenScript = Object.entries(packageJson.scripts ?? {}).find(([name, command]) =>
    `${name} ${command}`.toLowerCase().includes('openspec')
      || name.toLowerCase() === 'ospec'
      || name.toLowerCase() === 'validate:spec');
  if (forbiddenScript) {
    throw new Error(`Neutral output contains forbidden SDD script: ${forbiddenScript[0]}`);
  }
}

async function validateNeutralDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name.toLowerCase() === 'openspec') {
      throw new Error(`Neutral output contains forbidden OpenSpec directory: ${join(directory, entry.name)}`);
    }
    await validateNeutralDirectories(join(directory, entry.name));
  }
}

async function* walkFiles(directory) {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .sort((left, right) => left.name.localeCompare(right.name));
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

function runPnpm(args, cwd) {
  const display = ['pnpm', ...args].join(' ');
  console.log(`\nRunning in ${cwd}: ${display}`);
  const result = spawnSync('pnpm', args, { cwd, env: process.env, stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Command failed: ${display}`);
  }
}

function parseArgs(argv) {
  const parsed = { help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') {
      parsed.help = true;
    } else if (token === '--input') {
      parsed.input = readOptionValue(argv, index, '--input');
      index += 1;
    } else if (token === '--variant') {
      parsed.variant = readOptionValue(argv, index, '--variant');
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }
  return parsed;
}

function readOptionValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}

function printHelp() {
  console.log(`Usage: validate-template-render.mjs [--input <render.yaml>] [--variant <id>] [--help]

Validates the starter by validating contract documents with the canonical
@mood481/starter-validator, rendering with the canonical
@mood481/starter-renderer, then installing the rendered project (a real
\`pnpm install\`, no shipped template lockfile) and running its own
validation and Nx graph.`);
}
