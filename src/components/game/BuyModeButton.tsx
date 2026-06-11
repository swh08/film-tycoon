'use client';

import { RefreshCw } from 'lucide-react';

const BUY_MODES = [
  { value: 1, label: 'x1' },
  { value: 10, label: 'x10' },
  { value: 100, label: 'x100' },
  { value: 0, label: 'MAX' },
];

interface BuyModeButtonProps {
  buyMode: number;
  setBuyMode: (mode: number) => void;
  className?: string;
}

export default function BuyModeButton({ buyMode, setBuyMode, className = '' }: BuyModeButtonProps) {
  const currentIndex = Math.max(0, BUY_MODES.findIndex(mode => mode.value === buyMode));
  const currentMode = BUY_MODES[currentIndex];
  const nextMode = BUY_MODES[(currentIndex + 1) % BUY_MODES.length];

  return (
    <button
      type="button"
      aria-label={`Buy mode ${currentMode.label}`}
      title="Click to switch buy mode"
      onClick={() => setBuyMode(nextMode.value)}
      className={`group flex h-11 w-[92px] flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-amber-200/60 bg-[linear-gradient(180deg,#fff1a6,#f7b52c_55%,#d08212)] px-3 text-stone-950 shadow-[0_4px_0_#8a520b,0_10px_20px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.65)] transition-all active:translate-y-[2px] active:shadow-[0_2px_0_#8a520b,0_6px_14px_rgba(0,0,0,.3),inset_0_1px_0_rgba(255,255,255,.55)] ${className}`}
    >
      <RefreshCw
        size={16}
        strokeWidth={3}
        className="flex-shrink-0 opacity-80 transition-transform group-active:rotate-45"
      />
      <span className="min-w-[42px] text-center text-[15px] font-black leading-none tabular-nums">
        {currentMode.label}
      </span>
    </button>
  );
}
