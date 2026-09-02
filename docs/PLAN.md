# Fincy — personal finance tracker (Tauri desktop app)

## Context

Пользователь хочет личное приложение для учёта доходов/расходов с графиками (ежемесячные траты, аналитика), на Tauri, в дизайне, близком к прикреплённому скриншоту SaaS-дашборда (сайдбар, карточки со статами и спарклайнами, донат/бар/лайн графики, зелёный акцент, переключение тёмная/светлая тема). Директория `/home/viktor/projects/fincy` пуста — проект собирается с нуля.

Через уточняющие вопросы согласовано:
- Стек: **Tauri v2 + React + TypeScript + Vite**.
- Данные: **SQLite локально**, без сети/облака, без авторизации.
- Валюта по умолчанию: **RUB (₽)**, меняется в настройках.
- Несколько счетов (карта, наличные, накопления) с **переводами** между ними.
- Счета типа "накопления" поддерживают **ручную корректировку баланса** (вписал текущую сумму — не логируя каждую транзакцию).
- **Бюджеты** по категориям (месячный лимит, прогресс-бар, индикация превышения).
- **Регулярные платежи** (подписки/счета) — автогенерация транзакций по дате, **напоминания** заранее.
- **Цели накоплений** с прогресс-баром и опциональным дедлайном, привязаны к накопительному счёту.
- **Теги/заметки** на транзакциях.
- Графики: разбивка по категориям, тренд доход/расход по месяцам, спарклайны на стат-карточках, отклонения по месяцам.
- Тема: **тёмная + светлая с явным переключателем** (не только системная).
- CSV импорт/экспорт, мультивалютность, пароль/PIN — **не нужны** (сознательно исключены).
- **Интерфейс приложения на русском языке** (все лейблы, пункты меню, тексты форм и уведомлений).
- **Трей + автозапуск с ОС**: приложение стартует вместе с системой и сворачивается в трей вместо закрытия — это нужно, чтобы движок регулярных платежей и напоминания надёжно работали, даже когда окно не открыто явно.
- **GitHub Actions релиз**: сборка Windows-инсталлятора и публикация GitHub Release по тегу.

## Стек и пакеты

- `create-tauri-app` (template `react-ts`) → Tauri v2 + Vite + React + TS.
- Данные: **`tauri-plugin-sql`** (feature `sqlite`) + JS-пакет `@tauri-apps/plugin-sql` — миграции регистрируются в Rust, вся бизнес-логика (расчёт баланса, бюджеты, повторяющиеся платежи) — в TS через параметризованный SQL. Rust-код кроме регистрации плагинов почти не пишем.
- Напоминания: **`tauri-plugin-notification`** + `@tauri-apps/plugin-notification`.
- Трей/автозапуск: **`tauri-plugin-autostart`** (+ `@tauri-apps/plugin-autostart`) для запуска с ОС; системный трей — через встроенный в Tauri v2 core API `tauri::tray::TrayIconBuilder` (не отдельный плагин), меню "Открыть Fincy" / "Выход", перехват `WindowEvent::CloseRequested` → `hide()` вместо реального закрытия.
- Локализация: строки **захардкожены на русском** прямо в компонентах — отдельная i18n-библиотека не нужна, т.к. только один язык интерфейса.
- Данные/кэш: **`@tanstack/react-query`** поверх тонкого repository-слоя (по файлу на сущность: accounts, categories, transactions, transfers, tags, budgets, recurring, goals, settings, analytics).
- Роутинг: **`react-router-dom`** в режиме **Hash Router** (важно для Tauri — нет SPA fallback сервера).
- Графики: **`recharts`** (спарклайны, donut, line/bar).
- Стили: **Tailwind CSS v4** (через `@tailwindcss/vite`, CSS-first конфиг, без `tailwind.config.js`), ручные UI-примитивы на **Radix UI** + `class-variance-authority` + `tailwind-merge` (НЕ shadcn CLI — он тянет компоненты с удалённого реестра, что ненадёжно в этой среде). Тосты — `sonner`. Иконки — `lucide-react`.
- Даты: `date-fns`.
- Деньги хранятся как **целые копейки/центы** (integer cents) во избежание ошибок с float.

