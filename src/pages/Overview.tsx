import { AlertTriangle, ArrowLeftRight, Repeat, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeviationBarChart } from '../components/charts/DeviationBarChart';
import { StatCard } from '../components/charts/StatCard';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAccounts } from '../hooks/useAccounts';
import { useBalanceHistory, useMonthlyTrend } from '../hooks/useAnalytics';
import { useBudgetProgress } from '../hooks/useBudgets';
import { useUpcomingRecurring } from '../hooks/useRecurring';
import { useSettings } from '../hooks/useSettings';
import { useTransactions } from '../hooks/useTransactions';
import { currentMonth, formatDate, formatDateShort, monthsBack } from '../lib/dates';
import { getIcon } from '../lib/icons';
import { formatMoney } from '../lib/money';

function pctDelta(current: number, previous: number): number | undefined {
  if (!previous) return undefined;
  return ((current - previous) / previous) * 100;
}

export function OverviewPage() {
  const { data: settings } = useSettings();
  const currency = settings?.currency ?? 'RUB';

  const { data: accounts = [] } = useAccounts();
  const months = monthsBack(6);
  const { data: trend = [] } = useMonthlyTrend(months);
  const { data: balanceHistory = [] } = useBalanceHistory(30);
  const { data: budgets = [] } = useBudgetProgress(currentMonth());
  const { data: upcoming = [] } = useUpcomingRecurring(7);
  const { data: recent = [] } = useTransactions();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const thisMonth = trend[trend.length - 1];
  const prevMonth = trend[trend.length - 2];
  const income = thisMonth?.income ?? 0;
  const expense = thisMonth?.expense ?? 0;
  const net = income - expense;

  const overBudget = budgets.filter((b) => b.spent > b.limit_amount);

  const incomeSpark = trend.map((t) => ({ value: t.income }));
  const expenseSpark = trend.map((t) => ({ value: t.expense }));
  const balanceSpark = balanceHistory.map((p) => ({ value: p.balance }));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Общий баланс"
          value={formatMoney(totalBalance, currency)}
          icon={Wallet}
          sparklineData={balanceSpark}
          sparklineColor="var(--accent)"
        />
        <StatCard
          label="Доход в этом месяце"
          value={formatMoney(income, currency)}
          icon={TrendingUp}
          deltaPct={pctDelta(income, prevMonth?.income ?? 0)}
          sparklineData={incomeSpark}
          sparklineColor="var(--series-1)"
        />
        <StatCard
          label="Расход в этом месяце"
          value={formatMoney(expense, currency)}
          icon={TrendingDown}
          deltaPct={pctDelta(expense, prevMonth?.expense ?? 0) !== undefined ? -(pctDelta(expense, prevMonth?.expense ?? 0) as number) : undefined}
          sparklineData={expenseSpark}
          sparklineColor="var(--series-8)"
        />
        <StatCard
          label="Чистый результат"
          value={formatMoney(net, currency)}
          icon={ArrowLeftRight}
          sparklineData={trend.map((t) => ({ value: t.income - t.expense }))}
          sparklineColor={net >= 0 ? 'var(--status-good)' : 'var(--status-critical)'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Чистый результат по месяцам</CardTitle>
          </CardHeader>
          <DeviationBarChart data={trend} currency={currency} />
        </Card>

        <Card className="flex flex-col gap-3">
          <CardHeader>
            <CardTitle>Счета</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2.5">
            {accounts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="text-ink-primary">{a.name}</span>
                </span>
                <span className="font-medium tabular-nums text-ink-primary">{formatMoney(a.balance, currency)}</span>
              </div>
            ))}
            {accounts.length === 0 && (
              <p className="text-sm text-ink-muted">
                <Link to="/accounts" className="text-accent hover:underline">
                  Добавьте счёт
                </Link>
                , чтобы начать учёт.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <CardHeader>
            <CardTitle>Ближайшие платежи</CardTitle>
          </CardHeader>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-muted">Ничего не ожидается в ближайшие 7 дней.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {upcoming.map((r) => (
                <div key={r.id} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Repeat size={14} />
                  </span>
                  <span className="flex-1 text-ink-primary">{r.name}</span>
                  <span className="text-xs text-ink-muted">{formatDate(r.next_due_date)}</span>
                  <span className="font-medium tabular-nums text-ink-primary">{formatMoney(r.amount, currency)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

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
                    <AlertTriangle size={13} className="text-status-critical" />
                    <span className="flex-1 text-ink-primary">{b.category_name}</span>
                    <span className="font-medium tabular-nums text-status-critical">
                      {formatMoney(b.spent, currency)} / {formatMoney(b.limit_amount, currency)}
                    </span>
                  </div>
                  <ProgressBar value={b.spent} max={b.limit_amount} colorClassName="bg-status-critical" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние транзакции</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-2">
          {recent.slice(0, 6).map((t) => {
            const Icon = getIcon(t.category_icon);
            return (
              <div key={t.id} className="flex items-center gap-3 text-sm">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${t.category_color ?? '#64748b'}22`, color: t.category_color ?? '#64748b' }}
                >
                  <Icon size={14} />
                </span>
                <span className="flex-1 truncate text-ink-primary">{t.category_name ?? 'Без категории'}</span>
                <span className="text-xs text-ink-muted">{formatDateShort(t.occurred_at)}</span>
                <span
                  className={
                    t.type === 'income'
                      ? 'w-28 text-right font-medium tabular-nums text-series-1'
                      : 'w-28 text-right font-medium tabular-nums text-ink-primary'
                  }
                >
                  {t.type === 'income' ? '+' : '-'}
                  {formatMoney(t.amount, currency)}
                </span>
              </div>
            );
          })}
          {recent.length === 0 && <p className="text-sm text-ink-muted">Пока нет транзакций.</p>}
        </div>
      </Card>
    </div>
  );
}
