import { relaunch } from '@tauri-apps/plugin-process';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { toast } from 'sonner';

let inFlight = false;

/**
 * Проверяет наличие новой версии на GitHub Releases. При наличии — показывает тост
 * с кнопкой «Обновить»: загрузка, установка и перезапуск. В `tauri dev` тихо
 * завершается (нет подписанных артефактов).
 */
export async function checkForUpdates({ notifyNoUpdate = false } = {}): Promise<void> {
  if (inFlight) return;
  inFlight = true;

  let update: Update | null = null;
  try {
    update = await check();
  } catch (err) {
    console.error('Проверка обновлений не удалась:', err);
    if (notifyNoUpdate) toast.error('Не удалось проверить обновления');
    return;
  } finally {
    inFlight = false;
  }

  if (!update) {
    if (notifyNoUpdate) toast.success('У вас последняя версия Fincy');
    return;
  }

  toast(`Доступна новая версия Fincy ${update.version}`, {
    description: update.body?.trim() || undefined,
    duration: Infinity,
    action: {
      label: 'Обновить',
      onClick: () => void installUpdate(update as Update),
    },
  });
}

async function installUpdate(update: Update): Promise<void> {
  const id = toast.loading('Загрузка обновления…');
  let downloaded = 0;
  let total = 0;

  try {
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          total = event.data.contentLength ?? 0;
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          if (total > 0) {
            toast.loading(`Загрузка обновления… ${Math.round((downloaded / total) * 100)}%`, { id });
          }
          break;
        case 'Finished':
          toast.loading('Установка…', { id });
          break;
      }
    });
    toast.success('Обновление установлено — перезапуск…', { id });
    await relaunch();
  } catch (err) {
    console.error('Не удалось установить обновление:', err);
    toast.error('Не удалось установить обновление', { id });
  }
}
