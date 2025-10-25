'use client';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useUser } from '@/features/auth/hooks/use-user';

// Componente para manejar la autenticación automáticamente
function AuthProvider({ children }: { children: React.ReactNode }) {
  // Usar el hook useUser para sincronizar automáticamente el estado
  const { user, isLoading, error, isAuthenticated } = useUser();
  
  // Log para debug durante desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('[AuthProvider] Auth state:', {
      user: user?.email || 'not authenticated',
      isLoading,
      isAuthenticated,
      hasError: !!error
    });
    
    // Log cookies para debug
    if (typeof window !== 'undefined') {
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      console.log('[AuthProvider] Auth cookie present:', !!authCookie);
    }
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
