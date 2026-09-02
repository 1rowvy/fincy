import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/cn';

// A compact metric row — label, big value, and an optional change chip.
// Meant to be stacked inside a single Card, the way the reference groups
// income / expenses / saved together.
export function StatCard({
  label,
  value,
  deltaPct,
  hint,
  goodWhenUp = true,
}: {
  label: string;
  value: string;
  deltaPct?: number;
  hint?: string;
  goodWhenUp?: boolean;
}) {
  const up = (deltaPct ?? 0) >= 0;
  const good = up === goodWhenUp;
  return (
    <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
      <span className="text-[13px] text-ink-secondary">{label}</span>
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-2xl font-bold tabular-nums text-ink-primary">{value}</span>
        {deltaPct !== undefined && Number.isFinite(deltaPct) && (
          <span
            className={cn(
              'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
              good ? 'bg-accent-soft text-accent-strong' : 'bg-status-critical/12 text-status-critical',
            )}
          >
            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(deltaPct).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-xs text-ink-muted">{hint}</span>}
      </div>
    </div>
  );
}
