import { NextRequest, NextResponse } from 'next/server';
import { getCreatorById, getCreatorStats } from '@/data';
import type { Creator } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Get creator
    const creator = getCreatorById(id);

    if (!creator) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '크리에이터를 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      );
    }

    // Get creator stats
    const stats = getCreatorStats(id);

    // Combine creator data with stats
    const creatorWithStats = {
      ...creator,
      stats: stats || {
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0,
        averageConversionRate: 0,
        topCategory: null,
        topProduct: null,
      },
    };

    return NextResponse.json({
      success: true,
      data: creatorWithStats,
    });
  } catch (error) {
    console.error('[GET /api/creators/:id] Error:', error);
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
