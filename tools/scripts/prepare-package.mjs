import {cp, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export async function preparePackageDirectory() {
    const directory = await mkdtemp(resolve(tmpdir(), 'starter-package-'));
    try {
        await cp(repoRoot, directory, {
            filter: (sourcePath) => {
                const relativePath = sourcePath.slice(repoRoot.length).replace(/^[/\\]/, '');
                const excludedDirectories = new Set(['.git', 'build', 'coverage', 'dist', 'node_modules', 'tmp']);
                return !relativePath.split(/[/\\]/).some((segment) => excludedDirectories.has(segment))
                    && relativePath !== '.npmrc'
                    && relativePath !== '.env'
                    && !relativePath.startsWith('.env.');
            },
            recursive: true,
        });
        await cp(resolve(repoRoot, 'docs/README.package.md'), resolve(directory, 'README.md'));
        return directory;
    } catch (error) {
        await rm(directory, {recursive: true, force: true});
        throw error;
    }
}
