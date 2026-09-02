import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as repo from '../repositories/accounts';

const KEY = ['accounts'] as const;

function invalidateBalanceDependents(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: ['goals'] });
  qc.invalidateQueries({ queryKey: ['analytics'] });
  qc.invalidateQueries({ queryKey: ['transfers'] });
}

export function useAccounts() {
  return useQuery({ queryKey: KEY, queryFn: () => repo.listAccounts() });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: repo.createAccount,
    onSuccess: () => invalidateBalanceDependents(qc),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: repo.CreateAccountInput }) => repo.updateAccount(id, input),
    onSuccess: () => invalidateBalanceDependents(qc),
  });
}

export function useArchiveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: repo.archiveAccount,
    onSuccess: () => invalidateBalanceDependents(qc),
  });
}

export function useAdjustBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accountId, newBalance, note }: { accountId: number; newBalance: number; note: string }) =>
      repo.adjustBalance(accountId, newBalance, note),
    onSuccess: () => invalidateBalanceDependents(qc),
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: repo.createTransfer,
    onSuccess: () => invalidateBalanceDependents(qc),
  });
}

export function useTransfers() {
  return useQuery({ queryKey: ['transfers'], queryFn: () => repo.listTransfers() });
}
