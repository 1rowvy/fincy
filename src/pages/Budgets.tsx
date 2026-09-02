import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { BudgetForm } from '../components/budgets/BudgetForm';
import { BudgetProgressCard } from '../components/budgets/BudgetProgressCard';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { useBudgetProgress, useDeleteBudget, useUpsertBudget } from '../hooks/useBudgets';
import { useSettings } from '../hooks/useSettings';
import { currentMonth, formatMonthLabel, shiftMonth } from '../lib/dates';
import { unitsToCents } from '../lib/money';
import type { BudgetProgress } from '../types';

export function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth());
  const { data: budgets = [] } = useBudgetProgress(month);
  const { data: settings } = useSettings();
  const currency = settings?.currency ?? 'RUB';

  const upsert = useUpsertBudget();
  const remove = useDeleteBudget();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BudgetProgress | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="Предыдущий месяц">
            <ChevronLeft size={16} />
          </Button>
          <span className="min-w-40 text-center text-sm font-medium capitalize text-ink-primary">
            {formatMonthLabel(month)}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label="Следующий месяц">
            <ChevronRight size={16} />
          </Button>
        </div>
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={15} /> Бюджет
            </Button>
          </DialogTrigger>
          <DialogContent title="Новый бюджет">
            <BudgetForm
              submitting={upsert.isPending}
              onCancel={() => setCreating(false)}
              onSubmit={(v) =>
                upsert.mutate(
                  { categoryId: v.categoryId, month, limitAmount: unitsToCents(v.limitUnits) },
                  { onSuccess: () => setCreating(false) },
                )
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length === 0 ? (
        <p className="text-sm text-ink-muted">На этот месяц бюджеты не заданы.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => (
            <BudgetProgressCard
              key={b.id}
              budget={b}
              currency={currency}
              onEdit={() => setEditing(b)}
              onDelete={() => remove.mutate(b.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Изменить бюджет">
          {editing && (
            <BudgetForm
              initial={editing}
              submitting={upsert.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={(v) =>
                upsert.mutate(
                  { categoryId: v.categoryId, month, limitAmount: unitsToCents(v.limitUnits) },
                  { onSuccess: () => setEditing(null) },
                )
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
