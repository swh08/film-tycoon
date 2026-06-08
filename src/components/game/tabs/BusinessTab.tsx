// ============================================================
// Business tab
// ============================================================
'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { BUSINESSES } from '@/game/config/businesses';
import {
  calcAngelUpgradeEffects,
  calcBuyCostWithDiscount,
  calcCycleTime,
  calcMaxBuyable,
  calcMilestoneMultiplier,
  calcRevenuePerCycle,
  formatCash,
  formatNumber,
  formatTime,
  getNextMilestone,
} from '@/game/formulas';
import { playBuy, playTap, playUIClick } from '@/game/sound';
import { useTranslation } from '@/i18n/useTranslation';
import AssetIcon from '@/components/game/AssetIcon';
import BusinessIcon from '@/components/game/BusinessIcon';

const BUY_MODES = [
  { value: 1, label: 'x1' },
  { value: 10, label: 'x10' },
  { value: 100, label: 'x100' },
  { value: 0, label: 'MAX' },
];

function BusinessRank({ order, locked }: { order: number; locked: boolean }) {
  return (
    <div
      className={`absolute left-4 top-0 z-10 grid h-14 w-11 place-items-center rounded-b-lg border-x border-b text-2xl font-black shadow-[0_8px_16px_rgba(0,0,0,.4)] ${
        locked
          ? 'border-slate-400/55 bg-[linear-gradient(180deg,#64748b,#1f2937)] text-slate-100'
          : 'border-amber-200/70 bg-[linear-gradient(180deg,#ef4444,#f59e0b_55%,#7c2d12)] text-white'
      }`}
    >
      {order}
    </div>
  );
}

