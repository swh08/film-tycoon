// ============================================================
// 升级Tab — 设备/渠道/品牌三组全局升级
// ============================================================
'use client';

import { useGameStore } from '@/store/gameStore';
import { GLOBAL_UPGRADES, UPGRADE_GROUP_INFO } from '@/game/config/upgrades';
import { calcUpgradeCostBulk, calcMaxUpgradeLevels, formatCash, formatNumber } from '@/game/formulas';
import type { UpgradeGroup } from '@/game/types';

const GROUP_ORDER: UpgradeGroup[] = ['equipment', 'channel', 'brand'];

const BUY_MODES = [
  { value: 1, label: '×1' },
  { value: 10, label: '×10' },
  { value: 100, label: '×100' },
  { value: 0, label: '最大' },
];

export default function UpgradeTab() {
  const { cash, diamonds, upgrades, buyUpgrade, buyMode, setBuyMode } = useGameStore();

  return (
    <div className="flex flex-col gap-4 px-3 py-3 pb-4">
      {/* 标题区 */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-yellow-400">⚡ 全局升级</h2>
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
        </div>
      </div>

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

                // 计算实际购买级数
                const budget = def.currency === 'cash' ? cash : diamonds;
                const remainingLevels = def.maxLevel - level;
                let actualCount: number;
                if (isMaxed) {
                  actualCount = 0;
                } else if (buyMode === 0) {
                  actualCount = calcMaxUpgradeLevels(def.id, level, def.maxLevel, budget);
                } else {
                  actualCount = Math.min(buyMode, remainingLevels);
                }

                const cost = actualCount > 0 ? calcUpgradeCostBulk(def.id, level, actualCount) : 0;
                const canAfford = !isMaxed && actualCount > 0 && budget >= cost;

                const costLabel = def.currency === 'cash'
                  ? formatCash(cost)
                  : `💎${cost}`;

                // 计算当前总效果
                const totalEffect = def.effectPerLevel * level;
                const effectLabel = getEffectLabel(def.effectType, totalEffect);

                return (
                  <div
                    key={def.id}
                    className="rounded-xl p-3 bg-gradient-to-r from-gray-800 to-gray-900 
                               transition-all duration-200"
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
                            onClick={() => buyUpgrade(def.id, actualCount)}
                            disabled={!canAfford}
                            className={`
                              w-full py-3 rounded-xl text-xs font-bold transition-all duration-150
                              ${canAfford
                                ? 'bg-gradient-to-b from-blue-400 to-indigo-600 text-white shadow-[0_4px_0_0_#312e81,0_6px_12px_rgba(49,46,129,0.3)] active:shadow-[0_2px_0_0_#312e81,0_3px_6px_rgba(49,46,129,0.2)] active:translate-y-[2px]'
                                : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 shadow-[0_4px_0_0_#374151,0_6px_8px_rgba(0,0,0,0.3)]'
                              }
                            `}
                          >
                            升级 ×{actualCount} → {costLabel}
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
