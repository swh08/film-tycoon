// ============================================================
// 弹窗层 — 奖励/确认/里程碑覆盖层
// ============================================================
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupConfig {
  id: string;
  content: ReactNode;
  type?: 'reward' | 'confirm' | 'milestone' | 'info' | 'tutorial';
  onClose?: () => void;
}

interface PopupContextType {
  showPopup: (config: PopupConfig) => void;
  closePopup: (id?: string) => void;
  currentPopup: PopupConfig | null;
}

const PopupContext = createContext<PopupContextType>({
  showPopup: () => {},
  closePopup: () => {},
  currentPopup: null,
});

export function usePopup() {
  return useContext(PopupContext);
}

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupConfig | null>(null);

  const showPopup = useCallback((config: PopupConfig) => {
    setPopup(config);
  }, []);

  const closePopup = useCallback(() => {
    if (popup?.onClose) popup.onClose();
    setPopup(null);
  }, [popup]);

  return (
    <PopupContext.Provider value={{ showPopup, closePopup, currentPopup: popup }}>
      {children}
      <AnimatePresence>
        {popup && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={closePopup}
            />
            {/* 弹窗内容 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2"
            >
              <div className="business-card-frame-bg relative overflow-hidden px-6 py-6 text-center text-white shadow-[0_20px_42px_rgba(0,0,0,.55)]">
                <div className="[&>div>img:first-child]:mx-auto [&>div>img:first-child]:mb-4 [&>div>img:first-child]:h-24 [&>div>img:first-child]:w-24 [&>div>img:first-child]:object-contain [&>div>img:first-child]:drop-shadow-[0_18px_16px_rgba(0,0,0,.66)] [&_h3]:text-xl [&_h3]:font-black [&_h3]:leading-tight [&_h3]:text-amber-100 [&_h3]:drop-shadow-[0_2px_1px_rgba(0,0,0,.75)] [&_p]:font-bold [&_p]:text-stone-300">
                  {popup.content}
                </div>
                <button
                  onClick={closePopup}
                  className={`mt-5 w-full rounded-xl border py-3 text-sm font-black transition-all duration-150
                    ${popup.type === 'confirm'
                      ? 'border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-300 shadow-none active:translate-y-[2px]'
                      : 'border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950 shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] active:translate-y-[2px] active:shadow-[0_2px_0_rgba(120,53,15,.9),0_4px_8px_rgba(0,0,0,.25)]'
                    }`}
                >
                  {popup.type === 'confirm' ? '取消' : '好的！'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PopupContext.Provider>
  );
}
