'use client';

import { useState } from 'react';
import type { CreatorInsight } from '@/types';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AnalyzeButtonProps {
  creatorId: string;
  onComplete: (insight: CreatorInsight) => void;
  disabled?: boolean;
  className?: string;
}

type ButtonState = 'idle' | 'loading' | 'success';

export function AnalyzeButton({
  creatorId,
  onComplete,
  disabled = false,
  className,
}: AnalyzeButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');

  const handleAnalyze = async () => {
    setState('loading');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creatorId }),
      });

      if (!response.ok) {
        throw new Error('분석 요청 실패');
      }

      const insight: CreatorInsight = await response.json();
      setState('success');
      onComplete(insight);

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setState('idle');
      }, 2000);
    } catch (error) {
      console.error('분석 오류:', error);
      setState('idle');
      // You could add error handling/toast here
    }
  };

  const buttonContent = {
    idle: {
      icon: Sparkles,
      text: 'AI 분석 시작',
      className: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    loading: {
      icon: Loader2,
      text: '분석 중...',
      className: 'bg-blue-600 text-white cursor-wait',
    },
    success: {
      icon: CheckCircle2,
      text: '분석 완료',
      className: 'bg-green-600 text-white',
    },
  };

  const { icon: Icon, text, className: stateClassName } = buttonContent[state];

  return (
    <button
      onClick={handleAnalyze}
      disabled={disabled || state === 'loading' || state === 'success'}
      className={cn(
        'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        stateClassName,
        className
      )}
      aria-label={text}
      aria-busy={state === 'loading'}
    >
      <Icon className={cn('w-5 h-5', state === 'loading' && 'animate-spin')} />
      <span>{text}</span>
    </button>
  );
}
