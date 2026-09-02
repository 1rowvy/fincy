import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Выбрать…',
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger className="flex h-9 w-full items-center justify-between rounded-control border border-border-control bg-surface-card px-3 text-sm text-ink-primary outline-none transition-[border-color,box-shadow] focus:border-accent-strong focus:ring-2 focus:ring-accent/35">
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown size={16} className="text-ink-muted" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="z-50 overflow-hidden rounded-2xl border border-border-hairline bg-surface-overlay shadow-flyout">
          <RadixSelect.Viewport className="p-1.5">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-ink-primary outline-none data-[highlighted]:bg-surface-card-hover"
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check size={14} className="text-accent-strong" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
