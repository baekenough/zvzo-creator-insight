import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from '@/app/page';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right-icon" />,
  BarChart3: () => <span data-testid="bar-chart3-icon" />,
  TrendingUp: () => <span data-testid="trending-up-icon" />,
  Zap: () => <span data-testid="zap-icon" />,
  Target: () => <span data-testid="target-icon" />,
  Brain: () => <span data-testid="brain-icon" />,
  BarChart: () => <span data-testid="bar-chart-icon" />,
}));

// Mock layout components
vi.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe('LandingPage', () => {
  it('should render hero section with main title', () => {
    render(<LandingPage />);

    expect(screen.getByText(/AI-Powered Creator/i)).toBeInTheDocument();
    expect(screen.getByText(/Sales Analysis/i)).toBeInTheDocument();
  });

  it('should render hero section description', () => {
    render(<LandingPage />);

    expect(
      screen.getByText(/Analyze creator sales data with AI to find the perfect product match/i)
    ).toBeInTheDocument();
  });

  it('should render Get Started button with link to /dashboard', () => {
    render(<LandingPage />);

    const getStartedButton = screen.getByText('Get Started').closest('a');
    expect(getStartedButton).toBeInTheDocument();
    expect(getStartedButton).toHaveAttribute('href', '/dashboard');
  });

  it('should render Learn More button with link to /about', () => {
    render(<LandingPage />);

    const learnMoreButton = screen.getByText('Learn More').closest('a');
    expect(learnMoreButton).toBeInTheDocument();
    expect(learnMoreButton).toHaveAttribute('href', '/about');
  });

  it('should render Dashboard Preview placeholder', () => {
    render(<LandingPage />);

    expect(screen.getByText('Dashboard Preview')).toBeInTheDocument();
  });

  it('should render Features section heading', () => {
    render(<LandingPage />);

    expect(screen.getByText('Powerful Features')).toBeInTheDocument();
    expect(
      screen.getByText(/Everything you need to analyze and optimize creator partnerships/i)
    ).toBeInTheDocument();
  });

  it('should render all 6 feature cards', () => {
    render(<LandingPage />);

    // Check for all feature titles
    expect(screen.getByText('AI-Powered Analysis')).toBeInTheDocument();
    expect(screen.getByText('Smart Product Matching')).toBeInTheDocument();
    expect(screen.getByText('Revenue Prediction')).toBeInTheDocument();
    expect(screen.getByText('Visual Insights')).toBeInTheDocument();
    expect(screen.getByText('Real-time Updates')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Reports')).toBeInTheDocument();
  });

  it('should render feature card descriptions', () => {
    render(<LandingPage />);

    expect(
      screen.getByText(/Leverage advanced AI to analyze sales patterns/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Find the perfect product-creator match with AI scoring/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Predict potential revenue from creator partnerships/i)
    ).toBeInTheDocument();
  });

  it('should render How It Works section', () => {
    render(<LandingPage />);

    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(
      screen.getByText(/Three simple steps to unlock creator insights/i)
    ).toBeInTheDocument();
  });

  it('should render all 3 steps in How It Works section', () => {
    render(<LandingPage />);

    // Step 1
    expect(screen.getByText('Connect Your Data')).toBeInTheDocument();
    expect(
      screen.getByText(/Upload creator sales data from Instagram, YouTube, or TikTok/i)
    ).toBeInTheDocument();

    // Step 2
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
    expect(
      screen.getByText(/Our AI analyzes sales patterns, identifies trends/i)
    ).toBeInTheDocument();

    // Step 3
    expect(screen.getByText('Get Recommendations')).toBeInTheDocument();
    expect(
      screen.getByText(/Receive AI-powered product recommendations with match scores/i)
    ).toBeInTheDocument();
  });

  it('should render step numbers 1, 2, 3', () => {
    render(<LandingPage />);

    const stepNumbers = screen.getAllByText(/^[1-3]$/);
    expect(stepNumbers).toHaveLength(3);
  });

  it('should render CTA section', () => {
    render(<LandingPage />);

    expect(
      screen.getByText(/Ready to Transform Your Creator Marketing\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Join innovative brands using AI to optimize their influencer partnerships/i)
    ).toBeInTheDocument();
  });

  it('should render Start Analyzing Now button with link to /dashboard', () => {
    render(<LandingPage />);

    const startAnalyzingButton = screen.getByText('Start Analyzing Now').closest('a');
    expect(startAnalyzingButton).toBeInTheDocument();
    expect(startAnalyzingButton).toHaveAttribute('href', '/dashboard');
  });

  it('should render Header component', () => {
    render(<LandingPage />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should render Footer component', () => {
    render(<LandingPage />);

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render all feature icons', () => {
    render(<LandingPage />);

    expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
    expect(screen.getByTestId('target-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument();
    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
  });

  it('should render ArrowRight icons on CTA buttons', () => {
    render(<LandingPage />);

    const arrowIcons = screen.getAllByTestId('arrow-right-icon');
    expect(arrowIcons.length).toBeGreaterThanOrEqual(2);
  });
});
