// ============================================================
// 人脉Tab — 转生系统 / 永久收益 / 人脉升级商店
// ============================================================
'use client';

import { useGameStore } from '@/store/gameStore';
import { PRESTIGE_RULE, calcPrestigeGain, calcPrestigeMultiplier } from '@/game/config/prestige';
import { ANGEL_UPGRADES, ANGEL_UPGRADE_TIERS } from '@/game/config/angel-upgrades';
import { BUSINESSES } from '@/game/config/businesses';
import { calcAngelUpgradeEffects, formatCash, formatNumber, formatNumberSmart } from '@/game/formulas';
import { usePopup } from '../PopupLayer';
import BusinessIcon from '@/components/game/BusinessIcon';
import AssetIcon, { type SharedAssetId } from '@/components/game/AssetIcon';
import AngelUpgradeIcon from '@/components/game/AngelUpgradeIcon';

// ============================================================
// 转生确认弹窗 — 响应式组件，数据实时更新
// ============================================================
function PrestigeConfirmPopup() {
  const { closePopup } = usePopup();
  const totalEarned = useGameStore(s => s.totalEarned);
  const prestigePoints = useGameStore(s => s.prestigePoints);

  const gain = calcPrestigeGain(totalEarned);
  const nextMultiplier = calcPrestigeMultiplier(prestigePoints + gain);

  const handleConfirm = () => {
    useGameStore.getState().prestige();
    closePopup();
    useGameStore.getState().setActiveTab('business'); // AC行为：转生后回到生意tab
  };

  return (
    <div className="text-center">
      <AssetIcon id="nav/prestige" size={64} className="mb-3" />
      <h3 className="text-xl font-black mb-2">确认转生？</h3>
      <p className="text-sm text-white/80 mb-3">
        你将卖掉当前所有商业版图，换取渠道人脉
      </p>

      <div className="bg-white/10 rounded-xl p-3 mb-4 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">当前{PRESTIGE_RULE.currencyName}:</span>
          <span className="text-yellow-400 font-bold">{formatNumberSmart(prestigePoints)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">本次获得:</span>
          <span className="flex items-center gap-1 text-green-400 font-bold">
            +{formatNumberSmart(gain)}
            <AssetIcon id="currency/connection" size={16} />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">转生后总加成:</span>
          <span className="text-yellow-300 font-bold">×{formatNumber(nextMultiplier)}</span>
        </div>
      </div>

      <div className="text-[10px] text-white/50 space-y-1">
        <p className="inline-flex items-center justify-center gap-1">
          <AssetIcon id="status/cross" size={12} />
          重置: 现金、产线、店长、升级、广告增益
        </p>
        <p className="inline-flex items-center justify-center gap-1">
          <AssetIcon id="status/check" size={12} />
          保留: 钻石、{PRESTIGE_RULE.currencyName}、人脉升级、商城一次性购买
        </p>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleConfirm}
          className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-b from-orange-400 to-red-600 
                     text-white transition-all duration-150 shadow-[0_4px_0_0_#991b1b,0_6px_12px_rgba(127,29,29,0.3)] active:shadow-[0_2px_0_0_#991b1b,0_3px_6px_rgba(127,29,29,0.2)] active:translate-y-[2px]"
        >
          确认转生
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 人脉升级购买确认弹窗 — 响应式组件
// ============================================================
function AngelUpgradePopup({ upgradeId }: { upgradeId: number }) {
  const { closePopup } = usePopup();
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const purchasedAngelUpgrades = useGameStore(s => s.purchasedAngelUpgrades);
  const isPurchased = purchasedAngelUpgrades.includes(upgradeId);
  const def = ANGEL_UPGRADES.find(u => u.id === upgradeId);

  if (!def || isPurchased) return null;

  const currentMultiplier = calcPrestigeMultiplier(prestigePoints);
  const nextMultiplier = calcPrestigeMultiplier(prestigePoints - def.cost);

  const handleBuy = () => {
    useGameStore.getState().buyAngelUpgrade(upgradeId);
    closePopup();
  };

  return (
    <div className="text-center">
      <div className="mb-2 flex justify-center">
        <AngelUpgradeIcon upgradeId={def.id} alt={def.name} size={48} />
      </div>
      <h3 className="text-lg font-black mb-1">{def.name}</h3>
      <p className="text-xs text-gray-400 mb-3">{def.description}</p>

      <div className="bg-red-900/30 rounded-xl p-3 mb-4">
        <p className="text-sm font-bold text-red-400">
          <span className="inline-flex items-center justify-center gap-1">
            消耗 {def.cost}
            <AssetIcon id="currency/connection" size={16} />
            {PRESTIGE_RULE.currencyName}
          </span>
        </p>
        <p className="text-[10px] text-red-300/60 mt-1">
          消耗后利润加成将从 ×{formatNumber(currentMultiplier)} 降至 ×{formatNumber(nextMultiplier)}
        </p>
      </div>

      <button
        onClick={handleBuy}
        className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-b from-orange-400 to-red-600 
                   text-white transition-all duration-150 shadow-[0_3px_0_0_#991b1b,0_4px_8px_rgba(127,29,29,0.3)] active:shadow-[0_1px_0_0_#991b1b,0_2px_4px_rgba(127,29,29,0.2)] active:translate-y-[2px]"
      >
        确认购买
      </button>
    </div>
  );
}

// ============================================================
// 单条人脉升级卡片组件
// ============================================================
function AngelUpgradeCard({ upgrade, onBuy }: { upgrade: typeof ANGEL_UPGRADES[0]; onBuy: (id: number) => void }) {
  const purchasedAngelUpgrades = useGameStore(s => s.purchasedAngelUpgrades);
  const prestigePoints = useGameStore(s => s.prestigePoints);

  const isPurchased = purchasedAngelUpgrades.includes(upgrade.id);
  const canAfford = !isPurchased && prestigePoints >= upgrade.cost;
  const business = upgrade.targetBusinessId
    ? BUSINESSES.find(b => b.id === upgrade.targetBusinessId)
    : null;

  return (
    <div
      className={`rounded-xl p-2.5 transition-all duration-200
        ${isPurchased
          ? 'bg-green-900/20'
          : 'bg-gray-700/50'
        }`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
          ${isPurchased ? 'bg-green-500/20' : 'bg-gray-700'}`}>
          <AngelUpgradeIcon upgradeId={upgrade.id} alt={upgrade.name} size={30} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              {business ? <BusinessIcon icon={business.icon} className="inline" /> : null} {upgrade.name}
            </span>
            {isPurchased ? (
              <span className="text-green-400 text-[10px] font-bold inline-flex items-center gap-0.5">
                <AssetIcon id="status/check" size={12} />
                已购买
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-yellow-400 text-[10px] font-bold">
                {upgrade.cost}
                <AssetIcon id="currency/connection" size={12} />
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500">{upgrade.description}</p>
        </div>
        {!isPurchased && (
          <button
            onClick={() => onBuy(upgrade.id)}
            disabled={!canAfford}
            className={`px-3 py-2.5 rounded-xl text-[10px] font-bold flex-shrink-0
              transition-all duration-150
              ${canAfford
                ? 'bg-gradient-to-b from-orange-400 to-red-600 text-white shadow-[0_3px_0_0_#991b1b,0_4px_8px_rgba(127,29,29,0.3)] active:shadow-[0_1px_0_0_#991b1b,0_2px_4px_rgba(127,29,29,0.2)] active:translate-y-[2px]'
                : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.3)]'
              }`}
          >
            购买
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PrestigeTab 主组件
// ============================================================
export default function PrestigeTab() {
  const {
    totalEarned,
    prestigePoints,
    totalPrestigeCount,
    purchasedAngelUpgrades,
  } = useGameStore();

  const { showPopup } = usePopup();

  const gain = calcPrestigeGain(totalEarned);
  const currentMultiplier = calcPrestigeMultiplier(prestigePoints);
  const nextMultiplier = calcPrestigeMultiplier(prestigePoints + gain);
  const canDoPrestige = gain >= 2;
  const unlockMet = totalEarned >= PRESTIGE_RULE.unlockCondition.value;

  // 如果购买了人脉升级，计算消费后的实际倍率
  const angelEffects = calcAngelUpgradeEffects(purchasedAngelUpgrades);
  const angelProfitText = angelEffects.globalProfitMult > 1
    ? ` + 人脉升级×${formatNumber(angelEffects.globalProfitMult)}`
    : '';
  const angelCostText = angelEffects.globalCostReduce < 1
    ? `成本-${Math.round((1 - angelEffects.globalCostReduce) * 100)}%`
    : '';
  const angelSpeedText = angelEffects.globalCycleReduce < 1
    ? `速度+${Math.round((1 - angelEffects.globalCycleReduce) * 100)}%`
    : '';

  const handlePrestige = () => {
    if (!canDoPrestige) return;

    showPopup({
      id: 'prestige_confirm',
      type: 'confirm',
      content: <PrestigeConfirmPopup />,
    });
  };

  const handleBuyAngelUpgrade = (upgradeId: number) => {
    showPopup({
      id: `angel_upgrade_${upgradeId}`,
      type: 'confirm',
      content: <AngelUpgradePopup upgradeId={upgradeId} />,
    });
  };

  // 按分层过滤升级
  const getUpgradesForTier = (minPrestigeCount: number) => {
    return ANGEL_UPGRADES.filter(u => (u.minPrestigeCount ?? 0) === minPrestigeCount);
  };

  return (
    <div className="flex flex-col gap-4 px-3 py-3 pb-4">
      {/* 转生状态卡片 */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-900/50 to-yellow-900/30">
        <div className="text-center mb-4">
          <AssetIcon id="currency/connection" size={44} className="mb-2" />
          <h2 className="text-lg font-black text-yellow-400">{PRESTIGE_RULE.currencyName}</h2>
          <p className="text-xs text-gray-400">转生后获得的永久加成货币</p>
        </div>

        <div className="space-y-3">
          {/* 当前人脉 */}
          <div className="bg-black/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">当前{PRESTIGE_RULE.currencyName}</span>
              <span className="text-lg font-black text-yellow-400">{formatNumberSmart(prestigePoints)}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400"
                style={{ width: `${Math.min(100, prestigePoints > 0 ? (Math.log10(prestigePoints + 1) / Math.log10(1001)) * 100 : 0)}%` }}
              />
            </div>
          </div>

          {/* 永久加成 */}
          <div className="bg-black/20 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">利润加成（人脉）</span>
              <span className="text-sm font-black text-green-400">×{formatNumber(currentMultiplier)}{angelProfitText}</span>
            </div>
            {(angelCostText || angelSpeedText) && (
              <div className="flex gap-3 mt-1 text-[10px]">
                {angelCostText && <span className="text-blue-400">{angelCostText}</span>}
                {angelSpeedText && <span className="text-cyan-400">{angelSpeedText}</span>}
              </div>
            )}
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
      <div className="rounded-2xl p-4 bg-gray-800">
        <h3 className="text-sm font-bold text-white mb-3 inline-flex items-center gap-1.5">
          <AssetIcon id="nav/prestige" size={18} />
          转生重置
        </h3>

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
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-3 mb-3">
              <p className="text-xs text-gray-400 mb-1">本次转生预计获得</p>
              <div className="text-2xl font-black text-orange-400">
                <span className="inline-flex items-center justify-center gap-1">
                  +{formatNumberSmart(gain)}
                  <AssetIcon id="currency/connection" size={22} />
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                转生后加成: ×{formatNumber(currentMultiplier)} → ×{formatNumber(nextMultiplier)}
              </p>
            </div>

            <button
              onClick={handlePrestige}
              disabled={!canDoPrestige}
              className={`
                w-full py-3 rounded-xl font-bold text-base transition-all duration-150
                ${canDoPrestige
                  ? 'bg-gradient-to-b from-orange-400 to-red-600 text-white shadow-[0_4px_0_0_#991b1b,0_6px_12px_rgba(127,29,29,0.3)] active:shadow-[0_2px_0_0_#991b1b,0_3px_6px_rgba(127,29,29,0.2)] active:translate-y-[2px]'
                  : 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 shadow-[0_4px_0_0_#374151,0_6px_8px_rgba(0,0,0,0.3)]'
                }
              `}
            >
              <span className="inline-flex items-center justify-center gap-1">
                {canDoPrestige && <AssetIcon id="boost/fire" size={18} />}
                {canDoPrestige ? '转生重置' : `再赚 ${formatCash(PRESTIGE_RULE.unlockCondition.value - totalEarned)} 即可转生`}
              </span>
            </button>

            {gain < 2 && (
              <p className="text-[10px] text-yellow-400/60 mt-2">
                建议：转生获得≥2点更有价值，继续积累收入吧！
              </p>
            )}
          </div>
        )}

        {/* 转生说明 */}
        <div className="mt-4 space-y-1.5 text-[10px] text-gray-500">
          <h4 className="text-xs font-medium text-gray-400">转生说明</h4>
          <p><span className="text-red-400">重置</span>: 现金、产线数量、店长雇佣、全局升级、广告增益</p>
          <p><span className="text-green-400">保留</span>: 钻石、{PRESTIGE_RULE.currencyName}、人脉升级、商城一次性购买</p>
          <p><span className="text-yellow-400">加成</span>: 每点{PRESTIGE_RULE.currencyName}永久+{(PRESTIGE_RULE.permanentBonusCurve.perPoint * 100).toFixed(1)}%全局利润</p>
          <p><span className="text-cyan-400">赠送</span>: 转生后自动获得1个路边钢化膜摊</p>
        </div>
      </div>

      {/* 人脉升级商店 — 按分层显示 */}
      <div className="rounded-2xl p-4 bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
            <AssetIcon id="currency/connection" size={18} />
            人脉升级商店
          </h3>
          <span className="text-[10px] text-yellow-400 font-bold">
            已购买 {purchasedAngelUpgrades.length}/{ANGEL_UPGRADES.length}
          </span>
        </div>
        <p className="text-[10px] text-gray-500 mb-3">
          消耗{PRESTIGE_RULE.currencyName}购买永久升级。购买会降低利润加成，但获得更强大的永久效果！
        </p>

        {/* 按分层显示 */}
        {ANGEL_UPGRADE_TIERS.map(tier => {
          const tierUpgrades = getUpgradesForTier(tier.minPrestigeCount);
          const isUnlocked = totalPrestigeCount >= tier.minPrestigeCount;
          const businessUpgrades = tierUpgrades.filter(u => u.effectType === 'profit_mult_business');
          const globalUpgrades = tierUpgrades.filter(u => u.effectType !== 'profit_mult_business');
          const purchasedInTier = tierUpgrades.filter(u => purchasedAngelUpgrades.includes(u.id)).length;

          return (
            <div key={tier.id} className="mb-4 last:mb-0">
              {/* 分层标题 */}
              <div className="flex items-center justify-between mb-2 px-1">
                <h4 className={`text-xs font-medium ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isUnlocked ? (
                    <>
                      <AssetIcon id={tier.id === 1 ? 'nav/business' : 'currency/connection'} size={14} className="mr-1 align-[-2px]" />
                      {tier.name}
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <AssetIcon id="status/lock" size={14} />
                      {tier.name}（需要转生{tier.minPrestigeCount}次解锁）
                    </span>
                  )}
                </h4>
                {isUnlocked && (
                  <span className="text-[10px] text-gray-500">
                    {purchasedInTier}/{tierUpgrades.length}
                  </span>
                )}
              </div>

              {isUnlocked ? (
                <>
                  {/* 产线加成（仅Tier 1有） */}
                  {businessUpgrades.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-[10px] font-medium text-gray-500 mb-1.5 px-1 inline-flex items-center gap-1">
                        <AssetIcon id="nav/business" size={12} />
                        产线利润加成（×3）
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        {businessUpgrades.map(upgrade => (
                          <AngelUpgradeCard
                            key={upgrade.id}
                            upgrade={upgrade}
                            onBuy={handleBuyAngelUpgrade}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 全局加成 */}
                  {globalUpgrades.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-medium text-gray-500 mb-1.5 px-1 inline-flex items-center gap-1">
                        <AssetIcon id="currency/connection" size={12} />
                        全局永久升级
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        {globalUpgrades.map(upgrade => (
                          <AngelUpgradeCard
                            key={upgrade.id}
                            upgrade={upgrade}
                            onBuy={handleBuyAngelUpgrade}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* 锁定状态 */
                <div className="rounded-xl p-4 bg-gray-900/40 text-center">
                  <AssetIcon id="status/lock" size={32} />
                  <p className="text-xs text-gray-600 mt-1">
                    转生{tier.minPrestigeCount}次后解锁 {tierUpgrades.length} 个人脉升级
                  </p>
                  {totalPrestigeCount < tier.minPrestigeCount && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all"
                          style={{ width: `${(totalPrestigeCount / tier.minPrestigeCount) * 100}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-600 mt-0.5">
                        {totalPrestigeCount}/{tier.minPrestigeCount}次
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 成就统计 */}
      <div className="rounded-2xl p-4 bg-gray-800">
        <h3 className="text-sm font-bold text-white mb-3 inline-flex items-center gap-1.5">
          <AssetIcon id="nav/business" size={18} />
          商业版图统计
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="历史总收入" value={formatCash(totalEarned)} icon="currency/coin" />
          <StatCard label="当前现金" value={formatCash(useGameStore.getState().cash)} icon="currency/coin" />
          <StatCard label="转生次数" value={`${totalPrestigeCount}次`} icon="nav/prestige" />
          <StatCard label="人脉加成" value={`×${formatNumber(currentMultiplier)}`} icon="currency/connection" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: SharedAssetId }) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-2.5 text-center">
      <AssetIcon id={icon} size={20} className="mb-0.5" />
      <div className="text-xs font-bold text-white tabular-nums">{value}</div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}
