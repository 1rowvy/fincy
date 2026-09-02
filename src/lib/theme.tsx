import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSetSetting, useSettings } from '../hooks/useSettings';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useSettings();
  const setSetting = useSetSetting();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (settings?.theme === 'light' || settings?.theme === 'dark') {
      setTheme(settings.theme);
    }
  }, [settings?.theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setSetting.mutate({ key: 'theme', value: next });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
