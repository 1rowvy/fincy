import { getDb } from '../db/client';
import type { Category, TxType } from '../types';

export async function listCategories(includeArchived = false): Promise<Category[]> {
  const db = await getDb();
  const where = includeArchived ? '' : 'WHERE is_archived = 0';
  return db.select<Category[]>(`SELECT * FROM categories ${where} ORDER BY type, name`);
}

export async function listCategoriesByType(type: TxType): Promise<Category[]> {
  const db = await getDb();
  return db.select<Category[]>(
    'SELECT * FROM categories WHERE type = $1 AND is_archived = 0 ORDER BY name',
    [type],
  );
}

export interface CreateCategoryInput {
  name: string;
  type: TxType;
  icon: string;
  color: string;
}

export async function createCategory(input: CreateCategoryInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    'INSERT INTO categories (name, type, icon, color) VALUES ($1, $2, $3, $4)',
    [input.name, input.type, input.icon, input.color],
  );
}

export async function updateCategory(id: number, input: CreateCategoryInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    'UPDATE categories SET name = $1, type = $2, icon = $3, color = $4 WHERE id = $5',
    [input.name, input.type, input.icon, input.color, id],
  );
}

export async function archiveCategory(id: number): Promise<void> {
  const db = await getDb();
  await db.execute('UPDATE categories SET is_archived = 1 WHERE id = $1', [id]);
}
