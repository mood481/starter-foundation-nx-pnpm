import {
  DEFAULT_EXTENSION_PROVIDERS,
  EXTENSION_NAME_GRAMMAR,
  EXTENSION_NAME_PATTERN,
  compareResolvedExtensions,
  formatUnresolvedExtension,
  getPackageJsonMutations,
  getSourceMetadata,
  isPlainObject,
  isSemver,
  normalizeExtensionNames,
  satisfiesVersionRange,
  validatePackageJsonMutationShape,
} from './extension-utils.mjs';

export function createExtensionResolver({ providers = DEFAULT_EXTENSION_PROVIDERS } = {}) {
  if (!Array.isArray(providers)) {
    throw new Error('Extension providers must be a list.');
  }

  return {
    async resolve(request) {
      for (const provider of providers) {
        const canResolve = typeof provider?.canResolve === 'function'
          ? await provider.canResolve(request)
          : true;
        if (!canResolve || typeof provider?.resolve !== 'function') {
          continue;
        }

        const result = await provider.resolve(request);
        if (result !== undefined && result !== null) {
          return result;
        }
      }
      return undefined;
    },
  };
}

export async function resolveExtensions({
  names,
  starter,
  variant,
  resolver,
  providers = DEFAULT_EXTENSION_PROVIDERS,
  repoRoot,
}) {
  const selections = normalizeExtensionNames(names);
  if (selections.length === 0) {
    return [];
  }

  const declarations = new Map((starter.extensions ?? []).map((declaration) => [declaration.id, declaration]));
  const activeResolver = resolver ?? createExtensionResolver({ providers });
  const resolved = [];

  for (const name of selections) {
    const declaration = declarations.get(name);
    const request = {
      id: name,
      name,
      declaration,
      starter,
      variant: variant ?? null,
      source: declaration ? getSourceMetadata(declaration) : undefined,
      repoRoot,
    };
    const result = typeof activeResolver === 'function'
      ? await activeResolver(request)
      : await activeResolver.resolve(request);

    if (result === undefined || result === null) {
      throw new Error(formatUnresolvedExtension(request));
    }

    const normalized = normalizeResolvedExtension(result, request);
    validateExtensionManifest(normalized.manifest, {
      selectedId: name,
      declaration,
      starter,
      variant,
    });
    resolved.push(normalized);
  }

  const ids = new Map();
  for (const extension of resolved) {
    const id = extension.manifest.id;
    if (ids.has(id)) {
      throw new Error(
        `Duplicate resolved extension id '${id}' was selected by '${ids.get(id).selectedId}' and '${extension.selectedId}'.`,
      );
    }
    ids.set(id, extension);
  }

  return resolved.sort(compareResolvedExtensions);
}

export function validateExtensionManifest(manifest, {
  selectedId,
  declaration,
  starter,
  variant,
}) {
  const errors = [];
  if (!isPlainObject(manifest)) {
    throw new Error(`Invalid extension manifest for '${selectedId}': manifest must be an object.`);
  }

  if (typeof manifest.id !== 'string' || !EXTENSION_NAME_PATTERN.test(manifest.id)) {
    errors.push(`id must match ${EXTENSION_NAME_GRAMMAR}`);
  } else if (manifest.id !== selectedId) {
    errors.push(`id '${manifest.id}' does not match selected extension '${selectedId}'`);
  }

  if (!isSemver(manifest.version)) {
    errors.push('version must be a semantic version');
  }

  const source = getSourceMetadata(manifest, declaration);
  if (!source.kind) {
    errors.push('source.kind is required');
  }
  if (!source.locator) {
    errors.push('source.locator is required');
  }

  const compatibility = manifest.compatibility;
  if (!isPlainObject(compatibility) || typeof compatibility.starter !== 'string') {
    errors.push('compatibility.starter is required');
  } else if (starter.version && !satisfiesVersionRange(starter.version, compatibility.starter)) {
    errors.push(`compatibility.starter '${compatibility.starter}' excludes starter ${starter.version}`);
  }

  const capabilities = compatibility?.requires?.capabilities;
  if (capabilities !== undefined && !Array.isArray(capabilities)) {
    errors.push('compatibility.requires.capabilities must be a list');
  } else {
    for (const capability of capabilities ?? []) {
      if (typeof capability !== 'string' || !starter.provides?.includes(capability)) {
        errors.push(`compatibility.requires.capabilities is missing starter capability '${capability}'`);
      }
    }
  }

  validateVariantCompatibility(compatibility?.variants, variant, errors);

  if (manifest.group !== undefined && (typeof manifest.group !== 'string' || !manifest.group.trim())) {
    errors.push('group must be a non-empty string');
  }

  if (manifest.contributions !== undefined && !isPlainObject(manifest.contributions)) {
    errors.push('contributions must be an object');
  }

  try {
    validatePackageJsonMutationShape(getPackageJsonMutations(manifest));
  } catch (error) {
    errors.push(error.message);
  }

  validateManifestValidations(manifest.validations, errors);

  if (errors.length > 0) {
    throw new Error(`Invalid extension manifest '${selectedId}':\n- ${errors.join('\n- ')}`);
  }

  manifest.source = source;
  return manifest;
}

