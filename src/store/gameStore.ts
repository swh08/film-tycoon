// ============================================================
// 游戏状态管理 — Zustand Store + localStorage 持久化
// ============================================================
import { create } from 'zustand';
import { BusinessState, UpgradeState, AdBuff, TutorialStep, GameState, BusinessMode, ActiveGameEvent, LanguagePreference } from '../game/types';
import { BUSINESSES } from '../game/config/businesses';
import { MANAGERS } from '../game/config/managers';
import { GLOBAL_UPGRADES } from '../game/config/upgrades';
import { ANGEL_UPGRADES } from '../game/config/angel-upgrades';
import { calcBuyCost, calcBuyCostWithDiscount, calcUpgradeCost, calcUpgradeCostBulk, calcGlobalEffects, calcAngelUpgradeEffects, calcAngelBusinessProfitMult, checkAchievementConditions, calcBusinessUpgradeProfitMult, calcBusinessUpgradeCycleReduce, calcManagerUpgradeCost, calcMaxBuyable, generateMarketMultipliers, calcManagerLevelCycleReduce, calcManagerLevelProfitMult, getTodayStr, isConsecutiveDay, tryTriggerEvent, calcEventCostReduce, syncNumberFormat } from '../game/formulas';
import { BUSINESS_UPGRADES } from '../game/config/business-upgrades';
import { ACHIEVEMENTS } from '../game/config/achievements';
import { DAILY_REWARDS } from '../game/config/daily-rewards';
import { GAME_EVENTS } from '../game/config/events';
import { calcPrestigeGain, calcPrestigeMultiplier } from '../game/config/prestige';
import { setSoundEnabled } from '../game/sound';

const SAVE_KEY = 'screen_tycoon_save_v1';

