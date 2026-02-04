import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from '@/app/about/page';

// Mock components
vi.mock('@/components/layout/header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <div data-testid="mock-footer">Footer</div>,
}));

vi.mock('@/components/layout/page-container', () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-page-container">{children}</div>
  ),
}));

describe('AboutPage', () => {
  it('should render page layout components', () => {
    render(<AboutPage />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-page-container')).toBeInTheDocument();
  });

  it('should display page title', () => {
    render(<AboutPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('About');
  });

  it('should display placeholder content message', () => {
    render(<AboutPage />);

    expect(screen.getByText('About page content will be implemented later.')).toBeInTheDocument();
  });

  it('should have proper heading styles', () => {
    render(<AboutPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-gray-900');
  });

  it('should have proper paragraph styles', () => {
    const { container } = render(<AboutPage />);

    const paragraph = container.querySelector('p');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveClass('mt-4', 'text-gray-600');
  });

  it('should have proper page structure with main element', () => {
    const { container } = render(<AboutPage />);

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('flex-1');
  });

  it('should render page container within main', () => {
    const { container } = render(<AboutPage />);

    const mainElement = container.querySelector('main');
    const pageContainer = screen.getByTestId('mock-page-container');

    expect(mainElement).toContainElement(pageContainer);
  });

  it('should have flex column layout', () => {
    const { container } = render(<AboutPage />);

    const rootDiv = container.querySelector('div.flex.min-h-screen.flex-col');
    expect(rootDiv).toBeInTheDocument();
  });

  it('should render content in correct order', () => {
    const { container } = render(<AboutPage />);

    const allElements = Array.from(container.querySelectorAll('div, main, h1, p'));
    const header = screen.getByTestId('mock-header');
    const main = container.querySelector('main');
    const footer = screen.getByTestId('mock-footer');

    const headerIndex = allElements.indexOf(header);
    const mainIndex = allElements.indexOf(main!);
    const footerIndex = allElements.indexOf(footer);

    expect(headerIndex).toBeLessThan(mainIndex);
    expect(mainIndex).toBeLessThan(footerIndex);
  });
});
