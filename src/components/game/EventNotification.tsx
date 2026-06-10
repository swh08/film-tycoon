// ============================================================
// 事件通知弹窗 — 当随机事件触发时显示（支持多事件排队）
// ============================================================
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GAME_EVENTS } from '@/game/config/events';
import { playEventStart } from '@/game/sound';
import { useTranslation } from '@/i18n/useTranslation';
import AssetIcon from './AssetIcon';
import { ShopEventIcon } from './ShopIcon';

interface QueuedEvent {
  eventDefId: number;
  name: string;
  description: string;
  remainingSec: number;
  boostType: string;
  boostValue: number;
}

export default function EventNotification() {
  const { t } = useTranslation();
  const activeEvents = useGameStore(s => s.activeEvents);
  const prevEventIdsRef = useRef<Set<string>>(new Set());
  const queueRef = useRef<QueuedEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<QueuedEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showNext() {
    if (queueRef.current.length === 0) return;
    const evt = queueRef.current.shift()!;
    setQueueCount(queueRef.current.length);
    setCurrentEvent(evt);
    setIsVisible(true);
    playEventStart();

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      timerRef.current = setTimeout(() => {
        setCurrentEvent(null);
        timerRef.current = null;
        // Continue with the next queued event after the exit animation.
        showNext();
      }, 300);
    }, 3000);
  }

  useEffect(() => {
    if (!activeEvents) return;

    const currentIds = new Set(activeEvents.map(e => e.id));
    const prevIds = prevEventIdsRef.current;

    // 查找所有新出现的事件，加入队列
    const newEvents: QueuedEvent[] = [];
    for (const evt of activeEvents) {
      if (!prevIds.has(evt.id)) {
        newEvents.push({
          eventDefId: evt.eventDefId,
          name: evt.name,
          description: evt.description,
          remainingSec: evt.remainingSec,
          boostType: evt.boostType,
          boostValue: evt.boostValue,
        });
      }
    }

    prevEventIdsRef.current = currentIds;

    if (newEvents.length > 0) {
      queueRef.current = [...queueRef.current, ...newEvents];
      setQueueCount(queueRef.current.length);
      // 如果当前没有在展示，立即显示下一个
      if (!isVisible && !timerRef.current) {
        showNext();
      }
    }
  }, [activeEvents]);

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!currentEvent) return null;

  const eventDef = GAME_EVENTS.find(e => e.id === currentEvent.eventDefId);
  const eventName = t(eventDef?.name ?? currentEvent.name);
  const eventDescription = t(eventDef?.description ?? currentEvent.description);

  const boostText = (() => {
    switch (currentEvent.boostType) {
      case 'profit_mult': return `${t('利润')} x${currentEvent.boostValue}`;
      case 'speed_mult': return `${t('速度')} x${currentEvent.boostValue}`;
      case 'all_mult': return `${t('全属性')} x${currentEvent.boostValue}`;
      case 'cost_reduce': return `${t('成本')} ${Math.round(currentEvent.boostValue * 100)}%`;
      default: return '';
    }
  })();

  const boostToneClass = (() => {
    switch (currentEvent.boostType) {
      case 'profit_mult': return 'border-amber-200/40 bg-amber-300/15 text-amber-200';
      case 'speed_mult': return 'border-cyan-200/40 bg-cyan-300/15 text-cyan-200';
      case 'all_mult': return 'border-yellow-100/45 bg-yellow-300/20 text-yellow-100';
      case 'cost_reduce': return 'border-emerald-200/40 bg-emerald-300/15 text-emerald-200';
      default: return 'border-stone-300/30 bg-black/30 text-stone-200';
    }
  })();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="pointer-events-none fixed left-4 right-4 top-16 z-50 mx-auto max-w-sm"
        >
          <div className="business-card-frame-4x1-bg relative overflow-hidden px-4 py-3 shadow-[0_14px_30px_rgba(0,0,0,.5)]">
            <div className="relative grid grid-cols-[70px_minmax(0,1fr)] items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="grid h-[70px] w-[70px] flex-shrink-0 place-items-center"
              >
                <ShopEventIcon
                  eventId={currentEvent.eventDefId}
                  alt={eventName}
                  size={62}
                  className="drop-shadow-[0_12px_12px_rgba(0,0,0,.5)]"
                />
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="min-w-0 flex-1 truncate text-base font-black text-amber-100 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
                    {eventName}
                  </h3>
                  <span className={`flex-shrink-0 rounded-lg border px-2 py-0.5 text-[11px] font-black tabular-nums ${boostToneClass}`}>
                    {boostText}
                  </span>
                  {queueCount > 0 && (
                    <span className="flex-shrink-0 rounded-lg border border-stone-200/25 bg-black/35 px-1.5 py-0.5 text-[10px] font-black text-stone-200">
                      +{queueCount}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-bold text-stone-300">{eventDescription}</p>
                <p className="mt-2 inline-flex items-center gap-1 rounded-lg border border-stone-400/25 bg-black/35 px-2 py-1 text-[11px] font-black text-stone-200">
                  <AssetIcon id="boost/timer" size={12} />
                  {Math.ceil(currentEvent.remainingSec)}{t('秒')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
