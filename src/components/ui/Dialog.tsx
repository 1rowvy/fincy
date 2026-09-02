import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export function DialogContent({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
      <RadixDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card border border-border-hairline bg-surface-overlay p-6 shadow-xl focus:outline-none',
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <RadixDialog.Title className="text-base font-semibold text-ink-primary">{title}</RadixDialog.Title>
          <RadixDialog.Close className="rounded-lg p-1 text-ink-muted hover:bg-surface-card-hover hover:text-ink-primary">
            <X size={16} />
          </RadixDialog.Close>
        </div>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
