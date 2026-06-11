// ============================================================
// 店长Tab - 自动化雇佣 & 效率专精 & 升级系统
// ============================================================
'use client';

import { useGameStore } from '@/store/gameStore';
import { MANAGERS } from '@/game/config/managers';
import { BUSINESSES } from '@/game/config/businesses';
import { calcManagerUpgradeCost, formatCash } from '@/game/formulas';
import type { ManagerDef, Rarity } from '@/game/types';
import { playHire, playUpgrade, playUIClick } from '@/game/sound';
import { useTranslation } from '@/i18n/useTranslation';
import ManagerIcon from '@/components/game/ManagerIcon';

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; ring: string; progress: string }> = {
  common: {
    label: '普通',
    color: 'text-gray-200',
    bg: 'bg-gray-700/70',
    ring: 'ring-white/8',
    progress: 'from-slate-400 to-zinc-200',
  },
  rare: {
    label: '稀有',
    color: 'text-blue-300',
    bg: 'bg-blue-900/35',
    ring: 'ring-blue-400/25',
    progress: 'from-sky-500 to-cyan-300',
  },
  epic: {
    label: '史诗',
    color: 'text-fuchsia-300',
    bg: 'bg-fuchsia-900/35',
    ring: 'ring-fuchsia-400/25',
    progress: 'from-fuchsia-500 to-pink-300',
  },
  legendary: {
    label: '传说',
    color: 'text-yellow-300',
    bg: 'bg-yellow-900/30',
    ring: 'ring-yellow-400/35',
    progress: 'from-amber-400 to-yellow-200',
  },
};

type Translate = (key: string) => string;

function getManagerEffectText(manager: ManagerDef, currentLevel: number, t: Translate) {
  if (manager.businessId > 0) {
    const bonus = currentLevel > 0
      ? ` · +${t('速度')} ${Math.round(manager.upgradeEffectPerLevel * currentLevel * 100)}%`
      : '';
    return `${t('自动化生产')}${bonus}`;
  }

  const base = manager.effectType === 'cycle_reduce'
    ? `${t('周期')}-${(manager.effectValue * 100).toFixed(0)}%`
    : `${t('利润')}+${(manager.effectValue * 100).toFixed(0)}%`;

  const bonus = currentLevel > 0
    ? manager.effectType === 'cycle_reduce'
      ? ` · ${t('已额外')}-${(manager.upgradeEffectPerLevel * currentLevel * 100).toFixed(0)}%`
      : ` · ${t('已额外')}+${(manager.upgradeEffectPerLevel * currentLevel * 100).toFixed(0)}%`
    : '';

  return `${base}${bonus}`;
}

