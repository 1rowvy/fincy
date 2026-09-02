import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '../../lib/cn';

export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...props }: RadixTabs.TabsListProps) {
  return (
    <RadixTabs.List
      className={cn(
        'inline-flex items-center gap-0.5 rounded-control bg-surface-card-hover p-1',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'rounded-[7px] px-3 py-1 text-sm font-medium text-ink-secondary outline-none transition-colors hover:text-ink-primary data-[state=active]:bg-surface-card data-[state=active]:text-ink-primary data-[state=active]:shadow-[0_1px_3px_rgba(24,24,22,0.1)]',
        className,
      )}
      {...props}
    />
  );
}

export const TabsContent = RadixTabs.Content;
