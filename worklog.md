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

---
## Task ID: 5 — Feature Agent
### Work Task
实现4大高优先级功能：AnimatedNumber动画计数器、扩展数字格式化、统计面板、设置面板

### Work Summary

#### Task 1: 💰 AnimatedNumber 动画计数器
- 创建 `src/components/game/AnimatedNumber.tsx`：基于 requestAnimationFrame + easeOutCubic 缓动函数的数字滚动组件
  - 接受 value/formatFn/className/duration props
  - 使用 useRef 跟踪当前显示值，避免每次帧更新触发 React 重渲染
  - 300ms 动画时长，值变化时平滑过渡，新值到达时跳转到新目标
- 更新 `src/components/game/TopHUD.tsx`：
  - 现金显示改用 `<AnimatedNumber value={cash} formatFn={formatCash} />`
  - 每秒收入显示改用 AnimatedNumber
  - 钻石数量改用 AnimatedNumber（formatFn 为整数格式）
  - 人脉点数改用 AnimatedNumber
  - 移除原 🔊/🔇 音效按钮，替换为 ⚙️ 设置按钮
  - 新增 📊 统计按钮（onStatsOpen prop）
  - TopHUD props 签名扩展为：onAchievementOpen + onStatsOpen + onSettingsOpen

#### Task 2: 🔢 扩展数字格式化
- 更新 `src/game/types.ts`：
  - GameState 新增 `numberFormat: 'abbreviation' | 'scientific'`
  - GameState 新增 `musicVolume: number`（0-1）和 `sfxVolume: number`（0-1）
- 重写 `src/game/formulas.ts` 中的数字格式化系统：
  - `formatNumber(n, format?)` 支持两种模式：
    - **abbreviation**：单字母后缀 K~Dc（10^3~10^33），超出后双字母系统 Aa(10^36), Ab(10^39), ..., Az(10^60), Ba(10^63), ... 无限扩展
    - **scientific**：科学计数法 1.23e15
  - 边界处理：负数、NaN/Infinity(显示∞)、超大数(>10^1000显示∞)、极小正数(<0.01)
  - 新增 `syncNumberFormat()` 模块级缓存同步函数（避免循环依赖）
  - 新增 `formatNumberSmart()` 读取缓存的格式偏好
  - `formatCash()` 改用 `formatNumberSmart()`，自动跟随用户设置
- 更新 `src/store/gameStore.ts`：
  - 新增 `setNumberFormat`/`setMusicVolume`/`setSfxVolume` actions
  - createInitialState 添加默认值：numberFormat='abbreviation', musicVolume=0.5, sfxVolume=0.8
  - safeState 迁移兼容旧存档
  - store 初始化时调用 syncNumberFormat 同步格式缓存
  - setNumberFormat 时同步更新缓存

#### Task 3: 📊 统计面板
- 创建 `src/components/game/StatsPanel.tsx`：
  - 全屏覆盖层面板（framer-motion 动画，从底部滑入）
  - Props: isOpen/onClose
  - 7个统计区块：
    - 💰 资源统计：当前现金、钻石数量、人脉点数
    - 📈 收入统计：历史总收入、当前每秒收入（含每小时收入）
    - 🎯 产线统计：10条产线各自的图标+名称+数量+店长标记+每秒收入
    - ⏱️&👆 游戏数据：游戏时长(X天X小时X分)、手动点击次数、总购买次数、雇佣店长数
    - 🔄 转生统计：转生次数、人脉升级数、产线升级数
    - 🏆 成就进度：进度条+完成率百分比
  - 所有数字使用 tabular-nums 和 formatCash/formatNumber
  - 深色主题 + 蓝色调头部，与游戏风格统一
- 集成到 `src/app/page.tsx`：showStats state + StatsPanel 组件
- TopHUD 新增 📊 按钮触发 onStatsOpen

#### Task 4: ⚙️ 设置面板
- 创建 `src/components/game/SettingsPanel.tsx`：
  - 全屏覆盖层面板（framer-motion 动画，从底部滑入）
  - Props: isOpen/onClose
  - 4个设置区块：
    - 🔊 音频设置：音效总开关（自定义 toggle）、背景音乐滑块(0-100%)、音效音量滑块(0-100%)
    - 🔢 数字显示：缩写/科学计数法切换按钮（选中态高亮）
    - 💾 存档管理：
      - 导出存档：复制 JSON 到剪贴板（含 fallback 方案）
      - 导入存档：可展开 textarea + 解析验证 + 加载
      - 重置游戏：可展开确认区域（二次确认）
    - ℹ️ 关于：游戏名+版本号 v1.0.0
  - 内置 Toast 消息提示（导入成功/失败等）
  - 所有操作自动持久化到 store
- 集成到 `src/app/page.tsx`：showSettings state + SettingsPanel 组件
- TopHUD 旧 🔊/🔇 按钮替换为 ⚙️ 按钮

#### 编译验证
- `next build` 编译成功，无错误
- `npm run lint` 仅剩 EventNotification.tsx 预存的 setState-in-effect 警告（非本次修改引入）
- dev server 运行正常，所有页面 200

---
Task ID: 6
Agent: Main Agent
Task: 实现4个中优先级AC对标功能：扩展人脉升级、自动购买系统、背景音乐、广告奖励完善

Work Log:
- 阅读所有相关文件（types.ts, gameStore.ts, formulas.ts, sound.ts, angel-upgrades.ts, businesses.ts, shop.ts, ShopTab.tsx, PrestigeTab.tsx, BusinessTab.tsx, SettingsPanel.tsx）
- 发现4个任务的所有代码已在之前的开发轮次中实现完毕，但存在一个语法错误导致构建失败
- 修复 `src/components/game/tabs/BusinessTab.tsx` 第565行 JSX 注释缺少闭合大括号：`{/* 操作区：贴膜/购买 + 专属升级 */` → `{/* 操作区：贴膜/购买 + 专属升级 */}`
- 运行 `npx next build` 验证编译通过
- 运行 `npm run lint` 确认无新增 lint 错误（仅剩预存的 EventNotification.tsx 警告）

Stage Summary:
- TASK 1 扩展人脉升级(16→34)：已实现，4个分层(Tier 1-4)共34个升级，含 minPrestigeCount 分层解锁机制，PrestigeTab 按分层显示锁定/解锁状态
- TASK 2 自动购买系统：已实现，autoBuySettings/autoBuyUnlockCost 配置，unlockAutoBuy/toggleAutoBuy/setAutoBuyInterval actions，updateProgress 中自动购买 tick，转生重置，BusinessTab 🤖按钮UI
- TASK 3 背景音乐：已实现，Web Audio API BGM系统(C-Am-F-G和弦进行12s循环)，独立GainNode，startMusic/stopMusic/setMusicVolume/isMusicPlaying API，设置面板音乐开关+音量滑块
- TASK 4 广告奖励完善：已实现，adWatchCountToday/lastAdWatchDate/dailyAdLimit 每日限制，watchAd() action含跨天重置，3种新广告奖励(即时现金/免费钻石/速度加成)，ShopTab 3秒倒计时+剩余次数显示，speed_buff 集成到 calcCycleTime()
- 构建通过，无错误
