import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiError } from '@/shared/api/http-client';
import {
  fetchAdminProgressByGuide,
  fetchAdminProgressByUser,
  fetchAdminProgressOverview,
  type AdminProgressByGuideFilters,
  type AdminProgressOverviewFilters,
} from '../api/admin-progress-api';

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && [401, 403, 404, 422].includes(error.status)) {
    return false;
  }
  return failureCount < 2;
}

export function useAdminProgressOverview(filters: AdminProgressOverviewFilters) {
  return useQuery({
    queryKey: queryKeys.adminProgressOverview(filters),
    queryFn: () => fetchAdminProgressOverview(filters),
    staleTime: 30_000,
    retry: shouldRetry,
  });
}

export function useAdminProgressByGuide(guideId: string, filters: AdminProgressByGuideFilters) {
  return useQuery({
    queryKey: queryKeys.adminProgressByGuide(guideId, filters),
    queryFn: () => fetchAdminProgressByGuide(guideId, filters),
    staleTime: 30_000,
    enabled: !!guideId,
    retry: shouldRetry,
  });
}

export function useAdminProgressByUser(userId: string, includeExercises = true) {
  return useQuery({
    queryKey: queryKeys.adminProgressByUser(userId, includeExercises),
    queryFn: () => fetchAdminProgressByUser(userId, includeExercises),
    staleTime: 30_000,
    enabled: !!userId,
    retry: shouldRetry,
  });
}