function StatPill({
  icon,
  value,
}: {
  icon: 'cash' | 'time' | 'status';
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="grid h-7 w-7 flex-shrink-0 place-items-center text-amber-200">
        {icon === 'cash' ? (
          <AssetIcon id="currency/coin" size={20} />
        ) : (
          <img
            src={`/assets/game/shared/ui/stat-${icon === 'time' ? 'time' : 'status'}-image2.png`}
            alt=""
            draggable={false}
            className="h-7 w-7 object-contain select-none"
          />
        )}
      </div>
      <div className="min-w-0 flex flex-1 items-baseline">
        <div className="min-w-0 flex-1 truncate text-base font-black leading-tight text-stone-100 tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function AutoFitTitle({
  text,
  locked,
  className = '',
}: {
  text: string;
  locked: boolean;
  className?: string;
}) {
  const BASE_SIZE = 24;
  const MIN_SIZE = 9;
  const FIT_MARGIN = 0.96;
  const ref = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(BASE_SIZE);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node || !context) return;

        const availableWidth = node.clientWidth;
        if (availableWidth <= 0) return;

        const style = getComputedStyle(node);
        context.font = `${style.fontWeight} ${BASE_SIZE}px ${style.fontFamily}`;
        const textWidth = context.measureText(text).width;
        const canvasSize = textWidth > availableWidth
          ? Math.max(MIN_SIZE, Math.floor((availableWidth / textWidth) * BASE_SIZE * FIT_MARGIN))
          : BASE_SIZE;
        const realSize = node.scrollWidth > availableWidth
          ? Math.max(MIN_SIZE, Math.floor((availableWidth / node.scrollWidth) * fontSize * FIT_MARGIN))
          : BASE_SIZE;
        const nextSize = Math.min(canvasSize, realSize);

        setFontSize(current => current === nextSize ? current : nextSize);
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    if (el.parentElement) observer.observe(el.parentElement);
    document.fonts?.ready.then(fit).catch(() => undefined);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [text]);

  return (
    <h2
      ref={ref}
      title={text}
      className={`block min-w-0 max-w-full flex-1 whitespace-nowrap font-black leading-tight ${locked ? 'text-stone-400' : 'text-stone-100'} ${className}`}
      style={{ fontSize }}
    >
      {text}
    </h2>
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
  } = useGameStore();

  const handleBuy = useCallback((businessId: number) => {
    let count = buyMode;
    if (count === 0) {
      const def = BUSINESSES.find(b => b.id === businessId);
      const bs = businesses.find(b => b.businessId === businessId);
      if (def && bs) {
        count = calcMaxBuyable(def, bs.quantity, cash, purchasedAngelUpgrades);
      }
      if (count <= 0) return;
    }

    const success = buyBusiness(businessId, count);
    const state = useGameStore.getState();
    if (success && tutorialStep === 'first_tap') {
      const bs = state.businesses.find(b => b.businessId === businessId);
      if (bs && bs.quantity >= 10) {
        advanceTutorial('buy_10');
      }
    }
  }, [advanceTutorial, businesses, buyBusiness, buyMode, cash, purchasedAngelUpgrades, tutorialStep]);

  return (
    <div className="film-game-screen business-content-frame-bg flex flex-col gap-3 px-5 py-5 pb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-[2rem] font-black leading-none tracking-normal text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">
            {t('我的生意')}
          </h1>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-4 overflow-hidden rounded-2xl border border-stone-500/40 bg-[linear-gradient(180deg,rgba(37,42,45,.96),rgba(9,12,14,.98))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_10px_20px_rgba(0,0,0,.35)]">
          {BUY_MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setBuyMode(m.value)}
              className={`h-10 rounded-xl text-sm font-black transition-all ${
                buyMode === m.value
                  ? 'bg-[linear-gradient(180deg,#fff1a6,#f7b52c)] text-stone-950 shadow-[0_3px_0_#8a520b,inset_0_1px_0_rgba(255,255,255,.65)]'
                  : 'text-stone-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {BUSINESSES.map((def) => {
        const bs = businesses.find(b => b.businessId === def.id);
        if (!bs) return null;

        const quantity = bs.quantity;
        const isUnlocked = checkUnlock(def.id);
        const actualBuyCount = buyMode === 0
          ? calcMaxBuyable(def, quantity, cash, purchasedAngelUpgrades)
          : buyMode;
        const cost = quantity > 0 || def.id === 1
          ? calcBuyCostWithDiscount(def, quantity, actualBuyCount, purchasedAngelUpgrades)
          : Math.ceil(def.baseCost * (purchasedAngelUpgrades.length > 0 ? calcAngelUpgradeEffects(purchasedAngelUpgrades).globalCostReduce : 1));
        const canAfford = cash >= cost && actualBuyCount > 0 && isUnlocked;

        const calcState = {
          upgrades,
          prestigePoints,
          adBuffs,
          purchasedBusinessUpgrades,
          purchasedAngelUpgrades,
          managerLevels,
          hiredManagers,
          businessModes,
          activeEvents,
        } as any;
        const cycleTime = quantity > 0 ? calcCycleTime(def, calcState, adBuffs) : def.baseCycleSec;
        const revenue = quantity > 0 ? calcRevenuePerCycle(def, quantity, calcState, adBuffs) : def.baseRevenue;
        const nextMs = getNextMilestone(def, quantity);
        const milestoneMult = calcMilestoneMultiplier(def, quantity);
        const progress = quantity > 0 ? Math.min((bs.progress ?? 0) * 100, 100) : 0;
        const milestoneProgress = (() => {
          let prevAt = 0;
          for (let i = def.milestones.length - 1; i >= 0; i--) {
            if (quantity >= def.milestones[i].at) {
              prevAt = def.milestones[i].at;
              break;
            }
          }
          return nextMs ? Math.min(((quantity - prevAt) / (nextMs.at - prevAt)) * 100, 100) : 100;
        })();
        return (
          <section
            key={def.id}
            className={`business-card-frame-bg relative overflow-hidden rounded-[18px] ${
              isUnlocked
                ? ''
                : 'opacity-75 grayscale-[35%]'
            }`}
          >
            <BusinessRank order={def.order} locked={!isUnlocked} />

            <div className="relative px-5 pb-2 pt-5">
              <div className="flex items-center gap-2 pl-11">
                <AutoFitTitle text={t(def.name)} locked={!isUnlocked} />
              </div>
            </div>

            <div className="relative grid grid-cols-2 gap-3 px-5 pb-3">
              <div className="relative aspect-square self-start bg-transparent">
                <BusinessIcon
                  icon={def.icon}
                  className="absolute left-1/2 top-1/2 block aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 [&_img]:h-full [&_img]:w-full [&_img]:object-cover"
                />
                {!isUnlocked && (
                  <div className="absolute inset-0 grid place-items-center bg-transparent">
                    <div className="grid h-20 w-20 place-items-center rounded-full border border-stone-200/30 bg-black/55 text-stone-100">
                      <Lock size={42} strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 py-1">
                <div className="hidden">
                  <div className="min-w-0">
                    <AutoFitTitle text={t(def.name)} locked={!isUnlocked} />
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                    </div>
                  </div>

                </div>

                <div className="flex flex-col gap-2 p-3">
                  <StatPill icon="cash" value={`${formatCash(revenue)}/${t('次')}`} />
                  <StatPill icon="time" value={`${formatTime(cycleTime)}/${t('次')}`} />
                  <StatPill
                    icon="status"
                    value={bs.hasManager ? t('自动经营') : bs.progress > 0 ? t('生产中') : t('手动')}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="h-3 flex-1 overflow-hidden rounded-full border border-black/50 bg-black/45 shadow-[inset_0_1px_3px_rgba(0,0,0,.8)]">
                    <div
                      className={`h-full rounded-full ${bs.hasManager ? 'bg-[linear-gradient(90deg,#22c55e,#86efac)]' : 'bg-[linear-gradient(90deg,#06b6d4,#22d3ee)]'} shadow-[0_0_12px_rgba(34,211,238,.55)]`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-black text-stone-100 tabular-nums">{Math.round(progress)}%</span>
                </div>
              </div>
            </div>

            <div className="relative grid grid-cols-[1fr_38%] gap-3 px-5 pb-5 pt-1">
              <div className="flex min-w-0 items-center px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-amber-200">{t('里程碑奖励')}</div>
                  <div className="truncate text-xs font-bold text-stone-300">
                    {nextMs ? `${t('达到')} ${nextMs.at} ${t('级')} · x${nextMs.multiplier}` : `${t('倍率')} x${formatNumber(milestoneMult)}`}
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-900">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#fde68a)]" style={{ width: `${milestoneProgress}%` }} />
                  </div>
                </div>
              </div>

              {quantity > 0 && !bs.hasManager && bs.progress <= 0 ? (
                <button
                  onClick={() => {
                    manualProduce(def.id);
                    playTap();
                    if (tutorialStep === 'none') {
                      advanceTutorial('first_tap');
                    }
                  }}
                  className="rounded-xl border border-emerald-200/50 bg-[linear-gradient(180deg,#6ee7b7,#16a34a)] px-2 py-2 text-lg font-black text-emerald-950 shadow-[0_5px_0_#166534,0_8px_16px_rgba(0,0,0,.3)] active:translate-y-[2px] active:shadow-[0_2px_0_#166534]"
                >
                  {t('贴膜')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (canAfford) playBuy(); else playUIClick();
                    handleBuy(def.id);
                  }}
                  disabled={!canAfford}
                  className={`rounded-xl border px-2 py-2 text-center shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] ${
                    canAfford
                      ? 'border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950'
                      : 'border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-300 shadow-none'
                  }`}
                >
                  <div className="text-sm font-black">{quantity > 0 ? t('购买') : t('解锁')} x{actualBuyCount}</div>
                  <div className="text-2xl font-black leading-none tabular-nums">{formatCash(cost)}</div>
                </button>
              )}
            </div>

            {!isUnlocked && (
              <div className="relative mx-5 mb-5 flex items-center justify-center gap-2 rounded-lg border border-stone-500/30 bg-black/35 px-3 py-2 text-sm font-black text-stone-300">
                <Lock size={17} />
                {def.unlockRule.type === 'total_earned'
                  ? `${t('累计收入')} ${formatCash(getUnlockTarget(def.id))} ${t('解锁')}`
                  : t('转生后解锁')}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function checkUnlock(businessId: number): boolean {
  if (businessId === 1) return true;
  const def = BUSINESSES.find(b => b.id === businessId);
  if (!def) return false;

  const rule = def.unlockRule;
  switch (rule.type) {
    case 'total_earned':
      return useGameStore.getState().totalEarned >= rule.value;
    case 'prestige_count':
      return useGameStore.getState().totalPrestigeCount >= rule.value;
    default:
      return true;
  }
}

function getUnlockTarget(businessId: number): number {
  const def = BUSINESSES.find(b => b.id === businessId);
  if (!def) return 0;
  if (def.unlockRule.type === 'total_earned') return def.unlockRule.value;
  return 0;
}
