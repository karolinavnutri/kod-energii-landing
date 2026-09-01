export type TierId = 'start' | 'support' | 'personal';

export interface Tier {
  id: TierId;
  name: string;
  discountPriceRub: number;
  normalPriceRub: number;
  description: string;
  features: string[];
  seatLimit?: number;
}

export const TIERS: Record<TierId, Tier> = {
  start: {
    id: 'start',
    name: 'Старт',
    discountPriceRub: 5000,
    normalPriceRub: 6500,
    description: 'Пройти в своём темпе, самостоятельно',
    features: ['4 записанных урока по неделям', 'Домашние задания и материалы к каждой неделе', 'Доступ 3 месяца'],
  },
  support: {
    id: 'support',
    name: 'С сопровождением',
    discountPriceRub: 9000,
    normalPriceRub: 11700,
    description: 'Не бросить на середине — с поддержкой и трекером',
    features: [
      '4 записанных урока по неделям',
      'Домашние задания и материалы к каждой неделе',
      'Чат с группой',
      'Трекер энергии — видно прогресс, а не только ощущения',
      'Доступ 3 месяца',
    ],
  },
  personal: {
    id: 'personal',
    name: 'Персональный',
    discountPriceRub: 40000,
    normalPriceRub: 52000,
    description: 'Максимальный результат — с личным разбором',
    features: [
      'Всё из тарифа «С сопровождением»',
      'Личное ведение — Каролина разбирает именно твою ситуацию',
      'Разбор твоих анализов',
      'Персональные корректировки протокола',
      'Доступ 3 месяца',
    ],
    seatLimit: 3,
  },
};

export const TIER_ORDER: TierId[] = ['start', 'support', 'personal'];

export function isTierId(value: string): value is TierId {
  return value === 'start' || value === 'support' || value === 'personal';
}

// TODO: exact deadline time-of-day for the discount was not finalized as of 2026-08-30 —
// defaulting to end of day Moscow time. Confirm with the business owner before launch.
export const DISCOUNT_DEADLINE_ISO = '2026-09-18T23:59:59+03:00';

// The FAQ was written assuming 3 months of access from purchase; there is no fixed
// calendar cutoff (unlike the discount deadline), so this is informational copy only.
export const ACCESS_DURATION_MONTHS = 3;
