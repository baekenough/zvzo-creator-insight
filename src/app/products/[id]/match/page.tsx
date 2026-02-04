import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageContainer } from '@/components/layout/page-container';
import { getProductById } from '@/data';
import { CreatorMatchSection } from '@/components/match/creator-match-section';
import { ChevronLeft } from 'lucide-react';

export default function ProductMatchPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageContainer>
          {/* Back Link */}
          <div className="mb-6">
            <Link
              href={`/products/${params.id}`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-zvzo-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              제품 상세로
            </Link>
          </div>

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 크리에이터 매칭</h1>
            <p className="text-gray-600">{product.name}에 최적화된 크리에이터를 AI가 추천합니다</p>
          </div>

          {/* Match Section */}
          <CreatorMatchSection product={product} />
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
