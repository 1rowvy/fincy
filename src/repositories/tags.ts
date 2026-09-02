import { getDb } from '../db/client';
import type { Tag } from '../types';

export async function listTags(): Promise<Tag[]> {
  const db = await getDb();
  return db.select<Tag[]>('SELECT * FROM tags ORDER BY name');
}

export async function createTag(name: string, color = '#22c55e'): Promise<Tag> {
  const db = await getDb();
  await db.execute(
    'INSERT INTO tags (name, color) VALUES ($1, $2) ON CONFLICT(name) DO NOTHING',
    [name, color],
  );
  const rows = await db.select<Tag[]>('SELECT * FROM tags WHERE name = $1', [name]);
  return rows[0];
}

export async function deleteTag(id: number): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM tags WHERE id = $1', [id]);
}

export async function setTransactionTags(transactionId: number, tagIds: number[]): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM transaction_tags WHERE transaction_id = $1', [transactionId]);
  for (const tagId of tagIds) {
    await db.execute(
      'INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2)',
      [transactionId, tagId],
    );
  }
}

export async function getTagsForTransaction(transactionId: number): Promise<Tag[]> {
  const db = await getDb();
  return db.select<Tag[]>(
    `SELECT t.* FROM tags t
     JOIN transaction_tags tt ON tt.tag_id = t.id
     WHERE tt.transaction_id = $1
     ORDER BY t.name`,
    [transactionId],
  );
}
