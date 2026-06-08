// ============================================================
// Bottom tab navigation
// ============================================================
'use client';

import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/i18n/useTranslation';
import AssetIcon, { type SharedAssetId } from '@/components/game/AssetIcon';

export type TabId = 'business' | 'upgrade' | 'manager' | 'prestige' | 'shop' | 'achievement';

interface Tab {
  id: TabId;
  label: string;
  icon: SharedAssetId;
}

const TABS: Tab[] = [
  { id: 'business', label: '生意', icon: 'nav/business' },
  { id: 'upgrade', label: '升级', icon: 'nav/upgrade' },
  { id: 'manager', label: '店长', icon: 'nav/manager' },
  { id: 'prestige', label: '人脉', icon: 'nav/prestige' },
  { id: 'shop', label: '商城', icon: 'nav/shop' },
  { id: 'achievement', label: '成就', icon: 'nav/achievement' },
];

interface BottomTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
  const tutorialStep = useGameStore(s => s.tutorialStep);
  const { t } = useTranslation();

  return (
    <nav
      className="nav-frame-bg sticky bottom-0 z-40 grid h-[82px] grid-cols-6 gap-1.5 px-3.5 pb-3 pt-3 shadow-[0_-10px_28px_rgba(0,0,0,.55)]"
      role="tablist"
    >
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        const showBadge = tab.id === 'business' && tutorialStep === 'first_tap';

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            style={{
              backgroundImage: `url('/assets/game/shared/ui/nav-item-${isActive ? 'active' : 'inactive'}-image2.png')`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
            className={`
              relative flex h-full min-h-0 flex-col items-center justify-center rounded-md border-0 transition-all duration-200
              ${isActive
                ? 'text-amber-100 shadow-[0_0_14px_rgba(34,211,238,.32)]'
                : 'text-stone-200 active:translate-y-[1px]'
              }
            `}
          >
            <AssetIcon
              id={tab.icon}
              alt=""
              size={28}
              className={`mb-1 transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,.7)]' : 'opacity-80 grayscale-[15%]'}`}
            />

            <span className={`text-[13px] font-black leading-none tracking-normal ${isActive ? 'text-amber-200' : 'text-stone-300'}`}>
              {t(tab.label)}
            </span>

            {showBadge && !isActive && (
              <div className="absolute right-3 top-2 grid h-5 w-5 place-items-center rounded-full border border-white/40 bg-red-500 text-[12px] font-black text-white shadow-[0_0_10px_rgba(239,68,68,.55)]">
                !
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
