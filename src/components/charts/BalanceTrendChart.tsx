import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMonthLabel } from '../../lib/dates';
import { formatMoney, formatMoneyCompact } from '../../lib/money';
import type { MonthBalancePoint } from '../../repositories/analytics';

function BalanceTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-border-hairline bg-surface-overlay px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-medium text-ink-primary">{formatMonthLabel(label)}</div>
      <div className="tabular-nums font-medium text-ink-primary">{formatMoney(payload[0].value, currency)}</div>
    </div>
  );
}

export function BalanceTrendChart({ data, currency }: { data: MonthBalancePoint[]; currency: string }) {
  const first = data[0]?.balance ?? 0;
  const last = data[data.length - 1]?.balance ?? 0;
  const change = last - first;
  const changeLabel =
    data.length < 2
      ? null
      : `${change > 0 ? '+' : ''}${formatMoney(change, currency)} за ${data.length} мес.`;

  return (
    <div className="h-72 w-full">
      {changeLabel && (
        <div className="mb-2 text-xs">
          <span
            className={
              change > 0
                ? 'font-medium text-status-good-text'
                : change < 0
                  ? 'font-medium text-status-critical'
                  : 'font-medium text-ink-secondary'
            }
          >
            {changeLabel}
          </span>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--series-2)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--series-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Tooltip content={<BalanceTooltip currency={currency} />} />
          <Area
            type="monotone"
            dataKey="balance"
            name="Баланс"
            stroke="var(--series-2)"
            strokeWidth={2}
            fill="url(#balanceFill)"
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