export default function ManagerTab() {
  const { t } = useTranslation();
  const {
    cash,
    diamonds,
    hiredManagers,
    managerLevels,
    businesses,
    hireManager,
    upgradeManager,
    tutorialStep,
    advanceTutorial,
  } = useGameStore();

  const renderManagerCard = (manager: ManagerDef) => {
    const isHired = hiredManagers.includes(manager.id);
    const business = BUSINESSES.find(b => b.id === manager.businessId);
    const businessState = businesses.find(b => b.businessId === manager.businessId);
    const hasBusiness = manager.businessId === 0 || !!(businessState && businessState.quantity > 0);
    const rarity = RARITY_CONFIG[manager.rarity];
    const currentLevel = managerLevels[manager.id] ?? 0;
    const isMaxLevel = currentLevel >= manager.maxLevel;
    const upgradeCost = calcManagerUpgradeCost(manager.id, currentLevel);
    const costLabel = manager.currency === 'cash'
      ? formatCash(manager.unlockCost)
      : manager.unlockCost.toString();
    const upgradeCostLabel = manager.upgradeCurrency === 'cash'
      ? formatCash(upgradeCost)
      : upgradeCost.toString();
    const canAffordHire = manager.currency === 'cash'
      ? cash >= manager.unlockCost
      : diamonds >= manager.unlockCost;
    const canAffordUpgrade = manager.upgradeCurrency === 'cash'
      ? cash >= upgradeCost
      : diamonds >= upgradeCost;
    const canHire = !isHired && hasBusiness && canAffordHire;
    const effectText = getManagerEffectText(manager, currentLevel, t);
    const progress = Math.min(100, (currentLevel / manager.maxLevel) * 100);

    const actionButton = () => {
      if (!isHired) {
        return (
          <button
            onClick={() => {
              const ok = hireManager(manager.id);
              if (ok) {
                playHire();
                if (tutorialStep === 'buy_10') {
                  advanceTutorial('hire_manager');
                }
              } else {
                playUIClick();
              }
            }}
            disabled={!canHire}
            className={`
              flex h-[58px] w-[96px] flex-col items-center justify-center rounded-xl px-2 text-center
              text-[11px] font-black leading-tight transition-all duration-150
              ${canHire
                ? manager.currency === 'diamond'
                  ? 'border border-cyan-100/70 bg-[linear-gradient(180deg,#67e8f9,#2563eb)] text-white shadow-[0_5px_0_rgba(30,64,175,.95),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(30,64,175,.95),0_4px_8px_rgba(0,0,0,.25)]'
                  : 'border border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950 shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(120,53,15,.9),0_4px_8px_rgba(0,0,0,.25)]'
                : 'border border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-300 shadow-none'
              }
            `}
          >
            <span>{hasBusiness ? t('雇佣') : t('需要先拥有')}</span>
            {hasBusiness && <span className="mt-0.5 max-w-full truncate text-[11px] opacity-85">{costLabel}</span>}
          </button>
        );
      }

      if (isMaxLevel) {
        return (
          <div className="flex h-[58px] w-[96px] flex-col items-center justify-center rounded-xl border border-emerald-200/45 bg-[linear-gradient(180deg,#34d399,#15803d)] px-2 text-center text-[11px] font-black leading-tight text-white shadow-[0_5px_0_#166534,0_8px_16px_rgba(0,0,0,.28)]">
            <span>{t('已满级')}</span>
            <span className="mt-0.5">Lv.{manager.maxLevel}</span>
          </div>
        );
      }

      return (
        <button
          onClick={() => {
            const ok = upgradeManager(manager.id);
            if (ok) playUpgrade(); else playUIClick();
          }}
          disabled={!canAffordUpgrade}
          className={`
            flex h-[58px] w-[96px] flex-col items-center justify-center rounded-xl px-2 text-center
            text-[11px] font-black leading-tight transition-all duration-150
            ${canAffordUpgrade
              ? manager.upgradeCurrency === 'diamond'
                ? 'border border-cyan-100/70 bg-[linear-gradient(180deg,#67e8f9,#2563eb)] text-white shadow-[0_5px_0_rgba(30,64,175,.95),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(30,64,175,.95),0_4px_8px_rgba(0,0,0,.25)]'
                : 'border border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950 shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(120,53,15,.9),0_4px_8px_rgba(0,0,0,.25)]'
              : 'border border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-300 shadow-none'
            }
          `}
        >
          <span>{t('升级到')} Lv.{currentLevel + 1}</span>
          <span className="mt-0.5 max-w-full truncate opacity-85">{upgradeCostLabel}</span>
        </button>
      );
    };

    return (
      <section
        key={manager.id}
        className={`
          business-card-frame-4x1-bg relative flex min-h-[112px] items-center gap-3 overflow-hidden px-4 py-4 pr-3 shadow-[0_10px_18px_rgba(0,0,0,.28)] transition-all duration-200
          ${isHired ? 'saturate-110' : ''}
          ${!hasBusiness && !isHired ? 'opacity-55' : ''}
        `}
      >
        <div className="flex h-[84px] w-[72px] shrink-0 items-end justify-center">
          <ManagerIcon
            managerId={manager.id}
            alt={t(manager.name)}
            size={78}
            className="max-h-[84px] w-auto drop-shadow-[0_16px_14px_rgba(0,0,0,0.62)]"
          />
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate text-[15px] font-black leading-tight text-amber-100">{t(manager.name)}</h3>
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-black ${rarity.bg} ${rarity.color}`}>
              {t(rarity.label)}
            </span>
            {isHired && (
              <span className="ml-auto shrink-0 text-xs font-black text-amber-200">Lv.{currentLevel}</span>
            )}
          </div>

          <p className="mt-1 truncate text-xs font-black text-amber-200">
            {business ? t(business.name) : t('专家顾问（全局加成+可升级）')}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-stone-300">{t(manager.description)}</p>
          <p className="mt-1 text-xs font-black text-cyan-200">{effectText}</p>

          {isHired && (
            <div className="mt-1.5">
              <div className="mb-0.5 flex items-center justify-between text-[11px] font-black text-stone-300">
                <span>Lv.{currentLevel}</span>
                <span>Lv.{manager.maxLevel}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-900/80">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${rarity.progress} transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0">{actionButton()}</div>
      </section>
    );
  };

  return (
    <div className="film-game-screen business-content-frame-bg flex flex-col gap-3 px-5 py-5 pb-6">
      <div className="mb-1 flex items-center justify-between px-1">
        <h2 className="text-2xl font-black leading-none tracking-normal text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">{t('店长管理')}</h2>
        <span className="rounded-lg border border-stone-300/25 bg-black/35 px-2.5 py-1 text-xs font-black text-stone-100">
          {t('已雇佣')} {hiredManagers.length}/{MANAGERS.length}
        </span>
      </div>

      <div>
        <h3 className="mb-2 px-1 text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
          {t('产线店长（自动化+可升级）')}
        </h3>
        <div className="flex flex-col gap-2">
          {MANAGERS.filter(manager => manager.businessId > 0).map(renderManagerCard)}
        </div>
      </div>

      <div className="mt-2">
        <h3 className="mb-2 px-1 text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
          {t('专家顾问（全局加成+可升级）')}
        </h3>
        <div className="flex flex-col gap-2">
          {MANAGERS.filter(manager => manager.businessId === 0).map(renderManagerCard)}
        </div>
      </div>
    </div>
  );
}
