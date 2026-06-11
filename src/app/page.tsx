// ============================================================
// 《贴膜大亨》主页面 — 全屏游戏壳
// ============================================================
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import TopHUD from '@/components/game/TopHUD';
import BottomTabs, { type TabId } from '@/components/game/BottomTabs';
import { PopupProvider } from '@/components/game/PopupLayer';
import OfflineRewardPopup from '@/components/game/OfflineRewardPopup';
import SettingsPanel from '@/components/game/SettingsPanel';
import DailyRewardPopup from '@/components/game/DailyRewardPopup';
import EventNotification from '@/components/game/EventNotification';
import BusinessIcon from '@/components/game/BusinessIcon';
import { useTranslation } from '@/i18n/useTranslation';

import BusinessTab from '@/components/game/tabs/BusinessTab';
import UpgradeTab from '@/components/game/tabs/UpgradeTab';
import ManagerTab from '@/components/game/tabs/ManagerTab';
import PrestigeTab from '@/components/game/tabs/PrestigeTab';
import ShopTab from '@/components/game/tabs/ShopTab';
import AchievementTab from '@/components/game/tabs/AchievementTab';

import { useGameStore } from '@/store/gameStore';

const TAB_INDEX: Record<TabId, number> = {
  business: 0, upgrade: 1, manager: 2, prestige: 3, shop: 4, achievement: 5,
};

export default function GamePage() {
  const activeTab = useGameStore(s => s.activeTab) as TabId;
  const setActiveTab = useGameStore(s => s.setActiveTab);
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const updateProgress = useGameStore(s => s.updateProgress);
  const save = useGameStore(s => s.save);
  const checkDailyLogin = useGameStore(s => s.checkDailyLogin);
  const lastTick = useRef<number>(Date.now());

  // 游戏主循环
  useEffect(() => {
    if (!isReady) return;

    let animFrameId: number;

    const gameLoop = () => {
      const now = Date.now();
      const deltaSec = Math.min((now - lastTick.current) / 1000, 0.1);
      lastTick.current = now;

      if (deltaSec > 0) {
        updateProgress(deltaSec);
      }

      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);

    const saveInterval = setInterval(() => {
      save();
    }, 30000);

    const handleBeforeUnload = () => {
      save();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cancelAnimationFrame(animFrameId);
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isReady, updateProgress, save]);

  useEffect(() => {
    setIsReady(true);
    // 检查每日登录
    setTimeout(() => {
      const { isRewardAvailable } = checkDailyLogin();
      if (isRewardAvailable) setShowDailyReward(true);
    }, 500);
  }, []);

  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="text-5xl mb-4 inline-block"
          >
            <BusinessIcon icon="stall" />
          </motion.div>
          <p className="text-yellow-400 font-bold text-base">{t('贴膜大亨')}</p>
          <p className="text-gray-500 text-sm">{t('加载中...')}</p>
        </div>
      </div>
    );
  }

  const TAB_COMPONENTS: Record<TabId, React.ReactNode> = {
    business: <BusinessTab />,
    upgrade: <UpgradeTab />,
    manager: <ManagerTab />,
    prestige: <PrestigeTab />,
    shop: <ShopTab />,
    achievement: <AchievementTab />,
  };

  return (
    <PopupProvider>
      <div className="fixed inset-0 flex flex-col overflow-hidden select-none">
        {/* 顶部HUD */}
        <TopHUD
          onSettingsOpen={() => setShowSettings(true)}
        />

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {TAB_COMPONENTS[activeTab]}
        </main>

        {/* 底部Tab */}
        <BottomTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

        {/* 离线收益弹窗 */}
        <OfflineRewardPopup />

        {/* 设置面板（内含统计入口） */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* 每日登录奖励 */}
        <DailyRewardPopup
          isOpen={showDailyReward}
          onClose={() => setShowDailyReward(false)}
        />

        {/* 事件通知 */}
        <EventNotification />
      </div>
    </PopupProvider>
  );
}
