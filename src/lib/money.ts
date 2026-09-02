const CURRENCY_LOCALE: Record<string, string> = {
  RUB: 'ru-RU',
  USD: 'en-US',
  EUR: 'de-DE',
};

export function centsToUnits(cents: number): number {
  return cents / 100;
}

export function unitsToCents(units: number): number {
  return Math.round(units * 100);
}

export function formatMoney(cents: number, currency: string): string {
  const locale = CURRENCY_LOCALE[currency] ?? 'ru-RU';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(centsToUnits(cents));
}

export function formatMoneyCompact(cents: number, currency: string): string {
  const locale = CURRENCY_LOCALE[currency] ?? 'ru-RU';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(centsToUnits(cents));
}
