import { Archive, PenLine, Wallet } from 'lucide-react';
import { useState } from 'react';
import { formatMoney } from '../../lib/money';
import type { AccountWithBalance } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { BalanceAdjustDialog } from './BalanceAdjustDialog';

const TYPE_LABELS: Record<string, string> = {
  cash: 'Наличные',
  checking: 'Дебетовый счёт',
  card: 'Карта',
  savings: 'Накопления',
  other: 'Другое',
};

export function AccountCard({
  account,
  currency,
  onEdit,
  onArchive,
}: {
  account: AccountWithBalance;
  currency: string;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const [adjustOpen, setAdjustOpen] = useState(false);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${account.color}22`, color: account.color }}
        >
          <Wallet size={17} />
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Изменить">
            <PenLine size={15} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onArchive} aria-label="Архивировать">
            <Archive size={15} />
          </Button>
        </div>
      </div>
      <div>
        <div className="text-sm text-ink-secondary">{account.name}</div>
        <div className="text-xl font-semibold tabular-nums text-ink-primary">
          {formatMoney(account.balance, currency)}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-muted">{TYPE_LABELS[account.type] ?? account.type}</span>
        {account.type === 'savings' && (
          <button
            type="button"
            onClick={() => setAdjustOpen(true)}
            className="text-xs font-medium text-accent-strong hover:underline"
          >
            Изменить баланс
          </button>
        )}
      </div>
      {adjustOpen && (
        <BalanceAdjustDialog account={account} currency={currency} open={adjustOpen} onOpenChange={setAdjustOpen} />
      )}
    </Card>
  );
}
