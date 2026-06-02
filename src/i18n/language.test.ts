import { describe, expect, test } from 'bun:test';

import { resolveLanguagePreference, type LanguagePreference } from './language';

describe('resolveLanguagePreference', () => {
  test('uses explicit English preference over browser language', () => {
    expect(resolveLanguagePreference('en', 'zh-CN')).toBe('en');
  });

  test('uses explicit Chinese preference over browser language', () => {
    expect(resolveLanguagePreference('zh-CN', 'en-US')).toBe('zh-CN');
  });

  test.each([
    ['zh-CN'],
    ['zh-Hans'],
    ['zh-TW'],
    ['zh-HK'],
  ])('maps Chinese browser language %s to Chinese', (browserLanguage) => {
    expect(resolveLanguagePreference('system', browserLanguage)).toBe('zh-CN');
  });

  test.each([
    ['en'],
    ['en-US'],
    ['ja-JP'],
    ['fr-FR'],
    [undefined],
  ])('maps non-Chinese browser language %s to English', (browserLanguage) => {
    expect(resolveLanguagePreference('system', browserLanguage)).toBe('en');
  });

  test('falls back to system for invalid saved preferences', () => {
    expect(resolveLanguagePreference('legacy' as LanguagePreference, 'zh-CN')).toBe('zh-CN');
  });
});
