import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export const TooltipProvider = RadixTooltip.Provider;

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <RadixTooltip.Root delayDuration={200}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={6}
          className="z-50 rounded-md border border-border-hairline bg-surface-acrylic px-2.5 py-1.5 text-xs text-ink-primary shadow-flyout backdrop-blur-xl"
        >
          {content}
          <RadixTooltip.Arrow className="fill-surface-overlay" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
