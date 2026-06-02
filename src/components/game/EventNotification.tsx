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

  const boostText = (() => {
    switch (currentEvent.boostType) {
      case 'profit_mult': return `${t('利润')} ×${currentEvent.boostValue}`;
      case 'speed_mult': return `${t('速度')} ×${currentEvent.boostValue}`;
      case 'all_mult': return `${t('全属性')} ×${currentEvent.boostValue}`;
      case 'cost_reduce': return `${t('成本')} ${Math.round(currentEvent.boostValue * 100)}%`;
      default: return '';
    }
  })();

  const boostColor = (() => {
    switch (currentEvent.boostType) {
      case 'profit_mult': return 'text-yellow-400';
      case 'speed_mult': return 'text-cyan-400';
      case 'all_mult': return 'text-yellow-200';
      case 'cost_reduce': return 'text-green-400';
      default: return 'text-white';
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
          className="fixed top-16 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-gradient-to-r from-purple-800/95 to-pink-800/95 backdrop-blur-md
                         rounded-xl p-3 shadow-xl shadow-purple-900/50">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex-shrink-0"
              >
                <ShopEventIcon eventId={currentEvent.eventDefId} alt={t(GAME_EVENTS.find(e => e.id === currentEvent.eventDefId)?.name ?? currentEvent.name)} size={48} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white truncate">{t(GAME_EVENTS.find(e => e.id === currentEvent.eventDefId)?.name ?? currentEvent.name)}</h3>
                  <span className={`text-[10px] font-bold ${boostColor}`}>
                    {boostText}
                  </span>
                  {queueCount > 0 && (
                    <span className="text-[9px] bg-white/20 text-white/80 px-1.5 py-0.5 rounded-full">
                      +{queueCount}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/70 truncate">{t(GAME_EVENTS.find(e => e.id === currentEvent.eventDefId)?.description ?? currentEvent.description)}</p>
                <p className="text-[10px] text-purple-300 mt-0.5 inline-flex items-center gap-1">
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
