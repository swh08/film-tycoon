// ============================================================
// 转生规则 (PrestigeRuleDef)
// ============================================================
import { PrestigeRuleDef } from '../types';

export const PRESTIGE_RULE: PrestigeRuleDef = {
  currencyName: '渠道人脉',
  currencyIcon: '🤝',
  gainFormula: 'sqrt_total_earned',
  resetScope: ['cash', 'businesses', 'managers', 'global_upgrades', 'ad_bonuses'],
  permanentBonusCurve: {
    perPoint: 0.05, // 每点渠道人脉+5%全局利润
    maxMultiplier: 20, // 最大380点 = 20倍
  },
  unlockCondition: { type: 'total_earned', value: 100000000 },
};

/** 计算转生可获得的人脉点数 */
export function calcPrestigeGain(totalEarned: number): number {
  if (totalEarned <= 0) return 0;
  // sqrt(totalEarned / 100000), 至少给1点
  const raw = Math.sqrt(totalEarned / 100000);
  return Math.max(1, Math.floor(raw));
}

/** 计算转生永久加成倍率 */
export function calcPrestigeMultiplier(prestigePoints: number): number {
  const { perPoint, maxMultiplier } = PRESTIGE_RULE.permanentBonusCurve;
  return 1 + Math.min(prestigePoints * perPoint, maxMultiplier - 1);
}

/** 判断是否满足转生条件 */
export function canPrestige(totalEarned: number): boolean {
  return totalEarned >= PRESTIGE_RULE.unlockCondition.value;
}
