// ============================================================
// 《贴膜大亨》核心类型定义
// ============================================================

/** 成本曲线类型 */
export type CostCurve = 'linear' | 'exponential' | 'polynomial';

/** 店长效果类型 */
export type ManagerEffectType = 'auto_run' | 'cycle_reduce' | 'profit_mult';

/** 店长稀有度 */
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/** 解锁规则 */
export interface UnlockRule {
  type: 'business_owned' | 'total_earned' | 'prestige_count' | 'tutorial_complete';
  targetId?: number;
  value: number;
}

/** 数量里程碑 */
export interface Milestone {
  at: number;
  multiplier: number;
  label: string;
}

/** 产线定义 (BusinessDef) */
export interface BusinessDef {
  id: number;
  name: string;
  order: number;
  icon: string;
  baseCost: number;
  costCurve: CostCurve;
  costMultiplier: number;
  baseCycleSec: number;
  baseRevenue: number;
  milestones: Milestone[];
  managerId: number;
  unlockRule: UnlockRule;
  flavorText: string;
}

/** 店长定义 (ManagerDef) */
export interface ManagerDef {
  id: number;
  name: string;
  businessId: number;
  effectType: ManagerEffectType;
  effectValue: number;
  unlockCost: number;
  currency: 'cash' | 'diamond';
  rarity: Rarity;
  icon: string;
  description: string;
}

/** 全局升级分组 */
export type UpgradeGroup = 'equipment' | 'channel' | 'brand';

/** 全局升级定义 (GlobalUpgradeDef) */
export interface GlobalUpgradeDef {
  id: number;
  name: string;
  group: UpgradeGroup;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  currency: 'cash' | 'diamond';
  effectType: 'cycle_reduce_all' | 'profit_mult_all' | 'offline_cap_increase' | 'offline_mult';
  effectPerLevel: number;
  icon: string;
  description: string;
}

/** 转生规则定义 (PrestigeRuleDef) */
export interface PrestigeRuleDef {
  currencyName: string;
  currencyIcon: string;
  gainFormula: 'sqrt_total_earned' | 'log_total_earned';
  resetScope: ('cash' | 'businesses' | 'managers' | 'global_upgrades' | 'ad_bonuses')[];
  permanentBonusCurve: { perPoint: number; maxMultiplier: number };
  unlockCondition: { type: 'total_earned'; value: number };
}

/** 商城礼包定义 (OfferDef) */
export interface OfferDef {
  id: number;
  name: string;
  description: string;
  cost: number;
  currency: 'cash' | 'diamond' | 'real_money';
  icon: string;
  rewards: { type: string; value: number; label: string }[];
  oneTime: boolean;
  showCondition?: { type: string; value: number };
}

/** 活动定义 (EventDef) */
export interface EventDef {
  id: number;
  name: string;
  description: string;
  durationSec: number;
  rewards: { type: string; value: number; label: string }[];
  boostType?: 'profit_mult' | 'speed_mult';
  boostValue?: number;
  unlockCondition?: { type: string; value: number };
}

/** 广告增益类型 */
export type AdBuffType = 'double_revenue' | 'extra_offline' | 'rush_order';

/** 广告增益状态 */
export interface AdBuff {
  type: AdBuffType;
  remainingSec: number;
  value: number;
}

// ============================================================
// 运行时状态类型
// ============================================================

/** 单条产线运行时状态 */
export interface BusinessState {
  businessId: number;
  quantity: number;
  progress: number; // 0~1 生产进度
  hasManager: boolean;
  managerId?: number;
}

/** 全局升级运行时状态 */
export interface UpgradeState {
  upgradeId: number;
  level: number;
}

/** 新手引导步骤 */
export type TutorialStep =
  | 'none'
  | 'first_tap'
  | 'buy_10'
  | 'hire_manager'
  | 'first_milestone';

/** 游戏全局状态 */
export interface GameState {
  // 资源
  cash: number;
  diamonds: number;
  totalEarned: number; // 历史总收入（用于转生计算）
  prestigePoints: number;
  totalPrestigeCount: number;

  // 产线
  businesses: BusinessState[];

  // 全局升级
  upgrades: UpgradeState[];

  // 店长
  hiredManagers: number[];

  // 广告增益
  adBuffs: AdBuff[];

  // 离线
  lastOnlineTimestamp: number;

  // 新手引导
  tutorialStep: TutorialStep;

  // 商城一次性购买记录
  purchasedOffers: number[];

  // 统计
  totalManualTaps: number;
  totalPurchases: number;
  startTime: number;

  // UI偏好（跨tab/刷新持久化）
  buyMode: number; // 全局购买数量模式：1/10/100/0(最大)
}

/** 格式化数字用的后缀 */
export const NUMBER_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
