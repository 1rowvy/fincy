import { getDb } from '../db/client';
import { advanceDate, today } from '../lib/dates';
import type { FrequencyUnit, RecurringPayment, TxType } from '../types';
import { createTransaction } from './transactions';

const MAX_CATCHUP_ITERATIONS = 60;

export async function listRecurring(includeInactive = true): Promise<RecurringPayment[]> {
  const db = await getDb();
  const where = includeInactive ? '' : 'WHERE is_active = 1';
  return db.select<RecurringPayment[]>(
    `SELECT * FROM recurring_payments ${where} ORDER BY next_due_date`,
  );
}

export async function listUpcoming(withinDays: number): Promise<RecurringPayment[]> {
  const db = await getDb();
  return db.select<RecurringPayment[]>(
    `SELECT * FROM recurring_payments
     WHERE is_active = 1 AND julianday(next_due_date) - julianday($1) <= $2
     ORDER BY next_due_date`,
    [today(), withinDays],
  );
}

export interface RecurringInput {
  name: string;
  accountId: number;
  categoryId: number | null;
  type: TxType;
  amount: number;
  frequencyUnit: FrequencyUnit;
  frequencyInterval: number;
  nextDueDate: string;
  reminderLeadDays: number;
}

export async function createRecurring(input: RecurringInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO recurring_payments
       (name, account_id, category_id, type, amount, frequency_unit, frequency_interval, next_due_date, reminder_lead_days)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      input.name,
      input.accountId,
      input.categoryId,
      input.type,
      input.amount,
      input.frequencyUnit,
      input.frequencyInterval,
      input.nextDueDate,
      input.reminderLeadDays,
    ],
  );
}

export async function updateRecurring(id: number, input: RecurringInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE recurring_payments
     SET name = $1, account_id = $2, category_id = $3, type = $4, amount = $5,
         frequency_unit = $6, frequency_interval = $7, next_due_date = $8, reminder_lead_days = $9
     WHERE id = $10`,
    [
      input.name,
      input.accountId,
      input.categoryId,
      input.type,
      input.amount,
      input.frequencyUnit,
      input.frequencyInterval,
      input.nextDueDate,
      input.reminderLeadDays,
      id,
    ],
  );
}

export async function setActive(id: number, isActive: boolean): Promise<void> {
  const db = await getDb();
  await db.execute('UPDATE recurring_payments SET is_active = $1 WHERE id = $2', [isActive ? 1 : 0, id]);
}

export async function deleteRecurring(id: number): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM recurring_payments WHERE id = $1', [id]);
}

export async function advanceDueDate(id: number, nextDueDate: string, lastGeneratedDate: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    'UPDATE recurring_payments SET next_due_date = $1, last_generated_date = $2 WHERE id = $3',
    [nextDueDate, lastGeneratedDate, id],
  );
}

/**
 * Отметить платёж оплаченным вручную: создаёт транзакцию текущей датой и
 * сдвигает `next_due_date` на следующий срок (пропуская уже прошедшие).
 */
export async function markPaidNow(id: number): Promise<void> {
  const db = await getDb();
  const rows = await db.select<RecurringPayment[]>('SELECT * FROM recurring_payments WHERE id = $1', [id]);
  const rule = rows[0];
  if (!rule) return;

  const paidDate = today();
  await createTransaction({
    accountId: rule.account_id,
    categoryId: rule.category_id,
    type: rule.type,
    amount: rule.amount,
    occurredAt: paidDate,
    note: rule.name,
    recurringPaymentId: rule.id,
  });

  let nextDue = advanceDate(rule.next_due_date, rule.frequency_unit, rule.frequency_interval);
  let iterations = 0;
  while (nextDue <= paidDate && iterations < MAX_CATCHUP_ITERATIONS) {
    nextDue = advanceDate(nextDue, rule.frequency_unit, rule.frequency_interval);
    iterations++;
  }
  await advanceDueDate(rule.id, nextDue, paidDate);
}

export async function markReminded(id: number, date: string): Promise<void> {
  const db = await getDb();
  await db.execute('UPDATE recurring_payments SET last_reminded_date = $1 WHERE id = $2', [date, id]);
}
