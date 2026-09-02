import { Plus } from 'lucide-react';
import { useState } from 'react';
import { RecurringForm, type RecurringFormValues } from '../components/recurring/RecurringForm';
import { RecurringRow } from '../components/recurring/RecurringRow';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { useCategories } from '../hooks/useCategories';
import {
  useCreateRecurring,
  useDeleteRecurring,
  useRecurring,
  useSetRecurringActive,
  useUpdateRecurring,
} from '../hooks/useRecurring';
import { useSettings } from '../hooks/useSettings';
import { unitsToCents } from '../lib/money';
import type { RecurringPayment } from '../types';

function toInput(v: RecurringFormValues) {
  return {
    name: v.name,
    accountId: v.accountId,
    categoryId: v.categoryId,
    type: v.type,
    amount: unitsToCents(v.amountUnits),
    frequencyUnit: v.frequencyUnit,
    frequencyInterval: v.frequencyInterval,
    nextDueDate: v.nextDueDate,
    reminderLeadDays: v.reminderLeadDays,
  };
}

export function RecurringPage() {
  const { data: rules = [] } = useRecurring();
  const { data: categories = [] } = useCategories(true);
  const { data: settings } = useSettings();
  const currency = settings?.currency ?? 'RUB';

  const create = useCreateRecurring();
  const update = useUpdateRecurring();
  const remove = useDeleteRecurring();
  const setActive = useSetRecurringActive();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<RecurringPayment | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={15} /> Платёж
            </Button>
          </DialogTrigger>
          <DialogContent title="Новый регулярный платёж">
            <RecurringForm
              submitting={create.isPending}
              onCancel={() => setCreating(false)}
              onSubmit={(v) => create.mutate(toInput(v), { onSuccess: () => setCreating(false) })}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-2">
        {rules.length === 0 && <p className="text-sm text-ink-muted">Регулярных платежей пока нет.</p>}
        {rules.map((rule) => (
          <RecurringRow
            key={rule.id}
            rule={rule}
            category={categories.find((c) => c.id === rule.category_id)}
            currency={currency}
            onEdit={() => setEditing(rule)}
            onDelete={() => remove.mutate(rule.id)}
            onToggleActive={(v) => setActive.mutate({ id: rule.id, isActive: v })}
          />
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Изменить платёж">
          {editing && (
            <RecurringForm
              initial={editing}
              submitting={update.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={(v) => update.mutate({ id: editing.id, input: toInput(v) }, { onSuccess: () => setEditing(null) })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
