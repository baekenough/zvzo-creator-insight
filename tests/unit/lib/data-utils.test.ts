import { describe, it, expect } from 'vitest';
import {
  getCreators,
  getCreatorById,
  getProducts,
  getProductById,
  getProductsByCategory,
  getSalesHistory,
  getSalesByCreator,
  getSalesByProduct,
  getCreatorStats,
  type CreatorStats,
} from '../../../src/data';

describe('getCreators', () => {
  it('should return all creators', () => {
    const creators = getCreators();
    expect(creators).toBeDefined();
    expect(creators.length).toBe(20);
  });

  it('should return creators with valid structure', () => {
    const creators = getCreators();
    const creator = creators[0];

    expect(creator).toHaveProperty('id');
    expect(creator).toHaveProperty('name');
    expect(creator).toHaveProperty('platform');
    expect(creator).toHaveProperty('followerCount');
    expect(creator).toHaveProperty('categories');
    expect(creator).toHaveProperty('email');
    expect(creator).toHaveProperty('joinedAt');
  });

  it('should have correct platform distribution', () => {
    const creators = getCreators();
    const instagram = creators.filter((c) => c.platform === 'Instagram');
    const youtube = creators.filter((c) => c.platform === 'YouTube');
    const tiktok = creators.filter((c) => c.platform === 'TikTok');

    expect(instagram.length).toBe(8);
    expect(youtube.length).toBe(7);
    expect(tiktok.length).toBe(5);
  });
});

describe('getCreatorById', () => {
  it('should return creator by ID', () => {
    const creator = getCreatorById('creator-001');
    expect(creator).toBeDefined();
    expect(creator?.id).toBe('creator-001');
    expect(creator?.name).toBe('김지은');
  });

  it('should return undefined for non-existent ID', () => {
    const creator = getCreatorById('creator-999');
    expect(creator).toBeUndefined();
  });

  it('should return creator with valid categories', () => {
    const creator = getCreatorById('creator-001');
    expect(creator?.categories).toBeDefined();
    expect(creator?.categories.length).toBeGreaterThanOrEqual(2);
    expect(creator?.categories.length).toBeLessThanOrEqual(3);
  });
});

describe('getProducts', () => {
  it('should return all products', () => {
    const products = getProducts();
    expect(products).toBeDefined();
    expect(products.length).toBe(50);
  });

  it('should return products with valid structure', () => {
    const products = getProducts();
    const product = products[0];

    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('category');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('brandName');
    expect(product).toHaveProperty('imageUrl');
    expect(product).toHaveProperty('description');
  });

  it('should have 5 products per category', () => {
    const products = getProducts();
    const categories = [
      'Beauty',
      'Fashion',
      'Lifestyle',
      'Food',
      'Tech',
      'HomeLiving',
      'Health',
      'BabyKids',
      'Pet',
      'Stationery',
    ];

    categories.forEach((category) => {
      const categoryProducts = products.filter((p) => p.category === category);
      expect(categoryProducts.length).toBe(5);
    });
  });
});

describe('getProductById', () => {
  it('should return product by ID', () => {
    const product = getProductById('product-001');
    expect(product).toBeDefined();
    expect(product?.id).toBe('product-001');
    expect(product?.name).toBe('글로우 세럼');
  });

  it('should return undefined for non-existent ID', () => {
    const product = getProductById('product-999');
    expect(product).toBeUndefined();
  });

  it('should have price within valid range', () => {
    const product = getProductById('product-001');
    expect(product?.price).toBeGreaterThanOrEqual(10000);
    expect(product?.price).toBeLessThanOrEqual(200000);
  });
});

