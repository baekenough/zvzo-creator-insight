import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllCreators } from '@/data';
import type { Creator, PaginatedResponse } from '@/types';
import { CreatorsQuerySchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = CreatorsQuerySchema.parse(searchParams);

    // Get all creators from mock data
    let creators = getAllCreators();

    // Apply filters
    if (query.platform) {
      creators = creators.filter((c) => c.platform.toLowerCase() === query.platform);
    }

    if (query.category) {
      creators = creators.filter((c) =>
        c.categories.some(cat => cat.toLowerCase() === query.category!.toLowerCase())
      );
    }

    // Apply sorting
    creators.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (query.sort) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'followers':
          aVal = a.followerCount;
          bVal = b.followerCount;
          break;
        case 'engagement':
          aVal = a.engagementRate || 0;
          bVal = b.engagementRate || 0;
          break;
        case 'createdAt':
          aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
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
    const total = creators.length;
    const totalPages = Math.ceil(total / query.limit);
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit;

    // Paginate results
    const paginatedCreators = creators.slice(from, to);

    const response: PaginatedResponse<Creator> = {
      success: true,
      data: paginatedCreators,
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

    console.error('[GET /api/creators] Error:', error);
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
