import { describe, expect, test } from 'bun:test';

import { createInitialState } from '@/store/gameStore';
import { BUSINESSES } from './config/businesses';
import { GLOBAL_UPGRADES } from './config/upgrades';
import { BUSINESS_UPGRADES } from './config/business-upgrades';
import { MANAGERS } from './config/managers';
import { SHOP_OFFERS } from './config/shop';
import { GAME_EVENTS } from './config/events';
import { PRESTIGE_RULE } from './config/prestige';
import {
  calcBuyCostWithDiscount,
  calcBusinessUpgradeProfitMult,
  calcBusinessUpgradeCycleReduce,
  calcCycleTime,
  calcGlobalEffects,
  calcMaxBuyable,
  calcRevenuePerCycle,
  calcRevenuePerSecond,
  calcUpgradeCost,
} from './formulas';
import type { GameState } from './types';

const FIRST_PRESTIGE_MIN_SEC = 45 * 60;
const FIRST_PRESTIGE_MAX_SEC = 60 * 60;
const STARTER_GIFT_MIN_SEC = 40 * 60;

function cloneState(state: GameState): GameState {
  return {
    ...state,
    businesses: state.businesses.map(b => ({ ...b })),
    upgrades: state.upgrades.map(u => ({ ...u })),
    hiredManagers: [...state.hiredManagers],
    adBuffs: [...state.adBuffs],
    purchasedAngelUpgrades: [...state.purchasedAngelUpgrades],
    purchasedBusinessUpgrades: [...state.purchasedBusinessUpgrades],
    unlockedAchievements: [...state.unlockedAchievements],
    marketMultipliers: { ...state.marketMultipliers },
    managerLevels: { ...state.managerLevels },
    businessModes: { ...state.businessModes },
    activeEvents: state.activeEvents.map(e => ({ ...e })),
    purchasedOffers: [...state.purchasedOffers],
  };
}

function createBalancedTestState(starterCash = 0): GameState {
  const state = createInitialState();
  state.cash = starterCash;
  state.totalEarned = 0;
  state.diamonds = 0;
  state.adBuffs = [];
  state.activeEvents = [];
  state.purchasedAngelUpgrades = [];
  state.purchasedBusinessUpgrades = [];
  state.hiredManagers = [];
  state.managerLevels = {};
  state.upgrades = GLOBAL_UPGRADES.map(upgrade => ({ upgradeId: upgrade.id, level: 0 }));
  state.marketMultipliers = Object.fromEntries(BUSINESSES.map(business => [business.id, 1]));
  return state;
}

function isUnlocked(businessId: number, state: GameState): boolean {
  const def = BUSINESSES.find(b => b.id === businessId);
  if (!def) return false;
  if (def.id === 1) return true;

  switch (def.unlockRule.type) {
    case 'total_earned':
      return state.totalEarned >= def.unlockRule.value;
    case 'prestige_count':
      return state.totalPrestigeCount >= def.unlockRule.value;
    default:
      return true;
  }
}

function activeIncomePerSecond(state: GameState): number {
  return state.businesses.reduce((total, businessState) => {
    if (businessState.quantity <= 0) return total;
    const def = BUSINESSES.find(b => b.id === businessState.businessId);
    if (!def) return total;
    return total + calcRevenuePerSecond(def, businessState.quantity, state, state.adBuffs);
  }, 0);
}

function buyBestPayback(state: GameState): boolean {
  const before = activeIncomePerSecond(state);
  let best: { type: 'business' | 'global' | 'businessUpgrade'; id: number; cost: number; score: number } | null = null;

  for (const def of BUSINESSES) {
    if (!isUnlocked(def.id, state)) continue;
    const businessState = state.businesses.find(b => b.businessId === def.id);
    if (!businessState) continue;

    const cost = calcBuyCostWithDiscount(def, businessState.quantity, 1, state.purchasedAngelUpgrades);
    if (cost > state.cash) continue;

    const next = cloneState(state);
    next.businesses.find(b => b.businessId === def.id)!.quantity += 1;
    const gain = activeIncomePerSecond(next) - before;
    if (gain <= 0) continue;

    const score = cost / gain;
    if (!best || score < best.score) best = { type: 'business', id: def.id, cost, score };
  }

  for (const def of GLOBAL_UPGRADES.filter(upgrade => upgrade.currency === 'cash')) {
    const upgradeState = state.upgrades.find(u => u.upgradeId === def.id);
    if (!upgradeState || upgradeState.level >= def.maxLevel) continue;

    const cost = calcUpgradeCost(def.id, upgradeState.level);
    if (cost > state.cash) continue;

    const next = cloneState(state);
    next.upgrades.find(u => u.upgradeId === def.id)!.level += 1;
    const gain = activeIncomePerSecond(next) - before;
    if (gain <= 0) continue;

    const score = cost / gain;
    if (!best || score < best.score) best = { type: 'global', id: def.id, cost, score };
  }

  for (const def of BUSINESS_UPGRADES) {
    if (state.purchasedBusinessUpgrades.includes(def.id)) continue;
    const businessState = state.businesses.find(b => b.businessId === def.businessId);
    if (!businessState || businessState.quantity < def.unlockQuantity || def.cost > state.cash) continue;

    const next = cloneState(state);
    next.purchasedBusinessUpgrades.push(def.id);
    const gain = activeIncomePerSecond(next) - before;
    if (gain <= 0) continue;

    const score = def.cost / gain;
    if (!best || score < best.score) best = { type: 'businessUpgrade', id: def.id, cost: def.cost, score };
  }

  if (!best) return false;

  state.cash -= best.cost;
  if (best.type === 'business') {
    state.businesses.find(b => b.businessId === best.id)!.quantity += 1;
  } else if (best.type === 'global') {
    state.upgrades.find(u => u.upgradeId === best.id)!.level += 1;
  } else {
    state.purchasedBusinessUpgrades.push(best.id);
  }
  return true;
}

