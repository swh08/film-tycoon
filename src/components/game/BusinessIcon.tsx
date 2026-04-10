// ============================================================
// BusinessIcon — 生意图标组件，统一卡通手绘风格SVG
// ============================================================
'use client';
import React from 'react';

// 共用颜色常量（与stall图标风格一致）
const C = {
  skin: '#FBBF24', skinDark: '#D97706', skinLight: '#FDE68A',
  shirt: '#3B82F6', shirtDark: '#1D4ED8',
  hair: '#1F2937', eye: '#1F2937',
  white: 'white', apron: '#E2E8F0',
  wood: '#D97706', woodDark: '#92400E', woodLight: '#78350F',
  red: '#EF4444', redDark: '#DC2626',
  metal: '#9CA3AF', metalDark: '#6B7280', metalLight: '#D1D5DB',
  green: '#22C55E', greenDark: '#16A34A',
  purple: '#A78BFA', purpleDark: '#7C3AED',
  yellow: '#FBBF24', yellowDark: '#F59E0B',
  gold: '#F59E0B', goldDark: '#D97706', goldLight: '#FDE68A',
  cyan: '#67E8F9', cyanDark: '#06B6D4',
  blue: '#60A5FA', blueDark: '#2563EB', blueLight: '#93C5FD', bluePale: '#DBEAFE',
  pink: '#F472B6', pinkDark: '#EC4899',
};

// 共用人物头部
function Head({ cx, cy, r = 3.2 }: { cx: number; cy: number; r?: number }) {
  return <>
    <circle cx={cx} cy={cy} r={r} fill={C.skin} stroke={C.skinDark} strokeWidth="0.6" />
    <circle cx={cx - 1.3} cy={cy - 0.5} r="0.7" fill={C.eye} />
    <circle cx={cx + 1.3} cy={cy - 0.5} r="0.7" fill={C.eye} />
    <circle cx={cx - 1.1} cy={cy - 0.7} r="0.25" fill={C.white} />
    <circle cx={cx + 1.5} cy={cy - 0.7} r="0.25" fill={C.white} />
    <path d={`M${cx - 1.5} ${cy + 1.5}Q${cx} ${cy + 2.8} ${cx + 1.5} ${cy + 1.5}`} stroke={C.skinDark} strokeWidth="0.6" strokeLinecap="round" fill="none" />
  </>;
}

