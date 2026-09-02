import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Sparkline } from './Sparkline';
import { cn } from '../../lib/cn';

export function StatCard({
  label,
  value,
  icon: Icon,
  deltaPct,
  sparklineData,
  sparklineColor = 'var(--accent)',
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  deltaPct?: number;
  sparklineData?: Record<string, number>[];
  sparklineColor?: string;
}) {
  const isPositive = (deltaPct ?? 0) >= 0;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-secondary">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums text-ink-primary">{value}</span>
        {deltaPct !== undefined && (
          <span
            className={cn(
              'mb-0.5 flex items-center gap-0.5 text-xs font-medium',
              isPositive ? 'text-status-good-text' : 'text-status-critical',
            )}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(deltaPct).toFixed(1)}%
          </span>
        )}
      </div>
      {sparklineData && sparklineData.length > 1 && (
        <Sparkline data={sparklineData} color={sparklineColor} height={36} />
      )}
    </Card>
  );
}
