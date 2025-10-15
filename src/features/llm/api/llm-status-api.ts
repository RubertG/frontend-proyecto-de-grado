import { apiFetch } from '@/shared/api/http-client';
import { LlmStatusSchema, type LlmStatus } from '@/shared/api/schemas';

export async function fetchLlmStatus(): Promise<LlmStatus> {
  return apiFetch('/llm/status', { schema: LlmStatusSchema });
}
