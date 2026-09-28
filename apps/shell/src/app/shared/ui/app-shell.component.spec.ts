import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { MFE_MANIFEST } from '../../core/federation/mfe-registry.service';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  it('renders local badge when MFE is running locally', async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: MFE_MANIFEST,
          useValue: {
            version: 1,
            remotes: {
              expenses: {
                url: 'http://localhost:4201/remoteEntry.json',
                isLocal: true,
              },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.mfe-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('local');
  });

  it('does not render local badge when MFE is remote', async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: MFE_MANIFEST,
          useValue: {
            version: 1,
            remotes: {
              expenses: {
                url: 'https://cdn.example.com/fintrack/expenses/remoteEntry.json',
              },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.mfe-badge');
    expect(badge).toBeNull();
  });
});
