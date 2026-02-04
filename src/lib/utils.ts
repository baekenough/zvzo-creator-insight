import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}만`;
  }
  return new Intl.NumberFormat('ko-KR').format(num);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getSeasonFromMonth(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