export function validateExtensionGroups(groups, extensions) {
  if (!isPlainObject(groups)) {
    throw new Error('starter.yaml extensionGroups must be a map.');
  }
  const counts = new Map();
  for (const extension of extensions) {
    if (extension.manifest.group !== undefined && Object.hasOwn(groups, extension.manifest.group)) {
      const group = extension.manifest.group;
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  }
  for (const [group, rule] of Object.entries(groups)) {
    if (!isPlainObject(rule)) {
      throw new Error(`starter.yaml extensionGroups.${group} must be an object.`);
    }
    const min = rule.min ?? rule.minimum ?? 0;
    const max = rule.max ?? rule.maximum ?? Number.POSITIVE_INFINITY;
    if (!Number.isInteger(min) || min < 0 || (max !== Number.POSITIVE_INFINITY && (!Number.isInteger(max) || max < min))) {
      throw new Error(`starter.yaml extensionGroups.${group} must declare valid min/max cardinality.`);
    }
    const count = counts.get(group) ?? 0;
    if (count < min || count > max) {
      throw new Error(`Extension group '${group}' requires ${min}-${max === Number.POSITIVE_INFINITY ? 'many' : max} selected extensions; found ${count}.`);
    }
  }
}

function normalizeResolvedExtension(result, request) {
  const manifest = isPlainObject(result.manifest) ? result.manifest : result;
  return {
    manifest,
    artifactRoot: result.artifactRoot ?? manifest.artifactRoot,
    declaration: request.declaration,
    selectedId: request.id,
  };
}

function validateVariantCompatibility(variants, variant, errors) {
  if (variants !== undefined && !isPlainObject(variants)) {
    errors.push('compatibility.variants must be an object');
    return;
  }
  if (!variants) {
    return;
  }

  for (const key of ['allow', 'deny']) {
    if (variants[key] !== undefined && !Array.isArray(variants[key])) {
      errors.push(`compatibility.variants.${key} must be a list`);
    } else if (Array.isArray(variants[key]) && variants[key].some((entry) => typeof entry !== 'string')) {
      errors.push(`compatibility.variants.${key} must contain variant ids`);
    }
  }
  if (Array.isArray(variants.allow) && variants.allow.length > 0 && !variants.allow.includes(variant ?? null)) {
    errors.push(`compatibility.variants.allow excludes selected variant '${variant ?? 'none'}'`);
  }
  if (Array.isArray(variants.deny) && variants.deny.includes(variant ?? null)) {
    errors.push(`compatibility.variants.deny excludes selected variant '${variant ?? 'none'}'`);
  }
}

function validateManifestValidations(validations, errors) {
  if (validations !== undefined && !Array.isArray(validations)) {
    errors.push('validations must be a list');
    return;
  }
  for (const [index, validation] of (validations ?? []).entries()) {
    if (typeof validation === 'string' && validation.trim()) {
      continue;
    }
    if (!isPlainObject(validation) || typeof (validation.name ?? validation.id) !== 'string') {
      errors.push(`validations[${index}] must declare a named validation`);
    }
  }
}
