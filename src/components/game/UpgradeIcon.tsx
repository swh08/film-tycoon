'use client';

import type { UpgradeGroup } from '@/game/types';

export type UpgradeAssetId =
  | 'groups/equipment'
  | 'groups/channel'
  | 'groups/brand'
  | 'items/high-speed-film-machine'
  | 'items/precision-aligner'
  | 'items/automation-line'
  | 'items/community-group-buy'
  | 'items/logistics-center'
  | 'items/global-supply-chain'
  | 'items/brand-logo-design'
  | 'items/kol-campaign'
  | 'items/celebrity-endorsement'
  | 'items/quantum-film-tech'
  | 'items/licensing-empire';

export const UPGRADE_GROUP_ASSETS: Record<UpgradeGroup, UpgradeAssetId> = {
  equipment: 'groups/equipment',
  channel: 'groups/channel',
  brand: 'groups/brand',
};

export const GLOBAL_UPGRADE_ASSETS: Record<number, UpgradeAssetId> = {
  1: 'items/high-speed-film-machine',
  2: 'items/precision-aligner',
  3: 'items/automation-line',
  4: 'items/community-group-buy',
  5: 'items/logistics-center',
  6: 'items/global-supply-chain',
  7: 'items/brand-logo-design',
  8: 'items/kol-campaign',
  9: 'items/celebrity-endorsement',
  10: 'items/quantum-film-tech',
  11: 'items/licensing-empire',
};

export function upgradeAssetPath(id: UpgradeAssetId) {
  return `/assets/game/upgrades/${id}.png`;
}

interface UpgradeIconProps {
  id: UpgradeAssetId;
  alt?: string;
  size?: number;
  className?: string;
}

export default function UpgradeIcon({ id, alt = '', size = 32, className = '' }: UpgradeIconProps) {
  return (
    <img
      src={upgradeAssetPath(id)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`inline-block object-contain select-none ${className}`}
    />
  );
}
