'use client';

import { useEffect, useMemo, useState } from 'react';

import { useGameStore } from '@/store/gameStore';
import {
  getBrowserLanguage,
  resolveLanguagePreference,
  setActiveLanguage,
  type LanguagePreference,
} from './language';
import { formatTranslated, translateText } from './index';

export function useTranslation() {
  const [isMounted, setIsMounted] = useState(false);
  const languagePreference = useGameStore(s => s.languagePreference);
  const language = isMounted
    ? resolveLanguagePreference(languagePreference, getBrowserLanguage())
    : resolveLanguagePreference('system', undefined);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  setActiveLanguage(language);

  return useMemo(() => ({
    language,
    languagePreference,
    t: (source: string) => translateText(source, language),
    tf: (template: string, values: Record<string, string | number>) => formatTranslated(template, values, language),
  }), [language, languagePreference]);
}

export type { LanguagePreference };
