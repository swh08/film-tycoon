// ============================================================
// 顶栏资源 HUD
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatCash, formatNumber, calcTotalIncomePerSecond, getMarketTrendText } from '@/game/formulas';
import { calcPrestigeMultiplier } from '@/game/config/prestige';
import { ACHIEVEMENTS } from '@/game/config/achievements';
import { BUSINESSES } from '@/game/config/businesses';
import AnimatedNumber from './AnimatedNumber';

export interface TopHUDProps {
  onAchievementOpen?: () => void;
  onSettingsOpen?: () => void;
}

export default function TopHUD({ onAchievementOpen, onSettingsOpen }: TopHUDProps) {
  const cash = useGameStore(s => s.cash);
  const diamonds = useGameStore(s => s.diamonds);
  const adBuffs = useGameStore(s => s.adBuffs);
  const businesses = useGameStore(s => s.businesses);
  const upgrades = useGameStore(s => s.upgrades);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const unlockedAchievements = useGameStore(s => s.unlockedAchievements);
  const marketMultipliers = useGameStore(s => s.marketMultipliers);
  const activeEvents = useGameStore(s => s.activeEvents);

  const [incomePerSec, setIncomePerSec] = useState(0);
  const [buffTimer, setBuffTimer] = useState('');
  const [eventTimers, setEventTimers] = useState<{icon: string; text: string; remaining: number}[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const state = useGameStore.getState();
      const ips = calcTotalIncomePerSecond(state, state.adBuffs);
      setIncomePerSec(ips);

      const doubleRev = state.adBuffs.find(b => b.type === 'double_revenue');
      const rush = state.adBuffs.find(b => b.type === 'rush_order');
      if (doubleRev) {
        const m = Math.floor(doubleRev.remainingSec / 60);
        const s = Math.floor(doubleRev.remainingSec % 60);
        setBuffTimer(`🔥双倍 ${m}:${s.toString().padStart(2, '0')}`);
      } else if (rush) {
        setBuffTimer(`🚀爆单 ${Math.ceil(rush.remainingSec)}s`);
      } else {
        setBuffTimer('');
      }

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
  const hasSecondRow = eventTimers.length > 0 || buffTimer || hasMarketEvent;

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 
                    border-b-2 border-yellow-500/50 shadow-lg shadow-amber-900/30">
      {/* === 第一行：核心资源 + 按钮 === */}
      <div className="flex items-center justify-between px-3 py-1.5">
        {/* 现金 + 收入 */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[10px] text-yellow-300/70 font-medium tracking-wider">💰</span>
          <AnimatedNumber
            value={cash}
            formatFn={formatCash}
            className="text-base font-bold text-yellow-100 truncate tabular-nums"
          />
          {incomePerSec > 0 && (
            <span className="text-[10px] text-green-400 font-medium flex-shrink-0">
              +<AnimatedNumber
                value={incomePerSec}
                formatFn={formatCash}
                className="text-[10px] text-green-400 font-medium tabular-nums"
              />/s
            </span>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex items-center gap-1 mx-2">
          {onAchievementOpen && (
            <button
              onClick={onAchievementOpen}
              className="relative flex items-center justify-center w-7 h-7 rounded-full bg-yellow-600/30 hover:bg-yellow-600/50 transition-colors"
            >
              <span className="text-xs">🏅</span>
              {unlockedAchievements.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 text-[7px] font-black text-white flex items-center justify-center">
                  {unlockedAchievements.length}
                </span>
              )}
            </button>
          )}
          {onSettingsOpen && (
            <button
              onClick={onSettingsOpen}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-600/30 hover:bg-gray-600/50 transition-colors"
            >
              <span className="text-xs">⚙️</span>
            </button>
          )}
        </div>

        {/* 钻石 & 人脉（单行紧凑） */}
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
                formatFn={(n) => Math.floor(n).toString()}
              />
              <span className="text-[10px] text-orange-400/80">×{formatNumber(calcPrestigeMultiplier(prestigePoints))}</span>
            </div>
          )}
        </div>
      </div>

      {/* === 第二行：动态buff/事件/市场（无内容时自动隐藏） === */}
      {hasSecondRow && (
        <div className="flex items-center gap-1.5 px-3 pb-1.5 overflow-x-auto">
          {eventTimers.map((evt, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80
                             text-white text-[10px] font-bold animate-pulse shadow-md shadow-purple-500/40"
            >
              {evt.icon} {evt.remaining}s
            </div>
          ))}
          {buffTimer && (
            <div className="flex-shrink-0 px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-bold 
                            animate-pulse shadow-md shadow-red-500/40">
              {buffTimer}
            </div>
          )}
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
