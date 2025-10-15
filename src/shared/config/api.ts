export const API_BASE: string = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';

export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json'
};

export const withAuthHeader = (token?: string): Record<string, string> => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};
