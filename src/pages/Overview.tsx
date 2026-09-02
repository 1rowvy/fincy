import { AlertTriangle, ArrowUpRight, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DonutChart } from '../components/charts/DonutChart';
import { StatCard } from '../components/charts/StatCard';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAccounts } from '../hooks/useAccounts';
import { useCategoryBreakdown, useMonthlyTrend } from '../hooks/useAnalytics';
import { useBudgetProgress } from '../hooks/useBudgets';
import { useGoals } from '../hooks/useGoals';
import { useUpcomingRecurring } from '../hooks/useRecurring';
import { useSettings } from '../hooks/useSettings';
import { useTransactions } from '../hooks/useTransactions';
import { currentMonth, formatDateShort, monthsBack } from '../lib/dates';
import { getIcon } from '../lib/icons';
import { formatMoney } from '../lib/money';

function pctDelta(current: number, previous: number): number | undefined {
  if (!previous) return undefined;
  return ((current - previous) / previous) * 100;
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function OverviewPage() {
  const { data: settings } = useSettings();
  const currency = settings?.currency ?? 'RUB';

  const { data: accounts = [] } = useAccounts();
  const months = monthsBack(6);
  const { data: trend = [] } = useMonthlyTrend(months);
  const { data: budgets = [] } = useBudgetProgress(currentMonth());
  const { data: breakdown = [] } = useCategoryBreakdown(currentMonth(), 'expense');
  const { data: goals = [] } = useGoals();
  const { data: upcoming = [] } = useUpcomingRecurring(7);
  const { data: recent = [] } = useTransactions();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const thisMonth = trend[trend.length - 1];
  const prevMonth = trend[trend.length - 2];
  const income = thisMonth?.income ?? 0;
  const expense = thisMonth?.expense ?? 0;
  const net = income - expense;

  const limitTotal = budgets.reduce((s, b) => s + b.limit_amount, 0);
  const limitSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter((b) => b.spent > b.limit_amount);

  const activeGoals = goals.filter((g) => g.current_amount < g.target_amount).slice(0, 4);

  const savingsRate = income > 0 ? (net / income) * 100 : null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* Main column */}
      <div className="flex flex-col gap-4 xl:col-span-2">
        {/* Balance overview — the hero */}
        <Card className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>Общий баланс по всем счетам</CardTitle>
              <span className="font-display text-[34px] font-bold leading-none tabular-nums text-ink-primary">
                {formatMoney(totalBalance, currency)}
              </span>
            </div>
            {savingsRate !== null && (
              <span className="flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong">
                <ArrowUpRight size={13} />
                {Math.round(savingsRate)}% дохода отложено в этом месяце
              </span>
            )}
          </div>
          <TrendLineChart data={trend} currency={currency} />
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Spending limit */}
          <Card className="flex flex-col gap-4">
            <CardHeader>
              <CardTitle>Лимит расходов на месяц</CardTitle>
            </CardHeader>
            {limitTotal === 0 ? (
              <p className="text-sm text-ink-muted">
                <Link to="/budgets" className="text-accent-strong hover:underline">
                  Задайте бюджеты
                </Link>
                , чтобы следить за лимитом.
              </p>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums text-ink-primary">
                    {formatMoney(limitSpent, currency)}
                  </span>
                  <span className="text-sm text-ink-muted">
                    из {formatMoney(limitTotal, currency)}
                  </span>
                </div>
                <ProgressBar
                  value={limitSpent}
                  max={limitTotal}
                  colorClassName={limitSpent > limitTotal ? 'bg-status-critical' : 'bg-accent'}
                />
                <p className="text-xs text-ink-muted">
                  {limitSpent > limitTotal
                    ? `Лимит превышен на ${formatMoney(limitSpent - limitTotal, currency)}.`
                    : `Осталось ${formatMoney(limitTotal - limitSpent, currency)} до конца месяца.`}
                </p>
              </>
            )}
          </Card>

          {/* Upcoming payments */}
          <Card className="flex flex-col gap-3">
            <CardHeader>
              <CardTitle>Ближайшие платежи</CardTitle>
            </CardHeader>
            {upcoming.length === 0 ? (
              <p className="text-sm text-ink-muted">
                В ближайшие 7 дней ничего не списывается.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {upcoming.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                      <Repeat size={13} />
                    </span>
                    <span className="flex-1 truncate text-ink-primary">{r.name}</span>
                    <span className="font-medium tabular-nums text-ink-primary">
                      {formatMoney(r.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Expense breakdown */}
        <Card className="flex flex-col gap-3">
          <CardHeader>
            <CardTitle>Куда уходят деньги в этом месяце</CardTitle>
            <Link
              to="/analytics"
              className="text-xs font-medium text-accent-strong hover:underline"
            >
              Аналитика
            </Link>
          </CardHeader>
          <DonutChart
            data={breakdown.map((b) => ({
              name: b.name,
              color: b.color,
              icon: b.icon,
              total: b.total,
            }))}
            currency={currency}
          />
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Goals */}
          <Card className="flex flex-col gap-3">
            <CardHeader>
              <CardTitle>Цели</CardTitle>
              <Link to="/goals" className="text-xs font-medium text-accent-strong hover:underline">
                Все цели
              </Link>
            </CardHeader>
            {activeGoals.length === 0 ? (
              <p className="text-sm text-ink-muted">
                <Link to="/goals" className="text-accent-strong hover:underline">
                  Поставьте цель
                </Link>{' '}
                — и следите за прогрессом здесь.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {activeGoals.map((g) => (
                  <div key={g.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate text-ink-primary">{g.name}</span>
                      <span className="shrink-0 tabular-nums text-ink-muted">
                        {Math.round((g.current_amount / g.target_amount) * 100)}%
                      </span>
                    </div>
                    <ProgressBar value={g.current_amount} max={g.target_amount} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Budgets at risk */}
          <Card className="flex flex-col gap-3">
            <CardHeader>
              <CardTitle>Бюджеты под угрозой</CardTitle>
            </CardHeader>
            {overBudget.length === 0 ? (
              <p className="text-sm text-ink-muted">Все бюджеты в пределах лимита.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {overBudget.map((b) => (
                  <div key={b.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle size={13} className="shrink-0 text-status-critical" />
                      <span className="flex-1 truncate text-ink-primary">{b.category_name}</span>
                      <span className="font-medium tabular-nums text-status-critical">
                        {formatMoney(b.spent, currency)}
                      </span>
                    </div>
                    <ProgressBar
                      value={b.spent}
                      max={b.limit_amount}
                      colorClassName="bg-status-critical"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent transactions */}
        <Card className="flex flex-col gap-3">
          <CardHeader>
            <CardTitle>Последние транзакции</CardTitle>
            <Link
              to="/transactions"
              className="text-xs font-medium text-accent-strong hover:underline"
            >
              Все транзакции
            </Link>
          </CardHeader>
          {recent.length === 0 ? (
            <p className="text-sm text-ink-muted">Пока нет транзакций.</p>
          ) : (
            <div className="flex flex-col">
              {recent.slice(0, 6).map((t) => {
                const Icon = getIcon(t.category_icon);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 border-b border-border-hairline py-2.5 text-sm last:border-0"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${t.category_color ?? '#9a9a95'}22`,
                        color: t.category_color ?? '#9a9a95',
                      }}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink-primary">
                      {t.category_name ?? 'Без категории'}
                      {t.note && <span className="text-ink-muted"> · {t.note}</span>}
                    </span>
                    <span className="hidden w-24 text-right text-xs text-ink-muted sm:block">
                      {formatDateShort(t.occurred_at)}
                    </span>
                    <span
                      className={
                        t.type === 'income'
                          ? 'w-28 text-right font-semibold tabular-nums text-accent-strong'
                          : 'w-28 text-right font-semibold tabular-nums text-ink-primary'
                      }
                    >
                      {t.type === 'income' ? '+' : '−'}
                      {formatMoney(t.amount, currency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Right rail */}
      <div className="flex flex-col gap-4">
        {/* Month at a glance */}
        <Card className="flex flex-col divide-y divide-border-hairline">
          <StatCard
            label="Доход в этом месяце"
            value={formatMoney(income, currency)}
            deltaPct={pctDelta(income, prevMonth?.income ?? 0)}
          />
          <StatCard
            label="Расход в этом месяце"
            value={formatMoney(expense, currency)}
            deltaPct={pctDelta(expense, prevMonth?.expense ?? 0)}
            goodWhenUp={false}
          />
          <StatCard
            label="Чистый результат"
            value={formatMoney(net, currency)}
            hint={net >= 0 ? 'в плюсе' : 'в минусе'}
          />
        </Card>

        {/* The balance card */}
        <div className="relative overflow-hidden rounded-card bg-[linear-gradient(135deg,#b6dc45_0%,#8fc23c_50%,#6ea336_100%)] p-5 text-[#14250a] shadow-card">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/25 blur-2xl"
          />
          <div className="relative flex items-start justify-between">
            <span className="text-sm font-bold tracking-tight">Fincy</span>
            <span className="text-xs font-medium opacity-70">
              {accounts.length} {plural(accounts.length, 'счёт', 'счёта', 'счетов')}
            </span>
          </div>
          <div className="relative mt-10 flex flex-col gap-0.5">
            <span className="text-xs font-medium opacity-70">Свободные средства</span>
            <span className="font-display text-[28px] font-bold leading-none tabular-nums">
              {formatMoney(totalBalance, currency)}
            </span>
          </div>
          <div className="relative mt-4 text-sm tracking-[0.3em] opacity-55">···· ···· ····</div>
        </div>

        {/* Accounts */}
        <Card className="flex flex-col gap-3">
          <CardHeader>
            <CardTitle>Счета</CardTitle>
            <Link to="/accounts" className="text-xs font-medium text-accent-strong hover:underline">
              Все счета
            </Link>
          </CardHeader>
          {accounts.length === 0 ? (
            <p className="text-sm text-ink-muted">
              <Link to="/accounts" className="text-accent-strong hover:underline">
                Добавьте счёт
              </Link>
              , чтобы начать учёт.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {accounts.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: a.color }}
                    />
                    <span className="truncate text-ink-primary">{a.name}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-ink-primary">
                    {formatMoney(a.balance, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
