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
import { useTranslation } from '@/i18n/useTranslation';
import AssetIcon, { type SharedAssetId } from '@/components/game/AssetIcon';
import AngelUpgradeIcon from '@/components/game/AngelUpgradeIcon';

const GOLD_BUTTON_CLASS = 'rounded-xl border border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950 shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(120,53,15,.9),0_4px_8px_rgba(0,0,0,.25)]';
const DISABLED_BUTTON_CLASS = 'rounded-xl border border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-300 shadow-none';

// ============================================================
// 转生确认弹窗 — 响应式组件，数据实时更新
// ============================================================
function PrestigeConfirmPopup() {
  const { t } = useTranslation();
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
      <h3 className="text-lg font-black mb-2">{t('确认转生？')}</h3>
      <p className="text-sm text-white/80 mb-3">
        {t('你将卖掉当前所有商业版图，换取渠道人脉')}
      </p>

      <div className="bg-white/10 rounded-xl p-3 mb-4 text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">{t('当前')}{t(PRESTIGE_RULE.currencyName)}:</span>
          <span className="text-yellow-400 font-bold">{formatNumberSmart(prestigePoints)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">{t('本次获得')}:</span>
          <span className="flex items-center gap-1 text-green-400 font-bold">
            +{formatNumberSmart(gain)}
            <AssetIcon id="currency/connection" size={16} />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">{t('转生后总加成')}:</span>
          <span className="text-yellow-300 font-bold">×{formatNumber(nextMultiplier)}</span>
        </div>
      </div>

      <div className="space-y-1 text-xs font-bold text-stone-300">
        <p className="inline-flex items-center justify-center gap-1">
          <AssetIcon id="status/cross" size={12} />
          {t('重置')}: {t('现金')}、{t('产线')}、{t('店长')}、{t('升级')}、{t('广告增益')}
        </p>
        <p className="inline-flex items-center justify-center gap-1">
          <AssetIcon id="status/check" size={12} />
          {t('保留')}: {t('钻石')}、{t(PRESTIGE_RULE.currencyName)}、{t('人脉升级')}、{t('商城一次性购买')}
        </p>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleConfirm}
          className={`flex-1 py-3 font-black transition-all duration-150 ${GOLD_BUTTON_CLASS}`}
        >
          {t('确认转生')}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 人脉升级购买确认弹窗 — 响应式组件
// ============================================================
function AngelUpgradePopup({ upgradeId }: { upgradeId: number }) {
  const { t } = useTranslation();
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
        <AngelUpgradeIcon upgradeId={def.id} alt={t(def.name)} size={48} />
      </div>
      <h3 className="text-lg font-black mb-1">{t(def.name)}</h3>
      <p className="mb-3 text-xs font-bold text-stone-300">{t(def.description)}</p>

      <div className="bg-red-900/30 rounded-xl p-3 mb-4">
        <p className="text-sm font-bold text-red-400">
          <span className="inline-flex items-center justify-center gap-1">
            {t('消耗')} {def.cost}
            <AssetIcon id="currency/connection" size={16} />
            {t(PRESTIGE_RULE.currencyName)}
          </span>
        </p>
        <p className="mt-1 text-xs font-bold text-red-300/80">
          {t('消耗后利润加成将从')} ×{formatNumber(currentMultiplier)} {t('降至')} ×{formatNumber(nextMultiplier)}
        </p>
      </div>

      <button
        onClick={handleBuy}
        className={`w-full py-2.5 font-black transition-all duration-150 ${GOLD_BUTTON_CLASS}`}
      >
        {t('确认购买')}
      </button>
    </div>
  );
}

