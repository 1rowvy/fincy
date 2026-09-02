import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMonthLabel } from '../../lib/dates';
import { formatMoney, formatMoneyCompact } from '../../lib/money';
import type { MonthTrendPoint } from '../../repositories/analytics';

interface NetPoint {
  month: string;
  net: number;
}

function RoundedBar(props: { x?: number; y?: number; width?: number; height?: number; payload?: NetPoint }) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  const radius = 4;
  const isPositive = (payload?.net ?? 0) >= 0;
  const color = isPositive ? 'var(--status-good)' : 'var(--status-critical)';
  const d = isPositive
    ? `M${x},${y + height} L${x},${y + radius} Q${x},${y} ${x + radius},${y}
       L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius}
       L${x + width},${y + height} Z`
    : `M${x},${y} L${x + width},${y} L${x + width},${y + height - radius}
       Q${x + width},${y + height} ${x + width - radius},${y + height}
       L${x + radius},${y + height} Q${x},${y + height} ${x},${y + height - radius} Z`;
  return <path d={d} fill={color} />;
}

function DeviationTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { payload: NetPoint }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const net = payload[0].payload.net;
  return (
    <div className="rounded-lg border border-border-hairline bg-surface-overlay px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-medium text-ink-primary">{formatMonthLabel(label)}</div>
      <div className={net >= 0 ? 'font-medium text-status-good-text' : 'font-medium text-status-critical'}>
        {net >= 0 ? '+' : ''}
        {formatMoney(net, currency)}
      </div>
    </div>
  );
}

export function DeviationBarChart({ data, currency }: { data: MonthTrendPoint[]; currency: string }) {
  const netData: NetPoint[] = data.map((d) => ({ month: d.month, net: d.income - d.expense }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={netData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
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
          <ReferenceLine y={0} stroke="var(--axis-line)" />
          <Tooltip content={<DeviationTooltip currency={currency} />} cursor={{ fill: 'var(--surface-card-hover)' }} />
          <Bar dataKey="net" shape={RoundedBar} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
