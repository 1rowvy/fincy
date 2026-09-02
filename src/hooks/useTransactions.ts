import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as repo from '../repositories/transactions';
import type { TransactionFilters } from '../types';

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['transactions'] });
  qc.invalidateQueries({ queryKey: ['accounts'] });
  qc.invalidateQueries({ queryKey: ['budgets'] });
  qc.invalidateQueries({ queryKey: ['analytics'] });
  qc.invalidateQueries({ queryKey: ['goals'] });
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => repo.listTransactions(filters),
  });
}

export function useRecurringHistory(recurringId: number | null) {
  return useQuery({
    queryKey: ['transactions', 'recurring', recurringId],
    queryFn: () => repo.listByRecurringId(recurringId as number),
    enabled: recurringId != null,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: repo.createTransaction,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: repo.CreateTransactionInput }) =>
      repo.updateTransaction(id, input),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: repo.deleteTransaction,
    onSuccess: () => invalidateAll(qc),
  });
}
