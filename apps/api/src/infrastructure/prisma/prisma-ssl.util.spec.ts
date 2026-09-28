import { getDatabaseSslConfig } from './prisma-ssl.util';

describe('getDatabaseSslConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.DATABASE_SSL;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns false for local postgres in development by default', () => {
    process.env.NODE_ENV = 'development';
    const config = getDatabaseSslConfig('postgresql://fintrack:fintrack_dev@localhost:5432/fintrack');
    expect(config).toBe(false);
  });

  it('returns false for empty or non-URL string in development', () => {
    process.env.NODE_ENV = 'development';
    expect(getDatabaseSslConfig('')).toBe(false);
    expect(getDatabaseSslConfig('invalid-url')).toBe(false);
  });

  it('enables SSL with rejectUnauthorized: false in production', () => {
    process.env.NODE_ENV = 'production';
    const config = getDatabaseSslConfig('postgresql://user:pass@ep-cool-db.us-east-1.aws.neon.tech:5432/neondb');
    expect(config).toEqual({ rejectUnauthorized: false });
  });

  it('respects DATABASE_SSL=false even in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_SSL = 'false';
    const config = getDatabaseSslConfig('postgresql://user:pass@host:5432/db');
    expect(config).toBe(false);
  });

  it('respects DATABASE_SSL=true even in development', () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_SSL = 'true';
    const config = getDatabaseSslConfig('postgresql://fintrack:fintrack_dev@localhost:5432/fintrack');
    expect(config).toEqual({ rejectUnauthorized: false });
  });

  it('respects ?sslmode=require in development connection strings', () => {
    process.env.NODE_ENV = 'development';
    const config = getDatabaseSslConfig('postgresql://user:pass@remotehost:5432/db?sslmode=require');
    expect(config).toEqual({ rejectUnauthorized: false });
  });

  it('respects ?sslmode=disable in production connection strings', () => {
    process.env.NODE_ENV = 'production';
    const config = getDatabaseSslConfig('postgresql://user:pass@remotehost:5432/db?sslmode=disable');
    expect(config).toBe(false);
  });

  it('respects ?ssl=false query parameter', () => {
    process.env.NODE_ENV = 'production';
    const config = getDatabaseSslConfig('postgresql://user:pass@remotehost:5432/db?ssl=false');
    expect(config).toBe(false);
  });

  it('respects ?ssl=true query parameter', () => {
    process.env.NODE_ENV = 'development';
    const config = getDatabaseSslConfig('postgresql://user:pass@remotehost:5432/db?ssl=true');
    expect(config).toEqual({ rejectUnauthorized: false });
  });
});
