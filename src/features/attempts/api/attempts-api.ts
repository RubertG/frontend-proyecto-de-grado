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
