// ============================================================
// 商城Tab — 内购/广告增益/礼包/活动
// ============================================================
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SHOP_OFFERS } from '@/game/config/shop';
import { GAME_EVENTS } from '@/game/config/events';
import { calcTotalIncomePerSecond, formatCash } from '@/game/formulas';
import type { OfferRewardDef } from '@/game/types';
import { useTranslation } from '@/i18n/useTranslation';
import { usePopup } from '../PopupLayer';
import AssetIcon from '@/components/game/AssetIcon';
import { ShopEventIcon, ShopOfferIcon } from '@/components/game/ShopIcon';

const SHOP_CARD_CLASS = 'business-card-frame-4x1-bg relative overflow-hidden p-4 transition-all';
const SHOP_GOLD_BUTTON_CLASS = 'rounded-xl border border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950 shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(120,53,15,.9),0_4px_8px_rgba(0,0,0,.25)]';
const SHOP_CYAN_BUTTON_CLASS = 'rounded-xl border border-cyan-100/70 bg-[linear-gradient(180deg,#67e8f9,#2563eb)] text-white shadow-[0_5px_0_rgba(30,64,175,.95),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(30,64,175,.95),0_4px_8px_rgba(0,0,0,.25)]';
const SHOP_DISABLED_BUTTON_CLASS = 'rounded-xl border border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-300 shadow-none';

