import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePublishPlan } from './publish-package.mjs';
import { assertGiteaRegistry } from './publish-config.mjs';

const releaseEnvironment = {
  PUBLISH_RELEASE: 'true',
  GITHUB_ACTIONS: 'true',
  GITHUB_EVENT_NAME: 'push',
  GITHUB_REF_TYPE: 'tag',
  GITHUB_REF_NAME: 'v0.6.0',
};

test('release tags publish final versions under latest', () => {
  assert.deepEqual(
    resolvePublishPlan({ version: '0.6.0', env: releaseEnvironment }),
    { tag: 'latest', release: true },
  );
});

test('manual prereleases use non-latest tags', () => {
  assert.deepEqual(
    resolvePublishPlan({ version: '0.6.0-devel.0', env: {} }),
    { tag: 'devel', release: false },
  );
  assert.deepEqual(
    resolvePublishPlan({ version: '0.6.0-alpha.0', env: {} }),
    { tag: 'next', release: false },
  );
});

test('manual final versions are refused', () => {
  assert.throws(
    () => resolvePublishPlan({ version: '0.6.0', env: {} }),
    /outside the release workflow/,
  );
});

test('release tags must match the package version', () => {
  assert.throws(
    () => resolvePublishPlan({
      version: '0.6.0',
      env: { ...releaseEnvironment, GITHUB_REF_NAME: 'v0.6.1' },
    }),
    /outside the release workflow/,
  );
});

test('disallowed prerelease identifiers are refused', () => {
  assert.throws(
    () => resolvePublishPlan({ version: '0.6.0-snap.0', env: {} }),
    /Unsupported prerelease identifier/,
  );
});

test('public npm is never accepted as a publish target', () => {
  assert.throws(
    () => assertGiteaRegistry('https://registry.npmjs.org/'),
    /Gitea npm registry/,
  );
});
