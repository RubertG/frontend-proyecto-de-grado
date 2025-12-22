/**
 * @fileoverview Store Zustand para gestionar la sesión del usuario autenticado.
 *
 * SINCRONIZACIÓN CON REACT QUERY:
 * - Este store se sincroniza automáticamente con useUser() hook
 * - useUser obtiene datos de /users/me y actualiza este store via setSession()
 * - El store provee acceso inmediato al usuario en cualquier componente
 *
 * ESTADOS DE SESIÓN:
 * - user=null, loggedOut=false: Estado inicial o cargando
 * - user!=null, loggedOut=false: Usuario autenticado activo
 * - user=null, loggedOut=true: Usuario cerró sesión explícitamente
 * - refreshing=true: Re-fetch de datos de usuario en progreso
 *
 * USO TÍPICO:
 * ```ts
 * const { user, logOut } = useSessionStore();
 * if (!user) return <LoginPrompt />;
 * return <Dashboard user={user} />;
 * ```
 *
 * IMPORTANTE:
 * - NO modificar user directamente, usar setSession()
 * - Llamar logOut() en lugar de clear() para logout explícito
 */
import { create } from 'zustand';
import type { User } from '@/shared/api/schemas';

interface SessionState {
  user: User | null;
  setSession: (user: User | null) => void;
  clear: () => void;
  loggedOut: boolean;
  logOut: () => void;
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  setSession: (user) => {
    console.log('[SessionStore] Setting user session:', user?.email || 'null');
    set({ user, loggedOut: false });
  },
  clear: () => {
    console.log('[SessionStore] Clearing session');
    set({ user: null, loggedOut: false, refreshing: false });
  },
  loggedOut: false,
  logOut: () => {
    console.log('[SessionStore] Logging out');
    set({ user: null, loggedOut: true, refreshing: false });
  },
  refreshing: false,
  setRefreshing: (refreshing) => {
    const currentState = get();
    console.log(
      '[SessionStore] Setting refreshing:',
      refreshing,
      'current user:',
      currentState.user?.email || 'none',
    );
    set({ refreshing });
  },
}));
