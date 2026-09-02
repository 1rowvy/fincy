import { getDb } from '../db/client';
import type { Tag, Transaction, TransactionFilters, TransactionWithRelations, TxType } from '../types';

const BASE_SELECT = `
  SELECT
    t.*,
    a.name AS account_name,
    a.color AS account_color,
    c.name AS category_name,
    c.icon AS category_icon,
    c.color AS category_color,
    COALESCE((
      SELECT json_group_array(json_object('id', tg.id, 'name', tg.name, 'color', tg.color))
      FROM tags tg
      JOIN transaction_tags tt ON tt.tag_id = tg.id
      WHERE tt.transaction_id = t.id
    ), '[]') AS tags_json
  FROM transactions t
  JOIN accounts a ON a.id = t.account_id
  LEFT JOIN categories c ON c.id = t.category_id
`;

interface RawRow extends Omit<TransactionWithRelations, 'tags'> {
  tags_json: string;
}

function mapRow(row: RawRow): TransactionWithRelations {
  const { tags_json, ...rest } = row;
  let tags: Tag[] = [];
  try {
    tags = JSON.parse(tags_json);
  } catch {
    tags = [];
  }
  return { ...rest, tags };
}

export async function listTransactions(filters: TransactionFilters = {}): Promise<TransactionWithRelations[]> {
  const db = await getDb();
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.accountId) {
    params.push(filters.accountId);
    clauses.push(`t.account_id = $${params.length}`);
  }
  if (filters.categoryId) {
    params.push(filters.categoryId);
    clauses.push(`t.category_id = $${params.length}`);
  }
  if (filters.type) {
    params.push(filters.type);
    clauses.push(`t.type = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    clauses.push(`t.occurred_at >= $${params.length}`);
  }
  if (filters.to) {
    params.push(filters.to);
    clauses.push(`t.occurred_at <= $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    clauses.push(`t.note LIKE $${params.length}`);
  }
  if (filters.tagId) {
    params.push(filters.tagId);
    clauses.push(`t.id IN (SELECT transaction_id FROM transaction_tags WHERE tag_id = $${params.length})`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await db.select<RawRow[]>(
    `${BASE_SELECT} ${where} ORDER BY t.occurred_at DESC, t.id DESC`,
    params,
  );
  return rows.map(mapRow);
}

export async function listByRecurringId(recurringId: number): Promise<TransactionWithRelations[]> {
  const db = await getDb();
  const rows = await db.select<RawRow[]>(
    `${BASE_SELECT} WHERE t.recurring_payment_id = $1 ORDER BY t.occurred_at DESC`,
    [recurringId],
  );
  return rows.map(mapRow);
}

export interface CreateTransactionInput {
  accountId: number;
  categoryId: number | null;
  type: TxType;
  amount: number;
  occurredAt: string;
  note?: string | null;
  tagIds?: number[];
  recurringPaymentId?: number | null;
}

export async function createTransaction(input: CreateTransactionInput): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    `INSERT INTO transactions (account_id, category_id, type, amount, occurred_at, note, recurring_payment_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.accountId,
      input.categoryId,
      input.type,
      input.amount,
      input.occurredAt,
      input.note ?? null,
      input.recurringPaymentId ?? null,
    ],
  );
  const id = result.lastInsertId as number;
  if (input.tagIds?.length) {
    for (const tagId of input.tagIds) {
      await db.execute('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2)', [id, tagId]);
    }
  }
  return id;
}

export async function updateTransaction(id: number, input: CreateTransactionInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE transactions
     SET account_id = $1, category_id = $2, type = $3, amount = $4, occurred_at = $5, note = $6
     WHERE id = $7`,
    [input.accountId, input.categoryId, input.type, input.amount, input.occurredAt, input.note ?? null, id],
  );
  await db.execute('DELETE FROM transaction_tags WHERE transaction_id = $1', [id]);
  if (input.tagIds?.length) {
    for (const tagId of input.tagIds) {
      await db.execute('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES ($1, $2)', [id, tagId]);
    }
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM transactions WHERE id = $1', [id]);
}

export async function getTransaction(id: number): Promise<Transaction | undefined> {
  const db = await getDb();
  const rows = await db.select<Transaction[]>('SELECT * FROM transactions WHERE id = $1', [id]);
  return rows[0];
}
