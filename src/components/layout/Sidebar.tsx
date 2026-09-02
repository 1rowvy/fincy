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
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border-hairline bg-surface-sidebar px-3 py-5">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-ink font-bold">
          F
        </span>
        <span className="text-base font-semibold text-ink-primary">Fincy</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink-secondary hover:bg-surface-card-hover hover:text-ink-primary',
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-accent-soft text-accent'
              : 'text-ink-secondary hover:bg-surface-card-hover hover:text-ink-primary',
          )
        }
      >
        <Settings size={17} />
        Настройки
      </NavLink>
    </aside>
  );
}
