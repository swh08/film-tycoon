// ============================================================
// 游戏状态管理 — Zustand Store + localStorage 持久化
// ============================================================
import { create } from 'zustand';
import { BusinessState, UpgradeState, AdBuff, TutorialStep, GameState } from '../game/types';
import { BUSINESSES } from '../game/config/businesses';
import { MANAGERS } from '../game/config/managers';
import { GLOBAL_UPGRADES } from '../game/config/upgrades';
import { ANGEL_UPGRADES } from '../game/config/angel-upgrades';
import { calcBuyCost, calcBuyCostWithDiscount, calcUpgradeCost, calcUpgradeCostBulk, calcGlobalEffects, calcAngelUpgradeEffects, calcAngelBusinessProfitMult, checkAchievementConditions, calcBusinessUpgradeProfitMult, calcBusinessUpgradeCycleReduce } from '../game/formulas';
import { BUSINESS_UPGRADES } from '../game/config/business-upgrades';
import { ACHIEVEMENTS } from '../game/config/achievements';
import { calcPrestigeGain, calcPrestigeMultiplier } from '../game/config/prestige';

const SAVE_KEY = 'screen_tycoon_save_v1';

/** 创建初始游戏状态 */
function createInitialState(): GameState {
  return {
    cash: 0,
    diamonds: 0,
    totalEarned: 0,
    prestigePoints: 0,
    totalPrestigeCount: 0,
    businesses: BUSINESSES.map(b => ({
      businessId: b.id,
      quantity: 0,
      progress: 0,
      hasManager: false,
    })),
    upgrades: GLOBAL_UPGRADES.map(u => ({
      upgradeId: u.id,
      level: 0,
    })),
    hiredManagers: [],
    adBuffs: [],
    lastOnlineTimestamp: Date.now(),
    tutorialStep: 'none',
    purchasedOffers: [],
    purchasedAngelUpgrades: [],
    purchasedBusinessUpgrades: [],
    unlockedAchievements: [],
    lastAchievementCheck: Date.now(),
    totalManualTaps: 0,
    totalPurchases: 0,
    startTime: Date.now(),
    buyMode: 1,
    activeTab: 'business' as string,
  };
}

/** 从 localStorage 加载存档 */
function loadSave(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // 基础验证
    if (!data || typeof data.cash !== 'number') return null;
    return data as GameState;
  } catch {
    return null;
  }
}

/** 保存到 localStorage */
function saveToDisk(state: GameState) {
  if (typeof window === 'undefined') return;
  try {
    const toSave: GameState = { ...state };
    // 不保存运行时临时数据（progress会在tick中恢复）
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('存档保存失败:', e);
  }
}

// ============================================================
// Store Actions
// ============================================================

interface GameActions {
  // 切换Tab（UI状态）
  setActiveTab: (tab: string) => void;

  // 手动贴膜（点击生产）
  manualProduce: (businessId: number) => void;

  // 购买产线
  buyBusiness: (businessId: number, count: number) => boolean;

  // 雇佣店长
  hireManager: (managerId: number) => boolean;

  // 升级全局升级
  buyUpgrade: (upgradeId: number, count?: number) => boolean;

  // 购买人脉升级（消耗人脉点数）
  buyAngelUpgrade: (upgradeId: number) => boolean;

  // 购买产线专属升级（消耗现金）
  buyBusinessUpgrade: (upgradeId: number) => boolean;

  // 检查并解锁成就（返回新解锁的成就ID列表）
  checkAchievements: () => string[];


  // 转生
  prestige: () => void;

  // 领取离线收益
  claimOfflineEarnings: (earnings: number) => void;

  // 广告增益
  addAdBuff: (type: AdBuff['type'], durationSec: number, value: number) => void;
  tickAdBuffs: (deltaSec: number) => void;

  // 消费钻石
  spendDiamonds: (amount: number) => boolean;

  // 商城购买记录
  markOfferPurchased: (offerId: number) => void;

  // 新手引导
  advanceTutorial: (step: TutorialStep) => void;

  // 添加现金
  addCash: (amount: number) => void;
  addDiamonds: (amount: number) => void;

  // 购买模式切换
  setBuyMode: (mode: number) => void;

  // 生产进度更新（每帧调用）
  updateProgress: (deltaSec: number) => { completedBusinesses: number[]; totalEarned: number };

  // 重置存档
  resetGame: () => void;

