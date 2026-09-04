import { getDb } from '../db/client';
import { shiftMonth, toISODate } from '../lib/dates';
import type { TxType } from '../types';

export interface MonthTrendPoint {
  month: string;
  income: number;
  expense: number;
}

export async function getMonthlyTrend(months: string[]): Promise<MonthTrendPoint[]> {
  const db = await getDb();
  const rows = await db.select<{ month: string; income: number; expense: number }[]>(
    `SELECT
       strftime('%Y-%m', occurred_at) AS month,
       SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE strftime('%Y-%m', occurred_at) >= $1
     GROUP BY month`,
    [months[0]],
  );
  const byMonth = new Map(rows.map((r) => [r.month, r]));
  return months.map((month) => ({
    month,
    income: byMonth.get(month)?.income ?? 0,
    expense: byMonth.get(month)?.expense ?? 0,
  }));
}

export interface MonthBalancePoint {
  month: string;
  balance: number;
}

/**
 * Общий баланс по всем счетам на конец каждого из переданных месяцев (`yyyy-MM`).
 * Показывает, растёт ли капитал, стоит на месте или уменьшается.
 */
export async function getMonthlyBalance(months: string[]): Promise<MonthBalancePoint[]> {
  const db = await getDb();
  const totalInitial = await db.select<{ total: number }[]>(
    'SELECT COALESCE(SUM(initial_balance), 0) AS total FROM accounts WHERE is_archived = 0',
  );
  const rows = await db.select<{ month: string; delta: number }[]>(
    `SELECT strftime('%Y-%m', occurred_at) AS month, SUM(delta) AS delta
     FROM account_ledger
     GROUP BY month
     ORDER BY month`,
  );

  // Оба списка отсортированы по возрастанию месяца — идём одним проходом,
  // накапливая дельты до конца каждого запрошенного месяца включительно.
  let cumulative = totalInitial[0]?.total ?? 0;
  let idx = 0;
  return months.map((month) => {
    while (idx < rows.length && rows[idx].month <= month) {
      cumulative += rows[idx].delta;
      idx++;
    }
    return { month, balance: cumulative };
  });
}

export interface CategoryBreakdownItem {
  category_id: number | null;
  name: string;
  color: string;
  icon: string;
  total: number;
}

export async function getCategoryBreakdown(month: string, type: TxType): Promise<CategoryBreakdownItem[]> {
  const db = await getDb();
  return db.select<CategoryBreakdownItem[]>(
    `SELECT
       c.id AS category_id,
       COALESCE(c.name, 'Без категории') AS name,
       COALESCE(c.color, '#64748b') AS color,
       COALESCE(c.icon, 'circle') AS icon,
       SUM(t.amount) AS total
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.type = $1 AND strftime('%Y-%m', t.occurred_at) = $2
     GROUP BY t.category_id
     ORDER BY total DESC`,
    [type, month],
  );
}

export interface DailySpendingItem {
  /** ISO-дата дня (yyyy-MM-dd). */
  day: string;
  total: number;
  count: number;
}

/** Сумма расходов по каждому дню указанного месяца (`yyyy-MM`). */
export async function getDailySpending(month: string): Promise<DailySpendingItem[]> {
  const db = await getDb();
  return db.select<DailySpendingItem[]>(
    `SELECT
       date(t.occurred_at) AS day,
       SUM(t.amount) AS total,
       COUNT(*) AS count
     FROM transactions t
     WHERE t.type = 'expense' AND strftime('%Y-%m', t.occurred_at) = $1
     GROUP BY day
     ORDER BY day`,
    [month],
  );
}

export interface CategoryDeltaItem {
  category_id: number | null;
  name: string;
  color: string;
  icon: string;
  current_total: number;
  previous_total: number;
}

