import { create } from 'zustand';
import type { User } from '@/shared/api/schemas';

interface SessionState {
  user: User | null;
  setSession: (user: User | null) => void;
  clear: () => void;
  loggedOut: boolean;
  logOut: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setSession: (user) => {
    set({ user });
  },
  clear: () => {
    set({ user: null, loggedOut: false });
  },
  loggedOut: false,
  logOut: () => {
    set({ user: null, loggedOut: true });
  }
}));
