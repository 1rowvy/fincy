import { useEffect, useState, type FormEvent } from 'react';
import { useCategoriesByType } from '../../hooks/useCategories';
import { centsToUnits } from '../../lib/money';
import type { BudgetProgress } from '../../types';
import { Button } from '../ui/Button';
import { Field, Input, NativeSelect } from '../ui/Input';

export function BudgetForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: BudgetProgress;
  onSubmit: (values: { categoryId: number; limitUnits: number }) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const { data: categories = [] } = useCategoriesByType('expense');
  const [categoryId, setCategoryId] = useState<number | ''>(initial?.category_id ?? '');
  const [limit, setLimit] = useState(initial ? String(centsToUnits(initial.limit_amount)) : '');

  useEffect(() => {
    if (!categoryId && categories.length) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const units = parseFloat(limit.replace(',', '.'));
    if (!categoryId || !units || units <= 0) return;
    onSubmit({ categoryId: Number(categoryId), limitUnits: units });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Категория">
        <NativeSelect
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          disabled={!!initial}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Field label="Лимит на месяц">
        <Input inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} autoFocus />
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
