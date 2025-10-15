"use client";
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '@/shared/api/http-client';
import { UserSchema, type User } from '@/shared/api/schemas';
import { queryKeys } from '@/shared/api/query-keys';
import { useSessionStore } from '@/shared/stores/session-store';

// Hook centralizado para el usuario autenticado.
// - Ya no dependemos de un token en el store (se obtiene vía Supabase/cookie en http-client)
// - Sincroniza el resultado con el sessionStore si cambia.
export function useUser() {
  const userInStore = useSessionStore(s => s.user);
  const setSession = useSessionStore(s => s.setSession);

  return useQuery<User | null>({
    queryKey: queryKeys.userMe(),
    // No habilitamos condicionalmente; el middleware controla acceso.
    queryFn: async () => {
      try {
        const u = await apiFetch('/users/me', { schema: UserSchema });
        // Sync si difiere
        if (!userInStore || userInStore.id !== u.id) setSession(u);
        return u;
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setSession(null);
          return null;
        }
        throw err;
      }
    },
    initialData: userInStore,
    staleTime: 60_000,
    retry: false
  });
}
