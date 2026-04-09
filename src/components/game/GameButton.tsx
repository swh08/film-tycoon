// ============================================================
// GameButton — 统一3D按压风格游戏按钮
// ============================================================
'use client';

import { forwardRef } from 'react';

type GameButtonVariant = 'gold' | 'green' | 'blue' | 'red' | 'gray' | 'purple' | 'cyan';
type GameButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  active?: boolean;
}

const VARIANT_STYLES: Record<GameButtonVariant, {
  enabled: string;
  disabled: string;
  activeBg: string;
}> = {
  gold: {
    enabled: 'bg-gradient-to-b from-yellow-400 to-amber-600 text-white hover:from-yellow-300 hover:to-amber-500 shadow-[0_3px_0_0_#92400e,0_4px_8px_rgba(120,53,15,0.3)]',
    disabled: 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]',
    activeBg: 'active:shadow-[0_1px_0_0_#92400e,0_2px_4px_rgba(120,53,15,0.2)] active:translate-y-[2px]',
  },
  green: {
    enabled: 'bg-gradient-to-b from-green-500 to-green-700 text-white hover:from-green-400 hover:to-green-600 shadow-[0_3px_0_0_#166534,0_4px_8px_rgba(21,128,61,0.3)]',
    disabled: 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]',
    activeBg: 'active:shadow-[0_1px_0_0_#166534,0_2px_4px_rgba(21,128,61,0.2)] active:translate-y-[2px]',
  },
  blue: {
    enabled: 'bg-gradient-to-b from-blue-400 to-indigo-600 text-white hover:from-blue-300 hover:to-indigo-500 shadow-[0_3px_0_0_#312e81,0_4px_8px_rgba(49,46,129,0.3)]',
    disabled: 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]',
    activeBg: 'active:shadow-[0_1px_0_0_#312e81,0_2px_4px_rgba(49,46,129,0.2)] active:translate-y-[2px]',
  },
  red: {
    enabled: 'bg-gradient-to-b from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600 shadow-[0_3px_0_0_#7f1d1d,0_4px_8px_rgba(185,28,28,0.3)]',
    disabled: 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]',
    activeBg: 'active:shadow-[0_1px_0_0_#7f1d1d,0_2px_4px_rgba(185,28,28,0.2)] active:translate-y-[2px]',
  },
  gray: {
    enabled: 'bg-gradient-to-b from-gray-400 to-gray-600 text-gray-200 hover:from-gray-300 hover:to-gray-500 shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.3)]',
    disabled: 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]',
    activeBg: 'active:shadow-[0_1px_0_0_#374151,0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[2px]',
  },
  purple: {
    enabled: 'bg-gradient-to-b from-purple-500 to-purple-700 text-white hover:from-purple-400 hover:to-purple-600 shadow-[0_3px_0_0_#581c87,0_4px_8px_rgba(126,34,206,0.3)]',
    disabled: 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]',
    activeBg: 'active:shadow-[0_1px_0_0_#581c87,0_2px_4px_rgba(126,34,206,0.2)] active:translate-y-[2px]',
  },
  cyan: {
    enabled: 'bg-gradient-to-b from-cyan-400 to-cyan-600 text-white hover:from-cyan-300 hover:to-cyan-500 shadow-[0_3px_0_0_#164e63,0_4px_8px_rgba(22,78,99,0.3)]',
    disabled: 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-400 cursor-not-allowed shadow-[0_3px_0_0_#374151,0_4px_6px_rgba(0,0,0,0.2)]',
    activeBg: 'active:shadow-[0_1px_0_0_#164e63,0_2px_4px_rgba(22,78,99,0.2)] active:translate-y-[2px]',
  },
};

const SIZE_STYLES: Record<GameButtonSize, string> = {
  xs: 'px-1.5 py-1 text-[10px] rounded-lg',
  sm: 'px-2 py-1.5 text-[10px] rounded-lg',
  md: 'px-3 py-2 text-xs rounded-lg',
  lg: 'px-4 py-3 text-sm rounded-xl',
};

const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ variant = 'gold', size = 'sm', active, disabled, className = '', children, ...props }, ref) => {
    const v = VARIANT_STYLES[variant];
    const isDisabled = disabled;

    // active prop: used for toggle buttons (e.g., buy mode selector)
    const isActive = active && !isDisabled;
    const baseStyle = isActive ? v.enabled : isDisabled ? v.disabled : v.enabled;
    const pressStyle = isActive || isDisabled ? '' : v.activeBg;
    const sizeStyle = SIZE_STYLES[size];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          font-bold transition-all duration-150 flex-shrink-0
          active:scale-[0.97]
          ${sizeStyle}
          ${baseStyle}
          ${pressStyle}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GameButton.displayName = 'GameButton';
export default GameButton;
