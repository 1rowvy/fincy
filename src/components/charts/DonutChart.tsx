import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getIcon } from '../../lib/icons';
import { formatMoney } from '../../lib/money';

export interface DonutDatum {
  name: string;
  color: string;
  icon: string;
  total: number;
}

function DonutTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: { payload: DonutDatum }[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-hairline bg-surface-overlay px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-ink-primary">{d.name}</div>
      <div className="text-ink-secondary">{formatMoney(d.total, currency)}</div>
    </div>
  );
}

export function DonutChart({ data, currency }: { data: DonutDatum[]; currency: string }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-ink-muted">
        Пока нет данных за этот период
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="mx-auto h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              cornerRadius={4}
              isAnimationActive={false}
              stroke="var(--surface-card)"
              strokeWidth={2}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {data.slice(0, 8).map((d) => {
          const Icon = getIcon(d.icon);
          const pct = total > 0 ? (d.total / total) * 100 : 0;
          return (
            <li key={d.name} className="flex items-center gap-2 text-sm">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${d.color}22`, color: d.color }}
              >
                <Icon size={13} />
              </span>
              <span className="min-w-0 flex-1 truncate text-ink-primary">{d.name}</span>
              <span className="shrink-0 text-ink-secondary tabular-nums">{pct.toFixed(0)}%</span>
              <span className="w-24 shrink-0 text-right font-medium tabular-nums text-ink-primary">
                {formatMoney(d.total, currency)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
