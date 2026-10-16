#!/usr/bin/env node

import {mkdir, rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {preparePackageDirectory, repoRoot} from './prepare-package.mjs';

const destination = resolve(repoRoot, 'dist');

async function main() {
    const directory = await preparePackageDirectory();
    try {
        await mkdir(destination, {recursive: true});
        const exitCode = await new Promise((resolvePromise, reject) => {
            const child = spawn('pnpm', ['pack', '--pack-destination', destination], {
                cwd: directory,
                stdio: 'inherit',
            });
            child.once('error', reject);
            child.once('exit', (code, signal) => {
                if (signal) {
                    reject(new Error(`pnpm pack stopped by signal ${signal}`));
                } else {
                    resolvePromise(code ?? 1);
                }
            });
        });
        if (exitCode !== 0) {
            throw new Error(`pnpm pack exited with code ${exitCode}`);
        }
    } finally {
        await rm(directory, {recursive: true, force: true});
    }
}

try {
    await main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
