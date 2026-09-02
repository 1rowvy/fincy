import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { AppRoutes } from './routes';
import { runRecurringEngine } from './lib/engine/recurringEngine';
import { setAutostart } from './lib/autostart';
import { getSettings, setSetting } from './repositories/settings';

const RECHECK_INTERVAL_MS = 45 * 60 * 1000;

function App() {
  const queryClient = useQueryClient();
  const onboardedRef = useRef(false);

  useEffect(() => {
    async function tick() {
      const result = await runRecurringEngine();
      if (result.generatedCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['budgets'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        queryClient.invalidateQueries({ queryKey: ['recurring'] });
        toast.success(`Автоматически добавлено платежей: ${result.generatedCount}`);
      }
    }

    async function onboardOnce() {
      if (onboardedRef.current) return;
      onboardedRef.current = true;
      const settings = await getSettings();
      if (settings.onboarded === '0') {
        try {
          await setAutostart(true);
        } catch {
          // автозапуск недоступен в этой среде — не критично
        }
        await setSetting('onboarded', '1');
      }
    }

    onboardOnce();
    tick();

    const onFocus = () => tick();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(tick, RECHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [queryClient]);

  return (
    <AppShell>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface-overlay)',
            color: 'var(--ink-primary)',
            border: '1px solid var(--border-hairline)',
          },
        }}
      />
    </AppShell>
  );
}

export default App;
