import { useEffect, useState, type FormEvent } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { today } from '../../lib/dates';
import { unitsToCents } from '../../lib/money';
import { Button } from '../ui/Button';
import { Field, Input, NativeSelect } from '../ui/Input';

export function TransferForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (values: { fromAccountId: number; toAccountId: number; amount: number; occurredAt: string; note?: string }) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const { data: accounts = [] } = useAccounts();
  const [fromId, setFromId] = useState<number | ''>('');
  const [toId, setToId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [occurredAt, setOccurredAt] = useState(today());
  const [note, setNote] = useState('');

  useEffect(() => {
    if (accounts.length >= 2) {
      if (!fromId) setFromId(accounts[0].id);
      if (!toId) setToId(accounts[1].id);
    }
  }, [accounts, fromId, toId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const units = parseFloat(amount.replace(',', '.'));
    if (!fromId || !toId || fromId === toId || !units || units <= 0) return;
    onSubmit({
      fromAccountId: Number(fromId),
      toAccountId: Number(toId),
      amount: unitsToCents(units),
      occurredAt,
      note: note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Со счёта">
        <NativeSelect value={fromId} onChange={(e) => setFromId(Number(e.target.value))}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="На счёт">
        <NativeSelect value={toId} onChange={(e) => setToId(Number(e.target.value))}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      {fromId && toId && fromId === toId && (
        <p className="text-xs text-status-critical">Выберите разные счета</p>
      )}
      <Field label="Сумма">
        <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </Field>
      <Field label="Дата">
        <Input type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
      </Field>
      <Field label="Заметка">
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Необязательно" />
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={submitting}>
          Перевести
        </Button>
      </div>
    </form>
  );
}
