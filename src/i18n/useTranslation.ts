'use client';

import { useMemo } from 'react';

import { useGameStore } from '@/store/gameStore';
import {
  getBrowserLanguage,
  resolveLanguagePreference,
  setActiveLanguage,
  type LanguagePreference,
} from './language';
import { formatTranslated, translateText } from './index';

export function useTranslation() {
  const languagePreference = useGameStore(s => s.languagePreference);
  const language = resolveLanguagePreference(languagePreference, getBrowserLanguage());

  setActiveLanguage(language);

  return useMemo(() => ({
    language,
    languagePreference,
    t: (source: string) => translateText(source, language),
    tf: (template: string, values: Record<string, string | number>) => formatTranslated(template, values, language),
  }), [language, languagePreference]);
}

export type { LanguagePreference };
