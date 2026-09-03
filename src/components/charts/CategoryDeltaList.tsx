import { getIcon } from '../../lib/icons';
import { formatMoney } from '../../lib/money';
import type { CategoryDeltaItem } from '../../repositories/analytics';

interface Row extends CategoryDeltaItem {
  delta: number;
}

export function CategoryDeltaList({
  data,
  currency,
  limit = 6,
}: {
  data: CategoryDeltaItem[];
  currency: string;
  limit?: number;
}) {
  const rows: Row[] = data
    .map((d) => ({ ...d, delta: d.current_total - d.previous_total }))
    .filter((d) => d.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, limit);

  if (rows.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-ink-muted">
        Расходы по категориям не изменились
      </div>
    );
  }

  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.delta)));

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => {
        const Icon = getIcon(r.icon);
        const up = r.delta > 0; // потратили больше — это плохо
        const width = (Math.abs(r.delta) / maxAbs) * 50;
        const pct = r.previous_total > 0 ? Math.round((r.delta / r.previous_total) * 100) : null;
        return (
          <li key={r.category_id ?? 'none'} className="flex items-center gap-3 text-sm">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: `${r.color}22`, color: r.color }}
            >
              <Icon size={13} />
            </span>
            <span className="min-w-0 flex-1 truncate text-ink-primary">{r.name}</span>
            {pct !== null && (
              <span className="hidden w-12 shrink-0 text-right text-xs tabular-nums text-ink-muted sm:block">
                {up ? '+' : '−'}
                {Math.abs(pct)}%
              </span>
            )}
            <div className="relative hidden h-1.5 w-28 shrink-0 sm:block">
              <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border-hairline" />
              <span
                className="absolute top-0 h-full rounded-full"
                style={{
                  backgroundColor: up ? 'var(--status-critical)' : 'var(--status-good)',
                  width: `${width}%`,
                  left: up ? '50%' : `${50 - width}%`,
                }}
              />
            </div>
            <span
              className={`w-24 shrink-0 text-right font-medium tabular-nums ${
                up ? 'text-status-critical' : 'text-status-good-text'
              }`}
            >
              {up ? '+' : '−'}
              {formatMoney(Math.abs(r.delta), currency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
