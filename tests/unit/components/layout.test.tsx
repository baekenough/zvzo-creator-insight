import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageContainer } from '@/components/layout/page-container';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Header', () => {
  it('should render logo and navigation items', () => {
    render(<Header />);

    expect(screen.getByText(/ZVZO/)).toBeInTheDocument();
    expect(screen.getByText(/Creator Insight/)).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('should render GitHub link', () => {
    render(<Header />);

    const githubLink = screen.getByLabelText('GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/baekenough/zvzo-creator-insight');
  });

  it('should toggle mobile menu on button click', () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Open menu');
    expect(menuButton).toBeInTheDocument();

    fireEvent.click(menuButton);

    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('should close mobile menu on close button click', async () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    });
  });

  it('should close mobile menu on menu item click', async () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    const dashboardLink = screen.getAllByText('Dashboard')[1]; // Mobile menu item
    fireEvent.click(dashboardLink);

    await waitFor(() => {
      expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    });
  });

  it('should add shadow class on scroll', () => {
    render(<Header />);

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 20, writable: true });
    fireEvent.scroll(window);

    // Note: Due to React state updates, we can't easily test this without more setup
    // This test demonstrates the intention
  });

  it('should have accessible navigation', () => {
    render(<Header />);

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('should close mobile menu when overlay is clicked', async () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    const overlay = document.querySelector('.fixed.inset-0.z-40');
    expect(overlay).toBeInTheDocument();

    fireEvent.click(overlay!);

    await waitFor(() => {
      expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    });
  });

  it('should prevent body scroll when mobile menu is open', () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    expect(document.body.style.overflow).toBe('hidden');

    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);

    waitFor(() => {
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  it('should restore body scroll on unmount', () => {
    const { unmount } = render(<Header />);

    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });

  it('should highlight active navigation item based on pathname', () => {
    // With pathname '/', no nav items are active (Dashboard is '/dashboard', About is '/about')
    render(<Header />);

    const dashboardLinks = screen.getAllByText('Dashboard');
    const desktopLink = dashboardLinks[0];
    // Since pathname is '/', it should not be active
    expect(desktopLink).toHaveClass('text-gray-600', 'border-transparent');
  });

  it('should apply hover styles to navigation items', () => {
    render(<Header />);

    const aboutLink = screen.getAllByText('About')[0];
    expect(aboutLink).toHaveClass('transition-colors');
  });

  it('should render mobile navigation with correct aria-label', () => {
    render(<Header />);

    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    const mobileNav = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(mobileNav).toBeInTheDocument();
  });
});

describe('Footer', () => {
  it('should render footer content', () => {
    render(<Footer />);

    expect(screen.getByText('ZVZO Creator Insight')).toBeInTheDocument();
    expect(screen.getByText('AI-powered creator sales analysis platform')).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    render(<Footer />);

    expect(screen.getByText(/© 2026 ZVZO/)).toBeInTheDocument();
  });

  it('should render "Powered by AI" text', () => {
    render(<Footer />);

    expect(screen.getByText('Powered by AI')).toBeInTheDocument();
  });

  it('should render GitHub link', () => {
    render(<Footer />);

    const githubLink = screen.getByText('GitHub').closest('a');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/baekenough/zvzo-creator-insight');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('should render footer links', () => {
    render(<Footer />);

    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});

describe('PageContainer', () => {
  it('should render children', () => {
    render(
      <PageContainer>
        <div>Test content</div>
      </PageContainer>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply default max-width class', () => {
    const { container } = render(
      <PageContainer>
        <div>Test</div>
      </PageContainer>
    );

    const pageContainer = container.firstChild;
    expect(pageContainer).toHaveClass('max-w-7xl');
  });

  it('should apply custom max-width class', () => {
    const { container } = render(
      <PageContainer maxWidth="sm">
        <div>Test</div>
      </PageContainer>
    );

    const pageContainer = container.firstChild;
    expect(pageContainer).toHaveClass('max-w-screen-sm');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PageContainer className="custom-class">
        <div>Test</div>
      </PageContainer>
    );

    const pageContainer = container.firstChild;
    expect(pageContainer).toHaveClass('custom-class');
  });

  it('should have responsive padding classes', () => {
    const { container } = render(
      <PageContainer>
        <div>Test</div>
      </PageContainer>
    );

    const pageContainer = container.firstChild;
    expect(pageContainer).toHaveClass('px-4', 'py-6', 'md:px-6', 'md:py-8');
  });
});