  // 强制保存
  save: () => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => {
  const saved = loadSave();
  const initial = saved ?? createInitialState();

  // 确保数据结构完整（版本兼容）
  const safeState: GameState = {
    ...createInitialState(),
    ...initial,
    // 确保数组长度正确
    businesses: initial.businesses?.length
      ? BUSINESSES.map((b, i) => ({
          businessId: b.id,
          quantity: initial.businesses[i]?.quantity ?? 0,
          progress: 0, // 重置进度（从存档恢复不保留进度）
          hasManager: initial.businesses[i]?.hasManager ?? false,
          managerId: initial.businesses[i]?.managerId,
        }))
      : createInitialState().businesses,
    upgrades: initial.upgrades?.length
      ? GLOBAL_UPGRADES.map((u, i) => ({
          upgradeId: u.id,
          level: initial.upgrades[i]?.level ?? 0,
        }))
      : createInitialState().upgrades,
  };

  return {
    ...safeState,
    buyMode: safeState.buyMode ?? 1,
    activeTab: 'business' as string,

    setActiveTab: (tab: string) => {
      set({ activeTab: tab });
    },

    manualProduce: (businessId: number) => {
      set(state => {
        const bsIdx = state.businesses.findIndex(b => b.businessId === businessId);
        if (bsIdx === -1) return state;
        const bs = state.businesses[bsIdx];
        if (bs.quantity <= 0) return state;
        // 已经在生产中，不允许重复点击
        if (bs.progress > 0) return state;

        // 手动生产：启动进度条（不是直接给收益）
        const newBusinesses = [...state.businesses];
        newBusinesses[bsIdx] = { ...bs, progress: 0.001 };

        return {
          totalManualTaps: state.totalManualTaps + 1,
          businesses: newBusinesses,
        };
      });
      get().save();
    },

    buyBusiness: (businessId: number, count: number) => {
      const state = get();
      const def = BUSINESSES.find(b => b.id === businessId);
      if (!def) return false;

      const bsIdx = state.businesses.findIndex(b => b.businessId === businessId);
      if (bsIdx === -1) return false;
      const currentQty = state.businesses[bsIdx].quantity;

      const cost = calcBuyCostWithDiscount(def, currentQty, count, state.purchasedAngelUpgrades);
      if (state.cash < cost) return false;

      set(s => {
        const newBusinesses = [...s.businesses];
        newBusinesses[bsIdx] = {
          ...newBusinesses[bsIdx],
          quantity: newBusinesses[bsIdx].quantity + count,
        };
        return {
          cash: s.cash - cost,
          businesses: newBusinesses,
          totalPurchases: s.totalPurchases + count,
        };
      });
      get().save();
      return true;
    },

    hireManager: (managerId: number) => {
      const state = get();
      if (state.hiredManagers.includes(managerId)) return false;

      const def = MANAGERS.find(m => m.id === managerId);
      if (!def) return false;

      if (def.currency === 'cash' && state.cash < def.unlockCost) return false;
      if (def.currency === 'diamond' && state.diamonds < def.unlockCost) return false;

      set(s => {
        const newHired = [...s.hiredManagers, managerId];
        const newBusinesses = [...s.businesses];

        if (def.businessId > 0) {
          // 绑定到具体产线
          const bsIdx = newBusinesses.findIndex(b => b.businessId === def.businessId);
          if (bsIdx !== -1) {
            newBusinesses[bsIdx] = {
              ...newBusinesses[bsIdx],
              hasManager: true,
              managerId: def.id,
            };
          }
        }

        return {
          hiredManagers: newHired,
          businesses: newBusinesses,
          cash: def.currency === 'cash' ? s.cash - def.unlockCost : s.cash,
          diamonds: def.currency === 'diamond' ? s.diamonds - def.unlockCost : s.diamonds,
        };
      });
      get().save();
      return true;
    },

    buyUpgrade: (upgradeId: number, count: number = 1) => {
      const state = get();
      const def = GLOBAL_UPGRADES.find(u => u.id === upgradeId);
      if (!def) return false;

      const uIdx = state.upgrades.findIndex(u => u.upgradeId === upgradeId);
      if (uIdx === -1) return false;

      const currentLevel = state.upgrades[uIdx].level;
      // 限制不超过最大等级
      const actualCount = Math.min(count, def.maxLevel - currentLevel);
      if (actualCount <= 0) return false;

      const cost = calcUpgradeCostBulk(upgradeId, currentLevel, actualCount);
      if (def.currency === 'cash' && state.cash < cost) return false;
      if (def.currency === 'diamond' && state.diamonds < cost) return false;

      set(s => {
        const newUpgrades = [...s.upgrades];
        newUpgrades[uIdx] = { ...newUpgrades[uIdx], level: currentLevel + actualCount };

        return {
          upgrades: newUpgrades,
          cash: def.currency === 'cash' ? s.cash - cost : s.cash,
          diamonds: def.currency === 'diamond' ? s.diamonds - cost : s.diamonds,
        };
      });
      get().save();
      return true;
    },

    buyAngelUpgrade: (upgradeId: number) => {
      const state = get();
      if (state.purchasedAngelUpgrades.includes(upgradeId)) return false;

      const def = ANGEL_UPGRADES.find(u => u.id === upgradeId);
      if (!def) return false;
      if (state.prestigePoints < def.cost) return false;

      set(s => ({
        prestigePoints: s.prestigePoints - def.cost,
        purchasedAngelUpgrades: [...s.purchasedAngelUpgrades, upgradeId],
      }));
      get().save();
      // 检查成就
      setTimeout(() => get().checkAchievements(), 100);
      return true;
    },

    buyBusinessUpgrade: (upgradeId: number) => {
      const state = get();
      if (state.purchasedBusinessUpgrades.includes(upgradeId)) return false;

      const def = BUSINESS_UPGRADES.find(u => u.id === upgradeId);
      if (!def) return false;

      // 检查拥有数量是否满足解锁要求
      const bs = state.businesses.find(b => b.businessId === def.businessId);
      if (!bs || bs.quantity < def.unlockQuantity) return false;

      if (state.cash < def.cost) return false;

      set(s => ({
        cash: s.cash - def.cost,
        purchasedBusinessUpgrades: [...s.purchasedBusinessUpgrades, upgradeId],
      }));
      get().save();
      setTimeout(() => get().checkAchievements(), 100);
      return true;
    },

    checkAchievements: () => {
      const state = get();
      const now = Date.now();

      // 节流：最多每3秒检查一次
      if (now - state.lastAchievementCheck < 3000) return [];

      const newlyUnlocked = checkAchievementConditions(state);
      if (newlyUnlocked.length === 0) {
        set({ lastAchievementCheck: now });
        return [];
      }

      // 计算奖励
      let totalCashReward = 0;
      let totalDiamondReward = 0;
      for (const id of newlyUnlocked) {
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach?.reward) {
          if (ach.reward.type === 'cash') totalCashReward += ach.reward.value;
          if (ach.reward.type === 'diamond') totalDiamondReward += ach.reward.value;
        }
      }

      set(s => ({
        unlockedAchievements: [...s.unlockedAchievements, ...newlyUnlocked],
        lastAchievementCheck: now,
        cash: s.cash + totalCashReward,
        totalEarned: s.totalEarned + totalCashReward,
        diamonds: s.diamonds + totalDiamondReward,
      }));
      get().save();

      return newlyUnlocked;
    },

    prestige: () => {
      const state = get();
      const gain = calcPrestigeGain(state.totalEarned);
      if (gain <= 0) return;

      set(s => ({
        cash: 0,
        diamonds: s.diamonds, // 钻石保留
        totalEarned: 0,
        prestigePoints: s.prestigePoints + gain,
        totalPrestigeCount: s.totalPrestigeCount + 1,
        businesses: BUSINESSES.map(b => ({
          businessId: b.id,
          quantity: b.id === 1 ? 1 : 0, // 转生后送1个第一档
          progress: 0,
          hasManager: false,
        })),
        upgrades: GLOBAL_UPGRADES.map(u => ({
          upgradeId: u.id,
          level: 0,
        })),
        hiredManagers: [],
        adBuffs: [],
        lastOnlineTimestamp: Date.now(),
        tutorialStep: 'none' as TutorialStep,
        totalManualTaps: 0,
        totalPurchases: 0,
        buyMode: s.buyMode, // UI偏好保留
        purchasedAngelUpgrades: s.purchasedAngelUpgrades, // 人脉升级永久保留
        purchasedBusinessUpgrades: [], // 产线专属升级重置
        unlockedAchievements: s.unlockedAchievements, // 成就永久保留
      }));
      get().save();
    },

    claimOfflineEarnings: (earnings: number) => {
      set(s => ({
        cash: s.cash + earnings,
        totalEarned: s.totalEarned + earnings,
        lastOnlineTimestamp: Date.now(),
      }));
      get().save();
    },

    addAdBuff: (type, durationSec, value) => {
      set(s => {
        const newBuffs = s.adBuffs.filter(b => b.type !== type);
        newBuffs.push({ type, remainingSec: durationSec, value });
        return { adBuffs: newBuffs };
      });
    },

    tickAdBuffs: (deltaSec: number) => {
      set(s => {
        const updated = s.adBuffs
          .map(b => ({ ...b, remainingSec: b.remainingSec - deltaSec }))
          .filter(b => b.remainingSec > 0);
        return { adBuffs: updated };
      });
    },

    spendDiamonds: (amount: number) => {
      const state = get();
      if (state.diamonds < amount) return false;
      set(s => ({ diamonds: s.diamonds - amount }));
      get().save();
      return true;
    },

    markOfferPurchased: (offerId: number) => {
      set(s => ({
        purchasedOffers: [...s.purchasedOffers, offerId],
      }));
      get().save();
    },

    advanceTutorial: (step) => {
      set({ tutorialStep: step });
      get().save();
    },

    addCash: (amount) => {
      set(s => ({ cash: s.cash + amount, totalEarned: s.totalEarned + amount }));
    },

    addDiamonds: (amount) => {
      set(s => ({ diamonds: s.diamonds + amount }));
    },

    setBuyMode: (mode: number) => {
      set({ buyMode: mode });
      get().save();
    },

    updateProgress: (deltaSec: number) => {
      const state = get();
      const completedBusinesses: number[] = [];
      let totalEarned = 0;

      // 预计算人脉升级效果
      const angelEffects = calcAngelUpgradeEffects(state.purchasedAngelUpgrades || []);

      const newBusinesses = state.businesses.map(bs => {
        if (bs.quantity <= 0) return { ...bs };
        // 有店长的自动运行；没店长但progress>0说明手动启动过，也要走进度
        if (!bs.hasManager && bs.progress <= 0) return { ...bs };

        const def = BUSINESSES.find(b => b.id === bs.businessId);
        if (!def) return { ...bs };

        // 计算实际周期
        const globalEffects = calcGlobalEffects(state.upgrades);
        let cycle = def.baseCycleSec * globalEffects.cycleMultiplier;
        cycle *= calcBusinessUpgradeCycleReduce(bs.businessId, state.purchasedBusinessUpgrades || []);
        cycle *= angelEffects.globalCycleReduce;
        const rushBuff = state.adBuffs.find(b => b.type === 'rush_order');
        if (rushBuff) cycle *= 0.2;
        cycle = Math.max(0.05, cycle);

        const newProgress = bs.progress + deltaSec / cycle;

        if (newProgress >= 1) {
          // 完成生产
          completedBusinesses.push(bs.businessId);
          let revenue = def.baseRevenue * bs.quantity;
          for (const ms of def.milestones) {
            if (bs.quantity >= ms.at) revenue *= ms.multiplier;
          }
          revenue *= globalEffects.profitMultiplier;
          revenue *= calcBusinessUpgradeProfitMult(bs.businessId, state.purchasedBusinessUpgrades || []);
          revenue *= calcAngelBusinessProfitMult(bs.businessId, state.purchasedAngelUpgrades || []);
          revenue *= angelEffects.globalProfitMult;
          revenue *= calcPrestigeMultiplier(state.prestigePoints);
          if (state.adBuffs.some(b => b.type === 'double_revenue')) revenue *= 2;
          if (rushBuff) revenue *= 3;

          totalEarned += revenue;
          // 有店长：自动重启（progress=0.001）；没店长：停止（progress=0）
          return { ...bs, progress: bs.hasManager ? 0.001 : 0 };
        }

        return { ...bs, progress: newProgress };
      });

      if (completedBusinesses.length > 0 || totalEarned > 0) {
        set(s => ({
          cash: s.cash + totalEarned,
          totalEarned: s.totalEarned + totalEarned,
          businesses: newBusinesses,
        }));
      } else {
        set({ businesses: newBusinesses });
      }

      // 更新广告buff计时
      // 定期检查成就（每3秒）
      const now = Date.now();
      if (now - state.lastAchievementCheck >= 3000) {
        get().checkAchievements();
      }

      if (state.adBuffs.length > 0) {
        get().tickAdBuffs(deltaSec);
      }

      return { completedBusinesses, totalEarned };
    },

    resetGame: () => {
      const fresh = createInitialState();
      set(fresh);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SAVE_KEY);
      }
    },

    save: () => {
      saveToDisk(get());
    },
  };
});
