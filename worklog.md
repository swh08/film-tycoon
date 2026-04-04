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
