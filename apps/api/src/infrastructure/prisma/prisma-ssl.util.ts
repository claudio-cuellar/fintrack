export type DatabaseSslConfig = boolean | { rejectUnauthorized: boolean };

export function getDatabaseSslConfig(
  connectionString: string = process.env.DATABASE_URL || '',
): DatabaseSslConfig {
  if (process.env.DATABASE_SSL === 'false' || process.env.DATABASE_SSL === '0') {
    return false;
  }
  if (process.env.DATABASE_SSL === 'true' || process.env.DATABASE_SSL === '1') {
    return { rejectUnauthorized: false };
  }

  try {
    const url = new URL(connectionString);
    const ssl = url.searchParams.get('ssl');
    if (ssl === 'false' || ssl === '0') {
      return false;
    }
    if (ssl === 'true' || ssl === '1') {
      return { rejectUnauthorized: false };
    }

    const sslmode = url.searchParams.get('sslmode');
    if (sslmode === 'disable') {
      return false;
    }
    if (
      sslmode &&
      ['require', 'prefer', 'verify-ca', 'verify-full', 'no-verify'].includes(sslmode)
    ) {
      return { rejectUnauthorized: false };
    }
  } catch {
    // If connectionString is not a valid absolute URL, fall through
  }

  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }

  return false;
}
