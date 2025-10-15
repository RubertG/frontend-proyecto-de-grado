import { API_BASE, DEFAULT_HEADERS, withAuthHeader } from '@/shared/config/api';
import { supabaseBrowser } from '@/shared/supabase/client';
import { z } from 'zod';

const AUTH_COOKIE = 'auth_token';

async function getServerCookieToken(): Promise<string | undefined> {
  try {
    const { cookies } = eval('require')("next/headers");
    const c = cookies();
    const store = (typeof c?.then === 'function') ? await c : c;
    return store?.get?.(AUTH_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

export async function apiFetch<T>(input: string, init: RequestInit & { schema?: z.ZodType<T>, token?: string } = {}): Promise<T> {
  const { schema, token, ...rest } = init;
  let effectiveToken: string | undefined = token;
  const isServer = typeof window === 'undefined';
  if (!effectiveToken) {
    if (isServer) {
      effectiveToken = await getServerCookieToken();
    } else {
      const { data } = await supabaseBrowser.auth.getSession();
      effectiveToken = data.session?.access_token;
    }
  }
  const res = await fetch(`${API_BASE}${input}`, {
    ...rest,
    headers: {
      ...DEFAULT_HEADERS,
      ...(rest.headers || {}),
      ...withAuthHeader(effectiveToken)
    }
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status, data);
  }
  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      // Logging detallado para diagnosticar discrepancias entre el backend y el schema Zod
      try {
        const flat = parsed.error.flatten();
        // Error list más legible
        const issues = parsed.error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code
        }));
        // Truncar datos grandes
        const preview = (() => {
          try {
            const json = JSON.stringify(data);
            return json.length > 4000 ? json.slice(0, 4000) + '…(truncated)' : json;
          } catch { return '[unserializable data]'; }
        })();
        console.error('[apiFetch] Zod parse error', {
          endpoint: input,
            issues,
            flat,
            rawPreview: preview
        });
      } catch (logErr) {
        console.error('[apiFetch] Zod parse error (logging failed)', logErr);
      }
      throw new Error('Error al parsear respuesta del servidor');
    }
    return parsed.data;
  }
  return data as T;
}
