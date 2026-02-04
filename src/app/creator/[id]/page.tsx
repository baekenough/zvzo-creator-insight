import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCreatorById, getSalesByCreator } from '@/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageContainer } from '@/components/layout/page-container';
import { CreatorProfile } from '@/components/creator/creator-profile';
import { SalesTable } from '@/components/creator/sales-table';
import { AnalysisSection } from '@/components/creator/analysis-section';
import { ArrowRight } from 'lucide-react';

export default function CreatorPage({ params }: { params: { id: string } }) {
  const creator = getCreatorById(params.id);

  // Return 404 if creator not found
  if (!creator) {
    notFound();
  }

  const sales = getSalesByCreator(params.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageContainer>
          {/* Back to Dashboard Link */}
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-gray-600 hover:text-zvzo-500 transition-colors"
            >
              ← 대시보드로 돌아가기
            </Link>
          </div>

          {/* Creator Profile Section */}
          <div className="mb-8">
            <CreatorProfile creator={creator} />
          </div>

          {/* AI Analysis Section */}
          <div className="mb-8">
            <AnalysisSection creatorId={creator.id} />
          </div>

          {/* Sales History Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">판매 내역</h2>
              <div className="text-sm text-gray-600">
                총 <span className="font-semibold text-gray-900">{sales.length}</span>건
              </div>
            </div>
            {sales.length > 0 ? (
              <SalesTable sales={sales} />
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-gray-600">아직 판매 내역이 없습니다.</p>
              </div>
            )}
          </div>

          {/* CTA Section - Product Matching */}
          <div className="bg-gradient-to-r from-zvzo-500 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">AI 제품 매칭</h3>
                <p className="text-blue-100">
                  {creator.name}님에게 최적화된 제품을 AI가 추천해드립니다.
                </p>
              </div>
              <Link
                href={`/creator/${creator.id}/match`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-zvzo-500 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                제품 매칭 시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
