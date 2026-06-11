// ============================================================
// 离线收益弹窗
// ============================================================
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { calcOfflineEarnings, formatCash, formatTime } from '@/game/formulas';
import { useTranslation } from '@/i18n/useTranslation';
import AssetIcon from './AssetIcon';

export default function OfflineRewardPopup() {
  const { t } = useTranslation();
  const lastOnlineTimestamp = useGameStore(s => s.lastOnlineTimestamp);
  const claimOfflineEarnings = useGameStore(s => s.claimOfflineEarnings);
  const tutorialStep = useGameStore(s => s.tutorialStep);
  const [shown, setShown] = useState(false);
  const [offlineData, setOfflineData] = useState<{ earnings: number; duration: number; capped: boolean } | null>(null);

  // 计算离线收益
  const offlineResult = useMemo(() => {
    if (shown) return null; // 已经弹过
    const now = Date.now();
    const offlineSec = (now - lastOnlineTimestamp) / 1000;
    if (offlineSec > 30 && tutorialStep !== 'none') {
      const state = useGameStore.getState();
      const result = calcOfflineEarnings(state, offlineSec, state.adBuffs);
      if (result.earnings > 0) return result;
    }
    return null;
  }, [lastOnlineTimestamp, tutorialStep, shown]);

  useEffect(() => {
    if (offlineResult && !shown) {
      setOfflineData(offlineResult);
      setShown(true);
    }
  }, [offlineResult, shown]);

  const handleClaim = () => {
    if (offlineData) {
      claimOfflineEarnings(offlineData.earnings);
    }
    setOfflineData(null);
  };

  return (
    <AnimatePresence>
      {offlineData && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2"
          >
            <div className="business-card-frame-bg relative overflow-hidden px-5 py-5 text-center text-white shadow-[0_20px_42px_rgba(0,0,0,.55)]">
              <div className="relative">
                <div className="mx-auto mb-2 grid h-20 w-20 place-items-center">
                  <AssetIcon id="currency/coin" size={76} className="drop-shadow-[0_12px_12px_rgba(0,0,0,.5)]" />
                </div>
                <h2 className="mb-1 text-2xl font-black leading-none text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">{t('离线收益')}</h2>
                <p className="mx-auto max-w-[16rem] text-sm font-bold leading-snug text-stone-300">{t('你离开期间，店铺自动营业中...')}</p>
              </div>

              <div className="relative my-5 overflow-hidden border border-black/50 bg-black/40 p-4 shadow-[inset_0_1px_3px_rgba(0,0,0,.85)]">
                <p className="mb-3 text-[32px] font-black leading-none text-amber-200 tabular-nums drop-shadow-[0_3px_1px_rgba(0,0,0,.8)]">
                  +{formatCash(offlineData.earnings)}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-black text-stone-300">
                  <span className="rounded-lg border border-stone-400/25 bg-black/35 px-2.5 py-1">
                    {t('离线时长')}: {formatTime(offlineData.duration)}
                  </span>
                  {offlineData.capped && (
                    <span className="rounded-lg border border-amber-200/35 bg-amber-300/15 px-2.5 py-1 text-amber-200">
                      {t('已达上限')}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleClaim}
                className="w-full rounded-xl border border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] py-3 text-sm font-black text-stone-950 shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] transition-all duration-150 active:translate-y-[2px] active:shadow-[0_2px_0_rgba(120,53,15,.9),0_4px_8px_rgba(0,0,0,.25)]"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {t('一键领取！')}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