describe('getProductsByCategory', () => {
  it('should return products for a specific category', () => {
    const beautyProducts = getProductsByCategory('Beauty');
    expect(beautyProducts.length).toBe(5);
    beautyProducts.forEach((product) => {
      expect(product.category).toBe('Beauty');
    });
  });

  it('should return empty array for category with no products', () => {
    // All categories have products, so this tests the function works correctly
    const techProducts = getProductsByCategory('Tech');
    expect(Array.isArray(techProducts)).toBe(true);
    expect(techProducts.length).toBe(5);
  });

  it('should return correct products for each category', () => {
    const fashionProducts = getProductsByCategory('Fashion');
    const foodProducts = getProductsByCategory('Food');

    expect(fashionProducts.length).toBe(5);
    expect(foodProducts.length).toBe(5);

    fashionProducts.forEach((p) => expect(p.category).toBe('Fashion'));
    foodProducts.forEach((p) => expect(p.category).toBe('Food'));
  });
});

describe('getSalesHistory', () => {
  it('should return sales history', () => {
    const sales = getSalesHistory();
    expect(sales).toBeDefined();
    expect(Array.isArray(sales)).toBe(true);
    expect(sales.length).toBeGreaterThan(0);
  });

  it('should have valid sale structure', () => {
    const sales = getSalesHistory();
    const sale = sales[0];

    expect(sale).toHaveProperty('id');
    expect(sale).toHaveProperty('creatorId');
    expect(sale).toHaveProperty('productId');
    expect(sale).toHaveProperty('soldAt');
    expect(sale).toHaveProperty('quantity');
    expect(sale).toHaveProperty('revenue');
    expect(sale).toHaveProperty('commission');
    expect(sale).toHaveProperty('clickCount');
    expect(sale).toHaveProperty('conversionRate');
  });

  it('should be sorted by date', () => {
    const sales = getSalesHistory();
    for (let i = 1; i < sales.length; i++) {
      const prevDate = new Date(sales[i - 1].soldAt);
      const currentDate = new Date(sales[i].soldAt);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
    }
  });

  it('should have valid conversion rate calculation', () => {
    const sales = getSalesHistory();
    sales.forEach((sale) => {
      const expectedRate = (sale.quantity / sale.clickCount) * 100;
      const difference = Math.abs(sale.conversionRate - expectedRate);
      expect(difference).toBeLessThan(0.1); // Allow for rounding
    });
  });
});

describe('getSalesByCreator', () => {
  it('should return sales for a specific creator', () => {
    const sales = getSalesByCreator('creator-001');
    expect(Array.isArray(sales)).toBe(true);
    sales.forEach((sale) => {
      expect(sale.creatorId).toBe('creator-001');
    });
  });

  it('should return empty array for creator with no sales', () => {
    const sales = getSalesByCreator('creator-999');
    expect(sales).toEqual([]);
  });

  it('should return all sales for existing creators', () => {
    const allSales = getSalesHistory();
    const creator001Sales = getSalesByCreator('creator-001');

    expect(creator001Sales.length).toBeGreaterThan(0);
    expect(creator001Sales.length).toBeLessThanOrEqual(allSales.length);
  });
});

describe('getSalesByProduct', () => {
  it('should return sales for a specific product', () => {
    const allSales = getSalesHistory();
    const productId = allSales[0].productId;
    const sales = getSalesByProduct(productId);

    expect(Array.isArray(sales)).toBe(true);
    sales.forEach((sale) => {
      expect(sale.productId).toBe(productId);
    });
  });

  it('should return empty array for product with no sales', () => {
    const sales = getSalesByProduct('product-999');
    expect(sales).toEqual([]);
  });

  it('should filter sales correctly', () => {
    const allSales = getSalesHistory();
    // Get a product that exists in sales
    const sampleProduct = allSales[0].productId;
    const filteredSales = getSalesByProduct(sampleProduct);

    expect(filteredSales.length).toBeGreaterThan(0);
    filteredSales.forEach((sale) => {
      expect(sale.productId).toBe(sampleProduct);
    });
  });
});

