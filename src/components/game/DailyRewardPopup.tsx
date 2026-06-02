// ============================================================
// 每日登录奖励弹窗
// ============================================================
'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { DAILY_REWARDS } from '@/game/config/daily-rewards';
import { formatCash } from '@/game/formulas';
import { playDailyReward } from '@/game/sound';
import AssetIcon from './AssetIcon';
import DailyRewardIcon from './DailyRewardIcon';

interface DailyRewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyRewardPopup({ isOpen, onClose }: DailyRewardPopupProps) {
  const loginStreak = useGameStore(s => s.loginStreak);
  const lastLoginDate = useGameStore(s => s.lastLoginDate);

  if (!isOpen) return null;

  const currentDay = ((loginStreak - 1) % 7) + 1; // 1-7循环
  const currentReward = DAILY_REWARDS.find(r => r.day === currentDay) ?? DAILY_REWARDS[0];

  const handleClaim = () => {
    playDailyReward();
    useGameStore.getState().claimDailyReward();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-[90%] max-w-sm rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* 头部 */}
        <div className="bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-600 p-5 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.25 }}
                style={{ left: `${10 + i * 12}%`, top: `${30 + (i % 3) * 20}%` }}
              />
            ))}
          </div>
          <DailyRewardIcon day={currentReward.day} alt={currentReward.name} size={72} className="mb-2" />
          <h2 className="text-xl font-black">每日登录奖励</h2>
          <p className="text-sm text-white/80 mt-1">连续登录第 {loginStreak} 天</p>
        </div>

        {/* 7天奖励预览 */}
        <div className="bg-gray-800 p-4">
          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {DAILY_REWARDS.map((reward, idx) => {
              const dayInCycle = ((loginStreak - 1) % 7) + 1;
              const isToday = reward.day === dayInCycle;
              const isPast = reward.day < dayInCycle;
              const isFuture = reward.day > dayInCycle;
              const isLast7th = reward.day === 7;

              return (
                <div
                  key={reward.day}
                  className={`
                    relative flex flex-col items-center p-1.5 rounded-lg transition-all
                    ${isToday
                      ? 'bg-gradient-to-b from-yellow-500/30 to-amber-600/20 ring-1 ring-yellow-400/40'
                      : isPast
                        ? 'bg-green-900/20'
                        : 'bg-gray-700/30'
                    }
                  `}
                >
                  <span className="text-[8px] text-gray-400 mb-0.5">Day{reward.day}</span>
                  <DailyRewardIcon
                    day={reward.day}
                    alt={reward.name}
                    size={24}
                    className={isPast ? 'grayscale opacity-50' : ''}
                  />
                  {isToday && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                  )}
                  {isPast && (
                    <AssetIcon id="status/check" size={12} className="absolute bottom-0.5 right-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* 今日奖励详情 */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <DailyRewardIcon day={currentReward.day} alt={currentReward.name} size={64} />
              <div className="flex-1">
                <h3 className="text-base font-bold text-yellow-400">{currentReward.name}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{currentReward.description}</p>
                <div className="flex gap-2 mt-2">
                  {currentReward.rewards.map((reward, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${reward.type === 'diamond'
                          ? 'bg-cyan-900/40 text-cyan-300'
                          : reward.type === 'buff'
                            ? 'bg-red-900/40 text-red-300'
                            : 'bg-yellow-900/40 text-yellow-300'
                        }`}
                    >
                      {reward.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 领取按钮 */}
          <button
            onClick={handleClaim}
            className="w-full py-3 rounded-xl font-black text-lg bg-gradient-to-b from-yellow-300 to-amber-600
                       text-gray-900 transition-all duration-150 shadow-[0_3px_0_0_#92400e,0_4px_8px_rgba(120,53,15,0.3)]
                       hover:from-yellow-200 hover:to-amber-500
                       active:shadow-[0_1px_0_0_#92400e,0_2px_4px_rgba(120,53,15,0.2)] active:translate-y-[2px]"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <AssetIcon id="boost/gift" size={24} />
              领取奖励
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
