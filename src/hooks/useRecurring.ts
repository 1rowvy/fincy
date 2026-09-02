import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as repo from '../repositories/recurring';

export function useRecurring(includeInactive = true) {
  return useQuery({ queryKey: ['recurring', includeInactive], queryFn: () => repo.listRecurring(includeInactive) });
}

export function useUpcomingRecurring(withinDays: number) {
  return useQuery({ queryKey: ['recurring', 'upcoming', withinDays], queryFn: () => repo.listUpcoming(withinDays) });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['recurring'] });
  qc.invalidateQueries({ queryKey: ['analytics'] });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: repo.createRecurring, onSuccess: () => invalidate(qc) });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: repo.RecurringInput }) => repo.updateRecurring(id, input),
    onSuccess: () => invalidate(qc),
  });
}

export function useSetRecurringActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => repo.setActive(id, isActive),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: repo.deleteRecurring, onSuccess: () => invalidate(qc) });
}
