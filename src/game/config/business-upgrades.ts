// ============================================================
// 产线专属升级配置 (BusinessUpgradeDef)
// 每条产线3个现金升级：x1.5利润、x2利润、-15%周期
// ============================================================
import { BusinessUpgradeDef } from '../types';
import { BUSINESSES } from './businesses';

type UpgradeTemplate = Omit<BusinessUpgradeDef, 'id' | 'businessId' | 'cost'> & {
  idOffset: number;
  costFactor: number;
};

const BUSINESS_UPGRADE_TEXT: Record<number, [string, string, string, string, string, string]> = {
  1: ['优质膜材', '进口日本材料，单次利润提升50%', 'VIP客户群', '积累高端客户，利润翻倍', '流水线贴膜', '标准化操作流程，生产速度提升15%'],
  2: ['学生会合作', '官方合作渠道，单次利润提升50%', '校园垄断', '独家经营权覆盖全校，利润翻倍', '社团分润', '社团帮你推广，生产速度提升15%'],
  3: ['黄金位置', '商场入口C位，利润提升50%', '品牌联营', '与手机品牌联名，利润翻倍', 'VIP预约制', '预约系统减少等待，生产速度提升15%'],
  4: ['标准化手册', '统一SOP操作手册，利润提升50%', '区域保护', '独占区域经营权，利润翻倍', '自动化门店', '无人化运营系统，速度提升15%'],
  5: ['算法优化', '推荐算法优化，流量利润提升50%', '头部主播', '签约千万粉丝主播，利润翻倍', '自动发货', '智能仓储自动发货，速度提升15%'],
  6: ['专利技术', '自研核心专利，利润提升50%', '规模效应', '量产摊薄成本，利润翻倍', '机器人产线', '全机器人生产，速度提升15%'],
  7: ['实验室扩建', '新建三个实验室，利润提升50%', '诺贝尔团队', '挖来诺贝尔奖得主，利润翻倍', 'AI加速研发', 'AI辅助缩短研发周期，速度提升15%'],
  8: ['限量发售', '饥饿营销策略，利润提升50%', '跨界联名', '与奢侈品品牌联名，利润翻倍', '快闪店模式', '快闪店极速周转，速度提升15%'],
  9: ['自贸区优势', '利用自贸区政策，利润提升50%', '全球渠道', '覆盖100个国家渠道，利润翻倍', '海外仓网络', '全球海外仓极速配送，速度提升15%'],
  10: ['行业标准', '制定行业质量标准，利润提升50%', '全球垄断', '全球市场份额80%，利润翻倍', '量子传送', '量子级供应链，速度提升15%'],
};

const TEMPLATES: UpgradeTemplate[] = [
  {
    idOffset: 1,
    name: '',
    description: '',
    icon: 'currency/diamond',
    costFactor: 500,
    effectType: 'profit_mult',
    effectValue: 1.5,
    unlockQuantity: 25,
  },
  {
    idOffset: 2,
    name: '',
    description: '',
    icon: 'nav/achievement',
    costFactor: 5000,
    effectType: 'profit_mult',
    effectValue: 2,
    unlockQuantity: 50,
  },
  {
    idOffset: 3,
    name: '',
    description: '',
    icon: 'boost/lightning',
    costFactor: 50000,
    effectType: 'cycle_reduce',
    effectValue: 0.15,
    unlockQuantity: 100,
  },
];

export const BUSINESS_UPGRADES: BusinessUpgradeDef[] = BUSINESSES.flatMap((business) => {
  const text = BUSINESS_UPGRADE_TEXT[business.id];
  return TEMPLATES.map((template, index) => ({
    id: business.id * 100 + template.idOffset,
    businessId: business.id,
    name: text[index * 2],
    description: text[index * 2 + 1],
    icon: template.icon,
    cost: business.baseCost * template.costFactor,
    effectType: template.effectType,
    effectValue: template.effectValue,
    unlockQuantity: template.unlockQuantity,
  }));
});
