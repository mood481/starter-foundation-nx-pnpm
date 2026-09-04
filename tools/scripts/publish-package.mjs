#!/usr/bin/env node

import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_PRERELEASE_IDENTIFIERS,
  GITEA_NPM_REGISTRY,
  PACKAGE_NAME,
  assertGiteaRegistry,
  registryAuthKey,
} from './publish-config.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function resolvePublishPlan({ version, env = process.env }) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+)(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(version);
  if (!match) {
    throw new Error(`Package version is not valid semver: ${version}`);
  }

  const prereleaseIdentifier = match[4];
  const isReleaseWorkflow = env.PUBLISH_RELEASE === 'true'
    && env.GITHUB_ACTIONS === 'true'
    && env.GITHUB_EVENT_NAME === 'push'
    && env.GITHUB_REF_TYPE === 'tag'
    && env.GITHUB_REF_NAME === `v${version}`;

  if (!prereleaseIdentifier) {
    if (!isReleaseWorkflow) {
      throw new Error(
        'Refusing to publish a final version outside the release workflow. '
        + 'Use pnpm version prerelease --preid=devel --no-git-tag-version first.',
      );
    }

    return { tag: 'latest', release: true };
  }

  if (isReleaseWorkflow) {
    throw new Error('The release workflow requires a prerelease-free package version.');
  }

  if (!ALLOWED_PRERELEASE_IDENTIFIERS.has(prereleaseIdentifier)) {
    throw new Error(
      `Unsupported prerelease identifier "${prereleaseIdentifier}". `
      + 'Allowed identifiers are devel, alpha, beta, and rc.',
    );
  }

  return {
    tag: prereleaseIdentifier === 'devel' ? 'devel' : 'next',
    release: false,
  };
}

async function prepareUserConfig({ env = process.env, registry = GITEA_NPM_REGISTRY }) {
  if (env.GITEA_TOKEN) {
    const directory = await mkdtemp(resolve(tmpdir(), 'starter-gitea-'));
    const path = resolve(directory, 'npmrc');
    const content = `${registryAuthKey(registry)}=${env.GITEA_TOKEN}\nalways-auth=true\n`;
    await writeFile(path, content, { encoding: 'utf8', mode: 0o600 });
    return { path, temporaryDirectory: directory };
  }

  const configuredPath = env.NPM_CONFIG_USERCONFIG;
  if (configuredPath) {
    try {
      const content = await readFile(configuredPath, 'utf8');
      const authKey = registryAuthKey(registry);
      const hasRegistryToken = content.split(/\r?\n/).some((line) => {
        const separator = line.indexOf('=');
        return separator > 0
          && line.slice(0, separator).trim() === authKey
          && line.slice(separator + 1).trim().length > 0;
      });
      if (hasRegistryToken) {
        return { path: configuredPath, temporaryDirectory: undefined };
      }
    } catch {
      // The publish command reports a missing credential path below.
    }
  }

  throw new Error(
    'No Gitea credential found. Set GITEA_TOKEN or point NPM_CONFIG_USERCONFIG '
    + 'to a token-bearing npmrc.',
  );
}

async function readPackage() {
  return JSON.parse(await readFile(resolve(repoRoot, 'package.json'), 'utf8'));
}

function terminateChild(child) {
  if (process.platform !== 'win32' && child.pid) {
    try {
      process.kill(-child.pid, 'SIGTERM');
      return;
    } catch {
      // Fall back to killing the direct child when no process group exists.
    }
  }
  child.kill('SIGTERM');
}

function runPnpm(args, env, timeoutMs, cwd) {
  return new Promise((resolvePromise, reject) => {
    let settled = false;
    let timer;
    const child = spawn('pnpm', args, {
      cwd,
      detached: process.platform !== 'win32',
      env,
      stdio: 'inherit',
    });
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };

    timer = setTimeout(() => {
      console.error(`pnpm publish timed out after ${timeoutMs} ms.`);
      terminateChild(child);
      finish(reject, new Error(`pnpm publish timed out after ${timeoutMs} ms`));
    }, timeoutMs);

    child.once('error', (error) => finish(reject, error));
    child.once('exit', (code, signal) => {
      if (signal) {
        finish(reject, new Error(`pnpm publish stopped by signal ${signal}`));
        return;
      }
      finish(resolvePromise, code ?? 1);
    });
  });
}

async function preparePublishDirectory() {
  const directory = await mkdtemp(resolve(tmpdir(), 'starter-publish-'));
  try {
    await cp(repoRoot, directory, {
      filter: (sourcePath) => {
        const relativePath = sourcePath.slice(repoRoot.length).replace(/^[/\\]/, '');
        const excludedDirectories = new Set(['.git', 'build', 'coverage', 'dist', 'node_modules', 'tmp']);
        return !relativePath.split(/[/\\]/).some((segment) => excludedDirectories.has(segment));
      },
      recursive: true,
    });
    return directory;
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

export async function publishPackage({ env = process.env, args = [] } = {}) {
  const forwardedArgs = args.filter((arg) => arg !== '--');
  const unsupportedArgs = forwardedArgs.filter((arg) => arg !== '--dry-run');
  if (unsupportedArgs.length > 0) {
    throw new Error(`Unsupported publish option: ${unsupportedArgs[0]}`);
  }

  const packageJson = await readPackage();
  if (packageJson.name !== PACKAGE_NAME) {
    throw new Error(`Unexpected package name: ${packageJson.name}`);
  }

  assertGiteaRegistry(GITEA_NPM_REGISTRY);
  const plan = resolvePublishPlan({ version: packageJson.version, env });
  const userConfig = await prepareUserConfig({ env, registry: GITEA_NPM_REGISTRY });
  const timeoutMs = Number(env.PUBLISH_TIMEOUT_MS ?? 120000);
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('PUBLISH_TIMEOUT_MS must be a positive number of milliseconds.');
  }
  const childEnv = {
    ...env,
    NPM_CONFIG_USERCONFIG: userConfig.path,
  };
  const publishArgs = [
    'publish',
    `--registry=${GITEA_NPM_REGISTRY}`,
    `--tag=${plan.tag}`,
    '--no-git-checks',
    ...forwardedArgs,
  ];
  const action = forwardedArgs.includes('--dry-run') ? 'Dry-running' : 'Publishing';
  console.log(`${action} ${packageJson.name}@${packageJson.version} to ${GITEA_NPM_REGISTRY} with tag ${plan.tag}.`);
  console.log('Preparing package...');
  const publishDirectory = await preparePublishDirectory();
  console.log('Publishing from a clean temporary package directory.');

  try {
    const exitCode = await runPnpm(publishArgs, childEnv, timeoutMs, publishDirectory);
    if (exitCode !== 0) {
      throw new Error(`pnpm publish exited with code ${exitCode}`);
    }
  } finally {
    await rm(publishDirectory, { recursive: true, force: true });
    if (userConfig.temporaryDirectory) {
      await rm(userConfig.temporaryDirectory, { recursive: true, force: true });
    }
  }

  return plan;
}

async function main() {
  try {
    await publishPackage({ args: process.argv.slice(2) });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
