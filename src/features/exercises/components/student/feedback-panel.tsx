"use client";
import React from 'react';
import { Attempt } from '@/shared/api/schemas';
import { Badge } from '@/shared/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { ReadOnlyCode } from '../../components/read-only-code';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

interface FeedbackPanelProps {
  lastAttempt?: Attempt | null;
  isGenerating: boolean;
  onRetryFeedback: () => void;
}

export function FeedbackPanel({ lastAttempt, isGenerating, onRetryFeedback }: FeedbackPanelProps) {
  if (!lastAttempt) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Feedback</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">Envía tu primera respuesta para obtener feedback.</CardContent>
      </Card>
    );
  }

  const hasStructural = lastAttempt.structural_validation_passed !== null && lastAttempt.structural_validation_passed !== undefined;
  const structuralFailed = hasStructural && lastAttempt.structural_validation_passed === false;
  const feedback = lastAttempt.llm_feedback?.trim() || '';

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Feedback</CardTitle>
          {isGenerating && <Badge variant="outline" className="animate-pulse">Generando…</Badge>}
        </div>
        {/* Se retiraron badges de validación/feedback global para vista estudiante (requisito) */}
      </CardHeader>
      <CardContent className="space-y-4">
        {structuralFailed && lastAttempt.structural_validation_errors?.length > 0 && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <p className="text-xs font-medium text-destructive mb-1">Errores estructurales</p>
            <ul className="list-disc ml-4 space-y-0.5 text-xs">
              {lastAttempt.structural_validation_errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
        {feedback ? (
          <div className="prose prose-xs dark:prose-invert max-w-none">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>{feedback}</ReactMarkdown>
          </div>
        ) : (
          <div className="rounded-md border bg-muted/30 p-3 text-xs flex flex-col gap-2">
            <p className="font-medium">Feedback no disponible</p>
            <p className="text-muted-foreground">Puedes reintentar generar feedback para este intento.</p>
            <button
              type="button"
              onClick={onRetryFeedback}
              disabled={isGenerating}
              className={cn('inline-flex items-center self-start rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                isGenerating ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent hover:text-accent-foreground')}
            >Reintentar feedback</button>
          </div>
        )}
        {lastAttempt.submitted_answer && (
          <details className="group border rounded-md p-2">
            <summary className="cursor-pointer text-xs font-medium flex items-center gap-2">Respuesta enviada <span className="text-muted-foreground font-normal group-open:hidden">(mostrar)</span><span className="text-muted-foreground font-normal hidden group-open:inline">(ocultar)</span></summary>
            <div className="mt-2">
              <ReadOnlyCode value={lastAttempt.submitted_answer} language="plaintext" autoHeight />
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
