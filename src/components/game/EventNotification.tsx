// ============================================================
// 事件通知弹窗 — 当随机事件触发时显示
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { playEventStart } from '@/game/sound';
import { GAME_EVENTS } from '@/game/config/events';
import type { ActiveGameEvent } from '@/game/types';

export default function EventNotification() {
  const [currentEvent, setCurrentEvent] = useState<ActiveGameEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const activeEvents = useGameStore(s => s.activeEvents);

  // 检测新事件
  const prevEventIds = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!activeEvents) return;

    const currentIds = new Set(activeEvents.map(e => e.id));
    const prevIds = prevEventIds[0];

    // 查找新出现的事件
    for (const evt of activeEvents) {
      if (!prevIds.has(evt.id)) {
        setCurrentEvent(evt);
        setIsVisible(true);
        playEventStart();

        // 3秒后自动关闭
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => setCurrentEvent(null), 300);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }

    prevEventIds[1](currentIds);
  }, [activeEvents]);

  if (!currentEvent) return null;

  const eventDef = GAME_EVENTS.find(e => e.id === currentEvent.eventDefId);
  const boostText = (() => {
    switch (currentEvent.boostType) {
      case 'profit_mult': return `利润 ×${currentEvent.boostValue}`;
      case 'speed_mult': return `速度 ×${currentEvent.boostValue}`;
      case 'all_mult': return `全属性 ×${currentEvent.boostValue}`;
      case 'cost_reduce': return `成本 ${Math.round(currentEvent.boostValue * 100)}%`;
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
                         rounded-xl p-3 border border-purple-400/40 shadow-xl shadow-purple-900/50">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-3xl flex-shrink-0"
              >
                {currentEvent.icon}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white truncate">{currentEvent.name}</h3>
                  <span className={`text-[10px] font-bold ${boostColor}`}>
                    {boostText}
                  </span>
                </div>
                <p className="text-[10px] text-white/70 truncate">{currentEvent.description}</p>
                <p className="text-[10px] text-purple-300 mt-0.5">
                  ⏱ {Math.ceil(currentEvent.remainingSec)}秒
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
