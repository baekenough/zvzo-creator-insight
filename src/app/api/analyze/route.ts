import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCreatorById, getSalesByCreator } from '@/data';
import { analyzeCreatorWithData, preprocessCreatorData } from '@/lib/analysis';
import { GetCreatorInsightRequestSchema } from '@/lib/schemas';
import type { CreatorInsight } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { creatorId } = GetCreatorInsightRequestSchema.parse(body);

    // Get creator and sales data
    const creator = getCreatorById(creatorId);
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

    const sales = getSalesByCreator(creatorId);
    if (sales.length < 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_DATA',
            message: '분석에 필요한 판매 데이터가 부족합니다. (최소 5건 필요)',
          },
        },
        { status: 400 }
      );
    }

    let insight: CreatorInsight;

    try {
      // Try OpenAI analysis
      insight = await analyzeCreatorWithData(creator, sales);
    } catch (error: any) {
      console.warn('[POST /api/analyze] OpenAI failed, using fallback:', error.message);

      // Fallback: Generate mock analysis from actual data
      const preprocessed = preprocessCreatorData(creator, sales);

      insight = {
        id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        creatorId: creator.id,
        summary: `${creator.name}님은 ${preprocessed.categoryBreakdown[0]?.category || 'N/A'} 카테고리에서 강점을 보이며, 평균 주문 가치는 ${Math.round(preprocessed.summary.averageOrderValue).toLocaleString()}원입니다. 총 ${preprocessed.summary.totalSales}건의 판매를 통해 ${preprocessed.summary.totalRevenue.toLocaleString()}원의 매출을 기록했습니다.`,
        strengths: [
          `${preprocessed.categoryBreakdown[0]?.category || 'N/A'} 카테고리 강세 (${preprocessed.categoryBreakdown[0]?.revenueShare.toFixed(1)}%)`,
          `안정적인 판매량 (총 ${preprocessed.summary.totalSales}건)`,
          `우수한 평균 주문 가치 (${Math.round(preprocessed.summary.averageOrderValue).toLocaleString()}원)`,
        ],
        topCategories: preprocessed.categoryBreakdown.slice(0, 3).map((cat) => ({
          category: cat.category,
          percentage: cat.revenueShare,
        })),
        priceRange: {
          min: Math.min(...preprocessed.priceDistribution.map((p) => parseInt(p.priceRange.split('-')[0]))),
          max: Math.max(...preprocessed.priceDistribution.map((p) => parseInt(p.priceRange.split('-')[1]))),
          average: preprocessed.summary.averageOrderValue,
        },
        seasonalTrends: preprocessed.seasonalPattern.map((s) => ({
          season: s.season,
          salesCount: s.salesCount,
          revenue: s.revenue,
        })),
        recommendations: [
          `${preprocessed.categoryBreakdown[0]?.category || 'N/A'} 카테고리 제품 확대 추천`,
          `${preprocessed.priceDistribution[0]?.priceRange}원 가격대 제품 집중 판매`,
          `${preprocessed.seasonalPattern[0]?.season} 시즌 마케팅 강화`,
        ],
        confidence: 0.75,
        analyzedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      data: insight,
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

    console.error('[POST /api/analyze] Error:', error);
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
