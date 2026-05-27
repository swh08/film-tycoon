// ============================================================
// AnimatedNumber — 平滑数字滚动动画组件
// 使用 requestAnimationFrame + 缓动函数，从旧值平滑过渡到新值
// ============================================================
'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AnimatedNumberProps {
  value: number;
  formatFn?: (n: number) => string;
  className?: string;
  /** 动画持续时间（毫秒），默认 300ms */
  duration?: number;
}

/** 缓动函数：ease-out cubic */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimatedNumber({
  value,
  formatFn,
  className = '',
  duration = 300,
}: AnimatedNumberProps) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const currentDisplayValue = useRef(value);
  const animFrameId = useRef<number>(0);
  const startTime = useRef<number>(0);
  const startValue = useRef(value);
  const targetValue = useRef(value);
  const rafActive = useRef(false);
  const tickRef = useRef<() => void>(() => {});

  const format = useCallback(
    (n: number) => (formatFn ? formatFn(n) : n.toString()),
    [formatFn],
  );

  // Core animation tick
  const tick = useCallback(() => {
    const elapsed = performance.now() - startTime.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    const currentValue =
      startValue.current +
      (targetValue.current - startValue.current) * easedProgress;

    if (displayRef.current) {
      displayRef.current.textContent = format(currentValue);
    }

    currentDisplayValue.current = currentValue;

    if (progress < 1) {
      animFrameId.current = requestAnimationFrame(tickRef.current);
    } else {
      rafActive.current = false;
    }
  }, [duration, format]);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  // Start or jump animation when value changes
  useEffect(() => {
    // Skip if target is already set (avoid re-triggering)
    if (targetValue.current === value) return;

    // Cancel existing animation
    if (rafActive.current) {
      cancelAnimationFrame(animFrameId.current);
    }

    startValue.current = currentDisplayValue.current;
    targetValue.current = value;
    startTime.current = performance.now();
    rafActive.current = true;

    animFrameId.current = requestAnimationFrame(tickRef.current);

    return () => {
      if (rafActive.current) {
        cancelAnimationFrame(animFrameId.current);
        rafActive.current = false;
      }
    };
  }, [value]);

  // Initialize display text on mount
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.textContent = format(value);
    }
  }, []);

  return (
    <span ref={displayRef} className={className}>
      {format(value)}
    </span>
  );
}
