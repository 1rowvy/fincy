import { getDb } from '../db/client';
import type { GoalWithProgress } from '../types';

export async function listGoals(): Promise<GoalWithProgress[]> {
  const db = await getDb();
  return db.select<GoalWithProgress[]>(
    `SELECT
       g.*,
       a.name AS account_name,
       a.initial_balance + COALESCE((
         SELECT SUM(l.delta) FROM account_ledger l WHERE l.account_id = a.id
       ), 0) AS current_amount
     FROM goals g
     JOIN accounts a ON a.id = g.account_id
     WHERE g.is_archived = 0
     ORDER BY g.created_at DESC`,
  );
}

export interface GoalInput {
  name: string;
  accountId: number;
  targetAmount: number;
  deadline: string | null;
}

export async function createGoal(input: GoalInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    'INSERT INTO goals (name, account_id, target_amount, deadline) VALUES ($1, $2, $3, $4)',
    [input.name, input.accountId, input.targetAmount, input.deadline],
  );
}

export async function updateGoal(id: number, input: GoalInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    'UPDATE goals SET name = $1, account_id = $2, target_amount = $3, deadline = $4 WHERE id = $5',
    [input.name, input.accountId, input.targetAmount, input.deadline, id],
  );
}

export async function archiveGoal(id: number): Promise<void> {
  const db = await getDb();
  await db.execute('UPDATE goals SET is_archived = 1 WHERE id = $1', [id]);
}