/** Расходы по категориям за `month` (`yyyy-MM`) в сравнении с предыдущим месяцем. */
export async function getCategoryDeltas(month: string): Promise<CategoryDeltaItem[]> {
  const db = await getDb();
  const prev = shiftMonth(month, -1);
  return db.select<CategoryDeltaItem[]>(
    `SELECT
       t.category_id AS category_id,
       COALESCE(c.name, 'Без категории') AS name,
       COALESCE(c.color, '#64748b') AS color,
       COALESCE(c.icon, 'circle') AS icon,
       COALESCE(SUM(CASE WHEN strftime('%Y-%m', t.occurred_at) = $1 THEN t.amount END), 0) AS current_total,
       COALESCE(SUM(CASE WHEN strftime('%Y-%m', t.occurred_at) = $2 THEN t.amount END), 0) AS previous_total
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.type = 'expense' AND strftime('%Y-%m', t.occurred_at) IN ($1, $2)
     GROUP BY t.category_id`,
    [month, prev],
  );
}

export interface MonthSummary {
  income: number;
  expense: number;
}

export async function getMonthSummary(month: string): Promise<MonthSummary> {
  const db = await getDb();
  const rows = await db.select<MonthSummary[]>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
     FROM transactions
     WHERE strftime('%Y-%m', occurred_at) = $1`,
    [month],
  );
  return rows[0] ?? { income: 0, expense: 0 };
}

export interface ForecastInputs {
  /** Дискреционные расходы за текущий месяц — без списаний по регулярным платежам. */
  discretionarySpent: number;
  /** Регулярные списания, которые ещё должны пройти до конца месяца. */
  upcomingRecurringExpense: number;
  /** Регулярные поступления, которые ещё должны прийти до конца месяца. */
  upcomingRecurringIncome: number;
  daysInMonth: number;
  /** Сегодняшнее число месяца (1–31). */
  dayOfMonth: number;
}

export async function getForecastInputs(): Promise<ForecastInputs> {
  const db = await getDb();
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const spent = await db.select<{ total: number }[]>(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE type = 'expense'
       AND recurring_payment_id IS NULL
       AND strftime('%Y-%m', occurred_at) = strftime('%Y-%m', 'now', 'localtime')`,
  );

  const recurring = await db.select<{ type: TxType; total: number }[]>(
    `SELECT type, COALESCE(SUM(amount), 0) AS total
     FROM recurring_payments
     WHERE is_active = 1
       AND next_due_date > date('now', 'localtime')
       AND next_due_date <= date('now', 'localtime', 'start of month', '+1 month', '-1 day')
     GROUP BY type`,
  );
  const byType = new Map(recurring.map((r) => [r.type, r.total]));

  return {
    discretionarySpent: spent[0]?.total ?? 0,
    upcomingRecurringExpense: byType.get('expense') ?? 0,
    upcomingRecurringIncome: byType.get('income') ?? 0,
    daysInMonth,
    dayOfMonth: now.getDate(),
  };
}

export interface BalancePoint {
  date: string;
  balance: number;
}

/** Кумулятивный общий баланс по всем счетам на каждый день за последние `days` дней. */
export async function getBalanceHistory(days: number): Promise<BalancePoint[]> {
  const db = await getDb();
  const totalInitial = await db.select<{ total: number }[]>(
    'SELECT COALESCE(SUM(initial_balance), 0) AS total FROM accounts WHERE is_archived = 0',
  );
  const deltas = await db.select<{ occurred_at: string; delta: number }[]>(
    `SELECT occurred_at, SUM(delta) AS delta FROM account_ledger GROUP BY occurred_at ORDER BY occurred_at`,
  );

  const points: BalancePoint[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));

  let running = totalInitial[0]?.total ?? 0;
  let deltaIdx = 0;
  for (const d of deltas) {
    if (d.occurred_at >= toISODate(start)) break;
    running += d.delta;
    deltaIdx++;
  }

  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const iso = toISODate(day);
    while (deltaIdx < deltas.length && deltas[deltaIdx].occurred_at === iso) {
      running += deltas[deltaIdx].delta;
      deltaIdx++;
    }
    points.push({ date: iso, balance: running });
  }
  return points;
}