## Схема БД (SQLite, `src-tauri/migrations/0001_initial.sql`)

Таблицы: `settings` (key-value: currency, theme, reminder_lead_days), `accounts` (type: cash/checking/card/savings/other, initial_balance, is_archived), `categories` (income/expense, icon, color), `transactions` (account_id, category_id, type, amount>0, occurred_at, note, recurring_payment_id), `transfers` (from_account_id, to_account_id, amount, occurred_at), `balance_adjustments` (account_id, signed amount delta — для ручной корректировки накопительных счетов), `tags` + `transaction_tags` (join), `budgets` (category_id, month 'YYYY-MM', limit_amount, UNIQUE(category_id,month)), `recurring_payments` (frequency_unit/interval, next_due_date, last_generated_date, reminder_lead_days, last_reminded_date, is_active), `goals` (account_id, target_amount, deadline).

Баланс счёта считается **аддитивно**, без кэш-поля: `initial_balance + Σ(transactions) + Σ(transfers in/out) + Σ(balance_adjustments)` — реализовано через SQL VIEW `account_ledger` (UNION ALL всех источников дельты) + агрегирующий запрос в `repositories/accounts.ts`. Ручной ввод баланса накопительного счёта = вставка строки в `balance_adjustments` с дельтой `(введённая_сумма − текущий_расчётный_баланс)`, без отдельного хранимого баланса.

Индексы на `transactions(account_id, occurred_at)`, `transactions(category_id)`, `transfers(from/to_account_id)`, `recurring_payments(next_due_date) WHERE is_active=1`.

## Движок регулярных платежей и напоминаний

Работает **на клиенте**, без фоновой ОС-службы: запускается в `App.tsx` при старте (`useEffect`) и повторно по `window focus` + fallback `setInterval` (~30–60 мин), пока приложение открыто. Алгоритм (`src/lib/engine/recurringEngine.ts`):
1. Выбрать активные `recurring_payments`.
2. Пока `next_due_date <= сегодня`: вставить транзакцию (с `recurring_payment_id`), сдвинуть `next_due_date` через `date-fns`, ограничить цикл (~60 итераций) чтобы не зависнуть на давно заброшенном правиле, показать тост "догенерировано N платежей".
3. Напоминания: если `next_due_date` в пределах `[сегодня, сегодня+reminder_lead_days]` и `last_reminded_date` ≠ сегодня — системное уведомление через `tauri-plugin-notification` (`isPermissionGranted`/`requestPermission`/`sendNotification`), проставить `last_reminded_date`.

Благодаря автозапуску и сворачиванию в трей (вместо закрытия) процесс фактически жив постоянно после первого входа в систему, поэтому автогенерация и напоминания работают надёжно без отдельной фоновой ОС-службы — движок просто продолжает опрашивать `next_due_date` по таймеру, пока трей-иконка активна. Остаточное ограничение: если пользователь явно завершит процесс через "Выход" в трее или впервые ещё не заходил в систему после установки — до следующего запуска ничего не сработает; это ожидаемо для desktop-приложения без серверной части.

## Структура фронтенда

```
src/
  main.tsx, App.tsx, routes.tsx (HashRouter)
  db/client.ts                    # getDb() singleton over Database.load('sqlite:fincy.db')
  types/index.ts
  repositories/{accounts,categories,transactions,transfers,tags,budgets,recurring,goals,settings,analytics}.ts
  hooks/use{Accounts,Transactions,Budgets,Recurring,Goals,Analytics,Settings}.ts   # React Query
  lib/{money,dates}.ts, lib/theme.tsx, lib/engine/recurringEngine.ts, lib/autostart.ts
  components/layout/{Sidebar,TopBar,AppShell}.tsx
  components/ui/{Button,Card,Dialog,ProgressBar,Tabs,Select,Input,Switch,Badge,Tooltip}.tsx
  components/charts/{Sparkline,DonutChart,TrendLineChart,DeviationBarChart,StatCard}.tsx
  components/{transactions,accounts,budgets,goals,recurring}/*Form.tsx, *Card.tsx, *List.tsx
  pages/{Overview,Transactions,Accounts,Budgets,Goals,Recurring,Analytics,Settings}.tsx
```

