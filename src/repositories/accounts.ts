import { getDb } from '../db/client';
import { today } from '../lib/dates';
import type { AccountType, AccountWithBalance, Transfer } from '../types';

const BALANCE_QUERY = `
  SELECT a.*, a.initial_balance + COALESCE(SUM(l.delta), 0) AS balance
  FROM accounts a
  LEFT JOIN account_ledger l ON l.account_id = a.id
  WHERE a.is_archived = 0
  GROUP BY a.id
  ORDER BY a.created_at
`;

export async function listAccounts(): Promise<AccountWithBalance[]> {
  const db = await getDb();
  return db.select<AccountWithBalance[]>(BALANCE_QUERY);
}

export async function getAccountBalance(accountId: number): Promise<number> {
  const db = await getDb();
  const rows = await db.select<{ balance: number }[]>(
    `SELECT a.initial_balance + COALESCE(SUM(l.delta), 0) AS balance
     FROM accounts a
     LEFT JOIN account_ledger l ON l.account_id = a.id
     WHERE a.id = $1
     GROUP BY a.id`,
    [accountId],
  );
  return rows[0]?.balance ?? 0;
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  initialBalance: number;
  color: string;
}

export async function createAccount(input: CreateAccountInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    'INSERT INTO accounts (name, type, initial_balance, color) VALUES ($1, $2, $3, $4)',
    [input.name, input.type, input.initialBalance, input.color],
  );
}

export async function updateAccount(id: number, input: CreateAccountInput): Promise<void> {
  const db = await getDb();
  await db.execute(
    'UPDATE accounts SET name = $1, type = $2, color = $3 WHERE id = $4',
    [input.name, input.type, input.color, id],
  );
}

export async function archiveAccount(id: number): Promise<void> {
  const db = await getDb();
  await db.execute('UPDATE accounts SET is_archived = 1 WHERE id = $1', [id]);
}

export async function adjustBalance(accountId: number, newBalance: number, note: string): Promise<void> {
  const currentBalance = await getAccountBalance(accountId);
  const delta = newBalance - currentBalance;
  if (delta === 0) return;
  const db = await getDb();
  await db.execute(
    'INSERT INTO balance_adjustments (account_id, amount, note, occurred_at) VALUES ($1, $2, $3, $4)',
    [accountId, delta, note, today()],
  );
}

export async function createTransfer(input: {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  occurredAt: string;
  note?: string;
}): Promise<void> {
  const db = await getDb();
  await db.execute(
    'INSERT INTO transfers (from_account_id, to_account_id, amount, occurred_at, note) VALUES ($1, $2, $3, $4, $5)',
    [input.fromAccountId, input.toAccountId, input.amount, input.occurredAt, input.note ?? null],
  );
}

export async function listTransfers(): Promise<Transfer[]> {
  const db = await getDb();
  return db.select<Transfer[]>('SELECT * FROM transfers ORDER BY occurred_at DESC, id DESC');
}
