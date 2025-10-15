"use client";
import React from 'react';
import { Attempt } from '@/shared/api/schemas';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { useFeedbackHistory, useChatMessageMutation } from '@/features/attempts/hooks/use-attempts';
import { cn } from '@/shared/lib/utils';
import { Textarea } from '@/shared/ui/textarea';

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
  const { data: history } = useFeedbackHistory(exerciseId || '', attempt?.id, !!exerciseId && !!attempt);
  const { mutateAsync: sendMessage, isPending: sending } = useChatMessageMutation(exerciseId || '', attempt?.id);
  const [message, setMessage] = React.useState('');
  const [pendingUserMsgs, setPendingUserMsgs] = React.useState<string[]>([]);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [history, isGenerating, sending]);

  if (!attempt) return null;
  const structuralFailed = attempt.structural_validation_passed === false && (attempt.structural_validation_errors?.length || 0) > 0;
  const feedback = attempt.llm_feedback?.trim() || '';
  const hasSubmitted = !!attempt.submitted_answer?.trim();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const value = message.trim();
    if (!value) return;
    try {
  setPendingUserMsgs(prev => [...prev, value]);
  await sendMessage({ message: value });
  // Al invalidar history se reemplaza el optimista; limpiar el primero
  setPendingUserMsgs(prev => prev.slice(1));
  // NO limpiamos message para que el usuario conserve lo escrito
    } catch {
      // TODO: añadir toast si se desea
      // Revertir optimista último
      setPendingUserMsgs(prev => prev.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-3 max-w-5xl" aria-live="polite" aria-busy={isGenerating || sending}>
  <div ref={listRef} className="flex flex-col gap-3 max-h-[380px] overflow-y-auto overflow-x-visible px-2 sm:px-3 pt-2 pb-3 w-full">
        {hasSubmitted && (
          <Bubble role="user">
            <div className="whitespace-pre-wrap break-words font-medium">{attempt.submitted_answer}</div>
            <div className="mt-2 text-[11px] opacity-70 font-normal">Tu intento {history?.some(h=>h.type==='attempt') ? '• histórico' : '• inicial'}</div>
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
            <article className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-3 last:[&_p]:mb-0">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
            </article>
            <div className="mt-2 text-[11px] opacity-60">Asistente • evaluación</div>
          </Bubble>
        )}
        {!isGenerating && !feedback && !structuralFailed && (
          <Bubble role="assistant">
            <p className="text-[13px] font-medium mb-1">No se generó feedback</p>
            <button
              type="button"
              onClick={onRetry}
              className="text-[12px] font-medium underline decoration-dotted hover:text-primary"
            >Reintentar generación</button>
          </Bubble>
        )}
        {history?.filter(h => h.type !== 'attempt' && h.type !== 'feedback').map((h,i) => {
          const role: 'user' | 'assistant' = h.type === 'question' ? 'user' : 'assistant';
          if (!h.content_md) return null;
          return (
            <Bubble key={i} role={role}>
              <article className={cn('prose prose-sm dark:prose-invert max-w-none', role==='user' && 'font-medium whitespace-pre-wrap break-words')}>
                <ReactMarkdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>{h.content_md}</ReactMarkdown>
              </article>
              <div className="mt-2 text-[11px] opacity-60">{role === 'user' ? 'Tú' : 'Asistente'} • chat</div>
            </Bubble>
          );
        })}
        {pendingUserMsgs.map((m,i) => (
          <Bubble key={`pending-${i}`} role="user">
            <div className="whitespace-pre-wrap break-words font-medium">{m}</div>
            <div className="mt-2 text-[11px] opacity-60">Tú • enviando…</div>
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
      {!structuralFailed && (feedback || history?.some(h => h.type === 'feedback')) && (
        <form ref={formRef} onSubmit={handleSend} className="flex items-center gap-2 pt-1 w-full">
          <div className="flex-1 w-full">
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Haz una pregunta de seguimiento..."
              className="!max-w-none resize-none text-sm min-h-[38px] max-h-40 leading-relaxed"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); formRef.current?.requestSubmit(); } }}
              disabled={sending || isGenerating}
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={sending || isGenerating || !message.trim()}
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            {sending ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      )}
    </div>
  );
}
