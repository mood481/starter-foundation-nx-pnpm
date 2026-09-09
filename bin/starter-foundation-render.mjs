#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const starterRoot = resolve(scriptDir, '..');
const args = process.argv.slice(2);

let rendererCli;
try {
  const rendererMain = require.resolve('@mood481/starter-renderer');
  rendererCli = join(dirname(rendererMain), 'cli.js');
} catch (error) {
  console.error(`Unable to resolve @mood481/starter-renderer: ${error.message}`);
  process.exit(1);
}

const forwarded = args.includes('--starter') ? args : ['--starter', starterRoot, ...args];
const result = spawnSync(process.execPath, [rendererCli, ...forwarded], { stdio: 'inherit' });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
