import type { SaleRecord, Category, Season } from '../types';
import { creators } from './creators';
import { products } from './products';

/**
 * Category-specific conversion rates
 */
const conversionRates: Record<Category, [number, number]> = {
  Beauty: [3.0, 5.0],
  Fashion: [2.0, 4.0],
  Lifestyle: [2.5, 4.5],
  Food: [4.0, 6.0],
  Tech: [1.0, 3.0],
  HomeLiving: [2.0, 3.5],
  Health: [2.5, 4.0],
  BabyKids: [3.0, 5.0],
  Pet: [3.5, 5.5],
  Stationery: [2.0, 3.5],
};

/**
 * Commission rates by category
 */
const commissionRates: Record<Category, number> = {
  Beauty: 0.15,
  Fashion: 0.12,
  Lifestyle: 0.13,
  Food: 0.18,
  Tech: 0.10,
  HomeLiving: 0.14,
  Health: 0.16,
  BabyKids: 0.17,
  Pet: 0.15,
  Stationery: 0.12,
};

/**
 * Seasonal weights for categories
 */
const seasonalWeights: Record<Season, Partial<Record<Category, number>>> = {
  Spring: {
    Beauty: 1.3,
    Fashion: 1.2,
    Lifestyle: 1.0,
    Food: 0.9,
  },
  Summer: {
    Lifestyle: 1.3,
    Food: 1.2,
    Health: 1.1,
    Pet: 1.1,
  },
  Fall: {
    HomeLiving: 1.3,
    Health: 1.2,
    Fashion: 1.1,
    Stationery: 1.1,
  },
  Winter: {
    Tech: 1.3,
    BabyKids: 1.2,
    Pet: 1.1,
    HomeLiving: 1.1,
  },
};

/**
 * Get season from month
 */
function getSeasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}

/**
 * Random number between min and max (inclusive)
 */
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Price-based conversion rate multiplier
 */
function priceConversionMultiplier(price: number): number {
  if (price < 30000) return 1.5;
  if (price < 80000) return 1.0;
  return 0.7;
}

/**
 * Generate random date in the last 6 months
 */
function randomDateInLast6Months(): Date {
  const now = new Date('2026-02-01T00:00:00Z');
  const sixMonthsAgo = new Date('2025-08-01T00:00:00Z');
  const diff = now.getTime() - sixMonthsAgo.getTime();
  const randomTime = sixMonthsAgo.getTime() + Math.random() * diff;
  return new Date(randomTime);
}

/**
 * Generate sales history for all creators
 */
function generateSalesHistory(): SaleRecord[] {
  const salesHistory: SaleRecord[] = [];
  let saleIdCounter = 1;

  creators.forEach((creator) => {
    // Each creator has 30-80 sales records
    const salesCount = random(30, 80);

    for (let i = 0; i < salesCount; i++) {
      // Select a random product that matches creator's categories
      const matchingProducts = products.filter((p) =>
        creator.categories.includes(p.category)
      );

      // Fallback to any product if no match
      /* c8 ignore next 3 */
      const product =
        matchingProducts.length > 0
          ? matchingProducts[random(0, matchingProducts.length - 1)]
          : products[random(0, products.length - 1)];

      const soldAt = randomDateInLast6Months();
      const month = soldAt.getMonth() + 1;
      const season = getSeasonFromMonth(month);

      // Get seasonal weight
      const seasonWeight =
        seasonalWeights[season][product.category as Category] || 1.0;

      // Base conversion rate for this category
      const [minRate, maxRate] = conversionRates[product.category as Category];
      const baseConversionRate = randomFloat(minRate, maxRate);

      // Apply price multiplier and seasonal weight
      const finalConversionRate =
        baseConversionRate *
        priceConversionMultiplier(product.price) *
        seasonWeight;

      // Generate clicks and calculate quantity
      const clickCount = random(100, 1000);
      const quantity = Math.max(
        1,
        Math.floor(clickCount * (finalConversionRate / 100))
      );

      const revenue = quantity * product.price;
      const commissionRate = commissionRates[product.category as Category];
      const commission = Math.floor(revenue * commissionRate);

      // Calculate originalPrice (fallback if not available)
      const originalPrice = Math.floor(product.price * 1.2);
      const discountRate = Number(
        ((originalPrice - product.price) / originalPrice * 100).toFixed(1)
      );

      salesHistory.push({
        id: `sale-${String(saleIdCounter).padStart(5, '0')}`,
        creatorId: creator.id,
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: product.price,
        originalPrice,
        discountRate,
        quantity,
        revenue,
        commission,
        commissionRate,
        date: soldAt.toISOString(),
        platform: creator.platform,
        clickCount,
        conversionRate: Number(
          ((quantity / clickCount) * 100).toFixed(2)
        ),
      });

      saleIdCounter++;
    }
  });

  // Sort by date
  return salesHistory.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Mock sales history data
 * Generated: 30-80 records per creator, 6 months of data
 */
export const salesHistory: SaleRecord[] = generateSalesHistory();
