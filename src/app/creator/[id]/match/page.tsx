import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageContainer } from '@/components/layout/page-container';
import { getCreatorById } from '@/data';
import { MatchSection } from '@/components/match/match-section';

export default function MatchPage({ params }: { params: { id: string } }) {
  const creator = getCreatorById(params.id);

  if (!creator) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageContainer>
          <MatchSection creator={creator} />
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
