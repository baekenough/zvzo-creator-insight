import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductById, getCreators, getSalesByCreator } from '@/data';
import { matchCreatorsToProduct } from '@/lib/analysis';
import { GetCreatorMatchesRequestSchema } from '@/lib/schemas';
import type { CreatorMatch } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { productId, limit = 10 } = GetCreatorMatchesRequestSchema.parse(body);

    // Get product
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '제품을 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      );
    }

    // Get all creators
    const creators = getCreators();

    // Match creators to product
    const matches = await matchCreatorsToProduct(product, creators, limit);

    return NextResponse.json({
      success: true,
      data: matches,
    });
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

    console.error('[POST /api/match/creators] Error:', error);
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
