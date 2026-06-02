export type ResolvedLanguage = 'zh-CN' | 'en';
export type LanguagePreference = ResolvedLanguage | 'system';

let activeLanguage: ResolvedLanguage = 'en';

export function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === 'system' || value === 'zh-CN' || value === 'en';
}

export function resolveLanguagePreference(
  preference: LanguagePreference,
  browserLanguage?: string,
): ResolvedLanguage {
  if (preference === 'zh-CN' || preference === 'en') return preference;

  const normalized = browserLanguage?.toLowerCase() ?? '';
  if (normalized.startsWith('zh')) return 'zh-CN';

  return 'en';
}

export function getBrowserLanguage(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return navigator.language;
}

export function setActiveLanguage(language: ResolvedLanguage) {
  activeLanguage = language;
}

export function getActiveLanguage(): ResolvedLanguage {
  return activeLanguage;
}
