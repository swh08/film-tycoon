// ============================================================
// 每日登录奖励弹窗
// ============================================================
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { DAILY_REWARDS } from '@/game/config/daily-rewards';
import { playDailyReward } from '@/game/sound';
import { useTranslation } from '@/i18n/useTranslation';
import DailyRewardIcon from './DailyRewardIcon';

interface DailyRewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOLD_BUTTON_CLASS =
  'w-full rounded-xl border border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] py-3 text-sm font-black text-stone-950 shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] transition-all duration-150 active:translate-y-[2px] active:shadow-[0_2px_0_rgba(120,53,15,.9),0_4px_8px_rgba(0,0,0,.25)]';

export default function DailyRewardPopup({ isOpen, onClose }: DailyRewardPopupProps) {
  const { t } = useTranslation();
  const loginStreak = useGameStore(s => s.loginStreak);

  const currentDay = ((loginStreak - 1) % 7) + 1;
  const currentReward = DAILY_REWARDS.find(r => r.day === currentDay) ?? DAILY_REWARDS[0];

  const handleClaim = () => {
    playDailyReward();
    useGameStore.getState().claimDailyReward();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2"
          >
            <div className="business-card-frame-bg relative overflow-hidden px-5 py-5 text-center text-white shadow-[0_20px_42px_rgba(0,0,0,.55)]">
              <div className="relative">
                <div className="mx-auto mb-1 grid h-32 w-32 place-items-center">
                  <DailyRewardIcon
                    day={currentReward.day}
                    alt={t(currentReward.name)}
                    size={124}
                    className="drop-shadow-[0_18px_16px_rgba(0,0,0,.62)]"
                  />
                </div>
                <h2 className="mb-1 text-2xl font-black leading-none text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">
                  {t('每日登录奖励')}
                </h2>
                <p className="mx-auto max-w-[16rem] text-sm font-bold leading-snug text-stone-300">
                  {t('连续登录第')} {loginStreak} {t('天')}
                </p>
              </div>

              <div className="relative my-4 overflow-hidden border border-black/50 bg-black/35 p-3 shadow-[inset_0_1px_3px_rgba(0,0,0,.85)]">
                <div className="grid grid-cols-7 gap-1.5">
                  {DAILY_REWARDS.map(reward => {
                    const isToday = reward.day === currentDay;
                    const isPast = reward.day < currentDay;

                    return (
                      <div
                        key={reward.day}
                        className={`
                          relative flex min-h-[56px] flex-col items-center justify-center gap-1 border px-1 py-1.5 text-center transition-all
                          ${isToday
                            ? 'border-amber-200/60 bg-amber-300/15 shadow-[0_0_12px_rgba(251,191,36,.22)]'
                            : isPast
                              ? 'border-emerald-200/25 bg-emerald-400/10'
                              : 'border-stone-400/15 bg-black/25'
                          }
                        `}
                      >
                        <span className={`text-[8px] font-black leading-none ${isToday ? 'text-amber-200' : 'text-stone-400'}`}>
                          {t('第')}{reward.day}{t('天')}
                        </span>
                        <span className={`text-[10px] font-black leading-none ${isToday ? 'text-amber-100' : isPast ? 'text-emerald-200' : 'text-stone-500'}`}>
                          {isToday ? t('今日') : isPast ? t('已领') : t('待领')}
                        </span>
                        {isToday && (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,.85)]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5 border border-amber-200/25 bg-amber-300/10 p-3 text-center shadow-[inset_0_1px_3px_rgba(0,0,0,.55)]">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
                    {t(currentReward.name)}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs font-bold leading-snug text-stone-300">
                    {t(currentReward.description)}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {currentReward.rewards.map((reward, index) => (
                      <span
                        key={`${reward.type}-${index}`}
                        className={`
                          inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-black leading-none
                          ${reward.type === 'diamond'
                            ? 'border-cyan-200/30 bg-cyan-300/15 text-cyan-200'
                            : reward.type === 'buff'
                              ? 'border-red-200/30 bg-red-300/15 text-red-200'
                              : 'border-amber-200/30 bg-black/25 text-amber-200'
                          }
                        `}
                      >
                        {t(reward.label)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleClaim} className={GOLD_BUTTON_CLASS}>
                {t('领取奖励')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
