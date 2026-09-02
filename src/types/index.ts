export type AccountType = 'cash' | 'checking' | 'card' | 'savings' | 'other';
export type TxType = 'income' | 'expense';
export type FrequencyUnit = 'day' | 'week' | 'month' | 'year';

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  initial_balance: number;
  color: string;
  is_archived: number;
  created_at: string;
}

export interface AccountWithBalance extends Account {
  balance: number;
}

export interface Category {
  id: number;
  name: string;
  type: TxType;
  icon: string;
  color: string;
  is_archived: number;
}

export interface Transaction {
  id: number;
  account_id: number;
  category_id: number | null;
  type: TxType;
  amount: number;
  occurred_at: string;
  note: string | null;
  recurring_payment_id: number | null;
  created_at: string;
}

export interface TransactionWithRelations extends Transaction {
  account_name: string;
  account_color: string;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  tags: Tag[];
}

export interface Transfer {
  id: number;
  from_account_id: number;
  to_account_id: number;
  amount: number;
  occurred_at: string;
  note: string | null;
  created_at: string;
}

export interface BalanceAdjustment {
  id: number;
  account_id: number;
  amount: number;
  note: string | null;
  occurred_at: string;
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Budget {
  id: number;
  category_id: number;
  month: string;
  limit_amount: number;
  created_at: string;
}

export interface BudgetProgress extends Budget {
  category_name: string;
  category_icon: string;
  category_color: string;
  spent: number;
}

export interface RecurringPayment {
  id: number;
  name: string;
  account_id: number;
  category_id: number | null;
  type: TxType;
  amount: number;
  frequency_unit: FrequencyUnit;
  frequency_interval: number;
  next_due_date: string;
  last_generated_date: string | null;
  reminder_lead_days: number;
  last_reminded_date: string | null;
  is_active: number;
  created_at: string;
}

export interface Goal {
  id: number;
  name: string;
  account_id: number;
  target_amount: number;
  deadline: string | null;
  is_archived: number;
  created_at: string;
}

export interface GoalWithProgress extends Goal {
  account_name: string;
  current_amount: number;
}

export interface Settings {
  currency: string;
  theme: 'light' | 'dark';
  recurring_reminder_lead_days: string;
  onboarded: string;
}

export interface TransactionFilters {
  accountId?: number;
  categoryId?: number;
  tagId?: number;
  type?: TxType;
  from?: string;
  to?: string;
  search?: string;
}
