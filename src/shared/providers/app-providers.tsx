'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useUser } from '@/features/auth/hooks/use-user';
import { usePathname, useRouter } from 'next/navigation';
import { Loader } from '../ui/Loader';

const ADMIN_PREFIX = '/admin';

function isAdminRoute(pathname: string) {
  return pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + '/')
}

// Componente para manejar la autenticación automáticamente
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isAdmin } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;

    const adminRoute = isAdminRoute(pathname);

    if (!isAuthenticated && adminRoute) {
      router.push('/autenticacion/iniciar-sesion');
    } else if (isAuthenticated && !isAdmin && adminRoute) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, isAdmin, pathname, router]);

  if (isLoading) {
    return (
      <div className='h-screen w-full grid place-content-center'>
        <Loader />
      </div>
    );
  }

  // Opcional: puedes bloquear el render mientras se redirige
  const adminRoute = isAdminRoute(pathname);
  if ((!isAuthenticated && adminRoute) || (isAuthenticated && !isAdmin && adminRoute)) {
    return null;
  }

  return <>{children}</>;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutos
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount, error: unknown) => {
        // No reintentar si es error de autenticación
        const errorWithStatus = error as { status?: number };
        if (errorWithStatus?.status === 401 || errorWithStatus?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Debug: exponer queryClient globalmente en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as Record<string, unknown>).__REACT_QUERY_CLIENT__ = queryClient;
}

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="light" 
        enableSystem={false}
        disableTransitionOnChange
        storageKey="app-theme"
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="bottom-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
