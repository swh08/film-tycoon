// ============================================================
// 生意Tab — 主经营循环、产线卡片列表
// ============================================================
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { BUSINESSES } from '@/game/config/businesses';
import {
  calcBuyCost,
  calcMaxBuyable,
  calcMilestoneMultiplier,
  getNextMilestone,
  calcRevenuePerCycle,
  calcCycleTime,
  formatCash,
  formatNumber,
  formatTime,
} from '@/game/formulas';
import { usePopup } from '@/components/game/PopupLayer';
import type { TutorialStep } from '@/game/types';

export default function BusinessTab() {
  const {
    cash,
    businesses,
    adBuffs,
    upgrades,
    prestigePoints,
    buyBusiness,
    manualProduce,
    advanceTutorial,
    tutorialStep,
  } = useGameStore();

  const { showPopup } = usePopup();
  const [buyMode, setBuyMode] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    BUSINESSES.forEach(b => { init[b.id] = 1; });
    return init;
  });
  const prevMilestones = useRef<Record<number, number>>({});

  // 检查里程碑达成
  useEffect(() => {
    businesses.forEach(bs => {
      const def = BUSINESSES.find(b => b.id === bs.businessId);
      if (!def) return;

      const prevQty = prevMilestones.current[bs.businessId] ?? 0;
      const milestones = def.milestones.filter(m => prevQty < m.at && bs.quantity >= m.at);

      if (milestones.length > 0 && prevQty > 0) {
        // 显示里程碑弹窗
        const ms = milestones[milestones.length - 1]; // 取最高达成
        showPopup({
          id: `milestone_${bs.businessId}_${ms.at}`,
          type: 'milestone',
          content: (
            <div className="text-center">
              <div className="text-4xl mb-2">{def.icon}</div>
              <h3 className="text-xl font-bold mb-1">🎉 倍率爆发！</h3>
              <p className="text-lg mb-1">{def.name}</p>
              <p className="text-2xl font-black text-yellow-200">{ms.label}</p>
              <p className="text-sm text-white/80 mt-2">
                达到 {ms.at} 级 → 收益 ×{ms.multiplier}
              </p>
            </div>
          ),
        });

        // 新手引导：第一次里程碑
        if (tutorialStep === 'buy_10') {
          advanceTutorial('first_milestone');
        }
      }

      prevMilestones.current[bs.businessId] = bs.quantity;
    });
  }, [businesses, tutorialStep, advanceTutorial, showPopup]);

  const handleBuy = useCallback((businessId: number) => {
    const count = buyMode[businessId] ?? 1;
    const success = buyBusiness(businessId, count);

    // 新手引导：买到第10份
    const state = useGameStore.getState();
    if (success && tutorialStep === 'first_tap') {
      const bs = state.businesses.find(b => b.businessId === businessId);
      if (bs && bs.quantity >= 10) {
        advanceTutorial('buy_10');
      }
    }
  }, [buyMode, buyBusiness, tutorialStep, advanceTutorial]);

  const toggleBuyMode = (businessId: number) => {
    setBuyMode(prev => {
      const current = prev[businessId] ?? 1;
      const modes = [1, 10, 100];
      const nextIdx = (modes.indexOf(current) + 1) % modes.length;
      return { ...prev, [businessId]: modes[nextIdx] };
    });
  };

  return (
    <div className="flex flex-col gap-3 px-3 py-3 pb-4">
      {/* 新手引导提示 */}
      {tutorialStep === 'first_tap' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-3 text-white text-sm"
        >
          <p className="font-bold">👆 点击第一个产线开始贴膜！</p>
          <p className="text-xs text-white/70 mt-1">赚到第一笔钱后，开始购买更多产线</p>
        </motion.div>
      )}

      {tutorialStep === 'buy_10' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-3 text-white text-sm"
        >
          <p className="font-bold">📈 继续购买产线，达到10级触发倍率爆发！</p>
        </motion.div>
      )}

      {BUSINESSES.map((def) => {
        const bs = businesses.find(b => b.businessId === def.id);
        if (!bs) return null;
        const quantity = bs.quantity;

        // 检查是否解锁
        const isUnlocked = checkUnlock(def.id, businesses, cash);

        const buyCount = buyMode[def.id] ?? 1;
        const cost = quantity > 0 || def.id === 1
          ? calcBuyCost(def, quantity, buyCount)
          : def.baseCost;
        const canAfford = cash >= cost;
        const maxBuy = calcMaxBuyable(def, quantity, cash);

        // 收益计算
        const cycleTime = quantity > 0 ? calcCycleTime(def, { upgrades, prestigePoints, adBuffs } as any, adBuffs) : def.baseCycleSec;
        const revenue = quantity > 0 ? calcRevenuePerCycle(def, quantity, { upgrades, prestigePoints } as any, adBuffs) : def.baseRevenue;
        const milestoneMult = calcMilestoneMultiplier(def, quantity);
        const nextMs = getNextMilestone(def, quantity);

        return (
          <div
            key={def.id}
            className={`
              rounded-xl overflow-hidden border transition-all duration-200
              ${isUnlocked
                ? quantity > 0
                  ? 'bg-gradient-to-r from-gray-800 to-gray-850 border-yellow-600/40'
                  : 'bg-gradient-to-r from-gray-800/50 to-gray-850/50 border-gray-600/30'
                : 'bg-gray-900/50 border-gray-700/20 opacity-60'
              }
              ${!isUnlocked ? 'relative' : ''}
            `}
          >
            {/* 未解锁遮罩 */}
            {!isUnlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-950/80">
                <div className="text-center">
                  <span className="text-2xl">🔒</span>
                  <p className="text-xs text-gray-400 mt-1">累计收入达{formatCash(getUnlockTarget(def.id))}解锁</p>
                </div>
              </div>
            )}

            <div className="p-3">
              {/* 顶部：图标 + 名称 + 数量 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{def.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{def.name}</h3>
                    <p className="text-[10px] text-gray-400">{def.flavorText}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-yellow-400 tabular-nums">×{quantity}</span>
                  {milestoneMult > 1 && (
                    <div className="text-[10px] font-bold text-pink-400">
                      ×{formatNumber(milestoneMult)} 倍率
                    </div>
                  )}
                </div>
              </div>

              {/* 生产进度条 */}
              {quantity > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span>{formatCash(revenue)}/次</span>
                    <span>{formatTime(cycleTime)}/次</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-700 overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400"
                      style={{ width: `${(bs.progress ?? 0) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                    {/* 店长标识 */}
                    {bs.hasManager && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs">👤</div>
                    )}
                  </div>
                </div>
              )}

              {/* 下一个里程碑提示 */}
              {nextMs && quantity > 0 && (
                <div className="text-[10px] text-gray-500 mb-2">
                  🎯 下一里程碑: {nextMs.at}级 (还差{nextMs.at - quantity})
                  <span className="text-pink-400 ml-1">→ ×{nextMs.multiplier}</span>
                </div>
              )}

              {/* 操作区：购买按钮 */}
              {isUnlocked && (
                <div className="flex items-center gap-2">
                  {/* 贴膜按钮 / 自动化图标 */}
                  {quantity > 0 && (
                    bs.hasManager ? (
                      <div className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-cyan-600/20 text-cyan-400 text-xs font-bold select-none">
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 2v6h-6" />
                          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                          <path d="M3 22v-6h6" />
                          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                        自动
                      </div>
                    ) : bs.progress > 0 ? (
                      <div className="px-3 py-2 rounded-lg bg-yellow-600/30 text-yellow-400 text-xs font-bold">
                        生产中…
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          manualProduce(def.id);
                          if (tutorialStep === 'none') {
                            advanceTutorial('first_tap');
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600
                                   text-white text-xs font-bold active:scale-95 transition-transform
                                   hover:from-green-500 hover:to-emerald-500 shadow-md shadow-green-900/30"
                      >
                        贴膜！
                      </button>
                    )
                  )}

                  {/* 购买模式切换 */}
                  <button
                    onClick={() => toggleBuyMode(def.id)}
                    className="px-2 py-2 rounded-lg bg-gray-700 text-yellow-400 text-xs font-bold
                               active:scale-95 transition-transform hover:bg-gray-600"
                  >
                    ×{buyCount}
                  </button>

                  {/* 购买按钮 */}
                  <button
                    onClick={() => handleBuy(def.id)}
                    disabled={!canAfford}
                    className={`
                      flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-150
                      active:scale-[0.97]
                      ${canAfford
                        ? 'bg-gradient-to-r from-yellow-600 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-400 shadow-md shadow-amber-900/30'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    购买 ×{buyCount}
                    <br />
                    <span className="text-[10px] font-normal opacity-80">{formatCash(cost)}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 检查产线是否解锁 */
function checkUnlock(businessId: number, businesses: any[], cash: number): boolean {
  if (businessId === 1) return true; // 第一档永远解锁
  const def = BUSINESSES.find(b => b.id === businessId);
  if (!def) return false;
  
  const rule = def.unlockRule;
  switch (rule.type) {
    case 'total_earned': {
      // 使用store中的totalEarned
      const totalEarned = useGameStore.getState().totalEarned;
      return totalEarned >= rule.value;
    }
    case 'prestige_count': {
      const count = useGameStore.getState().totalPrestigeCount;
      return count >= rule.value;
    }
    default:
      return true;
  }
}

/** 获取解锁所需金额 */
function getUnlockTarget(businessId: number): number {
  const def = BUSINESSES.find(b => b.id === businessId);
  if (!def) return 0;
  if (def.unlockRule.type === 'total_earned') return def.unlockRule.value;
  return 0;
}
