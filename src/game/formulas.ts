// ============================================================
// 公式引擎 — 成本/收益/生产 计算
// ============================================================
import { BusinessDef, CostCurve, Milestone, AdBuff } from './types';
import { BUSINESSES } from './config/businesses';
import { GLOBAL_UPGRADES } from './config/upgrades';
import { calcPrestigeMultiplier } from './config/prestige';
import type { BusinessState, UpgradeState, GameState } from './types';

// === 成本计算 ===

/** 获取当前拥有某产线的数量 */
function getQuantity(state: GameState, businessId: number): number {
  const b = state.businesses.find(b => b.businessId === businessId);
  return b?.quantity ?? 0;
}

/** 计算购买 N 个产线的总成本 */
export function calcBuyCost(
  businessDef: BusinessDef,
  currentQuantity: number,
  count: number = 1,
): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += calcSingleCost(businessDef, currentQuantity + i);
  }
  return Math.ceil(total);
}

/** 计算购买第 N+1 个产线的单价 */
function calcSingleCost(businessDef: BusinessDef, owned: number): number {
  const { baseCost, costMultiplier, costCurve } = businessDef;
  switch (costCurve) {
    case 'linear':
      return baseCost * (1 + costMultiplier * owned);
    case 'exponential':
      return baseCost * Math.pow(costMultiplier, owned);
    case 'polynomial':
      return baseCost * Math.pow(owned + 1, 2) * costMultiplier;
    default:
      return baseCost * Math.pow(costMultiplier, owned);
  }
}

/** 计算最多能买多少个（给定预算） */
export function calcMaxBuyable(
  businessDef: BusinessDef,
  currentQuantity: number,
  budget: number,
): number {
  let count = 0;
  let totalCost = 0;
  while (true) {
    const nextCost = calcSingleCost(businessDef, currentQuantity + count);
    if (totalCost + nextCost > budget) break;
    totalCost += nextCost;
    count++;
    if (count > 10000) break; // 安全阀
  }
  return count;
}

// === 收益计算 ===

/** 计算产线当前倍率里程碑乘数 */
export function calcMilestoneMultiplier(businessDef: BusinessDef, quantity: number): number {
  let mult = 1;
  for (const ms of businessDef.milestones) {
    if (quantity >= ms.at) {
      mult *= ms.multiplier;
    }
  }
  return mult;
}

/** 获取下一个未达成的里程碑 */
export function getNextMilestone(businessDef: BusinessDef, quantity: number): Milestone | null {
  for (const ms of businessDef.milestones) {
    if (quantity < ms.at) return ms;
  }
  return null;
}

/** 计算全局升级效果汇总 */
export function calcGlobalEffects(upgrades: UpgradeState[]) {
  let cycleReduction = 0;     // 总周期缩减比例
  let profitMult = 0;         // 总利润加成比例
  let offlineCapHours = 8;    // 离线收益上限（小时）
  let offlineMult = 1;        // 离线收益倍率

  for (const u of upgrades) {
    if (u.level <= 0) continue;
    const def = GLOBAL_UPGRADES.find(g => g.id === u.upgradeId);
    if (!def) continue;

    const totalEffect = def.effectPerLevel * u.level;

    switch (def.effectType) {
      case 'cycle_reduce_all':
        cycleReduction += totalEffect;
        break;
      case 'profit_mult_all':
        profitMult += totalEffect;
        break;
      case 'offline_cap_increase':
        offlineCapHours += totalEffect;
        break;
      case 'offline_mult':
        offlineMult += totalEffect;
        break;
    }
  }

  return {
    cycleMultiplier: Math.max(0.1, 1 - cycleReduction), // 最多缩短到10%
    profitMultiplier: 1 + profitMult,
    offlineCapHours: Math.min(offlineCapHours, 24),
    offlineMult,
  };
}

