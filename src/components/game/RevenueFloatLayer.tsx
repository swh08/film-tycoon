// ============================================================
// 收益飘字 — 产线完成产出时显示的浮动金额动画
// ============================================================
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCash, calcRevenuePerCycle } from '@/game/formulas';
import { BUSINESSES } from '@/game/config/businesses';
import BusinessIcon from './BusinessIcon';

interface FloatingText {
  id: number;
  icon: string;
  x: number;
  amount: number;
}

let textIdCounter = 0;

export default function RevenueFloatLayer() {
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const prevProgressRef = useRef<Record<number, number>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      const newFloats: FloatingText[] = [];

      for (const bs of state.businesses) {
        if (bs.quantity <= 0 || !bs.hasManager) continue;

        const prev = prevProgressRef.current[bs.businessId] ?? 0;
        // 检测：上次进度接近完成(>0.9)，这次进度很低(<0.1) → 刚完成一次产出
        if (prev > 0.9 && bs.progress < 0.1) {
          const def = BUSINESSES.find(b => b.id === bs.businessId);
          if (def) {
            // 使用完整收益公式，包含所有加成
            const amount = calcRevenuePerCycle(def, bs.quantity, state, state.adBuffs);
            const x = 50 + (Math.random() - 0.5) * 30;

            newFloats.push({
              id: ++textIdCounter,
              icon: def.icon,
              x,
              amount,
            });
          }
        }
        prevProgressRef.current[bs.businessId] = bs.progress ?? 0;
      }

      if (newFloats.length > 0) {
        setFloats(prev => [...prev, ...newFloats]);
        setTimeout(() => {
          const ids = new Set(newFloats.map(f => f.id));
          setFloats(prev => prev.filter(f => !ids.has(f.id)));
        }, 1500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {floats.map(f => (
          <motion.div
            key={f.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute font-arcade text-sm font-bold text-yellow-300 whitespace-nowrap"
            style={{
              left: `${f.x}%`,
              top: '35%',
              transform: 'translateX(-50%)',
              textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(251, 191, 36, 0.3), 0 2px 4px rgba(0,0,0,0.9)',
            }}
          >
            <BusinessIcon icon={f.icon} className="mr-1" />+{formatCash(f.amount)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
