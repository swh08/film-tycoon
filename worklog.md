---
Task ID: 1
Agent: Super Z (Main)
Task: 构建《贴膜大亨》完整手游

Work Log:
- 阅读PLAN.md完整立项案，理解游戏设计要求
- 初始化Next.js 16项目环境（fullstack-dev skill）
- 构建游戏数据层：
  - types.ts: 完整TypeScript类型系统（BusinessDef, ManagerDef, GlobalUpgradeDef, PrestigeRuleDef, OfferDef, EventDef等）
  - config/businesses.ts: 10档贴膜产业配置（路边摊→全球集团）
  - config/managers.ts: 12名店长（10产线自动化 + 2全局专家顾问）
  - config/upgrades.ts: 11项全局升级（设备/渠道/品牌三组）
  - config/prestige.ts: 转生规则（渠道人脉系统）
  - config/shop.ts: 8种商城商品（广告增益/钻石/礼包）
  - config/events.ts: 3个限时活动模板
- 构建公式引擎 formulas.ts：成本曲线/收益计算/里程碑倍率/离线收益/数字格式化
- 构建Zustand状态管理 gameStore.ts：完整游戏状态 + localStorage持久化 + 自动保存
- 构建UI Shell：
  - TopHUD: 现金/钻石/广告Buff计时/收入速率
  - BottomTabs: 5Tab导航（生意/升级/店长/人脉/商城）
  - PopupLayer: 弹窗系统（奖励/确认/里程碑/教程）
  - OfflineRewardPopup: 离线收益领取弹窗
- 构建完整5个Tab页面：
  - BusinessTab: 产线卡片列表/手动贴膜/购买/进度条/倍率爆发/新手引导
  - UpgradeTab: 三组全局升级/等级进度/效果预览
  - ManagerTab: 店长雇佣/稀有度系统/全局顾问
  - PrestigeTab: 转生系统/永久加成/统计面板
  - ShopTab: 广告增益/免费礼包/钻石商店/限时活动
- 配置globals.css: 暗色游戏主题/金色暴富风格/自定义滚动条/安全区域适配
- 配置layout.tsx: PWA元数据/移动端viewport锁定
- 修复lint问题，通过ESLint检查

Stage Summary:
- 完整的《贴膜大亨》挂机经营手游已构建完成
- 技术栈: Next.js 16 + TypeScript + Tailwind CSS 4 + Zustand + Framer Motion
- 核心系统: 10档产线/店长自动化/里程碑倍率/全局升级/转生重置/离线收益/广告增益
- UI设计: 竖屏全屏三段式布局/金色暴富主题/游戏化弹窗/新手引导
- 存档系统: localStorage持久化 + 30秒自动保存 + 页面关闭保存
