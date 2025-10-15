import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchGuides, fetchGuide, createGuide, updateGuide, deleteGuide, type CreateGuideInput, type UpdateGuideInput } from '../api/guides-api';
import { GuideListSchema, GuideSchema, type Guide } from '@/shared/api/schemas';

export function useGuidesQuery() {
  return useQuery({ queryKey: queryKeys.guides(), queryFn: fetchGuides });
}

export function useGuideQuery(id: string) {
  return useQuery({ queryKey: queryKeys.guideDetail(id), queryFn: () => fetchGuide(id), enabled: !!id });
}

export function useCreateGuideMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGuideInput) => createGuide(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.guides() }); }
  });
}

export function useUpdateGuideMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateGuideInput) => updateGuide(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.guides() });
      qc.invalidateQueries({ queryKey: queryKeys.guideDetail(id) });
    }
  });
}

export function useDeleteGuideMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGuide(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.guides() }); }
  });
}
