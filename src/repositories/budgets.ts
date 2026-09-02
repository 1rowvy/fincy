import { getDb } from '../db/client';
import type { BudgetProgress } from '../types';

export async function listBudgetProgress(month: string): Promise<BudgetProgress[]> {
  const db = await getDb();
  return db.select<BudgetProgress[]>(
    `SELECT
       b.*,
       c.name AS category_name,
       c.icon AS category_icon,
       c.color AS category_color,
       COALESCE((
         SELECT SUM(t.amount) FROM transactions t
         WHERE t.category_id = b.category_id
           AND t.type = 'expense'
           AND strftime('%Y-%m', t.occurred_at) = b.month
       ), 0) AS spent
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     WHERE b.month = $1
     ORDER BY c.name`,
    [month],
  );
}

export async function upsertBudget(categoryId: number, month: string, limitAmount: number): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO budgets (category_id, month, limit_amount) VALUES ($1, $2, $3)
     ON CONFLICT(category_id, month) DO UPDATE SET limit_amount = $3`,
    [categoryId, month, limitAmount],
  );
}

export async function deleteBudget(id: number): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM budgets WHERE id = $1', [id]);
}
