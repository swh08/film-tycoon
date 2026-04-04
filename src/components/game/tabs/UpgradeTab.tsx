// ============================================================
// 升级Tab — 设备/渠道/品牌三组全局升级
// ============================================================
'use client';

import { useGameStore } from '@/store/gameStore';
import { GLOBAL_UPGRADES, UPGRADE_GROUP_INFO } from '@/game/config/upgrades';
import { calcUpgradeCost, formatCash, formatNumber } from '@/game/formulas';
import type { UpgradeGroup } from '@/game/types';

const GROUP_ORDER: UpgradeGroup[] = ['equipment', 'channel', 'brand'];

export default function UpgradeTab() {
  const { cash, diamonds, upgrades, buyUpgrade } = useGameStore();

  return (
    <div className="flex flex-col gap-4 px-3 py-3 pb-4">
      {GROUP_ORDER.map(group => {
        const groupInfo = UPGRADE_GROUP_INFO[group];
        const groupUpgrades = GLOBAL_UPGRADES.filter(u => u.group === group);

        return (
          <div key={group}>
            {/* 分组标题 */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-lg">{groupInfo.icon}</span>
              <h2 className="text-sm font-bold text-yellow-400">{groupInfo.name}</h2>
              <span className="text-[10px] text-gray-500 flex-1">{groupInfo.description}</span>
            </div>

            {/* 升级卡片 */}
            <div className="flex flex-col gap-2">
              {groupUpgrades.map(def => {
                const uState = upgrades.find(u => u.upgradeId === def.id);
                const level = uState?.level ?? 0;
                const isMaxed = level >= def.maxLevel;
                const cost = isMaxed ? 0 : calcUpgradeCost(def.id, level);
                const canAfford = def.currency === 'cash'
                  ? cash >= cost
                  : diamonds >= cost;

                const costLabel = def.currency === 'cash'
                  ? formatCash(cost)
                  : `💎${cost}`;

                // 计算当前总效果
                const totalEffect = def.effectPerLevel * level;
                const effectLabel = getEffectLabel(def.effectType, totalEffect);

                return (
                  <div
                    key={def.id}
                    className="rounded-xl p-3 bg-gradient-to-r from-gray-800 to-gray-850 
                               border border-gray-700/40 transition-all duration-200
                               hover:border-yellow-600/40"
                  >
                    <div className="flex items-start gap-3">
                      {/* 图标 */}
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
                        {def.icon}
                      </div>

                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-bold text-white truncate">{def.name}</h3>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded
                            ${isMaxed ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-300'}`}>
                            Lv.{level}/{def.maxLevel}
                          </span>
                        </div>

                        <p className="text-[10px] text-gray-400 mb-2">{def.description}</p>

                        {/* 当前效果 */}
                        <div className="text-[10px] text-green-400 mb-2">
                          当前效果: {effectLabel}
                        </div>

                        {/* 等级进度条 */}
                        <div className="h-1.5 rounded-full bg-gray-700 mb-2">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-amber-500 transition-all"
                            style={{ width: `${(level / def.maxLevel) * 100}%` }}
                          />
                        </div>

                        {/* 升级按钮 */}
                        {!isMaxed && (
                          <button
                            onClick={() => buyUpgrade(def.id)}
                            disabled={!canAfford}
                            className={`
                              w-full py-2 rounded-lg text-xs font-bold transition-all duration-150
                              active:scale-[0.97]
                              ${canAfford
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-900/30'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              }
                            `}
                          >
                            升级 → {costLabel}
                          </button>
                        )}

                        {isMaxed && (
                          <div className="text-center py-2 text-xs font-bold text-yellow-400">
                            ✨ 已满级
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getEffectLabel(effectType: string, totalEffect: number): string {
  switch (effectType) {
    case 'cycle_reduce_all':
      return `生产加速 ${(totalEffect * 100).toFixed(0)}%`;
    case 'profit_mult_all':
      return `利润加成 +${(totalEffect * 100).toFixed(0)}%`;
    case 'offline_cap_increase':
      return `离线上限 +${(totalEffect * 60)}分钟`;
    case 'offline_mult':
      return `离线倍率 ×${(1 + totalEffect).toFixed(2)}`;
    default:
      return `${totalEffect}`;
  }
}
