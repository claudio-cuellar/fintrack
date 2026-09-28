import { inject, Injectable, InjectionToken } from '@angular/core';
import { isMfeLocal, MfeDefinition, MfeManifest } from './mfe-manifest';

export const MFE_MANIFEST = new InjectionToken<MfeManifest>('MFE_MANIFEST', {
  providedIn: 'root',
  factory: () =>
    (window as Window & { __fintrackMfeManifest?: MfeManifest }).__fintrackMfeManifest ?? {
      version: 1,
      remotes: {},
    },
});

@Injectable({ providedIn: 'root' })
export class MfeRegistryService {
  private readonly manifest =
    inject(MFE_MANIFEST, { optional: true }) ??
    (window as Window & { __fintrackMfeManifest?: MfeManifest }).__fintrackMfeManifest;

  getManifest(): MfeManifest | undefined {
    return this.manifest;
  }

  getRemote(name: string): MfeDefinition | undefined {
    return this.manifest?.remotes[name];
  }

  isLocal(name: string): boolean {
    const remote = this.getRemote(name);
    return isMfeLocal(remote);
  }

  getRemoteUrl(name: string): string | undefined {
    return this.getRemote(name)?.url;
  }
}
