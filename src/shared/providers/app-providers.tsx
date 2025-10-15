"use client";
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useSessionStore } from '@/shared/stores/session-store';
import { ApiError } from '@/shared/api/http-client';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/shared/api/http-client';
import { UserSchema } from '@/shared/api/schemas';
import { Toaster } from '@/shared/ui/sonner';

/**
 * AppProviders
 * Componentes cliente que inicializan estado global (React Query, sesión).
 * Mantiene al layout como Server Component para aprovechar SSR.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const setSession = useSessionStore((s) => s.setSession);
  const currentUser = useSessionStore(s => s.user);
  const loggedOut = useSessionStore(s => s.loggedOut);
  const router = useRouter();

  useEffect(() => {
    if (loggedOut) return; // evitar refetch tras logout explícito
    // Si ya tenemos usuario cargado no hacemos otra llamada
    if (currentUser) return;
    let cancelled = false;

    // El middleware ya garantiza acceso; aquí sólo intentamos obtener /users/me si no está en store
  // http-client resolverá token desde Supabase / cookie automáticamente

    (async () => {
      try {
  const user = await apiFetch('/users/me', { schema: UserSchema });
  if (!cancelled) setSession(user);
      } catch (err) {
        if (!cancelled) {
          setSession(null);
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            try { router.push('/autenticacion/iniciar-sesion'); } catch {}
          }
        }
      }
    })();
    return () => { cancelled = true; };
  }, [setSession, loggedOut, currentUser, router]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
