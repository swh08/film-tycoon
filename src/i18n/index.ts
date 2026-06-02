import { EN_MESSAGES } from './messages';
import { getActiveLanguage, type ResolvedLanguage } from './language';

export function translateText(source: string, language: ResolvedLanguage = getActiveLanguage()): string {
  if (language === 'zh-CN') return source;
  return EN_MESSAGES[source] ?? source;
}

export function formatTranslated(template: string, values: Record<string, string | number>, language?: ResolvedLanguage): string {
  let result = translateText(template, language);
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, String(value));
  }
  return result;
}

export function hasTranslation(source: string): boolean {
  return Object.prototype.hasOwnProperty.call(EN_MESSAGES, source);
}
