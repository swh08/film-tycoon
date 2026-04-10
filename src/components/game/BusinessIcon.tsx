// ============================================================
// BusinessIcon — 生意图标组件，支持自绘SVG + emoji fallback
// ============================================================
'use client';
import React from 'react';

const SVG_ICONS: Record<string, () => React.ReactNode> = {
  stall: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 棚顶三角 */}
      <path d="M2 6L12 1.5L22 6Z" fill="#EF4444" />
      {/* 棚顶横条 */}
      <rect x="1.5" y="6" width="21" height="2.2" rx="0.5" fill="#DC2626" />
      {/* 棚柱 */}
      <rect x="3" y="8.2" width="1.8" height="8" rx="0.3" fill="#A16207" />
      <rect x="19.2" y="8.2" width="1.8" height="8" rx="0.3" fill="#A16207" />
      {/* 桌面 */}
      <rect x="1.5" y="16" width="21" height="2.5" rx="0.8" fill="#D97706" stroke="#92400E" strokeWidth="0.5" />
      {/* 桌腿 */}
      <rect x="4" y="18.5" width="1.5" height="3.5" rx="0.3" fill="#78350F" />
      <rect x="18.5" y="18.5" width="1.5" height="3.5" rx="0.3" fill="#78350F" />
      {/* 人头 */}
      <circle cx="12" cy="10" r="3.2" fill="#FBBF24" stroke="#D97706" strokeWidth="0.6" />
      {/* 眼睛 */}
      <circle cx="10.7" cy="9.5" r="0.7" fill="#1F2937" />
      <circle cx="13.3" cy="9.5" r="0.7" fill="#1F2937" />
      {/* 眼睛高光 */}
      <circle cx="10.9" cy="9.3" r="0.25" fill="white" />
      <circle cx="13.5" cy="9.3" r="0.25" fill="white" />
      {/* 微笑 */}
      <path d="M10.5 11.5Q12 12.8 13.5 11.5" stroke="#92400E" strokeWidth="0.6" strokeLinecap="round" fill="none" />
      {/* 身体/衣服 */}
      <path d="M8.5 13.2Q12 14.5 15.5 13.2V16H8.5Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.3" />
      {/* 围裙 */}
      <path d="M9.5 14.2V16H14.5V14.2" fill="white" opacity="0.85" stroke="#CBD5E1" strokeWidth="0.3" />
      {/* 围裙口袋 */}
      <rect x="10.5" y="14.8" width="3" height="0.8" rx="0.2" fill="#E2E8F0" />
      {/* 左手 */}
      <circle cx="7.2" cy="15" r="1.3" fill="#FBBF24" stroke="#D97706" strokeWidth="0.3" />
      {/* 右手 */}
      <circle cx="16.8" cy="15" r="1.3" fill="#FBBF24" stroke="#D97706" strokeWidth="0.3" />
      {/* 桌上手机 */}
      <rect x="8.8" y="14.5" width="3.2" height="1.8" rx="0.4" fill="#1F2937" />
      <rect x="9.1" y="14.7" width="2.6" height="1.2" rx="0.2" fill="#93C5FD" />
      {/* 桌上贴膜工具 */}
      <rect x="13" y="14.8" width="2.2" height="1.4" rx="0.3" fill="#9CA3AF" />
      <rect x="13.3" y="15.1" width="1.6" height="0.8" rx="0.15" fill="#D1D5DB" />
    </svg>
  ),
};

export default function BusinessIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const svgFn = SVG_ICONS[icon];
  if (svgFn) {
    return <span className={className}>{svgFn()}</span>;
  }
  return <span className={className}>{icon}</span>;
}
