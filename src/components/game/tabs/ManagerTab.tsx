// ============================================================
// 店长Tab — 自动化雇佣 & 效率专精
// ============================================================
'use client';

import { useGameStore } from '@/store/gameStore';
import { MANAGERS } from '@/game/config/managers';
import { BUSINESSES } from '@/game/config/businesses';
import { formatCash } from '@/game/formulas';
import type { Rarity } from '@/game/types';

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; border: string }> = {
  common: { label: '普通', color: 'text-gray-300', bg: 'bg-gray-700', border: 'border-gray-600' },
  rare: { label: '稀有', color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-500/40' },
  epic: { label: '史诗', color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-500/40' },
  legendary: { label: '传说', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/40' },
};

export default function ManagerTab() {
  const { cash, diamonds, hiredManagers, businesses, hireManager, tutorialStep, advanceTutorial } = useGameStore();

  return (
    <div className="flex flex-col gap-3 px-3 py-3 pb-4">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-yellow-400">👥 店长管理</h2>
        <span className="text-[10px] text-gray-400">
          已雇佣 {hiredManagers.length}/{MANAGERS.length}
        </span>
      </div>

      {/* 产线店长 */}
      <div>
        <h3 className="text-xs font-medium text-gray-400 mb-2 px-1">🏪 产线店长（自动化）</h3>
        <div className="flex flex-col gap-2">
          {MANAGERS.filter(m => m.businessId > 0).map(manager => {
            const isHired = hiredManagers.includes(manager.id);
            const business = BUSINESSES.find(b => b.id === manager.businessId);
            const bs = businesses.find(b => b.businessId === manager.businessId);
            const hasBusiness = bs && bs.quantity > 0;
            const rarity = RARITY_CONFIG[manager.rarity];

            const costLabel = manager.currency === 'cash'
              ? formatCash(manager.unlockCost)
              : `💎${manager.unlockCost}`;

            const canAfford = manager.currency === 'cash'
              ? cash >= manager.unlockCost
              : diamonds >= manager.unlockCost;

            const canHire = !isHired && hasBusiness && canAfford;

            return (
              <div
                key={manager.id}
                className={`rounded-xl p-3 border transition-all duration-200
                  ${isHired
                    ? `${rarity.bg} ${rarity.border}`
                    : 'bg-gray-800 border-gray-700/40'
                  }
                  ${!hasBusiness && !isHired ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* 头像 */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
                    ${isHired ? 'bg-yellow-500/20 ring-2 ring-yellow-500/50' : 'bg-gray-700'}`}>
                    {manager.icon}
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{manager.name}</h3>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rarity.bg} ${rarity.color}`}>
                          {rarity.label}
                        </span>
                      </div>
                      {isHired && (
                        <span className="text-green-400 text-xs font-bold">✅ 已雇佣</span>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 mb-0.5">
                      {business?.icon} {business?.name}
                    </p>
                    <p className="text-[10px] text-gray-500 mb-2">{manager.description}</p>

                    {/* 效果 */}
                    <div className="text-[10px] text-cyan-400 mb-2">
                      {manager.effectType === 'auto_run' ? '🤖 自动化生产' :
                       manager.effectType === 'cycle_reduce' ? '⚡ 缩短生产周期' :
                       '💰 增加利润'}
                    </div>

                    {/* 雇佣按钮 */}
                    {!isHired && (
                      <button
                        onClick={() => {
                          hireManager(manager.id);
                          // 新手引导：雇佣第一位店长
                          const state = useGameStore.getState();
                          if (tutorialStep === 'buy_10') {
                            advanceTutorial('hire_manager' as any);
                          }
                        }}
                        disabled={!canHire}
                        className={`
                          w-full py-2 rounded-lg text-xs font-bold transition-all duration-150
                          active:scale-[0.97]
                          ${canHire
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      >
                        {!hasBusiness ? `需要先拥有${business?.name}` : `雇佣 → ${costLabel}`}
                      </button>
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
        <h3 className="text-xs font-medium text-gray-400 mb-2 px-1">🌟 专家顾问（全局加成）</h3>
        <div className="flex flex-col gap-2">
          {MANAGERS.filter(m => m.businessId === 0).map(manager => {
            const isHired = hiredManagers.includes(manager.id);
            const rarity = RARITY_CONFIG[manager.rarity];

            const costLabel = manager.currency === 'cash'
              ? formatCash(manager.unlockCost)
              : `💎${manager.unlockCost}`;

            const canAfford = manager.currency === 'cash'
              ? cash >= manager.unlockCost
              : diamonds >= manager.unlockCost;

            return (
              <div
                key={manager.id}
                className={`rounded-xl p-3 border transition-all duration-200
                  ${isHired
                    ? `${rarity.bg} ${rarity.border} ring-1 ring-yellow-500/30`
                    : 'bg-gray-800 border-gray-700/40'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
                    ${isHired ? 'bg-yellow-500/20' : 'bg-gray-700'}`}>
                    {manager.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{manager.name}</h3>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rarity.bg} ${rarity.color}`}>
                          {rarity.label}
                        </span>
                      </div>
                      {isHired && <span className="text-green-400 text-xs font-bold">✅</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 mb-2">{manager.description}</p>

                    {!isHired && (
                      <button
                        onClick={() => hireManager(manager.id)}
                        disabled={!canAfford}
                        className={`
                          w-full py-2 rounded-lg text-xs font-bold transition-all duration-150
                          active:scale-[0.97]
                          ${canAfford
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }
                        `}
                      >
                        雇佣 → {costLabel}
                      </button>
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
