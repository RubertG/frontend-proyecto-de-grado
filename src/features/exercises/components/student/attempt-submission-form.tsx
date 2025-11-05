"use client";
import React from 'react';
import { MonacoControlledEditor, MonacoControlledEditorHandle } from '../../components/monaco-controlled-editor';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { useCreateAttemptMutation, useGenerateFeedbackMutation } from '@/features/attempts/hooks/use-attempts';
import { ApiError } from '@/shared/api/http-client';
import { useExerciseRuntimeStore } from '@/shared/stores/exercise-runtime-store';
import { toast } from 'sonner';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/tooltip';
import type { Exercise, Attempt } from '@/shared/api/schemas';

interface AttemptSubmissionFormProps {
  exercise: Exercise;
  lastAttempt?: Attempt | null;
}

export function AttemptSubmissionForm({ exercise, lastAttempt }: AttemptSubmissionFormProps) {
  const [answer, setAnswer] = React.useState('');
  const { mutateAsync: createAttempt, isPending: isSubmitting } = useCreateAttemptMutation();
  const { mutateAsync: genFeedback, isPending: isGeneratingFeedback } = useGenerateFeedbackMutation();
  const runtime = useExerciseRuntimeStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) {
      toast.error('La respuesta no puede estar vacía');
      return;
    }
    try {
  runtime.setSubmitting(true);
  runtime.resetValidation();
  const attemptRes = await createAttempt({ exercise_id: exercise.id, submitted_answer: answer, completed: false });
  const attempt = attemptRes as Attempt; // asegurar salida post-transform
  runtime.setAttempt(attempt.id);
  runtime.setAttemptSnapshot(attempt);
      // Determinar si pasó validación estructural según campos del attempt
      if (attempt.structural_validation_passed === false) {
        runtime.markValidationFailed('Validación estructural falló', attempt.structural_validation_errors || []);
      } else if (attempt.structural_validation_passed === true) {
        runtime.markValidationPassed();
      } else {
        runtime.resetValidation();
      }
      if (exercise.enable_llm_feedback) {
        runtime.setGenerating(true);
        try {
          await genFeedback({ exercise_id: exercise.id, submitted_answer: answer });
        //   toast.message('Feedback generado');
        } catch {
          toast.error('Error generando feedback');
        } finally {
          runtime.setGenerating(false);
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
  interface DetailObj { message?: unknown; errors?: unknown; structure_valid?: unknown }
  const body = err.body as { detail?: DetailObj | DetailObj[] | string } | undefined;
        if (body?.detail && typeof body.detail === 'object' && !Array.isArray(body.detail)) {
          const d = body.detail as { message?: unknown; errors?: unknown; structure_valid?: unknown };
          const errs: string[] = Array.isArray(d.errors) ? d.errors.filter(e => typeof e === 'string') as string[] : [];
          const message = typeof d.message === 'string' ? d.message : undefined;
          if (errs.length > 0 || message) {
            runtime.markValidationFailed(message, errs);
          }
        }
        toast.error('Error enviando intento');
      } else {
        toast.error('Error enviando intento');
      }
    } finally {
      runtime.setSubmitting(false);
    }
  }

  async function handleRetryFeedback() {
    if (!lastAttempt) return;
    try {
      runtime.setGenerating(true);
  await genFeedback({ exercise_id: exercise.id, submitted_answer: lastAttempt.submitted_answer || '' });
      toast.success('Feedback regenerado');
    } catch {
      toast.error('No se pudo regenerar feedback');
    } finally {
      runtime.setGenerating(false);
    }
  }

  const isBusy = isSubmitting || runtime.isSubmitting;
  const isGen = isGeneratingFeedback || runtime.isGeneratingFeedback;
  // Bloquear envío si hay un intento/conversación en curso (hasta que el usuario presione "Otro intento")
  const isLockedByConversation = !!runtime.attemptId;
  const editorLanguage = exercise.type === 'dockerfile' ? 'dockerfile' : 
                        exercise.type === 'command' ? 'shell' : 
                        exercise.type === 'compose' ? 'yaml' : 'markdown';

  const editorApiRef = React.useRef<MonacoControlledEditorHandle | null>(null);

  function handleNewAttempt() {
    // Limpia el editor para permitir escribir un nuevo intento y notifica runtime para ocultar feedback previo
    // No limpiamos para conservar el texto del usuario
    runtime.setAttempt(null); // Esto hace que desaparezca el chat asociado al último intento
    // Enfocar el editor tras un pequeño timeout para asegurar montaje estable
    setTimeout(() => editorApiRef.current?.focus(), 10);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full mx-auto max-w-full">
      <div className="flex flex-col gap-4">
  <div className="w-full max-w-6xl">
          {exercise.type === 'conceptual' ? (
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="min-h-[220px] resize-y"
            />
          ) : (
            <MonacoControlledEditor
              value={answer}
              onChange={setAnswer}
              language={editorLanguage}
              height={exercise.type === 'command' ? 260 : 340}
              ref={editorApiRef}
            />
          )}
        </div>
  <div className="flex items-center justify-start gap-2 w-full max-w-6xl">
          {isLockedByConversation ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button type="submit" disabled className="relative font-semibold shadow">
                    {isBusy && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    <Send className="h-4 w-4 mr-1" /> {isBusy ? 'Enviando...' : 'Enviar intento'}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                Termina la conversación actual o pulsa &quot;Otro intento&quot; para continuar.
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button type="submit" disabled={isBusy || isGen} className="relative font-semibold shadow">
              {isBusy && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              <Send className="h-4 w-4 mr-1" /> {isBusy ? 'Enviando...' : 'Enviar intento'}
            </Button>
          )}
          {exercise.enable_llm_feedback && lastAttempt && !lastAttempt.llm_feedback && (
            <Button type="button" variant="outline" onClick={handleRetryFeedback} disabled={isGen || isBusy} className="font-medium">
              {isGen && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              <Sparkles className="h-4 w-4 mr-1" /> {isGen ? 'Generando...' : 'Reintentar feedback'}
            </Button>
          )}
          {lastAttempt && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNewAttempt}
              disabled={isBusy || isGen}
              className="text-xs font-medium"
            >
              Otro intento
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
