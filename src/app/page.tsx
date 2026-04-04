// ============================================================
// 《贴膜大亨》主页面 — 全屏游戏壳
// ============================================================
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// 不使用SSR的组件
const TopHUD = dynamic(() => import('@/components/game/TopHUD'), { ssr: false });
const BottomTabs = dynamic(() => import('@/components/game/BottomTabs'), { ssr: false });
const PopupProvider = dynamic(() => import('@/components/game/PopupLayer').then(m => ({ default: m.PopupProvider })), { ssr: false });
const OfflineRewardPopup = dynamic(() => import('@/components/game/OfflineRewardPopup'), { ssr: false });

const BusinessTab = dynamic(() => import('@/components/game/tabs/BusinessTab'), { ssr: false });
const UpgradeTab = dynamic(() => import('@/components/game/tabs/UpgradeTab'), { ssr: false });
const ManagerTab = dynamic(() => import('@/components/game/tabs/ManagerTab'), { ssr: false });
const PrestigeTab = dynamic(() => import('@/components/game/tabs/PrestigeTab'), { ssr: false });
const ShopTab = dynamic(() => import('@/components/game/tabs/ShopTab'), { ssr: false });

import type { TabId } from '@/components/game/BottomTabs';
import { useGameStore } from '@/store/gameStore';

export default function GamePage() {
  const [activeTab, setActiveTab] = useState<TabId>('business');
  const [isReady, setIsReady] = useState(false);
  const updateProgress = useGameStore(s => s.updateProgress);
  const save = useGameStore(s => s.save);
  const lastTick = useRef<number>(Date.now());

  // 游戏主循环
  useEffect(() => {
    if (!isReady) return;

    let animFrameId: number;

    const gameLoop = () => {
      const now = Date.now();
      const deltaSec = Math.min((now - lastTick.current) / 1000, 0.1); // 最大100ms防止大跳跃
      lastTick.current = now;

      if (deltaSec > 0) {
        updateProgress(deltaSec);
      }

      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);

    // 自动保存每30秒
    const saveInterval = setInterval(() => {
      save();
    }, 30000);

    // 页面关闭时保存
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

  // 等待客户端hydrated
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

  const renderTab = () => {
    switch (activeTab) {
      case 'business': return <BusinessTab />;
      case 'upgrade': return <UpgradeTab />;
      case 'manager': return <ManagerTab />;
      case 'prestige': return <PrestigeTab />;
      case 'shop': return <ShopTab />;
      default: return <BusinessTab />;
    }
  };

  return (
    <PopupProvider>
      <div className="fixed inset-0 flex flex-col bg-gray-950 overflow-hidden select-none">
        {/* 顶部HUD */}
        <TopHUD />

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {renderTab()}
        </main>

        {/* 底部Tab */}
        <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 离线收益弹窗 */}
        <OfflineRewardPopup />
      </div>
    </PopupProvider>
  );
}
