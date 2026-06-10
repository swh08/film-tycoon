'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { ACHIEVEMENTS } from '@/game/config/achievements';
import { BUSINESSES } from '@/game/config/businesses';
import { calcRevenuePerSecond, calcTotalIncomePerSecond, formatCash, formatNumberSmart } from '@/game/formulas';
import { translateText } from '@/i18n';
import { useTranslation } from '@/i18n/useTranslation';
import { useGameStore } from '@/store/gameStore';
import AssetIcon, { type SharedAssetId } from './AssetIcon';
import BusinessIcon from './BusinessIcon';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPlayTime(startTime: number): string {
  const diffMs = Date.now() - startTime;
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}${translateText('天')}`);
  if (hours > 0) parts.push(`${hours}${translateText('小时')}`);
  parts.push(`${mins}${translateText('分')}`);
  return parts.join('');
}

function SectionTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-black leading-none tracking-normal text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
      {icon}
      {children}
    </h3>
  );
}

function PanelSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`business-card-frame-4x1-bg relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  color = 'text-yellow-300',
}: {
  icon: SharedAssetId;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
}) {
  return (
    <div className="business-card-frame-4x1-bg min-h-[92px] p-3 shadow-[0_8px_18px_rgba(0,0,0,.18)]">
      <div className="mb-2 flex items-center gap-2">
        <AssetIcon id={icon} size={25} className="drop-shadow-[0_6px_6px_rgba(0,0,0,.45)]" />
        <span className="min-w-0 truncate text-[11px] font-black leading-tight text-stone-300">{label}</span>
      </div>
      <p className={`truncate text-lg font-black leading-tight tabular-nums drop-shadow-[0_2px_1px_rgba(0,0,0,.75)] ${color}`}>{value}</p>
      {subValue && <p className="mt-1 truncate text-[11px] font-bold tabular-nums text-stone-400">{subValue}</p>}
    </div>
  );
}

