// ============================================================
// 活动配置 (EventDef)
// ============================================================
import { EventDef } from '../types';

export const EVENTS: EventDef[] = [
  {
    id: 1,
    name: '新机发布周',
    description: '某大牌新机发布！全城贴膜需求暴涨，所有产线利润×2！持续7天。',
    durationSec: 7 * 24 * 3600,
    rewards: [
      { type: 'cash', value: 500000, label: '参与奖：50万现金' },
      { type: 'diamond', value: 3, label: '参与奖：3颗钻石' },
    ],
    boostType: 'profit_mult',
    boostValue: 2,
    unlockCondition: { type: 'total_earned', value: 100000 },
  },
  {
    id: 2,
    name: '双11膜界狂欢',
    description: '一年一度的膜界大促！所有产线速度×3！持续3天。',
    durationSec: 3 * 24 * 3600,
    rewards: [
      { type: 'cash', value: 2000000, label: '狂欢奖：200万现金' },
      { type: 'diamond', value: 10, label: '狂欢奖：10颗钻石' },
    ],
    boostType: 'speed_mult',
    boostValue: 3,
    unlockCondition: { type: 'total_earned', value: 10000000 },
  },
  {
    id: 3,
    name: '春节大促',
    description: '过年贴新膜！回家路上人人都需要贴膜，利润×2.5！持续7天。',
    durationSec: 7 * 24 * 3600,
    rewards: [
      { type: 'cash', value: 5000000, label: '新年红包：500万' },
      { type: 'diamond', value: 15, label: '新年红包：15颗钻石' },
    ],
    boostType: 'profit_mult',
    boostValue: 2.5,
    unlockCondition: { type: 'prestige_count', value: 1 },
  },
];
