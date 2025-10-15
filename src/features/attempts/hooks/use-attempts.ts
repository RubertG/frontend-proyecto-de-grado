import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchAttemptsByExercise, createAttempt, generateAttemptFeedback, fetchFeedbackHistory, sendChatMessage } from '../api/attempts-api';
import type { Attempt } from '@/shared/api/schemas';

export function useAttemptsByExercise(exerciseId: string, userFilter?: string) {
  return useQuery({
    // Incluimos userFilter para evitar mezclar caches de filtros distintos
    queryKey: [...queryKeys.attemptsByExercise(exerciseId), userFilter ?? ''],
    queryFn: () => fetchAttemptsByExercise(exerciseId),
    select: (data: Attempt[]) => {
      if (!userFilter) return data;
      const term = userFilter.toLowerCase();
      return data.filter(a => {
        const id = a.user?.id?.toLowerCase();
        const name = a.user?.name?.toLowerCase();
        const email = a.user?.email?.toLowerCase();
        return (
          (id && id.includes(term)) ||
          (name && name.includes(term)) ||
          (email && email.includes(term))
        );
      });
    },
    enabled: !!exerciseId,
  });
}

export function useCreateAttemptMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAttempt,
    onSuccess: (attempt) => {
      qc.invalidateQueries({ queryKey: queryKeys.attemptsByExercise(attempt.exercise_id) });
      // Invalida progreso agregado de guías (sidebar counters) y ejercicios con progreso.
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && (
        (q.queryKey[0] === 'exercises' && q.queryKey[1] === 'with-progress') ||
        (q.queryKey[0] === 'progress' && q.queryKey[1] === 'guides')
      ) });
    }
  });
}

export function useGenerateFeedbackMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ exercise_id, submitted_answer }: { exercise_id: string; submitted_answer: string }) => generateAttemptFeedback({ exercise_id, submitted_answer }),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && (q.queryKey[0] === 'attempts' || q.queryKey[0] === 'feedback') });
    }
  });
}

export function useFeedbackHistory(exerciseId: string, attemptId?: string, enabled?: boolean) {
  return useQuery({
    queryKey: queryKeys.feedbackHistory(exerciseId, attemptId),
    queryFn: () => fetchFeedbackHistory(exerciseId, attemptId),
    enabled: !!exerciseId && (enabled ?? true)
  });
}

export function useChatMessageMutation(exerciseId: string, attemptId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { message: string }) => sendChatMessage({ exercise_id: exerciseId, message: vars.message }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feedbackHistory(exerciseId, attemptId) });
    }
  });
}
