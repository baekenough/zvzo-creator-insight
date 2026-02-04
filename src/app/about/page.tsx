import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageContainer } from '@/components/layout/page-container';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PageContainer>
          <h1 className="text-3xl font-bold text-gray-900">About</h1>
          <p className="mt-4 text-gray-600">
            About page content will be implemented later.
          </p>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
