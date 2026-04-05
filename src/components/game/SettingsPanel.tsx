// ============================================================
// 设置面板 — 全屏覆盖层，音频/显示/存档管理
// ============================================================
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const setSoundEnabled = useGameStore(s => s.setSoundEnabled);
  const numberFormat = useGameStore(s => s.numberFormat);
  const setNumberFormat = useGameStore(s => s.setNumberFormat);
  const musicVolume = useGameStore(s => s.musicVolume);
  const setMusicVolume = useGameStore(s => s.setMusicVolume);
  const sfxVolume = useGameStore(s => s.sfxVolume);
  const setSfxVolume = useGameStore(s => s.setSfxVolume);
  const resetGame = useGameStore(s => s.resetGame);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportArea, setShowImportArea] = useState(false);
  const [importText, setImportText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const state = useGameStore.getState();
      const json = JSON.stringify(state, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        showToast('✅ 存档已复制到剪贴板');
      }).catch(() => {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = json;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('✅ 存档已复制到剪贴板');
      });
    } catch {
      showToast('❌ 导出失败');
    }
  }, [showToast]);

  const handleImport = useCallback(() => {
    try {
      const data = JSON.parse(importText);
      if (!data || typeof data.cash !== 'number') {
        showToast('❌ 存档格式无效');
        return;
      }
      // Validate critical fields
      if (!Array.isArray(data.businesses)) {
        showToast('❌ 存档格式无效');
        return;
      }
      // Reset and load
      resetGame();
      // Re-apply the imported state by calling zustand setState
      useGameStore.setState(data);
      useGameStore.getState().save();
      showToast('✅ 存档导入成功');
      setShowImportArea(false);
      setImportText('');
    } catch {
      showToast('❌ JSON 解析失败');
    }
  }, [importText, resetGame, showToast]);

  const handleReset = useCallback(() => {
    resetGame();
    setShowResetConfirm(false);
    showToast('✅ 游戏已重置');
    onClose();
  }, [resetGame, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* 设置面板 */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-gray-900 rounded-t-3xl border-t-2 border-gray-500/50 overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-gradient-to-r from-gray-800/60 to-gray-800/40 border-b border-gray-600/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <h2 className="text-base font-black text-gray-200">设置</h2>
                    <p className="text-[10px] text-gray-400">游戏偏好与存档管理</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 设置内容 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* 🔊 音频设置 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-3">🔊 音频设置</h3>
                <div className="space-y-3">
                  {/* 音效总开关 */}
                  <div className="flex items-center justify-between bg-gray-800/60 rounded-xl p-3 border border-gray-700/40">
                    <div>
                      <p className="text-xs font-medium text-gray-200">音效开关</p>
                      <p className="text-[10px] text-gray-500">关闭后所有音效静音</p>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        soundEnabled ? 'bg-amber-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 音乐音量 */}
                  <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/40">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-gray-200">🎵 背景音乐</p>
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums">{Math.round(musicVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(musicVolume * 100)}
                      onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
                      className="w-full h-1.5 rounded-full appearance-none bg-gray-700 cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400
                                 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>

                  {/* 音效音量 */}
                  <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/40">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-gray-200">🔉 音效音量</p>
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums">{Math.round(sfxVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(sfxVolume * 100)}
                      onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
                      className="w-full h-1.5 rounded-full appearance-none bg-gray-700 cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400
                                 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                </div>
              </section>

              {/* 🔢 数字显示 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-3">🔢 数字显示</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNumberFormat('abbreviation')}
                    className={`rounded-xl p-3 border text-center transition-all ${
                      numberFormat === 'abbreviation'
                        ? 'bg-amber-900/40 border-amber-500/50 ring-1 ring-amber-500/30'
                        : 'bg-gray-800/60 border-gray-700/40 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-sm font-bold text-yellow-300 tabular-nums">1.23M</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">缩写格式</p>
                  </button>
                  <button
                    onClick={() => setNumberFormat('scientific')}
                    className={`rounded-xl p-3 border text-center transition-all ${
                      numberFormat === 'scientific'
                        ? 'bg-amber-900/40 border-amber-500/50 ring-1 ring-amber-500/30'
                        : 'bg-gray-800/60 border-gray-700/40 hover:border-gray-600'
                    }`}
                  >
                    <p className="text-sm font-bold text-yellow-300 tabular-nums">1.23e6</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">科学计数法</p>
                  </button>
                </div>
              </section>

              {/* 💾 存档管理 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-3">💾 存档管理</h3>
                <div className="space-y-2">
                  {/* 导出 */}
                  <button
                    onClick={handleExport}
                    className="w-full bg-gray-800/60 hover:bg-gray-700/60 rounded-xl p-3 border border-gray-700/40 transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">📤</span>
                    <div className="text-left">
                      <p className="text-xs font-medium text-gray-200">导出存档</p>
                      <p className="text-[10px] text-gray-500">复制存档 JSON 到剪贴板</p>
                    </div>
                  </button>

                  {/* 导入 */}
                  <div className="bg-gray-800/60 rounded-xl border border-gray-700/40 overflow-hidden">
                    <button
                      onClick={() => setShowImportArea(!showImportArea)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-700/30 transition-colors"
                    >
                      <span className="text-lg">📥</span>
                      <div className="text-left flex-1">
                        <p className="text-xs font-medium text-gray-200">导入存档</p>
                        <p className="text-[10px] text-gray-500">粘贴 JSON 恢复存档</p>
                      </div>
                      <span className={`text-xs text-gray-500 transition-transform ${showImportArea ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {showImportArea && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-3 pb-3"
                      >
                        <textarea
                          value={importText}
                          onChange={(e) => setImportText(e.target.value)}
                          placeholder="在此粘贴存档 JSON..."
                          className="w-full h-24 bg-gray-900 rounded-lg p-2 text-[10px] text-gray-300 border border-gray-600/50 focus:border-amber-500/50 focus:outline-none resize-none font-mono"
                        />
                        <button
                          onClick={handleImport}
                          disabled={!importText.trim()}
                          className="mt-2 w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:text-gray-500 text-white text-xs font-bold transition-colors"
                        >
                          确认导入
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* 重置游戏 */}
                  <div className="bg-red-900/20 rounded-xl border border-red-800/30 overflow-hidden">
                    <button
                      onClick={() => setShowResetConfirm(!showResetConfirm)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-red-900/20 transition-colors"
                    >
                      <span className="text-lg">🗑️</span>
                      <div className="text-left flex-1">
                        <p className="text-xs font-medium text-red-400">重置游戏</p>
                        <p className="text-[10px] text-gray-500">清除所有进度，不可恢复</p>
                      </div>
                      <span className={`text-xs text-gray-500 transition-transform ${showResetConfirm ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {showResetConfirm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-3 pb-3"
                      >
                        <p className="text-[10px] text-red-300 mb-2">⚠️ 确定要重置吗？所有进度将被永久删除！</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowResetConfirm(false)}
                            className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleReset}
                            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                          >
                            确认重置
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </section>

              {/* ℹ️ 关于 */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 mb-3">ℹ️ 关于</h3>
                <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/40">
                  <div className="text-center">
                    <p className="text-lg">📱</p>
                    <p className="text-sm font-bold text-yellow-400">贴膜大亨</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Screen Protector Tycoon</p>
                    <p className="text-[10px] text-gray-600 mt-1">v1.0.0</p>
                  </div>
                </div>
              </section>

              {/* 底部间距 */}
              <div className="h-4" />
            </div>

            {/* Toast 消息 */}
            <AnimatePresence>
              {toastMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gray-700/90 text-white text-xs font-medium shadow-lg"
                >
                  {toastMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
