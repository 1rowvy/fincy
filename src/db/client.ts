import Database from '@tauri-apps/plugin-sql';

let dbPromise: Promise<Database> | null = null;

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load('sqlite:fincy.db');
  }
  return dbPromise;
}
