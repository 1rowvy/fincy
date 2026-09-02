import * as RadixProgress from '@radix-ui/react-progress';
import { cn } from '../../lib/cn';

export function ProgressBar({
  value,
  max = 100,
  className,
  colorClassName = 'bg-accent',
}: {
  value: number;
  max?: number;
  className?: string;
  colorClassName?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <RadixProgress.Root
      value={pct}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-card-hover', className)}
    >
      <RadixProgress.Indicator
        className={cn('h-full rounded-full transition-[width] duration-300', colorClassName)}
        style={{ width: `${pct}%` }}
      />
    </RadixProgress.Root>
  );
}
