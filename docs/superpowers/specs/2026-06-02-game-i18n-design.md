# Game I18n Design

## Goal

Add English support across all visible game text. Players can choose language in Settings, and the default behavior follows the browser language.

## Approach

Use a lightweight game-local i18n layer instead of route-based localization. The game is a single-page client app, so language changes should be instant and should not affect routing or progress.

The persisted language preference is `system`, `zh-CN`, or `en`. `system` resolves from `navigator.language`: Chinese browser languages use `zh-CN`, and all other languages use `en`.

## Components

- `src/i18n/language.ts` resolves language preferences and owns the active runtime language.
- `src/i18n/messages.ts` stores English translations keyed by existing Chinese source text, keeping Chinese as the source fallback during the retrofit.
- `src/i18n/useTranslation.ts` exposes a React hook for components.
- `src/store/gameStore.ts` persists the language preference with the existing game save.
- Game tabs, popups, settings, HUD, and config-driven labels call translation helpers at display boundaries.

## Testing

Language resolution is covered by unit tests. The implementation should verify that browser language defaults, manual overrides, and fallback behavior are stable before UI wiring is completed.