/** 计算单条产线的实际收益（包含所有加成） */
export function calcRevenuePerCycle(
  businessDef: BusinessDef,
  quantity: number,
  state: GameState,
  adBuffs: AdBuff[],
): number {
  // 基础收益 = 单次收益 × 数量
  let revenue = businessDef.baseRevenue * quantity;

  // 里程碑倍率
  revenue *= calcMilestoneMultiplier(businessDef, quantity);

  // 全局升级利润加成
  const globalEffects = calcGlobalEffects(state.upgrades);
  revenue *= globalEffects.profitMultiplier;

  // 转生永久加成
  revenue *= calcPrestigeMultiplier(state.prestigePoints);

  // 广告增益（双倍收益）
  const hasDoubleRevenue = adBuffs.some(b => b.type === 'double_revenue');
  if (hasDoubleRevenue) revenue *= 2;

  // 爆单潮
  const rushBuff = adBuffs.find(b => b.type === 'rush_order');
  if (rushBuff) revenue *= 3;

  return revenue;
}

/** 计算单条产线的实际周期（秒） */
export function calcCycleTime(
  businessDef: BusinessDef,
  state: GameState,
  adBuffs: AdBuff[],
): number {
  let cycle = businessDef.baseCycleSec;

  // 全局升级周期缩减
  const globalEffects = calcGlobalEffects(state.upgrades);
  cycle *= globalEffects.cycleMultiplier;

  // 爆单潮（30秒极速，周期缩短80%）
  const rushBuff = adBuffs.find(b => b.type === 'rush_order');
  if (rushBuff) cycle *= 0.2;

  return Math.max(0.05, cycle); // 最低50ms
}

/** 计算产线每秒收益 */
export function calcRevenuePerSecond(
  businessDef: BusinessDef,
  quantity: number,
  state: GameState,
  adBuffs: AdBuff[],
): number {
  if (quantity <= 0) return 0;
  const cycle = calcCycleTime(businessDef, state, adBuffs);
  const perCycle = calcRevenuePerCycle(businessDef, quantity, state, adBuffs);
  return perCycle / cycle;
}

/** 计算所有已解锁产线的总每秒收益 */
export function calcTotalIncomePerSecond(state: GameState, adBuffs: AdBuff[]): number {
  let total = 0;
  for (const bs of state.businesses) {
    if (bs.quantity <= 0) continue;
    if (!bs.hasManager) continue; // 没有店长的产线不会自动产出
    const def = BUSINESSES.find(b => b.id === bs.businessId);
    if (!def) continue;
    total += calcRevenuePerSecond(def, bs.quantity, state, adBuffs);
  }
  return total;
}

/** 计算离线收益 */
export function calcOfflineEarnings(
  state: GameState,
  offlineSeconds: number,
  adBuffs: AdBuff[],
): { earnings: number; duration: number; capped: boolean } {
  const globalEffects = calcGlobalEffects(state.upgrades);
  const maxSeconds = globalEffects.offlineCapHours * 3600;
  const capped = offlineSeconds > maxSeconds;
  const effectiveSeconds = Math.min(offlineSeconds, maxSeconds);

  const perSecond = calcTotalIncomePerSecond(state, adBuffs);
  const earnings = perSecond * effectiveSeconds;

  return {
    earnings: Math.floor(earnings),
    duration: effectiveSeconds,
    capped,
  };
}

// === 全局升级成本 ===

/** 计算全局升级当前等级的升级费用 */
export function calcUpgradeCost(
  upgradeId: number,
  currentLevel: number,
): number {
  const def = GLOBAL_UPGRADES.find(g => g.id === upgradeId);
  if (!def) return Infinity;
  return Math.ceil(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
}

// === 数字格式化 ===

export function formatNumber(n: number): string {
  if (n < 0) return '-' + formatNumber(-n);
  if (n < 1000) return Math.floor(n).toString();
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  let tier = 0;
  let scaled = n;
  
  while (scaled >= 1000 && tier < suffixes.length - 1) {
    scaled /= 1000;
    tier++;
  }
  
  if (scaled < 10) {
    return scaled.toFixed(2) + suffixes[tier];
  } else if (scaled < 100) {
    return scaled.toFixed(1) + suffixes[tier];
  } else {
    return Math.floor(scaled) + suffixes[tier];
  }
}

export function formatCash(n: number): string {
  return '¥' + formatNumber(n);
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return Math.ceil(seconds) + '秒';
  if (seconds < 3600) return Math.floor(seconds / 60) + '分钟';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`;
}
