import { Archive, PenLine, Target } from 'lucide-react';
import { formatDate } from '../../lib/dates';
import { formatMoney } from '../../lib/money';
import type { GoalWithProgress } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function GoalCard({
  goal,
  currency,
  onEdit,
  onArchive,
}: {
  goal: GoalWithProgress;
  currency: string;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const pct = (goal.current_amount / goal.target_amount) * 100;
  const reached = goal.current_amount >= goal.target_amount;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
          <Target size={17} />
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Изменить">
            <PenLine size={15} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onArchive} aria-label="Архивировать">
            <Archive size={15} />
          </Button>
        </div>
      </div>
      <div>
        <div className="font-medium text-ink-primary">{goal.name}</div>
        <div className="text-xs text-ink-muted">{goal.account_name}</div>
      </div>
      <ProgressBar
        value={goal.current_amount}
        max={goal.target_amount}
        colorClassName={reached ? 'bg-status-good' : 'bg-accent'}
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-secondary tabular-nums">
          {formatMoney(goal.current_amount, currency)} из {formatMoney(goal.target_amount, currency)}
        </span>
        <span className="tabular-nums text-ink-muted">{pct.toFixed(0)}%</span>
      </div>
      {goal.deadline && <div className="text-xs text-ink-muted">До {formatDate(goal.deadline)}</div>}
    </Card>
  );
}
