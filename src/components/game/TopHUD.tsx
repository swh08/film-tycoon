// ============================================================
// 顶栏资源 HUD
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatCash, formatNumberSmart, getMarketTrendText } from '@/game/formulas';
import { BUSINESSES } from '@/game/config/businesses';
import AnimatedNumber from './AnimatedNumber';

export interface TopHUDProps {
  onSettingsOpen?: () => void;
}

export default function TopHUD({ onSettingsOpen }: TopHUDProps) {
  const cash = useGameStore(s => s.cash);
  const diamonds = useGameStore(s => s.diamonds);
  const adBuffs = useGameStore(s => s.adBuffs);
  const businesses = useGameStore(s => s.businesses);
  const upgrades = useGameStore(s => s.upgrades);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const marketMultipliers = useGameStore(s => s.marketMultipliers);
  const activeEvents = useGameStore(s => s.activeEvents);

  const [buffTimers, setBuffTimers] = useState<{icon: string; text: string; color: string}[]>([]);
  const [eventTimers, setEventTimers] = useState<{icon: string; text: string; remaining: number}[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const state = useGameStore.getState();

      // 构建所有活跃buff的倒计时标签
      const buffs: {icon: string; text: string; color: string}[] = [];
      for (const buff of state.adBuffs) {
        switch (buff.type) {
          case 'double_revenue': {
            const m = Math.floor(buff.remainingSec / 60);
            const s = Math.floor(buff.remainingSec % 60);
            buffs.push({ icon: '🔥', text: `双倍 ${m}:${s.toString().padStart(2, '0')}`, color: 'from-red-500/80 to-orange-500/80 shadow-red-500/40' });
            break;
          }
          case 'rush_order':
            buffs.push({ icon: '🚀', text: `爆单 ${Math.ceil(buff.remainingSec)}s`, color: 'from-orange-500/80 to-yellow-500/80 shadow-orange-500/40' });
            break;
          case 'speed_boost':
            buffs.push({ icon: '⚡', text: `加速 ${Math.ceil(buff.remainingSec)}s`, color: 'from-cyan-500/80 to-blue-500/80 shadow-cyan-500/40' });
            break;
          case 'extra_offline': {
            const m = Math.floor(buff.remainingSec / 60);
            const s = Math.floor(buff.remainingSec % 60);
            buffs.push({ icon: '⏰', text: `离线加成 ${m}:${s.toString().padStart(2, '0')}`, color: 'from-green-500/80 to-emerald-500/80 shadow-green-500/40' });
            break;
          }
        }
      }
      setBuffTimers(buffs);

      // 事件计时器
      const events = state.activeEvents || [];
      if (events.length > 0) {
        setEventTimers(events.map(e => ({
          icon: e.icon,
          text: e.name,
          remaining: Math.ceil(e.remainingSec),
        })));
      } else {
        setEventTimers([]);
      }
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // 市场趋势汇总
  const activeMarkets = BUSINESSES
    .filter(b => {
      const bs = businesses.find(bs => bs.businessId === b.id);
      return bs && bs.quantity > 0;
    })
    .map(b => marketMultipliers[b.id] ?? 1);
  const avgMarket = activeMarkets.length > 0
    ? activeMarkets.reduce((a, b) => a + b, 0) / activeMarkets.length
    : 1;
  const marketTrend = getMarketTrendText(avgMarket);
  const hasMarketEvent = avgMarket < 0.85 || avgMarket > 1.15;

  // 第二行是否有内容
  const hasSecondRow = eventTimers.length > 0 || buffTimers.length > 0 || hasMarketEvent;

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 
                    border-b-2 border-yellow-500/50 shadow-lg shadow-amber-900/30">
      {/* === 第一行：核心资源 + 按钮 === */}
      <div className="flex items-center justify-between px-3 py-1.5">
        {/* 现金 */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <AnimatedNumber
            value={cash}
            formatFn={formatCash}
            className="text-base font-bold text-yellow-200 truncate tabular-nums"
          />
        </div>

        {/* 钻石 & 人脉 & 设置 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-0.5">
            <span className="text-sm">💎</span>
            <AnimatedNumber
              value={diamonds}
              className="text-sm font-bold text-cyan-300 tabular-nums"
              formatFn={(n) => Math.floor(n).toString()}
            />
          </div>
          {prestigePoints > 0 && (
            <div className="flex items-center gap-0.5">
              <span className="text-xs">🤝</span>
              <AnimatedNumber
                value={prestigePoints}
                className="text-xs font-bold text-orange-300 tabular-nums"
                formatFn={formatNumberSmart}
              />
            </div>
          )}
          {onSettingsOpen && (
            <button
              onClick={onSettingsOpen}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-600/30 hover:bg-gray-600/50 transition-colors ml-0.5"
            >
              <span className="text-xs">⚙️</span>
            </button>
          )}
        </div>
      </div>

      {/* === 第二行：动态buff/事件/市场（无内容时自动隐藏） === */}
      {hasSecondRow && (
        <div className="flex items-center gap-1.5 px-3 pb-1.5 overflow-x-auto">
          {eventTimers.map((evt) => (
            <div
              key={evt.text}
              className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80
                             text-white text-[10px] font-bold animate-pulse shadow-md shadow-purple-500/40"
            >
              {evt.icon} {evt.remaining}s
            </div>
          ))}
          {buffTimers.map((buff, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 px-2 py-0.5 rounded-full bg-gradient-to-r ${buff.color}
                             text-white text-[10px] font-bold animate-pulse shadow-md`}
            >
              {buff.icon} {buff.text}
            </div>
          ))}
          {hasMarketEvent && (
            <div className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              avgMarket > 1.15 ? 'bg-green-600/80 text-green-100' : 'bg-red-600/80 text-red-100'
            }`}>
              {marketTrend.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
