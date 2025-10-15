import { apiFetch } from '@/shared/api/http-client';
import { GuideSchema, GuideListSchema, type Guide } from '@/shared/api/schemas';

// Endpoints según documentación:
// GET /guides/ (lista)
// GET /guides/{guide_id}
// POST /guides/
// PATCH /guides/{guide_id}
// DELETE /guides/{guide_id}

export const fetchGuides = () => apiFetch('/guides/', { schema: GuideListSchema });
export const fetchGuide = (id: string) => apiFetch(`/guides/${id}`, { schema: GuideSchema });

export interface CreateGuideInput { title: string; topic?: string; content_html?: string; order: number; is_active?: boolean }
export const createGuide = (input: CreateGuideInput) => apiFetch('/guides/', { method: 'POST', body: JSON.stringify(input), schema: GuideSchema });

export interface UpdateGuideInput { title?: string; topic?: string; content_html?: string; order?: number; is_active?: boolean }
export const updateGuide = (id: string, input: UpdateGuideInput) => apiFetch(`/guides/${id}`, { method: 'PATCH', body: JSON.stringify(input), schema: GuideSchema });

export const deleteGuide = (id: string) => apiFetch(`/guides/${id}`, { method: 'DELETE' });
