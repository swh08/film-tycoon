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
import AchievementPanel from '@/components/game/AchievementPanel';

import BusinessTab from '@/components/game/tabs/BusinessTab';
import UpgradeTab from '@/components/game/tabs/UpgradeTab';
import ManagerTab from '@/components/game/tabs/ManagerTab';
import PrestigeTab from '@/components/game/tabs/PrestigeTab';
import ShopTab from '@/components/game/tabs/ShopTab';

import { useGameStore } from '@/store/gameStore';

const TAB_INDEX: Record<TabId, number> = {
  business: 0, upgrade: 1, manager: 2, prestige: 3, shop: 4,
};

export default function GamePage() {
  const activeTab = useGameStore(s => s.activeTab) as TabId;
  const setActiveTab = useGameStore(s => s.setActiveTab);
  const [isReady, setIsReady] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const updateProgress = useGameStore(s => s.updateProgress);
  const save = useGameStore(s => s.save);
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
            📱
          </motion.div>
          <p className="text-yellow-400 font-bold text-lg">贴膜大亨</p>
          <p className="text-gray-500 text-sm">加载中...</p>
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
  };

  return (
    <PopupProvider>
      <div className="fixed inset-0 flex flex-col bg-gray-950 overflow-hidden select-none">
        {/* 顶部HUD */}
        <TopHUD onAchievementOpen={() => setShowAchievements(true)} />

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {TAB_COMPONENTS[activeTab]}
        </main>

        {/* 底部Tab */}
        <BottomTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

        {/* 离线收益弹窗 */}
        <OfflineRewardPopup />

        {/* 成就面板 */}
        <AchievementPanel
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
        />
      </div>
    </PopupProvider>
  );
}
