// ============================================================
// GameIcon — 全局 SVG 图标库，替代所有 emoji
// ============================================================
'use client';

import React from 'react';

interface GameIconProps {
  name: string;
  size?: number;
  className?: string;
}

interface EmojiIconProps {
  emoji: string;
  size?: number;
  className?: string;
}

export default function GameIcon({ name, size = 20, className = '' }: GameIconProps) {
  const renderFn = ICON_REGISTRY[name];
  if (!renderFn) return <span style={{ width: size, height: size }} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {renderFn()}
    </svg>
  );
}

export function EmojiIcon({ emoji, size = 20, className = '' }: EmojiIconProps) {
  const name = EMOJI_TO_NAME[emoji];
  if (!name) return <span className={className} style={{ fontSize: size }}>{emoji}</span>;
  return <GameIcon name={name} size={size} className={className} />;
}

const ICON_REGISTRY: Record<string, () => React.ReactNode> = {
  // === 货币 ===
  coin: () => (
    <>
      <circle cx="12" cy="12" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="#FDE68A" strokeWidth="0.8" opacity="0.5"/>
      <text x="12" y="16.5" textAnchor="middle" fill="#78350F" fontSize="13" fontWeight="bold" fontFamily="Arial">¥</text>
    </>
  ),
  diamond: () => (
    <>
      <path d="M12 2L4 9L12 22L20 9L12 2Z" fill="#67E8F9" stroke="#06B6D4" strokeWidth="1.2"/>
      <path d="M12 2L8 9H16L12 2Z" fill="#A5F3FC" opacity="0.6"/>
      <path d="M4 9H8L12 22L4 9Z" fill="#22D3EE" opacity="0.4"/>
      <path d="M20 9H16L12 22L20 9Z" fill="#0891B2" opacity="0.4"/>
    </>
  ),
  connection: () => (
    <>
      <circle cx="8" cy="10" r="4" fill="#FB923C" stroke="#EA580C" strokeWidth="1"/>
      <circle cx="16" cy="10" r="4" fill="#FBBF24" stroke="#D97706" strokeWidth="1"/>
      <path d="M10 12C10 12 12 14 14 12" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  'money-bag': () => (
    <>
      <path d="M8 8C6 10 5 13 6 16C7 19 10 21 12 21C14 21 17 19 18 16C19 13 18 10 16 8" fill="#34D399" stroke="#059669" strokeWidth="1.2"/>
      <path d="M9 8L12 4L15 8" fill="#6EE7B7" stroke="#059669" strokeWidth="1"/>
      <text x="12" y="16.5" textAnchor="middle" fill="#064E3B" fontSize="10" fontWeight="bold" fontFamily="Arial">¥</text>
    </>
  ),
  dollar: () => (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.2"/>
      <text x="12" y="15.5" textAnchor="middle" fill="#14532D" fontSize="11" fontWeight="bold" fontFamily="Arial">¥</text>
    </>
  ),
  bank: () => (
    <>
      <polygon points="12,3 2,9 22,9" fill="#FDE68A" stroke="#D97706" strokeWidth="1.2"/>
      <rect x="4" y="9" width="3" height="8" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"/>
      <rect x="10.5" y="9" width="3" height="8" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"/>
      <rect x="17" y="9" width="3" height="8" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"/>
      <rect x="2" y="17" width="20" height="3" rx="0.5" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8"/>
    </>
  ),
  // === 导航 ===
  briefcase: () => (
    <>
      <rect x="3" y="8" width="18" height="12" rx="2" fill="#92400E" stroke="#78350F" strokeWidth="1.2"/>
      <path d="M8 8V6C8 4.9 8.9 4 10 4H14C15.1 4 16 4.9 16 6V8" stroke="#78350F" strokeWidth="1.2" fill="none"/>
      <rect x="10" y="12" width="4" height="3" rx="0.5" fill="#FDE68A"/>
    </>
  ),
  'arrow-up': () => (
    <path d="M12 3L4 13H9V21H15V13H20L12 3Z" fill="#34D399" stroke="#059669" strokeWidth="1.2"/>
  ),
  people: () => (
    <>
      <circle cx="9" cy="7" r="3" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1"/>
      <path d="M3 20C3 16 6 13 9 13C12 13 15 16 15 20" stroke="#7C3AED" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="16" cy="7" r="2.5" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="0.8"/>
      <path d="M14 20C14 17 15.5 14 18 13" stroke="#7C3AED" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </>
  ),
  cart: () => (
    <>
      <path d="M3 6H5L8 16H17L19 9H7" stroke="#FBBF24" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="20" r="1.5" fill="#D97706"/>
      <circle cx="16" cy="20" r="1.5" fill="#D97706"/>
    </>
  ),
  medal: () => (
    <>
      <circle cx="12" cy="14" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5"/>
      <path d="M8 6L12 10L16 6" stroke="#B45309" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M12 2V6" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="12" y="17.5" textAnchor="middle" fill="#78350F" fontSize="9" fontWeight="bold">★</text>
    </>
  ),
  // === 状态 ===
  lock: () => (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" fill="#6B7280" stroke="#4B5563" strokeWidth="1.2"/>
      <path d="M8 11V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V11" stroke="#4B5563" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1.5" fill="#374151"/>
    </>
  ),
  check: () => (
    <>
      <circle cx="12" cy="12" r="10" fill="#22C55E" stroke="#16A34A" strokeWidth="1"/>
      <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  cross: () => (
    <>
      <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
      <path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </>
  ),
  warning: () => (
    <>
      <path d="M12 3L2 21H22L12 3Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2"/>
      <rect x="11" y="10" width="2" height="5" rx="1" fill="#78350F"/>
      <circle cx="12" cy="18" r="1.2" fill="#78350F"/>
    </>
  ),
  info: () => (
    <>
      <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="#2563EB" strokeWidth="1"/>
      <rect x="11" y="11" width="2" height="5" rx="1" fill="white"/>
      <circle cx="12" cy="7.5" r="1.2" fill="white"/>
    </>
  ),
  // === 增益 ===
  fire: () => (
    <>
      <path d="M12 2C12 2 6 8 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 8 12 2 12 2Z" fill="#F97316" stroke="#EA580C" strokeWidth="1"/>
      <path d="M12 8C12 8 9 12 9 15C9 16.7 10.3 18 12 18C13.7 18 15 16.7 15 15C15 12 12 8 12 8Z" fill="#FDE047"/>
    </>
  ),
  rocket: () => (
    <>
      <path d="M12 2C12 2 7 8 7 14L10 17H14L17 14C17 8 12 2 12 2Z" fill="#F87171" stroke="#DC2626" strokeWidth="1"/>
      <circle cx="12" cy="11" r="2" fill="#FEE2E2"/>
      <path d="M7 14L5 18L9 16" fill="#FB923C"/>
      <path d="M17 14L19 18L15 16" fill="#FB923C"/>
      <path d="M10 17L9 22H11L12 17" fill="#FCD34D"/>
      <path d="M14 17L13 22H15L14 17" fill="#FCD34D"/>
    </>
  ),
  lightning: () => (
    <>
      <path d="M13 2L5 14H11L10 22L19 10H13L13 2Z" fill="#FACC15" stroke="#EAB308" strokeWidth="1"/>
      <path d="M13 2L5 14H11L10 22L19 10H13L13 2Z" fill="#FEF08A" opacity="0.4"/>
    </>
  ),
  timer: () => (
    <>
      <circle cx="12" cy="13" r="9" fill="#374151" stroke="#1F2937" strokeWidth="1.5"/>
      <circle cx="12" cy="13" r="7" fill="#4B5563"/>
      <line x1="12" y1="13" x2="12" y2="8" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="13" x2="16" y2="13" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round"/>
      <rect x="10" y="2" width="4" height="3" rx="1" fill="#6B7280"/>
    </>
  ),
  stopwatch: () => (
    <>
      <circle cx="12" cy="13" r="9" fill="#374151" stroke="#1F2937" strokeWidth="1.5"/>
      <circle cx="12" cy="13" r="7" fill="#4B5563"/>
      <line x1="12" y1="13" x2="15" y2="9" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="13" r="1" fill="#34D399"/>
      <rect x="10" y="2" width="4" height="3" rx="1" fill="#6B7280"/>
      <line x1="15" y1="2" x2="18" y2="5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  // === 成就 ===
  trophy: () => (
    <>
      <path d="M7 4H17V10C17 14 14 17 12 17C10 17 7 14 7 10V4Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2"/>
      <path d="M5 4H7V8C7 8 5 8 5 6V4Z" fill="#F59E0B"/>
      <path d="M19 4H17V8C17 8 19 8 19 6V4Z" fill="#F59E0B"/>
      <rect x="10" y="17" width="4" height="3" fill="#D97706"/>
      <rect x="7" y="20" width="10" height="2" rx="1" fill="#B45309"/>
    </>
  ),
  star: () => (
    <path d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.3L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1"/>
  ),
  sparkle: () => (
    <path d="M12 2L13.5 9L20 10L13.5 12L12 22L10.5 12L4 10L10.5 9L12 2Z" fill="#FDE68A" stroke="#EAB308" strokeWidth="0.8"/>
  ),
  'sparkle-star': () => (
    <>
      <path d="M12 2L14 8L20 10L14 12L12 22L10 12L4 10L10 8L12 2Z" fill="#FEF08A" stroke="#EAB308" strokeWidth="1"/>
    </>
  ),
  target: () => (
    <>
      <circle cx="12" cy="12" r="10" fill="none" stroke="#EF4444" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="6" fill="none" stroke="#EF4444" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" fill="#EF4444"/>
    </>
  ),
  max: () => (
    <>
      <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" fill="none" stroke="#FBBF24" strokeWidth="2"/>
      <path d="M7 12L10 15L17 8" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  // === 图表 ===
  'chart-up': () => (
    <>
      <path d="M3 20L8 12L13 15L20 5" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M15 5H20V10" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  'chart-down': () => (
    <>
      <path d="M3 4L8 12L13 9L20 19" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M15 19H20V14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  chart: () => (
    <>
      <rect x="3" y="12" width="4" height="9" rx="0.5" fill="#60A5FA"/>
      <rect x="10" y="7" width="4" height="14" rx="0.5" fill="#34D399"/>
      <rect x="17" y="3" width="4" height="18" rx="0.5" fill="#FBBF24"/>
    </>
  ),
  'arrow-right': () => (
    <>
      <line x1="4" y1="12" x2="18" y2="12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 6L18 12L12 18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </>
  ),
  // === 设置 ===
  gear: () => (
    <>
      <circle cx="12" cy="12" r="4" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1"/>
      <path d="M12 8C14.2 8 16 9.8 16 12C16 14.2 14.2 16 12 16C9.8 16 8 14.2 8 12C8 9.8 9.8 8 12 8Z" fill="none" stroke="#6B7280" strokeWidth="2"/>
      <path d="M19.4 15L21.2 16.5C21.5 16.7 21.6 17 21.4 17.3L20 19.7C19.9 20 19.5 20.1 19.2 19.9L17.8 19.2C17.5 19.1 17.2 19.2 17 19.4C16.6 19.8 16.2 20.1 15.7 20.3C15.4 20.4 15.3 20.7 15.3 21L15.3 22.5C15.3 22.8 15.1 23 14.8 23H9.2C8.9 23 8.7 22.8 8.7 22.5V21C8.7 20.7 8.6 20.4 8.3 20.3C7.8 20.1 7.4 19.8 7 19.4C6.8 19.2 6.5 19.1 6.2 19.2L4.8 19.9C4.5 20 4.2 19.9 4 19.7L2.6 17.3C2.4 17 2.5 16.7 2.8 16.5L4.6 15C4.7 14.7 4.5 14.3 4.6 14" stroke="#6B7280" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M4.6 9C4.7 8.7 4.5 8.3 4.2 8.2L2.8 7.5C2.5 7.3 2.4 7 2.6 6.7L4 4.3C4.1 4 4.5 3.9 4.8 4.1L6.2 4.8C6.5 4.9 6.8 4.8 7 4.6C7.4 4.2 7.8 3.9 8.3 3.7C8.6 3.6 8.7 3.3 8.7 3V1.5C8.7 1.2 8.9 1 9.2 1H14.8C15.1 1 15.3 1.2 15.3 1.5V3C15.3 3.3 15.4 3.6 15.7 3.7C16.2 3.9 16.6 4.2 17 4.6C17.2 4.8 17.5 4.9 17.8 4.8L19.2 4.1C19.5 4 19.8 4.1 20 4.3L21.4 6.7C21.6 7 21.5 7.3 21.2 7.5L19.8 8.2C19.5 8.3 19.3 8.7 19.4 9" stroke="#6B7280" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </>
  ),
  volume: () => (
    <>
      <path d="M3 9V15H7L12 19V5L7 9H3Z" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1"/>
      <path d="M15 8C16.2 9.3 16.2 14.7 15 16" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 5C20.5 7.5 20.5 16.5 18 19" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  'volume-low': () => (
    <>
      <path d="M3 9V15H7L12 19V5L7 9H3Z" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1"/>
      <path d="M15 8C16.2 9.3 16.2 14.7 15 16" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  music: () => (
    <>
      <circle cx="7" cy="18" r="3" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1"/>
      <circle cx="17" cy="16" r="3" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1"/>
      <line x1="10" y1="18" x2="10" y2="4" stroke="#7C3AED" strokeWidth="1.5"/>
      <line x1="20" y1="16" x2="20" y2="2" stroke="#7C3AED" strokeWidth="1.5"/>
      <path d="M10 4L20 2" stroke="#7C3AED" strokeWidth="1.5"/>
    </>
  ),
  save: () => (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.2"/>
      <rect x="7" y="3" width="10" height="6" rx="1" fill="#93C5FD"/>
      <rect x="7" y="14" width="10" height="7" rx="1" fill="#DBEAFE"/>
      <rect x="10" y="16" width="4" height="3" rx="0.5" fill="#3B82F6"/>
    </>
  ),
  upload: () => (
    <>
      <path d="M12 16V3M12 3L7 8M12 3L17 8" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 15V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V15" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  download: () => (
    <>
      <path d="M12 8V21M12 21L7 16M12 21L17 16" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 5V3C3 1.9 3.9 1 5 1H19C20.1 1 21 1.9 21 3V5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  trash: () => (
    <>
      <path d="M5 7H19L17.5 21H6.5L5 7Z" fill="#FCA5A5" stroke="#EF4444" strokeWidth="1.2"/>
      <path d="M3 7H21" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 7V5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7" stroke="#DC2626" strokeWidth="1.2" fill="none"/>
    </>
  ),
  number: () => <text x="12" y="18" textAnchor="middle" fill="#9CA3AF" fontSize="16" fontWeight="bold" fontFamily="Arial">#</text>,
  phone: () => (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" fill="#374151" stroke="#1F2937" strokeWidth="1.2"/>
      <rect x="8" y="4" width="8" height="13" rx="0.5" fill="#60A5FA"/>
      <circle cx="12" cy="19.5" r="1" fill="#6B7280"/>
    </>
  ),
  // === 商业 ===
  store: () => (
    <>
      <rect x="3" y="10" width="18" height="11" rx="1" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <path d="M2 10L4 5H20L22 10H2Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1"/>
      <rect x="7" y="14" width="4" height="7" rx="0.5" fill="#B45309" opacity="0.5"/>
      <rect x="13" y="14" width="4" height="7" rx="0.5" fill="#B45309" opacity="0.5"/>
    </>
  ),
  bike: () => (
    <>
      <circle cx="6" cy="16" r="4" fill="none" stroke="#4ADE80" strokeWidth="1.5"/>
      <circle cx="18" cy="16" r="4" fill="none" stroke="#4ADE80" strokeWidth="1.5"/>
      <path d="M6 16L10 8L14 12L18 16" stroke="#16A34A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="8" r="1" fill="#16A34A"/>
    </>
  ),
  mall: () => (
    <>
      <rect x="4" y="8" width="16" height="13" rx="1" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1"/>
      <path d="M3 8L12 3L21 8" stroke="#3B82F6" strokeWidth="1.5" fill="#BFDBFE"/>
      <rect x="7" y="12" width="3" height="4" rx="0.5" fill="#DBEAFE"/>
      <rect x="10.5" y="12" width="3" height="4" rx="0.5" fill="#DBEAFE"/>
      <rect x="14" y="12" width="3" height="4" rx="0.5" fill="#DBEAFE"/>
      <rect x="10" y="17" width="4" height="4" rx="0.5" fill="#3B82F6"/>
    </>
  ),
  factory: () => (
    <>
      <rect x="3" y="12" width="18" height="8" rx="1" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1"/>
      <rect x="5" y="8" width="3" height="4" fill="#6B7280"/>
      <rect x="10" y="6" width="3" height="6" fill="#6B7280"/>
      <rect x="15" y="4" width="3" height="8" fill="#6B7280"/>
      <rect x="5" y="14" width="4" height="3" rx="0.5" fill="#FBBF24" opacity="0.5"/>
      <rect x="11" y="14" width="4" height="3" rx="0.5" fill="#FBBF24" opacity="0.5"/>
    </>
  ),
  microscope: () => (
    <>
      <circle cx="12" cy="7" r="3" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1"/>
      <path d="M12 10V16" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 16H16" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 20H17" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
    </>
  ),
  globe: () => (
    <>
      <circle cx="12" cy="12" r="10" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.2"/>
      <path d="M12 2C14.5 5 16 8.5 16 12C16 15.5 14.5 19 12 22C9.5 19 8 15.5 8 12C8 8.5 9.5 5 12 2Z" fill="#0284C7" opacity="0.15" stroke="#0284C7" strokeWidth="0.8"/>
      <ellipse cx="12" cy="12" rx="5" ry="10" fill="none" stroke="#0284C7" strokeWidth="0.8" opacity="0.5"/>
    </>
  ),
  web: () => (
    <>
      <circle cx="12" cy="12" r="10" fill="none" stroke="#06B6D4" strokeWidth="1.5"/>
      <ellipse cx="12" cy="12" rx="5" ry="10" fill="none" stroke="#06B6D4" strokeWidth="0.8" opacity="0.5"/>
      <path d="M2 12H22" stroke="#06B6D4" strokeWidth="0.8" opacity="0.5"/>
    </>
  ),
  crown: () => (
    <>
      <path d="M3 17L5 7L9 12L12 5L15 12L19 7L21 17H3Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2"/>
      <rect x="3" y="17" width="18" height="3" rx="0.5" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8"/>
    </>
  ),
  robot: () => (
    <>
      <rect x="5" y="6" width="14" height="12" rx="2" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.2"/>
      <circle cx="9" cy="11" r="1.5" fill="#3B82F6"/>
      <circle cx="15" cy="11" r="1.5" fill="#3B82F6"/>
      <line x1="12" y1="3" x2="12" y2="6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="2.5" r="1" fill="#FBBF24"/>
    </>
  ),
  building: () => (
    <>
      <rect x="4" y="4" width="16" height="18" rx="1" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1"/>
      <rect x="7" y="7" width="3" height="3" rx="0.3" fill="#DBEAFE"/>
      <rect x="14" y="7" width="3" height="3" rx="0.3" fill="#DBEAFE"/>
      <rect x="7" y="12" width="3" height="3" rx="0.3" fill="#DBEAFE"/>
      <rect x="14" y="12" width="3" height="3" rx="0.3" fill="#DBEAFE"/>
      <rect x="10" y="17" width="4" height="5" rx="0.5" fill="#3B82F6"/>
    </>
  ),
  person: () => (
    <>
      <circle cx="12" cy="7" r="4" fill="#A5B4FC" stroke="#6366F1" strokeWidth="1"/>
      <path d="M4 21C4 16.6 7.6 13 12 13C16.4 13 20 16.6 20 21" stroke="#6366F1" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </>
  ),
  // === 杂项 ===
  gift: () => (
    <>
      <rect x="4" y="10" width="16" height="11" rx="1" fill="#F87171" stroke="#DC2626" strokeWidth="1"/>
      <rect x="2" y="7" width="20" height="5" rx="1" fill="#FB923C" stroke="#EA580C" strokeWidth="1"/>
      <rect x="10" y="7" width="4" height="14" fill="#FCD34D" opacity="0.6"/>
      <path d="M12 7C12 7 9 3 7 3C5 3 4 5 4 7" stroke="#FBBF24" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M12 7C12 7 15 3 17 3C19 3 20 5 20 7" stroke="#FBBF24" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </>
  ),
  tv: () => (
    <>
      <rect x="2" y="4" width="20" height="14" rx="2" fill="#374151" stroke="#1F2937" strokeWidth="1.2"/>
      <rect x="4" y="6" width="16" height="10" rx="0.5" fill="#60A5FA"/>
      <line x1="8" y1="18" x2="4" y2="22" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="18" x2="20" y2="22" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
    </>
  ),
  sleep: () => (
    <>
      <circle cx="9" cy="10" r="4" fill="#6366F1" stroke="#4F46E5" strokeWidth="1"/>
      <text x="15" y="8" fill="#A5B4FC" fontSize="7" fontWeight="bold" fontFamily="Arial">Z</text>
      <text x="17" y="5" fill="#818CF8" fontSize="5.5" fontWeight="bold" fontFamily="Arial">z</text>
    </>
  ),
  idea: () => (
    <>
      <path d="M12 2C8.1 2 5 5.1 5 9C5 12.1 7.1 14.6 10 15.3V18H14V15.3C16.9 14.6 19 12.1 19 9C19 5.1 15.9 2 12 2Z" fill="#FDE68A" stroke="#EAB308" strokeWidth="1"/>
      <rect x="10" y="18" width="4" height="2" rx="0.5" fill="#D97706"/>
      <rect x="10.5" y="20.5" width="3" height="1.5" rx="0.5" fill="#B45309"/>
    </>
  ),
  boom: () => (
    <>
      <circle cx="12" cy="12" r="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1"/>
      <path d="M12 4V2M12 22V20M4 12H2M22 12H20M6.3 6.3L4.9 4.9M19.1 19.1L17.7 17.7M17.7 6.3L19.1 4.9M4.9 19.1L6.3 17.7" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  cycle: () => (
    <>
      <path d="M4 12C4 7.6 7.6 4 12 4C14.8 4 17.2 5.4 18.7 7.5" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M20 12C20 16.4 16.4 20 12 20C9.2 20 6.8 18.6 5.3 16.5" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M18 4V8H14" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 20V16H10" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  recycle: () => (
    <>
      <path d="M12 3L18 8H15L17 14L11 9H14L12 3Z" fill="#34D399" stroke="#059669" strokeWidth="1"/>
      <path d="M6 14L12 9L9 16L3 11H6L6 14Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="1"/>
      <path d="M18 14L12 19L15 12L21 17H18L18 14Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1"/>
    </>
  ),
  pointer: () => (
    <path d="M7 3L7 18L11 14L15 21L18 19.5L14 13L19 13L7 3Z" fill="#F472B6" stroke="#EC4899" strokeWidth="1"/>
  ),
  confetti: () => (
    <>
      <path d="M3 3L8 10M21 3L16 10M12 2L12 10" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 3L8 10L12 12L16 10L21 3" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1" opacity="0.5"/>
      <circle cx="8" cy="16" r="1.5" fill="#60A5FA"/>
      <circle cx="16" cy="14" r="1" fill="#F472B6"/>
      <circle cx="12" cy="18" r="1.5" fill="#34D399"/>
    </>
  ),
  party: () => (
    <>
      <path d="M3 3L8 10M21 3L16 10M12 2L12 10" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 3L8 10L12 12L16 10L21 3" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.2" opacity="0.6"/>
      <circle cx="7" cy="17" r="1.5" fill="#60A5FA"/>
      <circle cx="17" cy="15" r="1.5" fill="#F472B6"/>
      <circle cx="12" cy="20" r="2" fill="#34D399"/>
    </>
  ),
  box: () => (
    <>
      <rect x="3" y="6" width="18" height="14" rx="2" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <path d="M3 10H21" stroke="#D97706" strokeWidth="1"/>
      <path d="M12 6V10" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 6L12 2L21 6" stroke="#D97706" strokeWidth="1.2" fill="#FBBF24"/>
    </>
  ),
  tag: () => (
    <path d="M3 3H11L21 12L13 20L3 10V3Z" fill="#F472B6" stroke="#EC4899" strokeWidth="1"/>
  ),
  tools: () => (
    <>
      <path d="M14.7 6.3C14 5.5 13 5 12 5C9.8 5 8 6.8 8 9C8 10 8.5 11 9.3 11.7L4.3 16.7C3.9 17.1 3.9 17.7 4.3 18.1L5.9 19.7C6.3 20.1 6.9 20.1 7.3 19.7L12.3 14.7C13 15.5 14 16 15 16C17.2 16 19 14.2 19 12C19 10 17.7 6.3 14.7 6.3Z" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1"/>
      <circle cx="15" cy="9" r="2" fill="#6B7280"/>
    </>
  ),
  scroll: () => (
    <>
      <path d="M5 3H15C17.2 3 19 4.8 19 7V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V3Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <line x1="9" y1="8" x2="15" y2="8" stroke="#B45309" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="9" y1="11" x2="15" y2="11" stroke="#B45309" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="9" y1="14" x2="13" y2="14" stroke="#B45309" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </>
  ),
  megaphone: () => (
    <>
      <path d="M3 12H7L14 5V19L7 12" fill="#F97316" stroke="#EA580C" strokeWidth="1"/>
      <path d="M14 5L20 2V22L14 19" fill="#FB923C" stroke="#EA580C" strokeWidth="1"/>
    </>
  ),
  graduate: () => (
    <>
      <path d="M12 3L2 9L12 15L22 9L12 3Z" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
      <path d="M22 9V16L12 22L2 16V9" stroke="#374151" strokeWidth="1.2" fill="none"/>
      <circle cx="12" cy="18" r="1" fill="#FBBF24"/>
    </>
  ),
  plane: () => (
    <path d="M12 2L14 8L22 10L14 12L12 22L10 12L2 10L10 8L12 2Z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1"/>
  ),
  clapperboard: () => (
    <>
      <rect x="2" y="6" width="20" height="15" rx="1" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
      <path d="M2 6L6 2H12L8 6" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"/>
      <path d="M8 6L12 2H18L14 6" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8"/>
      <path d="M14 6L18 2H22L18 6" fill="#FDE68A" stroke="#D97706" strokeWidth="0.8"/>
      <rect x="5" y="10" width="8" height="6" rx="0.5" fill="#4B5563"/>
    </>
  ),
  tie: () => (
    <>
      <path d="M10 2H14L15 6L12 8L9 6L10 2Z" fill="#6366F1" stroke="#4F46E5" strokeWidth="1"/>
      <path d="M9 6L12 22L15 6" fill="#818CF8" stroke="#4F46E5" strokeWidth="1"/>
    </>
  ),
  newspaper: () => (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <path d="M4 7H20" stroke="#D97706" strokeWidth="1"/>
      <line x1="7" y1="10" x2="17" y2="10" stroke="#B45309" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="7" y1="13" x2="17" y2="13" stroke="#B45309" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <line x1="7" y1="16" x2="13" y2="16" stroke="#B45309" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
    </>
  ),
  eye: () => (
    <>
      <path d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <circle cx="12" cy="12" r="4" fill="#78350F"/>
      <circle cx="12" cy="12" r="1.5" fill="#1C1917"/>
    </>
  ),
  atom: () => (
    <>
      <circle cx="12" cy="12" r="2" fill="#A78BFA"/>
      <ellipse cx="12" cy="12" rx="10" ry="5" fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.7"/>
      <ellipse cx="12" cy="12" rx="10" ry="5" fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.7" transform="rotate(60 12 12)"/>
      <ellipse cx="12" cy="12" rx="10" ry="5" fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.7" transform="rotate(-60 12 12)"/>
    </>
  ),
  flask: () => (
    <>
      <path d="M8 2H16M8 2V8L4 18C4 20 6 21 8 21H16C18 21 20 20 20 18L16 8V2" stroke="#7C3AED" strokeWidth="1.2" fill="#C4B5FD" opacity="0.3"/>
      <path d="M6 16C8 14 10 18 12 16C14 14 16 18 18 16" stroke="#7C3AED" strokeWidth="1" fill="none" opacity="0.5"/>
    </>
  ),
  temple: () => (
    <>
      <path d="M12 2L2 8V10H22V8L12 2Z" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <rect x="4" y="10" width="16" height="2" fill="#D97706"/>
      <path d="M6 12H18V20H6V12Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"/>
      <rect x="9" y="14" width="6" height="6" rx="0.5" fill="#D97706" opacity="0.5"/>
    </>
  ),
  'price-tag': () => (
    <path d="M3 3H11L21 12L13 20L3 10V3Z" fill="#F472B6" stroke="#EC4899" strokeWidth="1"/>
  ),
  'shield-check': () => (
    <>
      <path d="M12 2L3 6V12C3 17.3 7 21.5 12 22C17 21.5 21 17.3 21 12V6L12 2Z" fill="#86EFAC" stroke="#16A34A" strokeWidth="1"/>
      <path d="M8 12L11 15L16 9" stroke="#064E3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  clipboard: () => (
    <>
      <rect x="5" y="4" width="14" height="18" rx="1.5" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <rect x="8" y="2" width="8" height="4" rx="1" fill="#D97706"/>
      <line x1="8" y1="10" x2="16" y2="10" stroke="#B45309" strokeWidth="0.8" opacity="0.5"/>
      <line x1="8" y1="13" x2="16" y2="13" stroke="#B45309" strokeWidth="0.8" opacity="0.5"/>
    </>
  ),
  brain: () => (
    <>
      <path d="M12 3C7.6 3 4 6.6 4 11C4 12.4 4.4 13.7 5 14.8L12 21L19 14.8C19.6 13.7 20 12.4 20 11C20 6.6 16.4 3 12 3Z" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1"/>
      <path d="M12 3V21" stroke="#7C3AED" strokeWidth="0.8" opacity="0.5"/>
    </>
  ),
  ban: () => (
    <>
      <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#DC2626" strokeWidth="1"/>
      <line x1="5" y1="5" x2="19" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </>
  ),
  hourglass: () => (
    <>
      <path d="M5 2H19M5 22H19" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 2V6L12 12L17 6V2" stroke="#D97706" strokeWidth="1.2" fill="#FDE68A" opacity="0.3"/>
      <path d="M7 22V18L12 12L17 18V22" stroke="#D97706" strokeWidth="1.2" fill="#FDE68A" opacity="0.3"/>
      <path d="M9 14H15C15 14 14 18 12 18C10 18 9 14 9 14Z" fill="#FBBF24"/>
    </>
  ),
  contract: () => (
    <>
      <rect x="5" y="2" width="14" height="20" rx="1.5" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <line x1="8" y1="7" x2="16" y2="7" stroke="#B45309" strokeWidth="0.8" opacity="0.5"/>
      <line x1="8" y1="10" x2="16" y2="10" stroke="#B45309" strokeWidth="0.8" opacity="0.5"/>
      <path d="M14 16L16 18L19 14" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  'speed': () => (
    <>
      <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" fill="none" stroke="#06B6D4" strokeWidth="1.5"/>
      <path d="M12 2C7 2 3 6 3 11" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <line x1="12" y1="12" x2="18" y2="8" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="#06B6D4"/>
    </>
  ),
  'coins-stack': () => (
    <>
      <ellipse cx="12" cy="18" rx="9" ry="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1"/>
      <rect x="3" y="12" width="18" height="6" fill="#FBBF24" stroke="#D97706" strokeWidth="0.5"/>
      <ellipse cx="12" cy="12" rx="9" ry="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
      <rect x="3" y="6" width="18" height="6" fill="#FBBF24" stroke="#D97706" strokeWidth="0.5"/>
      <ellipse cx="12" cy="6" rx="9" ry="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1"/>
    </>
  ),
};

const EMOJI_TO_NAME: Record<string, string> = {
  // 货币
  '🪙': 'coin', '💎': 'diamond', '🤝': 'connection', '💰': 'money-bag', '💵': 'dollar', '🏦': 'bank', '🤑': 'money-bag',
  // 导航
  '💼': 'briefcase', '⬆️': 'arrow-up', '👥': 'people', '🛒': 'cart', '🏅': 'medal',
  // 状态
  '🔒': 'lock', '✅': 'check', '❌': 'cross', '⚠️': 'warning', 'ℹ️': 'info',
  // 增益
  '🔥': 'fire', '🚀': 'rocket', '⚡': 'lightning', '⏰': 'timer', '⏱️': 'stopwatch', '⏱': 'stopwatch', '⏳': 'hourglass',
  // 成就
  '🏆': 'trophy', '⭐': 'star', '🌟': 'sparkle', '💫': 'sparkle-star', '💯': 'max', '🎯': 'target',
  // 图表
  '📈': 'chart-up', '📉': 'chart-down', '📊': 'chart', '↗': 'chart-up', '↘': 'chart-down', '→': 'arrow-right',
  // 设置
  '⚙️': 'gear', '🔊': 'volume', '🔉': 'volume-low', '💾': 'save', '📤': 'upload', '📥': 'download', '🗑️': 'trash', '🔢': 'number',
  // 商业
  '🏪': 'store', '🚲': 'bike', '🏬': 'mall', '📱': 'phone', '🏭': 'factory', '🔬': 'microscope', '🌍': 'globe', '🌐': 'web',
  '👑': 'crown', '🤖': 'robot', '🏢': 'building', '🛍️': 'cart',
  // 其他
  '🎁': 'gift', '🎉': 'confetti', '🎊': 'party', '✨': 'sparkle-star', '📺': 'tv', '😴': 'sleep', '💡': 'idea', '💥': 'boom',
  '🔄': 'cycle', '♻️': 'recycle', '👆': 'pointer', '🖱️': 'pointer', '👤': 'person', '📦': 'box', '🏷️': 'tag',
  '📣': 'megaphone', '🔧': 'tools', '🛠️': 'tools', '📜': 'scroll', '🎓': 'graduate', '✈️': 'plane',
  '🎬': 'clapperboard', '👔': 'tie', '🚫': 'ban', '📰': 'newspaper', '👁️': 'eye', '🧠': 'brain',
  '📋': 'clipboard', '🏗️': 'building', '🛃': 'shield-check', '🌀': 'cycle', '⚛️': 'atom', '🧪': 'flask',
  '🏛️': 'temple', '🔖': 'price-tag', '🎵': 'music', '🔔': 'bell',
  // Manager
  '👨‍🔧': 'tools', '👩‍💼': 'person',
};
