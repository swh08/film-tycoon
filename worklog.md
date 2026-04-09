---
Task ID: 1-7
Agent: Main Agent
Task: UI游戏化优化 — 按影响从大到小全部实施

Work Log:
- **修复飘字系统**：RevenueFloatLayer组件已存在但未挂载到page.tsx，添加import和组件渲染
- **字体升级**：layout.tsx引入ZCOOL KuaiLe（中文游戏字体）和Orbitron（数字街机字体），配置CSS变量--font-game和--font-arcade
- **GameButton统一组件**：创建src/components/game/GameButton.tsx，封装7种颜色变体(gold/green/blue/red/gray/purple/cyan) + 3种尺寸(xs/sm/md)的3D按压按钮
- **进度条游戏化**：为生产进度条添加bar-sweep扫光特效、card-glow呼吸发光动画
- **HUD资源栏强化**：金币🪙添加coin-spin旋转动画、钻石💎添加diamond-sparkle闪光、数字使用font-arcade街机字体
- **头像升级**：活跃生意头像添加card-glow呼吸光效、进度条角标增强
- **背景氛围**：创建StarField星空粒子组件，30个随机闪烁星星，部分金色高亮
- **Tab切换动画**：主内容区添加tab-enter淡入上移动画，切换Tab时触发
- **全局CSS动画**：新增number-bounce数字弹跳、coin-spin金币旋转、diamond-sparkle钻石闪光、milestone-burst里程碑爆炸、particle-burst粒子扩散、bar-sweep进度条扫光、card-glow卡片呼吸、tab-enter标签切换、screen-flash全屏闪光、twinkle星星闪烁共10个动画
- **全Tab字体统一**：所有5个Tab的标题添加font-game，数字/倍率/价格添加font-arcade

Stage Summary:
- 修改文件：page.tsx, layout.tsx, globals.css, TopHUD.tsx, BottomTabs.tsx, RevenueFloatLayer.tsx, BusinessTab.tsx
- 新增文件：GameButton.tsx, StarField.tsx
- 子agent修改：UpgradeTab.tsx, ManagerTab.tsx, PrestigeTab.tsx, ShopTab.tsx, AchievementTab.tsx
- 构建成功，生产模式运行在3000端口
