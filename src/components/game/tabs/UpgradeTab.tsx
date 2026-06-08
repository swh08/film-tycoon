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
import UpgradeIcon, { GLOBAL_UPGRADE_ASSETS, UPGRADE_GROUP_ASSETS } from '@/components/game/UpgradeIcon';

const GROUP_ORDER: UpgradeGroup[] = ['equipment', 'channel', 'brand'];

const BUY_MODES = [
  { value: 1, label: 'x1' },
  { value: 10, label: 'x10' },
  { value: 100, label: 'x100' },
  { value: 0, label: 'MAX' },
];

const GROUP_STYLE: Record<UpgradeGroup, { accent: string; glow: string }> = {
  equipment: { accent: 'cyan', glow: 'shadow-cyan-950/50' },
  channel: { accent: 'emerald', glow: 'shadow-emerald-950/50' },
  brand: { accent: 'amber', glow: 'shadow-amber-950/50' },
};

export default function UpgradeTab() {
  const { cash, diamonds, upgrades, buyUpgrade, buyMode, setBuyMode } = useGameStore();
  const { t } = useTranslation();

  const buyableCount = GLOBAL_UPGRADES.filter(def => {
    const uState = upgrades.find(u => u.upgradeId === def.id);
    const level = uState?.level ?? 0;
    const budget = def.currency === 'cash' ? cash : diamonds;
    if (level >= def.maxLevel) return false;
    const count = buyMode === 0
      ? calcMaxUpgradeLevels(def.id, level, def.maxLevel, budget)
      : Math.min(buyMode, def.maxLevel - level);
    return count > 0 && budget >= calcUpgradeCostBulk(def.id, level, count);
  }).length;

  return (
    <div className="film-game-screen flex flex-col gap-4 px-3 py-4 pb-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[2rem] font-black leading-none tracking-normal text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">
            {t('全局升级')}
          </h1>
          <div className="mt-1 text-xs font-black uppercase tracking-wider text-stone-400">GLOBAL BOOSTS</div>
          <div className="mt-1 h-1 w-12 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,.65)]" />
        </div>

        <div className="rounded-xl border border-amber-300/50 bg-amber-950/35 px-3 py-2 text-sm font-black text-amber-100">
          {buyableCount}{t('项可升级')}
        </div>
      </div>

      <div className="grid grid-cols-4 overflow-hidden rounded-2xl border border-stone-500/40 bg-[linear-gradient(180deg,rgba(37,42,45,.96),rgba(9,12,14,.98))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_10px_20px_rgba(0,0,0,.35)]">
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

      {GROUP_ORDER.map(group => {
        const groupInfo = UPGRADE_GROUP_INFO[group];
        const groupUpgrades = GLOBAL_UPGRADES.filter(u => u.group === group);
        const style = GROUP_STYLE[group];

        return (
          <section key={group} className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <div className={`grid h-10 w-10 place-items-center rounded-full border bg-black/30 ${
                style.accent === 'cyan' ? 'border-cyan-300/35' : style.accent === 'emerald' ? 'border-emerald-300/35' : 'border-amber-300/35'
              }`}>
                <UpgradeIcon id={UPGRADE_GROUP_ASSETS[group]} size={28} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black leading-none text-amber-300">{t(groupInfo.name)}</h2>
                <p className="mt-1 truncate text-xs font-bold text-stone-400">{t(groupInfo.description)}</p>
              </div>
            </div>
            <div className={`mx-1 h-1 rounded-full ${
              style.accent === 'cyan' ? 'bg-cyan-400/55' : style.accent === 'emerald' ? 'bg-emerald-400/55' : 'bg-amber-400/55'
            }`} />

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
              const effectLabel = getEffectLabel(def.effectType, totalEffect);
              const isDiamond = def.currency === 'diamond';

              return (
                <article
                  key={def.id}
                  className={`relative overflow-hidden rounded-xl border bg-[linear-gradient(135deg,rgba(27,35,38,.96),rgba(5,10,13,.98))] p-3 shadow-[0_14px_28px_rgba(0,0,0,.36),inset_0_1px_0_rgba(255,255,255,.08)] ${
                    isDiamond
                      ? 'border-cyan-300/55'
                      : canAfford
                        ? 'border-amber-300/50'
                        : isMaxed
                          ? 'border-emerald-300/45'
                          : 'border-slate-500/30'
                  }`}
                >
                  {canAfford && (
                    <div className="absolute right-3 top-0 rounded-b-lg bg-amber-400 px-4 py-1 text-xs font-black text-stone-950">
                      {t('可买')}
                    </div>
                  )}
                  {isDiamond && (
                    <div className="absolute right-3 top-0 rounded-b-lg bg-cyan-400 px-4 py-1 text-xs font-black text-cyan-950">
                      {t('稀有')}
                    </div>
                  )}

                  <div className="grid grid-cols-[82px_1fr] gap-3">
                    <div className={`grid h-20 w-20 place-items-center rounded-xl border bg-[linear-gradient(180deg,#273447,#111827)] ${
                      isDiamond ? 'border-cyan-300/60 shadow-[0_0_16px_rgba(34,211,238,.22)]' : 'border-amber-300/45'
                    }`}>
                      <UpgradeIcon id={GLOBAL_UPGRADE_ASSETS[def.id]} size={66} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2 pr-20">
                        <h3 className="truncate text-xl font-black leading-tight text-stone-100">{t(def.name)}</h3>
                        <div className="absolute right-3 top-9 rounded-lg border border-stone-400/25 bg-black/35 px-2 py-1 text-sm font-black text-stone-100">
                          Lv.{level}/{def.maxLevel}
                        </div>
                      </div>

                      <div className="mt-1 inline-flex items-center gap-1 rounded-lg border border-emerald-300/25 bg-emerald-950/25 px-2 py-1 text-sm font-black text-emerald-200">
                        <Sparkles size={15} />
                        {effectLabel}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-stone-400">{t(def.description)}</p>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/50">
                        <div
                          className={`h-full rounded-full ${
                            isDiamond ? 'bg-[linear-gradient(90deg,#22d3ee,#a5f3fc)]' : isMaxed ? 'bg-[linear-gradient(90deg,#22c55e,#86efac)]' : 'bg-[linear-gradient(90deg,#f59e0b,#fde68a)]'
                          }`}
                          style={{ width: `${(level / def.maxLevel) * 100}%` }}
                        />
                      </div>

                      {isMaxed ? (
                        <div className="mt-3 flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200/45 bg-[linear-gradient(180deg,#22c55e,#15803d)] text-lg font-black text-white">
                          <Check size={21} strokeWidth={3} />
                          {t('已满级')}
                        </div>
                      ) : (
                        <button
                          onClick={() => buyUpgrade(def.id, actualCount)}
                          disabled={!canAfford}
                          className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-lg font-black shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.32)] active:translate-y-[2px] ${
                            canAfford
                              ? isDiamond
                                ? 'border-cyan-100/70 bg-[linear-gradient(180deg,#67e8f9,#2563eb)] text-white'
                                : 'border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950'
                              : 'border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-300 shadow-none'
                          }`}
                        >
                          {!canAfford && <Lock size={18} />}
                          {canAfford ? t('升级') : t('不足')} x{actualCount || 1}
                          <span className="tabular-nums">
                            {isDiamond ? cost : formatCash(cost)}
                          </span>
                          {isDiamond && <AssetIcon id="currency/diamond" size={20} />}
                          <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
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
      return `${translateEffectText('离线上限')} +${(totalEffect * 60)}${translateEffectText('分钟')}`;
    case 'offline_mult':
      return `${translateEffectText('离线倍率')} x${(1 + totalEffect).toFixed(2)}`;
    default:
      return `${totalEffect}`;
  }
}

function translateEffectText(text: string): string {
  return translateText(text);
}
