export const GITEA_NPM_HOST = 'git.mood481.es';
export const GITEA_NPM_OWNER = 'mood';
export const GITEA_NPM_SCOPE = '@mood481';
export const PACKAGE_NAME = '@mood481/starter-foundation-nx-pnpm';
export const ALLOWED_PRERELEASE_IDENTIFIERS = new Set(['devel', 'alpha', 'beta', 'rc']);
export const GITEA_NPM_REGISTRY = process.env.GITEA_NPM_REGISTRY
  ?? `https://${GITEA_NPM_HOST}/api/packages/${GITEA_NPM_OWNER}/npm/`;

export function assertGiteaRegistry(registry = GITEA_NPM_REGISTRY) {
  const url = new URL(registry);
  if (
    url.protocol !== 'https:'
    || url.hostname !== GITEA_NPM_HOST
    || !/^\/api\/packages\/[^/]+\/npm\/$/.test(url.pathname)
  ) {
    throw new Error(`Publish registry must be the organization's Gitea npm registry: ${registry}`);
  }
}

export function registryAuthKey(registry = GITEA_NPM_REGISTRY) {
  const url = new URL(registry);
  const pathname = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  return `//${url.host}${pathname}:_authToken`;
}
