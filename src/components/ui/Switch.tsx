import * as RadixSwitch from '@radix-ui/react-switch';

export function Switch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="relative h-6 w-11 shrink-0 rounded-full bg-surface-card-hover border border-border-hairline outline-none transition-colors data-[state=checked]:bg-accent data-[state=checked]:border-accent disabled:opacity-50"
    >
      <RadixSwitch.Thumb className="block h-[18px] w-[18px] translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
    </RadixSwitch.Root>
  );
}
