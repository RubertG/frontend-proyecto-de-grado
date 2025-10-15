import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchExercisesByGuide, fetchExercise, fetchExercisesAll, createExercise, updateExercise, deleteExercise, fetchExercisesWithProgress, type CreateExerciseInput, type UpdateExerciseInput } from '../api/exercises-api';

export function useExercisesByGuideQuery(guideId: string) {
  return useQuery({ queryKey: queryKeys.exercisesByGuide(guideId), queryFn: () => fetchExercisesByGuide(guideId), enabled: !!guideId });
}

// Versión optimizada que incluye progreso (completed, attempts_count) en una sola llamada.
export function useExercisesWithProgressQuery(guideId: string, userId?: string | null) {
  // Incluimos userId en la clave para evitar cache vacío inicial sin usuario
  return useQuery({
    queryKey: [...queryKeys.exercisesWithProgress(guideId), userId ?? 'anon'],
    queryFn: () => fetchExercisesWithProgress(guideId),
    enabled: !!guideId && !!userId,
  });
}

export function useExerciseQuery(id: string) {
  return useQuery({ queryKey: queryKeys.exerciseDetail(id), queryFn: () => fetchExercise(id), enabled: !!id });
}

export function useExercisesAllQuery() {
  return useQuery({ queryKey: queryKeys.exercisesAll(), queryFn: fetchExercisesAll });
}

export function useCreateExerciseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExerciseInput) => createExercise(input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.exercisesByGuide(data.guide_id) });
      qc.invalidateQueries({ queryKey: queryKeys.exercisesAll() });
    }
  });
}

export function useUpdateExerciseMutation(id: string, guideId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateExerciseInput) => updateExercise(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exerciseDetail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.exercisesByGuide(guideId) });
      qc.invalidateQueries({ queryKey: queryKeys.exercisesAll() });
    }
  });
}

export function useDeleteExerciseMutation(guideId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exercisesByGuide(guideId) });
      qc.invalidateQueries({ queryKey: queryKeys.exercisesAll() });
    }
  });
}
