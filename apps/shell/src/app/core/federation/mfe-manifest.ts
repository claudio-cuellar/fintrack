import { initFederation, loadRemoteModule } from '@angular-architects/native-federation';

export interface MfeDefinition {
  url: string;
  enabled?: boolean;
}

export interface MfeManifest {
  version: number;
  remotes: Record<string, MfeDefinition>;
}

const DEFAULT_MANIFEST = '/assets/mfe.manifest.json';
const LOCAL_MANIFEST = '/assets/mfe.manifest.local.json';

export async function loadMfeManifest(): Promise<MfeManifest> {
  const base = await fetchManifest(DEFAULT_MANIFEST);
  const local = await fetchOptionalManifest(LOCAL_MANIFEST);
  return validateManifest(mergeManifest(base, local));
}

export async function initializeFederation(): Promise<MfeManifest> {
  const manifest = await loadMfeManifest();
  const remotes = Object.fromEntries(
    Object.entries(manifest.remotes)
      .filter(([, definition]) => definition.enabled !== false)
      .map(([name, definition]) => [name, definition.url]),
  );
  await initFederation(remotes);
  return manifest;
}

export async function loadMfe<T>(manifest: MfeManifest, name: string, exposedModule: string): Promise<T> {
  const definition = manifest.remotes[name];
  if (!definition || definition.enabled === false) {
    throw new Error(`MFE "${name}" is not enabled in the runtime manifest`);
  }
  return loadRemoteModule<T>({ remoteName: name, remoteEntry: definition.url, exposedModule });
}

async function fetchManifest(url: string): Promise<MfeManifest> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Unable to load MFE manifest: ${response.status}`);
  return response.json() as Promise<MfeManifest>;
}

async function fetchOptionalManifest(url: string): Promise<Partial<MfeManifest> | null> {
  const response = await fetch(url, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Unable to load local MFE manifest: ${response.status}`);
  return response.json() as Promise<Partial<MfeManifest>>;
}

function mergeManifest(base: MfeManifest, override: Partial<MfeManifest> | null): MfeManifest {
  return {
    version: override?.version ?? base.version,
    remotes: { ...base.remotes, ...(override?.remotes ?? {}) },
  };
}

function validateManifest(manifest: MfeManifest): MfeManifest {
  if (manifest.version !== 1 || !manifest.remotes || typeof manifest.remotes !== 'object') {
    throw new Error('Invalid MFE manifest');
  }
  for (const [name, definition] of Object.entries(manifest.remotes)) {
    if (!/^[-a-z0-9]+$/.test(name) || !definition || !/^https?:\/\//.test(definition.url)) {
      throw new Error(`Invalid MFE definition for "${name}"`);
    }
  }
  return manifest;
}
