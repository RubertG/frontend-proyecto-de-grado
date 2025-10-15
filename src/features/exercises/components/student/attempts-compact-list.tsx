"use client";
import React from 'react';
import { useAttemptsByExercise } from '@/features/attempts/hooks/use-attempts';
import { Badge } from '@/shared/ui/badge';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ReadOnlyCode } from '../../components/read-only-code';

interface AttemptsCompactListProps { exerciseId: string; limit?: number }

export function AttemptsCompactList({ exerciseId, limit = 5 }: AttemptsCompactListProps) {
  const { data, isLoading, isFetching, refetch } = useAttemptsByExercise(exerciseId);
  const [expanded, setExpanded] = React.useState(false);
  const attempts = data || [];
  const visible = expanded ? attempts : attempts.slice(0, limit);

  return (
  <div className="space-y-2 max-w-5xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Intentos ({attempts.length})</h3>
        <div className="flex items-center gap-2">
          {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          <Button type="button" variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-7 px-2 text-xs">Refrescar</Button>
        </div>
      </div>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Cargando intentos...</p>
      ) : attempts.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aún no has enviado intentos.</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((a) => {
            const absoluteIndex = (attempts.length - 1) - (attempts.indexOf(a)); // older = #1
            const displayNumber = absoluteIndex + 1;
            return (
            <li key={a.id} className="rounded-md border bg-card px-3 py-2 text-sm space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-[12px]">
                <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md bg-muted text-[10px] font-medium tracking-wide">#{displayNumber}</span>
                <Badge variant={a.completed ? 'success' : 'outline'} className="text-[10px] sm:text-[11px]">
                  {a.completed ? 'Completado' : 'Pendiente'}
                </Badge>
                {a.structural_validation_passed !== null && a.structural_validation_passed !== undefined && (
                  <Badge variant={a.structural_validation_passed ? 'secondary' : 'destructive'} className="text-[10px] sm:text-[11px]">
                    {a.structural_validation_passed ? 'Estructural OK' : 'Estructural FAIL'}
                  </Badge>
                )}
                {a.llm_feedback && <Badge variant="outline" className="text-[10px] sm:text-[11px]">Feedback</Badge>}
                <span className="text-[10px] sm:text-[11px] text-muted-foreground ml-auto">{a.id.slice(0,8)}</span>
              </div>
              {a.llm_feedback && (
                <details className="group">
                  <summary className="cursor-pointer text-[11px] sm:text-[12px] text-muted-foreground">Ver feedback</summary>
                  <div className="mt-1 border rounded-sm p-2 bg-muted/30 prose prose-[--tw-prose-body:theme(colors.muted.foreground)] prose-code:text-[11px] max-w-none">
                    <p className="whitespace-pre-wrap break-words text-[11px] leading-relaxed">{a.llm_feedback}</p>
                  </div>
                </details>
              )}
              {a.submitted_answer && (
                <details className="group">
                  <summary className="cursor-pointer text-[11px] sm:text-[12px] text-muted-foreground">Ver respuesta</summary>
                  <div className="mt-1">
                    <ReadOnlyCode value={a.submitted_answer} language="plaintext" autoHeight />
                  </div>
                </details>
              )}
            </li>
          ); })}
        </ul>
      )}
      {attempts.length > limit && (
  <Button type="button" variant="outline" size="sm" onClick={() => setExpanded(e => !e)} className="h-7 px-2 text-xs">
          {expanded ? 'Mostrar menos' : 'Ver todos'}
        </Button>
      )}
    </div>
  );
}
