"use client";
import React from 'react';
import { Attempt } from '@/shared/api/schemas';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { useChatMessageMutation } from '@/features/attempts/hooks/use-attempts';
import { cn } from '@/shared/lib/utils';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FeedbackChatProps {
  attempt?: Attempt | null;
  isGenerating: boolean;
  onRetry: () => void;
}

// Burbuja genérica
function Bubble({ role, children, variant = 'default' }: { role: 'user' | 'assistant' | 'system'; children: React.ReactNode; variant?: 'default' | 'error' }) {
  // max-w-* ajustado para dar más aire pero sin ocupar todo
  const base = 'relative rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ring-1 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-1 max-w-[88%]';
  const roleStyles: Record<string,string> = {
    user: 'ml-auto bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/40 ring-border border border-border/60',
    assistant: 'mr-auto bg-muted/60 dark:bg-muted/40 ring-border',
    system: 'mx-auto max-w-[75%] bg-amber-100 dark:bg-amber-200/20 text-amber-900 dark:text-amber-100 ring-amber-300/50',
  };
  const variantStyles = variant === 'error' ? 'bg-destructive/15 text-destructive ring-destructive/40' : '';
  return <div className={base + ' ' + roleStyles[role] + ' ' + variantStyles}>{children}</div>;
}

export function FeedbackChat({ attempt, isGenerating, onRetry }: FeedbackChatProps) {
  const exerciseId = attempt?.exercise_id;
  const attemptId = attempt?.id;
  
  // Solo habilitar el chat si tenemos ambos IDs
  const canChat = !!(exerciseId && attemptId);
  const { mutateAsync: sendMessage, isPending: sending } = useChatMessageMutation(
    exerciseId || '', 
    attemptId || ''
  );
  
  const [message, setMessage] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [chatMessages, isGenerating, sending]);

  if (!attempt) return null;
  const structuralFailed = attempt.structural_validation_passed === false && (attempt.structural_validation_errors?.length || 0) > 0;
  const feedback = attempt.llm_feedback?.trim() || '';
  const hasSubmitted = !!attempt.submitted_answer?.trim();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const value = message.trim();
    if (!value) return;

    // Agregar mensaje del usuario al chat local
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: value,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      // Enviar mensaje al backend y obtener respuesta
      const response = await sendMessage({ message: value });
      
      // Agregar respuesta del asistente al chat local
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: response.content_md || 'Sin respuesta',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch {
      // TODO: añadir toast si se desea
      // Agregar mensaje de error
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error al enviar el mensaje. Inténtalo de nuevo.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  }

  return (
    <div className="flex flex-col gap-3 max-w-5xl" aria-live="polite" aria-busy={isGenerating || sending}>
  <div ref={listRef} className="flex flex-col gap-3 max-h-[380px] overflow-y-auto overflow-x-visible px-2 sm:px-3 pt-2 pb-3 w-full">
        {hasSubmitted && (
          <Bubble role="user">
            <div className="whitespace-pre-wrap wrap-break-word font-medium">{attempt.submitted_answer}</div>
            <div className="mt-2 text-[11px] opacity-70 font-normal">Tu intento • inicial</div>
          </Bubble>
        )}
        {structuralFailed && (
          <Bubble role="system" variant="error">
            <p className="font-semibold mb-1 text-[13px]">Errores estructurales</p>
            <ul className="list-disc ml-4 space-y-0.5 text-[12px]">
              {attempt.structural_validation_errors!.map((e,i)=>(<li key={i}>{e}</li>))}
            </ul>
          </Bubble>
        )}
        {isGenerating && (
          <Bubble role="assistant">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Generando feedback…
            </div>
          </Bubble>
        )}
        {!isGenerating && feedback && (
          <Bubble role="assistant">
            <article className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-3 last:[&_p]:mb-0 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-4 first:[&_h1]:mt-0 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-2 [&_h4]:text-sm [&_h4]:font-medium [&_h4]:mb-1 [&_h4]:mt-2">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
            </article>
            <div className="mt-2 text-[11px] opacity-60">Asistente • evaluación</div>
          </Bubble>
        )}
        {!isGenerating && !feedback && !structuralFailed && hasSubmitted && (
          <Bubble role="assistant">
            <p className="text-[13px] font-medium mb-1">No se generó feedback</p>
            <button
              type="button"
              onClick={onRetry}
              className="text-[12px] font-medium underline decoration-dotted hover:text-primary"
            >Reintentar generación</button>
          </Bubble>
        )}
        {chatMessages.map((msg) => (
          <Bubble key={msg.id} role={msg.role}>
            <article className={cn(
              'prose prose-sm dark:prose-invert max-w-none',
              '[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-4 first:[&_h1]:mt-0',
              '[&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3',
              '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-2',
              '[&_h4]:text-sm [&_h4]:font-medium [&_h4]:mb-1 [&_h4]:mt-2',
              msg.role==='user' && 'whitespace-pre-wrap wrap-break-word'
            )}>
              <ReactMarkdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </article>
            <div className="mt-2 text-[11px] opacity-60">{msg.role === 'user' ? 'Tú' : 'Asistente'} • chat</div>
          </Bubble>
        ))}
        {sending && (
          <Bubble role="assistant">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Respondiendo…
            </div>
          </Bubble>
        )}
      </div>
      {!structuralFailed && feedback && canChat && (
        <form ref={formRef} onSubmit={handleSend} className="flex items-end gap-2 pt-1 w-full">
          <div className="flex-1 w-full">
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Haz una pregunta de seguimiento..."
              className="max-w-none! resize-none text-sm min-h-[38px] max-h-40 leading-relaxed"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); formRef.current?.requestSubmit(); } }}
              disabled={sending || isGenerating}
              rows={1}
            />
          </div>
          <Button
            type="submit"
            disabled={sending || isGenerating || !message.trim()}
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            {sending ? 'Enviando…' : 'Enviar'}
          </Button>
        </form>
      )}
    </div>
  );
}
