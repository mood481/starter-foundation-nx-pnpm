import { access, readdir } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import {
  compareResolvedExtensions,
  compareStrings,
  getPackageJsonMutations,
  isPlainObject,
  normalizeContributionPath,
  PACKAGE_JSON_MUTATION_MAPS,
  validatePackageJsonMutationShape,
} from './extension-utils.mjs';
import { validateExtensionGroups } from './extension-resolver.mjs';

export async function preflightExtensionComposition({
  extensions,
  starter,
  templateRoot,
  variantOverlayRoot,
  templateFiles,
  variantFiles,
  packageJson,
}) {
  validateExtensionGroups(starter.extensionGroups ?? {}, extensions);
  const orderedExtensions = [...extensions].sort(compareResolvedExtensions);
  const occupied = new Map();

  for (const path of templateFiles ?? await listRelativeFiles(templateRoot)) {
    occupied.set(path, 'neutral template');
  }
  for (const path of variantFiles ?? (variantOverlayRoot ? await listRelativeFiles(variantOverlayRoot) : [])) {
    occupied.set(path, 'selected variant overlay');
  }

  const contributions = [];
  for (const extension of orderedExtensions) {
    const files = await collectExtensionFileContributions(extension);
    extension.files = files;
    for (const file of files) {
      const existing = findOccupiedPathConflict(file.targetPath, occupied);
      if (existing) {
        throw new Error(
          `Extension file collision at '${file.targetPath}': '${extension.manifest.id}' conflicts with ${existing}.`,
        );
      }
      occupied.set(file.targetPath, `extension '${extension.manifest.id}'`);
      contributions.push(file);
    }
  }

  return {
    contributions,
    packageJson: applyPackageJsonMutations(packageJson, orderedExtensions),
  };
}

export function applyPackageJsonMutations(packageJson, extensions) {
  const mutationState = collectPackageJsonMutations(packageJson, extensions);
  const result = structuredClone(packageJson);
  for (const mapName of PACKAGE_JSON_MUTATION_MAPS) {
    const entries = Object.entries(mutationState[mapName]);
    if (entries.length === 0) {
      continue;
    }
    result[mapName] ??= {};
    for (const [key, value] of entries) {
      result[mapName][key] = value;
    }
  }
  return result;
}

