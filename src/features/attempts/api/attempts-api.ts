import { apiFetch } from '@/shared/api/http-client';
import { AttemptsListSchema, AttemptSchema, FeedbackAttemptOutSchema, FeedbackHistorySchema, ChatResponseSchema } from '@/shared/api/schemas';
import { z } from 'zod';

export type AttemptsList = z.output<typeof AttemptsListSchema>;
type AttemptsListInput = z.input<typeof AttemptsListSchema>;

export async function fetchAttemptsByExercise(exerciseId: string): Promise<AttemptsList> {
  const raw = await apiFetch<AttemptsListInput>(`/attempts/by-exercise/${exerciseId}`, { schema: AttemptsListSchema });
  // raw ya validado; casteamos a output (transformations aplicadas por schema)
  return raw as AttemptsList;
}

// Admin: listado global con filtros opcionales exercise_id, user_id, limit
export async function fetchAttemptsAdminAll(params: { exerciseId?: string; userId?: string; limit?: number }): Promise<AttemptsList> {
  const sp = new URLSearchParams();
  if (params.exerciseId) sp.set('exercise_id', params.exerciseId);
  if (params.userId) sp.set('user_id', params.userId);
  if (params.limit) sp.set('limit', String(params.limit));
  const qs = sp.toString();
  const url = `/attempts/admin/all${qs?`?${qs}`:''}`;
  const raw = await apiFetch<AttemptsListInput>(url, { schema: AttemptsListSchema });
  return raw as AttemptsList;
}

export interface CreateAttemptInput { exercise_id: string; submitted_answer: string; completed?: boolean }
export async function createAttempt(input: CreateAttemptInput) {
  const payload = { completed: false, ...input };
  return apiFetch('/attempts/', { method: 'POST', body: JSON.stringify(payload), schema: AttemptSchema });
}

export interface GenerateFeedbackInput { exercise_id: string; submitted_answer: string }
export async function generateAttemptFeedback(input: GenerateFeedbackInput) {
  const { exercise_id, submitted_answer } = input;
  const payload = { exercise_id, submitted_answer };
  return apiFetch('/feedback/attempt', { method: 'POST', body: JSON.stringify(payload), schema: FeedbackAttemptOutSchema });
}

export async function fetchFeedbackHistory(exerciseId: string, attemptId?: string) {
  const url = attemptId ? `/feedback/history?exercise_id=${exerciseId}&attempt_id=${attemptId}` : `/feedback/history?exercise_id=${exerciseId}`;
  return apiFetch(url, { schema: FeedbackHistorySchema });
}

export interface ChatMessageInput { exercise_id: string; attempt_id: string; message: string }
export async function sendChatMessage(input: ChatMessageInput) {
  const payload = { exercise_id: input.exercise_id, attempt_id: input.attempt_id, message: input.message };
  return apiFetch('/feedback/chat', { method: 'POST', body: JSON.stringify(payload), schema: ChatResponseSchema });
}
