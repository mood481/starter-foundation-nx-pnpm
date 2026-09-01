import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  normalizeExtensionNames,
  preflightExtensionComposition,
  resolveExtensions,
} from './extension-contract.mjs';
import { renderTemplate } from './render-template.mjs';

const starter = {
  version: '0.5.0',
  extensions: [],
  extensionGroups: {},
  provides: ['extension-support'],
};

function fixtureManifest(id, contributions = {}) {
  return {
    id,
    version: '1.0.0',
    source: { kind: 'memory', locator: id },
    compatibility: {
      starter: '>=0.5.0 <0.6.0',
      requires: { capabilities: [] },
    },
    contributions,
  };
}

test('extension names share validation across structured and CLI-shaped values', () => {
  assert.deepEqual(normalizeExtensionNames(undefined), []);
  assert.deepEqual(normalizeExtensionNames([]), []);
  assert.deepEqual(normalizeExtensionNames('alpha,beta-extension'), ['alpha', 'beta-extension']);
  for (const value of [',alpha', 'alpha,', 'alpha,,beta', 'Alpha', 'alpha_beta', 'alpha,alpha']) {
    assert.throws(() => normalizeExtensionNames(value), /invalid|duplicate/);
  }
});

test('default resolver has no production extension and fails before rendering', async () => {
  const workDir = await mkdtemp(join(tmpdir(), 'starter-unknown-extension-test-'));
  const outputPath = join(workDir, 'output');
  try {
    await assert.rejects(
      renderTemplate({
        args: [
          '--output', outputPath,
          '--extensions', 'missing-extension',
          '--set', 'PROJECT_NAME=Unknown Extension',
          '--set', 'PROJECT_SLUG=unknown-extension',
          '--set', 'PROJECT_DESCRIPTION=Unknown extension test',
          '--set', 'DEFAULT_PACKAGE_SCOPE=@unknown',
        ],
      }),
      /No extension provider resolved 'missing-extension'/,
    );
    assert.equal(existsSync(outputPath), false);
  } finally {
    await rm(workDir, { force: true, recursive: true });
  }

  await assert.rejects(
    resolveExtensions({ names: ['missing-extension'], starter, variant: undefined }),
    /No extension provider resolved 'missing-extension'/,
  );
});

test('manifest compatibility failures report the failing field', async () => {
  await assert.rejects(
    resolveExtensions({
      names: ['incompatible-extension'],
      starter,
      variant: undefined,
      resolver: async () => ({
        manifest: {
          ...fixtureManifest('incompatible-extension'),
          compatibility: {
            starter: '<0.5.0',
            requires: { capabilities: ['missing-capability'] },
          },
        },
      }),
    }),
    /compatibility\.starter.*excludes starter|missing starter capability/,
  );
});

test('preflight rejects extension file collisions before any destination write', async () => {
  const extension = {
    manifest: fixtureManifest('collision-extension', {
      files: [{ path: 'package.json', content: '{}\n' }],
    }),
  };

  await assert.rejects(
    preflightExtensionComposition({
      extensions: [extension],
      starter,
      templateFiles: ['package.json'],
      variantFiles: [],
      packageJson: { name: 'fixture' },
    }),
    /cannot contribute package.json/,
  );
});

test('input extensions remain authoritative over the CLI extension option', async () => {
  const workDir = await mkdtemp(join(tmpdir(), 'starter-input-test-'));
  const outputPath = join(workDir, 'output');
  const inputPath = join(workDir, 'input.yaml');
  const originalWarn = console.warn;
  const warnings = [];

  try {
    await writeFile(inputPath, `extensions: []\noutput:\n  path: ${outputPath}\nplaceholders:\n  PROJECT_NAME: Input Project\n  PROJECT_SLUG: input-project\n  PROJECT_DESCRIPTION: Input test\n  DEFAULT_PACKAGE_SCOPE: "@input"\n`);
    console.warn = (message) => warnings.push(message);
    await renderTemplate({ args: ['--input', inputPath, '--extensions', 'unresolved-extension'] });
    assert.match(warnings[0], /Ignored --variant\/--extensions\/--output\/--set/);
  } finally {
    console.warn = originalWarn;
    await rm(workDir, { force: true, recursive: true });
  }
});

