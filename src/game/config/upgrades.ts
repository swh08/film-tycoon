// ============================================================
// 全局升级配置 (GlobalUpgradeDef) — 设备/渠道/品牌三组
// ============================================================
import { GlobalUpgradeDef } from '../types';

export const GLOBAL_UPGRADES: GlobalUpgradeDef[] = [
  // === 设备升级组 ===
  {
    id: 1,
    name: '高速贴膜机',
    group: 'equipment',
    maxLevel: 50,
    baseCost: 500,
    costMultiplier: 1.8,
    currency: 'cash',
    effectType: 'cycle_reduce_all',
    effectPerLevel: 0.02, // 每级减2%生产周期
    icon: '⚙️',
    description: '升级贴膜设备，全产线生产速度+2%',
  },
  {
    id: 2,
    name: '精密对齐器',
    group: 'equipment',
    maxLevel: 50,
    baseCost: 5000,
    costMultiplier: 1.9,
    currency: 'cash',
    effectType: 'cycle_reduce_all',
    effectPerLevel: 0.03, // 每级减3%生产周期
    icon: '🎯',
    description: '纳米级对齐精度，生产速度再+3%',
  },
  {
    id: 3,
    name: '自动化流水线',
    group: 'equipment',
    maxLevel: 30,
    baseCost: 50000,
    costMultiplier: 2.0,
    currency: 'cash',
    effectType: 'cycle_reduce_all',
    effectPerLevel: 0.05, // 每级减5%生产周期
    icon: '🤖',
    description: '全自动贴膜流水线，生产速度+5%',
  },
  // === 渠道升级组 ===
  {
    id: 4,
    name: '社区团购群',
    group: 'channel',
    maxLevel: 50,
    baseCost: 2000,
    costMultiplier: 1.8,
    currency: 'cash',
    effectType: 'offline_mult',
    effectPerLevel: 0.05, // 每级离线收益+5%
    icon: '📱',
    description: '建立社区团购网络，离线收益+5%',
  },
  {
    id: 5,
    name: '仓储物流中心',
    group: 'channel',
    maxLevel: 30,
    baseCost: 20000,
    costMultiplier: 2.0,
    currency: 'cash',
    effectType: 'offline_cap_increase',
    effectPerLevel: 0.5, // 每级离线上限+0.5小时
    icon: '📦',
    description: '扩大仓储能力，离线收益上限+30分钟',
  },
  {
    id: 6,
    name: '全球供应链',
    group: 'channel',
    maxLevel: 20,
    baseCost: 200000,
    costMultiplier: 2.2,
    currency: 'cash',
    effectType: 'offline_mult',
    effectPerLevel: 0.1, // 每级离线收益+10%
    icon: '🌐',
    description: '打通全球供应链，离线收益+10%',
  },
  // === 品牌升级组 ===
  {
    id: 7,
    name: '品牌Logo设计',
    group: 'brand',
    maxLevel: 50,
    baseCost: 3000,
    costMultiplier: 1.8,
    currency: 'cash',
    effectType: 'profit_mult_all',
    effectPerLevel: 0.03, // 每级全局利润+3%
    icon: '🏷️',
    description: '设计专业品牌形象，全产线利润+3%',
  },
  {
    id: 8,
    name: 'KOL推广计划',
    group: 'brand',
    maxLevel: 30,
    baseCost: 30000,
    costMultiplier: 2.0,
    currency: 'cash',
    effectType: 'profit_mult_all',
    effectPerLevel: 0.05, // 每级全局利润+5%
    icon: '📣',
    description: '全网KOL矩阵推广，全产线利润+5%',
  },
  {
    id: 9,
    name: '品牌代言人',
    group: 'brand',
    maxLevel: 20,
    baseCost: 300000,
    costMultiplier: 2.2,
    currency: 'cash',
    effectType: 'profit_mult_all',
    effectPerLevel: 0.08, // 每级全局利润+8%
    icon: '🌟',
    description: '请顶级明星代言，全产线利润+8%',
  },
  // === 钻石升级 ===
  {
    id: 10,
    name: '量子贴膜技术',
    group: 'equipment',
    maxLevel: 10,
    baseCost: 3,
    costMultiplier: 3.0,
    currency: 'diamond',
    effectType: 'cycle_reduce_all',
    effectPerLevel: 0.1, // 每级减10%
    icon: '⚛️',
    description: '量子级贴膜技术，生产速度暴涨10%',
  },
  {
    id: 11,
    name: '品牌授权帝国',
    group: 'brand',
    maxLevel: 10,
    baseCost: 5,
    costMultiplier: 3.0,
    currency: 'diamond',
    effectType: 'profit_mult_all',
    effectPerLevel: 0.15, // 每级+15%
    icon: '🏛️',
    description: '建立品牌授权体系，利润暴涨15%',
  },
];

export const UPGRADE_GROUP_INFO: Record<string, { name: string; icon: string; description: string }> = {
  equipment: { name: '设备升级', icon: '⚙️', description: '提升全产线生产效率' },
  channel: { name: '渠道升级', icon: '📦', description: '提升离线收益上限和倍率' },
  brand: { name: '品牌升级', icon: '🏷️', description: '提升全局利润倍率' },
};
