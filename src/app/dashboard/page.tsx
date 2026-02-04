import { getCreators } from '@/data';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageContainer } from '@/components/layout/page-container';
import { StatCard } from '@/components/common/stat-card';
import { CreatorList } from '@/components/dashboard/creator-list';
import { Users, DollarSign, TrendingUp, Tag } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function DashboardPage() {
  const creators = getCreators();

  // Calculate summary statistics
  const totalCreators = creators.length;
  const totalRevenue = creators.reduce((sum, creator) => sum + creator.totalRevenue, 0);
  const avgConversionRate =
    creators.reduce((sum, creator) => sum + creator.engagementRate, 0) / creators.length;

  // Find top category
  const categoryCount: Record<string, number> = {};
  creators.forEach((creator) => {
    creator.categories.forEach((category) => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });

  const topCategory =
    Object.entries(categoryCount).length > 0
      ? Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageContainer>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">크리에이터 대시보드</h1>
            <p className="text-gray-600">AI 기반 크리에이터 판매 성과 분석</p>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard label="총 크리에이터" value={totalCreators} icon={Users} />
            <StatCard label="총 매출" value={formatCurrency(totalRevenue)} icon={DollarSign} />
            <StatCard label="평균 참여율" value={formatPercent(avgConversionRate)} icon={TrendingUp} />
            <StatCard label="상위 카테고리" value={topCategory} icon={Tag} />
          </div>

          {/* Creator List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">크리에이터 목록</h2>
            <CreatorList creators={creators} />
          </div>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
