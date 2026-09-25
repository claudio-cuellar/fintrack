import { describe, expect, it, beforeEach } from 'vitest';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
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
