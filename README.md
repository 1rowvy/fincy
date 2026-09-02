# Fincy

A local-first personal finance tracker — a Tauri desktop app for keeping track of
income, expenses, budgets, recurring payments and savings goals. All data lives in
a single SQLite file on your machine: no accounts, no sync, no network.

> The app UI is in Russian.

<!-- Add a screenshot at docs/screenshot.png and uncomment:
![Fincy](docs/screenshot.png)
-->

## Features

- **Accounts** — cash, cards, checking, savings. Balances are derived, never stored:
  `initial_balance + Σ transactions + Σ transfers + Σ manual adjustments`.
- **Transfers** between accounts and **manual balance adjustments** for savings
  accounts (enter the current amount without logging every transaction).
- **Transactions** with categories, notes and tags; filter by account, category,
  tag, type, date range or free text.
- **Budgets** — monthly per-category limits with progress bars and over-limit
  warnings.
- **Recurring payments** — subscriptions and bills auto-generate transactions on
  their due date, with system notifications ahead of time.
- **Goals** — savings targets tied to an account, with progress and an optional
  deadline.
- **Analytics** — income/expense trend, net result per month, category breakdown.
- **Overview dashboard** — total balance, spending limit, upcoming payments, goals,
  budgets at risk, recent activity, and an **end-of-month balance forecast**
  (current balance ± upcoming recurring payments − projected discretionary spend
  based on the month's pace so far).
- **Dark / light theme** with an explicit toggle.
- **System tray + autostart** — the app launches with the OS and minimizes to the
  tray instead of closing, so the recurring-payment engine and reminders keep
  running.

## Tech stack

- [Tauri v2](https://tauri.app/) (Rust shell) + React 19 + TypeScript + Vite
- [`@tauri-apps/plugin-sql`](https://github.com/tauri-apps/plugins-workspace) —
  SQLite, migrations registered in Rust, all business logic in TypeScript via
  parameterized SQL
- [`@tanstack/react-query`](https://tanstack.com/query) over a thin repository
  layer (one module per entity)
- [`react-router-dom`](https://reactrouter.com/) in hash-router mode
- [Recharts](https://recharts.org/) for charts
- Tailwind CSS v4 (CSS-first config) + Radix UI primitives + `class-variance-authority`
- `date-fns`, `sonner` (toasts), `lucide-react` (icons)
- Money is stored as **integer cents** to avoid floating-point errors

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- Platform dependencies for Tauri — see the
  [Tauri prerequisites guide](https://tauri.app/start/prerequisites/)

### Development

```bash
npm install
npm run tauri dev
```

### Production build

```bash
npm run tauri build
```

Installers are written to `src-tauri/target/release/bundle/`.

## Project structure

```
src/
  main.tsx, App.tsx, routes.tsx      # hash router; App.tsx runs the recurring engine
  db/client.ts                       # getDb() singleton over sqlite:fincy.db
  pages/                             # Overview, Transactions, Accounts, Budgets,
                                     # Goals, Recurring, Analytics, Settings
  repositories/                      # parameterized SQL per entity
  hooks/                             # react-query wrappers around repositories
  components/
    charts/  layout/  ui/  + per-feature folders
  lib/
    engine/recurringEngine.ts        # generates due transactions, fires reminders
    money.ts  dates.ts  icons.ts  theme.tsx
  index.css                          # design tokens (light + dark palettes)

src-tauri/
  src/lib.rs                         # plugin setup, tray, close-to-tray
  migrations/0001_initial.sql        # database schema
  tauri.conf.json
```

## How the recurring engine works

It runs entirely on the client, no background OS service. `App.tsx` starts it on
launch and re-runs it on window focus plus a ~45-minute interval. On each tick it:

1. Loads active recurring payments.
2. While `next_due_date <= today`: inserts a transaction, advances `next_due_date`
   (capped iterations so a long-abandoned rule can't loop forever).
3. If a payment is due within its `reminder_lead_days` and hasn't been reminded
   today, sends a system notification.

Because of autostart + close-to-tray, the process stays alive after the first
login, so generation and reminders are reliable without a server.

## Data & privacy

Everything is stored locally in `fincy.db` in the app's data directory (e.g.
`%APPDATA%/com.rowvybeats.fincy/` on Windows). Nothing leaves the machine.

## Releases & auto-update

Pushing a `vX.Y.Z` tag triggers `.github/workflows/release.yml`, which builds the
Windows installer with `tauri-action`, signs the updater artifacts and creates a
**draft** GitHub Release with a `latest.json` manifest attached.

The app checks `https://github.com/1rowvy/fincy/releases/latest/download/latest.json`
on startup (and from Settings → «Проверить обновления»). When a newer signed
version is found it offers a one-click download-install-relaunch.

For the workflow to sign updates, one repository secret is required:

| Secret | Value |
| --- | --- |
| `TAURI_SIGNING_PRIVATE_KEY` | full contents of the private key from `tauri signer generate` |

The key here was generated without a password, so the workflow passes an empty
`TAURI_SIGNING_PRIVATE_KEY_PASSWORD` inline. If you regenerate the key with a
password, add it as a second secret and reference it from the workflow instead.

The matching public key lives in `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`.
Because the endpoint resolves to the latest **published, non-prerelease** release,
each draft release must be published before clients will pick it up.

## License

[MIT](LICENSE)
