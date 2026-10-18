import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePublishPlan } from './publish-package.mjs';
import { assertGiteaRegistry } from './publish-config.mjs';

const releaseEnvironment = {
  PUBLISH_RELEASE: 'true',
  GITHUB_ACTIONS: 'true',
  GITHUB_EVENT_NAME: 'push',
  GITHUB_REF_TYPE: 'tag',
  GITHUB_REF_NAME: 'v0.8.4',
};

test('final release tags publish the stable package version under latest', () => {
  assert.deepEqual(
    resolvePublishPlan({ version: '0.8.4', env: releaseEnvironment }),
    { version: '0.8.4', tag: 'latest', release: true },
  );
});

test('prerelease tags compare only the stable base version', () => {
  assert.deepEqual(
    resolvePublishPlan({
      version: '0.8.4',
      env: { ...releaseEnvironment, GITHUB_REF_NAME: 'v0.8.4-devel.2' },
    }),
    { version: '0.8.4-devel.2', tag: 'devel', release: false },
  );
  assert.deepEqual(
    resolvePublishPlan({
      version: '0.8.4',
      env: { ...releaseEnvironment, GITHUB_REF_NAME: 'v0.8.4-beta.1' },
    }),
    { version: '0.8.4-beta.1', tag: 'next', release: false },
  );
});

test('release tag base must match package.json', () => {
  assert.throws(
    () => resolvePublishPlan({
      version: '0.8.4',
      env: { ...releaseEnvironment, GITHUB_REF_NAME: 'v0.8.5-beta.1' },
    }),
    /does not match package\.json version/,
  );
});

test('package.json must remain a stable base version', () => {
  assert.throws(
    () => resolvePublishPlan({
      version: '0.8.4-beta.1',
      env: { ...releaseEnvironment, GITHUB_REF_NAME: 'v0.8.4-beta.1' },
    }),
    /must contain only a stable base version/,
  );
});

test('manual prereleases derive from the stable package version', () => {
  assert.deepEqual(
    resolvePublishPlan({
      version: '0.8.4',
      env: { PUBLISH_PRERELEASE: 'alpha.3' },
    }),
    { version: '0.8.4-alpha.3', tag: 'next', release: false },
  );
});

test('publishing without a tag or manual prerelease is refused', () => {
  assert.throws(
    () => resolvePublishPlan({ version: '0.8.4', env: {} }),
    /requires a matching/,
  );
});

test('disallowed prerelease identifiers are refused', () => {
  assert.throws(
    () => resolvePublishPlan({
      version: '0.8.4',
      env: { ...releaseEnvironment, GITHUB_REF_NAME: 'v0.8.4-snap.0' },
    }),
    /Unsupported prerelease identifier/,
  );
});

test('public npm is never accepted as a publish target', () => {
  assert.throws(
    () => assertGiteaRegistry('https://registry.npmjs.org/'),
    /Gitea npm registry/,
  );
});
