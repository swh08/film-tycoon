// ============================================================
// 商城Tab — 内购/广告增益/礼包/活动
// ============================================================
'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { SHOP_OFFERS } from '@/game/config/shop';
import { GAME_EVENTS } from '@/game/config/events';
import { formatCash } from '@/game/formulas';
import { usePopup } from '../PopupLayer';

export default function ShopTab() {
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
  } = useGameStore();

  const { showPopup } = usePopup();
  const [adWatchCount, setAdWatchCount] = useState(0);

  const handleAdReward = (offerId: number, type: string, value: number) => {
    // 模拟观看广告
    setAdWatchCount(prev => prev + 1);

    switch (type) {
      case 'ad_buff_double_revenue':
        addAdBuff('double_revenue', value, 2);
        showPopup({
          id: `ad_reward_${adWatchCount}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <h3 className="text-xl font-black mb-1">双倍收益已激活！</h3>
              <p className="text-sm text-white/80">4小时内所有产线收益翻倍！</p>
            </div>
          ),
        });
        break;

      case 'ad_buff_extra_offline':
        // 直接给予离线奖励模拟
        const bonus = Math.floor(cash * 0.5) + 1000;
        addCash(bonus);
        showPopup({
          id: `ad_reward_${adWatchCount}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <div className="text-4xl mb-2">⏰</div>
              <h3 className="text-xl font-black mb-1">额外离线收益！</h3>
              <p className="text-lg text-yellow-200 font-bold">+{formatCash(bonus)}</p>
            </div>
          ),
        });
        break;

      case 'ad_buff_rush_order':
        addAdBuff('rush_order', value, 3);
        showPopup({
          id: `ad_reward_${adWatchCount}`,
          type: 'reward',
          content: (
            <div className="text-center">
              <div className="text-4xl mb-2">🚀</div>
              <h3 className="text-xl font-black mb-1">爆单潮来了！</h3>
              <p className="text-sm text-white/80">30秒极速生产，所有产线全开！</p>
            </div>
          ),
        });
        break;
    }
  };

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
          <div className="text-4xl mb-2">🎁</div>
          <h3 className="text-xl font-black mb-2">领取成功！</h3>
          {rewards.map((r, i) => (
            <p key={i} className="text-lg text-yellow-200 font-bold">+{r.label}</p>
          ))}
        </div>
      ),
    });
  };

  const isPurchased = (offerId: number) => purchasedOffers.includes(offerId);

  return (
    <div className="flex flex-col gap-4 px-3 py-3 pb-4">
      {/* 广告增益区 */}
      <div>
        <h2 className="text-sm font-bold text-yellow-400 mb-2 px-1">📺 免费增益（观看广告）</h2>
        <div className="flex flex-col gap-2">
          {SHOP_OFFERS.filter(o => o.id <= 3).map(offer => (
            <div
              key={offer.id}
              className="rounded-xl p-3 bg-gradient-to-r from-gray-800 to-gray-850 border border-green-600/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center text-xl flex-shrink-0">
                  {offer.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{offer.name}</h3>
                  <p className="text-[10px] text-gray-400">{offer.description}</p>
                </div>
                <button
                  onClick={() => handleAdReward(offer.id, offer.rewards[0].type, offer.rewards[0].value)}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 
                             text-white text-xs font-bold active:scale-95 transition-transform
                             hover:from-green-500 hover:to-emerald-500"
                >
                  📺 免费领取
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 免费礼包 */}
      <div>
        <h2 className="text-sm font-bold text-yellow-400 mb-2 px-1">🎁 免费礼包</h2>
        <div className="flex flex-col gap-2">
          {SHOP_OFFERS.filter(o => o.id === 8).map(offer => {
            const purchased = isPurchased(offer.id);
            return (
              <div
                key={offer.id}
                className={`rounded-xl p-3 border transition-all
                  ${purchased
                    ? 'bg-gray-900/30 border-gray-700/20 opacity-50'
                    : 'bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border-amber-500/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center text-xl flex-shrink-0">
                    {offer.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{offer.name}</h3>
                    <p className="text-[10px] text-gray-400">{offer.description}</p>
                    <div className="flex gap-1 mt-1">
                      {offer.rewards.map((r, i) => (
                        <span key={i} className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                          {r.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!purchased && (
                    <button
                      onClick={() => handleFreeOffer(offer.id, offer.rewards)}
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 
                                 text-white text-xs font-bold active:scale-95 transition-transform"
                    >
                      免费领取
                    </button>
                  )}
                  {purchased && (
                    <span className="text-xs text-gray-500">已领取</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 钻石内购区 */}
      <div>
        <h2 className="text-sm font-bold text-yellow-400 mb-2 px-1">💎 钻石商店</h2>
        <div className="flex flex-col gap-2">
          {SHOP_OFFERS.filter(o => o.id >= 4 && o.id <= 7).map(offer => {
            const purchased = isPurchased(offer.id);
            return (
              <div
                key={offer.id}
                className={`rounded-xl p-3 border transition-all
                  ${purchased
                    ? 'bg-gray-900/30 border-gray-700/20 opacity-50'
                    : 'bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-900/30 flex items-center justify-center text-xl flex-shrink-0">
                    {offer.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{offer.name}</h3>
                      {offer.oneTime && (
                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                          限时
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">{offer.description}</p>
                    <div className="flex gap-1 mt-1">
                      {offer.rewards.map((r, i) => (
                        <span key={i} className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          {r.label}
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
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 
                                 text-white text-xs font-bold active:scale-95 transition-transform"
                    >
                      ¥{offer.cost}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">已购买</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 限时活动 — 当前激活事件 + 未来事件预览 */}
      <div>
        <h2 className="text-sm font-bold text-yellow-400 mb-2 px-1">🎊 随机事件系统</h2>
        <p className="text-[10px] text-gray-500 mb-2 px-1">随机事件会自动触发，为你带来临时增益！</p>
        <div className="flex flex-col gap-2">
          {GAME_EVENTS.slice(0, 5).map(event => {
            const unlocked = totalEarned >= event.minTotalEarned;

            return (
              <div
                key={event.id}
                className={`rounded-xl p-3 border transition-all
                  ${unlocked
                    ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/20 border-purple-500/30'
                    : 'bg-gray-900/30 border-gray-700/20 opacity-40'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center text-xl flex-shrink-0">
                    {event.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{event.name}</h3>
                      <span className={`text-[10px] font-bold ${
                        event.boostType === 'profit_mult' || event.boostType === 'all_mult'
                          ? 'text-yellow-400' : event.boostType === 'speed_mult' ? 'text-cyan-400' : 'text-green-400'
                      }`}>{
                        event.boostType === 'profit_mult' ? `利润×${event.boostValue}` :
                        event.boostType === 'speed_mult' ? `速度×${event.boostValue}` :
                        event.boostType === 'all_mult' ? `全属性×${event.boostValue}` :
                        `成本${Math.round(event.boostValue*100)}%`
                      }</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{event.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-gray-500">⏱ {event.durationSec}秒</span>
                      {event.reward && (
                        <span className="text-[9px] text-green-400">
                          🎁 {event.reward.type === 'cash' ? formatCash(event.reward.value) : `${event.reward.value}💎`}
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
