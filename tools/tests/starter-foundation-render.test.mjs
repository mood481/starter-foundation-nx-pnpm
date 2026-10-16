import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const binary = join(packageRoot, 'bin/starter-foundation-render.mjs');

test('input paths.root is relative to the caller and --output overrides it', async () => {
  const workDir = await mkdtemp(join(tmpdir(), 'foundation-render-path-'));
  const callerDir = join(workDir, 'caller');
  const inputDir = join(callerDir, 'config');

  try {
    await mkdir(inputDir, {recursive: true});
    await writeFile(join(inputDir, 'render.yaml'), `mode: standalone
paths:
  root: ../generated
placeholders:
  PROJECT_NAME: Example
  PROJECT_SLUG: example
  PROJECT_DESCRIPTION: Example workspace.
  DEFAULT_PACKAGE_SCOPE: "@example"
  NODE_VERSION: "26.12.0"
  NODE_VERSION_SINGLE: "26"
  PNPM_VERSION: "12.14.0"
  NX_VERSION: "^23.3.0"
`);

    const fromRequest = spawnSync(process.execPath, [binary, '--input', 'config/render.yaml'], {
      cwd: callerDir,
      encoding: 'utf8',
    });
    assert.equal(fromRequest.status, 0, fromRequest.stderr);
    assert.ok(fromRequest.stdout.includes('Rendered starter:'), fromRequest.stdout);
    const generatedPackage = JSON.parse(await readFile(join(workDir, 'generated/package.json'), 'utf8'));
    assert.equal(generatedPackage.name, 'example');

    const fromOverride = spawnSync(process.execPath, [binary, '--input=config/render.yaml', '--output=./overridden'], {
      cwd: callerDir,
      encoding: 'utf8',
    });
    assert.equal(fromOverride.status, 0, fromOverride.stderr);
    const overriddenPackage = JSON.parse(await readFile(join(callerDir, 'overridden/package.json'), 'utf8'));
    assert.equal(overriddenPackage.name, 'example');
  } finally {
    await rm(workDir, {recursive: true, force: true});
  }
});
