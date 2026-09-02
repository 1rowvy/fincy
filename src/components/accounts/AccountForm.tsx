import { useState, type FormEvent } from 'react';
import { centsToUnits, unitsToCents } from '../../lib/money';
import type { Account, AccountType } from '../../types';
import { Button } from '../ui/Button';
import { Field, Input, NativeSelect } from '../ui/Input';

const TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Наличные',
  checking: 'Дебетовый счёт',
  card: 'Карта',
  savings: 'Накопления',
  other: 'Другое',
};

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#eab308', '#06b6d4', '#64748b'];

export interface AccountFormValues {
  name: string;
  type: AccountType;
  initialBalanceUnits: number;
  color: string;
}

export function AccountForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Account;
  onSubmit: (values: AccountFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<AccountType>(initial?.type ?? 'card');
  const [initialBalance, setInitialBalance] = useState(
    initial ? String(centsToUnits(initial.initial_balance)) : '0',
  );
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      type,
      initialBalanceUnits: parseFloat(initialBalance.replace(',', '.')) || 0,
      color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Название">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Например, Тинькофф" />
      </Field>
      <Field label="Тип счёта">
        <NativeSelect value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      {!initial && (
        <Field label="Начальный баланс">
          <Input
            inputMode="decimal"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
          />
        </Field>
      )}
      <div>
        <div className="mb-1.5 text-xs font-medium text-ink-secondary">Цвет</div>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full ring-offset-2 ring-offset-surface-overlay"
              style={{ backgroundColor: c, outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
            />
          ))}
        </div>
      </div>
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

export function toAccountInput(values: AccountFormValues) {
  return {
    name: values.name,
    type: values.type,
    initialBalance: unitsToCents(values.initialBalanceUnits),
    color: values.color,
  };
}
