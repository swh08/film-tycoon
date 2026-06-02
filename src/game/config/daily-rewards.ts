// ============================================================
// 每日登录奖励配置 — 7天周期循环
// ============================================================

import { AdBuffType } from '../types';

export interface DailyRewardDef {
  day: number;            // 第几天 (1-7)
  icon: string;
  name: string;
  description: string;
  rewards: {
    type: 'cash' | 'diamond' | 'buff';
    value: number;
    label: string;
    buffType?: AdBuffType;    // buff类型（如果type=buff）
    buffDuration?: number; // buff持续时间（秒）
  }[];
}

export const DAILY_REWARDS: DailyRewardDef[] = [
  {
    day: 1,
    icon: 'boost/gift',
    name: '新手礼包',
    description: '欢迎回来！第一天小小心意',
    rewards: [
      { type: 'cash', value: 10000, label: '现金×10,000' },
    ],
  },
  {
    day: 2,
    icon: 'boost/gift',
    name: '勤奋奖励',
    description: '连续登录第2天，继续保持！',
    rewards: [
      { type: 'cash', value: 50000, label: '现金×50,000' },
    ],
  },
  {
    day: 3,
    icon: 'currency/diamond',
    name: '钻石之日',
    description: '第3天来点硬通货！',
    rewards: [
      { type: 'diamond', value: 1, label: '钻石×1' },
      { type: 'cash', value: 100000, label: '现金×100,000' },
    ],
  },
  {
    day: 4,
    icon: 'boost/rocket',
    name: '加速 boost',
    description: '连续第4天，生产加速！',
    rewards: [
      { type: 'cash', value: 200000, label: '现金×200,000' },
      { type: 'buff', value: 1, label: '4h 双倍收益', buffType: 'double_revenue', buffDuration: 14400 },
    ],
  },
  {
    day: 5,
    icon: 'nav/achievement',
    name: '钻石风暴',
    description: '第5天大额钻石奖励！',
    rewards: [
      { type: 'diamond', value: 2, label: '钻石×2' },
      { type: 'cash', value: 500000, label: '现金×500,000' },
    ],
  },
  {
    day: 6,
    icon: 'boost/lightning',
    name: '百万赏金',
    description: '连续第6天，百万现金！',
    rewards: [
      { type: 'cash', value: 1000000, label: '现金×1,000,000' },
    ],
  },
  {
    day: 7,
    icon: 'nav/achievement',
    name: '超级大奖',
    description: '7天全勤！终极奖励！',
    rewards: [
      { type: 'diamond', value: 5, label: '钻石×5' },
      { type: 'cash', value: 5000000, label: '现金×5,000,000' },
      { type: 'buff', value: 1, label: '4h 双倍收益', buffType: 'double_revenue', buffDuration: 14400 },
    ],
  },
];
