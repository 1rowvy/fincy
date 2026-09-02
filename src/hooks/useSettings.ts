import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as repo from '../repositories/settings';
import type { Settings } from '../types';

export function useSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: () => repo.getSettings() });
}

export function useSetSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: keyof Settings; value: string }) => repo.setSetting(key, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