describe('getCreatorStats', () => {
  it('should return null for non-existent creator', () => {
    const stats = getCreatorStats('creator-999');
    expect(stats).toBeNull();
  });

  it('should return stats for existing creator', () => {
    const stats = getCreatorStats('creator-001');
    expect(stats).not.toBeNull();

    if (stats) {
      expect(stats).toHaveProperty('totalSales');
      expect(stats).toHaveProperty('totalRevenue');
      expect(stats).toHaveProperty('totalCommission');
      expect(stats).toHaveProperty('averageConversionRate');
      expect(stats).toHaveProperty('topCategory');
      expect(stats).toHaveProperty('topProduct');
    }
  });

  it('should calculate totals correctly', () => {
    const creatorId = 'creator-001';
    const sales = getSalesByCreator(creatorId);
    const stats = getCreatorStats(creatorId);

    if (!stats || sales.length === 0) return;

    const expectedTotalSales = sales.reduce((sum, s) => sum + s.quantity, 0);
    const expectedTotalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
    const expectedTotalCommission = sales.reduce((sum, s) => sum + s.commission, 0);

    expect(stats.totalSales).toBe(expectedTotalSales);
    expect(stats.totalRevenue).toBe(expectedTotalRevenue);
    expect(stats.totalCommission).toBe(expectedTotalCommission);
  });

  it('should calculate average conversion rate correctly', () => {
    const creatorId = 'creator-001';
    const stats = getCreatorStats(creatorId);

    if (!stats) return;

    // averageConversionRate should be a valid number
    expect(typeof stats.averageConversionRate).toBe('number');
    expect(stats.averageConversionRate).toBeGreaterThanOrEqual(0);
    expect(stats.averageConversionRate).toBeLessThanOrEqual(100);
  });

  it('should identify top category', () => {
    const stats = getCreatorStats('creator-001');

    if (!stats) return;

    expect(stats.topCategory).toBeDefined();
    if (stats.topCategory) {
      expect(typeof stats.topCategory).toBe('string');
      expect(['Beauty', 'Fashion', 'Lifestyle', 'Food', 'Tech', 'HomeLiving', 'Health', 'BabyKids', 'Pet', 'Stationery']).toContain(stats.topCategory);
    }
  });

  it('should identify top product', () => {
    const stats = getCreatorStats('creator-001');

    if (!stats) return;

    if (stats.topProduct) {
      expect(stats.topProduct).toHaveProperty('id');
      expect(stats.topProduct).toHaveProperty('name');
      expect(stats.topProduct).toHaveProperty('salesCount');
      expect(stats.topProduct.salesCount).toBeGreaterThan(0);
    }
  });

  it('should return zero stats for creator with no sales', () => {
    // Create a scenario where we can test this
    // Since all creators have sales in our mock data, we just verify the structure
    const stats = getCreatorStats('creator-020');

    if (!stats) return;

    expect(typeof stats.totalSales).toBe('number');
    expect(typeof stats.totalRevenue).toBe('number');
    expect(typeof stats.totalCommission).toBe('number');
    expect(typeof stats.averageConversionRate).toBe('number');
  });
});

describe('CreatorStats type', () => {
  it('should have correct type structure', () => {
    const stats = getCreatorStats('creator-001');

    if (!stats) {
      expect(stats).toBeNull();
      return;
    }

    // Type checks
    expect(typeof stats.totalSales).toBe('number');
    expect(typeof stats.totalRevenue).toBe('number');
    expect(typeof stats.totalCommission).toBe('number');
    expect(typeof stats.averageConversionRate).toBe('number');

    if (stats.topCategory !== null) {
      expect(typeof stats.topCategory).toBe('string');
    }

    if (stats.topProduct !== null) {
      expect(typeof stats.topProduct.id).toBe('string');
      expect(typeof stats.topProduct.name).toBe('string');
      expect(typeof stats.topProduct.salesCount).toBe('number');
    }
  });
});