export default function StatsPanel({ isOpen, onClose }: StatsPanelProps) {
  const { t } = useTranslation();
  const cash = useGameStore(s => s.cash);
  const diamonds = useGameStore(s => s.diamonds);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const totalEarned = useGameStore(s => s.totalEarned);
  const businesses = useGameStore(s => s.businesses);
  const hiredManagers = useGameStore(s => s.hiredManagers);
  const totalManualTaps = useGameStore(s => s.totalManualTaps);
  const totalPurchases = useGameStore(s => s.totalPurchases);
  const startTime = useGameStore(s => s.startTime);
  const totalPrestigeCount = useGameStore(s => s.totalPrestigeCount);
  const purchasedAngelUpgrades = useGameStore(s => s.purchasedAngelUpgrades);
  const purchasedBusinessUpgrades = useGameStore(s => s.purchasedBusinessUpgrades);
  const unlockedAchievements = useGameStore(s => s.unlockedAchievements);
  const adBuffs = useGameStore(s => s.adBuffs);
  const upgrades = useGameStore(s => s.upgrades);

  const incomePerSec = useMemo(() => {
    const s = useGameStore.getState();
    return calcTotalIncomePerSecond(s, adBuffs);
  }, [businesses, upgrades, adBuffs, hiredManagers, purchasedAngelUpgrades, purchasedBusinessUpgrades, prestigePoints]);

  const achievementRate = ACHIEVEMENTS.length > 0
    ? (unlockedAchievements.length / ACHIEVEMENTS.length) * 100
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="business-content-frame-bg fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden shadow-[0_-18px_36px_rgba(0,0,0,.55)]"
          >
            <div className="hud-frame-bg relative flex-shrink-0 px-4 pb-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center drop-shadow-[0_10px_10px_rgba(0,0,0,.55)]">
                    <AssetIcon id="nav/achievement" size={46} className="drop-shadow-[0_0_12px_rgba(251,191,36,.45)]" />
                  </div>
                  <div>
                    <h2 className="text-[1.7rem] font-black leading-none tracking-normal text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">{t('游戏统计')}</h2>
                    <p className="mt-1 text-xs font-bold text-stone-200/80">{t('查看你的贴膜帝国数据')}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close statistics"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-stone-200/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-100 shadow-[0_4px_0_#1f2937,0_8px_16px_rgba(0,0,0,.3)] transition-all active:translate-y-[2px] active:shadow-[0_2px_0_#1f2937]"
                >
                  <X size={21} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-5 py-5 pb-6">
              <section>
                <SectionTitle icon={<AssetIcon id="currency/coin" size={20} className="drop-shadow-[0_0_8px_rgba(251,191,36,.55)]" />}>{t('资源统计')}</SectionTitle>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard icon="currency/coin" label={t('当前现金')} value={formatCash(cash)} color="text-yellow-300" />
                  <StatCard icon="currency/diamond" label={t('钻石数量')} value={formatNumberSmart(diamonds)} color="text-cyan-300" />
                  <StatCard icon="currency/connection" label={t('人脉点数')} value={formatNumberSmart(prestigePoints)} color="text-orange-300" />
                </div>
              </section>

              <section>
                <SectionTitle icon={<AssetIcon id="boost/lightning" size={20} className="drop-shadow-[0_0_8px_rgba(34,211,238,.55)]" />}>{t('收入统计')}</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard icon="currency/coin" label={t('历史总收入')} value={formatCash(totalEarned)} color="text-emerald-300" />
                  <StatCard
                    icon="boost/lightning"
                    label={t('当前每秒收入')}
                    value={formatCash(incomePerSec) + `/${t('秒')}`}
                    subValue={incomePerSec > 0 ? formatCash(incomePerSec * 3600) + `/${t('时')}` : t('无被动收入')}
                    color="text-emerald-300"
                  />
                </div>
              </section>

              <section>
                <SectionTitle icon={<AssetIcon id="nav/business" size={20} className="drop-shadow-[0_0_8px_rgba(251,191,36,.5)]" />}>{t('产线统计')}</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESSES.map(biz => {
                    const bs = businesses.find(b => b.businessId === biz.id);
                    const qty = bs?.quantity ?? 0;
                      const hasMgr = bs?.hasManager ?? false;
                      const ips = qty > 0 && hasMgr
                      ? calcRevenuePerSecond(biz, qty, useGameStore.getState(), adBuffs)
                      : 0;

                    return (
                      <div key={biz.id} className="business-card-frame-4x1-bg min-h-[78px] p-3 shadow-[0_8px_18px_rgba(0,0,0,.18)]">
                        <div className="mb-1.5 flex min-w-0 items-center gap-2">
                          <BusinessIcon icon={biz.icon} className="text-lg flex-shrink-0 drop-shadow-[0_4px_5px_rgba(0,0,0,.45)]" />
                          <span className="min-w-0 flex-1 truncate text-[11px] font-black leading-tight text-stone-300">{t(biz.name)}</span>
                        </div>
                        <p className="truncate text-base font-black leading-tight text-yellow-300 tabular-nums drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
                          x{formatNumberSmart(qty)}
                          {ips > 0 && (
                            <span className="ml-1 text-[10px] font-black text-emerald-300">
                              {formatCash(ips)}/s
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <SectionTitle icon={<AssetIcon id="boost/timer" size={20} className="drop-shadow-[0_0_8px_rgba(59,130,246,.55)]" />}>{t('游戏数据')}</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard icon="boost/timer" label={t('游戏时长')} value={formatPlayTime(startTime)} color="text-blue-300" />
                  <StatCard icon="nav/business" label={t('手动点击次数')} value={formatNumberSmart(totalManualTaps)} color="text-pink-300" />
                  <StatCard icon="nav/shop" label={t('总购买次数')} value={formatNumberSmart(totalPurchases)} color="text-purple-300" />
                  <StatCard icon="nav/manager" label={t('雇佣店长数')} value={`${hiredManagers.length}/${BUSINESSES.length}`} color="text-emerald-300" />
                </div>
              </section>

              <section>
                <SectionTitle icon={<AssetIcon id="nav/prestige" size={20} className="drop-shadow-[0_0_8px_rgba(251,146,60,.55)]" />}>{t('转生统计')}</SectionTitle>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard icon="nav/prestige" label={t('转生次数')} value={totalPrestigeCount.toString()} color="text-orange-300" />
                  <StatCard icon="currency/connection" label={t('人脉升级数')} value={purchasedAngelUpgrades.length.toString()} color="text-orange-300" />
                  <StatCard icon="nav/upgrade" label={t('产线升级数')} value={purchasedBusinessUpgrades.length.toString()} color="text-indigo-300" />
                </div>
              </section>

              <section>
                <SectionTitle icon={<AssetIcon id="nav/achievement" size={20} className="drop-shadow-[0_0_8px_rgba(251,191,36,.55)]" />}>{t('成就进度')}</SectionTitle>
                <PanelSection className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-black text-stone-100 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">{t('已解锁成就')}</span>
                    <span className="text-lg font-black text-yellow-300 tabular-nums drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
                      {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                    </span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full border border-black/50 bg-black/45 shadow-[inset_0_1px_3px_rgba(0,0,0,.8)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#06b6d4,#22d3ee,#f59e0b)] transition-all duration-500"
                      style={{ width: `${achievementRate}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-bold text-stone-300">
                    {t('完成率')} {achievementRate.toFixed(1)}%
                  </p>
                </PanelSection>
              </section>

              <div className="h-4" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
