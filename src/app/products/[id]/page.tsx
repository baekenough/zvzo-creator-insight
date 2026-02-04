import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductById, getSalesByProduct } from '@/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageContainer } from '@/components/layout/page-container';
import { ProductProfile } from '@/components/products/product-profile';
import { ProductSalesTable } from '@/components/products/product-sales-table';
import { ChevronLeft, ArrowRight } from 'lucide-react';

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);

  // Return 404 if product not found
  if (!product) {
    notFound();
  }

  const sales = getSalesByProduct(params.id);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageContainer>
          {/* Back to Products Link */}
          <div className="mb-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-zvzo-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              제품 목록으로
            </Link>
          </div>

          {/* Product Profile Section */}
          <div className="mb-8">
            <ProductProfile product={product} />
          </div>

          {/* Sales History Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">판매 이력</h2>
              <div className="text-sm text-gray-600">
                총 <span className="font-semibold text-gray-900">{sales.length}</span>건
              </div>
            </div>
            {sales.length > 0 ? (
              <ProductSalesTable productId={product.id} />
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <p className="text-gray-600">아직 판매 이력이 없습니다.</p>
              </div>
            )}
          </div>

          {/* CTA Section - Creator Matching */}
          <div className="bg-gradient-to-r from-zvzo-500 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">AI 크리에이터 매칭</h3>
                <p className="text-blue-100">
                  {product.name}에 최적화된 크리에이터를 AI가 추천해드립니다.
                </p>
              </div>
              <Link
                href={`/products/${product.id}/match`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-zvzo-500 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                크리에이터 매칭 시작하기
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
