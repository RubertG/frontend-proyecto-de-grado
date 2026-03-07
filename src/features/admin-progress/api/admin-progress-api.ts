import { apiFetch } from '@/shared/api/http-client';
import {
  AdminProgressByGuideResponseSchema,
  type AdminProgressStatus,
  type AdminProgressByUserResponse,
  AdminProgressOverviewResponseSchema,
} from '@/shared/api/schemas';
import { z } from 'zod';

export interface AdminProgressOverviewFilters {
  limit?: number;
  offset?: number;
}

export interface AdminProgressByGuideFilters {
  limit?: number;
  offset?: number;
}

const BACKEND_PAGE_SIZE = 200;

function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    sp.set(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export const fetchAdminProgressOverview = (_filters: AdminProgressOverviewFilters = {}) => {
  void _filters;
  return fetchAdminProgressOverviewAllPages();
};

async function fetchAdminProgressOverviewAllPages() {
  const firstQs = buildQuery({ limit: BACKEND_PAGE_SIZE, offset: 0 });
  const first = await apiFetch(`/admin/progress/overview${firstQs}`, {
    schema: AdminProgressOverviewResponseSchema,
  });

  const expectedCount = first.count;
  if (expectedCount !== undefined && first.items.length >= expectedCount) {
    return first;
  }

  const items = [...first.items];
  let offset = items.length;
  while (true) {
    if (expectedCount !== undefined && offset >= expectedCount) break;
    const qs = buildQuery({ limit: BACKEND_PAGE_SIZE, offset });
    const page = await apiFetch(`/admin/progress/overview${qs}`, {
      schema: AdminProgressOverviewResponseSchema,
    });
    if (page.items.length === 0) break;
    items.push(...page.items);
    offset += page.items.length;
    if (page.items.length < BACKEND_PAGE_SIZE) break;
  }

  return {
    ...first,
    items,
    count: expectedCount ?? items.length,
    limit: items.length,
    offset: 0,
  };
}

export const fetchAdminProgressByGuide = (
  guideId: string,
  _filters: AdminProgressByGuideFilters = {},
) => {
  void _filters;
  return fetchAdminProgressByGuideAllPages(guideId);
};

async function fetchAdminProgressByGuideAllPages(guideId: string) {
  const firstQs = buildQuery({ limit: BACKEND_PAGE_SIZE, offset: 0 });
  const first = await apiFetch(`/admin/progress/by-guide/${guideId}${firstQs}`, {
    schema: AdminProgressByGuideResponseSchema,
  });

  const expectedCount = first.count;
  if (expectedCount !== undefined && first.items.length >= expectedCount) {
    return first;
  }

  const items = [...first.items];
  let offset = items.length;
  while (true) {
    if (expectedCount !== undefined && offset >= expectedCount) break;
    const qs = buildQuery({ limit: BACKEND_PAGE_SIZE, offset });
    const page = await apiFetch(`/admin/progress/by-guide/${guideId}${qs}`, {
      schema: AdminProgressByGuideResponseSchema,
    });
    if (page.items.length === 0) break;
    items.push(...page.items);
    offset += page.items.length;
    if (page.items.length < BACKEND_PAGE_SIZE) break;
  }

  return {
    ...first,
    items,
    count: expectedCount ?? items.length,
    limit: items.length,
    offset: 0,
  };
}

export const fetchAdminProgressByUser = (userId: string, includeExercises = true) => {
  const qs = buildQuery({ include_exercises: includeExercises ? 'true' : 'false' });
  return fetchAdminProgressByUserNormalized(`/admin/progress/by-user/${userId}${qs}`);
};

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toStringOr(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function deriveStatusFromGuide(guide: {
  status?: unknown;
  completed?: unknown;
  completed_exercises: number;
  total_exercises: number;
}): AdminProgressStatus {
  if (guide.status === 'not_started' || guide.status === 'in_progress' || guide.status === 'completed') {
    return guide.status;
  }
  if (guide.completed === true) return 'completed';
  if (guide.total_exercises > 0 && guide.completed_exercises >= guide.total_exercises) return 'completed';
  if (guide.completed_exercises > 0) return 'in_progress';
  return 'not_started';
}

async function fetchAdminProgressByUserNormalized(
  endpoint: string,
): Promise<AdminProgressByUserResponse> {
  const raw = await apiFetch<unknown>(endpoint, { schema: z.unknown() });
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  const userRaw =
    obj.user && typeof obj.user === 'object' ? (obj.user as Record<string, unknown>) : {};
  const totalsRaw =
    obj.totals && typeof obj.totals === 'object' ? (obj.totals as Record<string, unknown>) : {};
  const guidesRaw = Array.isArray(obj.guides) ? obj.guides : [];

  const guides = guidesRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const g = item as Record<string, unknown>;
      const guideId = toStringOr(g.guide_id ?? g.id);
      if (!guideId) return null;

      const completedExercises = toNumber(g.completed_exercises);
      const totalExercises = toNumber(g.total_exercises);
      const percentRaw = g.percent;
      const percent =
        percentRaw === null || percentRaw === undefined
          ? totalExercises > 0
            ? (completedExercises / totalExercises) * 100
            : 0
          : toNumber(percentRaw);

      const exercises = Array.isArray(g.exercises)
        ? g.exercises
            .map((ex) => {
              if (!ex || typeof ex !== 'object') return null;
              const e = ex as Record<string, unknown>;
              const exerciseId = toStringOr(e.exercise_id ?? e.id);
              if (!exerciseId) return null;
              return {
                exercise_id: exerciseId,
                title: toStringOr(e.title, 'Ejercicio'),
                completed: e.completed === true,
                attempts_count: toNumber(e.attempts_count, 0),
              };
            })
            .filter((ex): ex is NonNullable<typeof ex> => ex !== null)
        : undefined;

      return {
        guide_id: guideId,
        title: toStringOr(g.title, 'Guía'),
        order: g.order == null ? null : toNumber(g.order, 0),
        completed_exercises: completedExercises,
        total_exercises: totalExercises,
        percent,
        status: deriveStatusFromGuide({
          status: g.status,
          completed: g.completed,
          completed_exercises: completedExercises,
          total_exercises: totalExercises,
        }),
        completed: g.completed === true,
        completed_at: g.completed_at == null ? null : toStringOr(g.completed_at, null as never),
        exercises,
      };
    })
    .filter((guide): guide is NonNullable<typeof guide> => guide !== null);

  const normalized: AdminProgressByUserResponse = {
    user: {
      id: toStringOr(userRaw.id, userIdFallbackFromEndpoint(endpoint)),
      name: toStringOr(userRaw.name, 'Usuario'),
      email: toStringOr(userRaw.email, 'no-email@example.com'),
      role: toStringOr(userRaw.role, 'student'),
    },
    totals: {
      completed_guides: toNumber(totalsRaw.completed_guides),
      total_guides: toNumber(totalsRaw.total_guides, guides.length),
      completed_exercises: toNumber(totalsRaw.completed_exercises),
      total_exercises: toNumber(totalsRaw.total_exercises),
      percent_exercises: toNumber(totalsRaw.percent_exercises),
    },
    guides,
    last_activity_at:
      obj.last_activity_at == null ? null : toStringOr(obj.last_activity_at, null as never),
  };

  return normalized;
}

function userIdFallbackFromEndpoint(endpoint: string) {
  const m = endpoint.match(/\/by-user\/([^?]+)/);
  return m?.[1] ?? '00000000-0000-0000-0000-000000000000';
}
