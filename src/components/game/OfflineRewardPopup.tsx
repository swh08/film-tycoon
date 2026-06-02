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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
          >
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-700 p-6 text-white text-center shadow-2xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mb-3 flex justify-center"
              >
                <AssetIcon id="currency/coin" size={72} />
              </motion.div>
              <h2 className="text-xl font-black mb-1">{t('离线收益')}</h2>
              <p className="text-sm text-white/70 mb-4">{t('你离开期间，店铺自动营业中...')}</p>

              <div className="bg-black/20 rounded-xl p-4 mb-4">
                <p className="text-3xl font-black text-yellow-200 mb-2">
                  +{formatCash(offlineData.earnings)}
                </p>
                <p className="text-xs text-white/60">
                  {t('离线时长')}: {formatTime(offlineData.duration)}
                  {offlineData.capped && ` (${t('已达上限')})`}
                </p>
              </div>

              <button
                onClick={handleClaim}
                className="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-b from-green-400 to-green-600 
                           text-white active:shadow-[0_1px_0_0_#166534,0_2px_4px_rgba(21,128,61,0.2)] active:translate-y-[2px]
                           transition-all duration-150 shadow-[0_3px_0_0_#166534,0_4px_8px_rgba(21,128,61,0.3)]
                           hover:from-green-300 hover:to-green-500"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <AssetIcon id="boost/gift" size={22} />
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
