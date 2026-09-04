import { useQuery } from '@tanstack/react-query';
import * as repo from '../repositories/analytics';
import type { TxType } from '../types';

export function useMonthlyTrend(months: string[]) {
  return useQuery({ queryKey: ['analytics', 'trend', months], queryFn: () => repo.getMonthlyTrend(months) });
}

export function useMonthlyBalance(months: string[]) {
  return useQuery({
    queryKey: ['analytics', 'monthly-balance', months],
    queryFn: () => repo.getMonthlyBalance(months),
  });
}

export function useCategoryBreakdown(month: string, type: TxType) {
  return useQuery({
    queryKey: ['analytics', 'breakdown', month, type],
    queryFn: () => repo.getCategoryBreakdown(month, type),
  });
}

export function useCategoryDeltas(month: string) {
  return useQuery({
    queryKey: ['analytics', 'category-deltas', month],
    queryFn: () => repo.getCategoryDeltas(month),
  });
}

export function useDailySpending(month: string) {
  return useQuery({
    queryKey: ['analytics', 'daily-spending', month],
    queryFn: () => repo.getDailySpending(month),
  });
}

export function useMonthSummary(month: string) {
  return useQuery({ queryKey: ['analytics', 'summary', month], queryFn: () => repo.getMonthSummary(month) });
}

export function useBalanceHistory(days: number) {
  return useQuery({ queryKey: ['analytics', 'balance-history', days], queryFn: () => repo.getBalanceHistory(days) });
}

export function useForecastInputs() {
  return useQuery({ queryKey: ['analytics', 'forecast'], queryFn: () => repo.getForecastInputs() });
}
