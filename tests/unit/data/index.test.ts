import { describe, it, expect, vi } from 'vitest';
import {
  getCreators,
  getAllCreators,
  getCreatorById,
  getProducts,
  getProductById,
  getProductsByCategory,
  getSalesHistory,
  getSalesByCreator,
  getSalesByProduct,
  getCreatorStats,
} from '@/data';
import * as dataModule from '@/data';

describe('data/index.ts', () => {
  describe('getCreators and getAllCreators', () => {
    it('should return all creators', () => {
      const creators = getCreators();
      expect(creators).toBeDefined();
      expect(Array.isArray(creators)).toBe(true);
      expect(creators.length).toBeGreaterThan(0);
    });

    it('getAllCreators should be an alias for getCreators', () => {
      const creators = getCreators();
      const allCreators = getAllCreators();
      expect(creators).toEqual(allCreators);
    });
  });

  describe('getCreatorById', () => {
    it('should return creator by ID', () => {
      const creators = getCreators();
      const firstCreator = creators[0];
      const found = getCreatorById(firstCreator.id);
      expect(found).toEqual(firstCreator);
    });

    it('should return undefined for non-existent ID', () => {
      const found = getCreatorById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getProducts', () => {
    it('should return all products', () => {
      const products = getProducts();
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });
  });

  describe('getProductById', () => {
    it('should return product by ID', () => {
      const products = getProducts();
      const firstProduct = products[0];
      const found = getProductById(firstProduct.id);
      expect(found).toEqual(firstProduct);
    });

    it('should return undefined for non-existent ID', () => {
      const found = getProductById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products for a specific category', () => {
      const beautyProducts = getProductsByCategory('Beauty');
      expect(beautyProducts).toBeDefined();
      expect(Array.isArray(beautyProducts)).toBe(true);

      beautyProducts.forEach((product) => {
        expect(product.category).toBe('Beauty');
      });
    });

    it('should return empty array for category with no products', () => {
      // @ts-ignore - Testing with invalid category
      const products = getProductsByCategory('NonExistentCategory');
      expect(products).toEqual([]);
    });

    it('should return products for all valid categories', () => {
      const categories = ['Beauty', 'Fashion', 'Food', 'Tech', 'Lifestyle'] as const;

      categories.forEach((category) => {
        const products = getProductsByCategory(category);
        expect(Array.isArray(products)).toBe(true);

        if (products.length > 0) {
          products.forEach((product) => {
            expect(product.category).toBe(category);
          });
        }
      });
    });
  });

  describe('getSalesHistory', () => {
    it('should return all sales history', () => {
      const sales = getSalesHistory();
      expect(sales).toBeDefined();
      expect(Array.isArray(sales)).toBe(true);
      expect(sales.length).toBeGreaterThan(0);
    });
  });

  describe('getSalesByCreator', () => {
    it('should return sales for a specific creator', () => {
      const creators = getCreators();
      const firstCreator = creators[0];
      const sales = getSalesByCreator(firstCreator.id);

      expect(Array.isArray(sales)).toBe(true);

      sales.forEach((sale) => {
        expect(sale.creatorId).toBe(firstCreator.id);
      });
    });

    it('should return empty array for creator with no sales', () => {
      const sales = getSalesByCreator('non-existent-creator');
      expect(sales).toEqual([]);
    });
  });

  describe('getSalesByProduct', () => {
    it('should return sales for a specific product', () => {
      const products = getProducts();
      const firstProduct = products[0];
      const sales = getSalesByProduct(firstProduct.id);

      expect(Array.isArray(sales)).toBe(true);

      sales.forEach((sale) => {
        expect(sale.productId).toBe(firstProduct.id);
      });
    });

    it('should return empty array for product with no sales', () => {
      const sales = getSalesByProduct('non-existent-product');
      expect(sales).toEqual([]);
    });
  });

  describe('getCreatorStats', () => {
    it('should return null for non-existent creator', () => {
      const stats = getCreatorStats('non-existent-creator');
      expect(stats).toBeNull();
    });

    it('should return stats for existing creator', () => {
      const creators = getCreators();
      const creatorWithSales = creators.find((c) => {
        const sales = getSalesByCreator(c.id);
        return sales.length > 0;
      });

      if (creatorWithSales) {
        const stats = getCreatorStats(creatorWithSales.id);
        expect(stats).not.toBeNull();

        if (stats) {
          expect(stats.totalSales).toBeGreaterThan(0);
          expect(stats.totalRevenue).toBeGreaterThan(0);
          expect(stats.totalCommission).toBeGreaterThan(0);
          expect(stats.averageConversionRate).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should return zero stats for creator with no sales', () => {
      const creators = getCreators();
      const creatorWithoutSales = creators.find((c) => {
        const sales = getSalesByCreator(c.id);
        return sales.length === 0;
      });

      if (creatorWithoutSales) {
        const stats = getCreatorStats(creatorWithoutSales.id);
        expect(stats).not.toBeNull();

        if (stats) {
          expect(stats.totalSales).toBe(0);
          expect(stats.totalRevenue).toBe(0);
          expect(stats.totalCommission).toBe(0);
          expect(stats.averageConversionRate).toBe(0);
          expect(stats.topCategory).toBeNull();
          expect(stats.topProduct).toBeNull();
        }
      }
    });

    it('should calculate totals correctly', () => {
      const creators = getCreators();
      const creatorWithSales = creators.find((c) => {
        const sales = getSalesByCreator(c.id);
        return sales.length > 0;
      });

      if (creatorWithSales) {
        const stats = getCreatorStats(creatorWithSales.id);
        const sales = getSalesByCreator(creatorWithSales.id);

        if (stats && sales.length > 0) {
          const expectedTotalSales = sales.reduce((sum, s) => sum + s.quantity, 0);
          const expectedTotalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
          const expectedTotalCommission = sales.reduce((sum, s) => sum + s.commission, 0);

          expect(stats.totalSales).toBe(expectedTotalSales);
          expect(stats.totalRevenue).toBe(expectedTotalRevenue);
          expect(stats.totalCommission).toBe(expectedTotalCommission);
        }
      }
    });

    it('should calculate average conversion rate correctly', () => {
      const creators = getCreators();
      const creatorWithSales = creators.find((c) => {
        const sales = getSalesByCreator(c.id);
        return sales.length > 0;
      });

      if (creatorWithSales) {
        const stats = getCreatorStats(creatorWithSales.id);
        const sales = getSalesByCreator(creatorWithSales.id);

        if (stats && sales.length > 0) {
          const expectedAvg = sales.reduce((sum, s) => sum + s.conversionRate, 0) / sales.length;
          expect(stats.averageConversionRate).toBe(Number(expectedAvg.toFixed(2)));
        }
      }
    });

    it('should identify top category', () => {
      const creators = getCreators();
      const creatorWithSales = creators.find((c) => {
        const sales = getSalesByCreator(c.id);
        return sales.length > 0;
      });

      if (creatorWithSales) {
        const stats = getCreatorStats(creatorWithSales.id);

        if (stats && stats.topCategory) {
          expect(typeof stats.topCategory).toBe('string');
          expect(['Beauty', 'Fashion', 'Food', 'Tech', 'Lifestyle', 'HomeLiving', 'Health', 'BabyKids', 'Pet', 'Stationery']).toContain(stats.topCategory);
        }
      }
    });

    it('should identify top product', () => {
      const creators = getCreators();
      const creatorWithSales = creators.find((c) => {
        const sales = getSalesByCreator(c.id);
        return sales.length > 0;
      });

      if (creatorWithSales) {
        const stats = getCreatorStats(creatorWithSales.id);

        if (stats && stats.topProduct) {
          expect(stats.topProduct).toHaveProperty('id');
          expect(stats.topProduct).toHaveProperty('name');
          expect(stats.topProduct).toHaveProperty('salesCount');
          expect(stats.topProduct.salesCount).toBeGreaterThan(0);
        }
      }
    });

  });
});
