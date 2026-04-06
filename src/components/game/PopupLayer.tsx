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
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto
                         rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className={`
                ${popup.type === 'reward' ? 'bg-gradient-to-br from-amber-600 to-yellow-500' :
                  popup.type === 'milestone' ? 'bg-gradient-to-br from-purple-600 to-pink-500' :
                  popup.type === 'confirm' ? 'bg-gradient-to-br from-gray-800 to-gray-900' :
                  popup.type === 'tutorial' ? 'bg-gradient-to-br from-blue-600 to-cyan-500' :
                  'bg-gradient-to-br from-gray-800 to-gray-900'
                }
                p-6 text-white
              `}>
                {popup.content}
                <button
                  onClick={closePopup}
                  className={`mt-4 w-full py-2.5 rounded-xl font-bold text-base transition-all duration-150
                    ${popup.type === 'confirm'
                      ? 'bg-gradient-to-b from-gray-500 to-gray-700 text-gray-200 shadow-[0_3px_0_0_#374151,0_4px_8px_rgba(0,0,0,0.3)] hover:from-gray-400 hover:to-gray-600 active:shadow-[0_1px_0_0_#374151,0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[2px]'
                      : 'bg-gradient-to-b from-white/30 to-white/10 text-white shadow-[0_3px_0_0_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.2)] hover:from-white/40 hover:to-white/20 active:shadow-[0_1px_0_0_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[2px]'
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
