# DM Dashboard Hotfixes — Рабочий план

## TL;DR

> **Quick Summary**: Исправить критические баги DM Dashboard после деплоя: OAuth не работает из-за несовпадения redirect_uri, кнопки не оранжевые по умолчанию, переключатель языка мешает на DM-страницах, layout слишком разреженный.
>
> **Estimated Effort**: Small
> **Parallel Execution**: YES — 3 параллельных фикса

---

## Issues

### I1. OAuth redirect_uri mismatch (КРИТИЧЕСКИЙ)
**Суть**: В `login/yandex.ts` и `login/vk.ts` используется `process.env.PUBLIC_APP_URL || url.origin` для `redirect_uri` (→ `https://randify.pro/...`), но в `callback/yandex.ts` и `callback/vk.ts` используется `${url.origin}/...` (→ `http://localhost:4321/...` за nginx). OAuth-провайдер отклоняет token exchange из-за несовпадения redirect_uri.

**Фикс**: Использовать `process.env.PUBLIC_APP_URL || url.origin` в callback-файлах.

### I2. Кнопки не оранжевые по умолчанию
**Суть**: 
- Quick dice buttons в `DiceRoller.astro` — серые (`bg-[var(--bg-secondary)]`), оранжевые только на hover
- Anchor nav links в `dm/index.astro` — серые, оранжевые только на hover
- `DmButton` primary — корректно оранжевый, это ок

**Фикс**: Сделать quick dice buttons и anchor nav links оранжевыми по умолчанию (accent background или accent text/border).

### I3. LanguageSwitcher мешает на DM-страницах
**Суть**: `BaseLayout.astro` всегда рендерит `<LanguageSwitcher />` (line 108). На DM-страницах в правом верхнем углу висят переключатель EN/RU + ссылки Blog/About/Privacy. Пользователь просит убрать — DM Dashboard должен выглядеть как самостоятельный продукт.

**Фикс**: Добавить prop `hideLanguageSwitcher` в `BaseLayout`, передавать `true` из `DmLayout`.

### I4. Layout слишком разреженный
**Суть**: Grid `grid-cols-1 lg:grid-cols-2 gap-6` создаёт слишком много пустого пространства. Пользователь просит "более приятное и плотное расположение".

**Фикс**: Уменьшить gap, возможно сделать некоторые секции шире, улучшить использование пространства.

---

## TODOs

- [x] F1. Fix OAuth redirect_uri in callback handlers (vk + yandex)
- [x] F2. Make quick dice buttons and anchor nav accent-colored by default
- [x] F3. Hide LanguageSwitcher on DM pages
- [x] F4. Densify DM Dashboard layout

## Final Verification Wave

- [ ] FV1. **OAuth End-to-End Test** — `unspecified-high`
  - Проверить что Yandex OAuth проходит полный цикл login → callback → redirect to /dm/
  - Проверить что VK OAuth проходит полный цикл
  - Verify: оба провайдера работают на https://randify.pro

- [ ] FV2. **Visual QA** — `visual-engineering`
  - Проверить что кнопки оранжевые по умолчанию
  - Проверить что LanguageSwitcher не отображается на /dm/
  - Проверить что layout плотный и приятный
  - Verify: скриншоты или ручная проверка

## Definition of Done

- [ ] OAuth работает с обоими провайдерами в продакшене
- [ ] Все кнопки DM оранжевые (accent) по умолчанию
- [ ] На /dm/ нет LanguageSwitcher и ссылок Blog/About/Privacy
- [ ] Layout DM Dashboard компактный и визуально приятный
- [ ] Существующие генераторы Randify не сломаны
- [ ] `npm run build` проходит без ошибок

## Scope

**IN**:
- Фиксы перечисленных багов
- Только DM Dashboard страницы

**OUT**:
- Новые фичи
- Изменения существующих генераторов
- Изменения не-DM страниц
