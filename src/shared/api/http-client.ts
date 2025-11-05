import { API_BASE, DEFAULT_HEADERS, withAuthHeader } from '@/shared/config/api';
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

function getClientCookieToken(): string | undefined {
  try {
    if (typeof document === 'undefined') {
      return undefined;
    }
    
    const allCookies = document.cookie;
    
    if (!allCookies) {
      return undefined;
    }
    
    // Buscar específicamente nuestra cookie
    const cookies = allCookies.split('; ');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_COOKIE}=`));
    
    if (!authCookie) {
      return undefined;
    }
    
    const cookieValue = authCookie.split('=')[1];
    
    if (cookieValue && cookieValue.length < 10) {
      console.warn('[getClientCookieToken] Token too short, likely invalid:', cookieValue);
      return undefined;
    }
    
    return cookieValue;
  } catch (error) {
    console.error('[getClientCookieToken] Error:', error);
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

export async function apiFetch<T>(input: string, init: RequestInit & { schema?: z.ZodType<T>, token?: string, swallowErrors?: boolean } = {}): Promise<T> {
  const { schema, token, swallowErrors, ...rest } = init;
  let effectiveToken: string | undefined = token;
  const isServer = typeof window === 'undefined';
  
  if (!effectiveToken) {
    if (isServer) {
      effectiveToken = await getServerCookieToken();
    } else {
      // En el cliente, usar solo las cookies (no Supabase)
      effectiveToken = getClientCookieToken();
    }
  }
  
  const headers = {
    ...DEFAULT_HEADERS,
    ...(rest.headers || {}),
    ...withAuthHeader(effectiveToken)
  };
  
  const res = await fetch(`${API_BASE}${input}`, {
    ...rest,
    headers
  });
  
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    // Loguear el fallo con detalle
    console.warn(`[apiFetch] ${input} failed: ${res?.status}`, data);
    // Si el caller pidió 'swallowErrors', no lanzar: devolver un objeto diagnóstico
    if (swallowErrors) {
      // Devolver una estructura que indica fallo. Se hace cast para mantener compatibilidad con T
      const errorShape = { __apiError: true, status: res.status, body: data } as unknown as T;
      return errorShape;
    }
    // Comportamiento por defecto: lanzar ApiError (mantener compatibilidad con código existente)
    throw new ApiError(`Request failed: ${res?.status}`, res?.status, data);
  }
  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      // Logging detallado para diagnosticar discrepancias entre el backend y el schema Zod
      try {
        const flat = parsed.error.flatten();
        // Error list más legible
        const issues = parsed.error.issues.map((i: z.ZodIssue) => ({
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
