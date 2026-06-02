// ============================================================
// 顶栏资源 HUD
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatNumberSmart, getMarketTrendText } from '@/game/formulas';
import { BUSINESSES } from '@/game/config/businesses';
import { GAME_EVENTS } from '@/game/config/events';
import { useTranslation } from '@/i18n/useTranslation';
import AnimatedNumber from './AnimatedNumber';
import AssetIcon, { resolveSharedAssetId, type SharedAssetId } from './AssetIcon';

export interface TopHUDProps {
  onSettingsOpen?: () => void;
}

interface TimerChip {
  icon: SharedAssetId;
  text: string;
  color: string;
}

interface EventChip {
  icon: SharedAssetId;
  text: string;
  remaining: number;
}

export default function TopHUD({ onSettingsOpen }: TopHUDProps) {
  const { t } = useTranslation();
  const cash = useGameStore(s => s.cash);
  const diamonds = useGameStore(s => s.diamonds);
  const businesses = useGameStore(s => s.businesses);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const marketMultipliers = useGameStore(s => s.marketMultipliers);

  const [buffTimers, setBuffTimers] = useState<TimerChip[]>([]);
  const [eventTimers, setEventTimers] = useState<EventChip[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      const state = useGameStore.getState();
      const buffs: TimerChip[] = [];

      for (const buff of state.adBuffs) {
        switch (buff.type) {
          case 'double_revenue': {
            const m = Math.floor(buff.remainingSec / 60);
            const s = Math.floor(buff.remainingSec % 60);
            buffs.push({
              icon: 'boost/fire',
              text: `${t('双倍收益')} ${m}:${s.toString().padStart(2, '0')}`,
              color: 'from-red-500/80 to-orange-500/80 shadow-red-500/40',
            });
            break;
          }
          case 'rush_order':
            buffs.push({
              icon: 'boost/rocket',
              text: `${t('爆单潮')} ${Math.ceil(buff.remainingSec)}s`,
              color: 'from-orange-500/80 to-yellow-500/80 shadow-orange-500/40',
            });
            break;
          case 'speed_boost':
            buffs.push({
              icon: 'boost/lightning',
              text: `${t('极速生产')} ${Math.ceil(buff.remainingSec)}s`,
              color: 'from-cyan-500/80 to-blue-500/80 shadow-cyan-500/40',
            });
            break;
          case 'extra_offline': {
            const m = Math.floor(buff.remainingSec / 60);
            const s = Math.floor(buff.remainingSec % 60);
            buffs.push({
              icon: 'boost/timer',
              text: `${t('额外离线收益')} ${m}:${s.toString().padStart(2, '0')}`,
              color: 'from-green-500/80 to-emerald-500/80 shadow-green-500/40',
            });
            break;
          }
        }
      }
      setBuffTimers(buffs);

      const events = state.activeEvents || [];
      if (events.length > 0) {
        setEventTimers(events.map(e => ({
          icon: resolveSharedAssetId(e.icon) ?? 'boost/lightning',
          text: t(GAME_EVENTS.find(eventDef => eventDef.id === e.eventDefId)?.name ?? e.name),
          remaining: Math.ceil(e.remainingSec),
        })));
      } else {
        setEventTimers([]);
      }
    }, 200);
    return () => clearInterval(timer);
  }, [t]);

  const activeMarkets = BUSINESSES
    .filter(b => {
      const bs = businesses.find(bs => bs.businessId === b.id);
      return bs && bs.quantity > 0;
    })
    .map(b => marketMultipliers[b.id] ?? 1);
  const avgMarket = activeMarkets.length > 0
    ? activeMarkets.reduce((a, b) => a + b, 0) / activeMarkets.length
    : 1;
  const marketTrend = getMarketTrendText(avgMarket);
  const marketIcon = resolveSharedAssetId(marketTrend.icon) ?? 'boost/lightning';
  const hasMarketEvent = avgMarket < 0.85 || avgMarket > 1.15;
  const hasSecondRow = eventTimers.length > 0 || buffTimers.length > 0 || hasMarketEvent;

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 
                    border-b-2 border-yellow-500/50 shadow-lg shadow-amber-900/30">
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1 min-w-0">
            <AssetIcon id="currency/coin" size={18} className="flex-shrink-0" />
            <AnimatedNumber
              value={cash}
              formatFn={formatNumberSmart}
              className="text-sm font-bold text-yellow-200 truncate tabular-nums"
            />
          </div>
          <div className="flex items-center gap-0.5">
            <AssetIcon id="currency/diamond" size={16} className="flex-shrink-0" />
            <AnimatedNumber
              value={diamonds}
              className="text-xs font-bold text-cyan-300 tabular-nums"
              formatFn={(n) => Math.floor(n).toString()}
            />
          </div>
          {prestigePoints > 0 && (
            <div className="flex items-center gap-0.5">
              <AssetIcon id="currency/connection" size={16} className="flex-shrink-0" />
              <AnimatedNumber
                value={prestigePoints}
                className="text-xs font-bold text-orange-300 tabular-nums"
                formatFn={formatNumberSmart}
              />
            </div>
          )}
        </div>

        <div className="flex items-center flex-shrink-0">
          {onSettingsOpen && (
            <button
              onClick={onSettingsOpen}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-b from-gray-400 to-gray-600
                         shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.3)]
                         hover:from-gray-300 hover:to-gray-500
                         active:shadow-[0_1px_0_0_#374151,0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[2px]
                         transition-all duration-150"
              aria-label={t('打开设置')}
            >
              <AssetIcon id="system/settings" size={18} />
            </button>
          )}
        </div>
      </div>

      {hasSecondRow && (
        <div className="flex items-center gap-1.5 px-3 pb-1.5 overflow-x-auto">
          {eventTimers.map((evt) => (
            <div
              key={evt.text}
              className="flex-shrink-0 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80
                             text-white text-[10px] font-bold animate-pulse shadow-md shadow-purple-500/40"
            >
              <AssetIcon id={evt.icon} size={13} className="mr-1 align-[-2px]" />
              {evt.remaining}s
            </div>
          ))}
          {buffTimers.map((buff, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 px-2 py-0.5 rounded-full bg-gradient-to-r ${buff.color}
                             text-white text-[10px] font-bold animate-pulse shadow-md`}
            >
              <AssetIcon id={buff.icon} size={13} className="mr-1 align-[-2px]" />
              {buff.text}
            </div>
          ))}
          {hasMarketEvent && (
            <div className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              avgMarket > 1.15 ? 'bg-green-600/80 text-green-100' : 'bg-red-600/80 text-red-100'
            }`}>
              <AssetIcon id={marketIcon} size={13} className="mr-1 align-[-2px]" />
              {t(marketTrend.text)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
