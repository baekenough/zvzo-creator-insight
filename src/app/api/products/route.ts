import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProducts, getProductsByCategory } from '@/data';
import type { Product, PaginatedResponse, Category } from '@/types';

// Query schema for products listing
const ProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
  sort: z.enum(['name', 'price', 'category']).optional().default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = ProductsQuerySchema.parse(searchParams);

    // Get all products or filtered by category
    let products = query.category
      ? getProductsByCategory(query.category as Category)
      : getProducts();

    // Apply price filter
    if (query.minPrice !== undefined) {
      products = products.filter((p) => p.price >= query.minPrice!);
    }
    if (query.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= query.maxPrice!);
    }

    // Apply search filter
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    products.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (query.sort) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        /* c8 ignore next 3 */
        default:
          aVal = a.name;
          bVal = b.name;
      }

      if (query.order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Calculate pagination
    const total = products.length;
    const totalPages = Math.ceil(total / query.limit);
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit;

    // Paginate results
    const paginatedProducts = products.slice(from, to);

    const response: PaginatedResponse<Product> = {
      success: true,
      data: paginatedProducts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '잘못된 요청입니다.',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    console.error('[GET /api/products] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
