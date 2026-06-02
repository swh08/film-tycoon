'use client';

export function achievementAssetPath(achievementId: string) {
  return `/assets/game/achievements/${achievementId.replaceAll('_', '-')}.png`;
}

interface AchievementIconProps {
  achievementId: string;
  alt?: string;
  size?: number;
  className?: string;
}

export default function AchievementIcon({
  achievementId,
  alt = '',
  size = 32,
  className = '',
}: AchievementIconProps) {
  return (
    <img
      src={achievementAssetPath(achievementId)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`inline-block object-contain select-none ${className}`}
    />
  );
}
