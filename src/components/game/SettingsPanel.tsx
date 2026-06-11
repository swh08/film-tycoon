'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { setMusicVolume, setSfxVolumeValue, startMusic, stopMusic } from '@/game/sound';
import { useGameStore } from '@/store/gameStore';
import { useTranslation, type LanguagePreference } from '@/i18n/useTranslation';
import AssetIcon from './AssetIcon';
import StatsPanel from './StatsPanel';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function SectionTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-black leading-none tracking-normal text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
      {icon}
      {children}
    </h3>
  );
}

function PanelSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`business-card-frame-4x1-bg relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  children,
  onClick,
  tone = 'default',
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  tone?: 'default' | 'blue' | 'danger';
}) {
  const Component = onClick ? 'button' : 'div';
  const hoverClass = tone === 'danger' ? 'hover:bg-red-950/20' : tone === 'blue' ? 'hover:bg-cyan-300/10' : 'hover:bg-white/[0.04]';
  const titleClass = tone === 'danger' ? 'text-red-300' : tone === 'blue' ? 'text-cyan-100' : 'text-stone-100';

  return (
    <Component onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${hoverClass}`}>
      {icon && (
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center drop-shadow-[0_8px_8px_rgba(0,0,0,.55)]">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-black leading-tight drop-shadow-[0_2px_1px_rgba(0,0,0,.75)] ${titleClass}`}>{title}</p>
        {description && <p className="mt-0.5 text-xs font-bold leading-snug text-stone-300">{description}</p>}
      </div>
      {children}
    </Component>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      aria-pressed={checked}
      className={`relative h-8 w-14 flex-shrink-0 rounded-full border shadow-[inset_0_2px_4px_rgba(0,0,0,.7)] transition-all ${
        checked
          ? 'border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)]'
          : 'border-stone-500/35 bg-[linear-gradient(180deg,#596270,#303742)]'
      }`}
    >
      <span className={`absolute left-0 top-1 h-6 w-6 rounded-full border border-white/70 bg-stone-50 shadow-[0_2px_4px_rgba(0,0,0,.45)] transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );
}

function VolumeSlider({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const percent = Math.round(value * 100);

  return (
    <div className="px-4 pb-4">
      <input
        type="range"
        min="0"
        max="100"
        value={percent}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        style={{
          background: disabled
            ? 'linear-gradient(90deg, rgba(87,96,112,.75) 0%, rgba(48,55,66,.9) 100%)'
            : `linear-gradient(90deg, #06b6d4 0%, #22d3ee ${Math.max(percent * 0.45, 8)}%, #f59e0b ${percent}%, rgba(0,0,0,.45) ${percent}%, rgba(0,0,0,.45) 100%)`,
        }}
        className="h-4 w-full cursor-pointer appearance-none rounded-full border border-black/50 shadow-[inset_0_1px_3px_rgba(0,0,0,.8)] disabled:cursor-not-allowed
          [&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent
          [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-100
          [&::-webkit-slider-thumb]:bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] [&::-webkit-slider-thumb]:shadow-[0_3px_0_#8a520b,0_5px_8px_rgba(0,0,0,.35)]"
      />
    </div>
  );
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const soundEnabled = useGameStore(s => s.soundEnabled);
  const setSoundEnabled = useGameStore(s => s.setSoundEnabled);
  const numberFormat = useGameStore(s => s.numberFormat);
  const setNumberFormat = useGameStore(s => s.setNumberFormat);
  const languagePreference = useGameStore(s => s.languagePreference);
  const setLanguagePreference = useGameStore(s => s.setLanguagePreference);
  const musicVolume = useGameStore(s => s.musicVolume);
  const setMusicVolumeStore = useGameStore(s => s.setMusicVolume);
  const sfxVolume = useGameStore(s => s.sfxVolume);
  const setSfxVolumeStore = useGameStore(s => s.setSfxVolume);
  const musicEnabled = useGameStore(s => s.musicEnabled);
  const setMusicEnabled = useGameStore(s => s.setMusicEnabled);
  const resetGame = useGameStore(s => s.resetGame);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportArea, setShowImportArea] = useState(false);
  const [showStatsView, setShowStatsView] = useState(false);
  const [importText, setImportText] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (musicEnabled) {
      startMusic();
    } else {
      stopMusic();
    }
  }, [musicEnabled]);

  useEffect(() => {
    setMusicVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    setSfxVolumeValue(sfxVolume);
  }, [sfxVolume]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const state = useGameStore.getState();
      const json = JSON.stringify(state, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        showToast(t('存档已复制到剪贴板'));
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = json;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(t('存档已复制到剪贴板'));
      });
    } catch {
      showToast(t('导出失败'));
    }
  }, [showToast, t]);

  const handleImport = useCallback(() => {
    try {
      const data = JSON.parse(importText);
      if (!data || typeof data !== 'object') {
        showToast(t('存档格式无效'));
        return;
      }
      if (typeof data.cash !== 'number' || data.cash < 0) {
        showToast(t('存档格式无效：现金数据错误'));
        return;
      }
      if (!Array.isArray(data.businesses) || data.businesses.length === 0) {
        showToast(t('存档格式无效：缺少产线数据'));
        return;
      }
      if (typeof data.prestigePoints === 'number' && data.prestigePoints < 0) data.prestigePoints = 0;
      if (typeof data.diamonds === 'number' && data.diamonds < 0) data.diamonds = 0;
      if (typeof data.totalEarned === 'number' && data.totalEarned < 0) data.totalEarned = 0;

      useGameStore.setState(data);
      useGameStore.getState().save();
      showToast(t('存档导入成功'));
      setShowImportArea(false);
      setImportText('');
    } catch {
      showToast(t('JSON 解析失败'));
    }
  }, [importText, showToast, t]);

  const handleReset = useCallback(() => {
    resetGame();
    setShowResetConfirm(false);
    showToast(t('游戏已重置'));
    onClose();
  }, [resetGame, onClose, showToast, t]);

  const languageOptions: { value: LanguagePreference; label: string }[] = [
    { value: 'system', label: t('跟随浏览器') },
    { value: 'zh-CN', label: t('中文') },
    { value: 'en', label: 'English' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="business-content-frame-bg fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden shadow-[0_-18px_36px_rgba(0,0,0,.55)]"
          >
            <div className="hud-frame-bg relative flex-shrink-0 px-4 pb-4 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center drop-shadow-[0_10px_10px_rgba(0,0,0,.55)]">
                    <AssetIcon id="system/settings" size={46} className="drop-shadow-[0_0_12px_rgba(251,191,36,.45)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black leading-none tracking-normal text-stone-50 drop-shadow-[0_3px_1px_rgba(0,0,0,.85)]">{t('设置')}</h2>
                    <p className="mt-1 text-xs font-bold text-stone-200/80">{t('游戏偏好与存档管理')}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close settings"
                  className="grid h-11 w-11 place-items-center rounded-xl border border-stone-200/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-100 shadow-[0_4px_0_#1f2937,0_8px_16px_rgba(0,0,0,.3)] transition-all active:translate-y-[2px] active:shadow-[0_2px_0_#1f2937]"
                >
                  <X size={21} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-5 py-5 pb-6">
              <section>
                <SectionTitle>{t('音频设置')}</SectionTitle>
                <PanelSection className="divide-y divide-stone-200/10">
                  <SettingRow
                    title={t('音效开关')}
                    description={t('关闭后所有音效静音')}
                  >
                    <ToggleSwitch checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
                  </SettingRow>

                  <div>
                    <SettingRow title={t('背景音乐')}>
                      <div className="flex items-center gap-2">
                        <span className="min-w-9 text-right text-sm font-black tabular-nums text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">
                          {Math.round(musicVolume * 100)}%
                        </span>
                        <ToggleSwitch checked={musicEnabled} onChange={() => setMusicEnabled(!musicEnabled)} />
                      </div>
                    </SettingRow>
                    <VolumeSlider value={musicVolume} onChange={setMusicVolumeStore} disabled={!musicEnabled} />
                  </div>

                  <div>
                    <SettingRow title={t('音效音量')}>
                      <span className="text-sm font-black tabular-nums text-amber-200 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">{Math.round(sfxVolume * 100)}%</span>
                    </SettingRow>
                    <VolumeSlider value={sfxVolume} onChange={setSfxVolumeStore} disabled={!soundEnabled} />
                  </div>
                </PanelSection>
              </section>

              <section>
                <SectionTitle>{t('语言')}</SectionTitle>
                <PanelSection className="p-4">
                  <p className="mb-3 text-xs font-bold leading-snug text-stone-300">{t('默认根据浏览器语言显示，手动切换后会保存')}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {languageOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setLanguagePreference(option.value)}
                        className={`min-h-11 rounded-xl border px-2 text-center text-xs font-black transition-all ${
                          languagePreference === option.value
                            ? 'border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950 shadow-[0_3px_0_#8a520b,inset_0_1px_0_rgba(255,255,255,.65)]'
                            : 'border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-200 shadow-[0_3px_0_#1f2937]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </PanelSection>
              </section>

              <section>
                <PanelSection>
                  <SettingRow
                    icon={<AssetIcon id="nav/achievement" size={36} className="drop-shadow-[0_0_10px_rgba(251,191,36,.45)]" />}
                    title={t('游戏统计')}
                    description={t('查看收入、产线、转生等详细数据')}
                    onClick={() => setShowStatsView(true)}
                    tone="blue"
                  >
                    <ChevronRight size={16} className="text-cyan-200/80" />
                  </SettingRow>
                </PanelSection>
              </section>

              <section>
                <SectionTitle>{t('数字显示')}</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'abbreviation' as const, sample: '1.23M', label: t('缩写格式') },
                    { value: 'scientific' as const, sample: '1.23e6', label: t('科学计数法') },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setNumberFormat(option.value)}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        numberFormat === option.value
                          ? 'border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] text-stone-950 shadow-[0_4px_0_#8a520b,inset_0_1px_0_rgba(255,255,255,.65)]'
                          : 'border-stone-500/30 bg-[linear-gradient(180deg,#596270,#303742)] text-stone-200 shadow-[0_4px_0_#1f2937] hover:brightness-110'
                      }`}
                    >
                      <p className={`text-base font-black tabular-nums ${numberFormat === option.value ? 'text-stone-950' : 'text-amber-200'}`}>{option.sample}</p>
                      <p className={`mt-0.5 text-xs font-bold ${numberFormat === option.value ? 'text-stone-800' : 'text-stone-300'}`}>{option.label}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>{t('存档管理')}</SectionTitle>
                <PanelSection className="divide-y divide-stone-200/10">
                  <SettingRow
                    title={t('导出存档')}
                    description={t('复制存档 JSON 到剪贴板')}
                    onClick={handleExport}
                  />

                  <div>
                    <SettingRow
                      title={t('导入存档')}
                      description={t('粘贴 JSON 恢复存档')}
                      onClick={() => setShowImportArea(!showImportArea)}
                    />
                    <AnimatePresence initial={false}>
                      {showImportArea && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden px-3 pb-3"
                        >
                          <textarea
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder={t('在此粘贴存档 JSON...')}
                            className="h-28 w-full resize-none rounded-xl border border-black/50 bg-black/45 p-3 font-mono text-xs font-bold text-stone-200 outline-none shadow-[inset_0_1px_4px_rgba(0,0,0,.8)] transition-colors placeholder:text-stone-500 focus:border-amber-200/70"
                          />
                          <button
                            onClick={handleImport}
                            disabled={!importText.trim()}
                            className="mt-2 w-full rounded-xl border border-amber-100/70 bg-[linear-gradient(180deg,#fff2a9,#f8c044_50%,#d98c13)] py-3 text-xs font-black text-stone-950 shadow-[0_5px_0_rgba(120,53,15,.9),0_8px_18px_rgba(0,0,0,.34)] transition-all active:translate-y-[2px] active:shadow-[0_2px_0_rgba(120,53,15,.9),0_4px_8px_rgba(0,0,0,.25)] disabled:cursor-not-allowed disabled:border-stone-500/30 disabled:bg-[linear-gradient(180deg,#596270,#303742)] disabled:text-stone-300 disabled:shadow-none"
                          >
                            {t('确认导入')}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="bg-red-950/10">
                    <SettingRow
                      title={t('重置游戏')}
                      description={t('清除所有进度，不可恢复')}
                      onClick={() => setShowResetConfirm(!showResetConfirm)}
                      tone="danger"
                    />
                    <AnimatePresence initial={false}>
                      {showResetConfirm && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden px-3 pb-3"
                        >
                          <p className="mb-2 flex items-center gap-1 text-xs font-bold text-red-200">
                            <AssetIcon id="status/cross" size={12} />
                            {t('确定要重置吗？所有进度将被永久删除！')}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setShowResetConfirm(false)}
                              className="rounded-xl border border-stone-400/40 bg-[linear-gradient(180deg,#596270,#303742)] py-3 text-xs font-black text-stone-100 shadow-[0_3px_0_#1f2937] transition-all active:translate-y-[2px] active:shadow-[0_1px_0_#1f2937]"
                            >
                              {t('取消')}
                            </button>
                            <button
                              onClick={handleReset}
                              className="rounded-xl border border-red-100/60 bg-[linear-gradient(180deg,#fca5a5,#ef4444_50%,#991b1b)] py-3 text-xs font-black text-white shadow-[0_3px_0_#7f1d1d,0_6px_12px_rgba(127,29,29,.28)] transition-all active:translate-y-[2px] active:shadow-[0_1px_0_#7f1d1d]"
                            >
                              {t('确认重置')}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </PanelSection>
              </section>

              <section>
                <SectionTitle>{t('关于')}</SectionTitle>
                <PanelSection className="p-4">
                  <div className="flex items-center justify-center gap-3 text-center">
                    <img
                      src="/assets/game/shared/system/film-tycoon-logo.png"
                      alt=""
                      width={34}
                      height={34}
                      draggable={false}
                      className="h-12 w-12 select-none drop-shadow-[0_0_12px_rgba(251,191,36,.45)]"
                    />
                    <div>
                      <p className="text-base font-black text-amber-100 drop-shadow-[0_2px_1px_rgba(0,0,0,.75)]">{t('贴膜大亨')}</p>
                      <p className="text-xs font-bold text-stone-300">Screen Protector Tycoon · v1.0.0</p>
                    </div>
                  </div>
                </PanelSection>
              </section>

              <div className="h-4" />
            </div>

            <StatsPanel isOpen={showStatsView} onClose={() => setShowStatsView(false)} />

            <AnimatePresence>
              {toastMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-slate-800/95 px-4 py-2 text-xs font-bold text-white shadow-lg"
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
