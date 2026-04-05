---
Task ID: 1
Agent: Main Agent
Task: 实现每条产线专属升级系统 + 成就系统（对标 Adventure Capitalist）

Work Log:
- 阅读现有代码结构：types.ts, formulas.ts, gameStore.ts, BusinessTab.tsx, TopHUD.tsx, page.tsx, 所有config文件
- 创建 `src/game/config/business-upgrades.ts`：30个产线专属升级（10条产线 × 3个升级：×2利润、×3利润、-25%速度）
- 创建 `src/game/config/achievements.ts`：24个成就（收入里程碑6个、产线成就5个、店长成就2个、转生成就3个、升级成就3个、人脉成就2个、其他3个）
- 更新 `src/game/types.ts`：添加 BusinessUpgradeDef、AchievementDef 类型定义，GameState 添加 purchasedBusinessUpgrades、unlockedAchievements、lastAchievementCheck 字段
- 更新 `src/game/formulas.ts`：添加 calcBusinessUpgradeProfitMult、calcBusinessUpgradeCycleReduce、checkAchievementConditions 函数，集成到收益和周期计算
- 更新 `src/store/gameStore.ts`：添加 buyBusinessUpgrade、checkAchievements actions，updateProgress 中集成产线升级效果，转生时重置产线升级保留成就，游戏循环中每3秒检查成就
- 创建 `src/components/game/AchievementPanel.tsx`：全屏覆盖层成就面板，分类显示、进度条、解锁状态
- 更新 `src/components/game/tabs/BusinessTab.tsx`：每条产线卡片添加"🔧专属升级"入口按钮 + 弹窗购买界面
- 更新 `src/components/game/TopHUD.tsx`：添加成就入口🏅按钮，显示已解锁数量角标
- 更新 `src/app/page.tsx`：集成 AchievementPanel 覆盖层

Stage Summary:
- 产线专属升级系统完整实现：30个升级，用现金购买，需达到指定数量解锁，转生重置
- 成就系统完整实现：24个成就覆盖游戏各方面，自动检测（每3秒），达成立即发放奖励
- 收益计算完整集成：收益 = 基础×数量×里程碑×全局升级×产线专属升级×人脉升级×转生加成×广告buff
- 周期计算完整集成：周期 = 基础×全局升级×产线专属升级×人脉升级×爆单潮
- 编译通过，无报错

---
Task ID: 2
Agent: Main Agent
Task: 修复转生弹窗：确认后关闭弹窗并切回生意tab（对标AC行为），同时修复静态JSX问题

Work Log:
- 在 gameStore.ts 添加 `activeTab` 状态和 `setActiveTab` action，让任意组件可切换tab
- 更新 page.tsx：从 useState 改为使用 gameStore 的 activeTab/setActiveTab
- 重写 PrestigeTab.tsx：
  - 提取转生确认弹窗为 `PrestigeConfirmPopup` 响应式组件（使用 useGameStore 实时读取数据）
  - 提取人脉升级购买弹窗为 `AngelUpgradePopup` 响应式组件
  - 转生确认后：调用 prestige() → closePopup() → setActiveTab('business')，完全对标AC
  - 人脉升级购买后：调用 buyAngelUpgrade() → closePopup()
- 编译通过，无报错

Stage Summary:
- 转生流程已对标AC：确认转生 → 弹窗关闭 → 自动切回生意tab重新开始
- 人脉升级购买后弹窗自动关闭
- 两个弹窗都已改为响应式组件，不再有静态JSX问题
- activeTab 状态从 page 局部状态迁移到全局 store，任何组件都可以控制 tab 切换

---
Task ID: 3
Agent: Main Agent
Task: 实现4大AC对标功能：音效系统、每日登录奖励、市场波动、店长升级

Work Log:
- 创建 `src/game/sound.ts`：Web Audio API 合成音效系统（10种音效：tap/buy/upgrade/hire/milestone/achievement/prestige/dailyReward/error/marketUp/marketDown/uiClick），无需音频文件
- 创建 `src/game/config/daily-rewards.ts`：7天循环登录奖励配置（现金/钻石/双倍buff），奖励逐日递增
- 更新 `src/game/types.ts`：ManagerDef 增加 maxLevel/upgradeCostBase/upgradeCostMultiplier/upgradeEffectPerLevel/upgradeCurrency；GameState 增加 marketMultipliers/lastMarketUpdate/soundEnabled/lastLoginDate/loginStreak/managerLevels
- 更新 `src/game/config/managers.ts`：12个店长全部增加升级字段（maxLevel=10，升级费用指数增长）
- 更新 `src/game/formulas.ts`：新增 calcManagerLevelProfitMult/calcManagerLevelCycleReduce/calcManagerUpgradeCost（店长等级效果）；generateMarketMultipliers/getMarketTrendText（市场波动）；getTodayStr/isConsecutiveDay（每日登录）；收益和周期计算集成市场波动+店长等级
- 创建 `src/components/game/DailyRewardPopup.tsx`：全屏弹窗UI，7天奖励预览网格、今日奖励详情、领取按钮、粒子动画
- 更新 `src/store/gameStore.ts`：新增 upgradeManager/tickMarket/checkDailyLogin/claimDailyReward/setSoundEnabled actions；prestige 重置市场+店长等级；updateProgress 集成市场波动+店长等级效果+市场 tick
- 更新 `src/components/game/tabs/BusinessTab.tsx`：市场波动指示器（每条产线卡片显示趋势+倍率），购买/贴膜按钮加音效
- 更新 `src/components/game/tabs/ManagerTab.tsx`：店长卡片增加等级进度条、升级按钮、满级提示、效果描述
- 更新 `src/components/game/TopHUD.tsx`：市场趋势汇总指示器、音效开关按钮（🔊/🔇）
- 更新 `src/app/page.tsx`：集成 DailyRewardPopup，启动时检查每日登录
- 编译通过，无报错

