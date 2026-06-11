// ============================================================
// 人脉升级配置 (AngelUpgradeDef) — 消耗人脉购买永久升级
// 对标 Adventure Capitalist 天使投资人升级系统
// 策略抉择：花费人脉→获得强力升级→但倍率降低→需更多轮次补偿
//
// 分层系统：
//   Tier 1 (minPrestigeCount: 0)  — 基础人脉升级，始终可见
//   Tier 2 (minPrestigeCount: 2)  — 进阶人脉升级
//   Tier 3 (minPrestigeCount: 5)  — 高级人脉升级
//   Tier 4 (minPrestigeCount: 10) — 传说人脉升级
// ============================================================
import { AngelUpgradeDef } from '../types';

export const ANGEL_UPGRADES: AngelUpgradeDef[] = [
  // ================================================================
  // === Tier 1: 基础人脉升级 (minPrestigeCount: 0, 始终可见) ===
  // ================================================================

  // --- 产线利润 ×2（10条产线各一个） ---
  {
    id: 1,
    name: '钢化膜秘方',
    description: '路边摊独家配方，利润翻倍',
    icon: 'nav/upgrade',
    cost: 3,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 1,
  },
  {
    id: 2,
    name: '校园垄断协议',
    description: '签下校方独家经营权，利润翻倍',
    icon: 'nav/upgrade',
    cost: 8,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 2,
  },
  {
    id: 3,
    name: '黄金铺位',
    description: '买下商场最佳位置，利润翻倍',
    icon: 'nav/business',
    cost: 15,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 3,
  },
  {
    id: 4,
    name: '加盟费全免',
    description: '零加盟费模式，利润翻倍',
    icon: 'boost/gift',
    cost: 30,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 4,
  },
  {
    id: 5,
    name: '算法推荐',
    description: '直播间算法全开推流，利润翻倍',
    icon: 'nav/manager',
    cost: 60,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 5,
  },
  {
    id: 6,
    name: '工业4.0改造',
    description: '智能化产线全面升级，利润翻倍',
    icon: 'nav/upgrade',
    cost: 120,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 6,
  },
  {
    id: 7,
    name: '诺贝尔加持',
    description: '诺贝尔奖光环加持，利润翻倍',
    icon: 'nav/achievement',
    cost: 250,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 7,
  },
  {
    id: 8,
    name: '朋友圈升级',
    description: 'LVMH/爱马仕CEO直连，利润翻倍',
    icon: 'nav/business',
    cost: 500,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 8,
  },
  {
    id: 9,
    name: '免税通道',
    description: '全球免税贸易协定，利润翻倍',
    icon: 'status/check',
    cost: 1000,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 9,
  },
  {
    id: 10,
    name: '宇宙垄断法案',
    description: '全宇宙唯一的屏保供应商，利润翻倍',
    icon: 'nav/prestige',
    cost: 2000,
    effectType: 'profit_mult_business',
    effectValue: 2,
    targetBusinessId: 10,
  },

  // --- Tier 1 全局加成升级 ---
  {
    id: 101,
    name: '膜界至尊',
    description: '全产线利润×2，真正的膜界霸主',
    icon: 'nav/achievement',
    cost: 600,
    effectType: 'profit_mult_all',
    effectValue: 2,
  },
  {
    id: 102,
    name: '膜界神话',
    description: '全产线利润再×2，传说中的不败传奇',
    icon: 'nav/achievement',
    cost: 4000,
    effectType: 'profit_mult_all',
    effectValue: 2,
  },
  {
    id: 103,
    name: '批发进货',
    description: '全产线购买成本降低25%',
    icon: 'boost/gift',
    cost: 120,
    effectType: 'cost_reduce_all',
    effectValue: 0.15,
  },
  {
    id: 104,
    name: '源头直供',
    description: '跳过所有中间商，购买成本再降25%',
    icon: 'nav/business',
    cost: 450,
    effectType: 'cost_reduce_all',
    effectValue: 0.15,
  },
  {
    id: 105,
    name: '闪电生产',
    description: '全产线生产速度提升30%',
    icon: 'boost/lightning',
    cost: 250,
    effectType: 'cycle_reduce_all',
    effectValue: 0.20,
  },
  {
    id: 106,
    name: '极速产线',
    description: '全产线生产速度再提升30%',
    icon: 'boost/rocket',
    cost: 800,
    effectType: 'cycle_reduce_all',
    effectValue: 0.20,
  },

  // ================================================================
  // === Tier 2: 进阶人脉升级 (minPrestigeCount: 2) ===
  // ================================================================
  {
    id: 201,
    name: '批量采购折扣',
    description: '大宗采购议价权提升，购买成本降低15%',
    icon: 'nav/shop',
    cost: 150,
    effectType: 'cost_reduce_all',
    effectValue: 0.15,
    minPrestigeCount: 2,
  },
  {
    id: 202,
    name: '极速流水线',
    description: '流水线工艺优化，生产速度提升20%',
    icon: 'boost/lightning',
    cost: 180,
    effectType: 'cycle_reduce_all',
    effectValue: 0.15,
    minPrestigeCount: 2,
  },
  {
    id: 203,
    name: '跨界营销',
    description: '社交媒体矩阵全面铺开，全产线利润×2',
    icon: 'boost/ad',
    cost: 250,
    effectType: 'profit_mult_all',
    effectValue: 1.5,
    minPrestigeCount: 2,
  },
  {
    id: 204,
    name: '人才储备',
    description: '建立行业人才库，全产线利润×1.5',
    icon: 'nav/manager',
    cost: 120,
    effectType: 'profit_mult_all',
    effectValue: 1.25,
    minPrestigeCount: 2,
  },
  {
    id: 205,
    name: '供应链优化',
    description: '优化物流配送体系，购买成本再降10%',
    icon: 'currency/connection',
    cost: 180,
    effectType: 'cost_reduce_all',
    effectValue: 0.10,
    minPrestigeCount: 2,
  },
  {
    id: 206,
    name: '智能调度',
    description: 'AI调度系统上线，生产速度再提15%',
    icon: 'nav/upgrade',
    cost: 220,
    effectType: 'cycle_reduce_all',
    effectValue: 0.12,
    minPrestigeCount: 2,
  },

  // ================================================================
  // === Tier 3: 高级人脉升级 (minPrestigeCount: 5) ===
  // ================================================================
  {
    id: 301,
    name: '品牌矩阵',
    description: '多品牌协同效应，全产线利润×2.5',
    icon: 'boost/lightning',
    cost: 800,
    effectType: 'profit_mult_all',
    effectValue: 2.5,
    minPrestigeCount: 5,
  },
  {
    id: 302,
    name: '工业革命4.0',
    description: '全面智能制造升级，生产速度提升25%',
    icon: 'nav/business',
    cost: 900,
    effectType: 'cycle_reduce_all',
    effectValue: 0.18,
    minPrestigeCount: 5,
  },
  {
    id: 303,
    name: '垄断经营',
    description: '行业寡头地位确立，全产线利润×2',
    icon: 'nav/achievement',
    cost: 1500,
    effectType: 'profit_mult_all',
    effectValue: 2,
    minPrestigeCount: 5,
  },
  {
    id: 304,
    name: '直营模式',
    description: '砍掉所有中间环节，购买成本降低20%',
    icon: 'nav/business',
    cost: 700,
    effectType: 'cost_reduce_all',
    effectValue: 0.15,
    minPrestigeCount: 5,
  },
  {
    id: 305,
    name: '全自动化',
    description: '无人车间全面铺开，生产速度提升30%',
    icon: 'nav/manager',
    cost: 1200,
    effectType: 'cycle_reduce_all',
    effectValue: 0.20,
    minPrestigeCount: 5,
  },
  {
    id: 306,
    name: '上市公司',
    description: '资本运作加持，全产线利润×2.5',
    icon: 'boost/lightning',
    cost: 3000,
    effectType: 'profit_mult_all',
    effectValue: 2.5,
    minPrestigeCount: 5,
  },

  // ================================================================
  // === Tier 4: 传说人脉升级 (minPrestigeCount: 10) ===
  // ================================================================
  {
    id: 401,
    name: '全球定价权',
    description: '成为行业定价标杆，全产线利润×3',
    icon: 'nav/prestige',
    cost: 5000,
    effectType: 'profit_mult_all',
    effectValue: 3,
    minPrestigeCount: 10,
  },
  {
    id: 402,
    name: '量子加速',
    description: '量子计算优化生产流程，生产速度提升20%',
    icon: 'nav/prestige',
    cost: 4500,
    effectType: 'cycle_reduce_all',
    effectValue: 0.15,
    minPrestigeCount: 10,
  },
  {
    id: 403,
    name: '黑洞供应链',
    description: '跨维度供应链网络，购买成本降低25%',
    icon: 'nav/prestige',
    cost: 8000,
    effectType: 'cost_reduce_all',
    effectValue: 0.18,
    minPrestigeCount: 10,
  },
  {
    id: 404,
    name: '维度折叠',
    description: '折叠时空降低运输成本，全产线利润×3',
    icon: 'nav/prestige',
    cost: 7000,
    effectType: 'profit_mult_all',
    effectValue: 3,
    minPrestigeCount: 10,
  },
  {
    id: 405,
    name: '时间加速器',
    description: '操控时间流速，生产速度提升30%',
    icon: 'boost/timer',
    cost: 10000,
    effectType: 'cycle_reduce_all',
    effectValue: 0.20,
    minPrestigeCount: 10,
  },
  {
    id: 406,
    name: '膜帝之眼',
    description: '洞察一切商业机会，全产线利润×4',
    icon: 'nav/achievement',
    cost: 18000,
    effectType: 'profit_mult_all',
    effectValue: 4,
    minPrestigeCount: 10,
  },
];

/** 获取分层信息 */
export interface AngelUpgradeTier {
  id: number;
  name: string;
  minPrestigeCount: number;
  description: string;
}

export const ANGEL_UPGRADE_TIERS: AngelUpgradeTier[] = [
  { id: 1, name: '基础人脉升级', minPrestigeCount: 0, description: '转生即可解锁' },
  { id: 2, name: '进阶人脉升级', minPrestigeCount: 2, description: '转生2次+' },
  { id: 3, name: '高级人脉升级', minPrestigeCount: 5, description: '转生5次+' },
  { id: 4, name: '传说人脉升级', minPrestigeCount: 10, description: '转生10次+' },
];
