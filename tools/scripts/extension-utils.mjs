import { posix } from 'node:path';

export const EXTENSION_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const EXTENSION_NAME_GRAMMAR = '^[a-z0-9]+(?:-[a-z0-9]+)*$';
export const DEFAULT_EXTENSION_PROVIDERS = Object.freeze([]);
export const PACKAGE_JSON_MUTATION_MAPS = ['dependencies', 'devDependencies', 'scripts'];

const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export function normalizeExtensionNames(value, field = 'extensions') {
  if (value === undefined || value === null) {
    return [];
  }

  const entries = typeof value === 'string' ? value.split(',').map((entry) => entry.trim()) : value;
  if (!Array.isArray(entries)) {
    throw new Error(`${field} must be a list of extension names.`);
  }

  const names = [];
  const seen = new Set();
  for (const entry of entries) {
    if (typeof entry !== 'string' || !EXTENSION_NAME_PATTERN.test(entry)) {
      throw new Error(
        `${field} contains invalid extension name '${String(entry)}'; names must match ${EXTENSION_NAME_GRAMMAR}.`,
      );
    }
    if (seen.has(entry)) {
      throw new Error(`${field} contains duplicate extension name '${entry}'.`);
    }
    seen.add(entry);
    names.push(entry);
  }

  return names;
}

export function validateStarterExtensionDeclarations(starter) {
  const declarations = starter.extensions;
  if (!Array.isArray(declarations)) {
    throw new Error('starter.yaml extensions must be a list.');
  }

  const seen = new Set();
  for (const [index, declaration] of declarations.entries()) {
    if (!isPlainObject(declaration)) {
      throw new Error(`starter.yaml extensions[${index}] must be an object.`);
    }

    const id = declaration.id;
    normalizeExtensionNames([id], `starter.yaml extensions[${index}].id`);
    if (seen.has(id)) {
      throw new Error(`starter.yaml declares duplicate extension id '${id}'.`);
    }
    seen.add(id);

    if (!isSemver(declaration.version)) {
      throw new Error(`starter.yaml extensions[${index}].version must be semantic version data.`);
    }

    const source = getSourceMetadata(declaration);
    if (!source.kind) {
      throw new Error(`starter.yaml extensions[${index}].source must declare a source kind.`);
    }
    if (!source.locator) {
      throw new Error(`starter.yaml extensions[${index}] must declare source locator data.`);
    }
  }

  return declarations;
}

export function normalizeContributionPath(value, field = 'contribution path') {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} must be a non-empty relative path.`);
  }
  const normalizedInput = value.replaceAll('\\', '/');
  if (normalizedInput.startsWith('/') || /^[A-Za-z]:\//.test(normalizedInput)) {
    throw new Error(`${field} must be relative: ${value}`);
  }
  const normalized = posix.normalize(normalizedInput);
  if (normalized === '.' || normalized.startsWith('../') || normalized.includes('/../') || normalized.includes('\0')) {
    throw new Error(`${field} must stay within its artifact root: ${value}`);
  }
  return normalized.replace(/^\.\//, '');
}

export function getSourceMetadata(value, fallback = undefined) {
  const sourceValue = value?.source ?? fallback?.source;
  const kind = typeof sourceValue === 'string'
    ? sourceValue
    : sourceValue?.kind ?? sourceValue?.type;
  const locator = typeof sourceValue === 'object'
    ? sourceValue.locator ?? sourceValue.package
    : value?.locator ?? value?.package ?? fallback?.locator ?? fallback?.package;
  return {
    kind: typeof kind === 'string' ? kind : '',
    locator: typeof locator === 'string' ? locator : '',
  };
}

export function extensionSortKey(manifest) {
  const source = getSourceMetadata(manifest);
  return [manifest.id, manifest.version, source.kind, source.locator].join('\u0000');
}

export function compareResolvedExtensions(left, right) {
  const leftKey = extensionSortKey(left.manifest);
  const rightKey = extensionSortKey(right.manifest);
  return compareStrings(leftKey, rightKey);
}

export function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isSemver(value) {
  return typeof value === 'string' && SEMVER_PATTERN.test(value);
}

export function satisfiesVersionRange(version, range) {
  if (!isSemver(version) || typeof range !== 'string' || !range.trim()) {
    return false;
  }
  const versionParts = parseVersion(version);
  const expressions = range.trim().split(/\s+/).filter(Boolean);
  return expressions.every((expression) => satisfiesComparator(versionParts, expression));
}

export function getPackageJsonMutations(manifest) {
  return manifest.contributions?.mutations?.packageJson
    ?? manifest.mutations?.packageJson
    ?? {};
}

export function validatePackageJsonMutationShape(mutations) {
  if (!isPlainObject(mutations)) {
    throw new Error('packageJson mutations must be an object.');
  }
  for (const key of Object.keys(mutations)) {
    if (!PACKAGE_JSON_MUTATION_MAPS.includes(key)) {
      throw new Error(`Unsupported packageJson mutation path '${key}'.`);
    }
    if (!isPlainObject(mutations[key])) {
      throw new Error(`packageJson.${key} mutations must be a map.`);
    }
    for (const [entryKey, value] of Object.entries(mutations[key])) {
      if (!entryKey || typeof value !== 'string') {
        throw new Error(`packageJson.${key}.${entryKey} must assign a string value.`);
      }
    }
  }
}

export function formatUnresolvedExtension(request) {
  const source = request.source;
  const declaration = request.declaration
    ? `version '${request.declaration.version}', source '${source.kind || 'unknown'}:${source.locator || 'unknown'}'`
    : 'no starter declaration or source locator';
  return `No extension provider resolved '${request.id}' (${declaration}).`;
}

function parseVersion(value) {
  const match = value.match(/^(\d+)\.(\d+)\.(\d+)/);
  return match.slice(1).map(Number);
}

function satisfiesComparator(version, comparator) {
  if (comparator === '*' || comparator.toLowerCase() === 'x') {
    return true;
  }
  const match = comparator.match(/^(>=|<=|>|<|=|\^|~)?(\d+\.\d+\.\d+)$/);
  if (!match || !isSemver(match[2])) {
    return false;
  }
  const operator = match[1] ?? '=';
  const target = parseVersion(match[2]);
  const comparison = compareVersions(version, target);
  if (operator === '^') {
    return comparison >= 0 && version[0] === target[0];
  }
  if (operator === '~') {
    return comparison >= 0 && version[0] === target[0] && version[1] === target[1];
  }
  if (operator === '>=') return comparison >= 0;
  if (operator === '<=') return comparison <= 0;
  if (operator === '>') return comparison > 0;
  if (operator === '<') return comparison < 0;
  return comparison === 0;
}

function compareVersions(left, right) {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
}
