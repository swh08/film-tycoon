'use client';

export type SharedAssetId =
  | 'currency/coin'
  | 'currency/diamond'
  | 'currency/connection'
  | 'nav/business'
  | 'nav/upgrade'
  | 'nav/manager'
  | 'nav/prestige'
  | 'nav/shop'
  | 'nav/achievement'
  | 'status/lock'
  | 'status/check'
  | 'status/cross'
  | 'system/settings'
  | 'boost/ad'
  | 'boost/gift'
  | 'boost/fire'
  | 'boost/rocket'
  | 'boost/lightning'
  | 'boost/timer';

const SHARED_ASSET_IDS = new Set<SharedAssetId>([
  'currency/coin',
  'currency/diamond',
  'currency/connection',
  'nav/business',
  'nav/upgrade',
  'nav/manager',
  'nav/prestige',
  'nav/shop',
  'nav/achievement',
  'status/lock',
  'status/check',
  'status/cross',
  'system/settings',
  'boost/ad',
  'boost/gift',
  'boost/fire',
  'boost/rocket',
  'boost/lightning',
  'boost/timer',
]);

const LEGACY_SHARED_ICON_MAP: Record<string, SharedAssetId> = {
  coin: 'currency/coin',
  cash: 'currency/coin',
  diamond: 'currency/diamond',
  connection: 'currency/connection',
  business: 'nav/business',
  upgrade: 'nav/upgrade',
  manager: 'nav/manager',
  prestige: 'nav/prestige',
  shop: 'nav/shop',
  achievement: 'nav/achievement',
  lock: 'status/lock',
  check: 'status/check',
  cross: 'status/cross',
  settings: 'system/settings',
  ad: 'boost/ad',
  gift: 'boost/gift',
  fire: 'boost/fire',
  rocket: 'boost/rocket',
  lightning: 'boost/lightning',
  timer: 'boost/timer',
};

export function resolveSharedAssetId(icon: string): SharedAssetId | null {
  if (SHARED_ASSET_IDS.has(icon as SharedAssetId)) return icon as SharedAssetId;
  if (icon in LEGACY_SHARED_ICON_MAP) return LEGACY_SHARED_ICON_MAP[icon];
  return null;
}

export function sharedAssetPath(id: SharedAssetId): string {
  return `/assets/game/shared/${id}.png`;
}

interface AssetIconProps {
  id: SharedAssetId;
  alt?: string;
  size?: number;
  className?: string;
}

export default function AssetIcon({ id, alt = '', size = 20, className = '' }: AssetIconProps) {
  return (
    <img
      src={sharedAssetPath(id)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`inline-block object-contain select-none ${className}`}
    />
  );
}
