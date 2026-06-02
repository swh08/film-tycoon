'use client';

export function dailyRewardAssetPath(day: number) {
  return `/assets/game/daily-rewards/day-${day}.png`;
}

interface DailyRewardIconProps {
  day: number;
  alt?: string;
  size?: number;
  className?: string;
}

export default function DailyRewardIcon({
  day,
  alt = '',
  size = 32,
  className = '',
}: DailyRewardIconProps) {
  return (
    <img
      src={dailyRewardAssetPath(day)}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`inline-block object-contain select-none ${className}`}
    />
  );
}
