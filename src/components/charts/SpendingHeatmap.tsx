import { Tooltip } from '../ui/Tooltip';
import { formatDate, today } from '../../lib/dates';
import { formatMoney } from '../../lib/money';
import type { DailySpendingItem } from '../../repositories/analytics';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Порог интенсивности → доля непрозрачности заливки. */
const LEVELS = [0.16, 0.36, 0.58, 0.82, 1];

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${forms[0]}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${forms[1]}`;
  return `${n} ${forms[2]}`;
}

const pluralOps = (n: number) => plural(n, ['операция', 'операции', 'операций']);
const pluralDays = (n: number) => plural(n, ['день', 'дня', 'дней']);

interface Cell {
  iso: string;
  dayNum: number;
  total: number;
  count: number;
}

function buildCells(month: string, byDay: Map<string, DailySpendingItem>): (Cell | null)[] {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  // Смещение до понедельника (getDay(): 0 — воскресенье).
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;

  const cells: (Cell | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${month}-${String(d).padStart(2, '0')}`;
    const hit = byDay.get(iso);
    cells.push({ iso, dayNum: d, total: hit?.total ?? 0, count: hit?.count ?? 0 });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function SpendingHeatmap({
  data,
  month,
  currency,
}: {
  data: DailySpendingItem[];
  month: string;
  currency: string;
}) {
  const byDay = new Map(data.map((d) => [d.day, d]));
  const cells = buildCells(month, byDay);
  const max = data.reduce((acc, d) => Math.max(acc, d.total), 0);
  const monthTotal = data.reduce((acc, d) => acc + d.total, 0);
  const activeDays = data.filter((d) => d.total > 0).length;
  const todayIso = today();

  function levelOpacity(total: number): number {
    if (total <= 0 || max <= 0) return 0;
    const ratio = total / max;
    const idx = LEVELS.findIndex((t) => ratio <= t);
    return LEVELS[idx === -1 ? LEVELS.length - 1 : idx];
  }

  if (monthTotal === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-ink-muted">
        Пока нет расходов за этот месяц
      </div>
    );
  }

  return (
    <div className="flex max-w-[19rem] flex-col gap-2.5">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="pb-0.5 text-center text-[10px] font-medium text-ink-muted">
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} className="aspect-square" />;
          const opacity = levelOpacity(cell.total);
          const isToday = cell.iso === todayIso;
          return (
            <Tooltip
              key={cell.iso}
              content={
                <div className="text-xs">
                  <div className="font-medium capitalize text-ink-primary">{formatDate(cell.iso)}</div>
                  {cell.total > 0 ? (
                    <div className="mt-0.5 text-ink-secondary">
                      <span className="font-medium tabular-nums text-ink-primary">
                        {formatMoney(cell.total, currency)}
                      </span>
                      {' · '}
                      {pluralOps(cell.count)}
                    </div>
                  ) : (
                    <div className="mt-0.5 text-ink-secondary">Без расходов</div>
                  )}
                </div>
              }
            >
              <button
                type="button"
                className={`relative flex aspect-square items-start justify-start rounded border p-0.5 text-[9px] leading-none tabular-nums transition-colors ${
                  isToday ? 'border-accent-strong' : 'border-border-hairline'
                } ${opacity > 0 ? 'text-ink-primary' : 'text-ink-muted'}`}
                style={{
                  backgroundColor:
                    opacity > 0
                      ? `color-mix(in srgb, var(--series-8) ${Math.round(opacity * 100)}%, transparent)`
                      : 'var(--surface-card-hover)',
                }}
              >
                {cell.dayNum}
              </button>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] text-ink-muted">
        <span>
          {formatMoney(monthTotal, currency)} · расходы в {pluralDays(activeDays)}
        </span>
        <span className="flex items-center gap-1">
          меньше
          <span className="flex gap-0.5">
            <span
              className="h-2.5 w-2.5 rounded-sm border border-border-hairline"
              style={{ backgroundColor: 'var(--surface-card-hover)' }}
            />
            {LEVELS.map((lvl) => (
              <span
                key={lvl}
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  backgroundColor: `color-mix(in srgb, var(--series-8) ${Math.round(lvl * 100)}%, transparent)`,
                }}
              />
            ))}
          </span>
          больше
        </span>
      </div>
    </div>
  );
}
