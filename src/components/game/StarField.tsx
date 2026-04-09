// ============================================================
// 星空背景 — 随机闪烁星星粒子
// ============================================================
'use client';

import { useMemo } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function StarField() {
  const stars = useMemo<Star[]>(() => {
    const result: Star[] = [];
    for (let i = 0; i < 30; i++) {
      result.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 2 + Math.random() * 4,
        delay: Math.random() * 3,
        opacity: 0.2 + Math.random() * 0.5,
      });
    }
    return result;
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.opacity > 0.5 ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)',
            boxShadow: star.opacity > 0.5
              ? '0 0 4px rgba(251, 191, 36, 0.4)'
              : '0 0 2px rgba(255, 255, 255, 0.2)',
            '--duration': `${star.duration}s`,
            '--delay': `${star.delay}s`,
            opacity: star.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
