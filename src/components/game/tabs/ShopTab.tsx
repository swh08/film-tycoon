// ============================================================
// 商城Tab — 内购/广告增益/礼包/活动
// ============================================================
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SHOP_OFFERS } from '@/game/config/shop';
import { GAME_EVENTS } from '@/game/config/events';
import { formatCash } from '@/game/formulas';
import { useTranslation } from '@/i18n/useTranslation';
import { usePopup } from '../PopupLayer';
import AssetIcon from '@/components/game/AssetIcon';
import { ShopEventIcon, ShopOfferIcon } from '@/components/game/ShopIcon';

export default function ShopTab() {
  const { t } = useTranslation();
  const {
    cash,
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
  const pendingRewardRef = useRef<{ offerId: number; type: string; value: number } | null>(null);
  const remainingAds = getRemainingAds();
  const adsAvailable = remainingAds > 0;

  const handleAdReward = useCallback((offerId: number, type: string, value: number) => {
    // 用 setTimeout 包裹，避免在渲染期间触发 setState
    setTimeout(() => {
    switch (type) {
      case 'ad_buff_double_revenue':
        addAdBuff('double_revenue', value, 2);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('双倍收益已激活！')}</h3>
              <p className="text-sm text-white/80">{t('4小时内所有产线收益翻倍！')}</p>
            </div>
          ),
        });
        break;

      case 'ad_buff_extra_offline': {
        const bonus = Math.floor(cash * 0.5) + 1000;
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
        addAdBuff('rush_order', value, 3);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('爆单潮来了！')}</h3>
              <p className="text-sm text-white/80">{t('30秒极速生产，所有产线全开！')}</p>
            </div>
          ),
        });
        break;

      // Task 4: 新广告奖励类型
      case 'ad_instant_cash': {
        const instantCash = Math.max(1000, totalEarned * 0.01);
        addCash(instantCash);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('精准投放成功！')}</h3>
              <p className="text-lg text-yellow-200 font-bold">+{formatCash(instantCash)}</p>
              <p className="text-[10px] text-gray-400 mt-1">{t('总收入1%或 1,000 现金，取较高值')}</p>
            </div>
          ),
        });
        break;
      }

      case 'diamond':
        addDiamonds(value);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('获得钻石！')}</h3>
              <p className="text-lg text-cyan-200 font-bold inline-flex items-center justify-center gap-1">
                +{value}
                <AssetIcon id="currency/diamond" size={18} />
              </p>
            </div>
          ),
        });
        break;

      case 'ad_buff_speed':
        addAdBuff('speed_boost', value, 3);
        showPopup({
          id: `ad_reward_${Date.now()}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <ShopOfferIcon offerId={offerId} size={56} className="mb-2" />
              <h3 className="text-xl font-black mb-1">{t('极速生产激活！')}</h3>
              <p className="text-sm text-white/80">{t('60秒内所有产线速度×3！')}</p>
            </div>
          ),
        });
        break;
    }
    }, 0);
  }, [addAdBuff, addCash, addDiamonds, cash, totalEarned, showPopup, t]);

  const handleAdWatch = useCallback((offerId: number, rewardType: string, rewardValue: number) => {
    if (cooldownTimerRef.current) return;
    if (!watchAd()) return;

    setActiveCooldownOfferId(offerId);
    pendingRewardRef.current = { offerId, type: rewardType, value: rewardValue };
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
      const { offerId, type, value } = pendingRewardRef.current;
      pendingRewardRef.current = null;
      queueMicrotask(() => setActiveCooldownOfferId(null));
      handleAdReward(offerId, type, value);
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
    <div className="flex flex-col gap-4 px-3 py-3 pb-4">
      {/* 广告增益区 */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold text-yellow-400 inline-flex items-center gap-1.5">
            <ShopOfferIcon offerId={1} size={18} />
            {t('免费增益（观看广告）')}
          </h2>
          <span className={`text-[10px] font-bold ${adsAvailable ? 'text-green-400' : 'text-red-400'}`}>
            {t('今日剩余')}: {remainingAds}/{dailyAdLimit} {t('次')}
          </span>
        </div>

        {!adsAvailable && (
          <div className="rounded-xl p-3 bg-gray-800/50 mb-2 text-center">
            <ShopOfferIcon offerId={6} size={40} />
            <p className="text-xs text-red-400 font-bold mt-1">{t('今日次数已用完，明天再来！')}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {adOffers.map(offer => {
            const isCountingDown = adCooldown !== null && activeCooldownOfferId === offer.id;
            const isOtherCountingDown = adCooldown !== null && activeCooldownOfferId !== offer.id;

            return (
              <div
                key={offer.id}
                className="rounded-xl p-3 bg-gradient-to-r from-gray-800 to-gray-900 shadow-md shadow-green-900/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <ShopOfferIcon offerId={offer.id} alt={t(offer.name)} size={34} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{t(offer.name)}</h3>
                    <p className="text-[10px] text-gray-400">{t(offer.description)}</p>
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
                        <p className="text-[9px] text-green-400 mt-0.5 inline-flex items-center gap-1">
                          <ShopOfferIcon offerId={offer.id} size={12} />
                          {t('观看中...')} {adCooldown}s
                        </p>
                      </div>
                    )}
                  </div>
                  {isCountingDown ? (
                    <div className="px-3 py-2 rounded-lg bg-green-800/40 text-green-300 text-xs font-bold animate-pulse flex-shrink-0 inline-flex items-center gap-1">
                      <ShopOfferIcon offerId={offer.id} size={14} />
                      ...
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdWatch(offer.id, offer.rewards[0].type, offer.rewards[0].value)}
                      disabled={!adsAvailable || isOtherCountingDown}
                      className={`px-3 py-3 rounded-xl text-xs font-bold transition-all duration-150 inline-flex items-center gap-1.5
                        ${!adsAvailable || isOtherCountingDown
                          ? 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.3)]'
                          : 'bg-gradient-to-b from-green-400 to-green-600 text-white shadow-[0_3px_0_0_#166534,0_4px_8px_rgba(21,128,61,0.3)] active:shadow-[0_1px_0_0_#166534,0_2px_4px_rgba(21,128,61,0.2)] active:translate-y-[2px]'
                        }`}
                    >
                      <ShopOfferIcon offerId={offer.id} size={14} />
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
        <h2 className="text-sm font-bold text-yellow-400 mb-2 px-1 inline-flex items-center gap-1.5">
          <ShopOfferIcon offerId={8} size={18} />
          {t('免费礼包')}
        </h2>
        <div className="flex flex-col gap-2">
          {SHOP_OFFERS.filter(o => o.id === 8).map(offer => {
            const purchased = isPurchased(offer.id);
            return (
              <div
                key={offer.id}
                className={`rounded-xl p-3 transition-all
                  ${purchased
                    ? 'bg-gray-900/30 opacity-50'
                    : 'bg-gradient-to-r from-amber-900/30 to-yellow-900/20'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <ShopOfferIcon offerId={offer.id} alt={t(offer.name)} size={34} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{t(offer.name)}</h3>
                    <p className="text-[10px] text-gray-400">{t(offer.description)}</p>
                    <div className="flex gap-1 mt-1">
                      {offer.rewards.map((r, i) => (
                        <span key={i} className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                          {t(r.label)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!purchased && (
                    <button
                      onClick={() => handleFreeOffer(offer.id, offer.rewards)}
                      className="px-3 py-3 rounded-xl bg-gradient-to-b from-yellow-300 to-amber-600 
                                 text-white text-xs font-bold transition-all duration-150 shadow-[0_3px_0_0_#92400e,0_4px_8px_rgba(120,53,15,0.3)] active:shadow-[0_1px_0_0_#92400e,0_2px_4px_rgba(120,53,15,0.2)] active:translate-y-[2px]"
                    >
                      {t('免费领取')}
                    </button>
                  )}
                  {purchased && (
                    <span className="text-xs text-gray-500">{t('已领取')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 钻石内购区 */}
      <div>
        <h2 className="text-sm font-bold text-yellow-400 mb-2 px-1 inline-flex items-center gap-1.5">
          <ShopOfferIcon offerId={5} size={18} />
          {t('钻石商店')}
        </h2>
        <div className="flex flex-col gap-2">
          {SHOP_OFFERS.filter(o => o.id >= 4 && o.id <= 7).map(offer => {
            const purchased = isPurchased(offer.id);
            return (
              <div
                key={offer.id}
                className={`rounded-xl p-3 transition-all
                  ${purchased
                    ? 'bg-gray-900/30 opacity-50'
                    : 'bg-gradient-to-r from-cyan-900/20 to-blue-900/20'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                    <ShopOfferIcon offerId={offer.id} alt={t(offer.name)} size={34} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{t(offer.name)}</h3>
                      {offer.oneTime && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                          {t('限时')}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">{t(offer.description)}</p>
                    <div className="flex gap-1 mt-1">
                      {offer.rewards.map((r, i) => (
                        <span key={i} className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
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
                      className="px-3 py-3 rounded-xl bg-gradient-to-b from-cyan-300 to-blue-600 
                                 text-white text-xs font-bold transition-all duration-150 shadow-[0_3px_0_0_#1e3a5f,0_4px_8px_rgba(30,58,95,0.3)] active:shadow-[0_1px_0_0_#1e3a5f,0_2px_4px_rgba(30,58,95,0.2)] active:translate-y-[2px]"
                    >
                      <AssetIcon id="currency/coin" size={14} className="mr-1 align-[-2px]" />
                      {offer.cost}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">{t('已购买')}</span>
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
          <h2 className="text-sm font-bold text-purple-400 mb-2 px-1 inline-flex items-center gap-1.5">
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
                  className="rounded-xl p-3 bg-gradient-to-r from-purple-900/50 to-pink-900/30 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                      <ShopEventIcon eventId={evt.eventDefId} alt={t(eventDef?.name ?? evt.name)} size={34} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">{t(eventDef?.name ?? evt.name)}</h3>
                        <span className="text-[10px] font-bold text-purple-300">{boostText}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{t(eventDef?.description ?? evt.description)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-purple-300 inline-flex items-center gap-0.5">
                          <AssetIcon id="boost/timer" size={10} />
                          {Math.ceil(evt.remainingSec)}{t('秒')}
                        </span>
                        {evt.reward && (
                          <span className="text-[9px] text-green-400">
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
        <h2 className="text-sm font-bold text-yellow-400 mb-2 px-1 inline-flex items-center gap-1.5">
          <ShopEventIcon eventId={8} size={18} />
          {t('随机事件系统')}
        </h2>
        <p className="text-[10px] text-gray-500 mb-2 px-1">{t('随机事件会自动触发，为你带来临时增益！')}</p>
        <div className="flex flex-col gap-2">
          {GAME_EVENTS.map(event => {
            const unlocked = totalEarned >= event.minTotalEarned;
            const isActive = activeEvents?.some(e => e.eventDefId === event.id);

            return (
              <div
                key={event.id}
                className={`rounded-xl p-3 transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/30'
                    : unlocked
                      ? 'bg-gradient-to-r from-gray-800 to-gray-900'
                      : 'bg-gray-900/30 opacity-40'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <ShopEventIcon eventId={event.id} alt={t(event.name)} size={34} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{t(event.name)}</h3>
                      <div className="flex items-center gap-1">
                        {isActive && (
                          <span className="text-[9px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded font-bold">{t('进行中')}</span>
                        )}
                        <span className={`text-[10px] font-bold ${
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
                    <p className="text-[10px] text-gray-400 mt-0.5">{t(event.description)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-500 inline-flex items-center gap-0.5">
                        <AssetIcon id="boost/timer" size={10} />
                        {event.durationSec}{t('秒')}
                      </span>
                      {event.reward && (
                        <span className="text-[9px] text-green-400">
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
