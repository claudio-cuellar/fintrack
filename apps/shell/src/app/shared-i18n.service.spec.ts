import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from '@fintrack/shared';

describe('shared I18nService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to English and persists Spanish selection', () => {
    const service = new I18nService();
    expect(service.language()).toBe('en');
    expect(service.text('nav.dashboard')).toBe('Dashboard');
    service.setLanguage('es');
    expect(service.language()).toBe('es');
    expect(service.text('nav.dashboard')).toBe('Panel');
    expect(localStorage.getItem('fintrack.language')).toBe('es');
    expect(document.documentElement.lang).toBe('es');
  });
});
