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
    <div className="flex flex-col px-3 py-3 pb-4">
      {/* 头部 + 进度 */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <AssetIcon id="nav/achievement" size={28} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-black text-yellow-400">{t('成就殿堂')}</h2>
            <span className="text-xs font-bold text-yellow-400 tabular-nums">
              {unlockedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400"
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
              <h3 className="text-xs font-bold text-gray-400 mb-2 px-1 inline-flex items-center gap-1">
                <AssetIcon id={cat.icon} size={14} />
                {t(cat.name)}
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {achievements.map(ach => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);

                  return (
                    <div
                      key={ach.id}
                      className={`
                        rounded-xl p-2.5 transition-all
                        ${isUnlocked
                          ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/20'
                          : 'bg-gray-800/50 opacity-70'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`
                          relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden
                          ${isUnlocked ? 'bg-yellow-500/20' : 'bg-gray-700/50'}
                        `}>
                          <AchievementIcon
                            achievementId={ach.id}
                            alt={t(ach.name)}
                            size={36}
                            className={isUnlocked ? '' : 'grayscale opacity-45'}
                          />
                          {!isUnlocked && (
                            <span className="absolute inset-0 flex items-center justify-center bg-gray-900/35">
                              <AssetIcon id="status/lock" size={18} />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isUnlocked ? 'text-yellow-300' : 'text-gray-400'}`}>
                              {t(ach.name)}
                            </span>
                            {isUnlocked && ach.reward && (
                              <span className="text-[10px] font-bold text-green-400 inline-flex items-center gap-0.5">
                                +{ach.reward.type === 'cash' ? formatCash(ach.reward.value) : ach.reward.value}
                                {ach.reward.type === 'diamond' && <AssetIcon id="currency/diamond" size={11} />}
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t(ach.description)}
                          </p>
                        </div>
                        {isUnlocked && (
                          <AssetIcon id="status/check" size={14} className="flex-shrink-0" />
                        )}
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
