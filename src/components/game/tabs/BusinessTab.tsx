// ============================================================
// 生意Tab — 主经营循环、产线卡片列表
// ============================================================
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { BUSINESSES } from '@/game/config/businesses';
import { BUSINESS_UPGRADES } from '@/game/config/business-upgrades';
import {
  calcBuyCostWithDiscount,
  calcMaxBuyable,
  calcMilestoneMultiplier,
  getNextMilestone,
  calcRevenuePerCycle,
  calcCycleTime,
  calcAngelUpgradeEffects,
  getMarketTrendText,
  calcDetailedBreakdown,
  formatCash,
  formatNumber,
  formatTime,
} from '@/game/formulas';
import { usePopup } from '@/components/game/PopupLayer';
import { playTap, playBuy, playUIClick } from '@/game/sound';
import type { BusinessMode } from '@/game/types';

// ============================================================
// 产线专属升级弹窗内容 — 独立组件，实时订阅 store
// ============================================================
function BusinessUpgradePopupContent({ businessId }: { businessId: number }) {
  const cash = useGameStore(s => s.cash);
  const businesses = useGameStore(s => s.businesses);
  const purchasedBusinessUpgrades = useGameStore(s => s.purchasedBusinessUpgrades);

  const businessDef = BUSINESSES.find(b => b.id === businessId);
  if (!businessDef) return null;
  const upgrades = BUSINESS_UPGRADES.filter(u => u.businessId === businessId);
  const quantity = businesses.find(b => b.businessId === businessId)?.quantity ?? 0;

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="text-center mb-3">
        <span className="text-3xl">{businessDef.icon}</span>
        <h3 className="text-base font-black text-white mt-1">{businessDef.name} 专属升级</h3>
        <p className="text-[10px] text-gray-400">当前等级: ×{quantity}</p>
      </div>
      <div className="flex flex-col gap-2">
        {upgrades.map(upgrade => {
          const isPurchased = purchasedBusinessUpgrades.includes(upgrade.id);
          const canSee = quantity >= upgrade.unlockQuantity;
          const canAfford = cash >= upgrade.cost;

          return (
            <div
              key={upgrade.id}
              className={`rounded-xl p-3 border transition-all
                ${isPurchased
                  ? 'bg-green-900/20 border-green-500/30'
                  : canSee
                    ? 'bg-gray-700/50 border-gray-600/30'
                    : 'bg-gray-800/30 border-gray-700/20 opacity-50'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0
                  ${isPurchased ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                  {isPurchased ? '✅' : canSee ? upgrade.icon : '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{upgrade.name}</span>
                    {isPurchased ? (
                      <span className="text-green-400 text-[10px] font-bold">已购买</span>
                    ) : canSee ? (
                      <span className={`text-[10px] font-bold ${canAfford ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {formatCash(upgrade.cost)}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-[10px]">×{upgrade.unlockQuantity}解锁</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{upgrade.description}</p>
                  {!canSee && (
                    <p className="text-[10px] text-gray-600">拥有{upgrade.unlockQuantity}级后解锁</p>
                  )}
                </div>
              </div>
              {canSee && !isPurchased && (
                <button
                  onClick={() => {
                    useGameStore.getState().buyBusinessUpgrade(upgrade.id);
                  }}
                  disabled={!canAfford}
                  className={`mt-2 w-full py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.97]
                    ${canAfford
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-400'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  购买 · {formatCash(upgrade.cost)}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 收益分解详情弹窗 — 独立组件，实时订阅 store
// ============================================================
function BusinessDetailPopupContent({ businessId }: { businessId: number }) {
  const businesses = useGameStore(s => s.businesses);
  const upgrades = useGameStore(s => s.upgrades);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const adBuffs = useGameStore(s => s.adBuffs);
  const purchasedAngelUpgrades = useGameStore(s => s.purchasedAngelUpgrades);
  const purchasedBusinessUpgrades = useGameStore(s => s.purchasedBusinessUpgrades);
  const marketMultipliers = useGameStore(s => s.marketMultipliers);
  const managerLevels = useGameStore(s => s.managerLevels);
  const hiredManagers = useGameStore(s => s.hiredManagers);
  const businessModes = useGameStore(s => s.businessModes);
  const activeEvents = useGameStore(s => s.activeEvents);

  const businessDef = BUSINESSES.find(b => b.id === businessId);
  if (!businessDef) return null;

  const bs = businesses.find(b => b.businessId === businessId);
  const quantity = bs?.quantity ?? 0;

  // 构建临时 state 用于计算
  const tempState = {
    businesses,
    upgrades,
    prestigePoints,
    adBuffs,
    purchasedAngelUpgrades,
    purchasedBusinessUpgrades,
    marketMultipliers,
    managerLevels,
    hiredManagers,
    businessModes,
    activeEvents,
  } as any;

  const breakdown = quantity > 0
    ? calcDetailedBreakdown(businessDef, quantity, tempState, adBuffs)
    : null;

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="text-center mb-3">
        <span className="text-3xl">{businessDef.icon}</span>
        <h3 className="text-base font-black text-white mt-1">{businessDef.name}</h3>
        <p className="text-[10px] text-gray-400">收益分解详情</p>
      </div>

      {breakdown ? (
        <div className="space-y-3">
          {/* 基础信息 */}
          <div className="bg-gray-700/50 rounded-xl p-3 border border-gray-600/30">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">基础单价</span>
              <span className="text-white font-bold">{formatCash(breakdown.baseRevenue)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">数量</span>
              <span className="text-white font-bold">×{breakdown.quantity}</span>
            </div>
            <div className="border-t border-gray-600/50 my-1.5" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">基础总价</span>
              <span className="text-white font-bold">{formatCash(breakdown.baseTotal)}</span>
            </div>
          </div>

          {/* 乘数列表 */}
          {breakdown.items.length > 0 ? (
            <div className="bg-gray-700/50 rounded-xl p-3 border border-gray-600/30">
              <h4 className="text-[10px] text-gray-500 font-bold mb-2">📊 加成倍率</h4>
              <div className="space-y-1.5">
                {breakdown.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-300">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.displayValue}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-3 text-xs text-gray-500">
              暂无加成效果
            </div>
          )}

          {/* 最终结果 */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/20 rounded-xl p-3 border border-yellow-500/30">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">最终收益/次</span>
              <span className="text-yellow-400 font-black">{formatCash(breakdown.finalRevenue)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">最终周期</span>
              <span className="text-cyan-400 font-bold">{formatTime(breakdown.finalCycle)}</span>
            </div>
            <div className="border-t border-yellow-500/20 my-1.5" />
            <div className="flex justify-between text-sm">
              <span className="text-yellow-300 font-bold">收益/秒</span>
              <span className="text-yellow-200 font-black">{formatCash(breakdown.revenuePerSec)}/s</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 text-xs">
          购买该产线后查看收益分解
        </div>
      )}
    </div>
  );
}

export default function BusinessTab() {
  const {
    cash,
    diamonds,
    businesses,
    adBuffs,
    upgrades,
    prestigePoints,
    purchasedAngelUpgrades,
    purchasedBusinessUpgrades,
    marketMultipliers,
    businessModes,
    autoBuySettings,
    buyBusiness,
    manualProduce,
    advanceTutorial,
    tutorialStep,
    buyMode,
    setBuyMode,
    setBusinessMode,
    unlockAutoBuy,
    setAutoBuyInterval,
    toggleAutoBuy,
  } = useGameStore();

  const { showPopup } = usePopup();
  const prevMilestones = useRef<Record<number, number>>({});

  // 显示产线专属升级弹窗
  const showBusinessUpgradePopup = (businessId: number) => {
    showPopup({
      id: `biz_upgrades_${businessId}`,
      type: 'info',
      content: <BusinessUpgradePopupContent businessId={businessId} />,
    });
  };

  // 显示收益分解详情弹窗
  const showDetailPopup = (businessId: number) => {
    showPopup({
      id: `biz_detail_${businessId}`,
      type: 'info',
      content: <BusinessDetailPopupContent businessId={businessId} />,
    });
  };

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
    let count = buyMode;
    // 最大模式：动态计算能买多少
    if (count === 0) {
      const def = BUSINESSES.find(b => b.id === businessId);
      const bs = businesses.find(b => b.businessId === businessId);
      if (def && bs) {
        count = calcMaxBuyable(def, bs.quantity, cash, purchasedAngelUpgrades);
      }
      if (count <= 0) return;
    }
    const success = buyBusiness(businessId, count);

    // 新手引导：买到第10份
    const state = useGameStore.getState();
    if (success && tutorialStep === 'first_tap') {
      const bs = state.businesses.find(b => b.businessId === businessId);
      if (bs && bs.quantity >= 10) {
        advanceTutorial('buy_10');
      }
    }
  }, [buyMode, buyBusiness, tutorialStep, advanceTutorial, businesses, cash, purchasedAngelUpgrades]);

  const BUY_MODES = [
    { value: 1, label: '×1' },
    { value: 10, label: '×10' },
    { value: 100, label: '×100' },
    { value: 0, label: '最大' },
  ];

  return (
    <div className="flex flex-col gap-3 px-3 py-3 pb-4">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-yellow-400">🏪 我的生意</h2>
        <div className="flex items-center gap-2">
          {/* 全局购买模式切换 */}
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            {BUY_MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setBuyMode(m.value)}
                className={`px-2 py-1 text-[10px] font-bold transition-colors
                  ${buyMode === m.value
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                  }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">
            {businesses.filter(b => b.quantity > 0).length}/{BUSINESSES.length}
          </span>
        </div>
      </div>

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

        const buyModeVal = buyMode;
        // 实际购买数量（最大模式动态计算）
        const actualBuyCount = buyModeVal === 0
          ? calcMaxBuyable(def, quantity, cash, purchasedAngelUpgrades)
          : buyModeVal;
        const cost = quantity > 0 || def.id === 1
          ? calcBuyCostWithDiscount(def, quantity, actualBuyCount, purchasedAngelUpgrades)
          : Math.ceil(def.baseCost * (purchasedAngelUpgrades.length > 0 ? calcAngelUpgradeEffects(purchasedAngelUpgrades).globalCostReduce : 1));
        const canAfford = cash >= cost && actualBuyCount > 0;

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
                <div className="flex items-center gap-1.5">
                  {/* 详情按钮 */}
                  {quantity > 0 && (
                    <button
                      onClick={() => showDetailPopup(def.id)}
                      className="w-6 h-6 rounded-full bg-gray-700/80 hover:bg-gray-600/80 flex items-center justify-center text-[10px] text-gray-300 transition-colors active:scale-90"
                      title="收益分解详情"
                    >
                      ℹ️
                    </button>
                  )}
                  <div className="text-right">
                    <span className="text-lg font-black text-yellow-400 tabular-nums">×{quantity}</span>
                    {milestoneMult > 1 && (
                      <div className="text-[10px] font-bold text-pink-400">
                        ×{formatNumber(milestoneMult)} 倍率
                      </div>
                    )}
                  </div>
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
                      style={{ width: `${Math.min((bs.progress ?? 0) * 100, 100)}%` }}
                      transition={{ duration: 0.1 }}
                    />
                    {/* 店长标识 */}
                    {bs.hasManager && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs">👤</div>
                    )}
                  </div>
                </div>
              )}

              {/* 市场波动指示器 */}
              {quantity > 0 && marketMultipliers && marketMultipliers[def.id] !== undefined && (
                (() => {
                  const mMult = marketMultipliers[def.id] ?? 1;
                  const trend = getMarketTrendText(mMult);
                  const isAbnormal = mMult < 0.9 || mMult > 1.1;
                  return isAbnormal ? (
                    <div className={`text-[10px] font-bold mb-1 ${trend.color}`}>
                      📊 市场: {trend.text} (×{mMult.toFixed(2)})
                    </div>
                  ) : null;
                })()
              )}

              {/* 下一个里程碑提示 */}
              {nextMs && quantity > 0 && (
                <div className="text-[10px] text-gray-500 mb-1">
                  🎯 下一里程碑: {nextMs.at}级 (还差{nextMs.at - quantity})
                  <span className="text-pink-400 ml-1">→ ×{nextMs.multiplier}</span>
                </div>
              )}

              {/* 利润/速度模式切换 */}
              {quantity > 0 && (
                <div className="mb-2">
                  <div className="flex rounded-lg overflow-hidden border border-gray-600 w-fit">
                    <button
                      onClick={() => setBusinessMode(def.id, 'profit')}
                      className={`px-2 py-0.5 text-[10px] font-bold transition-all active:scale-95
                        ${(businessModes?.[def.id] === 'profit')
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                        }`}
                    >
                      💰 利润
                    </button>
                    <button
                      onClick={() => setBusinessMode(def.id, 'speed')}
                      className={`px-2 py-0.5 text-[10px] font-bold transition-all active:scale-95
                        ${(businessModes?.[def.id] === 'speed')
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                        }`}
                    >
                      ⚡ 速度
                    </button>
                    <button
                      onClick={() => {
                        useGameStore.setState(s => ({
                          businessModes: Object.fromEntries(
                            Object.entries(s.businessModes).filter(([k]) => parseInt(k) !== def.id)
                          ),
                        }));
                        useGameStore.getState().save();
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold transition-all active:scale-95
                        ${(!businessModes?.[def.id])
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400'
                        }`}
                    >
                      ⚖️ 默认
                    </button>
                  </div>
                  {businessModes?.[def.id] && (
                    <div className={`text-[9px] mt-0.5 ${
                      businessModes[def.id] === 'profit' ? 'text-yellow-500/70' : 'text-blue-400/70'
                    }`}>
                      {businessModes[def.id] === 'profit' ? '利润×1.5 速度×0.67' : '速度×2 利润×0.8'}
                    </div>
                  )}
                </div>
              )}

              {/* 操作区：贴膜/购买 + 专属升级 */}
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
                          playTap();
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

                  {/* 购买按钮 */}
                  <button
                    onClick={() => {
                      if (canAfford) playBuy(); else playUIClick();
                      handleBuy(def.id);
                    }}
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
                    购买 {buyModeVal === 0 ? `×${actualBuyCount}` : `×${actualBuyCount}`}
                    <br />
                    <span className="text-[10px] font-normal opacity-80">{formatCash(cost)}</span>
                  </button>

                  {/* 🤖 自动购买按钮 */}
                  {(() => {
                    const autoSetting = autoBuySettings?.[def.id];
                    if (!autoSetting && quantity > 0) {
                      // 未解锁：显示解锁按钮
                      return (
                        <button
                          onClick={() => unlockAutoBuy(def.id)}
                          disabled={diamonds < def.autoBuyUnlockCost}
                          className={`flex-shrink-0 px-2 py-2 rounded-lg text-xs font-bold transition-all duration-150
                            active:scale-95 border
                            ${diamonds >= def.autoBuyUnlockCost
                              ? 'bg-gray-700 border-cyan-500/30 text-cyan-400 hover:bg-gray-600'
                              : 'bg-gray-800 border-gray-600/30 text-gray-600 cursor-not-allowed'
                            }`}
                          title={`🤖 解锁自动购买（${def.autoBuyUnlockCost}💎）`}
                        >
                          🤖
                        </button>
                      );
                    } else if (autoSetting && quantity > 0) {
                      // 已解锁：显示开关
                      return (
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            onClick={() => toggleAutoBuy(def.id, !autoSetting.enabled)}
                            className={`w-8 h-8 rounded-lg text-sm font-bold transition-all duration-150
                              active:scale-95 border flex items-center justify-center
                              ${autoSetting.enabled
                                ? 'bg-cyan-600/30 border-cyan-400/50 text-cyan-300'
                                : 'bg-gray-700 border-gray-600/30 text-gray-500'
                              }`}
                            title={autoSetting.enabled ? `🤖 自动购买中（每${autoSetting.intervalSec}s）` : '🤖 自动购买已关闭'}
                          >
                            🤖
                          </button>
                          {autoSetting.enabled && (
                            <div className="flex rounded overflow-hidden border border-gray-600">
                              {[1, 5, 10, 30].map(sec => (
                                <button
                                  key={sec}
                                  onClick={() => setAutoBuyInterval(def.id, sec)}
                                  className={`px-1 py-0 text-[8px] font-bold transition-colors
                                    ${autoSetting.intervalSec === sec
                                      ? 'bg-cyan-600 text-white'
                                      : 'bg-gray-700 text-gray-500'
                                    }`}
                                >
                                  {sec}s
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* 专属升级按钮 */}
                  {(() => {
                    const bizUpgrades = BUSINESS_UPGRADES.filter(u => u.businessId === def.id);
                    if (bizUpgrades.length === 0 || quantity === 0) return null;
                    const purchased = bizUpgrades.filter(u => purchasedBusinessUpgrades.includes(u.id)).length;
                    const allBought = purchased === bizUpgrades.length;
                    const hasBuyable = bizUpgrades.some(u => !purchasedBusinessUpgrades.includes(u.id) && quantity >= u.unlockQuantity);
                    return (
                      <button
                        onClick={() => showBusinessUpgradePopup(def.id)}
                        className={`
                          flex-shrink-0 px-2.5 py-2 rounded-lg text-xs font-bold transition-all duration-150
                          active:scale-95 border
                          ${allBought
                            ? 'bg-green-600/20 border-green-500/30 text-green-400'
                            : hasBuyable
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-500 border-blue-400/30 text-white shadow-md shadow-blue-900/30'
                              : 'bg-gray-700 border-gray-600/30 text-gray-500'
                          }
                        `}
                      >
                        🔧 {purchased}/{bizUpgrades.length}
                      </button>
                    );
                  })()}
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