Мутации в React Query инвалидируют связанные ключи кросс-доменно (например, создание транзакции инвалидирует `accounts`, `transactions`, `budgets`, `analytics`) — это централизовано в хуках, а не в компонентах.

## Страницы

- **Overview** — стат-карточки (общий баланс, доход/расход за месяц, net) со спарклайнами, список счетов, ближайшие регулярные платежи, алерты по превышению бюджета, мини-график отклонений по месяцам.
- **Transactions** — фильтруемый список (счёт/категория/тег/период/тип), добавление/редактирование транзакции и перевода, теги.
- **Accounts** — карточки счетов с расчётным балансом, добавление/архивация, перевод между счетами, диалог ручной корректировки баланса (накопительные счета).
- **Budgets** — лимиты по категориям на месяц, прогресс-бары, индикация превышения.
- **Goals** — карточки целей: цель/сумма, прогресс = баланс привязанного накопительного счёта, дедлайн.
- **Recurring** — список правил (сумма, периодичность, следующая дата, напоминание), пауза/редактирование, история сгенерированных транзакций.
- **Analytics** — donut по категориям (доход/расход отдельно), тренд доход-расход по месяцам, бар-чарт отклонений, фильтр периода.
- **Settings** — валюта (по умолчанию RUB), переключатель темы, тумблер "запускать при входе в систему" (autostart), дефолтный срок напоминаний, управление категориями и тегами (CRUD).

При реализации графиков — обязательно свериться со скилом **dataviz** перед написанием кода чартов (палитра, форма, доступность в обеих темах).

## Трей, автозапуск и локализация

- `src-tauri/Cargo.toml`: `cargo add tauri-plugin-autostart`; `npm install @tauri-apps/plugin-autostart`.
- `src-tauri/src/lib.rs`: регистрация `tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![]))`; создание трей-иконки через `TrayIconBuilder` с меню (`Открыть Fincy`, разделитель, `Выход`), обработчик клика по иконке — показать/восстановить окно; на главном окне — обработчик `WindowEvent::CloseRequested` вызывает `api.prevent_close()` + `window.hide()`, реальный выход — только через пункт меню "Выход" (`app.exit(0)`).
- `capabilities/default.json`: добавить `autostart:default`, `core:tray:default`, `core:window:allow-hide`, `core:window:allow-show`.
- `src/lib/autostart.ts`: обёртки над `enable()/disable()/isEnabled()` из `@tauri-apps/plugin-autostart`, используются тумблером в Settings; включать по умолчанию при первом запуске (первичная настройка) — реализовать как один вызов `enable()` в первом онбординге, дальше пользователь управляет через Settings.
- Все пользовательские строки (лейблы, кнопки, заголовки страниц, тексты уведомлений типа "Через 3 дня спишется Netflix — 599 ₽") пишутся сразу на русском в JSX/строках, без ключей локализации — один язык, одна библиотека не нужна.

## GitHub Actions релиз (Windows)

Файл `.github/workflows/release.yml`, триггер — пуш тега `v*.*.*`. Собирает и публикует Windows-инсталлятор (NSIS `.exe`/`.msi`) как GitHub Release через `tauri-apps/tauri-action`:

```yaml
name: release
on:
  push:
    tags: ['v*.*.*']

jobs:
  release:
    runs-on: windows-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'Fincy ${{ github.ref_name }}'
          releaseDraft: true
          prerelease: false
```

`releaseDraft: true` — релиз создаётся черновиком, публикация вручную после проверки собранного инсталлятора. Версия приложения (`src-tauri/tauri.conf.json` → `version`) должна соответствовать тегу перед пушем тега. Секрет `GITHUB_TOKEN` доступен автоматически, отдельно настраивать не нужно; publish (`git push`, создание тега, пуш workflow-файла) — как обычно, по явному запросу пользователя, а не автоматически.

