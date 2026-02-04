import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    return React.createElement('img', props);
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href, ...props }, children),
}));

// Mock openai module to prevent browser errors in tests
vi.mock('openai', () => {
  class MockOpenAI {
    constructor() {}
  }

  // Add APIError as a static property
  (MockOpenAI as any).APIError = class APIError extends Error {
    type?: string;
    constructor(message: string, type?: string) {
      super(message);
      this.type = type;
    }
  };

  return {
    default: MockOpenAI,
  };
});
