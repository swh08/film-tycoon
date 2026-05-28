'use client';

export type ShopOfferAssetId =
  | 'double-revenue-ad'
  | 'offline-income-ad'
  | 'rush-order-ad'
  | 'diamond-starter-pack'
  | 'diamond-luxury-pack'
  | 'no-ads'
  | 'growth-fund'
  | 'newbie-gift'
  | 'targeting-ad'
  | 'diamond-bonus-ad'
  | 'speed-production-ad';

export type ShopEventAssetId =
  | 'influencer-livestream'
  | 'product-launch'
  | 'shopping-festival'
  | 'media-endorsement'
  | 'automation-upgrade'
  | 'assembly-line'
  | 'time-stop'
  | 'golden-week'
  | 'film-master'
  | 'raw-material-sale'
  | 'government-subsidy';

export const SHOP_OFFER_ASSETS: Record<number, ShopOfferAssetId> = {
  1: 'double-revenue-ad',
  2: 'offline-income-ad',
  3: 'rush-order-ad',
  4: 'diamond-starter-pack',
  5: 'diamond-luxury-pack',
  6: 'no-ads',
  7: 'growth-fund',
  8: 'newbie-gift',
  10: 'targeting-ad',
  11: 'diamond-bonus-ad',
  12: 'speed-production-ad',
};

export const SHOP_EVENT_ASSETS: Record<number, ShopEventAssetId> = {
  1: 'influencer-livestream',
  2: 'product-launch',
  3: 'shopping-festival',
  4: 'media-endorsement',
  5: 'automation-upgrade',
  6: 'assembly-line',
  7: 'time-stop',
  8: 'golden-week',
  9: 'film-master',
  10: 'raw-material-sale',
  11: 'government-subsidy',
};

export function shopOfferAssetPath(id: ShopOfferAssetId) {
  return `/assets/game/shop/offers/${id}.png`;
}

export function shopEventAssetPath(id: ShopEventAssetId) {
  return `/assets/game/shop/events/${id}.png`;
}

interface ShopIconProps {
  alt?: string;
  size?: number;
  className?: string;
}

export function ShopOfferIcon({
  offerId,
  alt = '',
  size = 32,
  className = '',
}: ShopIconProps & { offerId: number }) {
  const assetId = SHOP_OFFER_ASSETS[offerId];
  if (!assetId) return null;

  return (
    <img
      src={shopOfferAssetPath(assetId)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`inline-block object-contain select-none ${className}`}
    />
  );
}

export function ShopEventIcon({
  eventId,
  alt = '',
  size = 32,
  className = '',
}: ShopIconProps & { eventId: number }) {
  const assetId = SHOP_EVENT_ASSETS[eventId];
  if (!assetId) return null;

  return (
    <img
      src={shopEventAssetPath(assetId)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`inline-block object-contain select-none ${className}`}
    />
  );
}
