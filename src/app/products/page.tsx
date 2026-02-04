import { getProducts } from '@/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageContainer } from '@/components/layout/page-container';
import { StatCard } from '@/components/common/stat-card';
import { ProductList } from '@/components/products/product-list';
import { Package, DollarSign, Tag, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const products = getProducts();

  // Calculate summary statistics
  const totalProducts = products.length;
  const avgPrice = products.reduce((sum, product) => sum + product.price, 0) / products.length;

  // Find most popular category
  const categoryCount: Record<string, number> = {};
  products.forEach((product) => {
    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
  });

  const mostPopularCategory =
    Object.entries(categoryCount).length > 0
      ? Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

  // Calculate average commission rate
  const avgCommissionRate =
    products.reduce((sum, product) => sum + product.avgCommissionRate, 0) / products.length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageContainer>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">제품 카탈로그</h1>
            <p className="text-gray-600">AI 기반 제품 판매 성과 분석</p>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard label="총 제품 수" value={totalProducts} icon={Package} />
            <StatCard label="평균 가격" value={formatCurrency(avgPrice)} icon={DollarSign} />
            <StatCard label="인기 카테고리" value={mostPopularCategory} icon={Tag} />
            <StatCard
              label="평균 수수료율"
              value={`${avgCommissionRate.toFixed(1)}%`}
              icon={Percent}
            />
          </div>

          {/* Product List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">제품 목록</h2>
            <ProductList products={products} />
          </div>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
