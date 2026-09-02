import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as repo from '../repositories/budgets';

export function useBudgetProgress(month: string) {
  return useQuery({ queryKey: ['budgets', month], queryFn: () => repo.listBudgetProgress(month) });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['budgets'] });
}

export function useUpsertBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, month, limitAmount }: { categoryId: number; month: string; limitAmount: number }) =>
      repo.upsertBudget(categoryId, month, limitAmount),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: repo.deleteBudget, onSuccess: () => invalidate(qc) });
}
