// ============================================================
// 转生规则 (PrestigeRuleDef)
// ============================================================
import { PrestigeRuleDef } from '../types';

export const PRESTIGE_RULE: PrestigeRuleDef = {
  currencyName: '渠道人脉',
  currencyIcon: 'currency/connection',
  gainFormula: 'sqrt_total_earned',
  resetScope: ['cash', 'businesses', 'managers', 'global_upgrades', 'ad_bonuses'],
  permanentBonusCurve: {
    perPoint: 0.01, // 每点渠道人脉+1%全局利润
    maxMultiplier: Infinity, // 无上限
  },
  unlockCondition: { type: 'total_earned', value: 100000000 },
};

/** 计算转生可获得的人脉点数 */
export function calcPrestigeGain(totalEarned: number): number {
  if (totalEarned <= 0) return 0;
  // sqrt(totalEarned / 250000), 首次100M约20点
  const raw = Math.sqrt(totalEarned / 250000);
  return Math.max(1, Math.floor(raw));
}

/** 计算转生永久加成倍率（无上限） */
export function calcPrestigeMultiplier(prestigePoints: number): number {
  const { perPoint } = PRESTIGE_RULE.permanentBonusCurve;
  return 1 + prestigePoints * perPoint;
}

/** 判断是否满足转生条件 */
export function canPrestige(totalEarned: number): boolean {
  return totalEarned >= PRESTIGE_RULE.unlockCondition.value;
}
