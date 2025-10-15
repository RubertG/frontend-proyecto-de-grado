import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchLlmStatus } from '../api/llm-status-api';

export function useLlmStatus() {
  return useQuery({
    queryKey: queryKeys.llmStatus(),
    queryFn: fetchLlmStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
