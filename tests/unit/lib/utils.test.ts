import { describe, it, expect, vi } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getSeasonFromMonth,
  delay,
} from '../../../src/lib/utils';

describe('formatCurrency', () => {
  it('should format currency in Korean won', () => {
    expect(formatCurrency(45000)).toBe('₩45,000');
  });

  it('should format large amounts', () => {
    expect(formatCurrency(1250000)).toBe('₩1,250,000');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('₩0');
  });

  it('should not show decimal places', () => {
    expect(formatCurrency(45500.99)).toBe('₩45,501');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-10000)).toBe('-₩10,000');
  });
});

describe('formatNumber', () => {
  it('should format numbers less than 10000 with commas', () => {
    expect(formatNumber(5000)).toBe('5,000');
  });

  it('should format numbers >= 10000 with 만 unit', () => {
    expect(formatNumber(50000)).toBe('5.0만');
  });

  it('should format large numbers correctly', () => {
    expect(formatNumber(250000)).toBe('25.0만');
  });

  it('should handle exactly 10000', () => {
    expect(formatNumber(10000)).toBe('1.0만');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should show one decimal place for 만 unit', () => {
    expect(formatNumber(15500)).toBe('1.6만');
  });
});

describe('formatPercent', () => {
  it('should format percentage with one decimal place', () => {
    expect(formatPercent(3.5)).toBe('3.5%');
  });

  it('should format whole numbers', () => {
    expect(formatPercent(5)).toBe('5.0%');
  });

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('should round to one decimal place', () => {
    expect(formatPercent(4.567)).toBe('4.6%');
  });

  it('should handle very small numbers', () => {
    expect(formatPercent(0.03)).toBe('0.0%');
  });

  it('should handle large percentages', () => {
    expect(formatPercent(100)).toBe('100.0%');
  });
});

describe('getSeasonFromMonth', () => {
  it('should return spring for March', () => {
    expect(getSeasonFromMonth(3)).toBe('spring');
  });

  it('should return spring for April', () => {
    expect(getSeasonFromMonth(4)).toBe('spring');
  });

  it('should return spring for May', () => {
    expect(getSeasonFromMonth(5)).toBe('spring');
  });

  it('should return summer for June', () => {
    expect(getSeasonFromMonth(6)).toBe('summer');
  });

  it('should return summer for July', () => {
    expect(getSeasonFromMonth(7)).toBe('summer');
  });

  it('should return summer for August', () => {
    expect(getSeasonFromMonth(8)).toBe('summer');
  });

  it('should return fall for September', () => {
    expect(getSeasonFromMonth(9)).toBe('fall');
  });

  it('should return fall for October', () => {
    expect(getSeasonFromMonth(10)).toBe('fall');
  });

  it('should return fall for November', () => {
    expect(getSeasonFromMonth(11)).toBe('fall');
  });

  it('should return winter for December', () => {
    expect(getSeasonFromMonth(12)).toBe('winter');
  });

  it('should return winter for January', () => {
    expect(getSeasonFromMonth(1)).toBe('winter');
  });

  it('should return winter for February', () => {
    expect(getSeasonFromMonth(2)).toBe('winter');
  });

  it('should handle edge case month 0 as winter', () => {
    expect(getSeasonFromMonth(0)).toBe('winter');
  });

  it('should handle edge case month 13 as winter', () => {
    expect(getSeasonFromMonth(13)).toBe('winter');
  });
});

describe('delay', () => {
  it('should delay execution for specified milliseconds', async () => {
    const start = Date.now();
    await delay(100);
    const end = Date.now();
    const elapsed = end - start;

    // Allow some tolerance for timing (90-150ms is acceptable)
    expect(elapsed).toBeGreaterThanOrEqual(90);
    expect(elapsed).toBeLessThan(150);
  });

  it('should resolve after delay', async () => {
    const promise = delay(50);
    expect(promise).toBeInstanceOf(Promise);
    await expect(promise).resolves.toBeUndefined();
  });

  it('should work with 0 milliseconds', async () => {
    const start = Date.now();
    await delay(0);
    const end = Date.now();
    const elapsed = end - start;

    // Should complete almost immediately (< 10ms)
    expect(elapsed).toBeLessThan(10);
  });
});
