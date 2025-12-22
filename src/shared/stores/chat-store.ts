/**
 * @fileoverview Store Zustand para gestionar el chat interactivo con la IA.
 *
 * FUNCIONAMIENTO:
 * - Mantiene historial local de mensajes user/assistant
 * - Se sincroniza con el backend via sendChatMessage() mutation
 * - Cada mensaje tiene ID único, rol, y contenido en Markdown
 *
 * CICLO DE VIDA:
 * 1. Usuario escribe mensaje -> se agrega localmente como 'user'
 * 2. Se envía al backend via API
 * 3. Respuesta se agrega como 'assistant'
 * 4. UI renderiza ambos con estilos diferentes
 *
 * NOTA:
 * - Este store es LOCAL al componente de chat
 * - Para obtener historial persistente, usar fetchFeedbackHistory()
 * - Llamar clear() al cambiar de ejercicio o attempt
 *
 * @example
 * const { messages, addMessage } = useChatStore();
 * addMessage({ id: '1', role: 'user', content: 'Hola' });
 */
import { create } from 'zustand';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}
interface ChatState {
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clear: () => set({ messages: [] }),
}));
