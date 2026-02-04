import Link from 'next/link';
import { ArrowRight, BarChart3, TrendingUp, Zap, Target, Brain, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-zvzo-50 to-white py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                AI-Powered Creator
                <span className="block text-zvzo-500">Sales Analysis</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
                Analyze creator sales data with AI to find the perfect product match and predict
                revenue. Make data-driven decisions for influencer marketing.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="text-base">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="text-base">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="mt-16 rounded-xl border border-gray-200 bg-white p-8 shadow-xl">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-zvzo-100 to-zvzo-50 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-20 w-20 text-zvzo-500 mb-4" />
                  <p className="text-gray-600 font-medium">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Powerful Features
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to analyze and optimize creator partnerships
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 hover:border-zvzo-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zvzo-100 mb-4">
                    <Brain className="h-6 w-6 text-zvzo-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-gray-600">
                    Leverage advanced AI to analyze sales patterns, trends, and creator performance
                    metrics automatically.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-zvzo-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-4">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Smart Product Matching
                  </h3>
                  <p className="text-gray-600">
                    Find the perfect product-creator match with AI scoring based on sales history
                    and audience alignment.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-zvzo-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 mb-4">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Revenue Prediction
                  </h3>
                  <p className="text-gray-600">
                    Predict potential revenue from creator partnerships with confidence intervals
                    and risk assessment.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-zvzo-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 mb-4">
                    <BarChart className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Visual Insights
                  </h3>
                  <p className="text-gray-600">
                    Interactive charts and graphs showing category trends, seasonal patterns, and
                    sales distributions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-zvzo-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Real-time Updates
                  </h3>
                  <p className="text-gray-600">
                    Get instant insights as new sales data comes in, with automatic recalculation
                    of scores and predictions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-zvzo-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 mb-4">
                    <BarChart3 className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Comprehensive Reports
                  </h3>
                  <p className="text-gray-600">
                    Export detailed reports with AI-generated insights and recommendations for your
                    marketing strategy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600">
                Three simple steps to unlock creator insights
              </p>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zvzo-500 text-white text-2xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Connect Your Data
                </h3>
                <p className="text-gray-600">
                  Upload creator sales data from Instagram, YouTube, or TikTok. Our system
                  automatically processes and validates the information.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zvzo-500 text-white text-2xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  AI Analysis
                </h3>
                <p className="text-gray-600">
                  Our AI analyzes sales patterns, identifies trends, and generates comprehensive
                  insights about creator performance and audience preferences.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zvzo-500 text-white text-2xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Get Recommendations
                </h3>
                <p className="text-gray-600">
                  Receive AI-powered product recommendations with match scores, revenue predictions,
                  and actionable insights for your marketing campaigns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-zvzo-500">
          <div className="mx-auto max-w-4xl px-4 md:px-8 lg:px-12 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
              Ready to Transform Your Creator Marketing?
            </h2>
            <p className="text-lg text-zvzo-100 mb-8">
              Join innovative brands using AI to optimize their influencer partnerships and
              maximize ROI.
            </p>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-base">
                Start Analyzing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
