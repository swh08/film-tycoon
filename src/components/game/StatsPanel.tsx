// ============================================================
// 统计面板 — 全屏覆盖层，展示全面的游戏统计信息
// ============================================================
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatCash, formatNumberSmart, calcTotalIncomePerSecond, calcRevenuePerSecond } from '@/game/formulas';
import { BUSINESSES } from '@/game/config/businesses';
import { ACHIEVEMENTS } from '@/game/config/achievements';
import AssetIcon, { type SharedAssetId } from './AssetIcon';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/** 格式化游戏时长 */
function formatPlayTime(startTime: number): string {
  const diffMs = Date.now() - startTime;
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  parts.push(`${mins}分`);
  return parts.join('');
}

/** 统计区块卡片 */
function StatCard({ icon, label, value, subValue, color = 'text-yellow-300' }: {
  icon: SharedAssetId;
  label: string;
  value: string;
  subValue?: string;
  color?: string;
}) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <AssetIcon id={icon} size={18} />
        <span className="text-[10px] text-gray-400 font-medium">{label}</span>
      </div>
      <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
      {subValue && <p className="text-[10px] text-gray-500 tabular-nums mt-0.5">{subValue}</p>}
    </div>
  );
}

export default function StatsPanel({ isOpen, onClose }: StatsPanelProps) {
  const cash = useGameStore(s => s.cash);
  const diamonds = useGameStore(s => s.diamonds);
  const prestigePoints = useGameStore(s => s.prestigePoints);
  const totalEarned = useGameStore(s => s.totalEarned);
  const businesses = useGameStore(s => s.businesses);
  const hiredManagers = useGameStore(s => s.hiredManagers);
  const totalManualTaps = useGameStore(s => s.totalManualTaps);
  const totalPurchases = useGameStore(s => s.totalPurchases);
  const startTime = useGameStore(s => s.startTime);
  const totalPrestigeCount = useGameStore(s => s.totalPrestigeCount);
  const purchasedAngelUpgrades = useGameStore(s => s.purchasedAngelUpgrades);
  const purchasedBusinessUpgrades = useGameStore(s => s.purchasedBusinessUpgrades);
  const unlockedAchievements = useGameStore(s => s.unlockedAchievements);
  const adBuffs = useGameStore(s => s.adBuffs);
  const upgrades = useGameStore(s => s.upgrades);

  const incomePerSec = useMemo(() => {
    const s = useGameStore.getState();
    return calcTotalIncomePerSecond(s, adBuffs);
  }, [businesses, upgrades, adBuffs, hiredManagers, purchasedAngelUpgrades, purchasedBusinessUpgrades, prestigePoints]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* 统计面板 */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-gray-900 rounded-t-3xl overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-gradient-to-r from-blue-900/40 to-indigo-900/30 border-b border-blue-600/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AssetIcon id="nav/achievement" size={28} />
                  <div>
                    <h2 className="text-base font-black text-blue-400">游戏统计</h2>
                    <p className="text-[10px] text-gray-400">查看你的贴膜帝国数据</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 统计内容 */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {/* 💰 资源统计 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-2">资源统计</h3>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard
                    icon="currency/coin"
                    label="当前现金"
                    value={formatCash(cash)}
                    color="text-yellow-300"
                  />
                  <StatCard
                    icon="currency/diamond"
                    label="钻石数量"
                    value={formatNumberSmart(diamonds)}
                    color="text-cyan-300"
                  />
                  <StatCard
                    icon="currency/connection"
                    label="人脉点数"
                    value={formatNumberSmart(prestigePoints)}
                    color="text-orange-300"
                  />
                </div>
              </section>

              {/* 📈 收入统计 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-2">收入统计</h3>
                <div className="grid grid-cols-1 gap-2">
                  <StatCard
                    icon="currency/coin"
                    label="历史总收入"
                    value={formatCash(totalEarned)}
                    color="text-green-300"
                  />
                  <StatCard
                    icon="boost/lightning"
                    label="当前每秒收入"
                    value={formatCash(incomePerSec) + '/秒'}
                    subValue={incomePerSec > 0 ? formatCash(incomePerSec * 3600) + '/时' : '无被动收入'}
                    color="text-green-400"
                  />
                </div>
              </section>

              {/* 🎯 产线统计 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-2">产线统计</h3>
                <div className="bg-gray-800/60 rounded-xl p-3">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {BUSINESSES.map(biz => {
                      const bs = businesses.find(b => b.businessId === biz.id);
                      const qty = bs?.quantity ?? 0;
                      const hasMgr = bs?.hasManager ?? false;
                      const ips = qty > 0 && hasMgr
                        ? calcRevenuePerSecond(biz, qty, useGameStore.getState(), adBuffs)
                        : 0;
                      return (
                        <div key={biz.id} className="flex items-center gap-2">
                          <span className="text-base flex-shrink-0">{biz.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-300 truncate">{biz.name}</span>
                              {hasMgr && <AssetIcon id="nav/manager" size={12} />}
                            </div>
                            <span className="text-xs font-bold text-yellow-300 tabular-nums">
                              ×{formatNumberSmart(qty)}
                              {ips > 0 && (
                                <span className="text-[10px] text-green-400/80 ml-1">
                                  {formatCash(ips)}/s
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* ⏱️ 游戏时长 & 👆 操作统计 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-2">游戏数据</h3>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard
                    icon="boost/timer"
                    label="游戏时长"
                    value={formatPlayTime(startTime)}
                    color="text-blue-300"
                  />
                  <StatCard
                    icon="nav/business"
                    label="手动点击次数"
                    value={formatNumberSmart(totalManualTaps)}
                    color="text-pink-300"
                  />
                  <StatCard
                    icon="nav/shop"
                    label="总购买次数"
                    value={formatNumberSmart(totalPurchases)}
                    color="text-purple-300"
                  />
                  <StatCard
                    icon="nav/manager"
                    label="雇佣店长数"
                    value={`${hiredManagers.length}/${BUSINESSES.length}`}
                    color="text-green-300"
                  />
                </div>
              </section>

              {/* 🔄 转生统计 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-2">转生统计</h3>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard
                    icon="nav/prestige"
                    label="转生次数"
                    value={totalPrestigeCount.toString()}
                    color="text-orange-300"
                  />
                  <StatCard
                    icon="currency/connection"
                    label="人脉升级数"
                    value={purchasedAngelUpgrades.length.toString()}
                    color="text-orange-400"
                  />
                  <StatCard
                    icon="nav/upgrade"
                    label="产线升级数"
                    value={purchasedBusinessUpgrades.length.toString()}
                    color="text-indigo-300"
                  />
                </div>
              </section>

              {/* 🏆 成就进度 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-2">成就进度</h3>
                <div className="bg-gray-800/60 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-300">已解锁成就</span>
                    <span className="text-sm font-bold text-yellow-400 tabular-nums">
                      {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    完成率 {((unlockedAchievements.length / ACHIEVEMENTS.length) * 100).toFixed(1)}%
                  </p>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
