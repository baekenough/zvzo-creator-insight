import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function PageContainer({ children, maxWidth = 'xl', className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-12 lg:py-10',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
