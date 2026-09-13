import { ChevronDown, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { TransactionForm, toCreateInput, type TransactionFormValues } from '../components/transactions/TransactionForm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Input, NativeSelect } from '../components/ui/Input';
import { useAccounts } from '../hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';
import { useCreateTransaction, useDeleteTransaction, useTransactions, useUpdateTransaction } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';
import { formatDateHeading, groupByDate } from '../lib/dates';
import { getIcon } from '../lib/icons';
import { formatMoney } from '../lib/money';
import type { TransactionFilters, TransactionWithRelations } from '../types';

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const { data: transactions = [] } = useTransactions(filters);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const currency = settings?.currency ?? 'RUB';

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TransactionWithRelations | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  const toggleDate = (date: string) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const handleCreate = (values: TransactionFormValues) => {
    createTx.mutate(toCreateInput(values), { onSuccess: () => setCreating(false) });
  };

  const handleUpdate = (values: TransactionFormValues) => {
    if (!editing) return;
    updateTx.mutate({ id: editing.id, input: toCreateInput(values) }, { onSuccess: () => setEditing(null) });
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <NativeSelect
            value={filters.accountId ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, accountId: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <option value="">Все счета</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="w-44">
          <NativeSelect
            value={filters.categoryId ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
          >
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="w-36">
          <NativeSelect
            value={filters.type ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, type: (e.target.value || undefined) as TransactionFilters['type'] }))}
          >
            <option value="">Все типы</option>
            <option value="income">Доход</option>
            <option value="expense">Расход</option>
          </NativeSelect>
        </div>
        <Input
          type="date"
          className="w-40"
          value={filters.from ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
        />
        <Input
          type="date"
          className="w-40"
          value={filters.to ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
        />
        <Input
          placeholder="Поиск по заметке"
          className="w-48"
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value || undefined }))}
        />
        <div className="ml-auto">
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={15} /> Добавить
              </Button>
            </DialogTrigger>
            <DialogContent title="Новая транзакция">
              <TransactionForm submitting={createTx.isPending} onCancel={() => setCreating(false)} onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        {transactions.length === 0 && <p className="text-sm text-ink-muted">Транзакций не найдено.</p>}
        {groupByDate(transactions, (t) => t.occurred_at).map((group) => {
          const net = group.items.reduce(
            (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
            0,
          );
          const collapsed = collapsedDates.has(group.date);
          return (
            <div key={group.date} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => toggleDate(group.date)}
                className="sticky top-0 z-10 flex w-full items-center justify-between gap-3 bg-surface-page py-2 text-left"
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold capitalize text-ink-primary">
                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-ink-muted transition-transform ${collapsed ? '-rotate-90' : ''}`}
                  />
                  {formatDateHeading(group.date)}
                </span>
                <span className="text-xs font-medium tabular-nums text-ink-muted">
                  {net > 0 ? '+' : net < 0 ? '−' : ''}
                  {formatMoney(Math.abs(net), currency)}
                </span>
              </button>
              {!collapsed && group.items.map((t) => {
                const Icon = getIcon(t.category_icon);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-border-hairline bg-surface-card p-3.5"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${t.category_color ?? '#64748b'}22`,
                        color: t.category_color ?? '#64748b',
                      }}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink-primary">
                        {t.category_name ?? 'Без категории'}
                        {t.note && <span className="ml-1.5 font-normal text-ink-muted">· {t.note}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <span>{t.account_name}</span>
                        {t.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <TagIcon size={11} />
                            {t.tags.map((tag) => tag.name).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={
                        t.type === 'income'
                          ? 'shrink-0 font-semibold tabular-nums text-series-1'
                          : 'shrink-0 font-semibold tabular-nums text-ink-primary'
                      }
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatMoney(t.amount, currency)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing(t)}
                      className="text-xs font-medium text-accent-strong hover:underline"
                    >
                      Изменить
                    </button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTx.mutate(t.id)} aria-label="Удалить">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Транзакция">
          {editing && (
            <TransactionForm
              initial={editing}
              submitting={updateTx.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
