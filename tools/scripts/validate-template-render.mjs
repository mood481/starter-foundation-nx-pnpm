import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  parseArgs,
  renderTemplate,
  findUnresolvedPlaceholders,
  formatUnresolvedPlaceholders,
  validateNeutralOutput,
} from './render-template.mjs';

const keepTemp = process.env.TEMPLATE_VALIDATE_KEEP_TEMP === '1';
const testUnresolvedPlaceholderScanner = process.env.TEMPLATE_VALIDATE_TEST_UNRESOLVED_PLACEHOLDER === '1';

let renderedDir;
let workDir;
let inputPath;
let exitCode = 0;

try {
  const args = parseArgs(process.argv.slice(2));
  const parent = process.env.TEMPLATE_VALIDATE_TMPDIR || tmpdir();
  await mkdir(parent, { recursive: true });
  workDir = await import('node:fs/promises').then(({ mkdtemp }) =>
    mkdtemp(join(parent, 'starter-template-render-')),
  );
  renderedDir = join(workDir, 'output');

  inputPath = args.input;
  if (!inputPath) {
    inputPath = join(workDir, 'starter.render.yaml');
    await writeFile(inputPath, getNeutralValidationInput(), 'utf8');
  }

  const renderResult = await renderTemplate({
    inputPath,
    outputPathOverride: renderedDir,
    variant: args.variant,
  });

  if (!renderResult.variant && renderResult.extensions.length === 0) {
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

function getNeutralValidationInput() {
  return `output:
  path: .

placeholders:
  PROJECT_NAME: Template Validation Project
  PROJECT_SLUG: template-validation-project
  PROJECT_DESCRIPTION: Rendered project used to validate the neutral starter template.
  DEFAULT_PACKAGE_SCOPE: "@template-validation"
extensions: []
`;
}

function runPnpm(args, cwd) {
  const display = ['pnpm', ...args].join(' ');

  console.log(`\nRunning in ${cwd}: ${display}`);

  const result = spawnSync('pnpm', args, {
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
