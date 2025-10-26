import { apiFetch } from '@/shared/api/http-client';
import { ExerciseSchema, ExercisesByGuideSchema, ExercisesAllSchema, ExercisesWithProgressListSchema } from '@/shared/api/schemas';

// Endpoints:
// GET /exercises/by-guide/{guide_id}
// GET /exercises/{exercise_id}
// POST /exercises/
// PATCH /exercises/{exercise_id}
// DELETE /exercises/{exercise_id}

export const fetchExercisesByGuide = (guideId: string) => apiFetch(`/exercises/by-guide/${guideId}`, { schema: ExercisesByGuideSchema });
export const fetchExercise = (id: string) => apiFetch(`/exercises/${id}`, { schema: ExerciseSchema });
// Lista todos los ejercicios (token se resuelve automáticamente en apiFetch)
export const fetchExercisesAll = () => apiFetch('/exercises/all', { schema: ExercisesAllSchema });
// Nueva ruta optimizada que incluye progreso del usuario autenticado
export const fetchExercisesWithProgress = (guideId: string) => apiFetch(`/guides/${guideId}/exercises-with-progress`, { schema: ExercisesWithProgressListSchema });

export interface CreateExerciseInput {
  guide_id: string;
  title: string;
  content_html?: string;
  expected_answer: string;
  ai_context?: string | null;
  type: 'command' | 'dockerfile' | 'conceptual' | 'compose';
  difficulty?: string | null;
  enable_structural_validation: boolean;
  enable_llm_feedback: boolean;
}

export const createExercise = (input: CreateExerciseInput) => apiFetch('/exercises/', { method: 'POST', body: JSON.stringify(input), schema: ExerciseSchema });

export interface UpdateExerciseInput {
  title?: string;
  content_html?: string;
  expected_answer?: string;
  ai_context?: string | null;
  type?: 'command' | 'dockerfile' | 'conceptual' | 'compose';
  difficulty?: string | null;
  enable_structural_validation?: boolean;
  enable_llm_feedback?: boolean;
  is_active?: boolean;
}

export const updateExercise = (id: string, input: UpdateExerciseInput) => apiFetch(`/exercises/${id}`, { method: 'PATCH', body: JSON.stringify(input), schema: ExerciseSchema });
export const deleteExercise = (id: string) => apiFetch(`/exercises/${id}`, { method: 'DELETE' });
