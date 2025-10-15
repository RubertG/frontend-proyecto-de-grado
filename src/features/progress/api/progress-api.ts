import { apiFetch } from '@/shared/api/http-client';
import { ProgressCompletedListSchema, ProgressOverviewSchema } from '@/shared/api/schemas';

export const fetchProgressCompleted = () => apiFetch('/progress/completed', { schema: ProgressCompletedListSchema });

export interface FetchProgressOverviewParams {
  includeExercises?: boolean;
}

export const fetchProgressOverview = (params?: FetchProgressOverviewParams) => {
  const qs = params?.includeExercises ? '?include_exercises=true' : '';
  return apiFetch(`/progress/overview${qs}`, { schema: ProgressOverviewSchema });
};
