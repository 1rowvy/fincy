import {
  BarChart3,
  LayoutDashboard,
  PiggyBank,
  Repeat,
  Settings,
  Target,
  Wallet,
  WalletCards,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

const NAV_ITEMS = [
  { to: '/', label: 'Обзор', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Транзакции', icon: WalletCards, end: false },
  { to: '/accounts', label: 'Счета', icon: Wallet, end: false },
  { to: '/budgets', label: 'Бюджеты', icon: PiggyBank, end: false },
  { to: '/goals', label: 'Цели', icon: Target, end: false },
  { to: '/recurring', label: 'Регулярные платежи', icon: Repeat, end: false },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3, end: false },
  { to: '/settings', label: 'Настройки', icon: Settings, end: false },
];

const itemClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-9 items-center gap-3 rounded-control px-3 text-sm transition-colors',
    isActive
      ? 'bg-surface-card-hover font-semibold text-ink-primary shadow-[inset_3px_0_0_var(--accent)]'
      : 'font-medium text-ink-secondary hover:bg-surface-card-hover/70 hover:text-ink-primary',
  );

function NavRow({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end: boolean;
}) {
  return (
    <NavLink to={to} end={end} className={itemClass}>
      <Icon size={17} strokeWidth={1.75} />
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  const main = NAV_ITEMS.slice(0, 7);
  const settings = NAV_ITEMS[7];

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border-hairline bg-surface-sidebar px-3 py-5">
      <div className="mb-7 flex items-center gap-2 px-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-accent text-[13px] font-bold text-accent-ink">
          F
        </span>
        <span className="text-[15px] font-bold tracking-tight text-ink-primary">Fincy</span>
      </div>

      <nav className="flex flex-1 flex-col">
        <div className="flex flex-col gap-1">
          {main.map((item) => (
            <NavRow key={item.to} {...item} />
          ))}
        </div>

        <div className="my-4 border-t border-border-hairline" />

        <NavRow {...settings} />

        <div className="flex-1" />

        <p className="px-3 text-xs leading-relaxed text-ink-muted">
          Данные хранятся только на этом компьютере.
        </p>
      </nav>
    </aside>
  );
}
