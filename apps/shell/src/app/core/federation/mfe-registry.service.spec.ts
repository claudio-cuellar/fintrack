import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { isMfeLocal, MfeManifest } from './mfe-manifest';
import { MFE_MANIFEST, MfeRegistryService } from './mfe-registry.service';

describe('isMfeLocal', () => {
  it('returns true when isLocal is explicitly true', () => {
    expect(isMfeLocal({ url: 'https://cdn.example.com/remoteEntry.json', isLocal: true })).toBe(true);
  });

  it('returns false when isLocal is explicitly false', () => {
    expect(isMfeLocal({ url: 'http://localhost:4201/remoteEntry.json', isLocal: false })).toBe(false);
  });

  it('returns true for localhost and 127.0.0.1 URLs', () => {
    expect(isMfeLocal({ url: 'http://localhost:4201/remoteEntry.json' })).toBe(true);
    expect(isMfeLocal({ url: 'http://127.0.0.1:4201/remoteEntry.json' })).toBe(true);
  });

  it('returns false for remote URLs', () => {
    expect(isMfeLocal({ url: 'https://cdn.example.com/fintrack/expenses/remoteEntry.json' })).toBe(false);
  });

  it('returns false when definition is disabled or missing', () => {
    expect(isMfeLocal({ url: 'http://localhost:4201/remoteEntry.json', enabled: false })).toBe(false);
    expect(isMfeLocal(null)).toBe(false);
    expect(isMfeLocal(undefined)).toBe(false);
  });
});

describe('MfeRegistryService', () => {
  const mockManifest: MfeManifest = {
    version: 1,
    remotes: {
      expenses: {
        url: 'http://localhost:4201/remoteEntry.json',
        isLocal: true,
      },
      reports: {
        url: 'https://cdn.example.com/reports/remoteEntry.json',
      },
    },
  };

  it('detects local MFE based on provided manifest', () => {
    TestBed.configureTestingModule({
      providers: [
        MfeRegistryService,
        { provide: MFE_MANIFEST, useValue: mockManifest },
      ],
    });

    const service = TestBed.inject(MfeRegistryService);
    expect(service.isLocal('expenses')).toBe(true);
    expect(service.isLocal('reports')).toBe(false);
    expect(service.isLocal('nonexistent')).toBe(false);
    expect(service.getRemoteUrl('expenses')).toBe('http://localhost:4201/remoteEntry.json');
  });
});
