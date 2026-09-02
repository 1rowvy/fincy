import { addDays, addMonths, addWeeks, addYears, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { FrequencyUnit } from '../types';

export const ISO_DATE = 'yyyy-MM-dd';

export function today(): string {
  return format(new Date(), ISO_DATE);
}

export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function toISODate(date: Date): string {
  return format(date, ISO_DATE);
}

export function fromISODate(value: string): Date {
  return parseISO(value);
}

export function formatDate(value: string): string {
  return format(parseISO(value), 'd MMMM yyyy', { locale: ru });
}

export function formatDateShort(value: string): string {
  return format(parseISO(value), 'd MMM', { locale: ru });
}

export function formatMonthLabel(monthValue: string): string {
  return format(parseISO(`${monthValue}-01`), 'LLLL yyyy', { locale: ru });
}

export function advanceDate(value: string, unit: FrequencyUnit, interval: number): string {
  const date = parseISO(value);
  switch (unit) {
    case 'day':
      return toISODate(addDays(date, interval));
    case 'week':
      return toISODate(addWeeks(date, interval));
    case 'month':
      return toISODate(addMonths(date, interval));
    case 'year':
      return toISODate(addYears(date, interval));
  }
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthsBack(count: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    result.push(format(addMonths(now, -i), 'yyyy-MM'));
  }
  return result;
}
