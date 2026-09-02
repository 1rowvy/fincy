import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-control text-sm font-medium transition-[background-color,box-shadow,opacity,filter] outline-none disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap',
  {
    variants: {
      variant: {
        // Lime CTA with dark ink — the primary action.
        primary: 'bg-accent text-accent-ink hover:brightness-[0.96] active:brightness-90',
        accent: 'bg-accent text-accent-ink hover:brightness-[0.96] active:brightness-90',
        // White chip with a hairline — secondary actions, "add" buttons.
        secondary:
          'bg-surface-card text-ink-primary border border-border-control hover:bg-surface-card-hover',
        // Near-black — rare, for high-emphasis dark surfaces.
        dark: 'bg-surface-ink text-ink-on-dark hover:opacity-90',
        ghost: 'text-ink-secondary hover:bg-surface-card-hover hover:text-ink-primary',
        subtle: 'text-ink-secondary hover:bg-surface-card-hover hover:text-ink-primary',
        danger:
          'bg-status-critical/12 text-status-critical hover:bg-status-critical/18 active:bg-status-critical/24',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-11 px-5 text-[15px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