const SVG_ICONS: Record<string, () => React.ReactNode> = {

  // === 1. 路边钢化膜摊（已有） ===
  stall: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M2 6L12 1.5L22 6Z" fill="#EF4444" />
      <rect x="1.5" y="6" width="21" height="2.2" rx="0.5" fill="#DC2626" />
      <rect x="3" y="8.2" width="1.8" height="8" rx="0.3" fill="#A16207" />
      <rect x="19.2" y="8.2" width="1.8" height="8" rx="0.3" fill="#A16207" />
      <rect x="1.5" y="16" width="21" height="2.5" rx="0.8" fill="#D97706" stroke="#92400E" strokeWidth="0.5" />
      <rect x="4" y="18.5" width="1.5" height="3.5" rx="0.3" fill="#78350F" />
      <rect x="18.5" y="18.5" width="1.5" height="3.5" rx="0.3" fill="#78350F" />
      {Head({ cx: 12, cy: 10 })}
      <path d="M8.5 13.2Q12 14.5 15.5 13.2V16H8.5Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.3" />
      <path d="M9.5 14.2V16H14.5V14.2" fill="white" opacity="0.85" stroke="#CBD5E1" strokeWidth="0.3" />
      <rect x="10.5" y="14.8" width="3" height="0.8" rx="0.2" fill="#E2E8F0" />
      <circle cx="7.2" cy="15" r="1.3" fill="#FBBF24" stroke="#D97706" strokeWidth="0.3" />
      <circle cx="16.8" cy="15" r="1.3" fill="#FBBF24" stroke="#D97706" strokeWidth="0.3" />
      <rect x="8.8" y="14.5" width="3.2" height="1.8" rx="0.4" fill="#1F2937" />
      <rect x="9.1" y="14.7" width="2.6" height="1.2" rx="0.2" fill="#93C5FD" />
      <rect x="13" y="14.8" width="2.2" height="1.4" rx="0.3" fill="#9CA3AF" />
      <rect x="13.3" y="15.1" width="1.6" height="0.8" rx="0.15" fill="#D1D5DB" />
    </svg>
  ),

  // === 2. 校园快贴车 — 黑色面包车（矮扁造型） ===
  van: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 地面 */}
      <line x1="1" y1="20" x2="23" y2="20" stroke="#374151" strokeWidth="0.8" strokeDasharray="2 1.5" />
      {/* 车身 — 矮胖面包车，车顶约在y=8 */}
      <path d="M3.5 9Q3.5 8 5 8L16.5 8Q17.5 8 18.5 9L20 11.5Q20.5 12.5 20.5 13.5L20.5 17.5Q20.5 18.5 19.5 18.5L3.5 18.5Q2.5 18.5 2.5 17.5L2.5 12Q2.5 9 3.5 9Z" fill="#1F2937" stroke="#111827" strokeWidth="0.8" />
      {/* 车身高光条 */}
      <line x1="3.5" y1="10.5" x2="20" y2="10.5" stroke="#374151" strokeWidth="0.5" opacity="0.6" />
      {/* 车顶行李架 */}
      <rect x="7" y="7.5" width="9" height="0.6" rx="0.2" fill="#374151" />
      <line x1="9" y1="7.5" x2="9" y2="8.1" stroke="#374151" strokeWidth="0.3" />
      <line x1="14" y1="7.5" x2="14" y2="8.1" stroke="#374151" strokeWidth="0.3" />
      {/* 挡风玻璃（倾斜一体化） */}
      <path d="M16.8 9Q17.8 9.5 18.5 11L19.5 13.5L19.5 15L15.5 15L15.5 9.5L16.8 9Z" fill="#93C5FD" opacity="0.75" stroke="#374151" strokeWidth="0.3" />
      {/* 侧窗（面包车小方窗） */}
      <rect x="4.5" y="9.5" width="3" height="1.8" rx="0.3" fill="#1E3A5F" stroke="#374151" strokeWidth="0.3" />
      <rect x="8.5" y="9.5" width="3" height="1.8" rx="0.3" fill="#1E3A5F" stroke="#374151" strokeWidth="0.3" />
      <rect x="12.5" y="9.5" width="2.5" height="1.8" rx="0.3" fill="#1E3A5F" stroke="#374151" strokeWidth="0.3" />
      {/* 车身招牌 */}
      <rect x="3.8" y="13" width="12" height="2.5" rx="0.4" fill="#FDE68A" stroke="#D97706" strokeWidth="0.3" />
      <text x="9.8" y="14.7" textAnchor="middle" fill="#92400E" fontSize="1.2" fontWeight="bold">快张贴膜</text>
      {/* 车轮 */}
      <circle cx="6" cy="19" r="1.8" fill="#111827" stroke="#030712" strokeWidth="0.5" />
      <circle cx="6" cy="19" r="0.8" fill="#4B5563" />
      <circle cx="6" cy="19" r="0.3" fill="#6B7280" />
      <circle cx="17" cy="19" r="1.8" fill="#111827" stroke="#030712" strokeWidth="0.5" />
      <circle cx="17" cy="19" r="0.8" fill="#4B5563" />
      <circle cx="17" cy="19" r="0.3" fill="#6B7280" />
      {/* 前灯 */}
      <rect x="19.5" y="14" width="1" height="1.2" rx="0.2" fill="#FDE68A" />
      {/* 尾灯 */}
      <rect x="2.5" y="15" width="0.8" height="1.2" rx="0.15" fill="#FCA5A5" />
      {/* 侧滑门线 */}
      <line x1="4" y1="9" x2="4" y2="18.5" stroke="#374151" strokeWidth="0.4" />
    </svg>
  ),

  // === 3. 商场贴膜亭 — 高端岛式贴膜专柜+品牌LOGO ===
  mall: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 大理石地面 */}
      <rect x="1" y="20" width="22" height="2.5" rx="0.3" fill="#E2E8F0" />
      <line x1="3" y1="21" x2="21" y2="21" stroke="#CBD5E1" strokeWidth="0.3" />
      {/* 品牌背板（大面积深色+金边） */}
      <rect x="3" y="2" width="18" height="10" rx="1" fill="#1E293B" stroke="#F59E0B" strokeWidth="0.6" />
      {/* 品牌名称区域 */}
      <rect x="5" y="3" width="14" height="3" rx="0.5" fill="#0F172A" />
      <text x="12" y="5.3" textAnchor="middle" fill="#F59E0B" fontSize="2" fontWeight="bold">SHIELD</text>
      {/* 品牌Slogan */}
      <text x="12" y="8" textAnchor="middle" fill="#94A3B8" fontSize="0.7" letterSpacing="0.5">PROTECTION</text>
      {/* 背板装饰金线 */}
      <line x1="5" y1="9" x2="19" y2="9" stroke="#F59E0B" strokeWidth="0.3" opacity="0.5" />
      <line x1="5" y1="9.5" x2="19" y2="9.5" stroke="#F59E0B" strokeWidth="0.3" opacity="0.3" />
      {/* 展示台面（白色大理石+金边） */}
      <rect x="2" y="12" width="20" height="2" rx="0.5" fill="#F8FAFC" stroke="#F59E0B" strokeWidth="0.5" />
      <rect x="2" y="12" width="20" height="0.7" rx="0.3" fill="white" opacity="0.6" />
      {/* 台面边缘LED灯带效果 */}
      <rect x="2" y="13.8" width="20" height="0.3" fill="#FDE68A" opacity="0.5" />
      {/* 柜体主体（深色+玻璃感） */}
      <rect x="2.5" y="14" width="19" height="5.5" rx="0.6" fill="#1E293B" stroke="#334155" strokeWidth="0.4" />
      {/* 柜内展示手机（3台竖立展示） */}
      <rect x="5" y="14.5" width="2.2" height="3.8" rx="0.3" fill="#111827" stroke="#475569" strokeWidth="0.2" />
      <rect x="5.3" y="14.8" width="1.6" height="3" rx="0.15" fill="#0EA5E9" opacity="0.85" />
      <rect x="9" y="14.5" width="2.2" height="3.8" rx="0.3" fill="#111827" stroke="#475569" strokeWidth="0.2" />
      <rect x="9.3" y="14.8" width="1.6" height="3" rx="0.15" fill="#8B5CF6" opacity="0.85" />
      <rect x="13" y="14.5" width="2.2" height="3.8" rx="0.3" fill="#111827" stroke="#475569" strokeWidth="0.2" />
      <rect x="13.3" y="14.8" width="1.6" height="3" rx="0.15" fill="#10B981" opacity="0.85" />
      {/* 玻璃反光效果 */}
      <rect x="2.5" y="14" width="19" height="5.5" rx="0.6" fill="white" opacity="0.04" />
      <line x1="4" y1="14" x2="3.5" y2="19.5" stroke="white" strokeWidth="0.3" opacity="0.12" />
      {/* 两侧柱灯 */}
      <rect x="1" y="6" width="1.5" height="10" rx="0.3" fill="#F59E0B" opacity="0.7" />
      <circle cx="1.75" cy="6" r="0.8" fill="#FDE68A" />
      <rect x="21.5" y="6" width="1.5" height="10" rx="0.3" fill="#F59E0B" opacity="0.7" />
      <circle cx="22.25" cy="6" r="0.8" fill="#FDE68A" />
    </svg>
  ),

  // === 4. 连锁门店 — 店铺门面+招牌 ===
  store: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 店面外墙 */}
      <rect x="2" y="4" width="20" height="17" rx="1" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.6" />
      {/* 招牌底板 */}
      <rect x="2" y="4" width="20" height="4.5" rx="1" fill="#2563EB" />
      {/* 招牌文字 */}
      <text x="12" y="7.2" textAnchor="middle" fill="white" fontSize="2.8" fontWeight="bold">贴膜</text>
      {/* 招牌装饰灯 */}
      <circle cx="4.5" cy="8.5" r="0.5" fill="#FDE68A" />
      <circle cx="8" cy="8.5" r="0.5" fill="#FDE68A" />
      <circle cx="12" cy="8.5" r="0.5" fill="#FDE68A" />
      <circle cx="16" cy="8.5" r="0.5" fill="#FDE68A" />
      <circle cx="19.5" cy="8.5" r="0.5" fill="#FDE68A" />
      {/* 玻璃门 */}
      <rect x="8" y="10.5" width="8" height="10" rx="0.5" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="0.5" />
      {/* 门框 */}
      <line x1="12" y1="10.5" x2="12" y2="20.5" stroke="#60A5FA" strokeWidth="0.5" />
      {/* 左橱窗 */}
      <rect x="3" y="10.5" width="4.5" height="6" rx="0.3" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.3" />
      <rect x="3.5" y="12" width="3.5" height="3.5" rx="0.2" fill="#93C5FD" opacity="0.5" />
      {/* 右橱窗 */}
      <rect x="16.5" y="10.5" width="4.5" height="6" rx="0.3" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.3" />
      <rect x="17" y="12" width="3.5" height="3.5" rx="0.2" fill="#93C5FD" opacity="0.5" />
      {/* 地面 */}
      <rect x="1" y="20.5" width="22" height="1" rx="0.3" fill="#CBD5E1" />
      {/* 遮阳棚条纹 */}
      <path d="M2 4L3 5.5L4 4L5 5.5L6 4L7 5.5L8 4L9 5.5L10 4L11 5.5L12 4L13 5.5L14 4L15 5.5L16 4L17 5.5L18 4L19 5.5L20 4L21 5.5L22 4" stroke="white" strokeWidth="0.8" opacity="0.3" />
    </svg>
  ),

  // === 5. 直播电商间 — 手机+三脚架+环形灯 ===
  livestream: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 三脚架 */}
      <line x1="12" y1="14" x2="12" y2="22" stroke="#6B7280" strokeWidth="1" />
      <line x1="12" y1="22" x2="6" y2="20" stroke="#6B7280" strokeWidth="0.8" />
      <line x1="12" y1="22" x2="18" y2="20" stroke="#6B7280" strokeWidth="0.8" />
      {/* 环形补光灯 */}
      <circle cx="12" cy="9" r="5.5" fill="none" stroke="#D1D5DB" strokeWidth="1.2" />
      <circle cx="12" cy="9" r="5.5" fill="#FDE68A" opacity="0.15" />
      {/* 灯珠 */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 12 + Math.cos(rad) * 5.5;
        const y = 9 + Math.sin(rad) * 5.5;
        return <circle key={i} cx={x} cy={y} r="0.4" fill="#FDE68A" />;
      })}
      {/* 手机 */}
      <rect x="8.5" y="6" width="7" height="11" rx="0.8" fill="#1F2937" stroke="#111827" strokeWidth="0.5" />
      <rect x="9" y="6.8" width="6" height="8.8" rx="0.3" fill="#0EA5E9" />
      {/* 手机屏幕内容：直播画面 */}
      <rect x="9.3" y="7.2" width="5.4" height="5.5" rx="0.2" fill="#1E3A5F" />
      {/* 直播主播小人 */}
      {Head({ cx: 12, cy: 9, r: 1.2 })}
      <rect x="11" y="10.2" width="2" height="1.5" rx="0.3" fill={C.shirt} />
      {/* 弹幕 */}
      <rect x="9.5" y="11" width="2" height="0.5" rx="0.1" fill="white" opacity="0.7" />
      <rect x="9.8" y="11.7" width="2.5" height="0.5" rx="0.1" fill="#FDE68A" opacity="0.7" />
      <rect x="10" y="12.4" width="1.8" height="0.5" rx="0.1" fill="#A78BFA" opacity="0.7" />
      {/* LIVE标签 */}
      <rect x="9.2" y="14.2" width="2" height="0.8" rx="0.2" fill="#EF4444" />
      <text x="10.2" y="14.8" textAnchor="middle" fill="white" fontSize="0.6" fontWeight="bold">LIVE</text>
      {/* 观看人数 */}
      <rect x="11.5" y="14.2" width="3.2" height="0.8" rx="0.2" fill="#1F2937" opacity="0.7" />
      <text x="13.1" y="14.8" textAnchor="middle" fill="white" fontSize="0.5">10w</text>
      {/* 手机home键 */}
      <circle cx="12" cy="16.3" r="0.35" fill="#374151" />
    </svg>
  ),

  // === 6. OEM代工厂 — 工厂+烟囱+传送带 ===
  factory: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 主厂房 */}
      <rect x="2" y="10" width="20" height="11" rx="0.8" fill="#94A3B8" stroke="#64748B" strokeWidth="0.6" />
      <rect x="2" y="10" width="20" height="2.5" rx="0.5" fill="#64748B" />
      {/* 烟囱1 */}
      <rect x="5" y="3" width="2.5" height="7" rx="0.3" fill="#78716C" stroke="#57534E" strokeWidth="0.4" />
      {/* 烟囱2 */}
      <rect x="16.5" y="4.5" width="2.5" height="5.5" rx="0.3" fill="#78716C" stroke="#57534E" strokeWidth="0.4" />
      {/* 烟雾 */}
      <circle cx="6.25" cy="2.2" r="1" fill="#CBD5E1" opacity="0.6" />
      <circle cx="5.5" cy="1" r="0.7" fill="#CBD5E1" opacity="0.4" />
      <circle cx="17.75" cy="3.5" r="0.8" fill="#CBD5E1" opacity="0.5" />
      {/* 窗户 */}
      <rect x="4" y="13.5" width="2.5" height="2.5" rx="0.3" fill="#DBEAFE" />
      <rect x="8" y="13.5" width="2.5" height="2.5" rx="0.3" fill="#DBEAFE" />
      <rect x="13.5" y="13.5" width="2.5" height="2.5" rx="0.3" fill="#DBEAFE" />
      <rect x="17.5" y="13.5" width="2.5" height="2.5" rx="0.3" fill="#DBEAFE" />
      {/* 大门 */}
      <rect x="10" y="15.5" width="4" height="5.5" rx="0.3" fill="#475569" stroke="#334155" strokeWidth="0.3" />
      <circle cx="13.2" cy="18.5" r="0.3" fill="#FDE68A" />
      {/* 传送带 */}
      <rect x="2" y="20" width="20" height="1.5" rx="0.3" fill="#475569" />
      <circle cx="5" cy="21.5" r="1" fill="#6B7280" />
      <circle cx="19" cy="21.5" r="1" fill="#6B7280" />
      {/* 传送带上的手机膜盒子 */}
      <rect x="7" y="18.5" width="2" height="1.5" rx="0.2" fill="#60A5FA" />
      <rect x="11" y="18.5" width="2" height="1.5" rx="0.2" fill="#60A5FA" />
      <rect x="15" y="18.5" width="2" height="1.5" rx="0.2" fill="#60A5FA" />
    </svg>
  ),

  // === 7. 纳米膜研发中心 — 立体显微镜+纳米观测 ===
  lab: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 底座 */}
      <rect x="4" y="18" width="16" height="2.5" rx="0.6" fill="#374151" stroke="#1F2937" strokeWidth="0.5" />
      <rect x="4" y="18" width="16" height="0.8" rx="0.3" fill="#4B5563" opacity="0.5" />
      {/* 支柱 */}
      <rect x="11" y="7" width="2" height="11" rx="0.4" fill="#6B7280" stroke="#4B5563" strokeWidth="0.3" />
      {/* 镜臂（从支柱向左弯曲到目镜） */}
      <path d="M11 9L11 7.5Q11 6.5 10 6.5L7 6.5Q6 6.5 6 7.5L6 9" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
      {/* 目镜（上方倾斜） */}
      <rect x="4" y="3" width="3.5" height="4.5" rx="0.8" fill="#4B5563" stroke="#374151" strokeWidth="0.5" />
      <rect x="4.3" y="3.3" width="2.9" height="1.5" rx="0.4" fill="#334155" />
      {/* 目镜镜片 */}
      <circle cx="5.75" cy="2.5" r="1.2" fill="#1E3A5F" stroke="#4B5563" strokeWidth="0.4" />
      <circle cx="5.75" cy="2.5" r="0.5" fill="#93C5FD" opacity="0.5" />
      {/* 载物台 */}
      <rect x="7" y="14.5" width="10" height="1.2" rx="0.3" fill="#6B7280" stroke="#4B5563" strokeWidth="0.3" />
      {/* 载玻片 */}
      <rect x="9" y="14.8" width="4" height="0.6" rx="0.1" fill="#67E8F9" opacity="0.8" />
      {/* 物镜（旋转头+镜头） */}
      <rect x="11" y="12" width="2" height="2.5" rx="0.3" fill="#4B5563" stroke="#374151" strokeWidth="0.3" />
      <rect x="10.5" y="11.5" width="3" height="1" rx="0.2" fill="#6B7280" />
      {/* 物镜镜头 */}
      <circle cx="12" cy="14.8" r="0.6" fill="#374151" />
      <circle cx="12" cy="14.8" r="0.3" fill="#0EA5E9" opacity="0.6" />
      {/* 调焦旋钮 */}
      <circle cx="13.5" cy="10" r="1" fill="#6B7280" stroke="#4B5563" strokeWidth="0.3" />
      <circle cx="13.5" cy="10" r="0.4" fill="#4B5563" />
      {/* 观测视野内的纳米结构（放大效果） */}
      <rect x="16" y="2" width="7" height="5.5" rx="0.5" fill="#0F172A" stroke="#3B82F6" strokeWidth="0.5" opacity="0.9" />
      {/* 放大镜边框 */}
      <circle cx="19.5" cy="4.75" r="3" fill="none" stroke="#93C5FD" strokeWidth="0.4" opacity="0.5" />
      {/* 纳米分子链结构 */}
      <circle cx="17.5" cy="4" r="0.5" fill="#22C55E" />
      <line x1="18" y1="4" x2="18.5" y2="3.5" stroke="#22C55E" strokeWidth="0.4" />
      <circle cx="18.5" cy="3.5" r="0.4" fill="#3B82F6" />
      <line x1="18.9" y1="3.5" x2="19.5" y2="4" stroke="#3B82F6" strokeWidth="0.4" />
      <circle cx="19.5" cy="4" r="0.5" fill="#F59E0B" />
      <line x1="20" y1="4" x2="20.8" y2="4.5" stroke="#F59E0B" strokeWidth="0.4" />
      <circle cx="20.8" cy="4.5" r="0.4" fill="#EF4444" />
      <line x1="17.5" y1="4.5" x2="18" y2="5" stroke="#22C55E" strokeWidth="0.4" />
      <circle cx="18" cy="5" r="0.35" fill="#A78BFA" />
      <line x1="18.35" y1="5" x2="19" y2="5.3" stroke="#A78BFA" strokeWidth="0.4" />
      <circle cx="19" cy="5.3" r="0.35" fill="#22D3EE" />
      {/* nm标注 */}
      <text x="19.5" y="6.8" textAnchor="middle" fill="#94A3B8" fontSize="0.9" fontFamily="monospace">nm</text>
    </svg>
  ),

  // === 8. 品牌联名事业部 — 两人握手+品牌标志 ===
  partnership: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 左边人 */}
      {Head({ cx: 6, cy: 7 })}
      <path d="M3 9.5Q6 11 9 9.5V13H3Z" fill={C.shirt} stroke={C.shirtDark} strokeWidth="0.3" />
      <circle cx="9.5" cy="11" r="1.2" fill={C.skin} stroke={C.skinDark} strokeWidth="0.3" />
      {/* 右边人 */}
      {Head({ cx: 18, cy: 7 })}
      <path d="M15 9.5Q18 11 21 9.5V13H15Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="0.3" />
      <circle cx="14.5" cy="11" r="1.2" fill={C.skin} stroke={C.skinDark} strokeWidth="0.3" />
      {/* 握手 */}
      <path d="M9.5 10.5Q12 13 14.5 10.5" stroke={C.skin} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M10 11.5Q12 13.5 14 11.5" stroke={C.skinDark} strokeWidth="0.5" strokeLinecap="round" fill="none" />
      {/* 闪光效果 */}
      <circle cx="12" cy="8" r="0.5" fill="#FDE68A" />
      <line x1="12" y1="6.5" x2="12" y2="7.2" stroke="#FDE68A" strokeWidth="0.4" />
      <line x1="10.5" y1="8" x2="11.2" y2="8" stroke="#FDE68A" strokeWidth="0.4" />
      <line x1="12.8" y1="8" x2="13.5" y2="8" stroke="#FDE68A" strokeWidth="0.4" />
      {/* 品牌标签 */}
      <rect x="3" y="15" width="7" height="3.5" rx="0.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.4" />
      <text x="6.5" y="17.2" textAnchor="middle" fill="#92400E" fontSize="1.2" fontWeight="bold">LV</text>
      <rect x="14" y="15" width="7" height="3.5" rx="0.5" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="0.4" />
      <text x="17.5" y="17.2" textAnchor="middle" fill="#7C3AED" fontSize="1.2" fontWeight="bold">膜</text>
      {/* 联名箭头 */}
      <path d="M10.5 16.5L13.5 16.5" stroke="#F59E0B" strokeWidth="0.8" />
      <path d="M13 15.8L13.5 16.5L13 17.2" stroke="#F59E0B" strokeWidth="0.6" fill="none" />
      {/* 底部装饰 */}
      <rect x="5" y="20" width="14" height="1.5" rx="0.3" fill="#F59E0B" opacity="0.3" />
      <text x="12" y="21.2" textAnchor="middle" fill="#D97706" fontSize="0.9">CO-BRANDED</text>
    </svg>
  ),

  // === 9. 海外分销中心 — 地球 ===
  globe: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs><clipPath id="gc"><circle cx="12" cy="12" r="9.5" /></clipPath></defs>
      <circle cx="12" cy="12" r="9.5" fill="#1E40AF" />
      <g clipPath="url(#gc)">
        {/* 北美洲：左上，加拿大横跨上方，美国向东收窄到佛罗里达/墨西哥 */}
        <path d="M2.5 5L5 3.5L9 3.5L10 5L9.5 6.5L8.5 7.5L7 8.5L5 9L3.5 8L2.5 6.5Z" fill="#34D399" />
        {/* 中美洲连接 */}
        <path d="M5 9L6.5 8.5L7 9.5L6 10.5L5 10Z" fill="#34D399" />
        {/* 南美洲：北美洲下方，巴西凸出向东，向南收窄 */}
        <path d="M6.5 10.5L9 10L10 11L10.5 13L10 15.5L9.5 17.5L9 19.5L8 20.5L7 20L6.5 18L6.5 15L6.5 13Z" fill="#34D399" />
        {/* 欧洲：北非上方，小块 */}
        <path d="M10 4L12 3.5L13.5 4L14.5 5.5L14 7L12.5 7.5L11 7L10 6L10 4Z" fill="#34D399" />
        {/* 非洲：欧洲下方，撒哈拉宽，好望角尖 */}
        <path d="M11 7.5L14 7L15.5 8.5L16 11L16 14L15.5 16.5L14.5 18L13 19L11.5 18L11 15.5L11 13L11 10Z" fill="#34D399" />
        {/* 亚洲：右上最大，从俄罗斯到东南亚 */}
        <path d="M15 3L18 2.5L20.5 4L21.5 6.5L21 9L20 10.5L18 11L16 10.5L15 9L14.5 7L15 5Z" fill="#34D399" />
        {/* 印度半岛：亚洲下方三角形 */}
        <path d="M16.5 10.5L18 10L19 11.5L18.5 13.5L17 14L16 13L16 11.5Z" fill="#34D399" />
        {/* 东南亚岛屿 */}
        <path d="M19 12L20 11.5L21 12.5L20 13.5Z" fill="#34D399" />
        {/* 澳洲：右下 */}
        <path d="M18 15L20 14.5L21 15.5L20.5 17L19 17.5L18 17Z" fill="#34D399" />
      </g>
      <ellipse cx="12" cy="12" rx="9.5" ry="3" fill="none" stroke="white" strokeWidth="0.2" opacity="0.2" />
      <line x1="12" y1="2.5" x2="12" y2="21.5" stroke="white" strokeWidth="0.2" opacity="0.2" />
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="white" strokeWidth="0.2" opacity="0.2" />
    </svg>
  ),

  // === 10. 全球屏保集团 — 皇冠+金色光芒 ===
  crown: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* 光芒 */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 12 + Math.cos(rad) * 8;
        const y1 = 12 + Math.sin(rad) * 8;
        const x2 = 12 + Math.cos(rad) * 10;
        const y2 = 12 + Math.sin(rad) * 10;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FDE68A" strokeWidth="0.6" opacity={0.3 + (i % 2) * 0.2} />;
      })}
      {/* 底盘 */}
      <rect x="4" y="16" width="16" height="3" rx="0.8" fill="#F59E0B" stroke="#D97706" strokeWidth="0.6" />
      <rect x="4" y="16" width="16" height="1" rx="0.3" fill="#FDE68A" opacity="0.5" />
      {/* 皇冠主体 */}
      <path d="M4 16L6 8L9 12L12 6L15 12L18 8L20 16Z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.6" />
      {/* 皇冠高光 */}
      <path d="M5 16L7 9L10 13L12 7.5L14 13L17 9L19 16Z" fill="#FDE68A" opacity="0.3" />
      {/* 宝石 */}
      <circle cx="9" cy="13.5" r="1" fill="#EF4444" stroke="#DC2626" strokeWidth="0.3" />
      <circle cx="9" cy="13.5" r="0.4" fill="#FCA5A5" opacity="0.6" />
      <circle cx="12" cy="12" r="1.2" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.3" />
      <circle cx="12" cy="12" r="0.5" fill="#93C5FD" opacity="0.6" />
      <circle cx="15" cy="13.5" r="1" fill="#22C55E" stroke="#16A34A" strokeWidth="0.3" />
      <circle cx="15" cy="13.5" r="0.4" fill="#86EFAC" opacity="0.6" />
      {/* 顶部装饰球 */}
      <circle cx="6" cy="8" r="1" fill="#FDE68A" stroke="#D97706" strokeWidth="0.4" />
      <circle cx="12" cy="6" r="1.2" fill="#FDE68A" stroke="#D97706" strokeWidth="0.4" />
      <circle cx="18" cy="8" r="1" fill="#FDE68A" stroke="#D97706" strokeWidth="0.4" />
      {/* 底座文字 */}
      <text x="12" y="18.5" textAnchor="middle" fill="#92400E" fontSize="1.5" fontWeight="bold">BOSS</text>
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
