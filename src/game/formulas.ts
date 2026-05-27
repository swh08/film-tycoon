// ============================================================
// 公式引擎 — 成本/收益/生产 计算
// ============================================================
import { BusinessDef, CostCurve, Milestone, AdBuff, BusinessMode, ActiveGameEvent, GameEventDef } from './types';
import { BUSINESSES } from './config/businesses';
import { GLOBAL_UPGRADES } from './config/upgrades';
import { ANGEL_UPGRADES } from './config/angel-upgrades';
import { BUSINESS_UPGRADES } from './config/business-upgrades';
import { ACHIEVEMENTS } from './config/achievements';
import { MANAGERS } from './config/managers';
import { calcPrestigeMultiplier } from './config/prestige';
import { GAME_EVENTS } from './config/events';
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

/** 计算购买 N 个产线的总成本（含人脉升级折扣） */
export function calcBuyCostWithDiscount(
  businessDef: BusinessDef,
  currentQuantity: number,
  count: number = 1,
  purchasedAngelUpgrades: number[] = [],
): number {
  const raw = calcBuyCost(businessDef, currentQuantity, count);
  const angelEffects = calcAngelUpgradeEffects(purchasedAngelUpgrades);
  return Math.ceil(raw * angelEffects.globalCostReduce);
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

/** 计算最多能买多少个（给定预算，含折扣） */
export function calcMaxBuyable(
  businessDef: BusinessDef,
  currentQuantity: number,
  budget: number,
  purchasedAngelUpgrades: number[] = [],
): number {
  const angelEffects = calcAngelUpgradeEffects(purchasedAngelUpgrades);
  let count = 0;
  let totalCost = 0;
  while (true) {
    const nextCost = calcSingleCost(businessDef, currentQuantity + count) * angelEffects.globalCostReduce;
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

  // 产线专属升级利润加成
  revenue *= calcBusinessUpgradeProfitMult(businessDef.id, state.purchasedBusinessUpgrades || []);

  // 人脉升级加成（单产线+全局）
  const angelEffects = calcAngelUpgradeEffects(state.purchasedAngelUpgrades || []);
  revenue *= calcAngelBusinessProfitMult(businessDef.id, state.purchasedAngelUpgrades || []);
  revenue *= angelEffects.globalProfitMult;

  // 转生永久加成
  revenue *= calcPrestigeMultiplier(state.prestigePoints);

  // 广告增益（双倍收益）
  const hasDoubleRevenue = adBuffs.some(b => b.type === 'double_revenue');
  if (hasDoubleRevenue) revenue *= 2;

  // 爆单潮
  const rushBuff = adBuffs.find(b => b.type === 'rush_order');
  if (rushBuff) revenue *= 3;

  // 市场波动
  const marketMult = state.marketMultipliers?.[businessDef.id] ?? 1;
  revenue *= marketMult;

  // 店长等级加成（利润）
  revenue *= calcManagerLevelProfitMult(businessDef.id, state.managerLevels ?? {}, state.hiredManagers ?? []);

  // 利润/速度模式
  const businessMode = state.businessModes?.[businessDef.id] as BusinessMode | undefined;
  if (businessMode === 'profit') revenue *= 1.5;
  if (businessMode === 'speed') revenue *= 0.8;

  // 事件增益（利润类/全能类）
  const activeEvents = state.activeEvents as ActiveGameEvent[] | undefined;
  if (activeEvents) {
    for (const evt of activeEvents) {
      if (evt.boostType === 'profit_mult' || evt.boostType === 'all_mult') {
        revenue *= evt.boostValue;
      }
    }
  }

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

  // 产线专属升级速度加成
  cycle *= calcBusinessUpgradeCycleReduce(businessDef.id, state.purchasedBusinessUpgrades || []);

  // 人脉升级速度加成
  const angelEffects = calcAngelUpgradeEffects(state.purchasedAngelUpgrades || []);
  cycle *= angelEffects.globalCycleReduce;

  // 爆单潮（30秒极速，周期缩短80%）
  const rushBuff = adBuffs.find(b => b.type === 'rush_order');
  if (rushBuff) cycle *= 0.2;

  // Task 4: speed_boost buff（广告加速，value=3 means ×3 speed）
  const speedBuff = adBuffs.find(b => b.type === 'speed_boost');
  if (speedBuff) cycle /= speedBuff.value;

  // 店长等级加成（速度）
  cycle *= calcManagerLevelCycleReduce(businessDef.id, state.managerLevels ?? {}, state.hiredManagers ?? []);

  // 利润/速度模式
  const businessMode = state.businessModes?.[businessDef.id] as BusinessMode | undefined;
  if (businessMode === 'speed') cycle *= 0.5;
  if (businessMode === 'profit') cycle *= 1.5;

  // 事件增益（速度类/全能类）
  const activeEvents = state.activeEvents as ActiveGameEvent[] | undefined;
  if (activeEvents) {
    for (const evt of activeEvents) {
      if (evt.boostType === 'speed_mult' || evt.boostType === 'all_mult') {
        cycle /= evt.boostValue;
      }
    }
  }

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

/** 计算购买 N 级全局升级的总费用 */
export function calcUpgradeCostBulk(
  upgradeId: number,
  currentLevel: number,
  count: number,
): number {
  const def = GLOBAL_UPGRADES.find(g => g.id === upgradeId);
  if (!def) return Infinity;
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += def.baseCost * Math.pow(def.costMultiplier, currentLevel + i);
  }
  return Math.ceil(total);
}

/** 计算最多能买多少级升级（给定预算） */
export function calcMaxUpgradeLevels(
  upgradeId: number,
  currentLevel: number,
  maxLevel: number,
  budget: number,
): number {
  const def = GLOBAL_UPGRADES.find(g => g.id === upgradeId);
  if (!def) return 0;
  let count = 0;
  let totalCost = 0;
  const canBuy = maxLevel - currentLevel;
  for (let i = 0; i < canBuy; i++) {
    const cost = def.baseCost * Math.pow(def.costMultiplier, currentLevel + i);
    if (totalCost + cost > budget) break;
    totalCost += cost;
    count++;
    if (count > 10000) break;
  }
  return count;
}

// === 人脉升级效果 ===

/** 计算人脉升级的全局效果（利润倍率、成本折扣、速度加成） */
export function calcAngelUpgradeEffects(purchasedAngelUpgrades: number[]) {
  let globalProfitMult = 1;
  let globalCostReduce = 1; // 乘数，0.75 = 降低25%
  let globalCycleReduce = 1; // 乘数，0.70 = 减少30%

  for (const id of purchasedAngelUpgrades) {
    const def = ANGEL_UPGRADES.find(u => u.id === id);
    if (!def) continue;

    switch (def.effectType) {
      case 'profit_mult_all':
        globalProfitMult *= def.effectValue;
        break;
      case 'cost_reduce_all':
        globalCostReduce *= (1 - def.effectValue);
        break;
      case 'cycle_reduce_all':
        globalCycleReduce *= (1 - def.effectValue);
        break;
      // profit_mult_business 在 per-business 函数中处理
    }
  }

  return { globalProfitMult, globalCostReduce, globalCycleReduce };
}

/** 计算人脉升级对单条产线的利润倍率 */
export function calcAngelBusinessProfitMult(businessId: number, purchasedAngelUpgrades: number[]): number {
  let mult = 1;
  for (const id of purchasedAngelUpgrades) {
    const def = ANGEL_UPGRADES.find(u => u.id === id);
    if (!def || def.targetBusinessId !== businessId) continue;
    if (def.effectType === 'profit_mult_business') {
      mult *= def.effectValue;
    }
  }
  return mult;
}

// === 产线专属升级效果 ===

/** 计算产线专属升级对单条产线的利润倍率 */
export function calcBusinessUpgradeProfitMult(businessId: number, purchasedBusinessUpgrades: number[]): number {
  let mult = 1;
  for (const id of purchasedBusinessUpgrades) {
    const def = BUSINESS_UPGRADES.find(u => u.id === id);
    if (!def || def.businessId !== businessId) continue;
    if (def.effectType === 'profit_mult') {
      mult *= def.effectValue;
    }
  }
  return mult;
}

/** 计算产线专属升级对单条产线的速度缩减乘数 */
export function calcBusinessUpgradeCycleReduce(businessId: number, purchasedBusinessUpgrades: number[]): number {
  let reduction = 1; // 乘数，0.75 = 减少25%
  for (const id of purchasedBusinessUpgrades) {
    const def = BUSINESS_UPGRADES.find(u => u.id === id);
    if (!def || def.businessId !== businessId) continue;
    if (def.effectType === 'cycle_reduce') {
      reduction *= (1 - def.effectValue);
    }
  }
  return reduction;
}

// === 成就检查 ===

/** 检查成就条件是否满足 */
export function checkAchievementConditions(state: GameState): string[] {
  const newlyUnlocked: string[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (state.unlockedAchievements.includes(ach.id)) continue;

    let met = false;
    const cond = ach.condition;

    switch (cond.type) {
      case 'total_earned':
        met = state.totalEarned >= cond.value;
        break;
      case 'prestige_count':
        met = state.totalPrestigeCount >= cond.value;
        break;
      case 'business_quantity_min':
        met = state.businesses.some((b: BusinessState) => b.quantity >= cond.value);
        break;
      case 'businesses_unlocked':
        met = state.businesses.filter((b: BusinessState) => b.quantity > 0).length >= cond.value;
        break;
      case 'managers_hired':
        met = state.hiredManagers.length >= cond.value;
        break;
      case 'manual_taps':
        met = state.totalManualTaps >= cond.value;
        break;
      case 'total_purchases':
        met = state.totalPurchases >= cond.value;
        break;
      case 'angel_upgrades_bought':
        met = (state.purchasedAngelUpgrades || []).length >= cond.value;
        break;
      case 'business_upgrades_bought':
        met = (state.purchasedBusinessUpgrades || []).length >= cond.value;
        break;
      case 'global_upgrade_level':
        met = state.upgrades.some((u: UpgradeState) => u.level >= cond.value);
        break;
    }

    if (met) newlyUnlocked.push(ach.id);
  }

  return newlyUnlocked;
}

// === 店长等级效果 ===

/** 计算店长等级对指定产线的利润加成 */
export function calcManagerLevelProfitMult(
  businessId: number,
  managerLevels: Record<number, number>,
  hiredManagers: number[],
): number {
  let mult = 1;
  for (const mgrId of hiredManagers) {
    const def = MANAGERS.find(m => m.id === mgrId);
    if (!def) continue;
    const level = managerLevels[mgrId] ?? 0;
    if (level <= 0) continue;

    if (def.effectType === 'profit_mult' && def.businessId === 0) {
      // 全局利润店长：每级额外利润
      mult += def.upgradeEffectPerLevel * level;
    }
  }
  return mult;
}

/** 计算店长等级对指定产线的速度缩减 */
export function calcManagerLevelCycleReduce(
  businessId: number,
  managerLevels: Record<number, number>,
  hiredManagers: number[],
): number {
  let reduction = 1;
  for (const mgrId of hiredManagers) {
    const def = MANAGERS.find(m => m.id === mgrId);
    if (!def) continue;
    const level = managerLevels[mgrId] ?? 0;
    if (level <= 0) continue;

    if (def.effectType === 'auto_run' && def.businessId === businessId) {
      // 产线店长：每级额外速度
      reduction *= (1 - def.upgradeEffectPerLevel * level);
    }
    if (def.effectType === 'cycle_reduce' && def.businessId === 0) {
      // 全局速度店长：每级额外速度
      reduction *= (1 - def.upgradeEffectPerLevel * level);
    }
  }
  return reduction;
}

/** 计算店长升级费用 */
export function calcManagerUpgradeCost(managerId: number, currentLevel: number): number {
  const def = MANAGERS.find(m => m.id === managerId);
  if (!def) return Infinity;
  return Math.ceil(def.upgradeCostBase * Math.pow(def.upgradeCostMultiplier, currentLevel));
}

// === 市场波动 ===

/** 生成市场波动倍率 */
export function generateMarketMultipliers(): Record<number, number> {
  const multipliers: Record<number, number> = {};
  for (const biz of BUSINESSES) {
    const rand = Math.random();
    let mult: number;
    if (rand < 0.10) {
      // 10% 暴跌：×0.3 ~ ×0.7
      mult = 0.3 + Math.random() * 0.4;
    } else if (rand < 0.30) {
      // 20% 繁荣：×1.5 ~ ×3.0
      mult = 1.5 + Math.random() * 1.5;
    } else if (rand < 0.50) {
      // 20% 上涨：×1.1 ~ ×1.5
      mult = 1.1 + Math.random() * 0.4;
    } else if (rand < 0.70) {
      // 20% 下跌：×0.7 ~ ×0.9
      mult = 0.7 + Math.random() * 0.2;
    } else {
      // 30% 平稳：×0.9 ~ ×1.1
      mult = 0.9 + Math.random() * 0.2;
    }
    multipliers[biz.id] = Math.round(mult * 100) / 100;
  }
  return multipliers;
}

/** 获取市场趋势文字 */
export function getMarketTrendText(multiplier: number): { text: string; color: string; icon: string } {
  if (multiplier >= 2.0) return { text: '🔥 爆发', color: 'text-yellow-300', icon: '🔥' };
  if (multiplier >= 1.5) return { text: '📈 繁荣', color: 'text-green-400', icon: '📈' };
  if (multiplier >= 1.1) return { text: '↗ 上涨', color: 'text-green-300', icon: '↗' };
  if (multiplier >= 0.9) return { text: '→ 平稳', color: 'text-gray-400', icon: '→' };
  if (multiplier >= 0.7) return { text: '↘ 下跌', color: 'text-orange-400', icon: '↘' };
  return { text: '📉 暴跌', color: 'text-red-400', icon: '📉' };
}

// === 每日登录 ===

/** 获取今天日期字符串 YYYY-MM-DD */
export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 检查是否为连续登录 */
export function isConsecutiveDay(lastDate: string, today: string): boolean {
  if (!lastDate) return false;
  const last = new Date(lastDate + 'T00:00:00');
  const now = new Date(today + 'T00:00:00');
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// === 数字格式化 ===

/** 单字母后缀列表（前11级：10^3 到 10^33） */
const SINGLE_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

/** 生成双字母后缀：Aa=10^36, Ab=10^39, ..., Az=10^60, Ba=10^63, ... */
function getDoubleLetterSuffix(tier: number): string {
  // tier=0 → Aa, tier=1 → Ab, ..., tier=25 → Az, tier=26 → Ba, ...
  const first = String.fromCharCode(65 + Math.floor(tier / 26)); // A, B, C, ...
  const second = String.fromCharCode(97 + (tier % 26)); // a, b, c, ...
  return first + second;
}

/** 格式化一个已缩放的数字为字符串 */
function formatScaled(scaled: number): string {
  if (scaled < 10) {
    return scaled.toFixed(2);
  } else if (scaled < 100) {
    return scaled.toFixed(1);
  } else {
    return Math.floor(scaled).toString();
  }
}

/**
 * 格式化数字
 * @param n 要格式化的数字
 * @param format 'abbreviation' 使用缩写后缀 / 'scientific' 使用科学计数法
 */
export function formatNumber(n: number, format?: 'abbreviation' | 'scientific'): string {
  if (n < 0) return '-' + formatNumber(-n, format);
  if (!isFinite(n)) return '∞';
  // 非常大的数
  if (n >= 1e1000) return '∞';
  // 极小的正数
  if (n > 0 && n < 0.01) {
    if (format === 'scientific') {
      return n.toExponential(2);
    }
    return n.toFixed(4);
  }
  if (n < 1000) return Math.floor(n).toString();

  if (format === 'scientific') {
    const exp = Math.floor(Math.log10(n));
    const mantissa = n / Math.pow(10, exp);
    return mantissa.toFixed(2) + 'e' + exp;
  }

  // 缩写模式
  const singleMaxTier = SINGLE_SUFFIXES.length - 1; // 11 (Dc)
  let tier = 0;
  let scaled = n;

  while (scaled >= 1000) {
    scaled /= 1000;
    tier++;
  }

  // 超出单字母范围（> Dc = 10^33）时使用双字母系统
  if (tier > singleMaxTier) {
    const doubleTier = tier - singleMaxTier - 1; // 0-based index for double letters
    const suffix = getDoubleLetterSuffix(doubleTier);
    return formatScaled(scaled) + suffix;
  }

  return formatScaled(scaled) + SINGLE_SUFFIXES[tier];
}

// === 数字格式缓存（避免循环依赖） ===

/** 模块级缓存：当前数字格式偏好 */
let _cachedNumberFormat: 'abbreviation' | 'scientific' = 'abbreviation';

/** 由 gameStore 初始化时调用，同步格式偏好到此模块 */
export function syncNumberFormat(format: 'abbreviation' | 'scientific') {
  _cachedNumberFormat = format;
}

/** 自动选择格式的 formatNumber（读取缓存的全局设置） */
export function formatNumberSmart(n: number): string {
  return formatNumber(n, _cachedNumberFormat);
}

export function formatCash(n: number): string {
  return '🪙' + formatNumberSmart(n);
}

export function formatTime(seconds: number): string {
  if (seconds < 10) return seconds.toFixed(1) + '秒';
  if (seconds < 60) return Math.ceil(seconds) + '秒';
  if (seconds < 3600) return Math.floor(seconds / 60) + '分钟';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`;
}

// ============================================================
// 详细收益分解（Tooltip用）
// ============================================================

/** 单项乘数信息 */
export interface MultiplierBreakdownItem {
  label: string;         // 乘数名称
  value: number;         // 当前值
  displayValue: string;  // 显示文字
  color: string;         // 显示颜色
}

/** 收益分解结果 */
export interface RevenueBreakdown {
  baseRevenue: number;
  quantity: number;
  baseTotal: number;
  items: MultiplierBreakdownItem[];
  finalRevenue: number;
  finalCycle: number;
  revenuePerSec: number;
}

/** 计算详细收益分解 — 用于Tooltip显示 */
export function calcDetailedBreakdown(
  businessDef: BusinessDef,
  quantity: number,
  state: GameState,
  adBuffs: AdBuff[],
): RevenueBreakdown {
  const items: MultiplierBreakdownItem[] = [];

  // 1. 基础收益
  const baseTotal = businessDef.baseRevenue * quantity;

  // 2. 里程碑倍率
  const milestoneMult = calcMilestoneMultiplier(businessDef, quantity);
  if (milestoneMult > 1) {
    items.push({ label: '里程碑倍率', value: milestoneMult, displayValue: `×${formatNumber(milestoneMult)}`, color: 'text-pink-400' });
  }

  // 3. 全局升级利润
  const globalEffects = calcGlobalEffects(state.upgrades);
  if (globalEffects.profitMultiplier > 1) {
    items.push({ label: '全局升级', value: globalEffects.profitMultiplier, displayValue: `×${formatNumber(globalEffects.profitMultiplier)}`, color: 'text-blue-400' });
  }

  // 4. 产线专属升级利润
  const bizUpgradeMult = calcBusinessUpgradeProfitMult(businessDef.id, state.purchasedBusinessUpgrades || []);
  if (bizUpgradeMult > 1) {
    items.push({ label: '产线升级', value: bizUpgradeMult, displayValue: `×${formatNumber(bizUpgradeMult)}`, color: 'text-indigo-400' });
  }

  // 5. 人脉升级（单产线）
  const angelBizMult = calcAngelBusinessProfitMult(businessDef.id, state.purchasedAngelUpgrades || []);
  if (angelBizMult > 1) {
    items.push({ label: '人脉·产线', value: angelBizMult, displayValue: `×${formatNumber(angelBizMult)}`, color: 'text-orange-400' });
  }

  // 6. 人脉升级（全局）
  const angelEffects = calcAngelUpgradeEffects(state.purchasedAngelUpgrades || []);
  if (angelEffects.globalProfitMult > 1) {
    items.push({ label: '人脉·全局', value: angelEffects.globalProfitMult, displayValue: `×${formatNumber(angelEffects.globalProfitMult)}`, color: 'text-orange-400' });
  }

  // 7. 转生永久加成
  const prestigeMult = calcPrestigeMultiplier(state.prestigePoints);
  if (prestigeMult > 1) {
    items.push({ label: '转生加成', value: prestigeMult, displayValue: `×${formatNumber(prestigeMult)}`, color: 'text-yellow-400' });
  }

  // 8. 广告增益
  const hasDoubleRevenue = adBuffs.some(b => b.type === 'double_revenue');
  if (hasDoubleRevenue) {
    items.push({ label: '广告·双倍', value: 2, displayValue: '×2', color: 'text-red-400' });
  }
  const rushBuff = adBuffs.find(b => b.type === 'rush_order');
  if (rushBuff) {
    items.push({ label: '爆单潮', value: 3, displayValue: '×3', color: 'text-red-300' });
  }

  // 9. 市场波动
  const marketMult = state.marketMultipliers?.[businessDef.id] ?? 1;
  if (Math.abs(marketMult - 1) > 0.01) {
    const trendColor = marketMult >= 1 ? 'text-green-400' : 'text-red-400';
    items.push({ label: '市场波动', value: marketMult, displayValue: `×${marketMult.toFixed(2)}`, color: trendColor });
  }

  // 10. 店长等级利润
  const mgrProfitMult = calcManagerLevelProfitMult(businessDef.id, state.managerLevels ?? {}, state.hiredManagers ?? []);
  if (mgrProfitMult > 1) {
    items.push({ label: '店长等级', value: mgrProfitMult, displayValue: `×${formatNumber(mgrProfitMult)}`, color: 'text-cyan-400' });
  }

  // 11. 利润/速度模式
  const businessMode = state.businessModes?.[businessDef.id] as BusinessMode | undefined;
  if (businessMode === 'profit') {
    items.push({ label: '💰 利润模式', value: 1.5, displayValue: '×1.5', color: 'text-yellow-300' });
  } else if (businessMode === 'speed') {
    items.push({ label: '⚡ 速度模式', value: 0.8, displayValue: '×0.8', color: 'text-blue-300' });
  }

  // 12. 事件增益
  const activeEvents = state.activeEvents as ActiveGameEvent[] | undefined;
  if (activeEvents && activeEvents.length > 0) {
    for (const evt of activeEvents) {
      if (evt.boostType === 'profit_mult' || evt.boostType === 'all_mult') {
        items.push({ label: `🎊 ${evt.name}`, value: evt.boostValue, displayValue: `×${evt.boostValue}`, color: 'text-yellow-200' });
      }
    }
  }

  // 计算最终收益
  let finalRevenue = baseTotal;
  for (const item of items) finalRevenue *= item.value;

  // 计算最终周期
  const finalCycle = calcCycleTime(businessDef, state, adBuffs);
  const revenuePerSec = finalRevenue / finalCycle;

  return {
    baseRevenue: businessDef.baseRevenue,
    quantity,
    baseTotal,
    items,
    finalRevenue,
    finalCycle,
    revenuePerSec,
  };
}

// ============================================================
// 事件系统公式
// ============================================================

/** 触发随机事件（根据权重和冷却时间） */
export function tryTriggerEvent(state: GameState): ActiveGameEvent | null {
  const now = Date.now();

  // 检查冷却
  if (state.eventCooldownUntil && now < state.eventCooldownUntil) return null;

  // 检查是否已有事件在运行
  if (state.activeEvents && state.activeEvents.length >= 2) return null;

  // 筛选可用事件（满足收入要求和冷却）
  const available = GAME_EVENTS.filter(evt => {
    if (state.totalEarned < evt.minTotalEarned) return false;
    // 检查同类型事件是否已在运行
    if (state.activeEvents?.some(a => a.eventDefId === evt.id)) return false;
    return true;
  });

  if (available.length === 0) return null;

  // 加权随机选择
  const totalWeight = available.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  let selected: GameEventDef | null = null;
  for (const evt of available) {
    roll -= evt.weight;
    if (roll <= 0) { selected = evt; break; }
  }
  if (!selected) selected = available[available.length - 1];

  // 创建激活事件
  const activeEvent: ActiveGameEvent = {
    id: `evt_${selected.id}_${now}`,
    eventDefId: selected.id,
    name: selected.name,
    icon: selected.icon,
    description: selected.description,
    startTime: now,
    durationSec: selected.durationSec,
    remainingSec: selected.durationSec,
    boostType: selected.boostType,
    boostValue: selected.boostValue,
    reward: selected.reward,
  };

  return activeEvent;
}

/** 计算事件成本缩减 */
export function calcEventCostReduce(activeEvents: ActiveGameEvent[] | undefined): number {
  if (!activeEvents || activeEvents.length === 0) return 1;
  let reduce = 1;
  for (const evt of activeEvents) {
    if (evt.boostType === 'cost_reduce') {
      reduce *= evt.boostValue;
    }
  }
  return reduce;
}
