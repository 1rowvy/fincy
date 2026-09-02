import { getDb } from '../db/client';
import type { Settings } from '../types';

const DEFAULTS: Settings = {
  currency: 'RUB',
  theme: 'dark',
  recurring_reminder_lead_days: '3',
  onboarded: '0',
};

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const rows = await db.select<{ key: string; value: string }[]>('SELECT key, value FROM settings');
  const result = { ...DEFAULTS };
  for (const row of rows) {
    (result as Record<string, string>)[row.key] = row.value;
  }
  return result;
}

export async function setSetting(key: keyof Settings, value: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2',
    [key, value],
  );
}
