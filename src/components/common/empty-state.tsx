import * as React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ message, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
        <FileQuestion className="h-10 w-10 text-gray-400" />
      </div>
      <p className="text-lg font-medium text-gray-900 mb-2">No data found</p>
      <p className="text-sm text-gray-600 mb-6 max-w-md">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
