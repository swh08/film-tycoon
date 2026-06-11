// ============================================================
// Upgrade tab
// ============================================================
'use client';

import { Check, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { GLOBAL_UPGRADES, UPGRADE_GROUP_INFO } from '@/game/config/upgrades';
import { calcMaxUpgradeLevels, calcUpgradeCostBulk, formatCash } from '@/game/formulas';
import type { UpgradeGroup } from '@/game/types';
import { translateText } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';
import AssetIcon from '@/components/game/AssetIcon';
import BuyModeButton from '@/components/game/BuyModeButton';
import UpgradeIcon, { GLOBAL_UPGRADE_ASSETS, UPGRADE_GROUP_ASSETS } from '@/components/game/UpgradeIcon';

const GROUP_ORDER: UpgradeGroup[] = ['equipment', 'channel', 'brand'];

const GROUP_TONE: Record<UpgradeGroup, {
  divider: string;
  text: string;
}> = {
  equipment: {
    divider: 'bg-cyan-400/70',
    text: 'text-cyan-200',
  },
  channel: {
    divider: 'bg-emerald-400/70',
    text: 'text-emerald-200',
  },
  brand: {
    divider: 'bg-amber-400/70',
    text: 'text-amber-200',
  },
};

function UpgradeRank({ order, maxed }: { order: number; maxed: boolean }) {
  return (
    <div
      className={`absolute left-4 top-0 z-10 grid h-14 w-11 place-items-center rounded-b-lg border-x border-b text-xl font-black shadow-[0_8px_16px_rgba(0,0,0,.4)] ${
        maxed
          ? 'border-emerald-200/65 bg-[linear-gradient(180deg,#34d399,#047857)] text-white'
          : 'border-amber-200/70 bg-[linear-gradient(180deg,#ef4444,#f59e0b_55%,#7c2d12)] text-white'
      }`}
    >
      {order}
    </div>
  );
}

export default function UpgradeTab() {
  const { cash, diamonds, upgrades, buyUpgrade, buyMode, setBuyMode } = useGameStore();
  const { t } = useTranslation();

  return (
    <div className="film-game-screen business-content-frame-bg flex flex-col gap-3 px-5 py-5 pb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-black leading-none tracking-normal text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">
            {t('全局升级')}
          </h1>
        </div>

        <BuyModeButton buyMode={buyMode} setBuyMode={setBuyMode} />
      </div>

      {GROUP_ORDER.map(group => {
        const groupInfo = UPGRADE_GROUP_INFO[group];
        const groupUpgrades = GLOBAL_UPGRADES.filter(u => u.group === group);
        const tone = GROUP_TONE[group];
        const groupLevel = groupUpgrades.reduce((sum, def) => {
          const level = upgrades.find(u => u.upgradeId === def.id)?.level ?? 0;
          return sum + level;
        }, 0);
        const groupMax = groupUpgrades.reduce((sum, def) => sum + def.maxLevel, 0);

        return (
          <section key={group} className="space-y-3">
            <div className="flex items-center gap-3 px-1 pt-1">
              <div className="grid h-[52px] w-[52px] flex-shrink-0 place-items-center">
                <UpgradeIcon
                  id={UPGRADE_GROUP_ASSETS[group]}
                  size={42}
                  className="drop-shadow-[0_6px_6px_rgba(0,0,0,.45)]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate text-lg font-black leading-tight text-stone-50 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
                    {t(groupInfo.name)}
                  </h2>
                  <div className="flex-shrink-0 rounded-lg border border-stone-300/25 bg-black/35 px-2 py-1 text-xs font-black text-stone-100 tabular-nums">
                    Lv.{groupLevel}/{groupMax}
                  </div>
                </div>
                <p className={`mt-0.5 truncate text-xs font-bold ${tone.text}`}>{t(groupInfo.description)}</p>
              </div>
            </div>
            <div className={`mx-1 h-1 rounded-full ${tone.divider} shadow-[0_0_10px_rgba(45,212,191,.38)]`} />

            {groupUpgrades.map(def => {
              const uState = upgrades.find(u => u.upgradeId === def.id);
              const level = uState?.level ?? 0;
              const isMaxed = level >= def.maxLevel;
              const budget = def.currency === 'cash' ? cash : diamonds;
              const remainingLevels = def.maxLevel - level;
              const actualCount = isMaxed
                ? 0
                : buyMode === 0
                  ? calcMaxUpgradeLevels(def.id, level, def.maxLevel, budget)
                  : Math.min(buyMode, remainingLevels);
              const cost = actualCount > 0 ? calcUpgradeCostBulk(def.id, level, actualCount) : 0;
              const canAfford = !isMaxed && actualCount > 0 && budget >= cost;
              const totalEffect = def.effectPerLevel * level;
              const nextEffect = def.effectPerLevel * Math.max(actualCount, 1);
              const effectLabel = getEffectLabel(def.effectType, totalEffect);
              const nextEffectLabel = getEffectDeltaLabel(def.effectType, nextEffect);
              const isDiamond = def.currency === 'diamond';

              return (
                <article
                  key={def.id}
                  className={`business-card-frame-2x1-bg relative overflow-hidden ${
                    isMaxed ? 'saturate-110' : canAfford ? '' : 'opacity-85'
                  }`}
                >
                  <UpgradeRank order={def.id} maxed={isMaxed} />

                  {(canAfford || isDiamond || isMaxed) && (
                    <div
                      className={`absolute right-5 top-0 z-10 rounded-b-lg px-4 py-1 text-xs font-black shadow-[0_5px_12px_rgba(0,0,0,.28)] ${
                        isMaxed
                          ? 'bg-emerald-400 text-emerald-950'
                          : isDiamond
                            ? 'bg-cyan-300 text-cyan-950'
                            : 'bg-amber-300 text-stone-950'
                      }`}
                    >
                      {isMaxed ? t('已满级') : isDiamond ? t('稀有') : t('可买')}
                    </div>
                  )}

                  <div className="relative px-5 pb-2 pt-5">
                    <div className="flex min-w-0 items-start gap-2 pl-12 pr-20">
                      <h3 className="min-w-0 flex-1 truncate text-xl font-black leading-tight text-stone-100 drop-shadow-[0_2px_1px_rgba(0,0,0,.8)]">
                        {t(def.name)}
                      </h3>
                    </div>
                  </div>

                  <div className="relative grid grid-cols-[128px_1fr] gap-3 px-5 pb-3">
                    <div className="grid aspect-square h-[128px] place-items-center self-start">
                      <UpgradeIcon
                        id={GLOBAL_UPGRADE_ASSETS[def.id]}
                        size={116}
                        className="drop-shadow-[0_10px_12px_rgba(0,0,0,.32)]"
                      />
                    </div>

                    <div className="min-w-0 py-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-emerald-300/25 bg-black/25 px-2 py-1 text-sm font-black text-emerald-100">
                          <Sparkles size={15} className="flex-shrink-0 text-emerald-200" />
                          <span className="truncate">{effectLabel}</span>
                        </div>
                        <div className="flex-shrink-0 rounded-lg border border-stone-400/25 bg-black/35 px-2 py-1 text-sm font-black text-stone-100 tabular-nums">
                          Lv.{level}/{def.maxLevel}
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-2 min-h-8 text-xs font-bold leading-snug text-stone-300">
                        {t(def.description)}
                      </p>

                      <div className="mt-3 grid grid-cols-[1fr_45%] items-center gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-amber-200">{t('升级收益')}</div>
                          <div className="truncate text-xs font-bold text-stone-300">
                            {isMaxed ? t('已满级') : `${nextEffectLabel} · x${actualCount || 1}`}
                          </div>
                        </div>

                        {isMaxed ? (
                          <div className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-emerald-200/45 bg-[linear-gradient(180deg,#34d399,#15803d)] px-2 text-sm font-black text-white shadow-[0_5px_0_#166534,0_8px_16px_rgba(0,0,0,.28)]">
                            <Check size={21} strokeWidth={3} />
                            {t('已满级')}
                          </div>
                        ) : (
                          <button
                            onClick={() => buyUpgrade(def.id, actualCount)}
                            disabled={!canAfford}
                            className={`min-h-14 rounded-xl border px-2 py-1.5 text-center shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] ${
                              canAfford
                                ? isDiamond
                                  ? 'border-cyan-100/70 bg-[linear-gradient(180deg,#67e8f9,#2563eb)] text-white'
                                  : 'border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950'
                                : 'border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-300 shadow-none'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1 text-sm font-black">
                              {!canAfford && <Lock size={16} />}
                              {canAfford ? t('升级') : t('不足')} x{actualCount || 1}
                              <ChevronRight size={16} />
                            </div>
                            <div className="mt-0.5 flex items-center justify-center gap-1 text-[19px] font-black leading-none tabular-nums">
                              {isDiamond ? cost : formatCash(cost)}
                              {isDiamond && <AssetIcon id="currency/diamond" size={18} />}
                            </div>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>

                  <div className="hidden">
                    <div className="flex min-w-0 items-center px-3 py-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black text-amber-200">{t('升级收益')}</div>
                        <div className="truncate text-xs font-bold text-stone-300">
                          {isMaxed ? t('已满级') : `${nextEffectLabel} · x${actualCount || 1}`}
                        </div>
                      </div>
                    </div>

                    {isMaxed ? (
                      <div className="flex min-h-14 items-center justify-center gap-2 rounded-xl border border-emerald-200/45 bg-[linear-gradient(180deg,#34d399,#15803d)] px-2 text-sm font-black text-white shadow-[0_5px_0_#166534,0_8px_16px_rgba(0,0,0,.28)]">
                        <Check size={21} strokeWidth={3} />
                        {t('已满级')}
                      </div>
                    ) : (
                      <button
                        onClick={() => buyUpgrade(def.id, actualCount)}
                        disabled={!canAfford}
                        className={`min-h-14 rounded-xl border px-2 py-1.5 text-center shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] ${
                          canAfford
                            ? isDiamond
                              ? 'border-cyan-100/70 bg-[linear-gradient(180deg,#67e8f9,#2563eb)] text-white'
                              : 'border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950'
                            : 'border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-300 shadow-none'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 text-sm font-black">
                          {!canAfford && <Lock size={16} />}
                          {canAfford ? t('升级') : t('不足')} x{actualCount || 1}
                          <ChevronRight size={16} />
                        </div>
                        <div className="mt-0.5 flex items-center justify-center gap-1 text-[19px] font-black leading-none tabular-nums">
                          {isDiamond ? cost : formatCash(cost)}
                          {isDiamond && <AssetIcon id="currency/diamond" size={18} />}
                        </div>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

function getEffectLabel(effectType: string, totalEffect: number): string {
  switch (effectType) {
    case 'cycle_reduce_all':
      return `${translateEffectText('生产加速')} ${(totalEffect * 100).toFixed(0)}%`;
    case 'profit_mult_all':
      return `${translateEffectText('利润加成')} +${(totalEffect * 100).toFixed(0)}%`;
    case 'offline_cap_increase':
      return `${translateEffectText('离线上限')} +${totalEffect * 60}${translateEffectText('分钟')}`;
    case 'offline_mult':
      return `${translateEffectText('离线倍率')} x${(1 + totalEffect).toFixed(2)}`;
    default:
      return `${totalEffect}`;
  }
}

function getEffectDeltaLabel(effectType: string, effect: number): string {
  switch (effectType) {
    case 'cycle_reduce_all':
      return `${translateEffectText('生产加速')} +${(effect * 100).toFixed(0)}%`;
    case 'profit_mult_all':
      return `${translateEffectText('利润加成')} +${(effect * 100).toFixed(0)}%`;
    case 'offline_cap_increase':
      return `${translateEffectText('离线上限')} +${effect * 60}${translateEffectText('分钟')}`;
    case 'offline_mult':
      return `${translateEffectText('离线倍率')} +${(effect * 100).toFixed(0)}%`;
    default:
      return `${effect}`;
  }
}

function translateEffectText(text: string): string {
  return translateText(text);
}
