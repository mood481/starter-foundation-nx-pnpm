import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const templateDir = join(repoRoot, 'template');
const keepTemp = process.env.TEMPLATE_VALIDATE_KEEP_TEMP === '1';
const testUnresolvedPlaceholderScanner = process.env.TEMPLATE_VALIDATE_TEST_UNRESOLVED_PLACEHOLDER === '1';
const placeholderPattern = /__[A-Z0-9_]+__/g;

let renderedDir;
let exitCode = 0;

try {
  renderedDir = await createRenderedDirectory();
  const replacements = await getPlaceholderReplacements();

  await renderDirectory(renderedDir, replacements);

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
  } else if (renderedDir) {
    await rm(renderedDir, { force: true, recursive: true });
  }
}

process.exit(exitCode);

async function createRenderedDirectory() {
  if (!existsSync(templateDir)) {
    throw new Error(`Template directory does not exist: ${templateDir}`);
  }

  const parent = process.env.TEMPLATE_VALIDATE_TMPDIR || tmpdir();
  await mkdir(parent, { recursive: true });
  const outputDir = await import('node:fs/promises').then(({ mkdtemp }) =>
    mkdtemp(join(parent, 'starter-template-render-')),
  );

  await cp(templateDir, outputDir, { recursive: true });
  return outputDir;
}

async function getPlaceholderReplacements() {
  const rootPackage = JSON.parse(await readFile(join(repoRoot, 'package.json'), 'utf8'));
  const starterYaml = await readFile(join(repoRoot, 'starter.yaml'), 'utf8');

  const pnpmVersion = String(rootPackage.packageManager || '').split('@').at(1) ||
    cleanVersion(rootPackage.engines?.pnpm) ||
    '10.0.0';
  const nodeVersion = cleanVersion(rootPackage.engines?.node) || process.versions.node;

  return new Map([
    ['__PROJECT_NAME__', 'Template Validation Project'],
    ['__PROJECT_SLUG__', 'template-validation-project'],
    ['__PROJECT_DESCRIPTION__', 'Rendered project used to validate the neutral starter template.'],
    ['__DEFAULT_PACKAGE_SCOPE__', '@template-validation'],
    ['__NODE_VERSION__', nodeVersion],
    ['__PNPM_VERSION__', pnpmVersion],
    ['__STARTER_ID__', getYamlScalar(starterYaml, 'id') || 'foundation-nx-pnpm'],
    ['__STARTER_VERSION__', getYamlScalar(starterYaml, 'version') || String(rootPackage.version || '0.1.0')],
  ]);
}

function cleanVersion(value) {
  return String(value || '').replace(/^[^0-9]*/, '').trim();
}

function getYamlScalar(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim();
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

async function* walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'dist', 'build'].includes(entry.name)) {
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

function formatUnresolvedPlaceholders(matches) {
  const lines = ['Unresolved placeholders remain after rendering:'];
  for (const match of matches) {
    lines.push(`- ${relative(repoRoot, match.filePath)}: ${match.placeholders.join(', ')}`);
  }
  return lines.join('\n');
}

function runPnpm(args, cwd) {
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath ? process.execPath : 'pnpm';
  const commandArgs = npmExecPath ? [npmExecPath, ...args] : args;
  const display = ['pnpm', ...args].join(' ');

  console.log(`\nRunning in ${cwd}: ${display}`);

  const result = spawnSync(command, commandArgs, {
    cwd,
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
