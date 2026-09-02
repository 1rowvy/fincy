import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as repo from '../repositories/goals';

export function useGoals() {
  return useQuery({ queryKey: ['goals'], queryFn: () => repo.listGoals() });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['goals'] });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: repo.createGoal, onSuccess: () => invalidate(qc) });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: repo.GoalInput }) => repo.updateGoal(id, input),
    onSuccess: () => invalidate(qc),
  });
}

export function useArchiveGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: repo.archiveGoal, onSuccess: () => invalidate(qc) });
}
