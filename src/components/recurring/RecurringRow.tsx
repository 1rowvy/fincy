import { PenLine, Trash2 } from 'lucide-react';
import { formatDate } from '../../lib/dates';
import { getIcon } from '../../lib/icons';
import { formatMoney } from '../../lib/money';
import type { Category, RecurringPayment } from '../../types';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';

const FREQUENCY_LABELS: Record<string, (n: number) => string> = {
  day: (n) => (n === 1 ? 'каждый день' : `каждые ${n} дн.`),
  week: (n) => (n === 1 ? 'каждую неделю' : `каждые ${n} нед.`),
  month: (n) => (n === 1 ? 'каждый месяц' : `каждые ${n} мес.`),
  year: (n) => (n === 1 ? 'каждый год' : `каждые ${n} г.`),
};

export function RecurringRow({
  rule,
  category,
  currency,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  rule: RecurringPayment;
  category?: Category;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (value: boolean) => void;
}) {
  const Icon = getIcon(category?.icon);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-hairline bg-surface-card p-4">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${category?.color ?? '#64748b'}22`, color: category?.color ?? '#64748b' }}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-ink-primary">{rule.name}</div>
        <div className="text-xs text-ink-muted">
          {FREQUENCY_LABELS[rule.frequency_unit](rule.frequency_interval)} · след. {formatDate(rule.next_due_date)}
        </div>
      </div>
      <div
        className={
          rule.type === 'income'
            ? 'w-28 text-right font-medium tabular-nums text-series-1'
            : 'w-28 text-right font-medium tabular-nums text-ink-primary'
        }
      >
        {rule.type === 'income' ? '+' : '-'}
        {formatMoney(rule.amount, currency)}
      </div>
      <Switch checked={!!rule.is_active} onCheckedChange={onToggleActive} />
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Изменить">
        <PenLine size={15} />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Удалить">
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
