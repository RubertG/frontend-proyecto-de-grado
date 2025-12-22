/**
 * @fileoverview Cliente HTTP centralizado con autenticación automática vía cookies.
 *
 * ARQUITECTURA:
 * - Maneja automáticamente el token de autenticación desde cookies (servidor y cliente)
 * - Valida respuestas con Zod schemas para garantizar type-safety
 * - Implementa manejo robusto de errores con ApiError personalizado
 * - Soporta modo 'swallowErrors' para diagnósticos sin romper el flujo
 *
 * FLUJO DE AUTENTICACIÓN:
 * 1. Servidor (SSR/RSC): Lee cookie 'auth_token' desde next/headers
 * 2. Cliente (CSR): Lee cookie 'auth_token' desde document.cookie
 * 3. Token se inyecta automáticamente en header Authorization: Bearer
 *
 * USO TÍPICO:
 * ```ts
 * const data = await apiFetch('/users/me', { schema: UserSchema });
 * // data es type-safe y validado por Zod
 * ```
 */
import { API_BASE, DEFAULT_HEADERS, withAuthHeader } from '@/shared/config/api';
import { z } from 'zod';

/** Nombre de la cookie que almacena el token JWT */
const AUTH_COOKIE = 'auth_token';

/**
 * Obtiene el token de autenticación desde cookies en contexto de servidor (SSR/RSC).
 *
 * IMPORTANTE:
 * - Solo funciona en Server Components y API Routes de Next.js
 * - Usa eval('require') para evitar errores de bundling en cliente
 * - Maneja cookies async (Next.js 15+) y síncronas (Next.js 14-)
 *
 * @returns Token JWT o undefined si no existe o falla la lectura
 */
async function getServerCookieToken(): Promise<string | undefined> {
  try {
    const { cookies } = eval('require')('next/headers');
    const c = cookies();
    const store = typeof c?.then === 'function' ? await c : c;
    return store?.get?.(AUTH_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

/**
 * Obtiene el token de autenticación desde cookies en contexto de cliente (CSR).
 *
 * VALIDACIONES:
 * - Verifica que el token tenga longitud mínima de 10 caracteres
 * - Previene uso de tokens corruptos o placeholder vacíos
 * - Maneja parsing manual de document.cookie (formato: "key=value; key2=value2")
 *
 * @returns Token JWT o undefined si no existe, es inválido, o falla la lectura
 */
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
    const authCookie = cookies.find((cookie) => cookie.trim().startsWith(`${AUTH_COOKIE}=`));

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

/**
 * Error personalizado para fallos de API con contexto completo.
 *
 * PROPIEDADES:
 * - status: Código HTTP del error (401, 404, 500, etc.)
 * - body: Respuesta del servidor (puede contener detalles del error)
 *
 * EJEMPLO DE MANEJO:
 * ```ts
 * try {
 *   await apiFetch('/endpoint');
 * } catch (err) {
 *   if (err instanceof ApiError && err.status === 401) {
 *     // Redirigir a login
 *   }
 * }
 * ```
 */
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
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Función principal para hacer peticiones HTTP al backend con features avanzadas.
 *
 * CARACTERÍSTICAS:
 * - Inyección automática de token desde cookies (servidor/cliente)
 * - Validación type-safe con Zod schemas
 * - Modo swallowErrors para diagnosticar fallos sin lanzar excepciones
 * - Logging detallado de errores de validación Zod
 *
 * @template T - Tipo esperado de la respuesta (inferido del schema)
 * @param input - Path relativo del endpoint (ej: '/users/me')
 * @param init.schema - Zod schema para validar la respuesta
 * @param init.token - Token manual (opcional, se lee de cookies por defecto)
 * @param init.swallowErrors - Si true, devuelve objeto diagnóstico en vez de lanzar error
 * @param init - Resto de opciones de fetch (method, body, headers, etc.)
 *
 * @returns Promesa con datos validados tipo T
 * @throws {ApiError} Si la petición falla y swallowErrors=false
 *
 * @example
 * // Con validación Zod
 * const user = await apiFetch('/users/me', { schema: UserSchema });
 *
 * @example
 * // Sin romper el flujo en errores
 * const result = await apiFetch('/endpoint', { swallowErrors: true });
 * if (result.__apiError) {
 *   console.log('Falló:', result.status);
 * }
 */
export async function apiFetch<T>(
  input: string,
  init: RequestInit & { schema?: z.ZodType<T>; token?: string; swallowErrors?: boolean } = {},
): Promise<T> {
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
    ...withAuthHeader(effectiveToken),
  };

  const res = await fetch(`${API_BASE}${input}`, {
    ...rest,
    headers,
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
          code: i.code,
        }));
        // Truncar datos grandes
        const preview = (() => {
          try {
            const json = JSON.stringify(data);
            return json.length > 4000 ? json.slice(0, 4000) + '…(truncated)' : json;
          } catch {
            return '[unserializable data]';
          }
        })();
        console.error('[apiFetch] Zod parse error', {
          endpoint: input,
          issues,
          flat,
          rawPreview: preview,
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