test('synthetic extension files, mutations, placeholders, and pipeline order compose', async () => {
  const workDir = await mkdtemp(join(tmpdir(), 'starter-extension-test-'));
  const outputPath = join(workDir, 'output');
  const steps = [];

  try {
    const result = await renderTemplate({
      cwd: process.cwd(),
      args: [
        '--output', outputPath,
        '--extensions', 'memory-extension',
        '--set', 'PROJECT_NAME=Memory Project',
        '--set', 'PROJECT_SLUG=memory-project',
        '--set', 'PROJECT_DESCRIPTION=Memory extension test',
        '--set', 'DEFAULT_PACKAGE_SCOPE=@memory',
      ],
      extensionProviders: [{
        resolve: () => ({
          manifest: fixtureManifest('memory-extension', {
            files: [{ path: 'docs/memory.txt', content: 'Hello __PROJECT_NAME__\n' }],
            mutations: {
              packageJson: {
                scripts: { 'memory:check': 'node check.js' },
              },
            },
          }),
        }),
      }],
      onStep: (step) => steps.push(step),
    });

    assert.deepEqual(result.extensions, ['memory-extension']);
    assert.equal(await readFile(join(outputPath, 'docs/memory.txt'), 'utf8'), 'Hello Memory Project\n');
    const packageJson = JSON.parse(await readFile(join(outputPath, 'package.json'), 'utf8'));
    assert.equal(packageJson.name, 'memory-project');
    assert.equal(packageJson.devDependencies.nx, '^23.1.1');
    assert.equal(packageJson.scripts['memory:check'], 'node check.js');
    assert.deepEqual(steps, [
      'load-starter-and-input',
      'validate-output',
      'resolve-variant',
      'resolve-extensions',
      'preflight-extensions',
      'copy-neutral-template',
      'apply-variant-overlay',
      'apply-extension-files',
      'apply-package-json-mutations',
      'resolve-placeholders',
      'validate-rendered-output',
    ]);
  } finally {
    await rm(workDir, { force: true, recursive: true });
  }
});

test('composition ordering and mutation conflicts are deterministic', async () => {
  const makeExtension = (id, scriptKey, script) => ({
    manifest: fixtureManifest(id, {
      files: [{ path: `docs/${id}.txt`, content: id }],
      mutations: { packageJson: { scripts: { [scriptKey]: script } } },
    }),
  });
  const extensions = [
    makeExtension('zeta', 'zeta:check', 'zeta'),
    makeExtension('alpha', 'alpha:check', 'alpha'),
  ];
  const composition = await preflightExtensionComposition({
    extensions,
    starter,
    templateFiles: ['package.json'],
    variantFiles: [],
    packageJson: { name: 'fixture', scripts: {} },
  });
  assert.deepEqual(composition.contributions.map(({ extensionId }) => extensionId), ['alpha', 'zeta']);

  await assert.rejects(
    preflightExtensionComposition({
      extensions: [
        makeExtension('zeta', 'shared:check', 'zeta'),
        makeExtension('alpha', 'shared:check', 'alpha'),
      ],
      starter,
      templateFiles: ['package.json'],
      variantFiles: [],
      packageJson: { name: 'fixture', scripts: {} },
    }),
    /package\.json script conflict|Extension package\.json mutation conflict/,
  );
});

test('group cardinality, path safety, and dependency map conflicts fail during preflight', async () => {
  const groupedStarter = { ...starter, extensionGroups: { sdd: { min: 1, max: 1 } } };
  const groupedExtension = {
    manifest: { ...fixtureManifest('grouped-extension'), group: 'sdd' },
  };
  await assert.rejects(
    preflightExtensionComposition({
      extensions: [],
      starter: groupedStarter,
      templateFiles: [],
      variantFiles: [],
      packageJson: {},
    }),
    /Extension group 'sdd'/,
  );
  await assert.rejects(
    preflightExtensionComposition({
      extensions: [groupedExtension, { ...groupedExtension, manifest: { ...groupedExtension.manifest, id: 'second-extension' } }],
      starter: groupedStarter,
      templateFiles: [],
      variantFiles: [],
      packageJson: {},
    }),
    /Extension group 'sdd'/,
  );

  await assert.rejects(
    preflightExtensionComposition({
      extensions: [{
        manifest: fixtureManifest('unsafe-extension', {
          files: [{ path: '../outside.txt', content: 'unsafe' }],
        }),
      }],
      starter,
      templateFiles: [],
      variantFiles: [],
      packageJson: {},
    }),
    /stay within its artifact root/,
  );

  await assert.rejects(
    preflightExtensionComposition({
      extensions: [{
        manifest: fixtureManifest('dependency-conflict', {
          mutations: {
            packageJson: {
              dependencies: { shared: '1.0.0' },
              devDependencies: { shared: '1.0.0' },
            },
          },
        }),
      }],
      starter,
      templateFiles: [],
      variantFiles: [],
      packageJson: {},
    }),
    /assigned in both dependencies.*devDependencies/,
  );
});
