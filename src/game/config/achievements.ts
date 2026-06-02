// ============================================================
// 成就系统配置 (AchievementDef)
// 跨越游戏各方面的里程碑成就，达成后给予小额奖励
// ============================================================
import { AchievementDef } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  // === 收入里程碑 ===
  {
    id: 'earn_1k',
    name: '第一桶金',
    description: '累计收入达到 1,000',
    icon: 'currency/coin',
    condition: { type: 'total_earned', value: 1000 },
    reward: { type: 'cash', value: 500 },
  },
  {
    id: 'earn_100k',
    name: '小有积蓄',
    description: '累计收入达到 100,000',
    icon: 'currency/coin',
    condition: { type: 'total_earned', value: 100000 },
    reward: { type: 'cash', value: 50000 },
  },
  {
    id: 'earn_1m',
    name: '贴膜百万富翁',
    description: '累计收入达到 1,000,000',
    icon: 'currency/coin',
    condition: { type: 'total_earned', value: 1000000 },
    reward: { type: 'cash', value: 500000 },
  },
  {
    id: 'earn_1b',
    name: '亿万贴膜王',
    description: '累计收入达到 1,000,000,000',
    icon: 'currency/coin',
    condition: { type: 'total_earned', value: 1000000000 },
    reward: { type: 'diamond', value: 5 },
  },
  {
    id: 'earn_100b',
    name: '膜界首富',
    description: '累计收入达到 100,000,000,000',
    icon: 'nav/achievement',
    condition: { type: 'total_earned', value: 100000000000 },
    reward: { type: 'diamond', value: 15 },
  },
  {
    id: 'earn_1t',
    name: '宇宙膜帝',
    description: '累计收入达到 1,000,000,000,000',
    icon: 'nav/prestige',
    condition: { type: 'total_earned', value: 1000000000000 },
    reward: { type: 'diamond', value: 50 },
  },

  // === 产线相关 ===
  {
    id: 'biz_first',
    name: '贴膜起步',
    description: '购买第一条产线',
    icon: 'nav/business',
    condition: { type: 'businesses_unlocked', value: 1 },
    reward: { type: 'cash', value: 100 },
  },
  {
    id: 'biz_all',
    name: '十全十美',
    description: '解锁全部10条产线',
    icon: 'nav/achievement',
    condition: { type: 'businesses_unlocked', value: 10 },
    reward: { type: 'diamond', value: 10 },
  },
  {
    id: 'biz_100',
    name: '百级大师',
    description: '任意产线达到100级',
    icon: 'nav/achievement',
    condition: { type: 'business_quantity_min', value: 100 },
    reward: { type: 'cash', value: 1000000 },
  },
  {
    id: 'biz_500',
    name: '五百级精英',
    description: '任意产线达到500级',
    icon: 'nav/achievement',
    condition: { type: 'business_quantity_min', value: 500 },
    reward: { type: 'diamond', value: 8 },
  },
  {
    id: 'biz_1000',
    name: '千级传奇',
    description: '任意产线达到1000级',
    icon: 'nav/achievement',
    condition: { type: 'business_quantity_min', value: 1000 },
    reward: { type: 'diamond', value: 20 },
  },

  // === 店长相关 ===
  {
    id: 'mgr_first',
    name: '第一位店长',
    description: '雇佣你的第一位店长',
    icon: 'nav/manager',
    condition: { type: 'managers_hired', value: 1 },
    reward: { type: 'cash', value: 5000 },
  },
  {
    id: 'mgr_all',
    name: '全员到齐',
    description: '雇佣全部10位产线店长',
    icon: 'nav/manager',
    condition: { type: 'managers_hired', value: 10 },
    reward: { type: 'diamond', value: 10 },
  },

  // === 转生相关 ===
  {
    id: 'prestige_1',
    name: '转生新手',
    description: '完成第一次转生',
    icon: 'nav/prestige',
    condition: { type: 'prestige_count', value: 1 },
    reward: { type: 'diamond', value: 5 },
  },
  {
    id: 'prestige_5',
    name: '转生达人',
    description: '累计转生5次',
    icon: 'nav/prestige',
    condition: { type: 'prestige_count', value: 5 },
    reward: { type: 'diamond', value: 15 },
  },
  {
    id: 'prestige_10',
    name: '转生王者',
    description: '累计转生10次',
    icon: 'nav/prestige',
    condition: { type: 'prestige_count', value: 10 },
    reward: { type: 'diamond', value: 30 },
  },

  // === 升级相关 ===
  {
    id: 'upgrade_first',
    name: '初次升级',
    description: '购买第一个全局升级',
    icon: 'nav/upgrade',
    condition: { type: 'global_upgrade_level', value: 1 },
    reward: { type: 'cash', value: 10000 },
  },
  {
    id: 'biz_upgrade_first',
    name: '产线强化',
    description: '购买第一个产线专属升级',
    icon: 'nav/upgrade',
    condition: { type: 'business_upgrades_bought', value: 1 },
    reward: { type: 'cash', value: 50000 },
  },
  {
    id: 'biz_upgrade_10',
    name: '全面强化',
    description: '购买10个产线专属升级',
    icon: 'nav/upgrade',
    condition: { type: 'business_upgrades_bought', value: 10 },
    reward: { type: 'diamond', value: 8 },
  },

  // === 人脉升级 ===
  {
    id: 'angel_first',
    name: '人脉投资者',
    description: '购买第一个人脉升级',
    icon: 'currency/connection',
    condition: { type: 'angel_upgrades_bought', value: 1 },
    reward: { type: 'diamond', value: 3 },
  },
  {
    id: 'angel_5',
    name: '人脉大佬',
    description: '购买5个人脉升级',
    icon: 'boost/lightning',
    condition: { type: 'angel_upgrades_bought', value: 5 },
    reward: { type: 'diamond', value: 10 },
  },

  // === 其他 ===
  {
    id: 'tap_100',
    name: '手动达人',
    description: '手动点击贴膜100次',
    icon: 'nav/business',
    condition: { type: 'manual_taps', value: 100 },
    reward: { type: 'cash', value: 2000 },
  },
  {
    id: 'tap_1000',
    name: '点击狂魔',
    description: '手动点击贴膜1000次',
    icon: 'nav/business',
    condition: { type: 'manual_taps', value: 1000 },
    reward: { type: 'diamond', value: 5 },
  },
  {
    id: 'purchase_500',
    name: '购物狂',
    description: '累计购买产线500次',
    icon: 'nav/shop',
    condition: { type: 'total_purchases', value: 500 },
    reward: { type: 'cash', value: 500000 },
  },
];
