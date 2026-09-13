import { ArrowRight, Trash2 } from 'lucide-react';
import { formatDate } from '../../lib/dates';
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

  return (
    <Card className="flex flex-col gap-3">
      <CardHeader className="mb-0">
        <CardTitle>История переводов</CardTitle>
      </CardHeader>
      {transfers.length === 0 ? (
        <p className="text-sm text-ink-muted">Переводов пока не было.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {transfers.map((t) => (
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
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span>{formatDate(t.occurred_at)}</span>
                  {t.note && (
                    <>
                      <span>·</span>
                      <span className="truncate">{t.note}</span>
                    </>
                  )}
                </div>
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
      )}
    </Card>
  );
}
