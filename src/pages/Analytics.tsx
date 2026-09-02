import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DeviationBarChart } from '../components/charts/DeviationBarChart';
import { DonutChart } from '../components/charts/DonutChart';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useCategoryBreakdown, useMonthlyTrend } from '../hooks/useAnalytics';
import { useSettings } from '../hooks/useSettings';
import { currentMonth, formatMonthLabel, monthsBack, shiftMonth } from '../lib/dates';
import type { TxType } from '../types';

export function AnalyticsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [breakdownType, setBreakdownType] = useState<TxType>('expense');
  const { data: settings } = useSettings();
  const currency = settings?.currency ?? 'RUB';

  const months = monthsBack(6);
  const { data: trend = [] } = useMonthlyTrend(months);
  const { data: breakdown = [] } = useCategoryBreakdown(month, breakdownType);

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

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>Разбивка по категориям</CardTitle>
          <div className="flex items-center gap-3">
            <Tabs value={breakdownType} onValueChange={(v) => setBreakdownType(v as TxType)}>
              <TabsList>
                <TabsTrigger value="expense">Расходы</TabsTrigger>
                <TabsTrigger value="income">Доходы</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="Предыдущий месяц">
                <ChevronLeft size={16} />
              </Button>
              <span className="min-w-32 text-center text-sm font-medium capitalize text-ink-primary">
                {formatMonthLabel(month)}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label="Следующий месяц">
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
        <DonutChart
          data={breakdown.map((b) => ({ name: b.name, color: b.color, icon: b.icon, total: b.total }))}
          currency={currency}
        />
      </Card>
    </div>
  );
}