function hireAffordableManagers(state: GameState) {
  for (const manager of MANAGERS.filter(m => m.businessId > 0 && m.currency === 'cash')) {
    if (state.hiredManagers.includes(manager.id)) continue;
    const businessState = state.businesses.find(b => b.businessId === manager.businessId);
    if (!businessState || businessState.quantity <= 0 || state.cash < manager.unlockCost) continue;

    state.cash -= manager.unlockCost;
    state.hiredManagers.push(manager.id);
    businessState.hasManager = true;
    businessState.managerId = manager.id;
  }
}

function tickActivePlay(state: GameState, deltaSec: number) {
  let earned = 0;

  for (const businessState of state.businesses) {
    if (businessState.quantity <= 0) continue;
    if (!businessState.hasManager && businessState.progress <= 0) businessState.progress = 0.001;

    const def = BUSINESSES.find(b => b.id === businessState.businessId);
    if (!def) continue;

    businessState.progress += deltaSec / calcCycleTime(def, state, state.adBuffs);
    if (businessState.progress >= 1) {
      earned += calcRevenuePerCycle(def, businessState.quantity, state, state.adBuffs);
      businessState.progress = businessState.hasManager ? 0.001 : 0;
    }
  }

  state.cash += earned;
  state.totalEarned += earned;
}

function simulateFirstPrestige(starterCash = 0): number {
  const state = createBalancedTestState(starterCash);
  const deltaSec = 0.1;
  let nextPurchaseAt = 0;

  for (let elapsed = 0; elapsed <= FIRST_PRESTIGE_MAX_SEC + 900; elapsed += deltaSec) {
    tickActivePlay(state, deltaSec);

    if (elapsed >= nextPurchaseAt) {
      let guard = 0;
      while (buyBestPayback(state) && guard++ < 500) {}
      hireAffordableManagers(state);
      nextPurchaseAt = elapsed + 0.5;
    }

    if (state.totalEarned >= PRESTIGE_RULE.unlockCondition.value) {
      return elapsed;
    }
  }

  return Infinity;
}

describe('economy balance', () => {
  test('new saves start with a runnable first business and no cash windfall', () => {
    const state = createInitialState();
    expect(state.cash).toBe(0);
    expect(state.businesses.find(b => b.businessId === 1)?.quantity).toBe(1);
  });

  test('active no-ad first prestige lands in the target 45-60 minute window', () => {
    const elapsed = simulateFirstPrestige();
    expect(elapsed).toBeGreaterThanOrEqual(FIRST_PRESTIGE_MIN_SEC);
    expect(elapsed).toBeLessThanOrEqual(FIRST_PRESTIGE_MAX_SEC);
  });

  test('starter gift does not collapse first prestige below 40 minutes', () => {
    const elapsed = simulateFirstPrestige(100);
    expect(elapsed).toBeGreaterThanOrEqual(STARTER_GIFT_MIN_SEC);
  });

  test('single ad and event boosts stay below their balance caps', () => {
    const adRevenueBoost = SHOP_OFFERS
      .flatMap(offer => offer.rewards)
      .filter(reward => reward.type === 'ad_buff_double_revenue')
      .reduce((max, reward) => Math.max(max, reward.multiplier ?? reward.value), 1);
    const adSpeedBoost = SHOP_OFFERS
      .flatMap(offer => offer.rewards)
      .filter(reward => reward.type === 'ad_buff_rush_order' || reward.type === 'ad_buff_speed')
      .reduce((max, reward) => Math.max(max, reward.multiplier ?? 1), 1);
    const maxProfitEvent = Math.max(...GAME_EVENTS.filter(event => event.boostType === 'profit_mult').map(event => event.boostValue));
    const maxAllEvent = Math.max(...GAME_EVENTS.filter(event => event.boostType === 'all_mult').map(event => event.boostValue));

    expect(adRevenueBoost).toBeLessThanOrEqual(1.5);
    expect(adSpeedBoost).toBeLessThanOrEqual(3);
    expect(maxProfitEvent).toBeLessThanOrEqual(2.5);
    expect(maxAllEvent).toBeLessThanOrEqual(2);
  });

  test('business upgrade effects match the intended templates', () => {
    expect(calcBusinessUpgradeProfitMult(1, [101, 102])).toBe(3);
    expect(calcBusinessUpgradeCycleReduce(1, [103])).toBeCloseTo(0.85);
    expect(calcGlobalEffects(createBalancedTestState().upgrades).cycleMultiplier).toBe(1);
    expect(calcMaxBuyable(BUSINESSES[0], 0, 0)).toBe(0);
  });
});
