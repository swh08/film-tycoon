'use client';

export type ManagerAssetId =
  | 'wang-master'
  | 'chen-student'
  | 'zhang-manager'
  | 'liu-franchise'
  | 'li-influencer'
  | 'zhao-director'
  | 'chen-doctor'
  | 'lucy-wang'
  | 'jack-chen'
  | 'film-grandmaster'
  | 'zhou-efficiency'
  | 'qian-pricing';

export const MANAGER_ASSETS: Record<number, ManagerAssetId> = {
  1: 'wang-master',
  2: 'chen-student',
  3: 'zhang-manager',
  4: 'liu-franchise',
  5: 'li-influencer',
  6: 'zhao-director',
  7: 'chen-doctor',
  8: 'lucy-wang',
  9: 'jack-chen',
  10: 'film-grandmaster',
  11: 'zhou-efficiency',
  12: 'qian-pricing',
};

export function managerAssetPath(id: ManagerAssetId) {
  return `/assets/game/managers/${id}.png`;
}

interface ManagerIconProps {
  managerId: number;
  alt?: string;
  size?: number;
  className?: string;
}

export default function ManagerIcon({ managerId, alt = '', size = 40, className = '' }: ManagerIconProps) {
  const assetId = MANAGER_ASSETS[managerId];

  if (!assetId) {
    return null;
  }

  return (
    <img
      src={managerAssetPath(assetId)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`inline-block object-contain select-none ${className}`}
    />
  );
}
