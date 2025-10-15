import { useQuery } from '@tanstack/react-query';
import { fetchMetricsOverview, fetchMetricsOverviewItems, type MetricsItemsFilters } from '../api/metrics-api';
import { queryKeys } from '@/shared/api/query-keys';

export function useMetricsOverview() {
  return useQuery({
    queryKey: [...queryKeys.llmStatus(), 'metrics','overview'], // reutilizamos base para agrupar (alternativa: añadir clave dedicada)
    queryFn: fetchMetricsOverview,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useMetricsOverviewItems(filters: MetricsItemsFilters) {
  return useQuery({
    queryKey: queryKeys.metricsOverviewItems(filters),
    queryFn: () => fetchMetricsOverviewItems(filters),
    staleTime: 30_000,
  });
}
