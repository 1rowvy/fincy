-- Fincy: начальная схема. Все суммы хранятся как целые копейки (integer cents).

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES
  ('currency', 'RUB'),
  ('theme', 'light'),
  ('recurring_reminder_lead_days', '3'),
  ('onboarded', '0');

CREATE TABLE accounts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('cash','checking','card','savings','other')),
  initial_balance INTEGER NOT NULL DEFAULT 0,
  color           TEXT NOT NULL DEFAULT '#22c55e',
  is_archived     INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income','expense')),
  icon        TEXT NOT NULL DEFAULT 'circle',
  color       TEXT NOT NULL DEFAULT '#22c55e',
  is_archived INTEGER NOT NULL DEFAULT 0
);

INSERT INTO categories (name, type, icon, color) VALUES
  ('Еда',          'expense', 'utensils',     '#f97316'),
  ('Транспорт',    'expense', 'car',          '#3b82f6'),
  ('Жильё',        'expense', 'home',         '#a855f7'),
  ('Развлечения',  'expense', 'popcorn',      '#ec4899'),
  ('Здоровье',     'expense', 'heart-pulse',  '#ef4444'),
  ('Связь',        'expense', 'smartphone',   '#06b6d4'),
  ('Покупки',      'expense', 'shopping-bag', '#eab308'),
  ('Прочее',       'expense', 'more-horizontal', '#64748b'),
  ('Зарплата',     'income',  'wallet',       '#22c55e'),
  ('Подработка',   'income',  'briefcase',    '#10b981'),
  ('Прочий доход', 'income',  'plus-circle',  '#14b8a6');

CREATE TABLE transactions (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id            INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id           INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  type                  TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount                INTEGER NOT NULL CHECK (amount > 0),
  occurred_at           TEXT NOT NULL,
  note                  TEXT,
  recurring_payment_id  INTEGER REFERENCES recurring_payments(id) ON DELETE SET NULL,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_transactions_account ON transactions(account_id, occurred_at);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_occurred_at ON transactions(occurred_at);

CREATE TABLE transfers (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  from_account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id   INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount          INTEGER NOT NULL CHECK (amount > 0),
  occurred_at     TEXT NOT NULL,
  note            TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (from_account_id <> to_account_id)
);
CREATE INDEX idx_transfers_from ON transfers(from_account_id);
CREATE INDEX idx_transfers_to ON transfers(to_account_id);

-- Ручная корректировка баланса (для счетов типа "накопления"): подписанная
-- дельта, а не отдельно хранимый баланс — складывается в общий расчёт балансa.
CREATE TABLE balance_adjustments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id  INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  note        TEXT,
  occurred_at TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_adjustments_account ON balance_adjustments(account_id);

CREATE TABLE tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#22c55e'
);

CREATE TABLE transaction_tags (
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id         INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);
CREATE INDEX idx_transaction_tags_tag ON transaction_tags(tag_id);

CREATE TABLE budgets (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id  INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  month        TEXT NOT NULL,
  limit_amount INTEGER NOT NULL CHECK (limit_amount > 0),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (category_id, month)
);

CREATE TABLE recurring_payments (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  name                TEXT NOT NULL,
  account_id          INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id         INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  type                TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount              INTEGER NOT NULL CHECK (amount > 0),
  frequency_unit      TEXT NOT NULL CHECK (frequency_unit IN ('day','week','month','year')),
  frequency_interval  INTEGER NOT NULL DEFAULT 1,
  next_due_date       TEXT NOT NULL,
  last_generated_date TEXT,
  reminder_lead_days  INTEGER NOT NULL DEFAULT 3,
  last_reminded_date  TEXT,
  is_active           INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_recurring_next_due ON recurring_payments(next_due_date) WHERE is_active = 1;

CREATE TABLE goals (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  account_id    INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  target_amount INTEGER NOT NULL CHECK (target_amount > 0),
  deadline      TEXT,
  is_archived   INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Каждая запись, влияющая на баланс счёта, со знаком.
-- Balance(account) = accounts.initial_balance + SUM(delta) по этому view.
CREATE VIEW account_ledger AS
  SELECT account_id,
         CASE WHEN type = 'income' THEN amount ELSE -amount END AS delta,
         occurred_at
  FROM transactions
  UNION ALL
  SELECT to_account_id AS account_id, amount AS delta, occurred_at FROM transfers
  UNION ALL
  SELECT from_account_id AS account_id, -amount AS delta, occurred_at FROM transfers
  UNION ALL
  SELECT account_id, amount AS delta, occurred_at FROM balance_adjustments;
