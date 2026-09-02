import { useState, type FormEvent } from 'react';
import { useAdjustBalance } from '../../hooks/useAccounts';
import { centsToUnits, formatMoney, unitsToCents } from '../../lib/money';
import type { AccountWithBalance } from '../../types';
import { Button } from '../ui/Button';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Field, Input } from '../ui/Input';

export function BalanceAdjustDialog({
  account,
  currency,
  open,
  onOpenChange,
}: {
  account: AccountWithBalance;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [value, setValue] = useState(String(centsToUnits(account.balance)));
  const [note, setNote] = useState('Ручная корректировка');
  const adjust = useAdjustBalance();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const units = parseFloat(value.replace(',', '.'));
    if (Number.isNaN(units)) return;
    adjust.mutate(
      { accountId: account.id, newBalance: unitsToCents(units), note },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={`Баланс: ${account.name}`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-ink-muted">
            Текущий расчётный баланс: {formatMoney(account.balance, currency)}. Укажите фактическую сумму — разница
            будет добавлена как корректировка.
          </p>
          <Field label="Фактический баланс">
            <Input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
          </Field>
          <Field label="Заметка">
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={adjust.isPending}>
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
