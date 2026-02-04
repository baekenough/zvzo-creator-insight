'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

export interface MatchScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { width: 120, height: 120, fontSize: 'text-xl' },
  md: { width: 180, height: 180, fontSize: 'text-3xl' },
  lg: { width: 240, height: 240, fontSize: 'text-4xl' },
};

export function MatchScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  animated = true,
  className = '',
}: MatchScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!animated) {
      setAnimatedScore(score);
      return;
    }

    let frame = 0;
    const totalFrames = 60;
    const increment = score / totalFrames;

    const animate = () => {
      frame++;
      setAnimatedScore(Math.min(score, frame * increment));
      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [score, animated]);

  const getColor = (score: number): string => {
    if (score >= 70) return '#10b981'; // green-500
    if (score >= 40) return '#f59e0b'; // yellow-500
    return '#ef4444'; // red-500
  };

  const getLabel = (score: number): string => {
    if (score >= 90) return '매우 높음';
    if (score >= 70) return '높음';
    if (score >= 40) return '보통';
    return '낮음';
  };

  const data = [
    {
      name: 'Score',
      value: animatedScore,
      fill: getColor(animatedScore),
    },
  ];

  const { width, height, fontSize } = sizeMap[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={`매칭 점수 ${score}점`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={size === 'sm' ? 8 : size === 'md' ? 12 : 16}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            background={{ fill: '#e5e7eb' }}
            dataKey="value"
            cornerRadius={10}
            max={100}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`font-bold ${fontSize}`} style={{ color: getColor(animatedScore) }}>
          {Math.round(animatedScore)}
        </p>
        {showLabel && (
          <p className="text-sm text-gray-600 mt-1">{getLabel(animatedScore)}</p>
        )}
      </div>
    </div>
  );
}
