import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {basename, dirname, join, resolve} from 'node:path';
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

test('an npm-installed starter restores .gitignore from .npmignore', async () => {
  const workDir = await mkdtemp(join(tmpdir(), 'foundation-render-packed-'));
  const installedRoot = join(workDir, 'installed');
  const callerDir = join(workDir, 'caller');

  try {
    await mkdir(join(installedRoot, 'bin'), {recursive: true});
    await mkdir(callerDir);
    await cp(binary, join(installedRoot, 'bin/starter-foundation-render.mjs'));
    await cp(join(packageRoot, 'starter.yaml'), join(installedRoot, 'starter.yaml'));
    await cp(join(packageRoot, 'template'), join(installedRoot, 'template'), {
      recursive: true,
      filter: (source) => basename(source) !== 'node_modules',
    });
    await symlink(join(packageRoot, 'node_modules'), join(installedRoot, 'node_modules'), 'dir');
    await rename(join(installedRoot, 'template/.gitignore'), join(installedRoot, 'template/.npmignore'));
    await writeFile(join(callerDir, 'render.yaml'), `mode: standalone
paths:
  root: ./output
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

    const result = spawnSync(process.execPath, [join(installedRoot, 'bin/starter-foundation-render.mjs'), '--input', 'render.yaml'], {
      cwd: callerDir,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      await readFile(join(callerDir, 'output/.gitignore'), 'utf8'),
      await readFile(join(packageRoot, 'template/.gitignore'), 'utf8'),
    );
    await assert.rejects(readFile(join(callerDir, 'output/.npmignore')));
  } finally {
    await rm(workDir, {recursive: true, force: true});
  }
});
