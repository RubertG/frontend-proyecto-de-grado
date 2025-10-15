import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  toggleSidebar: () => void;
  toggleChat: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  isSidebarOpen: false,
  isChatOpen: false,
  toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),
  toggleChat: () => set({ isChatOpen: !get().isChatOpen })
}));
