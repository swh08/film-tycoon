// ============================================================
// BusinessIcon — AI生成的卡通风生意图标
// ============================================================
'use client';

import React from 'react';
import Image from 'next/image';

interface BusinessIconProps {
  businessId: number;
  size?: number;
  className?: string;
}

export default function BusinessIcon({ businessId, size = 40, className = '' }: BusinessIconProps) {
  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/icons/icon_${businessId}.png`}
        alt={`生意图标 ${businessId}`}
        width={size}
        height={size}
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

/** 获取生意的渐变色class，用于背景等场景 */
const GRADIENTS: Record<number, string> = {
  1: 'from-yellow-400 to-amber-600',
  2: 'from-green-400 to-emerald-600',
  3: 'from-blue-400 to-indigo-600',
  4: 'from-purple-400 to-purple-700',
  5: 'from-pink-400 to-rose-600',
  6: 'from-orange-400 to-amber-600',
  7: 'from-cyan-400 to-teal-600',
  8: 'from-amber-400 to-yellow-600',
  9: 'from-sky-400 to-blue-600',
  10: 'from-yellow-300 to-amber-500',
};

export function getBusinessGradient(businessId: number): string {
  return GRADIENTS[businessId] ?? 'from-gray-400 to-gray-600';
}