## Порядок реализации

0. Скопировать этот файл плана в репозиторий как `docs/PLAN.md` (для истории решений).
1. Скаффолд `npm create tauri-app@latest . -- --manager npm --template react-ts` (в пустой директории), проверить `npm run tauri dev` на дефолтном шаблоне.
2. `src-tauri/migrations/0001_initial.sql` — полная схема выше, включая seed-строки `settings` (`currency='RUB'`, `theme='dark'`, `recurring_reminder_lead_days='3'`) и дефолтный набор русскоязычных категорий (Еда, Транспорт, Жильё, Развлечения, Здоровье, Связь, Прочее / Зарплата, Подработка, Прочий доход).
3. `src-tauri/src/lib.rs` — регистрация `tauri_plugin_sql` (`add_migrations`) + `tauri_plugin_notification::init()`; `src-tauri/capabilities/default.json` — добавить `sql:default`, `sql:allow-execute`, `notification:default`.
4. `src/db/client.ts`, `src/types/index.ts`, `src/lib/money.ts`, `src/lib/dates.ts`.
5. `repositories/settings.ts`, `categories.ts`, `accounts.ts` (включая `account_ledger` VIEW и запрос баланса) — смоук-тест перед UI.
6. `src/lib/theme.tsx` (ThemeProvider, персист в `settings`, `document.documentElement.classList`), Tailwind v4 setup (`vite.config.ts`, `src/index.css` с `@custom-variant dark`, зелёный акцент через `@theme`).
7. `components/ui/*` примитивы на Radix, `components/layout/*` + `routes.tsx` (HashRouter) — каркас с пустыми страницами.
8. `pages/Settings.tsx` — валюта/тема первым делом (от них зависит форматирование на всех остальных страницах).
9. `pages/Accounts.tsx` + `repositories/accounts.ts` (баланс) + диалог корректировки — счета нужны до транзакций.
10. `pages/Transactions.tsx` + `repositories/{transactions,transfers,tags}.ts`.
11. `pages/Budgets.tsx` + `repositories/budgets.ts`.
12. `pages/Goals.tsx` + `repositories/goals.ts`.
13. `repositories/recurring.ts` + `lib/engine/recurringEngine.ts` (подключить в `App.tsx` на старте и на focus) + `pages/Recurring.tsx`.
14. `repositories/analytics.ts` + `components/charts/*` (см. dataviz-скил) + `pages/Analytics.tsx` + сборка `pages/Overview.tsx` последней (агрегирует всё).
15. Трей + автозапуск: `tauri-plugin-autostart` в `lib.rs` и `capabilities`, `TrayIconBuilder` + перехват `CloseRequested`, `src/lib/autostart.ts`, тумблер в `pages/Settings.tsx`.
16. `.github/workflows/release.yml` из раздела выше; финальная проверка версии в `tauri.conf.json` перед первым тегом.

## Проверка

`npm run tauri dev`: создать счёт → добавить доходную и расходную транзакцию → баланс счёта и бюджет по категории обновились → создать регулярный платёж с `next_due_date=сегодня` и убедиться, что транзакция сгенерировалась автоматически (и повторно при релонче) → переключить тему и убедиться, что она сохраняется после перезапуска → вручную скорректировать баланс накопительного счёта и проверить, что расчётный баланс (через `account_ledger`) отражает новое значение без отдельного поля баланса → создать цель, привязанную к накопительному счёту, проверить прогресс-бар → проверить графики на Overview/Analytics с реальными данными → закрыть окно крестиком и убедиться, что процесс не завершился, а иконка осталась в трее и клик по ней возвращает окно → проверить тумблер автозапуска в Settings.

## Технические риски, которые проверю по ходу реализации

Версии пакетов и API (`tauri-plugin-sql` 2.4.1, `recharts` 3.x — мажорный скачок относительно распространённой v2-документации, точная форма ответа `execute()`, capability-идентификаторы Tauri v2) сверю по фактически установленным `node_modules`/докам в момент установки, а не полагаюсь на память.
