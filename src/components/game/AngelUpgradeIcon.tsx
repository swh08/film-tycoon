'use client';

import { ANGEL_UPGRADES } from '@/game/config/angel-upgrades';

const ANGEL_UPGRADE_ASSET_IDS = new Set(ANGEL_UPGRADES.map(upgrade => upgrade.id));

export function angelUpgradeAssetPath(upgradeId: number) {
  return `/assets/game/angel-upgrades/${upgradeId}.png`;
}

interface AngelUpgradeIconProps {
  upgradeId: number;
  alt?: string;
  size?: number;
  className?: string;
}

export default function AngelUpgradeIcon({ upgradeId, alt = '', size = 32, className = '' }: AngelUpgradeIconProps) {
  if (!ANGEL_UPGRADE_ASSET_IDS.has(upgradeId)) {
    return null;
  }

  return (
    <img
      src={angelUpgradeAssetPath(upgradeId)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`inline-block object-contain select-none ${className}`}
    />
  );
}
