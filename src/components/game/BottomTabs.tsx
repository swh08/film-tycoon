// ============================================================
// 底部 5 Tab 导航栏
// ============================================================
'use client';

import { useGameStore } from '@/store/gameStore';

export type TabId = 'business' | 'upgrade' | 'manager' | 'prestige' | 'shop' | 'achievement';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'business', label: '生意', icon: '💼' },
  { id: 'upgrade', label: '升级', icon: '⬆️' },
  { id: 'manager', label: '店长', icon: '👥' },
  { id: 'prestige', label: '人脉', icon: '🤝' },
  { id: 'shop', label: '商城', icon: '🛒' },
  { id: 'achievement', label: '成就', icon: '🏅' },
];

interface BottomTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
  // 获取是否有未领取的离线收益提示
  const tutorialStep = useGameStore(s => s.tutorialStep);

  return (
    <nav className="sticky bottom-0 z-40 flex items-stretch bg-gradient-to-t from-gray-950 via-gray-900 to-gray-800 
                    border-t-2 border-yellow-600/50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
         role="tablist">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        const showBadge = tab.id === 'business' && tutorialStep === 'first_tap';

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex flex-col items-center justify-center py-2 min-h-[56px]
              transition-all duration-200 relative
              ${isActive
                ? 'text-yellow-400 bg-yellow-500/10'
                : 'text-gray-400 hover:text-gray-200 active:bg-gray-700/30'
              }
            `}
          >
            {/* 活跃指示器 */}
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 
                              bg-gradient-to-r from-yellow-400 to-amber-500 rounded-b-full" />
            )}
            
            {/* 图标 */}
            <span className={`text-lg mb-0.5 transition-transform duration-200
                            ${isActive ? 'scale-110' : ''}`}>
              {tab.icon}
            </span>

            {/* 标签文字 */}
            <span className={`text-[10px] font-medium ${isActive ? 'text-yellow-400' : ''}`}>
              {tab.label}
            </span>

            {/* 引导提示红点 */}
            {showBadge && (
              <div className="absolute top-1 right-1/4 w-2.5 h-2.5 bg-red-500 rounded-full 
                              animate-ping" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
