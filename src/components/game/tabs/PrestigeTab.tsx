// ============================================================
// 人脉Tab — 转生系统 / 永久收益 / Meta进度
// ============================================================
'use client';

import { useGameStore } from '@/store/gameStore';
import { PRESTIGE_RULE, calcPrestigeGain, calcPrestigeMultiplier } from '@/game/config/prestige';
import { formatCash, formatNumber } from '@/game/formulas';
import { usePopup } from '../PopupLayer';

export default function PrestigeTab() {
  const {
    totalEarned,
    prestigePoints,
    totalPrestigeCount,
    prestige,
  } = useGameStore();

  const { showPopup } = usePopup();

  const gain = calcPrestigeGain(totalEarned);
  const currentMultiplier = calcPrestigeMultiplier(prestigePoints);
  const nextMultiplier = calcPrestigeMultiplier(prestigePoints + gain);
  const canDoPrestige = gain >= 2;
  const unlockMet = totalEarned >= PRESTIGE_RULE.unlockCondition.value;

  const handlePrestige = () => {
    if (!canDoPrestige) return;

    showPopup({
      id: 'prestige_confirm',
      type: 'confirm',
      content: (
        <div className="text-center">
          <div className="text-5xl mb-3">🔄</div>
          <h3 className="text-xl font-black mb-2">确认转生？</h3>
          <p className="text-sm text-white/80 mb-3">
            你将卖掉当前所有商业版图，换取{PRESTIGE_RULE.currencyIcon}渠道人脉
          </p>
          
          <div className="bg-white/10 rounded-xl p-3 mb-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">当前{PRESTIGE_RULE.currencyName}:</span>
              <span className="text-yellow-400 font-bold">{prestigePoints}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">本次获得:</span>
              <span className="text-green-400 font-bold">+{gain} 🤝</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">转生后总加成:</span>
              <span className="text-yellow-300 font-bold">×{formatNumber(nextMultiplier)}</span>
            </div>
          </div>

          <div className="text-[10px] text-white/50">
            ⚠️ 重置: 现金、产线、店长、升级、广告增益
            <br />✅ 保留: 钻石、{PRESTIGE_RULE.currencyName}、商城一次性购买
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => useGameStore.getState().prestige()}
              className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 
                         text-white active:scale-95 transition-transform"
            >
              确认转生
            </button>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="flex flex-col gap-4 px-3 py-3 pb-4">
      {/* 转生状态卡片 */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-900/50 to-yellow-900/30 border border-yellow-600/40">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{PRESTIGE_RULE.currencyIcon}</div>
          <h2 className="text-lg font-black text-yellow-400">{PRESTIGE_RULE.currencyName}</h2>
          <p className="text-xs text-gray-400">转生后获得的永久加成货币</p>
        </div>

        <div className="space-y-3">
          {/* 当前人脉 */}
          <div className="bg-black/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">当前{PRESTIGE_RULE.currencyName}</span>
              <span className="text-lg font-black text-yellow-400">{prestigePoints}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400"
                style={{ width: `${Math.min(100, (prestigePoints / 500) * 100)}%` }}
              />
            </div>
          </div>

          {/* 永久加成 */}
          <div className="bg-black/20 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">永久利润加成</span>
              <span className="text-sm font-black text-green-400">×{formatNumber(currentMultiplier)}</span>
            </div>
          </div>

          {/* 转生次数 */}
          <div className="bg-black/20 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">累计转生次数</span>
              <span className="text-sm font-bold text-white">{totalPrestigeCount}次</span>
            </div>
          </div>
        </div>
      </div>

      {/* 转生操作区 */}
      <div className="rounded-2xl p-4 bg-gray-800 border border-gray-700/40">
        <h3 className="text-sm font-bold text-white mb-3">🔄 转生重置</h3>

        {!unlockMet ? (
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">
              累计收入达到{formatCash(PRESTIGE_RULE.unlockCondition.value)}后解锁转生
            </p>
            <div className="h-2 rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-amber-500 transition-all"
                style={{ width: `${Math.min(100, (totalEarned / PRESTIGE_RULE.unlockCondition.value) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              当前进度: {formatCash(totalEarned)} / {formatCash(PRESTIGE_RULE.unlockCondition.value)}
            </p>
          </div>
        ) : (
          <div className="text-center">
            {/* 预计获得 */}
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-3 mb-3 border border-orange-500/30">
              <p className="text-xs text-gray-400 mb-1">本次转生预计获得</p>
              <div className="text-2xl font-black text-orange-400">
                +{gain} 🤝
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                转生后加成: ×{formatNumber(currentMultiplier)} → ×{formatNumber(nextMultiplier)}
              </p>
            </div>

            <button
              onClick={handlePrestige}
              disabled={!canDoPrestige}
              className={`
                w-full py-3 rounded-xl font-bold text-base transition-all duration-200
                active:scale-[0.97]
                ${canDoPrestige
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-400 hover:to-red-400 shadow-lg shadow-red-900/40 animate-pulse'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {canDoPrestige ? '🔥 转生重置 🔥' : `再赚 ${formatCash(PRESTIGE_RULE.unlockCondition.value - totalEarned)} 即可转生`}
            </button>

            {gain < 2 && (
              <p className="text-[10px] text-yellow-400/60 mt-2">
                💡 建议：转生获得≥2点更有价值，继续积累收入吧！
              </p>
            )}
          </div>
        )}

        {/* 转生说明 */}
        <div className="mt-4 space-y-1.5 text-[10px] text-gray-500">
          <h4 className="text-xs font-medium text-gray-400">转生说明</h4>
          <p>🔄 <span className="text-red-400">重置</span>: 现金、产线数量、店长雇佣、全局升级、广告增益</p>
          <p>✅ <span className="text-green-400">保留</span>: 钻石、{PRESTIGE_RULE.currencyName}、已购买的一次性商品</p>
          <p>📈 <span className="text-yellow-400">加成</span>: 每点{PRESTIGE_RULE.currencyName}永久+{(PRESTIGE_RULE.permanentBonusCurve.perPoint * 100).toFixed(1)}%全局利润</p>
          <p>🎁 <span className="text-cyan-400">赠送</span>: 转生后自动获得1个路边钢化膜摊</p>
        </div>
      </div>

      {/* 成就统计 */}
      <div className="rounded-2xl p-4 bg-gray-800 border border-gray-700/40">
        <h3 className="text-sm font-bold text-white mb-3">📊 商业版图统计</h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="历史总收入" value={formatCash(totalEarned)} icon="💰" />
          <StatCard label="当前现金" value={formatCash(useGameStore.getState().cash)} icon="💵" />
          <StatCard label="转生次数" value={`${totalPrestigeCount}次`} icon="🔄" />
          <StatCard label="人脉加成" value={`×${formatNumber(currentMultiplier)}`} icon="📈" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-2.5 text-center">
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-xs font-bold text-white tabular-nums">{value}</div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}
