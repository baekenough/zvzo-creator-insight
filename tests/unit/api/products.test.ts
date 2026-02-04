import { describe, it, expect, vi } from 'vitest';
import { GET as getProducts } from '@/app/api/products/route';
import { NextRequest } from 'next/server';

describe('GET /api/products', () => {
  it('should return products list', async () => {
    const request = new NextRequest('http://localhost:3000/api/products');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
  });

  it('should paginate results', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?page=1&limit=10');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.length).toBeLessThanOrEqual(10);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(10);
  });

  it('should filter by category', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?category=Beauty');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    data.data.forEach((product: any) => {
      expect(product.category).toBe('Beauty');
    });
  });

  it('should filter by price range', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?minPrice=50000&maxPrice=100000');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    data.data.forEach((product: any) => {
      expect(product.price).toBeGreaterThanOrEqual(50000);
      expect(product.price).toBeLessThanOrEqual(100000);
    });
  });

  it('should search products by name', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?search=세럼');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 0) {
      const hasMatch = data.data.some((product: any) =>
        product.name.includes('세럼') ||
        product.description.includes('세럼')
      );
      expect(hasMatch).toBe(true);
    }
  });

  it('should sort by price', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?sort=price&order=asc');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 1) {
      expect(data.data[0].price).toBeLessThanOrEqual(data.data[1].price);
    }
  });

  it('should sort by name', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?sort=name&order=asc');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 1) {
      expect(data.data[0].name.localeCompare(data.data[1].name)).toBeLessThanOrEqual(0);
    }
  });

  it('should have valid product structure', async () => {
    const request = new NextRequest('http://localhost:3000/api/products');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    const product = data.data[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('brand');
    expect(product).toHaveProperty('category');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('description');
  });

  it('should handle combined filters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/products?category=Beauty&minPrice=30000&maxPrice=80000&sort=price&order=asc'
    );
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    data.data.forEach((product: any) => {
      expect(product.category).toBe('Beauty');
      expect(product.price).toBeGreaterThanOrEqual(30000);
      expect(product.price).toBeLessThanOrEqual(80000);
    });
  });

  it('should sort by category', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?sort=category&order=asc');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 1) {
      expect(data.data[0].category.localeCompare(data.data[1].category)).toBeLessThanOrEqual(0);
    }
  });

  it('should sort in descending order', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?sort=price&order=desc');
    const response = await getProducts(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 1) {
      expect(data.data[0].price).toBeGreaterThanOrEqual(data.data[1].price);
    }
  });
});

describe('GET /api/products - Error Handling', () => {
  it('should handle ZodError for invalid page number', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?page=-1');
    const response = await getProducts(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
    expect(data.error.details).toBeDefined();
  });

  it('should handle ZodError for invalid limit (zero)', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?limit=0');
    const response = await getProducts(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should handle ZodError for limit exceeding max', async () => {
    const request = new NextRequest('http://localhost:3000/api/products?limit=999');
    const response = await getProducts(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should handle generic errors', async () => {
    // Spy on getProducts to throw an error
    const dataModule = await import('@/data');
    const spy = vi.spyOn(dataModule, 'getProducts').mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const request = new NextRequest('http://localhost:3000/api/products');
    const response = await getProducts(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');

    spy.mockRestore();
  });
});
