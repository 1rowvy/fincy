import { useEffect, useState, type FormEvent } from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { useCategoriesByType } from '../../hooks/useCategories';
import { useCreateTag, useTags } from '../../hooks/useTags';
import { today } from '../../lib/dates';
import { centsToUnits, unitsToCents } from '../../lib/money';
import type { TransactionWithRelations, TxType } from '../../types';
import { Button } from '../ui/Button';
import { Field, Input, NativeSelect, Textarea } from '../ui/Input';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';

export interface TransactionFormValues {
  accountId: number;
  categoryId: number | null;
  type: TxType;
  amountUnits: number;
  occurredAt: string;
  note: string;
  tagIds: number[];
}

export function TransactionForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: TransactionWithRelations;
  onSubmit: (values: TransactionFormValues) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const [type, setType] = useState<TxType>(initial?.type ?? 'expense');
  const [accountId, setAccountId] = useState<number | ''>(initial?.account_id ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(initial?.category_id ?? '');
  const [amount, setAmount] = useState(initial ? String(centsToUnits(initial.amount)) : '');
  const [occurredAt, setOccurredAt] = useState(initial?.occurred_at ?? today());
  const [note, setNote] = useState(initial?.note ?? '');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initial?.tags.map((t) => t.id) ?? []);
  const [newTagName, setNewTagName] = useState('');

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategoriesByType(type);
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();

  useEffect(() => {
    if (!accountId && accounts.length) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  useEffect(() => {
    if (categoryId && !categories.some((c) => c.id === categoryId)) {
      setCategoryId('');
    }
  }, [categories, categoryId]);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleAddTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    const tag = await createTag.mutateAsync({ name });
    if (tag) setSelectedTagIds((prev) => [...prev, tag.id]);
    setNewTagName('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const amountUnits = parseFloat(amount.replace(',', '.'));
    if (!accountId || !amountUnits || amountUnits <= 0) return;
    onSubmit({
      accountId: Number(accountId),
      categoryId: categoryId ? Number(categoryId) : null,
      type,
      amountUnits,
      occurredAt,
      note,
      tagIds: selectedTagIds,
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

      <Field label="Сумма">
        <Input
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
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

      <Field label="Дата">
        <Input type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
      </Field>

      <Field label="Заметка">
        <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Необязательно" />
      </Field>

      <div>
        <div className="mb-1.5 text-xs font-medium text-ink-secondary">Теги</div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              type="button"
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={
                selectedTagIds.includes(tag.id)
                  ? 'rounded-full px-2.5 py-1 text-xs font-medium bg-accent text-accent-ink'
                  : 'rounded-full px-2.5 py-1 text-xs font-medium bg-surface-card-hover text-ink-secondary'
              }
            >
              {tag.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            placeholder="Новый тег"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={handleAddTag}>
            Добавить
          </Button>
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

export function toCreateInput(values: TransactionFormValues) {
  return {
    accountId: values.accountId,
    categoryId: values.categoryId,
    type: values.type,
    amount: unitsToCents(values.amountUnits),
    occurredAt: values.occurredAt,
    note: values.note || null,
    tagIds: values.tagIds,
  };
}
