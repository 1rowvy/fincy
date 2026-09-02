import { useEffect, useState, type FormEvent } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { useCategoriesByType } from '../../hooks/useCategories';
import { today } from '../../lib/dates';
import { centsToUnits } from '../../lib/money';
import type { FrequencyUnit, RecurringPayment, TxType } from '../../types';
import { Button } from '../ui/Button';
import { Field, Input, NativeSelect } from '../ui/Input';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';

const FREQUENCY_LABELS: Record<FrequencyUnit, string> = {
  day: 'дней',
  week: 'недель',
  month: 'месяцев',
  year: 'лет',
};

export interface RecurringFormValues {
  name: string;
  accountId: number;
  categoryId: number | null;
  type: TxType;
  amountUnits: number;
  frequencyUnit: FrequencyUnit;
  frequencyInterval: number;
  nextDueDate: string;
  reminderLeadDays: number;
}

export function RecurringForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: RecurringPayment;
  onSubmit: (values: RecurringFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const [type, setType] = useState<TxType>(initial?.type ?? 'expense');
  const [name, setName] = useState(initial?.name ?? '');
  const [accountId, setAccountId] = useState<number | ''>(initial?.account_id ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(initial?.category_id ?? '');
  const [amount, setAmount] = useState(initial ? String(centsToUnits(initial.amount)) : '');
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>(initial?.frequency_unit ?? 'month');
  const [frequencyInterval, setFrequencyInterval] = useState(String(initial?.frequency_interval ?? 1));
  const [nextDueDate, setNextDueDate] = useState(initial?.next_due_date ?? today());
  const [reminderLeadDays, setReminderLeadDays] = useState(String(initial?.reminder_lead_days ?? 3));

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategoriesByType(type);

  useEffect(() => {
    if (!accountId && accounts.length) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amountUnits = parseFloat(amount.replace(',', '.'));
    const interval = parseInt(frequencyInterval, 10);
    const lead = parseInt(reminderLeadDays, 10);
    if (!name.trim() || !accountId || !amountUnits || amountUnits <= 0 || !interval) return;
    onSubmit({
      name: name.trim(),
      accountId: Number(accountId),
      categoryId: categoryId ? Number(categoryId) : null,
      type,
      amountUnits,
      frequencyUnit,
      frequencyInterval: interval,
      nextDueDate,
      reminderLeadDays: Number.isFinite(lead) ? lead : 3,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Tabs value={type} onValueChange={(v) => setType(v as TxType)}>
        <TabsList className="w-full">
          <TabsTrigger value="expense" className="flex-1">
            Расход
          </TabsTrigger>
          <TabsTrigger value="income" className="flex-1">
            Доход
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Field label="Название">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Например, Netflix" />
      </Field>
      <Field label="Сумма">
        <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Счёт">
        <NativeSelect value={accountId} onChange={(e) => setAccountId(Number(e.target.value))}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Категория">
        <NativeSelect value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
          <option value="">Без категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Повторять каждые">
          <Input
            type="number"
            min={1}
            value={frequencyInterval}
            onChange={(e) => setFrequencyInterval(e.target.value)}
          />
        </Field>
        <Field label="Период">
          <NativeSelect value={frequencyUnit} onChange={(e) => setFrequencyUnit(e.target.value as FrequencyUnit)}>
            {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <Field label="Следующая дата списания">
        <Input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />
      </Field>
      <Field label="Напоминать за (дней)">
        <Input type="number" min={0} value={reminderLeadDays} onChange={(e) => setReminderLeadDays(e.target.value)} />
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
