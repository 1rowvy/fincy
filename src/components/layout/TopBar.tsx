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

export function TopBar() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const title = TITLES[pathname] ?? 'Fincy';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-hairline px-6">
      <h1 className="text-lg font-semibold text-ink-primary">{title}</h1>
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Переключить тему">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </Button>
    </header>
  );
}
