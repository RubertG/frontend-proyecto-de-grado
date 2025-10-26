"use client";
import React from 'react';
import type { Exercise } from '@/shared/api/schemas';
import { AttemptSubmissionForm } from './attempt-submission-form';
import { FeedbackChat } from './feedback-chat';
import { AttemptsCompactList } from './attempts-compact-list';
import { TypeBadge, DifficultyBadge } from '@/components/badges/exercise-badges';
import { Badge } from '@/shared/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { SafeHtml } from '@/components/safe-html';
import { StructuralValidationPanel } from './structural-validation-panel';
// ...existing imports...
import { useAttemptsByExercise, useGenerateFeedbackMutation } from '@/features/attempts/hooks/use-attempts';
import { useExerciseRuntimeStore } from '@/shared/stores/exercise-runtime-store';
import { toast } from 'sonner';

interface ExerciseWorkAreaProps {
  exercise: Exercise;
}

export function ExerciseWorkArea({ exercise }: ExerciseWorkAreaProps) {
  const { data: attempts } = useAttemptsByExercise(exercise.id);
  const isCompleted = React.useMemo(() => {
    return (attempts?.some(a => a.completed)) ?? false;
  }, [attempts]);
  const lastAttempt = attempts?.[0];
  const runtime = useExerciseRuntimeStore();
  const { mutateAsync: genFeedback, isPending: genPending } = useGenerateFeedbackMutation();

  // Registrar exerciseId en runtime al montar
  React.useEffect(() => {
    runtime.setExercise(exercise.id);
    return () => runtime.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  async function handleRetryFeedback() {
    if (!lastAttempt) return;
    try {
      runtime.setGenerating(true);
  await genFeedback({ exercise_id: exercise.id, submitted_answer: lastAttempt.submitted_answer || '' });
      toast.success('Feedback regenerado');
    } catch {
      toast.error('No se pudo regenerar el feedback');
    } finally {
      runtime.setGenerating(false);
    }
  }

  const validation = useExerciseRuntimeStore(s => s.structuralValidation);

  const canShowFeedback = (() => {
    if (!lastAttempt) return false;
    if (exercise.type === 'conceptual') return true; // no hay validación estructural
    // Para command/dockerfile sólo si validación pasó
    if (exercise.type === 'command' || exercise.type === 'dockerfile') {
      return validation.status === 'passed';
    }
    return true;
  })();

  return (
    <div className="flex flex-col gap-10 max-w-none">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{exercise.title}</h1>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <TypeBadge type={exercise.type} />
          {exercise.difficulty && <DifficultyBadge difficulty={exercise.difficulty} />}
          {isCompleted && (
            <Badge
              variant="success"
              title="Ejercicio completado"
              className="bg-emerald-500/15 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-200 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-medium flex items-center gap-1 rounded-md shadow-none"
            >
              <CheckCircle2 className="h-3 w-3" /> Completado
            </Badge>
          )}
        </div>
      </header>
  <section>
        {exercise.content_html ? (
          <article className="prose dark:prose-invert max-w-none prose-sm md:prose-base">
            <SafeHtml html={exercise.content_html} className="rich-content" />
          </article>
        ) : (
          <p className="text-sm text-muted-foreground">Este ejercicio aún no tiene contenido.</p>
        )}
      </section>
  <section className="flex flex-col gap-8" aria-labelledby="workspace-heading">
        <h2 id="workspace-heading" className="sr-only">Área de respuesta y feedback</h2>
        <AttemptSubmissionForm exercise={exercise} lastAttempt={lastAttempt} />
        <StructuralValidationPanel type={exercise.type} />
        {canShowFeedback ? (
            <div className="flex flex-col gap-4 max-w-5xl">
              <h3 className="text-base font-medium tracking-tight">Feedback y conversación</h3>
              <div className="rounded-lg border border-border/60 bg-background/70 p-3 shadow-sm flex flex-col gap-3 min-h-[120px]">
                <FeedbackChat
                  attempt={lastAttempt}
                  isGenerating={runtime.isGeneratingFeedback || genPending}
                  onRetry={handleRetryFeedback}
                />
              </div>
            </div>
          ) : null }
      </section>
      {(attempts && attempts.length > 1) && (
        <section className="space-y-4 max-w-5xl" aria-labelledby="intentos-heading">
          <h2 id="intentos-heading" className="text-base font-medium tracking-tight">Intentos previos</h2>
          <AttemptsCompactList exerciseId={exercise.id} />
        </section>
      )}
    </div>
  );
}
