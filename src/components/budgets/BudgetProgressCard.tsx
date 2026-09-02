import { Trash2 } from 'lucide-react';
import { getIcon } from '../../lib/icons';
import { formatMoney } from '../../lib/money';
import type { BudgetProgress } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function BudgetProgressCard({
  budget,
  currency,
  onEdit,
  onDelete,
}: {
  budget: BudgetProgress;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = getIcon(budget.category_icon);
  const pct = (budget.spent / budget.limit_amount) * 100;
  const over = budget.spent > budget.limit_amount;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${budget.category_color}22`, color: budget.category_color }}
          >
            <Icon size={16} />
          </span>
          <span className="font-medium text-ink-primary">{budget.category_name}</span>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={onEdit} className="text-xs font-medium text-accent-strong hover:underline">
            Изменить
          </button>
          <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Удалить">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <ProgressBar
        value={budget.spent}
        max={budget.limit_amount}
        colorClassName={over ? 'bg-status-critical' : 'bg-accent'}
      />
      <div className="flex items-center justify-between text-sm">
        <span className={over ? 'font-medium text-status-critical' : 'text-ink-secondary'}>
          {formatMoney(budget.spent, currency)} из {formatMoney(budget.limit_amount, currency)}
        </span>
        <span className="tabular-nums text-ink-muted">{pct.toFixed(0)}%</span>
      </div>
    </Card>
  );
}
