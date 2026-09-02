import { Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../lib/theme';
import { Button } from '../ui/Button';

const TITLES: Record<string, string> = {
  '/': 'Обзор',
  '/transactions': 'Транзакции',
  '/accounts': 'Счета',
  '/budgets': 'Бюджеты',
  '/goals': 'Цели',
  '/recurring': 'Регулярные платежи',
  '/analytics': 'Аналитика',
  '/settings': 'Настройки',
};

const today = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date());

export function TopBar() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const title = TITLES[pathname] ?? 'Fincy';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-5">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-bold tracking-tight text-ink-primary">{title}</h1>
        <span className="text-sm text-ink-muted">{today}</span>
      </div>
      <Button variant="secondary" size="icon" onClick={toggleTheme} aria-label="Переключить тему">
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </Button>
    </header>
  );
}
