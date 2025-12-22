/**
 * @fileoverview Hook centralizado para gestión de usuario autenticado.
 *
 * ARQUITECTURA:
 * - Usa React Query para fetch/cache de datos de /users/me
 * - Sincroniza automáticamente con sessionStore para acceso global
 * - Maneja cookies de autenticación via http-client (SSR y CSR)
 * - Implementa logout con limpieza completa de estado
 *
 * FLUJO DE AUTENTICACIÓN:
 * 1. Usuario hace login -> backend retorna cookie 'auth_token'
 * 2. useUser detecta cookie y hace fetch a /users/me
 * 3. Si 200 OK: actualiza sessionStore con datos del usuario
 * 4. Si 401/403: limpia sesión y muestra pantalla de login
 * 5. Refetch automático al reenfocar ventana (staleTime: 2min)
 *
 * LOGOUT:
 * - Llama a /api/auth/logout para limpiar cookie en servidor
 * - Limpia sessionStore y query cache
 * - Redirige a /autenticacion/iniciar-sesion sin reload de página
 *
 * USO:
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, logout } = useUser();
 *   if (!isAuthenticated) return <Redirect to="/login" />;
 *   return <div>Hola {user.name}</div>;
 * }
 * ```
 */
'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/shared/api/http-client';
import { UserSchema, type User } from '@/shared/api/schemas';
import { queryKeys } from '@/shared/api/query-keys';
import { useSessionStore } from '@/shared/stores/session-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

/**
 * Hook centralizado para el usuario autenticado.
 * - Obtiene el token vía cookies en http-client
 * - Sincroniza automáticamente el resultado con el sessionStore
 * - Proporciona funciones de utilidad para autenticación
 */
export function useUser() {
  const { user: userInStore, setSession, clear, loggedOut, logOut } = useSessionStore();
  const queryClient = useQueryClient();

  const query = useQuery<User | null>({
    queryKey: queryKeys.userMe(),
    queryFn: async () => {
      try {
        console.log('[useUser] Starting /users/me request');
        // Pedimos swallowErrors para que la llamada no rompa el flujo en 401/403
        const result = await apiFetch('/users/me', { schema: UserSchema, swallowErrors: true });

        // Si apiFetch devolvió un objeto diagnóstico (swallowErrors), manejarlo
        if (
          result &&
          typeof result === 'object' &&
          (result as unknown as { __apiError?: boolean }).__apiError
        ) {
          const diag = result as unknown as { __apiError: true; status?: number; body?: unknown };
          const status = diag.status;
          console.warn('[useUser] /users/me returned api error shape, status=', status);
          if (status === 401 || status === 403) {
            console.log('[useUser] Auth failed, clearing session');
            clear();
            return null;
          }
          // Para otros status, lanzar para que los handlers superiores lo gestionen
          throw new ApiError('Request failed', status ?? 500, diag.body);
        }

        const user = result as unknown as User;
        console.log('[useUser] /users/me success:', user?.email);
        // Sincronizar automáticamente con el store
        setSession(user);
        return user;
      } catch (err) {
        console.error('[useUser] /users/me error:', err);
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          console.log('[useUser] Auth failed, clearing session');
          // Token inválido o expirado
          clear();
          return null;
        }
        throw err;
      }
    },
    // initialData: userInStore,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true, // Refrescar cuando se enfoca la ventana
    refetchOnReconnect: true, // Refrescar cuando se reconecta
    retry: false,
    enabled: !loggedOut, // No hacer query si el usuario hizo logout
  });

  const router = useRouter();

  // Función de logout unificada - SPA friendly
  const logout = async () => {
    try {
      // Llamar al endpoint para limpiar cookies
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Sesión cerrada');
    } catch (error) {
      console.warn('Logout API failed:', error);
      toast.success('Sesión cerrada (con errores)');
    }

    // Limpiar store y cache
    logOut();
    queryClient.clear();

    // Usar navegación SPA en lugar de reload forzado
    router.push('/autenticacion/iniciar-sesion');
  };

  return {
    // Datos del usuario
    user: query.data || userInStore,

    // Estados
    isLoading: query.isLoading && !loggedOut,
    isAuthenticated: !!query.data && !query.error,
    isAdmin: query.data?.role === 'admin',
    error: query.error,

    // Acciones
    refetch: query.refetch,
    logout,

    // Información de la query
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
  };
}
