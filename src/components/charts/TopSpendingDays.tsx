import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatMoney } from '../../lib/money';
import type { DailySpendingItem } from '../../repositories/analytics';

function opsLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} операция`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} операции`;
  return `${n} операций`;
}

export function TopSpendingDays({
  data,
  currency,
  limit = 5,
}: {
  data: DailySpendingItem[];
  currency: string;
  limit?: number;
}) {
  const rows = [...data].sort((a, b) => b.total - a.total).slice(0, limit);
  if (rows.length === 0) {
    return <p className="text-sm text-ink-muted">Нет расходов за этот месяц</p>;
  }
  const max = rows[0].total;

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((d) => (
        <li key={d.day} className="flex items-center gap-3 text-sm">
          <span className="w-16 shrink-0 capitalize text-ink-secondary">
            {format(parseISO(d.day), 'd MMM', { locale: ru })}
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-card-hover">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${max > 0 ? (d.total / max) * 100 : 0}%`,
                backgroundColor: 'var(--series-8)',
              }}
            />
          </span>
          <span className="w-24 shrink-0 text-right font-medium tabular-nums text-ink-primary">
            {formatMoney(d.total, currency)}
          </span>
          <span className="hidden w-24 shrink-0 text-right text-xs text-ink-muted sm:block">
            {opsLabel(d.count)}
          </span>
        </li>
      ))}
    </ul>
  );
}
