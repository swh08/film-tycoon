// ============================================================
// 顶栏资源 HUD
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatCash, formatNumber, calcTotalIncomePerSecond } from '@/game/formulas';
import { calcPrestigeMultiplier } from '@/game/config/prestige';
import { ACHIEVEMENTS } from '@/game/config/achievements';

export interface TopHUDProps {
  onAchievementOpen?: () => void;
}

export default function TopHUD({ onAchievementOpen }: TopHUDProps) {
  const cash = useGameStore(s => s.cash);
  const diamonds = useGameStore(s => s.diamonds);
  const adBuffs = useGameStore(s => s.adBuffs);
  const businesses = useGameStore(s => s.businesses);
  const upgrades = useGameStore(s => s.upgrades);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const unlockedAchievements = useGameStore(s => s.unlockedAchievements);

  const [incomePerSec, setIncomePerSec] = useState(0);
  const [buffTimer, setBuffTimer] = useState('');

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
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between px-3 py-2 
                    bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 
                    border-b-2 border-yellow-500/50 shadow-lg shadow-amber-900/30">
      {/* 现金 */}
      <div className="flex flex-col items-start min-w-0 flex-1">
        <span className="text-[10px] text-yellow-300/70 font-medium tracking-wider">💰 现金</span>
        <span className="text-base font-bold text-yellow-100 truncate tabular-nums">
          {formatCash(cash)}
        </span>
        {incomePerSec > 0 && (
          <span className="text-[10px] text-green-400 font-medium">
            +{formatCash(incomePerSec)}/秒
          </span>
        )}
      </div>

      {/* 广告Buff计时 */}
      {buffTimer && (
        <div className="px-2 py-1 rounded-full bg-red-500/80 text-white text-xs font-bold 
                        animate-pulse shadow-md shadow-red-500/40">
          {buffTimer}
        </div>
      )}

      {/* 成就入口 */}
      {onAchievementOpen && (
        <button
          onClick={onAchievementOpen}
          className="relative flex items-center justify-center w-8 h-8 rounded-full bg-yellow-600/30 hover:bg-yellow-600/50 transition-colors"
        >
          <span className="text-sm">🏅</span>
          {unlockedAchievements.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 text-[8px] font-black text-white flex items-center justify-center">
              {unlockedAchievements.length}
            </span>
          )}
        </button>
      )}

      {/* 钻石 & 人脉 */}
      <div className="flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <span className="text-sm">💎</span>
          <span className="text-sm font-bold text-cyan-300 tabular-nums">{diamonds}</span>
        </div>
        {prestigePoints > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs">🤝</span>
            <span className="text-xs font-bold text-orange-300 tabular-nums">{prestigePoints}</span>
            <span className="text-[10px] text-orange-400/80">×{formatNumber(calcPrestigeMultiplier(prestigePoints))}</span>
          </div>
        )}
      </div>
    </div>
  );
}
