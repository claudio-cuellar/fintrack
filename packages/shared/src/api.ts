export const FINTRACK_API_BASE = '/api/v1';

export function apiPath(path: string): string {
  return `${FINTRACK_API_BASE}/${path.replace(/^\//, '')}`;
}
