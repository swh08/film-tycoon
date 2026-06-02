// ============================================================
// 店长Tab — 自动化雇佣 & 效率专精 & 升级系统
// ============================================================
'use client';

import { useGameStore } from '@/store/gameStore';
import { MANAGERS } from '@/game/config/managers';
import { BUSINESSES } from '@/game/config/businesses';
import { calcManagerUpgradeCost, formatCash } from '@/game/formulas';
import type { Rarity } from '@/game/types';
import { playHire, playUpgrade, playUIClick } from '@/game/sound';
import { useTranslation } from '@/i18n/useTranslation';
import AssetIcon from '@/components/game/AssetIcon';
import BusinessIcon from '@/components/game/BusinessIcon';
import ManagerIcon from '@/components/game/ManagerIcon';

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string }> = {
  common: { label: '普通', color: 'text-gray-300', bg: 'bg-gray-700' },
  rare: { label: '稀有', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  epic: { label: '史诗', color: 'text-purple-400', bg: 'bg-purple-900/30' },
  legendary: { label: '传说', color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
};

export default function ManagerTab() {
  const { t } = useTranslation();
  const { cash, diamonds, hiredManagers, managerLevels, businesses, hireManager, upgradeManager, tutorialStep, advanceTutorial } = useGameStore();

  return (
    <div className="flex flex-col gap-3 px-3 py-3 pb-4">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-yellow-400">
          <AssetIcon id="nav/manager" size={18} />
          {t('店长管理')}
        </h2>
        <span className="text-[10px] text-gray-400">
          {t('已雇佣')} {hiredManagers.length}/{MANAGERS.length}
        </span>
      </div>

      {/* 产线店长 */}
      <div>
        <h3 className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-2 px-1">
          <AssetIcon id="nav/business" size={15} />
          {t('产线店长（自动化+可升级）')}
        </h3>
        <div className="flex flex-col gap-2">
          {MANAGERS.filter(m => m.businessId > 0).map(manager => {
            const isHired = hiredManagers.includes(manager.id);
            const business = BUSINESSES.find(b => b.id === manager.businessId);
            const bs = businesses.find(b => b.businessId === manager.businessId);
            const hasBusiness = bs && bs.quantity > 0;
            const rarity = RARITY_CONFIG[manager.rarity];
            const currentLevel = managerLevels[manager.id] ?? 0;
            const isMaxLevel = currentLevel >= manager.maxLevel;
            const upgradeCost = calcManagerUpgradeCost(manager.id, currentLevel);

            const costLabel = manager.currency === 'cash'
              ? formatCash(manager.unlockCost)
              : manager.unlockCost.toString();

            const canAfford = manager.currency === 'cash'
              ? cash >= manager.unlockCost
              : diamonds >= manager.unlockCost;

            const canHire = !isHired && hasBusiness && canAfford;

            const upgradeCostLabel = manager.upgradeCurrency === 'cash'
              ? formatCash(upgradeCost)
              : upgradeCost.toString();

            const canAffordUpgrade = manager.upgradeCurrency === 'cash'
              ? cash >= upgradeCost
              : diamonds >= upgradeCost;

            return (
              <div
                key={manager.id}
                className={`rounded-xl p-3 transition-all duration-200 shadow-md shadow-black/20
                  ${isHired
                    ? rarity.bg
                    : 'bg-gray-800'
                  }
                  ${!hasBusiness && !isHired ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* 头像 */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden
                    ${isHired ? 'bg-yellow-500/20 ring-2 ring-yellow-500/50' : 'bg-gray-700'}`}>
                    <ManagerIcon managerId={manager.id} alt={t(manager.name)} size={46} />
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{t(manager.name)}</h3>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rarity.bg} ${rarity.color}`}>
                          {t(rarity.label)}
                        </span>
                      </div>
                      {isHired && (
                        <div className="flex items-center gap-1.5">
                          <AssetIcon id="status/check" size={12} />
                          <span className="text-[10px] font-bold text-yellow-300">Lv.{currentLevel}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 mb-0.5">
                      {business ? <BusinessIcon icon={business.icon} className="inline mr-1" /> : null}
                      {business ? t(business.name) : null}
                    </p>
                    <p className="text-[10px] text-gray-500 mb-1">{t(manager.description)}</p>

                    {/* 效果 */}
                    <div className="text-[10px] text-cyan-400 mb-1">
                      <AssetIcon id="nav/manager" size={12} className="mr-1 align-[-2px]" />
                      {t('自动化生产')}
                      {isHired && currentLevel > 0 && (
                        <span className="text-green-400 ml-1">
                          +{t('速度')} {Math.round(manager.upgradeEffectPerLevel * currentLevel * 100)}%
                        </span>
                      )}
                    </div>

                    {/* 等级进度条 */}
                    {isHired && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[9px] mb-0.5">
                          <span className="text-gray-500">Lv.{currentLevel}</span>
                          <span className="text-gray-500">Lv.{manager.maxLevel}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                            style={{ width: `${(currentLevel / manager.maxLevel) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 雇佣按钮 */}
                    {!isHired && (
                      <button
                        onClick={() => {
                          hireManager(manager.id);
                          playHire();
                          const state = useGameStore.getState();
                          if (tutorialStep === 'buy_10') {
                            advanceTutorial('hire_manager' as any);
                          }
                        }}
                        disabled={!canHire}
                        className={`
                          w-full py-3 rounded-xl text-xs font-bold transition-all duration-150
                          ${canHire
                            ? 'bg-gradient-to-b from-green-400 to-green-600 text-white shadow-[0_4px_0_0_#166534,0_6px_12px_rgba(21,128,61,0.3)] active:shadow-[0_2px_0_0_#166534,0_3px_6px_rgba(21,128,61,0.2)] active:translate-y-[2px]'
                            : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 shadow-[0_4px_0_0_#374151,0_6px_8px_rgba(0,0,0,0.3)]'
                          }
                        `}
                      >
                        <span className="inline-flex items-center justify-center gap-1">
                          {!hasBusiness ? `${t('需要先拥有')}${business ? t(business.name) : ''}` : `${t('雇佣')} → ${costLabel}`}
                          {hasBusiness && manager.currency === 'diamond' && <AssetIcon id="currency/diamond" size={14} />}
                        </span>
                      </button>
                    )}

                    {/* 升级按钮 */}
                    {isHired && !isMaxLevel && (
                      <button
                        onClick={() => {
                          const ok = useGameStore.getState().upgradeManager(manager.id);
                          if (ok) playUpgrade(); else playUIClick();
                        }}
                        disabled={!canAffordUpgrade}
                        className={`
                          w-full py-2.5 rounded-xl text-[10px] font-bold transition-all duration-150
                          ${canAffordUpgrade
                            ? 'bg-gradient-to-b from-blue-400 to-indigo-600 text-white shadow-[0_4px_0_0_#312e81,0_6px_12px_rgba(49,46,129,0.3)] active:shadow-[0_2px_0_0_#312e81,0_3px_6px_rgba(49,46,129,0.2)] active:translate-y-[2px]'
                            : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.3)]'
                          }
                        `}
                      >
                        <span className="inline-flex items-center justify-center gap-1">
                          {t('升级到')} Lv.{currentLevel + 1} → {upgradeCostLabel}
                          {manager.upgradeCurrency === 'diamond' && <AssetIcon id="currency/diamond" size={12} />}
                        </span>
                        <span className="text-[8px] opacity-70 ml-1">
                          ({t('速度')}+{Math.round(manager.upgradeEffectPerLevel * 100)}%)
                        </span>
                      </button>
                    )}

                    {/* 满级提示 */}
                    {isHired && isMaxLevel && (
                      <div className="text-[10px] text-yellow-400 font-bold text-center py-1">
                        <span className="inline-flex items-center justify-center gap-1">
                          <AssetIcon id="status/check" size={14} />
                          {t('已满级')} Lv.{manager.maxLevel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 专家顾问 */}
      <div className="mt-2">
        <h3 className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-2 px-1">
          <AssetIcon id="boost/lightning" size={15} />
          {t('专家顾问（全局加成+可升级）')}
        </h3>
        <div className="flex flex-col gap-2">
          {MANAGERS.filter(m => m.businessId === 0).map(manager => {
            const isHired = hiredManagers.includes(manager.id);
            const rarity = RARITY_CONFIG[manager.rarity];
            const currentLevel = managerLevels[manager.id] ?? 0;
            const isMaxLevel = currentLevel >= manager.maxLevel;
            const upgradeCost = calcManagerUpgradeCost(manager.id, currentLevel);

            const costLabel = manager.currency === 'cash'
              ? formatCash(manager.unlockCost)
              : manager.unlockCost.toString();

            const canAfford = manager.currency === 'cash'
              ? cash >= manager.unlockCost
              : diamonds >= manager.unlockCost;

            const upgradeCostLabel = manager.upgradeCurrency === 'cash'
              ? formatCash(upgradeCost)
              : upgradeCost.toString();

            const canAffordUpgrade = manager.upgradeCurrency === 'cash'
              ? cash >= upgradeCost
              : diamonds >= upgradeCost;

            const effectIcon = manager.effectType === 'cycle_reduce' ? 'boost/lightning' : 'currency/coin';
            const effectDesc = manager.effectType === 'cycle_reduce'
              ? `${t('周期')}-${(manager.effectValue * 100).toFixed(0)}%`
              : `${t('利润')}+${(manager.effectValue * 100).toFixed(0)}%`;

            const bonusDesc = currentLevel > 0
              ? manager.effectType === 'cycle_reduce'
                ? ` (${t('已额外')}-${(manager.upgradeEffectPerLevel * currentLevel * 100).toFixed(0)}%)`
                : ` (${t('已额外')}+${(manager.upgradeEffectPerLevel * currentLevel * 100).toFixed(0)}%)`
              : '';

            return (
              <div
                key={manager.id}
                className={`rounded-xl p-3 transition-all duration-200 shadow-md shadow-black/20
                  ${isHired
                    ? `${rarity.bg} ring-1 ring-yellow-500/30`
                    : 'bg-gray-800'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden
                    ${isHired ? 'bg-yellow-500/20' : 'bg-gray-700'}`}>
                    <ManagerIcon managerId={manager.id} alt={t(manager.name)} size={46} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{t(manager.name)}</h3>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rarity.bg} ${rarity.color}`}>
                          {t(rarity.label)}
                        </span>
                      </div>
                      {isHired && (
                        <span className="text-[10px] font-bold text-yellow-300">Lv.{currentLevel}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 mb-1">{t(manager.description)}</p>

                    {/* 效果 */}
                    <div className="text-[10px] text-cyan-400 mb-1">
                      <AssetIcon id={effectIcon} size={12} className="mr-1 align-[-2px]" />
                      {effectDesc}{bonusDesc}
                    </div>

                    {/* 等级进度 */}
                    {isHired && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-[9px] mb-0.5">
                          <span className="text-gray-500">Lv.{currentLevel}</span>
                          <span className="text-gray-500">Lv.{manager.maxLevel}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all"
                            style={{ width: `${(currentLevel / manager.maxLevel) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {!isHired && (
                      <button
                        onClick={() => {
                          hireManager(manager.id);
                          playHire();
                        }}
                        disabled={!canAfford}
                        className={`
                          w-full py-3 rounded-xl text-xs font-bold transition-all duration-150
                          ${canAfford
                            ? 'bg-gradient-to-b from-purple-400 to-pink-600 text-white shadow-[0_4px_0_0_#701a75,0_6px_12px_rgba(112,26,117,0.3)] active:shadow-[0_2px_0_0_#701a75,0_3px_6px_rgba(112,26,117,0.2)] active:translate-y-[2px]'
                            : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 shadow-[0_4px_0_0_#374151,0_6px_8px_rgba(0,0,0,0.3)]'
                          }
                        `}
                      >
                        <span className="inline-flex items-center justify-center gap-1">
                          {t('雇佣')} → {costLabel}
                          {manager.currency === 'diamond' && <AssetIcon id="currency/diamond" size={14} />}
                        </span>
                      </button>
                    )}

                    {isHired && !isMaxLevel && (
                      <button
                        onClick={() => {
                          const ok = useGameStore.getState().upgradeManager(manager.id);
                          if (ok) playUpgrade(); else playUIClick();
                        }}
                        disabled={!canAffordUpgrade}
                        className={`
                          w-full py-2.5 rounded-xl text-[10px] font-bold transition-all duration-150
                          ${canAffordUpgrade
                            ? 'bg-gradient-to-b from-purple-400 to-pink-600 text-white shadow-[0_4px_0_0_#701a75,0_6px_12px_rgba(112,26,117,0.3)] active:shadow-[0_2px_0_0_#701a75,0_3px_6px_rgba(112,26,117,0.2)] active:translate-y-[2px]'
                            : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.3)]'
                          }
                        `}
                      >
                        <span className="inline-flex items-center justify-center gap-1">
                          {t('升级到')} Lv.{currentLevel + 1} → {upgradeCostLabel}
                          {manager.upgradeCurrency === 'diamond' && <AssetIcon id="currency/diamond" size={12} />}
                        </span>
                      </button>
                    )}

                    {isHired && isMaxLevel && (
                      <div className="text-[10px] text-yellow-400 font-bold text-center py-1">
                        <span className="inline-flex items-center justify-center gap-1">
                          <AssetIcon id="status/check" size={14} />
                          {t('已满级')} Lv.{manager.maxLevel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
