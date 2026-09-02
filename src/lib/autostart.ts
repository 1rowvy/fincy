import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';

export async function isAutostartEnabled(): Promise<boolean> {
  try {
    return await isEnabled();
  } catch {
    return false;
  }
}

export async function setAutostart(value: boolean): Promise<void> {
  if (value) {
    await enable();
  } else {
    await disable();
  }
}
