import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as repo from '../repositories/tags';

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: () => repo.listTags() });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) => repo.createTag(name, color),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: repo.deleteTag,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tags'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
