// ============================================================
// 成就Tab — 内联展示所有成就及解锁状态
// ============================================================
'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { ACHIEVEMENTS } from '@/game/config/achievements';
import { formatCash } from '@/game/formulas';
import { useTranslation } from '@/i18n/useTranslation';
import AssetIcon, { type SharedAssetId } from '../AssetIcon';
import AchievementIcon from '../AchievementIcon';

export default function AchievementTab() {
  const { t } = useTranslation();
  const unlockedAchievements = useGameStore(s => s.unlockedAchievements);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPct = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  // 分类成就
  const categories: { name: string; icon: SharedAssetId; ids: string[] }[] = [
    { name: '收入里程碑', icon: 'currency/coin', ids: ACHIEVEMENTS.filter(a => a.condition.type === 'total_earned').map(a => a.id) },
    { name: '产线成就', icon: 'nav/business', ids: ACHIEVEMENTS.filter(a => ['businesses_unlocked', 'business_quantity_min'].includes(a.condition.type)).map(a => a.id) },
    { name: '店长成就', icon: 'nav/manager', ids: ACHIEVEMENTS.filter(a => a.condition.type === 'managers_hired').map(a => a.id) },
    { name: '转生成就', icon: 'nav/prestige', ids: ACHIEVEMENTS.filter(a => a.condition.type === 'prestige_count').map(a => a.id) },
    { name: '升级成就', icon: 'nav/upgrade', ids: ACHIEVEMENTS.filter(a => ['global_upgrade_level', 'business_upgrades_bought'].includes(a.condition.type)).map(a => a.id) },
    { name: '人脉成就', icon: 'currency/connection', ids: ACHIEVEMENTS.filter(a => a.condition.type === 'angel_upgrades_bought').map(a => a.id) },
    { name: '其他成就', icon: 'nav/achievement', ids: ACHIEVEMENTS.filter(a => ['manual_taps', 'total_purchases'].includes(a.condition.type)).map(a => a.id) },
  ];

  return (
    <div className="film-game-screen business-content-frame-bg flex flex-col gap-3 px-5 py-5 pb-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black leading-none tracking-normal text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">
          {t('成就殿堂')}
        </h1>
        <div className="flex-shrink-0 rounded-lg border border-amber-200/35 bg-black/35 px-2.5 py-1 text-sm font-black text-amber-200 tabular-nums">
          {unlockedCount}/{totalCount}
        </div>
      </div>

      {/* 头部 + 进度 */}
      <div className="business-card-frame-4x1-bg relative mb-1 grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3 overflow-hidden px-5 py-4">
        <div className="grid h-12 w-12 place-items-center">
          <AssetIcon id="nav/achievement" size={30} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="truncate text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">{t('当前进度')}</h2>
            <span className="flex-shrink-0 text-sm font-black text-stone-100 tabular-nums">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-black/50 bg-black/45 shadow-[inset_0_1px_3px_rgba(0,0,0,.8)]">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#fde68a)] shadow-[0_0_12px_rgba(251,191,36,.55)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* 成就分类列表 */}
      <div className="space-y-4">
        {categories.map(cat => {
          const achievements = cat.ids.map(id => ACHIEVEMENTS.find(a => a.id === id)!).filter(Boolean);
          if (achievements.length === 0) return null;

          return (
            <div key={cat.name}>
              <h3 className="mb-2 inline-flex items-center gap-2 px-1 text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
                <AssetIcon id={cat.icon} size={14} />
                {t(cat.name)}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {achievements.map(ach => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);

                  return (
                    <div
                      key={ach.id}
                      className={`
                        business-card-frame-4x1-bg relative overflow-hidden px-4 py-3 transition-all
                        ${isUnlocked ? '' : 'opacity-70 grayscale-[35%]'}
                      `}
                    >
                      <div className="relative grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3">
                        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden">
                          <AchievementIcon
                            achievementId={ach.id}
                            alt={t(ach.name)}
                            size={42}
                            className={isUnlocked ? 'drop-shadow-[0_8px_8px_rgba(0,0,0,.45)]' : 'grayscale opacity-45 drop-shadow-[0_8px_8px_rgba(0,0,0,.45)]'}
                          />
                          {!isUnlocked && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <AssetIcon id="status/lock" size={18} />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`truncate text-[15px] font-black leading-tight ${isUnlocked ? 'text-amber-100' : 'text-stone-400'}`}>
                              {t(ach.name)}
                            </span>
                          </div>
                          <p className={`mt-1 line-clamp-2 text-xs font-bold leading-snug ${isUnlocked ? 'text-stone-300' : 'text-stone-500'}`}>
                            {t(ach.description)}
                          </p>
                        </div>
                        <div className="flex min-w-[92px] items-center justify-end gap-2">
                          {isUnlocked && ach.reward && (
                            <span className="inline-flex h-7 flex-shrink-0 items-center gap-0.5 rounded-lg border border-emerald-200/30 bg-black/30 px-2 text-xs font-black leading-none text-emerald-300">
                              +{ach.reward.type === 'cash' ? formatCash(ach.reward.value) : ach.reward.value}
                              {ach.reward.type === 'diamond' && <AssetIcon id="currency/diamond" size={11} />}
                            </span>
                          )}
                          {isUnlocked && (
                            <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border border-emerald-200/30 bg-black/30">
                              <AssetIcon id="status/check" size={14} />
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
    </div>
  );
}
