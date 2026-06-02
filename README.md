# Film Tycoon

Film Tycoon is a mobile-first idle business simulation game built with Next.js, React, TypeScript, and Tailwind CSS. Players grow a screen-protector empire by buying production lines, hiring managers, upgrading operations, collecting achievements, and using prestige points to unlock long-term growth.

## Features

- Idle production loop with active tapping, automated managers, offline rewards, and auto-save.
- Multiple business lines with individual costs, revenue curves, milestones, and upgrade paths.
- Global upgrades, business-specific upgrades, manager upgrades, and prestige-based angel upgrades.
- Random timed events, ad-style buffs, daily login rewards, shop offers, achievements, and statistics.
- Generated PNG game assets for business, manager, upgrade, shop, achievement, reward, and shared UI icons.
- Mobile game shell with bottom tabs, top resource HUD, popups, and animated UI transitions.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Framer Motion
- Sharp for asset processing scripts
- ESLint 9 flat config

## Getting Started

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Build for production:

```bash
bun run build
```

Start the production server:

```bash
bun run start
```

Run lint checks:

```bash
bun run lint
```

## Scripts

- `bun run dev` starts the Next.js development server on port `3000`.
- `bun run build` builds the app and copies standalone assets.
- `bun run start` runs the standalone production server.
- `bun run lint` runs ESLint.
- `bun run db:push`, `db:generate`, `db:migrate`, and `db:reset` are available for Prisma workflows.

## Project Structure

```text
src/app/                    App shell and page entry
src/components/game/         Game UI components and icon renderers
src/components/game/tabs/    Main gameplay tabs
src/game/config/             Static game configuration
src/game/formulas.ts         Economy, revenue, prestige, and event formulas
src/game/types.ts            Core TypeScript game types
src/store/                   Zustand game state
public/assets/game/          Generated PNG game assets
scripts/                     Build and asset utility scripts
```

## Game Systems

- Businesses: purchasable production lines with progress, revenue, managers, and milestones.
- Upgrades: global and per-business upgrades that improve speed, profit, offline rewards, or costs.
- Managers: automation and manager-level bonuses for business lines.
- Prestige: reset progression for permanent channel-connection bonuses and angel upgrades.
- Shop and events: temporary boosts, rewards, special offers, and timed random events.
- Achievements: milestone tracking with rewards and generated achievement icons.
- Daily rewards: seven-day reward cycle with generated reward assets.

## Asset Notes

Game icons are rendered from PNG assets under `public/assets/game`. The UI no longer uses emoji icons. Shared icons use stable asset ids such as `currency/coin`, `nav/business`, `boost/timer`, and `status/check`.

Some generated assets were post-processed to remove baked checkerboard or white backgrounds while preserving highlights and object details. `scripts/generate-shared-assets.mjs` can regenerate the shared icon set when needed.

---

# 贴膜大亨

贴膜大亨是一个面向移动端体验的放置经营游戏，使用 Next.js、React、TypeScript 和 Tailwind CSS 构建。玩家通过购买产线、雇佣店长、升级运营、完成成就和转生获取长期加成，逐步打造贴膜商业帝国。

## 功能特性

- 放置收益循环，支持主动点击、店长自动化、离线收益和自动存档。
- 多条产线拥有独立成本、收益曲线、里程碑和升级路径。
- 包含全局升级、产线专属升级、店长升级和人脉转生升级。
- 支持随机限时事件、广告式增益、每日登录奖励、商城礼包、成就和统计面板。
- 使用生成 PNG 素材展示产线、店长、升级、商城、成就、奖励和通用 UI 图标。
- 移动游戏式界面，包含底部 Tab、顶部资源栏、弹窗和动画过渡。

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Framer Motion
- Sharp 素材处理脚本
- ESLint 9 flat config

## 快速开始

安装依赖：

```bash
bun install
```

启动开发服务器：

```bash
bun run dev
```

生产构建：

```bash
bun run build
```

启动生产服务：

```bash
bun run start
```

运行 lint：

```bash
bun run lint
```

## 脚本说明

- `bun run dev` 在 `3000` 端口启动 Next.js 开发服务器。
- `bun run build` 构建应用并复制 standalone 资源。
- `bun run start` 启动 standalone 生产服务。
- `bun run lint` 运行 ESLint 检查。
- `bun run db:push`、`db:generate`、`db:migrate`、`db:reset` 用于 Prisma 工作流。

## 目录结构

```text
src/app/                    应用入口和游戏壳
src/components/game/         游戏 UI 组件和图标渲染组件
src/components/game/tabs/    主要玩法 Tab
src/game/config/             静态游戏配置
src/game/formulas.ts         经济、收益、转生和事件公式
src/game/types.ts            核心 TypeScript 类型
src/store/                   Zustand 游戏状态
public/assets/game/          生成的 PNG 游戏素材
scripts/                     构建和素材工具脚本
```

## 游戏系统

- 产线：可购买的生产线，包含进度、收益、店长和里程碑。
- 升级：全局和产线专属升级，可提升速度、利润、离线收益或降低成本。
- 店长：为产线提供自动化和等级加成。
- 转生：重置当前进度，换取永久人脉加成和人脉升级。
- 商城与事件：临时增益、奖励、特殊礼包和随机限时事件。
- 成就：追踪成长里程碑，并提供奖励和生成图标。
- 每日奖励：七日循环登录奖励，并使用生成奖励素材。

## 素材说明

游戏图标统一使用 `public/assets/game` 下的 PNG 素材渲染，UI 不再使用 emoji 图标。通用图标使用稳定素材 ID，例如 `currency/coin`、`nav/business`、`boost/timer` 和 `status/check`。

部分生成素材已进行后处理，移除了被烘进图片的棋盘格或白色背景，同时保留主体高光和细节。需要时可以使用 `scripts/generate-shared-assets.mjs` 重新生成通用图标素材。
