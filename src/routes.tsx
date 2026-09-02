import { Route, Routes } from 'react-router-dom';
import { AccountsPage } from './pages/Accounts';
import { AnalyticsPage } from './pages/Analytics';
import { BudgetsPage } from './pages/Budgets';
import { GoalsPage } from './pages/Goals';
import { OverviewPage } from './pages/Overview';
import { RecurringPage } from './pages/Recurring';
import { SettingsPage } from './pages/Settings';
import { TransactionsPage } from './pages/Transactions';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/accounts" element={<AccountsPage />} />
      <Route path="/budgets" element={<BudgetsPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/recurring" element={<RecurringPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
