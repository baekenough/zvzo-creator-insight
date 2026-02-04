import type { Creator, Product, SaleRecord, Category } from '../types';
import { creators } from './creators';
import { products } from './products';
import { salesHistory } from './sales-history';

/**
 * Get all creators
 */
export function getCreators(): Creator[] {
  return creators;
}

/**
 * Alias for getCreators (for API routes)
 */
export const getAllCreators = getCreators;

/**
 * Get creator by ID
 */
export function getCreatorById(id: string): Creator | undefined {
  return creators.find((c) => c.id === id);
}

/**
 * Get all products
 */
export function getProducts(): Product[] {
  return products;
}

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category);
}

/**
 * Get all sales history
 */
export function getSalesHistory(): SaleRecord[] {
  return salesHistory;
}

/**
 * Get sales history by creator ID
 */
export function getSalesByCreator(creatorId: string): SaleRecord[] {
  return salesHistory.filter((s) => s.creatorId === creatorId);
}

/**
 * Get sales history by product ID
 */
export function getSalesByProduct(productId: string): SaleRecord[] {
  return salesHistory.filter((s) => s.productId === productId);
}

/**
 * Get creator statistics
 */
export interface CreatorStats {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  averageConversionRate: number;
  topCategory: Category | null;
  topProduct: {
    id: string;
    name: string;
    salesCount: number;
  } | null;
}

export function getCreatorStats(creatorId: string): CreatorStats | null {
  const creator = getCreatorById(creatorId);
  if (!creator) return null;

  const sales = getSalesByCreator(creatorId);

  if (sales.length === 0) {
    return {
      totalSales: 0,
      totalRevenue: 0,
      totalCommission: 0,
      averageConversionRate: 0,
      topCategory: null,
      topProduct: null,
    };
  }

  const totalSales = sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
  const totalCommission = sales.reduce((sum, s) => sum + s.commission, 0);
  const averageConversionRate =
    sales.reduce((sum, s) => sum + s.conversionRate, 0) / sales.length;

  // Find top category
  const categoryCounts: Record<string, number> = {};
  sales.forEach((sale) => {
    const product = getProductById(sale.productId);
    if (product) {
      categoryCounts[product.category] =
        (categoryCounts[product.category] || 0) + sale.quantity;
    }
  });

  const topCategory =
    Object.entries(categoryCounts).length > 0
      ? (Object.entries(categoryCounts).sort(
          (a, b) => b[1] - a[1]
        )[0][0] as Category)
      : null;

  // Find top product
  const productCounts: Record<string, number> = {};
  sales.forEach((sale) => {
    productCounts[sale.productId] =
      (productCounts[sale.productId] || 0) + sale.quantity;
  });

  const topProductEntry =
    Object.entries(productCounts).length > 0
      ? Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]
      : /* c8 ignore next */ null;

  const topProduct = topProductEntry
    ? {
        id: topProductEntry[0],
        name: getProductById(topProductEntry[0])?.name || 'Unknown',
        salesCount: topProductEntry[1],
      }
    : /* c8 ignore next */ null;

  return {
    totalSales,
    totalRevenue,
    totalCommission,
    averageConversionRate: Number(averageConversionRate.toFixed(2)),
    topCategory,
    topProduct,
  };
}

/**
 * Re-export data arrays
 */
export { creators, products, salesHistory };
