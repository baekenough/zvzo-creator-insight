import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <p className="text-lg font-medium text-gray-900 mb-2">Something went wrong</p>
      <p className="text-sm text-gray-600 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="default">
          Try Again
        </Button>
      )}
    </div>
  );
}
