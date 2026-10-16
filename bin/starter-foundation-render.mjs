#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

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

const forwarded = hasOption(args, '--starter') ? [...args] : ['--starter', starterRoot, ...args];
const inputPath = optionValue(args, '--input');

if (inputPath && !hasOption(args, '--output') && !hasOption(args, '--help') && !args.includes('-h')) {
  try {
    const request = YAML.parse(readFileSync(resolve(process.cwd(), inputPath), 'utf8'));
    const outputPath = request?.paths?.root ?? request?.output?.path;
    if (typeof outputPath === 'string' && outputPath.trim() !== '') {
      // The renderer resolves request paths from the starter root after loading YAML.
      // An absolute --output preserves the caller's working directory as the base.
      forwarded.push('--output', resolve(process.cwd(), outputPath));
    }
  } catch {
    // Let the canonical renderer report unreadable or invalid requests.
  }
}

const result = spawnSync(process.execPath, [rendererCli, ...forwarded], { stdio: 'inherit' });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.status === 0) {
  const outputPath = optionValue(forwarded, '--output');
  const selectedStarter = optionValue(forwarded, '--starter');
  if (outputPath && selectedStarter) {
    try {
      restoreGitignore(resolve(process.cwd(), selectedStarter), resolve(process.cwd(), outputPath));
    } catch (error) {
      console.error(`Unable to restore generated .gitignore: ${error.message}`);
      process.exit(1);
    }
  }
}

process.exit(result.status ?? 1);

function restoreGitignore(selectedStarter, outputRoot) {
  const templateRoot = join(selectedStarter, 'template');
  const templateGitignore = join(templateRoot, '.gitignore');
  const templateNpmignore = join(templateRoot, '.npmignore');
  if (existsSync(templateGitignore) || !existsSync(templateNpmignore)) return;

  const outputGitignore = join(outputRoot, '.gitignore');
  const outputNpmignore = join(outputRoot, '.npmignore');
  if (!existsSync(outputGitignore) && existsSync(outputNpmignore)) {
    // npm renames a packaged .gitignore to .npmignore when installing a tarball.
    renameSync(outputNpmignore, outputGitignore);
  }
}

function hasOption(values, name) {
  return values.some((value) => value === name || value.startsWith(`${name}=`));
}

function optionValue(values, name) {
  const index = values.findIndex((value) => value === name || value.startsWith(`${name}=`));
  if (index === -1) return undefined;
  const value = values[index];
  return value === name ? values[index + 1] : value.slice(name.length + 1);
}
