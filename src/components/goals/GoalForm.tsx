import { useEffect, useState, type FormEvent } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { centsToUnits } from '../../lib/money';
import type { GoalWithProgress } from '../../types';
import { Button } from '../ui/Button';
import { Field, Input, NativeSelect } from '../ui/Input';

export function GoalForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: GoalWithProgress;
  onSubmit: (values: { name: string; accountId: number; targetUnits: number; deadline: string | null }) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const { data: accounts = [] } = useAccounts();
  const [name, setName] = useState(initial?.name ?? '');
  const [accountId, setAccountId] = useState<number | ''>(initial?.account_id ?? '');
  const [target, setTarget] = useState(initial ? String(centsToUnits(initial.target_amount)) : '');
  const [deadline, setDeadline] = useState(initial?.deadline ?? '');

  useEffect(() => {
    if (!accountId && accounts.length) {
      const savings = accounts.find((a) => a.type === 'savings') ?? accounts[0];
      setAccountId(savings.id);
    }
  }, [accounts, accountId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const units = parseFloat(target.replace(',', '.'));
    if (!name.trim() || !accountId || !units || units <= 0) return;
    onSubmit({ name: name.trim(), accountId: Number(accountId), targetUnits: units, deadline: deadline || null });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Название цели">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Например, Отпуск" />
      </Field>
      <Field label="Связанный счёт (накопления)">
        <NativeSelect value={accountId} onChange={(e) => setAccountId(Number(e.target.value))}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Целевая сумма">
        <Input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
      </Field>
      <Field label="Дедлайн (необязательно)">
        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={submitting}>
          Сохранить
        </Button>
      </div>
    </form>
  );
}
