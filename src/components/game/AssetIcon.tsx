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
  '🪙': 'currency/coin',
  '💎': 'currency/diamond',
  '🤝': 'currency/connection',
  '💼': 'nav/business',
  '🏪': 'nav/business',
  '⬆️': 'nav/upgrade',
  '👥': 'nav/manager',
  '🛒': 'nav/shop',
  '🏅': 'nav/achievement',
  '🔒': 'status/lock',
  '✅': 'status/check',
  '❌': 'status/cross',
  '⚙️': 'system/settings',
  '📺': 'boost/ad',
  '🎁': 'boost/gift',
  '🔥': 'boost/fire',
  '🚀': 'boost/rocket',
  '⚡': 'boost/lightning',
  '⏰': 'boost/timer',
  '⏱️': 'boost/timer',
  '⏱': 'boost/timer',
};

export function resolveSharedAssetId(icon: string): SharedAssetId | null {
  if (icon in LEGACY_SHARED_ICON_MAP) return LEGACY_SHARED_ICON_MAP[icon];
  return null;
}

export function sharedAssetPath(id: SharedAssetId): string {
  return `/assets/game/shared/${id}.png`;
}

const GENERATED_ASSETS = new Set<SharedAssetId>([
  'currency/coin',
  'currency/diamond',
  'currency/connection',
  'nav/business',
  'nav/upgrade',
  'nav/manager',
  'nav/prestige',
  'nav/shop',
  'nav/achievement',
]);

const FALLBACK_ICON_MAP: Record<SharedAssetId, string> = {
  'currency/coin': '🪙',
  'currency/diamond': '💎',
  'currency/connection': '🤝',
  'nav/business': '💼',
  'nav/upgrade': '⬆️',
  'nav/manager': '👥',
  'nav/prestige': '🤝',
  'nav/shop': '🛒',
  'nav/achievement': '🏅',
  'status/lock': '🔒',
  'status/check': '✅',
  'status/cross': '❌',
  'system/settings': '⚙️',
  'boost/ad': '📺',
  'boost/gift': '🎁',
  'boost/fire': '🔥',
  'boost/rocket': '🚀',
  'boost/lightning': '⚡',
  'boost/timer': '⏰',
};

interface AssetIconProps {
  id: SharedAssetId;
  alt?: string;
  size?: number;
  className?: string;
}

export default function AssetIcon({ id, alt = '', size = 20, className = '' }: AssetIconProps) {
  if (!GENERATED_ASSETS.has(id)) {
    return (
      <span
        aria-label={alt}
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size, fontSize: size }}
      >
        {FALLBACK_ICON_MAP[id]}
      </span>
    );
  }

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