export function collectPackageJsonMutations(packageJson, extensions) {
  const result = Object.fromEntries(PACKAGE_JSON_MUTATION_MAPS.map((mapName) => [mapName, {}]));
  const assignments = new Map();
  const dependencyOwners = new Map();
  const errors = [];

  for (const extension of extensions) {
    let mutations;
    try {
      mutations = getPackageJsonMutations(extension.manifest);
      validatePackageJsonMutationShape(mutations);
    } catch (error) {
      errors.push(`extension '${extension.manifest.id}': ${error.message}`);
      continue;
    }

    for (const mapName of PACKAGE_JSON_MUTATION_MAPS) {
      for (const [key, value] of Object.entries(mutations[mapName] ?? {})) {
        const assignmentKey = `${mapName}:${key}`;
        const previous = assignments.get(assignmentKey);
        if (previous && previous.value !== value) {
          errors.push(
            `package.json ${mapName}.${key} is assigned '${previous.value}' by '${previous.extensionId}' and '${value}' by '${extension.manifest.id}'`,
          );
        }
        assignments.set(assignmentKey, { extensionId: extension.manifest.id, value });
        result[mapName][key] = value;

        if (mapName === 'dependencies' || mapName === 'devDependencies') {
          const priorDependency = dependencyOwners.get(key);
          if (priorDependency && priorDependency.mapName !== mapName) {
            errors.push(
              `package.json dependency '${key}' is assigned in both ${priorDependency.mapName} by '${priorDependency.extensionId}' and ${mapName} by '${extension.manifest.id}'`,
            );
          }
          dependencyOwners.set(key, { mapName, extensionId: extension.manifest.id });
        }

        const existing = packageJson[mapName]?.[key];
        if (existing !== undefined && existing !== value) {
          errors.push(
            `package.json ${mapName}.${key} already has '${existing}', which conflicts with '${extension.manifest.id}' value '${value}'`,
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Extension package.json mutation conflict:\n- ${errors.join('\n- ')}`);
  }
  return result;
}

export async function runExtensionValidations(extensions, outputRoot) {
  for (const extension of extensions) {
    for (const validation of extension.manifest.validations ?? []) {
      if (typeof validation === 'string') {
        await runNamedValidation(validation, outputRoot, extension.manifest.id);
        continue;
      }

      const name = validation.name ?? validation.id;
      const type = validation.type ?? validation.check;
      if (type === 'file-exists') {
        await assertOutputPath(validation.path, outputRoot, true, name, extension.manifest.id);
      } else if (type === 'file-absent') {
        await assertOutputPath(validation.path, outputRoot, false, name, extension.manifest.id);
      } else {
        throw new Error(
          `Unsupported validation check '${type}' in extension '${extension.manifest.id}' (${name}).`,
        );
      }
    }
  }
}

export async function listRelativeFiles(root) {
  const files = [];
  await collectFiles(root, root, files);
  return files.sort(compareStrings);
}

async function collectExtensionFileContributions(extension) {
  const manifest = extension.manifest;
  const files = [];
  const contributions = manifest.contributions ?? {};

  if (contributions.overlay !== undefined) {
    const overlayPath = typeof contributions.overlay === 'string'
      ? contributions.overlay
      : contributions.overlay?.path;
    const normalizedOverlayPath = normalizeContributionPath(overlayPath, `extension '${manifest.id}' overlay path`);
    const overlayRoot = requireArtifactPath(extension, normalizedOverlayPath, `extension '${manifest.id}' overlay`);
    for (const sourcePath of await listAbsoluteFiles(overlayRoot)) {
      const targetPath = normalizeContributionPath(relative(overlayRoot, sourcePath), `extension '${manifest.id}' file path`);
      assertNotPackageJson(targetPath, manifest.id);
      files.push({ extensionId: manifest.id, targetPath, sourcePath });
    }
  }

  if (contributions.files !== undefined) {
    if (!Array.isArray(contributions.files)) {
      throw new Error(`Extension '${manifest.id}' contributions.files must be a list.`);
    }
    for (const [index, contribution] of contributions.files.entries()) {
      const descriptor = typeof contribution === 'string'
        ? { path: contribution, source: contribution }
        : contribution;
      if (!isPlainObject(descriptor)) {
        throw new Error(`Extension '${manifest.id}' contributions.files[${index}] must be an object or path.`);
      }

      const targetPath = normalizeContributionPath(
        descriptor.target ?? descriptor.path,
        `extension '${manifest.id}' contributions.files[${index}].path`,
      );
      assertNotPackageJson(targetPath, manifest.id);
      if (typeof descriptor.content === 'string') {
        files.push({ extensionId: manifest.id, targetPath, content: descriptor.content });
        continue;
      }

      const sourcePath = normalizeContributionPath(
        descriptor.source ?? descriptor.path,
        `extension '${manifest.id}' contributions.files[${index}].source`,
      );
      files.push({
        extensionId: manifest.id,
        targetPath,
        sourcePath: requireArtifactPath(extension, sourcePath, `extension '${manifest.id}' file`),
      });
    }
  }

  const duplicatePaths = new Set();
  for (const file of files) {
    if (duplicatePaths.has(file.targetPath)) {
      throw new Error(`Extension '${manifest.id}' contributes duplicate file path '${file.targetPath}'.`);
    }
    duplicatePaths.add(file.targetPath);
  }
  return files.sort((left, right) => compareStrings(left.targetPath, right.targetPath));
}

function findOccupiedPathConflict(targetPath, occupied) {
  const exact = occupied.get(targetPath);
  if (exact) {
    return exact;
  }
  for (const [occupiedPath, owner] of occupied) {
    if (occupiedPath.startsWith(`${targetPath}/`)) {
      return `${owner} directory '${targetPath}'`;
    }
    if (targetPath.startsWith(`${occupiedPath}/`)) {
      return `${owner} file '${occupiedPath}'`;
    }
  }
  return undefined;
}

function requireArtifactPath(extension, relativePath, field) {
  if (!extension.artifactRoot) {
    throw new Error(`${field} requires the resolver to provide an artifactRoot.`);
  }
  const absolutePath = resolve(extension.artifactRoot, relativePath);
  const outside = relative(resolve(extension.artifactRoot), absolutePath);
  if (outside.startsWith('..') || isAbsolute(outside)) {
    throw new Error(`${field} escapes the resolved artifact root.`);
  }
  return absolutePath;
}

function assertNotPackageJson(path, extensionId) {
  if (path === 'package.json') {
    throw new Error(`Extension '${extensionId}' cannot contribute package.json as a replacement file.`);
  }
}

async function collectFiles(root, current, output) {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(current, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(root, entryPath, output);
    } else if (entry.isFile()) {
      output.push(normalizeContributionPath(relative(root, entryPath)));
    }
  }
}

async function listAbsoluteFiles(root) {
  const files = [];
  await collectAbsoluteFiles(root, files);
  return files.sort(compareStrings);
}

async function collectAbsoluteFiles(current, output) {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(current, entry.name);
    if (entry.isDirectory()) {
      await collectAbsoluteFiles(entryPath, output);
    } else if (entry.isFile()) {
      output.push(entryPath);
    }
  }
}

async function runNamedValidation(name, outputRoot, extensionId) {
  if (name.startsWith('file-exists:')) {
    await assertOutputPath(name.slice('file-exists:'.length), outputRoot, true, name, extensionId);
  } else if (name.startsWith('file-absent:')) {
    await assertOutputPath(name.slice('file-absent:'.length), outputRoot, false, name, extensionId);
  }
}

async function assertOutputPath(path, outputRoot, shouldExist, name, extensionId) {
  const normalizedPath = normalizeContributionPath(path, `validation '${name}' path`);
  const target = resolve(outputRoot, normalizedPath);
  const relativeTarget = relative(resolve(outputRoot), target);
  if (relativeTarget.startsWith('..') || isAbsolute(relativeTarget)) {
    throw new Error(`Validation '${name}' in extension '${extensionId}' escapes the output directory.`);
  }

  let exists = true;
  try {
    await access(target);
  } catch {
    exists = false;
  }
  if (exists !== shouldExist) {
    throw new Error(
      `Extension validation '${name}' from '${extensionId}' expected '${normalizedPath}' to ${shouldExist ? 'exist' : 'be absent'}.`,
    );
  }
}
