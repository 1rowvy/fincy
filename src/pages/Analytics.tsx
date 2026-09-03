import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { CategoryDeltaList } from '../components/charts/CategoryDeltaList';
import { DeviationBarChart } from '../components/charts/DeviationBarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { SpendingHeatmap } from '../components/charts/SpendingHeatmap';
import { TopSpendingDays } from '../components/charts/TopSpendingDays';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import {
  useCategoryBreakdown,
  useCategoryDeltas,
  useDailySpending,
  useMonthlyTrend,
} from '../hooks/useAnalytics';
import { useSettings } from '../hooks/useSettings';
import { currentMonth, formatMonthLabel, monthsBack, shiftMonth } from '../lib/dates';
import type { TxType } from '../types';

function MonthNav({ month, onChange }: { month: string; onChange: (next: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => onChange(shiftMonth(month, -1))} aria-label="Предыдущий месяц">
        <ChevronLeft size={16} />
      </Button>
      <span className="min-w-32 text-center text-sm font-medium capitalize text-ink-primary">
        {formatMonthLabel(month)}
      </span>
      <Button variant="ghost" size="icon" onClick={() => onChange(shiftMonth(month, 1))} aria-label="Следующий месяц">
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

export function AnalyticsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [breakdownType, setBreakdownType] = useState<TxType>('expense');
  const { data: settings } = useSettings();
  const currency = settings?.currency ?? 'RUB';

  const months = monthsBack(6);
  const { data: trend = [] } = useMonthlyTrend(months);
  const { data: breakdown = [] } = useCategoryBreakdown(month, breakdownType);
  const { data: dailySpending = [] } = useDailySpending(month);
  const { data: categoryDeltas = [] } = useCategoryDeltas(month);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Доход и расход за последние 6 месяцев</CardTitle>
        </CardHeader>
        <TrendLineChart data={trend} currency={currency} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Чистый результат по месяцам</CardTitle>
        </CardHeader>
        <DeviationBarChart data={trend} currency={currency} />
      </Card>

      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-semibold text-ink-primary">Разбор месяца</h2>
        <MonthNav month={month} onChange={setMonth} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Календарь трат</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <SpendingHeatmap data={dailySpending} month={month} currency={currency} />
          {dailySpending.length > 0 && (
            <div className="min-w-0 flex-1">
              <h4 className="mb-3 text-[13px] font-medium text-ink-secondary">Крупнейшие траты</h4>
              <TopSpendingDays data={dailySpending} currency={currency} />
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>Разбивка по категориям</CardTitle>
          <Tabs value={breakdownType} onValueChange={(v) => setBreakdownType(v as TxType)}>
            <TabsList>
              <TabsTrigger value="expense">Расходы</TabsTrigger>
              <TabsTrigger value="income">Доходы</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <DonutChart
          data={breakdown.map((b) => ({ name: b.name, color: b.color, icon: b.icon, total: b.total }))}
          currency={currency}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сравнение с прошлым месяцем по категориям</CardTitle>
        </CardHeader>
        <CategoryDeltaList data={categoryDeltas} currency={currency} />
      </Card>
    </div>
  );
}
