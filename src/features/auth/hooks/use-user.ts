"use client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/shared/api/http-client';
import { UserSchema, type User } from '@/shared/api/schemas';
import { queryKeys } from '@/shared/api/query-keys';
import { useSessionStore } from '@/shared/stores/session-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Hook centralizado para el usuario autenticado.
// - Obtiene el token vía cookies en http-client
// - Sincroniza automáticamente el resultado con el sessionStore
// - Proporciona funciones de utilidad para autenticación
export function useUser() {
  const { user: userInStore, setSession, clear, loggedOut, logOut } = useSessionStore();
  const queryClient = useQueryClient();

  const query = useQuery<User | null>({
    queryKey: queryKeys.userMe(),
    queryFn: async () => {
      try {
        console.log('[useUser] Starting /users/me request');
        const user = await apiFetch('/users/me', { schema: UserSchema });
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
    initialData: userInStore,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true, // Refrescar cuando se enfoca la ventana
    refetchOnReconnect: true,   // Refrescar cuando se reconecta
    retry: false,
    enabled: !loggedOut, // No hacer query si el usuario hizo logout
  });

  // Funciones de utilidad
  const isAuthenticated = !!query.data && !query.error;
  const isAdmin = query.data?.role === 'admin';
  const isLoading = query.isLoading && !loggedOut;

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
    isLoading,
    isAuthenticated,
    isAdmin,
    error: query.error,
    
    // Acciones
    refetch: query.refetch,
    logout,
    
    // Información de la query
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
  };
}
