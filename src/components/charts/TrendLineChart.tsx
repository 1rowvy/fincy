import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMonthLabel } from '../../lib/dates';
import { formatMoneyCompact, formatMoney } from '../../lib/money';
import type { MonthTrendPoint } from '../../repositories/analytics';

function TrendTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-border-hairline bg-surface-overlay px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-medium text-ink-primary">{formatMonthLabel(label)}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-ink-secondary">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="flex-1">{p.name}</span>
          <span className="font-medium tabular-nums text-ink-primary">{formatMoney(p.value, currency)}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendLineChart({ data, currency }: { data: MonthTrendPoint[]; currency: string }) {
  return (
    <div className="h-72 w-full">
      <div className="mb-2 flex items-center gap-4 text-xs text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-series-1" /> Доход
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-series-8" /> Расход
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--grid-hairline)" />
          <XAxis
            dataKey="month"
            tickFormatter={(m: string) => formatMonthLabel(m).split(' ')[0]}
            tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--axis-line)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatMoneyCompact(v, currency)}
            tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<TrendTooltip currency={currency} />} />
          <Line
            type="monotone"
            dataKey="income"
            name="Доход"
            stroke="var(--series-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Расход"
            stroke="var(--series-8)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
