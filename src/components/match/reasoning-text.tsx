'use client';

import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReasoningTextProps {
  reasoning: string;
  className?: string;
}

export function ReasoningText({ reasoning, className }: ReasoningTextProps) {
  return (
    <blockquote
      className={cn(
        'relative bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 rounded-r-lg',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-gray-800 italic leading-relaxed">{reasoning}</p>
      </div>
      <div className="absolute top-2 right-2">
        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
          AI 분석
        </span>
      </div>
    </blockquote>
  );
}
