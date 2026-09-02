import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { advanceDate, today } from '../dates';
import { formatMoney } from '../money';
import { createTransaction } from '../../repositories/transactions';
import { advanceDueDate, listRecurring, markReminded } from '../../repositories/recurring';
import { getSettings } from '../../repositories/settings';

const MAX_CATCHUP_ITERATIONS = 60;

async function notify(title: string, body: string) {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      granted = (await requestPermission()) === 'granted';
    }
    if (granted) {
      sendNotification({ title, body });
    }
  } catch {
    // уведомления недоступны (например, нет прав ОС) — тихо игнорируем
  }
}

export interface RecurringEngineResult {
  generatedCount: number;
  remindedNames: string[];
}

export async function runRecurringEngine(): Promise<RecurringEngineResult> {
  const rules = await listRecurring(false);
  const settings = await getSettings();
  const todayDate = today();
  let generatedCount = 0;
  const remindedNames: string[] = [];

  for (const rule of rules) {
    let nextDue = rule.next_due_date;
    let iterations = 0;
    let lastGenerated: string | null = rule.last_generated_date;

    while (nextDue <= todayDate && iterations < MAX_CATCHUP_ITERATIONS) {
      await createTransaction({
        accountId: rule.account_id,
        categoryId: rule.category_id,
        type: rule.type,
        amount: rule.amount,
        occurredAt: nextDue,
        note: `Авто: ${rule.name}`,
        recurringPaymentId: rule.id,
      });
      generatedCount++;
      lastGenerated = nextDue;
      nextDue = advanceDate(nextDue, rule.frequency_unit, rule.frequency_interval);
      iterations++;
    }

    if (iterations > 0) {
      await advanceDueDate(rule.id, nextDue, lastGenerated ?? todayDate);
    }

    const leadDays = rule.reminder_lead_days;
    const daysUntilDue = Math.ceil(
      (new Date(nextDue).getTime() - new Date(todayDate).getTime()) / (1000 * 60 * 60 * 24),
    );
    const alreadyRemindedToday = rule.last_reminded_date === todayDate;
    if (daysUntilDue >= 0 && daysUntilDue <= leadDays && !alreadyRemindedToday) {
      await markReminded(rule.id, todayDate);
      remindedNames.push(rule.name);
      await notify(
        'Скоро списание',
        `${rule.name} — ${formatMoney(rule.amount, settings.currency)}, ${
          daysUntilDue === 0 ? 'сегодня' : `через ${daysUntilDue} дн.`
        }`,
      );
    }
  }

  return { generatedCount, remindedNames };
}
