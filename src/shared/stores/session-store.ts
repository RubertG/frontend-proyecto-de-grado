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
    console.log('[SessionStore] Setting refreshing:', refreshing, 'current user:', currentState.user?.email || 'none');
    set({ refreshing });
  }
}));