// ============================================================
// 单条人脉升级卡片组件
// ============================================================
function AngelUpgradeCard({ upgrade, onBuy }: { upgrade: typeof ANGEL_UPGRADES[0]; onBuy: (id: number) => void }) {
  const { t } = useTranslation();
  const purchasedAngelUpgrades = useGameStore(s => s.purchasedAngelUpgrades);
  const prestigePoints = useGameStore(s => s.prestigePoints);

  const isPurchased = purchasedAngelUpgrades.includes(upgrade.id);
  const canAfford = !isPurchased && prestigePoints >= upgrade.cost;
  const business = upgrade.targetBusinessId
    ? BUSINESSES.find(b => b.id === upgrade.targetBusinessId)
    : null;
  const targetLabel = business ? t(business.name) : t('全局永久升级');

  return (
    <section
      className={`business-card-frame-4x1-bg relative flex min-h-[106px] items-center gap-3 overflow-hidden px-4 py-3 pr-3 shadow-[0_10px_18px_rgba(0,0,0,.24)] transition-all duration-200
        ${isPurchased ? 'saturate-110' : ''}
        ${!isPurchased && !canAfford ? 'opacity-70' : ''}
      `}
    >
      <div className="flex h-[82px] w-[74px] shrink-0 items-end justify-center">
        <AngelUpgradeIcon
          upgradeId={upgrade.id}
          alt={t(upgrade.name)}
          size={76}
          className={`max-h-[82px] w-auto drop-shadow-[0_16px_14px_rgba(0,0,0,0.62)] ${!isPurchased && !canAfford ? 'grayscale-[35%]' : ''}`}
        />
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <h4 className={`truncate text-[15px] font-black leading-tight ${isPurchased ? 'text-amber-100' : 'text-stone-50'}`}>
            {t(upgrade.name)}
          </h4>
          {isPurchased && (
            <span className="shrink-0 rounded bg-emerald-400/15 px-1.5 py-0.5 text-[11px] font-black text-emerald-300">
              {t('已购买')}
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-xs font-black text-amber-200">{targetLabel}</p>
        <p className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-stone-300">{t(upgrade.description)}</p>

        <div className="mt-2 inline-flex items-center gap-1 rounded-lg border border-stone-300/20 bg-black/30 px-2 py-1 text-xs font-black text-yellow-300">
          <span>{t('成本')}</span>
          <span>{upgrade.cost}</span>
          <AssetIcon id="currency/connection" size={12} />
        </div>
      </div>

      <div className="shrink-0">
        {isPurchased ? (
          <div className="flex h-[58px] w-[92px] flex-col items-center justify-center rounded-xl border border-emerald-200/45 bg-[linear-gradient(180deg,#34d399,#15803d)] px-2 text-center text-xs font-black leading-tight text-white shadow-[0_5px_0_#166534,0_8px_16px_rgba(0,0,0,.28)]">
            <AssetIcon id="status/check" size={14} />
            <span className="mt-0.5">{t('已购买')}</span>
          </div>
        ) : (
          <button
            onClick={() => onBuy(upgrade.id)}
            disabled={!canAfford}
            className={`flex h-[58px] w-[92px] flex-col items-center justify-center px-2 text-center text-xs font-black leading-tight transition-all duration-150
              ${canAfford
                ? GOLD_BUTTON_CLASS
                : DISABLED_BUTTON_CLASS
              }`}
          >
            {t('购买')}
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================================
// PrestigeTab 主组件
// ============================================================
export default function PrestigeTab() {
  const { t } = useTranslation();
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
    ? ` + ${t('人脉升级')}×${formatNumber(angelEffects.globalProfitMult)}`
    : '';
  const angelCostText = angelEffects.globalCostReduce < 1
    ? `${t('成本')}-${Math.round((1 - angelEffects.globalCostReduce) * 100)}%`
    : '';
  const angelSpeedText = angelEffects.globalCycleReduce < 1
    ? `${t('速度')}+${Math.round((1 - angelEffects.globalCycleReduce) * 100)}%`
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
    <div className="film-game-screen business-content-frame-bg flex flex-col gap-3 px-5 py-5 pb-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black leading-none tracking-normal text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">
          {t('人脉')}
        </h1>
        <div className="flex-shrink-0 rounded-lg border border-stone-300/25 bg-black/35 px-2.5 py-1 text-xs font-black text-stone-100 tabular-nums">
          {totalPrestigeCount}{t('次')} · ×{formatNumber(currentMultiplier)}
        </div>
      </div>

      <div className="business-card-frame-bg relative overflow-hidden px-6 py-6">
      {/* 转生状态卡片 */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-[72px] w-[72px] flex-shrink-0 place-items-center">
            <AssetIcon id="currency/connection" size={54} className="drop-shadow-[0_10px_12px_rgba(0,0,0,.45)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black leading-tight text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">{t(PRESTIGE_RULE.currencyName)}</h2>
            <p className="mt-0.5 text-xs font-bold text-stone-300">{t('转生后获得的永久加成货币')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* 当前人脉 */}
          <div className="bg-black/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-300">{t('当前')}{t(PRESTIGE_RULE.currencyName)}</span>
              <span className="text-base font-black text-amber-200">{formatNumberSmart(prestigePoints)}</span>
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
              <span className="text-xs font-bold text-stone-300">{t('利润加成（人脉）')}</span>
              <span className="text-base font-black text-green-300">×{formatNumber(currentMultiplier)}{angelProfitText}</span>
            </div>
            {(angelCostText || angelSpeedText) && (
              <div className="mt-1 flex gap-3 text-xs font-bold">
                {angelCostText && <span className="text-blue-300">{angelCostText}</span>}
                {angelSpeedText && <span className="text-cyan-300">{angelSpeedText}</span>}
              </div>
            )}
          </div>

          {/* 转生次数 */}
          <div className="bg-black/20 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300">{t('累计转生次数')}</span>
              <span className="text-base font-black text-stone-50">{totalPrestigeCount}{t('次')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 转生操作区 */}
      <div className="mt-4 border-t border-stone-300/15 pt-4">
        <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-black text-amber-100">
          <AssetIcon id="nav/prestige" size={18} />
          {t('转生重置')}
        </h3>

        {!unlockMet ? (
          <div className="text-center">
            <p className="mb-2 text-xs font-bold text-stone-300">
              {t('累计收入达到')}{formatCash(PRESTIGE_RULE.unlockCondition.value)}{t('后解锁转生')}
            </p>
            <div className="h-2 rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-amber-500 transition-all"
                style={{ width: `${Math.min(100, (totalEarned / PRESTIGE_RULE.unlockCondition.value) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs font-bold text-stone-400">
              {t('当前进度')}: {formatCash(totalEarned)} / {formatCash(PRESTIGE_RULE.unlockCondition.value)}
            </p>
          </div>
        ) : (
          <div className="text-center">
            {/* 预计获得 */}
            <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-3 mb-3">
              <p className="mb-1 text-xs font-bold text-stone-300">{t('本次转生预计获得')}</p>
              <div className="text-xl font-black text-amber-200">
                <span className="inline-flex items-center justify-center gap-1">
                  +{formatNumberSmart(gain)}
                  <AssetIcon id="currency/connection" size={22} />
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-stone-300">
                {t('转生后加成')}: ×{formatNumber(currentMultiplier)} → ×{formatNumber(nextMultiplier)}
              </p>
            </div>

            <button
              onClick={handlePrestige}
              disabled={!canDoPrestige}
              className={`
                w-full py-3 text-base font-black transition-all duration-150
                ${canDoPrestige
                  ? GOLD_BUTTON_CLASS
                  : DISABLED_BUTTON_CLASS
                }
              `}
            >
              <span className="inline-flex items-center justify-center gap-1">
                {canDoPrestige && <AssetIcon id="boost/fire" size={18} />}
                {canDoPrestige ? t('转生重置') : `${t('再赚')} ${formatCash(PRESTIGE_RULE.unlockCondition.value - totalEarned)} ${t('即可转生')}`}
              </span>
            </button>

            {gain < 2 && (
              <p className="mt-2 text-xs font-bold text-yellow-300/80">
                {t('建议：转生获得≥2点更有价值，继续积累收入吧！')}
              </p>
            )}
          </div>
        )}

        {/* 转生说明 */}
        <div className="mt-4 space-y-1.5 text-xs font-bold leading-snug text-stone-300">
          <h4 className="text-xs font-black text-amber-100">{t('转生说明')}</h4>
          <p><span className="text-red-300">{t('重置')}</span>: {t('现金')}、{t('产线数量')}、{t('店长雇佣')}、{t('全局升级')}、{t('广告增益')}</p>
          <p><span className="text-green-300">{t('保留')}</span>: {t('钻石')}、{t(PRESTIGE_RULE.currencyName)}、{t('人脉升级')}、{t('商城一次性购买')}</p>
          <p><span className="text-yellow-300">{t('加成')}</span>: {t('每点')}{t(PRESTIGE_RULE.currencyName)}{t('永久')}+{(PRESTIGE_RULE.permanentBonusCurve.perPoint * 100).toFixed(1)}%{t('全局利润')}</p>
          <p><span className="text-cyan-300">{t('赠送')}</span>: {t('转生后自动获得1个路边钢化膜摊')}</p>
        </div>
      </div>
      </div>

      {/* 人脉升级商店 — 按分层显示 */}
      <div className="px-1 pb-2 pt-1">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-stone-300/20 bg-black/30 px-3 py-2">
          <h3 className="flex min-w-0 items-center gap-1.5 text-base font-black text-amber-100 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
            <AssetIcon id="currency/connection" size={20} />
            <span className="truncate">{t('人脉升级商店')}</span>
          </h3>
          <span className="shrink-0 text-xs font-black text-yellow-300">
            {t('已购买')} {purchasedAngelUpgrades.length}/{ANGEL_UPGRADES.length}
          </span>
        </div>
        <p className="mb-4 px-1 text-xs font-bold leading-snug text-stone-300">
          {t('消耗')}{t(PRESTIGE_RULE.currencyName)}{t('购买永久升级。购买会降低利润加成，但获得更强大的永久效果！')}
        </p>

        {/* 按分层显示 */}
        {ANGEL_UPGRADE_TIERS.map(tier => {
          const tierUpgrades = getUpgradesForTier(tier.minPrestigeCount);
          const isUnlocked = totalPrestigeCount >= tier.minPrestigeCount;
          const businessUpgrades = tierUpgrades.filter(u => u.effectType === 'profit_mult_business');
          const globalUpgrades = tierUpgrades.filter(u => u.effectType !== 'profit_mult_business');
          const purchasedInTier = tierUpgrades.filter(u => purchasedAngelUpgrades.includes(u.id)).length;

          return (
            <div key={tier.id} className="mb-5 last:mb-0">
              {/* 分层标题 */}
              <div className="mb-2 flex items-center justify-between gap-2 px-1">
                <h4 className={`min-w-0 truncate text-sm font-black ${isUnlocked ? 'text-amber-200' : 'text-stone-500'}`}>
                  {isUnlocked ? (
                    <>
                      <AssetIcon id={tier.id === 1 ? 'nav/business' : 'currency/connection'} size={14} className="mr-1 align-[-2px]" />
                      {t(tier.name)}
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <AssetIcon id="status/lock" size={14} />
                      {t(tier.name)}（{t('需要转生')}{tier.minPrestigeCount}{t('次解锁')}）
                    </span>
                  )}
                </h4>
                {isUnlocked && (
                  <span className="text-xs font-black text-stone-300">
                    {purchasedInTier}/{tierUpgrades.length}
                  </span>
                )}
              </div>

              {isUnlocked ? (
                <>
                  {/* 产线加成（仅Tier 1有） */}
                  {businessUpgrades.length > 0 && (
                    <div className="mb-3">
                      <h4 className="mb-2 inline-flex items-center gap-1 px-1 text-sm font-black text-cyan-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
                        <AssetIcon id="nav/business" size={12} />
                        {t('产线利润加成')}（×3）
                      </h4>
                      <div className="flex flex-col gap-2.5">
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
                      <h4 className="mb-2 inline-flex items-center gap-1 px-1 text-sm font-black text-cyan-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
                        <AssetIcon id="currency/connection" size={12} />
                        {t('全局永久升级')}
                      </h4>
                      <div className="flex flex-col gap-2.5">
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
                <div className="business-card-frame-4x1-bg relative overflow-hidden p-4 text-center opacity-75">
                  <AssetIcon id="status/lock" size={32} />
                  <p className="mt-1 text-xs font-bold text-stone-400">
                    {t('转生')}{tier.minPrestigeCount}{t('次后解锁')} {tierUpgrades.length} {t('个人脉升级')}
                  </p>
                  {totalPrestigeCount < tier.minPrestigeCount && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all"
                          style={{ width: `${(totalPrestigeCount / tier.minPrestigeCount) * 100}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-[11px] font-black text-stone-400">
                        {totalPrestigeCount}/{tier.minPrestigeCount}{t('次')}
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
      <div className="px-1 pb-2 pt-1">
        <h3 className="mb-3 inline-flex items-center gap-1.5 text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
          <AssetIcon id="nav/business" size={18} />
          {t('商业版图统计')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label={t('历史总收入')} value={formatCash(totalEarned)} icon="currency/coin" />
          <StatCard label={t('当前现金')} value={formatCash(useGameStore.getState().cash)} icon="currency/coin" />
          <StatCard label={t('转生次数')} value={`${totalPrestigeCount}${t('次')}`} icon="nav/prestige" />
          <StatCard label={t('人脉加成')} value={`×${formatNumber(currentMultiplier)}`} icon="currency/connection" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: SharedAssetId }) {
  return (
    <div className="business-card-frame-2x1-bg relative overflow-hidden p-2.5 text-center">
      <AssetIcon id={icon} size={20} className="mb-0.5" />
      <div className="text-sm font-black text-stone-50 tabular-nums">{value}</div>
      <div className="text-xs font-bold text-stone-300">{label}</div>
    </div>
  );
}
