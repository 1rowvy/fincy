import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as repo from '../repositories/categories';
import type { TxType } from '../types';

export function useCategories(includeArchived = false) {
  return useQuery({ queryKey: ['categories', includeArchived], queryFn: () => repo.listCategories(includeArchived) });
}

export function useCategoriesByType(type: TxType) {
  return useQuery({ queryKey: ['categories', 'type', type], queryFn: () => repo.listCategoriesByType(type) });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['categories'] });
  qc.invalidateQueries({ queryKey: ['budgets'] });
  qc.invalidateQueries({ queryKey: ['analytics'] });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: repo.createCategory, onSuccess: () => invalidate(qc) });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: repo.CreateCategoryInput }) => repo.updateCategory(id, input),
    onSuccess: () => invalidate(qc),
  });
}

export function useArchiveCategory() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: repo.archiveCategory, onSuccess: () => invalidate(qc) });
}
