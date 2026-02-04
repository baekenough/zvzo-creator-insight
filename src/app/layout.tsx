import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZVZO Creator Insight - AI 크리에이터 분석 대시보드',
  description:
    '크리에이터의 판매 데이터를 AI로 분석하여 최적의 제품 매칭과 매출 예측을 제공합니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
