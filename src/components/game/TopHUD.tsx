// ============================================================
// Top resource HUD
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';
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
  tone: 'gold' | 'cyan' | 'green' | 'red';
}

interface EventChip {
  icon: SharedAssetId;
  text: string;
  remaining: number;
}

function ResourceCapsule({
  icon,
  value,
  tone,
  children,
}: {
  icon: SharedAssetId;
  value?: number;
  tone: 'coin' | 'diamond' | 'connection';
  children?: ReactNode;
}) {
  const toneClass = {
    coin: 'border-amber-300/45 shadow-amber-950/60',
    diamond: 'border-cyan-300/45 shadow-cyan-950/60',
    connection: 'border-emerald-300/45 shadow-emerald-950/60',
  }[tone];

  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-full border bg-[linear-gradient(180deg,rgba(30,38,43,.95),rgba(5,9,12,.95))] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_8px_18px_rgba(0,0,0,.35)] ${toneClass}`}
    >
      <div className="grid h-8 w-8 flex-shrink-0 place-items-center">
        <AssetIcon id={icon} size={23} />
      </div>
      <div className="min-w-0 flex-1 text-lg font-black leading-none tracking-normal text-stone-100 tabular-nums drop-shadow-[0_2px_1px_rgba(0,0,0,.8)]">
        {children ?? (
          <AnimatedNumber
            value={value ?? 0}
            formatFn={tone === 'coin' ? formatNumberSmart : (n) => Math.floor(n).toString()}
            className="truncate"
          />
        )}
      </div>
    </div>
  );
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
              tone: 'cyan',
            });
            break;
          }
          case 'rush_order':
            buffs.push({ icon: 'boost/rocket', text: `${t('爆单潮')} ${Math.ceil(buff.remainingSec)}s`, tone: 'gold' });
            break;
          case 'speed_boost':
            buffs.push({ icon: 'boost/lightning', text: `${t('极速生产')} ${Math.ceil(buff.remainingSec)}s`, tone: 'cyan' });
            break;
          case 'extra_offline': {
            const m = Math.floor(buff.remainingSec / 60);
            const s = Math.floor(buff.remainingSec % 60);
            buffs.push({ icon: 'boost/timer', text: `${t('额外离线收益')} ${m}:${s.toString().padStart(2, '0')}`, tone: 'green' });
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
  const hasMarketEvent = avgMarket < 0.85 || avgMarket > 1.15;
  const marketTone = avgMarket >= 1 ? 'text-red-300 border-red-300/40 bg-red-950/35' : 'text-emerald-300 border-emerald-300/40 bg-emerald-950/35';

  return (
    <div className="hud-frame-bg sticky top-0 z-40 px-3.5 pb-3 pt-4 shadow-[0_10px_28px_rgba(0,0,0,.45)] backdrop-blur">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_38px] items-center gap-1.5">
        <ResourceCapsule icon="currency/coin" tone="coin" value={cash} />
        <ResourceCapsule icon="currency/diamond" tone="diamond" value={diamonds} />
        <ResourceCapsule icon="currency/connection" tone="connection" value={prestigePoints} />

        {onSettingsOpen && (
          <button
            onClick={onSettingsOpen}
            className="grid h-10 w-10 place-items-center active:scale-95"
            aria-label={t('打开设置')}
          >
            <AssetIcon id="system/settings" size={40} />
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
        {hasMarketEvent && (
          <div className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,.08)] ${marketTone}`}>
            <span className="grid h-6 w-6 place-items-center rounded-md border border-stone-200/20 bg-black/35">
              <TrendingUp size={17} strokeWidth={3} />
            </span>
            {t(marketTrend.text)}
          </div>
        )}

        {eventTimers.map((evt) => (
          <div
            key={evt.text}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-fuchsia-300/35 bg-fuchsia-950/35 px-2.5 py-1.5 text-sm font-black text-fuchsia-100"
          >
            <AssetIcon id={evt.icon} size={22} />
            {evt.remaining}s
          </div>
        ))}

        {buffTimers.map((buff, idx) => (
          <div
            key={idx}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-cyan-300/45 bg-cyan-950/35 px-2.5 py-1.5 text-sm font-black text-cyan-100 shadow-[0_0_16px_rgba(20,184,166,.14)]"
          >
            <AssetIcon id={buff.icon} size={22} />
            {buff.text}
          </div>
        ))}
      </div>
    </div>
  );
}