/** 创建初始游戏状态 */
export function createInitialState(): GameState {
  const initialMarket: Record<number, number> = {};
  for (const b of BUSINESSES) initialMarket[b.id] = 1;

  return {
    cash: 0,
    diamonds: 0,
    totalEarned: 0,
    prestigePoints: 0,
    totalPrestigeCount: 0,
    businesses: BUSINESSES.map(b => ({
      businessId: b.id,
      quantity: b.id === 1 ? 1 : 0,
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
    marketMultipliers: initialMarket,
    lastMarketUpdate: Date.now(),
    soundEnabled: true,
    lastLoginDate: '',
    loginStreak: 0,
    managerLevels: {},
    businessModes: {} as Record<number, BusinessMode>,
    activeEvents: [] as ActiveGameEvent[],
    lastEventCheck: Date.now(),
    eventCooldownUntil: 0,
    numberFormat: 'abbreviation' as const,
    languagePreference: 'system',
    musicVolume: 0.5,
    sfxVolume: 0.8,
    musicEnabled: false,
    adWatchCountToday: 0,
    lastAdWatchDate: '',
    dailyAdLimit: 20,
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

  // 升级店长
  upgradeManager: (managerId: number) => boolean;

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

  // 音效开关
  setSoundEnabled: (enabled: boolean) => void;

  // 数字格式
  setNumberFormat: (format: 'abbreviation' | 'scientific') => void;

  // 语言偏好
  setLanguagePreference: (language: LanguagePreference) => void;

  // 音量
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;

  // 市场波动
  tickMarket: () => void;

  // 每日登录
  checkDailyLogin: () => { isRewardAvailable: boolean; streak: number };
  claimDailyReward: () => void;

  // 产线模式切换
  setBusinessMode: (businessId: number, mode: BusinessMode) => void;

  // 事件系统
  tickEvents: (deltaSec: number) => ActiveGameEvent | null;

  // 生产进度更新（每帧调用）
  updateProgress: (deltaSec: number) => { completedBusinesses: number[]; totalEarned: number };

  // 重置存档
  resetGame: () => void;

  // 强制保存
  save: () => void;

  // === Task 3: 背景音乐 ===
  setMusicEnabled: (enabled: boolean) => void;

  // === Task 4: 广告每日限制 ===
  watchAd: () => boolean;
  getRemainingAds: () => number;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => {
  const saved = loadSave();
  const initial = saved ?? createInitialState();

  // 确保数据结构完整（版本兼容）
  const initialMarket: Record<number, number> = {};
  for (const b of BUSINESSES) initialMarket[b.id] = 1;

  const safeState: GameState = {
    ...createInitialState(),
    ...initial,
    businesses: initial.businesses?.length
      ? BUSINESSES.map((b, i) => ({
          businessId: b.id,
          quantity: initial.businesses[i]?.quantity ?? 0,
          progress: 0,
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
    marketMultipliers: initial.marketMultipliers ?? initialMarket,
    lastMarketUpdate: initial.lastMarketUpdate ?? Date.now(),
    soundEnabled: initial.soundEnabled ?? true,
    lastLoginDate: initial.lastLoginDate ?? '',
    loginStreak: initial.loginStreak ?? 0,
    managerLevels: initial.managerLevels ?? {},
    businessModes: initial.businessModes ?? {},
    activeEvents: (initial.activeEvents ?? []).filter((e: any) => e.remainingSec > 0).map((e: any) => ({
      ...e,
      remainingSec: Math.max(0, (e.remainingSec ?? 0)),
    })),
    lastEventCheck: initial.lastEventCheck ?? Date.now(),
    eventCooldownUntil: initial.eventCooldownUntil ?? 0,
    numberFormat: initial.numberFormat ?? 'abbreviation',
    languagePreference: initial.languagePreference ?? 'system',
    musicVolume: initial.musicVolume ?? 0.5,
    sfxVolume: initial.sfxVolume ?? 0.8,
    musicEnabled: initial.musicEnabled ?? false,
    adWatchCountToday: initial.adWatchCountToday ?? 0,
    lastAdWatchDate: initial.lastAdWatchDate ?? '',
    dailyAdLimit: initial.dailyAdLimit ?? 20,
  };

  // 同步音效设置
  if (typeof window !== 'undefined') {
    setSoundEnabled(safeState.soundEnabled);
    syncNumberFormat(safeState.numberFormat);
  }

  return {
    ...safeState,
    buyMode: safeState.buyMode ?? 1,
    activeTab: 'business' as string,

    setActiveTab: (tab: string) => {
      set({ activeTab: tab });
    },

    setSoundEnabled: (enabled: boolean) => {
      set({ soundEnabled: enabled });
      setSoundEnabled(enabled);
      get().save();
    },

    setNumberFormat: (format: 'abbreviation' | 'scientific') => {
      set({ numberFormat: format });
      syncNumberFormat(format);
      get().save();
    },

    setLanguagePreference: (language: LanguagePreference) => {
      set({ languagePreference: language });
      get().save();
    },

    setMusicVolume: (v: number) => {
      set({ musicVolume: Math.max(0, Math.min(1, v)) });
      get().save();
    },

    setSfxVolume: (v: number) => {
      set({ sfxVolume: Math.max(0, Math.min(1, v)) });
      get().save();
    },

    // === Task 3: 背景音乐开关 ===
    setMusicEnabled: (enabled: boolean) => {
      set({ musicEnabled: enabled });
      get().save();
    },

    // === 广告每日限制 ===
    watchAd: (): boolean => {
      const state = get();
      const today = getTodayStr();

      // 如果是新的一天，重置计数
      if (state.lastAdWatchDate !== today) {
        set({ adWatchCountToday: 0, lastAdWatchDate: today });
      }

      if (state.adWatchCountToday >= state.dailyAdLimit) return false;

      set(s => ({
        adWatchCountToday: s.adWatchCountToday + 1,
      }));
      get().save();
      return true;
    },

    getRemainingAds: (): number => {
      const state = get();
      const today = getTodayStr();
      if (state.lastAdWatchDate !== today) return state.dailyAdLimit;
      return Math.max(0, state.dailyAdLimit - state.adWatchCountToday);
    },

    // === 市场波动 ===
    tickMarket: () => {
      const state = get();
      const now = Date.now();
      // 每90~150秒波动一次（固定间隔，避免每帧重随机）
      const nextTickAt = state._nextMarketTick || (state.lastMarketUpdate + 120000);
      if (now < nextTickAt) return;

      const newMultipliers = generateMarketMultipliers();
      const newInterval = 90000 + Math.random() * 60000;
      set({
        marketMultipliers: newMultipliers,
        lastMarketUpdate: now,
        _nextMarketTick: now + newInterval,
      });
      get().save();
    },

    // === 每日登录 ===
    checkDailyLogin: () => {
      const state = get();
      const today = getTodayStr();

      if (state.lastLoginDate === today) {
        return { isRewardAvailable: false, streak: state.loginStreak };
      }

      if (isConsecutiveDay(state.lastLoginDate, today)) {
        // 连续登录，streak+1
        const newStreak = state.loginStreak + 1;
        set({ loginStreak: newStreak, lastLoginDate: today });
        get().save();
        return { isRewardAvailable: true, streak: newStreak };
      } else {
        // 断签，重置为第1天
        set({ loginStreak: 1, lastLoginDate: today });
        get().save();
        return { isRewardAvailable: true, streak: 1 };
      }
    },

    claimDailyReward: () => {
      const state = get();
      const today = getTodayStr();

      // 防止重复领取
      if (state.dailyRewardClaimedDate === today) return;

      const currentDay = ((state.loginStreak - 1) % 7) + 1;
      const reward = DAILY_REWARDS.find(r => r.day === currentDay);

      if (!reward) return;

      let cashReward = 0;
      let diamondReward = 0;

      for (const r of reward.rewards) {
        if (r.type === 'cash') cashReward += r.value;
        if (r.type === 'diamond') diamondReward += r.value;
        if (r.type === 'buff' && r.buffType && r.buffDuration) {
          get().addAdBuff(r.buffType, r.buffDuration, r.value);
        }
      }

      set(s => ({
        cash: s.cash + cashReward,
        totalEarned: s.totalEarned + cashReward,
        diamonds: s.diamonds + diamondReward,
        dailyRewardClaimedDate: today,
      }));
      get().save();
    },

    // === 店长升级 ===
    upgradeManager: (managerId: number) => {
      const state = get();
      if (!state.hiredManagers.includes(managerId)) return false;

      const def = MANAGERS.find(m => m.id === managerId);
      if (!def) return false;

      const currentLevel = state.managerLevels[managerId] ?? 0;
      if (currentLevel >= def.maxLevel) return false;

      const cost = calcManagerUpgradeCost(managerId, currentLevel);
      if (def.upgradeCurrency === 'cash' && state.cash < cost) return false;
      if (def.upgradeCurrency === 'diamond' && state.diamonds < cost) return false;

      set(s => ({
        managerLevels: { ...s.managerLevels, [managerId]: currentLevel + 1 },
        cash: def.upgradeCurrency === 'cash' ? s.cash - cost : s.cash,
        diamonds: def.upgradeCurrency === 'diamond' ? s.diamonds - cost : s.diamonds,
      }));
      get().save();
      return true;
    },

    // === 产线模式切换 ===
    setBusinessMode: (businessId: number, mode: BusinessMode) => {
      set(s => ({
        businessModes: { ...s.businessModes, [businessId]: mode },
      }));
      get().save();
    },

    // === 事件系统 ===
    tickEvents: (deltaSec: number): ActiveGameEvent | null => {
      const state = get();
      const now = Date.now();

      // 更新现有事件的剩余时间
      let updatedEvents = state.activeEvents
        .map(e => ({ ...e, remainingSec: e.remainingSec - deltaSec }))
        .filter(e => e.remainingSec > 0);

      // 发放已完成事件的奖励（累计后一次性set）
      const expiredEvents = state.activeEvents.filter(e => e.remainingSec - deltaSec <= 0);
      let cashReward = 0;
      let diamondReward = 0;
      for (const expired of expiredEvents) {
        const def = GAME_EVENTS.find(ev => ev.id === expired.eventDefId);
        if (def?.reward) {
          if (def.reward.type === 'cash') cashReward += def.reward.value;
          else if (def.reward.type === 'diamond') diamondReward += def.reward.value;
        }
      }

      let newlyTriggered: ActiveGameEvent | null = null;
      let eventCooldownUntil = state.eventCooldownUntil;
      let lastEventCheck = state.lastEventCheck;

      // 尝试触发新事件（每30秒检查一次，概率触发）
      const checkInterval = 30000;
      if (now - state.lastEventCheck >= checkInterval) {
        lastEventCheck = now;
        // 10% 概率触发新事件（每次检查）
        if (Math.random() < 0.10) {
          const newState = { ...state, activeEvents: updatedEvents, lastEventCheck: now };
          const newEvent = tryTriggerEvent(newState);
          if (newEvent) {
            updatedEvents = [...updatedEvents, newEvent];
            newlyTriggered = newEvent;
            const eventDef = GAME_EVENTS.find(evt => evt.id === newEvent.eventDefId);
            eventCooldownUntil = now + (eventDef?.cooldownSec ?? 180) * 1000;
          }
        }
      }

      // 单次set合并所有状态变更
      // 只要有活跃事件就每帧更新（确保倒计时显示实时），否则检查其他变化
      const hasActiveEvents = updatedEvents.length > 0;
      const listChanged = updatedEvents.length !== state.activeEvents.length;
      const metaChanged = lastEventCheck !== state.lastEventCheck
        || eventCooldownUntil !== state.eventCooldownUntil;

      if (hasActiveEvents || listChanged || metaChanged || cashReward > 0 || diamondReward > 0) {
        set(s => ({
          ...(
            cashReward > 0 ? { cash: s.cash + cashReward, totalEarned: s.totalEarned + cashReward } : {}
          ),
          ...(
            diamondReward > 0 ? { diamonds: s.diamonds + diamondReward } : {}
          ),
          activeEvents: updatedEvents,
          eventCooldownUntil,
          lastEventCheck,
        }));
        // 仅在事件列表结构性变化（新增/过期）或有奖励时存档，纯倒计时跳过
        if (listChanged || cashReward > 0 || diamondReward > 0) {
          get().save();
        }
      }

      return newlyTriggered;
    },

    manualProduce: (businessId: number) => {
      set(state => {
        const bsIdx = state.businesses.findIndex(b => b.businessId === businessId);
        if (bsIdx === -1) return state;
        const bs = state.businesses[bsIdx];
        if (bs.quantity <= 0) return state;
        if (bs.progress > 0) return state;

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

      let cost = calcBuyCostWithDiscount(def, currentQty, count, state.purchasedAngelUpgrades);
      // 应用事件成本折扣
      const eventCostMult = calcEventCostReduce(state.activeEvents);
      cost = Math.ceil(cost * eventCostMult);
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
      setTimeout(() => get().checkAchievements(), 100);
      return true;
    },

    buyBusinessUpgrade: (upgradeId: number) => {
      const state = get();
      if (state.purchasedBusinessUpgrades.includes(upgradeId)) return false;

      const def = BUSINESS_UPGRADES.find(u => u.id === upgradeId);
      if (!def) return false;

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

      if (now - state.lastAchievementCheck < 3000) return [];

      const newlyUnlocked = checkAchievementConditions(state);
      if (newlyUnlocked.length === 0) {
        set({ lastAchievementCheck: now });
        return [];
      }

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

      const freshMarket: Record<number, number> = {};
      for (const b of BUSINESSES) freshMarket[b.id] = 1;

      set(s => ({
        cash: 0,
        diamonds: s.diamonds,
        totalEarned: 0,
        prestigePoints: s.prestigePoints + gain,
        totalPrestigeCount: s.totalPrestigeCount + 1,
        businesses: BUSINESSES.map(b => ({
          businessId: b.id,
          quantity: b.id === 1 ? 1 : 0,
          progress: 0,
          hasManager: false,
        })),
        upgrades: GLOBAL_UPGRADES.map(u => ({
          upgradeId: u.id,
          level: 0,
        })),
        hiredManagers: [],
        managerLevels: {}, // 店长等级重置
        adBuffs: [],
        lastOnlineTimestamp: Date.now(),
        tutorialStep: 'none' as TutorialStep,
        totalManualTaps: 0,
        totalPurchases: 0,
        buyMode: s.buyMode,
        purchasedAngelUpgrades: s.purchasedAngelUpgrades,
        purchasedBusinessUpgrades: [],
        unlockedAchievements: s.unlockedAchievements,
        marketMultipliers: freshMarket, // 市场重置
        lastMarketUpdate: Date.now(),
        businessModes: {}, // 模式重置
        activeEvents: [],  // 事件清除
        lastEventCheck: Date.now(),
        eventCooldownUntil: 0,
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

      const angelEffects = calcAngelUpgradeEffects(state.purchasedAngelUpgrades || []);
      const marketMultipliers = state.marketMultipliers || {};
      const managerLevels = state.managerLevels || {};

      const newBusinesses = state.businesses.map(bs => {
        if (bs.quantity <= 0) return { ...bs };
        if (!bs.hasManager && bs.progress <= 0) return { ...bs };

        const def = BUSINESSES.find(b => b.id === bs.businessId);
        if (!def) return { ...bs };

        // 计算实际周期
        const globalEffects = calcGlobalEffects(state.upgrades);
        let cycle = def.baseCycleSec * globalEffects.cycleMultiplier;
        cycle *= calcBusinessUpgradeCycleReduce(bs.businessId, state.purchasedBusinessUpgrades || []);
        cycle *= angelEffects.globalCycleReduce;
        cycle *= calcManagerLevelCycleReduce(bs.businessId, managerLevels, state.hiredManagers);
        const rushBuff = state.adBuffs.find(b => b.type === 'rush_order');
        if (rushBuff) cycle *= 0.2;
        // 利润/速度模式
        const bizMode = state.businessModes?.[bs.businessId];
        if (bizMode === 'speed') cycle *= 0.5;
        if (bizMode === 'profit') cycle *= 1.5;
        // 事件增益（速度类/全能类）
        if (state.activeEvents) {
          for (const evt of state.activeEvents) {
            if (evt.boostType === 'speed_mult' || evt.boostType === 'all_mult') cycle /= evt.boostValue;
          }
        }
        // Task 4: speed_boost buff
        const speedBuff = state.adBuffs.find(b => b.type === 'speed_boost');
        if (speedBuff) cycle /= speedBuff.value;
        cycle = Math.max(0.05, cycle);

        const newProgress = bs.progress + deltaSec / cycle;

        if (newProgress >= 1) {
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
          revenue *= calcManagerLevelProfitMult(bs.businessId, managerLevels, state.hiredManagers);
          if (state.adBuffs.some(b => b.type === 'double_revenue')) revenue *= 2;
          if (rushBuff) revenue *= 3;
          // 市场波动
          revenue *= marketMultipliers[bs.businessId] ?? 1;
          // 利润/速度模式
          if (bizMode === 'profit') revenue *= 1.5;
          if (bizMode === 'speed') revenue *= 0.8;
          // 事件增益（利润类/全能类）
          if (state.activeEvents) {
            for (const evt of state.activeEvents) {
              if (evt.boostType === 'profit_mult' || evt.boostType === 'all_mult') revenue *= evt.boostValue;
            }
          }

          totalEarned += revenue;
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

      // 定期检查成就（每3秒）
      const checkNow = Date.now();
      if (checkNow - state.lastAchievementCheck >= 3000) {
        get().checkAchievements();
      }

      if (state.adBuffs.length > 0) {
        get().tickAdBuffs(deltaSec);
      }

      // 市场波动 tick
      get().tickMarket();

      // 事件系统 tick
      get().tickEvents(deltaSec);

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
