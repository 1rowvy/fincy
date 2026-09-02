import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '../../lib/cn';

export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...props }: RadixTabs.TabsListProps) {
  return (
    <RadixTabs.List
      className={cn('inline-flex items-center gap-1 rounded-xl bg-surface-card-hover p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'rounded-lg px-3 py-1.5 text-sm font-medium text-ink-secondary transition-colors data-[state=active]:bg-surface-overlay data-[state=active]:text-ink-primary data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export const TabsContent = RadixTabs.Content;
