import { apiFetch } from '@/shared/api/http-client';
import { MetricsOverviewSchema, type MetricsOverview, type MetricsOverviewItemsResponse, MetricsOverviewFlexibleSchema, type MetricsOverviewItem } from '@/shared/api/schemas';

// Endpoint esperado: GET /metrics/overview (adaptar si backend define diferente path)
export async function fetchMetricsOverview(): Promise<MetricsOverview> {
  return apiFetch('/metrics/overview', { schema: MetricsOverviewSchema });
}

export interface MetricsItemsFilters {
  userId?: string;
  exerciseId?: string;
  limit?: number;
}

export async function fetchMetricsOverviewItems(filters: MetricsItemsFilters = {}): Promise<MetricsOverviewItemsResponse> {
  const params = new URLSearchParams();
  if (filters.userId) params.set('user_id', filters.userId);
  if (filters.exerciseId) params.set('exercise_id', filters.exerciseId);
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  const raw = await apiFetch(`/metrics/overview${qs ? `?${qs}` : ''}`, { schema: MetricsOverviewFlexibleSchema });
  // Normalización flexible
  if (Array.isArray(raw)) {
    return { items: raw as MetricsOverviewItem[], count: raw.length };
  }
  if (typeof raw === 'object' && raw && 'items' in raw) {
    const r = raw as { items?: MetricsOverviewItem[]; count?: number };
    return { items: r.items || [], count: r.count };
  }
  // Si sólo vinieron métricas sin items
  return { items: [], count: 0 };
}
