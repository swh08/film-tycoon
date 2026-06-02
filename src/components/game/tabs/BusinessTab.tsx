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
import { useTranslation } from '@/i18n/useTranslation';
import BusinessIcon from '@/components/game/BusinessIcon';
import AssetIcon, { resolveSharedAssetId } from '@/components/game/AssetIcon';


// ============================================================
// 产线专属升级弹窗内容 — 独立组件，实时订阅 store
// ============================================================
function BusinessUpgradePopupContent({ businessId }: { businessId: number }) {
  const { t } = useTranslation();
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
        <BusinessIcon icon={businessDef.icon} className="text-3xl" />
        <h3 className="text-base font-black text-white mt-1">{t(businessDef.name)} {t('产线升级')}</h3>
        <p className="text-[10px] text-gray-400">{t('当前等级')}: ×{quantity}</p>
      </div>
      <div className="flex flex-col gap-2">
        {upgrades.map(upgrade => {
          const isPurchased = purchasedBusinessUpgrades.includes(upgrade.id);
          const canSee = quantity >= upgrade.unlockQuantity;
          const canAfford = cash >= upgrade.cost;

          return (
            <div
              key={upgrade.id}
              className={`rounded-xl p-3 transition-all
                ${isPurchased
                  ? 'bg-green-900/20'
                  : canSee
                    ? 'bg-gray-700/50'
                    : 'bg-gray-800/30 opacity-50'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0
                  ${isPurchased ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                  {isPurchased ? (
                    <AssetIcon id="status/check" size={22} />
                  ) : canSee && resolveSharedAssetId(upgrade.icon) ? (
                    <AssetIcon id={resolveSharedAssetId(upgrade.icon)!} size={22} />
                  ) : (
                    <AssetIcon id="status/lock" size={22} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t(upgrade.name)}</span>
                    {isPurchased ? (
                      <span className="text-green-400 text-[10px] font-bold">{t('已购买')}</span>
                    ) : canSee ? (
                      <span className={`text-[10px] font-bold ${canAfford ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {formatCash(upgrade.cost)}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-[10px]">×{upgrade.unlockQuantity} {t('解锁')}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{t(upgrade.description)}</p>
                  {!canSee && (
                    <p className="text-[10px] text-gray-600">{t('拥有')} {upgrade.unlockQuantity} {t('级后解锁')}</p>
                  )}
                </div>
              </div>
              {canSee && !isPurchased && (
                <button
                  onClick={() => {
                    useGameStore.getState().buyBusinessUpgrade(upgrade.id);
                  }}
                  disabled={!canAfford}
                  className={`mt-2 w-full py-2 rounded-lg text-xs font-bold transition-all duration-150
                    ${canAfford
                      ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-white hover:from-yellow-300 hover:to-amber-500 shadow-[0_3px_0_0_#92400e,0_4px_8px_rgba(120,53,15,0.3)] active:shadow-[0_1px_0_0_#92400e,0_2px_4px_rgba(120,53,15,0.2)] active:translate-y-[2px]'
                      : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]'
                    }`}
                >
                  {t('购买')} · {formatCash(upgrade.cost)}
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
  const { t } = useTranslation();
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
        <BusinessIcon icon={businessDef.icon} className="text-3xl" />
        <h3 className="text-base font-black text-white mt-1">{t(businessDef.name)}</h3>
        <p className="text-[10px] text-gray-400">{t('收益分解详情')}</p>
      </div>

      {breakdown ? (
        <div className="space-y-3">
          {/* 基础信息 */}
          <div className="bg-gray-700/50 rounded-xl p-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{t('基础单价')}</span>
              <span className="text-white font-bold">{formatCash(breakdown.baseRevenue)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{t('数量')}</span>
              <span className="text-white font-bold">×{breakdown.quantity}</span>
            </div>
            <div className="border-t border-gray-600/50 my-1.5" />
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{t('基础总价')}</span>
              <span className="text-white font-bold">{formatCash(breakdown.baseTotal)}</span>
            </div>
          </div>

          {/* 乘数列表 */}
          {breakdown.items.length > 0 ? (
            <div className="bg-gray-700/50 rounded-xl p-3">
              <h4 className="text-[10px] text-gray-500 font-bold mb-2 inline-flex items-center gap-1">
                <AssetIcon id="boost/lightning" size={12} />
                {t('加成倍率')}
              </h4>
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
              {t('暂无加成效果')}
            </div>
          )}

          {/* 最终结果 */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/20 rounded-xl p-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{t('最终收益/次')}</span>
              <span className="text-yellow-400 font-black">{formatCash(breakdown.finalRevenue)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{t('最终周期')}</span>
              <span className="text-cyan-400 font-bold">{formatTime(breakdown.finalCycle)}</span>
            </div>
            <div className="border-t border-yellow-500/20 my-1.5" />
            <div className="flex justify-between text-sm">
              <span className="text-yellow-300 font-bold">{t('收益/秒')}</span>
              <span className="text-yellow-200 font-black">{formatCash(breakdown.revenuePerSec)}/s</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 text-xs">
          {t('购买该产线后查看收益分解')}
        </div>
      )}
    </div>
  );
}

export default function BusinessTab() {
  const { t } = useTranslation();
  const {
    cash,
    businesses,
    adBuffs,
    upgrades,
    prestigePoints,
    purchasedAngelUpgrades,
    purchasedBusinessUpgrades,
    marketMultipliers,
    managerLevels,
    hiredManagers,
    businessModes,
    activeEvents,
    buyBusiness,
    manualProduce,
    advanceTutorial,
    tutorialStep,
    buyMode,
    setBuyMode,
    setBusinessMode,
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
              <div className="text-4xl mb-2"><BusinessIcon icon={def.icon} /></div>
              <h3 className="text-xl font-bold mb-1 inline-flex items-center justify-center gap-1">
                <AssetIcon id="boost/fire" size={24} />
                {t('倍率爆发！')}
              </h3>
              <p className="text-lg mb-1">{t(def.name)}</p>
              <p className="text-2xl font-black text-yellow-200">{t(ms.label)}</p>
              <p className="text-sm text-white/80 mt-2">
                {t('达到')} {ms.at} {t('级')} → {t('收益')} ×{ms.multiplier}
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
    { value: 0, label: t('最大') },
  ];

  return (
    <div className="flex flex-col gap-3 px-3 py-3 pb-4">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-yellow-400">
          <AssetIcon id="nav/business" size={18} />
          {t('我的生意')}
        </h2>
        <div className="flex items-center gap-2">
          {/* 全局购买模式切换 */}
          <div className="flex rounded-lg overflow-hidden">
            {BUY_MODES.map(m => (
              <button
                key={m.value}
                onClick={() => setBuyMode(m.value)}
                className={`px-2 py-1.5 text-[10px] font-bold transition-all duration-150
                  ${buyMode === m.value
                    ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-white shadow-[0_3px_0_0_#92400e]'
                    : 'bg-gradient-to-b from-gray-400 to-gray-600 text-gray-200 shadow-[0_3px_0_0_#374151] active:shadow-[0_1px_0_0_#374151] active:translate-y-[2px]'
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
          <p className="font-bold inline-flex items-center gap-1">
            <AssetIcon id="nav/business" size={16} />
            {t('点击第一个产线开始贴膜！')}
          </p>
          <p className="text-xs text-white/70 mt-1">{t('赚到第一笔钱后，开始购买更多产线')}</p>
        </motion.div>
      )}

      {tutorialStep === 'buy_10' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-3 text-white text-sm"
        >
          <p className="font-bold inline-flex items-center gap-1">
            <AssetIcon id="boost/lightning" size={16} />
            {t('继续购买产线，达到10级触发倍率爆发！')}
          </p>
        </motion.div>
      )}

      {BUSINESSES.map((def) => {
        const bs = businesses.find(b => b.businessId === def.id);
        if (!bs) return null;
        const quantity = bs.quantity;

        // 检查是否解锁
        const isUnlocked = checkUnlock(def.id, businesses);

        const buyModeVal = buyMode;
        // 实际购买数量（最大模式动态计算）
        const actualBuyCount = buyModeVal === 0
          ? calcMaxBuyable(def, quantity, cash, purchasedAngelUpgrades)
          : buyModeVal;
        const cost = quantity > 0 || def.id === 1
          ? calcBuyCostWithDiscount(def, quantity, actualBuyCount, purchasedAngelUpgrades)
          : Math.ceil(def.baseCost * (purchasedAngelUpgrades.length > 0 ? calcAngelUpgradeEffects(purchasedAngelUpgrades).globalCostReduce : 1));
        const canAfford = cash >= cost && actualBuyCount > 0;

        // 收益计算（传入完整state确保显示值与实际tick一致）
        const calcState = {
          upgrades, prestigePoints, adBuffs,
          purchasedBusinessUpgrades, purchasedAngelUpgrades,
          managerLevels, hiredManagers, businessModes, activeEvents,
        } as any;
        const cycleTime = quantity > 0 ? calcCycleTime(def, calcState, adBuffs) : def.baseCycleSec;
        const revenue = quantity > 0 ? calcRevenuePerCycle(def, quantity, calcState, adBuffs) : def.baseRevenue;
        const milestoneMult = calcMilestoneMultiplier(def, quantity);
        const nextMs = getNextMilestone(def, quantity);

        return (
          <div
            key={def.id}
            className={`
              rounded-xl overflow-hidden transition-all duration-200
              ${isUnlocked
                ? quantity > 0
                  ? 'bg-gradient-to-r from-gray-800/90 to-gray-900/90 shadow-lg shadow-yellow-900/10'
                  : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 shadow-md shadow-black/20'
                : 'bg-gray-900/50 opacity-60'
              }
              ${!isUnlocked ? 'relative' : ''}
            `}
          >
            {/* 未解锁遮罩 */}
            {!isUnlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-950/80">
                <div className="text-center">
                  <AssetIcon id="status/lock" size={28} />
                  <p className="text-xs text-gray-400 mt-1">{t('累计收入达')}{formatCash(getUnlockTarget(def.id))}{t('解锁')}</p>
                </div>
              </div>
            )}

            <div className="p-3">
              {/* === AC风格：左侧圆形头像 + 右侧信息 === */}
              <div className="flex items-start gap-3 mb-2">
                {/* 左侧：圆形头像 + 里程碑进度条 */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="relative">
                    <div className={`
                      w-14 h-14 rounded-full flex items-center justify-center text-3xl
                      ${quantity > 0
                        ? 'bg-gradient-to-br from-yellow-500/30 to-amber-600/30 border-2 border-yellow-500/50'
                        : 'bg-gray-700/50 border-2 border-gray-600/30'
                      }
                    `}>
                      <BusinessIcon icon={def.icon} className="text-3xl -translate-y-2" />
                    </div>
                    {/* 数量/里程进度条角标 */}
                    {quantity > 0 && (
                      (() => {
                        let prevAt = 0;
                        for (let i = def.milestones.length - 1; i >= 0; i--) {
                          if (quantity >= def.milestones[i].at) {
                            prevAt = def.milestones[i].at;
                            break;
                          }
                        }
                        const progress = nextMs
                          ? Math.min((quantity - prevAt) / (nextMs.at - prevAt), 1)
                          : 1;
                        return (
                          <div className="absolute -bottom-1 left-0 w-14 h-5 rounded-full bg-gray-800 border border-yellow-500/50 overflow-hidden flex items-center justify-center">
                            <div
                              className={`absolute inset-0 rounded-full transition-all duration-300 ${nextMs ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-green-400 to-emerald-400'}`}
                              style={{ width: `${progress * 100}%`, opacity: 0.6 }}
                            />
                            <span className="relative text-[8px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] tabular-nums">
                              {quantity}{nextMs ? `/${nextMs.at}` : ''}
                            </span>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>

                {/* 右侧信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{t(def.name)}</h3>
                      <p className="text-[10px] text-gray-400">{t(def.flavorText)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {quantity > 0 && (
                        <button
                          onClick={() => showDetailPopup(def.id)}
                          className="w-5 h-5 rounded-full bg-gray-700/80 hover:bg-gray-600/80 flex items-center justify-center text-[9px] text-gray-400 transition-colors active:scale-90"
                          title={t('收益分解详情')}
                        >
                          <span className="text-white text-[9px] font-bold">{t('详')}</span>
                        </button>
                      )}
                      {milestoneMult > 1 && (
                        <span className="text-[10px] font-bold text-pink-400">×{formatNumber(milestoneMult)}</span>
                      )}
                    </div>
                  </div>
                  {quantity > 0 && (
                    <div className="flex items-center justify-between text-[10px] mt-1">
                      <span className="text-gray-400">{formatCash(revenue)}/{t('次')}</span>
                      <span className="text-gray-400">{formatTime(cycleTime)}/{t('次')}</span>
                    </div>
                  )}
                </div>
              </div>


              {/* === 生产进度条（细线） === */}
              {quantity > 0 && (
                <div className="mb-2 h-1.5 rounded-full bg-gray-700/50 overflow-hidden">
                  {cycleTime < 0.5 ? (
                    <div className="h-full rounded-full progress-wave" />
                  ) : (
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 progress-glow"
                      style={{ width: `${Math.min((bs.progress ?? 0) * 100, 100)}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  )}
                </div>
              )}

              {/* === 操作区 === */}
              {quantity > 0 && isUnlocked && (
                <div className="flex items-center gap-1.5 min-w-0">
                  {/* 1. 贴膜/自动 */}
                  {bs.hasManager ? (
                    <div className="flex items-center gap-1 px-1.5 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 text-[10px] font-bold select-none flex-shrink-0">
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2v6h-6" />
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                        <path d="M3 22v-6h6" />
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                      </svg>
                      {t('自动')}
                    </div>
                  ) : bs.progress > 0 ? (
                    <div className="px-2 py-1.5 rounded-lg bg-yellow-600/30 text-yellow-400 text-[10px] font-bold flex-shrink-0">
                      {t('生产中…')}
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
                      className="px-2 py-1.5 rounded-lg bg-gradient-to-b from-green-500 to-green-700
                                 text-white text-[10px] font-bold flex-shrink-0
                                 hover:from-green-400 hover:to-green-600
                                 shadow-[0_3px_0_0_#166534,0_4px_8px_rgba(21,128,61,0.3)]
                                 active:shadow-[0_1px_0_0_#166534,0_2px_4px_rgba(21,128,61,0.2)] active:translate-y-[2px]
                                 transition-all duration-150"
                    >
                      {t('贴膜！')}
                    </button>
                  )}

                  {/* 2. 策略下拉 */}
                  <select
                    value={businessModes?.[def.id] || ''}
                    onChange={(e) => {
                      const v = e.target.value as 'profit' | 'speed' | '';
                      if (v) {
                        setBusinessMode(def.id, v);
                      } else {
                        useGameStore.setState(s => ({
                          businessModes: Object.fromEntries(
                            Object.entries(s.businessModes).filter(([k]) => parseInt(k) !== def.id)
                          ),
                        }));
                        useGameStore.getState().save();
                      }
                    }}
                    className="flex-shrink-0 px-1.5 py-1.5 rounded-lg text-[10px] font-bold
                               bg-gradient-to-b from-gray-400 to-gray-600 text-gray-200
                               shadow-[0_3px_0_0_#374151]
                               cursor-pointer [&>option]:bg-gray-800 [&>option]:text-gray-100 [&>option]:py-1"
                  >
                    <option value="">{t('默认')}</option>
                    <option value="profit">{t('利润')}</option>
                    <option value="speed">{t('速度')}</option>
                  </select>

                  {/* 3. 专属升级 */}
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
                          flex-shrink-0 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-150
                          ${allBought
                            ? 'bg-gradient-to-b from-green-500 to-green-700 text-green-100 shadow-[0_3px_0_0_#166534,0_4px_8px_rgba(21,128,61,0.3)]'
                            : hasBuyable
                              ? 'bg-gradient-to-b from-blue-400 to-indigo-600 text-white shadow-[0_3px_0_0_#312e81,0_4px_8px_rgba(49,46,129,0.3)] active:shadow-[0_1px_0_0_#312e81,0_2px_4px_rgba(49,46,129,0.2)] active:translate-y-[2px]'
                              : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]'
                          }
                        `}
                      >
                        {purchased}/{bizUpgrades.length}
                      </button>
                    );
                  })()}

                  {/* 4. 购买 */}
                  <button
                    onClick={() => {
                      if (canAfford) playBuy(); else playUIClick();
                      handleBuy(def.id);
                    }}
                    disabled={!canAfford}
                    className={`
                      flex-1 min-w-0 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 truncate
                      active:scale-[0.97]
                      ${canAfford
                        ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-white hover:from-yellow-300 hover:to-amber-500 shadow-[0_3px_0_0_#92400e,0_4px_8px_rgba(120,53,15,0.3)] active:shadow-[0_1px_0_0_#92400e,0_2px_4px_rgba(120,53,15,0.2)] active:translate-y-[2px]'
                        : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]'
                      }
                    `}
                  >
                    {t('购买')}×{actualBuyCount} {formatCash(cost)}
                  </button>
                </div>
              )}

              {/* 未拥有时：头像 + 名称 + 购买 */}
              {!quantity && isUnlocked && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (canAfford) playBuy(); else playUIClick();
                      handleBuy(def.id);
                    }}
                    disabled={!canAfford}
                    className={`
                      flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-150
                      active:scale-[0.97]
                      ${canAfford
                        ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-white hover:from-yellow-300 hover:to-amber-500 shadow-[0_3px_0_0_#92400e,0_4px_8px_rgba(120,53,15,0.3)] active:shadow-[0_1px_0_0_#92400e,0_2px_4px_rgba(120,53,15,0.2)] active:translate-y-[2px]'
                        : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]'
                      }
                    `}
                  >
                    {t('购买')} {formatCash(cost)}
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
function checkUnlock(businessId: number, businesses: any[]): boolean {
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
