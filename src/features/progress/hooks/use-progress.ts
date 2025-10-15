import { useQuery } from '@tanstack/react-query';
import { fetchProgressCompleted, fetchProgressOverview, type FetchProgressOverviewParams } from '../api/progress-api';

export function useProgressCompleted() {
  return useQuery({
    queryKey: ['progress','completed'],
    queryFn: fetchProgressCompleted
  });
}

export function useProgressOverview(params?: FetchProgressOverviewParams) {
  return useQuery({
    queryKey: ['progress','overview', params?.includeExercises ? 'with-exercises' : 'basic'],
    queryFn: () => fetchProgressOverview(params)
  });
}