Stage Summary:
- 音效系统：10种Web Audio API合成音效，全局音效开关，设置持久化
- 每日登录奖励：7天循环，连续登录检测+断签重置，奖励含现金/钻石/buff，精美弹窗UI
- 市场波动：每90-150秒随机波动，5种趋势（暴跌/下跌/平稳/上涨/繁荣），顶栏+产线卡片双重指示
- 店长升级：12个店长均可升至Lv.10，指数费用增长，产线店长加速+全局店长增益/加速
- 收益公式完整链路：基础×数量×里程碑×全局升级×产线升级×人脉升级×转生×店长等级×广告buff×市场波动

---
Task ID: 4
Agent: Main Agent
Task: 实现3大AC对标功能：利润/速度切换、详细收益分解Tooltip、事件激活系统

Work Log:
- 更新 `src/game/types.ts`：
  - 新增 BusinessMode 类型（profit/speed）
  - 新增 EventBoostType、GameEventDef、ActiveGameEvent 类型
  - GameState 增加 activeTab、businessModes、activeEvents、lastEventCheck、eventCooldownUntil
- 创建 `src/game/config/events.ts`：11个随机事件配置（4利润类/3速度类/2全能类/2成本类），含权重、冷却、最低收入要求、完成奖励
- 更新 `src/game/formulas.ts`：
  - calcRevenuePerCycle/calcCycleTime 集成利润/速度模式倍率和事件增益
  - 新增 calcDetailedBreakdown：完整收益分解（12项乘数），用于Tooltip显示
  - 新增 tryTriggerEvent：加权随机事件触发逻辑
  - 新增 calcEventCostReduce：事件成本缩减计算
- 更新 `src/store/gameStore.ts`：
  - 新增 setBusinessMode action（切换产线利润/速度/默认模式）
  - 新增 tickEvents action（事件tick：更新剩余时间、发放完成奖励、概率触发新事件）
  - updateProgress 集成利润/速度模式和事件效果到收益和周期计算
  - updateProgress 集成事件 tick
  - prestige 重置 businessModes、activeEvents、lastEventCheck、eventCooldownUntil
  - createInitialState/safeState 初始化新字段
- 更新 `src/game/sound.ts`：新增 playEventStart/playEventEnd 事件音效
- 更新 `src/components/game/tabs/BusinessTab.tsx`：
  - 新增 BusinessDetailPopupContent 组件：响应式弹窗显示完整收益分解（基础×12项乘数→最终收益/周期/秒收入）
  - 每条产线卡片右上角添加 ℹ️ 详情按钮
  - 每条产线卡片添加三态模式切换（💰利润/⚡速度/⚖️默认），带效果提示
- 创建 `src/components/game/EventNotification.tsx`：事件触发通知弹窗（从顶部滑入，3秒自动消失，显示事件名+增益+倒计时）
- 更新 `src/components/game/TopHUD.tsx`：顶栏中间区域显示激活事件倒计时（紫粉渐变徽章）
- 更新 `src/components/game/tabs/ShopTab.tsx`：旧 EVENTS 引用迁移为 GAME_EVENTS，显示随机事件预览列表
- 更新 `src/app/page.tsx`：集成 EventNotification 组件
- 编译通过，build成功

Stage Summary:
- 利润/速度切换：每条产线独立三态切换（利润×1.5速度×0.67 / 速度×2利润×0.8 / 默认），持久化到store，转生重置
- 详细收益分解Tooltip：点击ℹ️按钮查看完整乘数分解（基础→里程碑→全局升级→产线升级→人脉→转生→广告→市场→店长→模式→事件），含最终收益/周期/秒收入
- 事件激活系统：11种随机事件（利润/速度/全能/成本），每30秒10%概率触发，最多2个同时激活，自动倒计时+奖励发放，顶栏+通知弹窗+商城Tab三处显示
- 收益公式完整链路更新：基础×数量×里程碑×全局升级×产线升级×人脉升级×转生×店长等级×广告buff×市场波动×经营模式×事件增益
