import { ArrowRight, ChevronDown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatDateHeading, groupByDate } from '../../lib/dates';
import { formatMoney } from '../../lib/money';
import type { AccountWithBalance, Transfer } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle } from '../ui/Card';

export function TransferHistory({
  transfers,
  accounts,
  currency,
  onDelete,
}: {
  transfers: Transfer[];
  accounts: AccountWithBalance[];
  currency: string;
  onDelete: (id: number) => void;
}) {
  const accountName = (id: number) => accounts.find((a) => a.id === id)?.name ?? 'Удалённый счёт';
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  const toggleDate = (date: string) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  return (
    <Card className="flex flex-col gap-3">
      <CardHeader className="mb-0">
        <CardTitle>История переводов</CardTitle>
      </CardHeader>
      {transfers.length === 0 ? (
        <p className="text-sm text-ink-muted">Переводов пока не было.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {groupByDate(transfers, (t) => t.occurred_at).map((group) => {
            const total = group.items.reduce((sum, t) => sum + t.amount, 0);
            const collapsed = collapsedDates.has(group.date);
            return (
              <div key={group.date} className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => toggleDate(group.date)}
                  className="sticky top-0 z-10 flex w-full items-center justify-between gap-3 bg-surface-card py-2 text-left"
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold capitalize text-ink-primary">
                    <ChevronDown
                      size={14}
                      className={`shrink-0 text-ink-muted transition-transform ${collapsed ? '-rotate-90' : ''}`}
                    />
                    {formatDateHeading(group.date)}
                  </span>
                  <span className="text-xs font-medium tabular-nums text-ink-muted">
                    {formatMoney(total, currency)}
                  </span>
                </button>
                {!collapsed && group.items.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-border-hairline bg-surface-card p-3.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate text-sm font-medium text-ink-primary">
                        <span className="truncate">{accountName(t.from_account_id)}</span>
                        <ArrowRight size={13} className="shrink-0 text-ink-muted" />
                        <span className="truncate">{accountName(t.to_account_id)}</span>
                      </div>
                      {t.note && <div className="truncate text-xs text-ink-muted">{t.note}</div>}
                    </div>
                    <div className="shrink-0 font-semibold tabular-nums text-ink-primary">
                      {formatMoney(t.amount, currency)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} aria-label="Удалить">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
