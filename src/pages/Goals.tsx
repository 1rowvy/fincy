import { Plus } from 'lucide-react';
import { useState } from 'react';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalForm } from '../components/goals/GoalForm';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { useArchiveGoal, useCreateGoal, useGoals, useUpdateGoal } from '../hooks/useGoals';
import { useSettings } from '../hooks/useSettings';
import { unitsToCents } from '../lib/money';
import type { GoalWithProgress } from '../types';

export function GoalsPage() {
  const { data: goals = [] } = useGoals();
  const { data: settings } = useSettings();
  const currency = settings?.currency ?? 'RUB';

  const create = useCreateGoal();
  const update = useUpdateGoal();
  const archive = useArchiveGoal();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GoalWithProgress | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={15} /> Цель
            </Button>
          </DialogTrigger>
          <DialogContent title="Новая цель">
            <GoalForm
              submitting={create.isPending}
              onCancel={() => setCreating(false)}
              onSubmit={(v) =>
                create.mutate(
                  { name: v.name, accountId: v.accountId, targetAmount: unitsToCents(v.targetUnits), deadline: v.deadline },
                  { onSuccess: () => setCreating(false) },
                )
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-ink-muted">Пока нет целей накоплений.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} currency={currency} onEdit={() => setEditing(g)} onArchive={() => archive.mutate(g.id)} />
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Изменить цель">
          {editing && (
            <GoalForm
              initial={editing}
              submitting={update.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={(v) =>
                update.mutate(
                  {
                    id: editing.id,
                    input: { name: v.name, accountId: v.accountId, targetAmount: unitsToCents(v.targetUnits), deadline: v.deadline },
                  },
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