export default function ShopTab() {
  const { t } = useTranslation();
  const {
    diamonds,
    purchasedOffers,
    addAdBuff,
    markOfferPurchased,
    addCash,
    addDiamonds,
    totalEarned,
    totalPrestigeCount,
    watchAd,
    getRemainingAds,
    dailyAdLimit,
    activeEvents,
  } = useGameStore();

  const { showPopup } = usePopup();
  const [adCooldown, setAdCooldown] = useState<number | null>(null);
  const [activeCooldownOfferId, setActiveCooldownOfferId] = useState<number | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingRewardRef = useRef<{ offerId: number; reward: OfferRewardDef } | null>(null);
  const remainingAds = getRemainingAds();
  const adsAvailable = remainingAds > 0;

  const handleAdReward = useCallback((offerId: number, reward: OfferRewardDef) => {
    // 用 setTimeout 包裹，避免在渲染期间触发 setState
    setTimeout(() => {
    switch (reward.type) {
      case 'ad_buff_double_revenue':
        addAdBuff('double_revenue', reward.value, reward.multiplier ?? 1.5);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('收益增益已激活！')}</h3>
              <p className="text-sm text-white/80">{t('10分钟内所有产线收益提升50%！')}</p>
            </div>
          ),
        });
        break;

      case 'ad_buff_extra_offline': {
        const state = useGameStore.getState();
        const passiveSeconds = reward.maxPassiveSeconds ?? 600;
        const passiveValue = calcTotalIncomePerSecond(state, state.adBuffs) * passiveSeconds;
        const bonus = Math.floor(Math.max(reward.minValue ?? 500, passiveValue));
        addCash(bonus);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('额外离线收益！')}</h3>
              <p className="text-lg text-yellow-200 font-bold">+{formatCash(bonus)}</p>
            </div>
          ),
        });
        break;
      }

      case 'ad_buff_rush_order':
        addAdBuff('rush_order', reward.value, reward.multiplier ?? 3);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('爆单潮来了！')}</h3>
              <p className="text-sm text-white/80">{t('20秒极速生产，所有产线全开！')}</p>
            </div>
          ),
        });
        break;

      // Task 4: 新广告奖励类型
      case 'ad_instant_cash': {
        const instantCash = Math.max(reward.minValue ?? 500, totalEarned * (reward.percentOfTotalEarned ?? 0.002));
        addCash(instantCash);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('精准投放成功！')}</h3>
              <p className="text-lg text-yellow-200 font-bold">+{formatCash(instantCash)}</p>
              <p className="mt-1 text-xs font-bold text-stone-300">{t('总收入0.2%或 500 现金，取较高值')}</p>
            </div>
          ),
        });
        break;
      }

      case 'diamond':
        addDiamonds(reward.value);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('获得钻石！')}</h3>
              <p className="text-lg text-cyan-200 font-bold inline-flex items-center justify-center gap-1">
                +{reward.value}
                <AssetIcon id="currency/diamond" size={18} />
              </p>
            </div>
          ),
        });
        break;

      case 'ad_buff_speed':
        addAdBuff('speed_boost', reward.value, reward.multiplier ?? 2);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('极速生产激活！')}</h3>
              <p className="text-sm text-white/80">{t('45秒内所有产线速度×2！')}</p>
            </div>
          ),
        });
        break;
    }
    }, 0);
  }, [addAdBuff, addCash, addDiamonds, totalEarned, showPopup, t]);

  const handleAdWatch = useCallback((offerId: number, reward: OfferRewardDef) => {
    if (cooldownTimerRef.current) return;
    if (!watchAd()) return;

    setActiveCooldownOfferId(offerId);
    pendingRewardRef.current = { offerId, reward };
    setAdCooldown(3);

    cooldownTimerRef.current = setInterval(() => {
      setAdCooldown(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [watchAd]);

  // 当倒计时结束（adCooldown 从有值变为 null）时发放奖励
  useEffect(() => {
    if (adCooldown === null && pendingRewardRef.current) {
      const { offerId, reward } = pendingRewardRef.current;
      pendingRewardRef.current = null;
      queueMicrotask(() => setActiveCooldownOfferId(null));
      handleAdReward(offerId, reward);
    }
  }, [adCooldown, handleAdReward]);

  const handleFreeOffer = (offerId: number, rewards: any[]) => {
    rewards.forEach(r => {
      if (r.type === 'cash') addCash(r.value);
      if (r.type === 'diamond') addDiamonds(r.value);
    });
    markOfferPurchased(offerId);

    showPopup({
      id: `offer_${offerId}`,
      type: 'reward',
      content: (
        <div className="text-center">
          <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
          <h3 className="text-xl font-black mb-2">{t('领取成功！')}</h3>
          {rewards.map((r, i) => (
            <p key={i} className="text-lg text-yellow-200 font-bold">+{t(r.label)}</p>
          ))}
        </div>
      ),
    });
  };

  const isPurchased = (offerId: number) => purchasedOffers.includes(offerId);

  // Ad offers (IDs 1-3 and 10-12)
  const adOffers = SHOP_OFFERS.filter(o => [1, 2, 3, 10, 11, 12].includes(o.id));

  return (
    <div className="film-game-screen business-content-frame-bg flex flex-col gap-4 px-5 py-5 pb-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[2rem] font-black leading-none tracking-normal text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">
          {t('商城')}
        </h1>
        <div className={`flex-shrink-0 rounded-lg border px-2.5 py-1 text-xs font-black tabular-nums ${
          adsAvailable
            ? 'border-emerald-300/35 bg-black/35 text-emerald-200'
            : 'border-red-300/35 bg-black/35 text-red-200'
        }`}>
          {t('今日剩余')}: {remainingAds}/{dailyAdLimit}
        </div>
      </div>

      {/* 广告增益区 */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="inline-flex items-center gap-1.5 text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
            <ShopOfferIcon offerId={1} size={18} />
            {t('免费增益（观看广告）')}
          </h2>
          <span className={`text-xs font-black ${adsAvailable ? 'text-emerald-300' : 'text-red-300'}`}>
            {t('今日剩余')}: {remainingAds}/{dailyAdLimit} {t('次')}
          </span>
        </div>

        {!adsAvailable && (
          <div className={`${SHOP_CARD_CLASS} mb-2 text-center opacity-85`}>
            <ShopOfferIcon offerId={6} size={40} />
            <p className="mt-1 text-xs font-black text-red-300">{t('今日次数已用完，明天再来！')}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {adOffers.map(offer => {
            const isCountingDown = adCooldown !== null && activeCooldownOfferId === offer.id;
            const isOtherCountingDown = adCooldown !== null && activeCooldownOfferId !== offer.id;

            return (
              <div
                key={offer.id}
                className={`${SHOP_CARD_CLASS} shadow-md shadow-green-900/10`}
              >
                <div className="grid grid-cols-[72px_minmax(0,1fr)_104px] items-center gap-3">
                  <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center">
                    <ShopOfferIcon offerId={offer.id} alt={t(offer.name)} size={62} className="drop-shadow-[0_12px_12px_rgba(0,0,0,.5)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-black leading-tight text-amber-100">{t(offer.name)}</h3>
                    <p className="text-xs font-bold leading-snug text-stone-300">{t(offer.description)}</p>
                    {isCountingDown && (
                      <div className="mt-1.5">
                        <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((3 - (adCooldown ?? 0)) / 3) * 100}%` }}
                            transition={{ duration: 1, ease: 'linear' }}
                          />
                        </div>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-black text-emerald-300">
                          <ShopOfferIcon offerId={offer.id} size={12} />
                          {t('观看中...')} {adCooldown}s
                        </p>
                      </div>
                    )}
                  </div>
                  {isCountingDown ? (
                    <div className="grid min-h-14 place-items-center rounded-xl border border-emerald-200/45 bg-[linear-gradient(180deg,#34d399,#15803d)] px-2 text-xs font-black text-white shadow-[0_5px_0_#166534,0_8px_16px_rgba(0,0,0,.28)] animate-pulse">
                      <ShopOfferIcon offerId={offer.id} size={14} />
                      ...
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdWatch(offer.id, offer.rewards[0])}
                      disabled={!adsAvailable || isOtherCountingDown}
                      className={`min-h-14 px-2 py-1.5 text-xs font-black transition-all duration-150
                        ${!adsAvailable || isOtherCountingDown
                          ? SHOP_DISABLED_BUTTON_CLASS
                          : SHOP_GOLD_BUTTON_CLASS
                        }`}
                    >
                      {t('免费领取')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 免费礼包 */}
      <div>
        <h2 className="mb-2 inline-flex items-center gap-1.5 px-1 text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
          <ShopOfferIcon offerId={8} size={18} />
          {t('免费礼包')}
        </h2>
        <div className="flex flex-col gap-2">
          {SHOP_OFFERS.filter(o => o.id === 8).map(offer => {
            const purchased = isPurchased(offer.id);
            return (
              <div
                key={offer.id}
                className={`${SHOP_CARD_CLASS} ${purchased ? 'opacity-50 grayscale-[25%]' : ''}`}
              >
                <div className="grid grid-cols-[72px_minmax(0,1fr)_104px] items-center gap-3">
                  <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center">
                    <ShopOfferIcon offerId={offer.id} alt={t(offer.name)} size={62} className="drop-shadow-[0_12px_12px_rgba(0,0,0,.5)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[15px] font-black leading-tight text-amber-100">{t(offer.name)}</h3>
                    <p className="text-xs font-bold leading-snug text-stone-300">{t(offer.description)}</p>
                    <div className="flex gap-1 mt-1">
                      {offer.rewards.map((r, i) => (
                        <span key={i} className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-[11px] font-black text-yellow-300">
                          {t(r.label)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!purchased && (
                    <button
                      onClick={() => handleFreeOffer(offer.id, offer.rewards)}
                      className={`min-h-14 px-2 py-1.5 text-xs font-black transition-all duration-150 ${SHOP_GOLD_BUTTON_CLASS}`}
                    >
                      {t('免费领取')}
                    </button>
                  )}
                  {purchased && (
                    <span className="rounded-lg border border-stone-400/25 bg-black/35 px-2 py-2 text-center text-xs font-black text-stone-300">{t('已领取')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 钻石内购区 */}
      <div>
        <h2 className="mb-2 inline-flex items-center gap-1.5 px-1 text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
          <ShopOfferIcon offerId={5} size={18} />
          {t('钻石商店')}
        </h2>
        <div className="flex flex-col gap-2">
          {SHOP_OFFERS.filter(o => o.id >= 4 && o.id <= 7).map(offer => {
            const purchased = isPurchased(offer.id);
            return (
              <div
                key={offer.id}
                className={`${SHOP_CARD_CLASS} ${purchased ? 'opacity-50 grayscale-[25%]' : ''}`}
              >
                <div className="grid grid-cols-[72px_minmax(0,1fr)_104px] items-center gap-3">
                  <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center">
                    <ShopOfferIcon offerId={offer.id} alt={t(offer.name)} size={62} className="drop-shadow-[0_12px_12px_rgba(0,0,0,.5)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-black leading-tight text-amber-100">{t(offer.name)}</h3>
                      {offer.oneTime && (
                        <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[11px] font-black text-red-300">
                          {t('限时')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold leading-snug text-stone-300">{t(offer.description)}</p>
                    <div className="flex gap-1 mt-1">
                      {offer.rewards.map((r, i) => (
                        <span key={i} className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[11px] font-black text-cyan-300">
                          {t(r.label)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!purchased ? (
                    <button
                      onClick={() => {
                        // 模拟内购成功
                        handleFreeOffer(offer.id, offer.rewards);
                      }}
                      className={`min-h-14 px-2 py-1.5 text-xs font-black transition-all duration-150 ${SHOP_CYAN_BUTTON_CLASS}`}
                    >
                      <AssetIcon id="currency/coin" size={14} className="mr-1 align-[-2px]" />
                      {offer.cost}
                    </button>
                  ) : (
                    <span className="rounded-lg border border-stone-400/25 bg-black/35 px-2 py-2 text-center text-xs font-black text-stone-300">{t('已购买')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 限时活动 — 当前激活事件 */}
      {activeEvents && activeEvents.length > 0 && (
        <div>
          <h2 className="mb-2 inline-flex items-center gap-1.5 px-1 text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
            <ShopEventIcon eventId={activeEvents[0]?.eventDefId ?? 1} size={18} />
            {t('当前激活事件')}
          </h2>
          <div className="flex flex-col gap-2">
            {activeEvents.map(evt => {
              const eventDef = GAME_EVENTS.find(event => event.id === evt.eventDefId);
              const boostText = evt.boostType === 'profit_mult' ? `${t('利润')}×${evt.boostValue}` :
                evt.boostType === 'speed_mult' ? `${t('速度')}×${evt.boostValue}` :
                evt.boostType === 'all_mult' ? `${t('全属性')}×${evt.boostValue}` :
                `${t('成本')}${Math.round(evt.boostValue * 100)}%`;
              return (
                <div
                  key={evt.id}
                  className={`${SHOP_CARD_CLASS} animate-pulse`}
                >
                  <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
                    <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center">
                      <ShopEventIcon eventId={evt.eventDefId} alt={t(eventDef?.name ?? evt.name)} size={62} className="drop-shadow-[0_12px_12px_rgba(0,0,0,.5)]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-black leading-tight text-amber-100">{t(eventDef?.name ?? evt.name)}</h3>
                        <span className="text-[11px] font-black text-purple-300">{boostText}</span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold leading-snug text-stone-300">{t(eventDef?.description ?? evt.description)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-purple-300">
                          <AssetIcon id="boost/timer" size={10} />
                          {Math.ceil(evt.remainingSec)}{t('秒')}
                        </span>
                        {evt.reward && (
                          <span className="text-[11px] font-black text-emerald-300">
                            <ShopOfferIcon offerId={8} size={12} className="mr-1 align-[-2px]" />
                            {evt.reward.type === 'cash' ? formatCash(evt.reward.value) : evt.reward.value}
                            {evt.reward.type === 'diamond' && <AssetIcon id="currency/diamond" size={11} className="ml-0.5 align-[-1px]" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 随机事件目录 */}
      <div>
        <h2 className="mb-2 inline-flex items-center gap-1.5 px-1 text-sm font-black text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
          <ShopEventIcon eventId={8} size={18} />
          {t('随机事件系统')}
        </h2>
        <p className="mb-2 px-1 text-xs font-bold leading-snug text-stone-300">{t('随机事件会自动触发，为你带来临时增益！')}</p>
        <div className="flex flex-col gap-2">
          {GAME_EVENTS.map(event => {
            const unlocked = totalEarned >= event.minTotalEarned;
            const isActive = activeEvents?.some(e => e.eventDefId === event.id);

            return (
              <div
                key={event.id}
                className={`${SHOP_CARD_CLASS}
                  ${isActive
                    ? 'animate-pulse'
                    : unlocked
                      ? ''
                      : 'opacity-40 grayscale-[35%]'
                  }`}
              >
                <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-3">
                  <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center">
                    <ShopEventIcon eventId={event.id} alt={t(event.name)} size={62} className="drop-shadow-[0_12px_12px_rgba(0,0,0,.5)]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[15px] font-black leading-tight text-amber-100">{t(event.name)}</h3>
                      <div className="flex items-center gap-1">
                        {isActive && (
                          <span className="rounded bg-purple-500/30 px-1.5 py-0.5 text-[11px] font-black text-purple-300">{t('进行中')}</span>
                        )}
                        <span className={`text-[11px] font-black ${
                          event.boostType === 'profit_mult' || event.boostType === 'all_mult'
                            ? 'text-yellow-400' : event.boostType === 'speed_mult' ? 'text-cyan-400' : 'text-green-400'
                        }`}>{
                          event.boostType === 'profit_mult' ? `${t('利润')}×${event.boostValue}` :
                          event.boostType === 'speed_mult' ? `${t('速度')}×${event.boostValue}` :
                          event.boostType === 'all_mult' ? `${t('全属性')}×${event.boostValue}` :
                          `${t('成本')}${Math.round(event.boostValue*100)}%`
                        }</span>
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs font-bold leading-snug text-stone-300">{t(event.description)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-stone-400">
                        <AssetIcon id="boost/timer" size={10} />
                        {event.durationSec}{t('秒')}
                      </span>
                      {event.reward && (
                        <span className="text-[11px] font-black text-emerald-300">
                          <ShopOfferIcon offerId={8} size={12} className="mr-1 align-[-2px]" />
                          {event.reward.type === 'cash' ? formatCash(event.reward.value) : event.reward.value}
                          {event.reward.type === 'diamond' && <AssetIcon id="currency/diamond" size={11} className="ml-0.5 align-[-1px]" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
