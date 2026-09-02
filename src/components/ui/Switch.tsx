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
      className="relative h-6 w-11 shrink-0 rounded-full bg-border-control outline-none transition-colors data-[state=checked]:bg-accent disabled:opacity-40"
    >
      <RadixSwitch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[22px]" />
    </RadixSwitch.Root>
  );
}
