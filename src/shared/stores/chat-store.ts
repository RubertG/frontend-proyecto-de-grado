import { create } from 'zustand';

interface ChatMessage { id: string; role: 'user' | 'assistant' | 'system'; content: string; }
interface ChatState {
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clear: () => set({ messages: [] })
}));
