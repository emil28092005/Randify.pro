# DM Dashboard MVP — Рабочий план

## TL;DR

> **Quick Summary**: Создать MVP DM Dashboard (`/dm/*`) внутри Randify.pro — инструмент для мастеров D&D 5e с кубиками, трекером инициативы, справочником Open5e, локальными заметками и базовой OAuth-аутентификацией (VK + Yandex).
>
> **Deliverables**:
> - Гибридный Astro билд с API routes
> - PostgreSQL схема + Drizzle ORM + миграции
> - OAuth 2.1 + PKCE (VK + Yandex)
> - JWT сессии в httpOnly cookies
> - Dice Roller (клиент-side)
> - Initiative Tracker (простой список)
> - Open5e Reference (поиск + карточки)
> - Notes (localStorage)
> - Оранжевая тема оформления
> - TDD инфраструктура + тесты
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 3 волны + финальная верификация
> **Critical Path**: T1 (Hybrid Config) → T2 (DB Schema) → T7 (OAuth API) → T14 (DM Layout) → F1-F4

---

## Context

### Original Request
DM Dashboard — инструмент для мастеров настольных RPG, живёт на субдомене dm.randify.pro как часть проекта randify.pro. Три уровня доступа (FREE без аккаунта, FREE с аккаунтом, PRO), OAuth (VK/Yandex), Open5e справочник, AI-генерация, Boosty подписки.

### Interview Summary
**Key Discussions**:
- **MVP vs Iteration 2**: MVP — базовые инструменты без AI. Итерация 2 — AI, PRO, Boosty, закладки, энкаунтер-билдер.
- **Архитектура**: Переход с static Astro на hybrid (API routes + Server Islands).
- **БД**: PostgreSQL на reg.ru, Drizzle ORM.
- **Аутентификация**: OAuth 2.1 + PKCE, JWT в httpOnly cookies.
- **Дизайн**: Оранжевая тема в стиле ролёвок, похожая на текущий Randify.pro.
- **i18n**: Только RU для DM Dashboard.
- **Тесты**: TDD с Vitest.

**Research Findings**:
- Randify — чисто статический сайт (27 генераторов), требуется серьёзная архитектурная трансформация.
- Open5e V2 API с field filtering и pagination.
- VK и Yandex требуют OAuth 2.1 + PKCE.
- Token bucket — стандарт для rate limiting (пригодится в итерации 2).
- Текущий деплой: Docker multi-stage (nginx:alpine) → нужен Node.js runtime.

### Metis Review
**Identified Gaps** (addressed):
- Core Objective разделён на MVP и Product Vision.
- Scope IN/OUT чётко определены.
- Противоречия (static→hybrid, RU-only) задокументированы как осознанные отклонения.
- Тестовая стратегия (TDD) определена.

---

## Work Objectives

### Core Objective
Создать MVP DM Dashboard — модуль `/dm/*` внутри Randify.pro с базовыми инструментами для мастеров D&D 5e: кубиками, трекером инициативы, справочником Open5e, локальными заметками и базовой OAuth-аутентификацией (VK + Yandex).

### Concrete Deliverables
- `astro.config.mjs` — обновлённая конфигурация hybrid mode
- `Dockerfile` + `docker-compose.yml` — Node.js runtime + PostgreSQL
- `src/db/schema.ts` — Drizzle ORM схема
- `src/db/migrate.ts` — скрипт миграций
- `src/pages/api/auth/[...path].ts` — API routes для OAuth
- `src/lib/auth/jwt.ts` — JWT утилиты
- `src/lib/auth/oauth.ts` — OAuth PKCE утилиты
- `src/pages/dm/index.astro` — главная страница DM Dashboard
- `src/layouts/DmLayout.astro` — лейаут DM Dashboard
- `src/components/dm/DiceRoller.astro` — кубики
- `src/components/dm/InitiativeTracker.astro` — инициатива
- `src/components/dm/Open5eReference.astro` — справочник
- `src/components/dm/NotesPanel.astro` — заметки
- `src/lib/open5e/client.ts` — клиент Open5e API
- `src/lib/open5e/cache.ts` — кэширование
- `src/i18n/dm-translations.ts` — переводы DM Dashboard (RU)
- `tests/` — TDD тесты для всех модулей

### Definition of Done
- [ ] `npm run build` проходит без ошибок
- [ ] `npm run test` — все тесты проходят
- [ ] `docker compose up` запускает приложение + PostgreSQL
- [ ] OAuth вход через VK работает
- [ ] OAuth вход через Yandex работает
- [ ] Кубики генерируют корректные значения
- [ ] Инициатива сортирует по убыванию
- [ ] Open5e загружает и ищет монстров
- [ ] Заметки сохраняются в localStorage
- [ ] Дизайн в оранжевой теме

### Must Have
- [ ] Гибридный Astro билд
- [ ] PostgreSQL подключение
- [ ] OAuth аутентификация (VK + Yandex)
- [ ] JWT сессии
- [ ] Dice Roller
- [ ] Initiative Tracker
- [ ] Open5e Reference (поиск + просмотр)
- [ ] Notes (localStorage)
- [ ] Оранжевая тема
- [ ] RU i18n
- [ ] TDD тесты

### Must NOT Have (Guardrails)
- [ ] AI-генерация любого контента (Итерация 2)
- [ ] Rate limiting (нужен AI)
- [ ] PRO-tier логика (Итерация 2)
- [ ] Boosty верификация (Итерация 2)
- [ ] Закладки Open5e (Итерация 2)
- [ ] Энкаунтер-билдер (Итерация 2)
- [ ] Сохранение в PostgreSQL для пользовательских данных (Итерация 2)
- [ ] EN-версия DM Dashboard (Итерация 2)
- [ ] PWA / Service Worker (Итерация 2)
- [ ] Изменения существующих генераторов
- [ ] Удаление существующих страниц

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest в проекте)
- **Automated tests**: TDD
- **Framework**: Vitest
- **TDD Workflow**: Каждая задача начинается с RED (падающий тест) → GREEN (минимальная реализация) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Bash (curl) — Send requests, assert status + response fields
- **Database**: Bash (psql/drizzle) — Query tables, assert rows

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — start immediately):
├── T1: Astro Hybrid Config + Docker Update
├── T2: PostgreSQL Schema + Drizzle ORM
├── T3: Testing Infrastructure (TDD setup)
├── T4: Design System / Orange Theme
└── T5: OAuth App Setup Documentation

Wave 2 (Core Features — MAX PARALLEL):
├── T6: OAuth PKCE + API Routes (depends: T1, T2)
├── T7: JWT Sessions + Middleware (depends: T1, T2)
├── T8: Dice Roller Component (depends: T4)
├── T9: Initiative Tracker Component (depends: T4)
├── T10: Open5e API Client + Cache (depends: T1)
├── T11: Open5e Search UI (depends: T4, T10)
├── T12: Notes Component (depends: T4)
└── T13: Auth UI (Login/Logout/Profile) (depends: T6, T7)

Wave 3 (Integration + Polish):
├── T14: DM Dashboard Layout + Page (depends: T4, T6, T7, T8, T9, T10, T11, T12, T13)
├── T15: Navigation + Routing (depends: T14)
├── T16: Build Verification + CI Update (depends: T1, T14)
└── T17: Final Styling Polish (depends: T14, T15)

Wave FINAL (4 parallel reviews → user okay):
├── F1: Plan Compliance Audit (oracle)
├── F2: Code Quality Review (unspecified-high)
├── F3: Real QA (unspecified-high + playwright)
└── F4: Scope Fidelity Check (deep)
```

### Dependency Matrix

- **T1**: - → T6, T7, T10, T14, T16
- **T2**: - → T6, T7, T16
- **T3**: - → T8, T9, T10, T11, T12
- **T4**: - → T8, T9, T11, T12, T13, T14, T17
- **T5**: - → (документация для пользователя)
- **T6**: T1, T2 → T13, T14
- **T7**: T1, T2 → T13, T14
- **T8**: T4 → T14
- **T9**: T4 → T14
- **T10**: T1 → T11, T14
- **T11**: T4, T10 → T14
- **T12**: T4 → T14
- **T13**: T6, T7, T4 → T14
- **T14**: T4, T6, T7, T8, T9, T10, T11, T12, T13 → T15, T16, T17
- **T15**: T14 → -
- **T16**: T1, T14 → -
- **T17**: T14, T15 → -

### Agent Dispatch Summary

- **Wave 1**: T1→`quick`, T2→`quick`, T3→`quick`, T4→`visual-engineering`, T5→`writing`
- **Wave 2**: T6→`unspecified-high`, T7→`unspecified-high`, T8→`quick`, T9→`quick`, T10→`quick`, T11→`visual-engineering`, T12→`quick`, T13→`visual-engineering`
- **Wave 3**: T14→`deep`, T15→`quick`, T16→`unspecified-high`, T17→`visual-engineering`
- **FINAL**: F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

- [x] T1. Astro Hybrid Config + Docker Update

  **What to do**:
  - Обновить `astro.config.mjs` с `output: 'hybrid'` и `adapter: node()`
  - Добавить `@astrojs/node` адаптер
  - Обновить `Dockerfile`: заменить `nginx:alpine` на `node:20-alpine` с `node ./dist/server/entry.mjs`
  - Добавить `docker-compose.yml` с PostgreSQL сервисом
  - Обновить `.github/workflows/deploy.yml` для деплоя Node.js приложения
  - Проверить, что существующие `/generators/*` маршруты остаются статическими (`export const prerender = true`)

  **Must NOT do**:
  - Не удалять существующие генераторы или страницы
  - Не менять деплой основного сайта (только добавить Node.js runtime)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Reason**: Конфигурационные изменения, не требует сложной логики

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T6, T7, T10, T14, T16
  - **Blocked By**: None

  **References**:
  - `astro.config.mjs` — текущая статическая конфигурация
  - `Dockerfile` — текущий multi-stage build с nginx
  - `.github/workflows/deploy.yml` — текущий деплой через rsync
  - Astro docs: `@astrojs/node` adapter configuration

  **Acceptance Criteria**:
  - [ ] `npm run build` создаёт `dist/server/entry.mjs`
  - [ ] `docker build -t dm-dashboard .` собирает образ
  - [ ] `docker run -p 4321:4321 dm-dashboard` запускает сервер
  - [ ] `curl http://localhost:4321/generators/coin-toss/` возвращает статическую страницу
  - [ ] `curl http://localhost:4321/api/health` возвращает 200 (тестовый API route)

  **QA Scenarios**:
  ```
  Scenario: Astro hybrid build succeeds
    Tool: Bash
    Steps:
      1. npm run build
      2. ls dist/server/entry.mjs
    Expected Result: entry.mjs существует
    Evidence: .sisyphus/evidence/t1-hybrid-build.log

  Scenario: Existing generators still static
    Tool: Bash (curl)
    Steps:
      1. docker run -d -p 4321:4321 dm-dashboard
      2. curl -s http://localhost:4321/generators/coin-toss/ | grep -o "Coin Flip"
    Expected Result: "Coin Flip" найден в ответе
    Evidence: .sisyphus/evidence/t1-static-routes.html
  ```

  **Commit**: YES
  - Message: `chore(dm): configure astro hybrid mode + docker`
  - Files: `astro.config.mjs`, `Dockerfile`, `docker-compose.yml`, `.github/workflows/deploy.yml`, `package.json`

- [x] T2. PostgreSQL Schema + Drizzle ORM

  **What to do**:
  - Установить `drizzle-orm` и `drizzle-kit`
  - Создать `src/db/schema.ts` с таблицами:
    - `users` (id, vkId?, yandexId?, email?, name, avatar, createdAt)
    - `sessions` (id, userId, token, expiresAt) — для server-side сессий (MVP)
  - Создать `src/db/client.ts` — singleton PostgreSQL client
  - Создать `src/db/migrate.ts` — скрипт для запуска миграций
  - Добавить `drizzle.config.ts`
  - Создать `.env.example` с переменными DATABASE_URL, JWT_SECRET

  **Must NOT do**:
  - Не создавать таблицы для заметок, НПС, энкаунтеров (Итерация 2)
  - Не добавлять rate limiting таблицы (Итерация 2)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Reason**: Схема базы данных, типичная задача

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T6, T7, T16
  - **Blocked By**: None

  **References**:
  - Drizzle ORM docs: PostgreSQL setup, schema definition, migrations
  - `src/lib/generator-schema.ts` — Zod patterns (уже в проекте)
  - `src/data/config.ts` — конфигурационные паттерны

  **Acceptance Criteria**:
  - [ ] `npx drizzle-kit generate` создаёт SQL миграции
  - [ ] `npx drizzle-kit migrate` применяет миграции к БД
  - [ ] `docker compose exec postgres psql -U dmuser -d dmdashboard -c "\dt"` показывает таблицы users и sessions

  **QA Scenarios**:
  ```
  Scenario: Database migrations run successfully
    Tool: Bash
    Preconditions: docker compose up -d
    Steps:
      1. npx drizzle-kit generate
      2. npx drizzle-kit migrate
      3. docker compose exec postgres psql -U dmuser -d dmdashboard -c "SELECT tablename FROM pg_tables WHERE schemaname='public'"
    Expected Result: users, sessions в списке таблиц
    Evidence: .sisyphus/evidence/t2-db-migrations.log

  Scenario: Drizzle client connects
    Tool: Bash (node)
    Steps:
      1. node -e "const { db } = require('./src/db/client.ts'); console.log('Connected')"
    Expected Result: "Connected" (или эквивалент для ESM)
    Evidence: .sisyphus/evidence/t2-db-connection.log
  ```

  **Commit**: YES
  - Message: `chore(db): setup drizzle orm + postgresql schema`
  - Files: `src/db/schema.ts`, `src/db/client.ts`, `src/db/migrate.ts`, `drizzle.config.ts`, `.env.example`

- [x] T3. Testing Infrastructure (TDD Setup)

  **What to do**:
  - Убедиться, что Vitest настроен (уже есть в package.json)
  - Создать `vitest.config.ts` с алиасами `@/*` → `src/*`
  - Добавить `@testing-library/dom` и `happy-dom` (или `jsdom`) для компонентных тестов
  - Создать `tests/setup.ts` — общий setup файл
  - Создать `tests/utils.ts` — хелперы для тестов (mock auth, mock db)
  - Установить `playwright` для компонентных тестов с рендерингом
  - Создать `playwright.config.ts` с базовой конфигурацией
  - Написать первый тест-скелетон для проверки инфраструктуры
  - Добавить скрипты `test:unit` и `test:ui` в package.json

  **Must NOT do**:
  - Не писать e2e тесты (только unit + component tests)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Reason**: Настройка инфраструктуры

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T8, T9, T10, T11, T12 (все компоненты требуют тестов)
  - **Blocked By**: None

  **References**:
  - `package.json` — текущие скрипты test
  - `tsconfig.json` — алиасы `@/*`
  - Vitest docs: configuration, aliases, DOM environment

  **Acceptance Criteria**:
  - [ ] `npm run test` запускается без ошибок
  - [ ] `npm run test:unit` проходит минимум 1 тест
  - [ ] Алиасы `@/*` работают в тестах

  **QA Scenarios**:
  ```
  Scenario: Vitest runs with aliases
    Tool: Bash
    Steps:
      1. npm run test:unit
      2. grep "PASS\|1 passed" в выводе
    Expected Result: Тесты проходят, алиасы @/* резолвятся
    Evidence: .sisyphus/evidence/t3-vitest-run.log
  ```

  **Commit**: YES
  - Message: `chore(tests): setup vitest + tdd infrastructure`
  - Files: `vitest.config.ts`, `tests/setup.ts`, `tests/utils.ts`, `package.json`

- [x] T4. Design System / Orange Theme

  **What to do**:
  - Создать `src/styles/dm-theme.css` с CSS переменными:
    - `--accent: #E87722` (оранжевый)
    - `--accent-light: #FF9F43`
    - `--accent-dark: #D35400`
    - `--bg-primary: #0f0f0f`
    - `--bg-secondary: #1a1a1a`
    - `--bg-card: #242424`
  - Создать `src/components/dm/DmButton.astro` — кнопка в DM стиле
  - Создать `src/components/dm/DmCard.astro` — карточка в DM стиле
  - Создать `src/components/dm/DmInput.astro` — инпут в DM стиле
  - Создать `src/components/dm/DmHeader.astro` — хедер DM Dashboard
  - Обновить `DmLayout.astro` (заглушку) с подключением темы

  **Must NOT do**:
  - Не менять существующие компоненты Randify (GeneratorCard, BaseLayout и т.д.)
  - Не добавлять анимации сложнее текущих (popElement)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]
  - **Reason**: UI/UX дизайн, стилизация

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T8, T9, T11, T12, T13, T14, T17
  - **Blocked By**: None

  **References**:
  - `src/layouts/BaseLayout.astro` — текущая тема `--accent: #534AB7`
  - `src/components/GeneratorCard.astro` — паттерн карточек
  - `src/components/ResultBox.astro` — паттерн отображения результатов
  - Tailwind CSS v4 docs: custom theme, CSS variables

  **Acceptance Criteria**:
  - [ ] Оранжевый цвет `#E87722` применяется к кнопкам
  - [ ] Тёмная тема совместима с текущей
  - [ ] Компоненты Button, Card, Input рендерятся

  **QA Scenarios**:
  ```
  Scenario: Orange theme renders correctly
    Tool: Playwright
    Steps:
      1. Открыть http://localhost:4321/dm/
      2. Сделать скриншот
      3. Проверить CSS var --accent = #E87722
    Expected Result: Оранжевый акцентный цвет виден на кнопках
    Evidence: .sisyphus/evidence/t4-orange-theme.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add orange dm theme + base components`
  - Files: `src/styles/dm-theme.css`, `src/components/dm/*.astro`

- [x] T5. OAuth App Setup Documentation

  **What to do**:
  - Создать `docs/OAUTH_SETUP.md` с инструкциями:
    - Как зарегистрировать VK ID приложение
    - Как зарегистрировать Yandex OAuth приложение
    - Какие redirect URI настроить (`http://localhost:4321/api/auth/callback/vk`, `.../yandex`)
    - Какие scopes запросить (профиль, email)
    - Куда сохранить client_id и client_secret (.env)
  - Добавить проверку env vars при старте приложения

  **Must NOT do**:
  - Не коммитить реальные client_id / client_secret
  - Не создавать приложения за пользователя

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []
  - **Reason**: Документация

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: (документация для пользователя, не блокирует код)
  - **Blocked By**: None

  **References**:
  - VK ID docs: https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/start-integration
  - Yandex OAuth docs: https://yandex.com/dev/id/doc/en/concepts/ya-oauth-intro

  **Acceptance Criteria**:
  - [ ] Файл `docs/OAUTH_SETUP.md` создан и читаем
  - [ ] `.env.example` содержит VK_CLIENT_ID, VK_CLIENT_SECRET, YANDEX_CLIENT_ID, YANDEX_CLIENT_SECRET
  - [ ] Приложение проверяет наличие env vars и выдаёт понятную ошибку если их нет

  **QA Scenarios**:
  ```
  Scenario: Missing env vars produce clear error
    Tool: Bash
    Steps:
      1. unset VK_CLIENT_ID
      2. npm run dev
    Expected Result: Приложение не запускается с сообщением "Missing VK_CLIENT_ID"
    Evidence: .sisyphus/evidence/t5-env-check.log
  ```

  **Commit**: YES
  - Message: `docs(dm): add oauth setup instructions`
  - Files: `docs/OAUTH_SETUP.md`, `.env.example`

- [x] T6. OAuth PKCE + API Routes

  **What to do**:
  - Реализовать PKCE утилиты: `generateCodeVerifier()`, `generateCodeChallenge()`
  - Создать `src/pages/api/auth/login/vk.ts` — начало OAuth flow (генерация PKCE, редирект на VK)
  - Создать `src/pages/api/auth/callback/vk.ts` — обработка callback (обмен code на token)
  - Создать `src/pages/api/auth/login/yandex.ts` — аналогично для Yandex
  - Создать `src/pages/api/auth/callback/yandex.ts` — callback для Yandex
  - Создать `src/pages/api/auth/logout.ts` — выход
  - В `src/lib/auth/oauth.ts` реализовать функции для каждого провайдера
  - Сохранение PKCE verifier в cookie (временное, httpOnly)

  **Must NOT do**:
  - Не использовать localStorage для code_verifier (XSS-риск)
  - Не пропускать проверку state parameter

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Reason**: OAuth + PKCE — security-critical

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T13, T14
  - **Blocked By**: T1, T2

  **References**:
  - PKCE implementation pattern из research:
    ```typescript
    function generateCodeVerifier(): string {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    ```
  - VK OAuth docs: https://id.vk.com/about/business/go/docs/ru/vkid/latest/vk-id/connection/realization
  - Yandex OAuth docs: https://yandex.com/dev/id/doc/en/concepts/ya-oauth-intro

  **Acceptance Criteria**:
  - [ ] `curl /api/auth/login/vk` возвращает 302 редирект на VK OAuth
  - [ ] Callback route принимает code и state
  - [ ] Logout route очищает cookies

  **QA Scenarios**:
  ```
  Scenario: VK OAuth login redirects correctly
    Tool: Bash (curl)
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/api/auth/login/vk
    Expected Result: 302 redirect
    Evidence: .sisyphus/evidence/t6-vk-login.log

  Scenario: Invalid state rejected
    Tool: Bash (curl)
    Steps:
      1. curl -s "http://localhost:4321/api/auth/callback/vk?code=abc&state=wrong"
    Expected Result: 401 Unauthorized
    Evidence: .sisyphus/evidence/t6-invalid-state.log
  ```

  **Commit**: YES
  - Message: `feat(auth): implement oauth pkce for vk and yandex`
  - Files: `src/lib/auth/oauth.ts`, `src/pages/api/auth/**/*.ts`

- [x] T7. JWT Sessions + Middleware

  **What to do**:
  - Установить `jose` для JWT
  - Создать `src/lib/auth/jwt.ts`:
    - `createToken(userId)` — создание JWT
    - `verifyToken(token)` — верификация
    - `setAuthCookie(token)` — установка httpOnly cookie
    - `clearAuthCookie()` — очистка
  - Создать `src/lib/auth/session.ts` — работа с PostgreSQL sessions таблицей
  - Создать `src/middleware/auth.ts` — middleware для проверки сессий
  - Добавить `Astro.locals.user` типизацию
  - TTL сессии: 7 дней

  **Must NOT do**:
  - Не хранить JWT secret в коде (только env)
  - Не использовать `localStorage` для токенов

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Reason**: Security-critical

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T13, T14
  - **Blocked By**: T1, T2

  **References**:
  - `jose` library docs: JWT sign, verify, Web Crypto API
  - `src/db/schema.ts` — sessions таблица

  **Acceptance Criteria**:
  - [ ] `createToken()` генерирует валидный JWT
  - [ ] `verifyToken()` принимает валидный и отклоняет истёкший
  - [ ] Cookie httpOnly, Secure, SameSite=strict
  - [ ] Middleware устанавливает `Astro.locals.user` для авторизованных

  **QA Scenarios**:
  ```
  Scenario: JWT creation and verification
    Tool: Bash (node)
    Steps:
      1. node -e "const { createToken, verifyToken } = require('./src/lib/auth/jwt.ts'); const t = createToken('user123'); console.log(verifyToken(t).sub)"
    Expected Result: "user123"
    Evidence: .sisyphus/evidence/t7-jwt.log

  Scenario: Expired token rejected
    Tool: Bash (node)
    Steps:
      1. node -e "const { verifyToken } = require('./src/lib/auth/jwt.ts'); verifyToken('expired_token')"
    Expected Result: Ошибка "JWT expired"
    Evidence: .sisyphus/evidence/t7-jwt-expired.log
  ```

  **Commit**: YES
  - Message: `feat(auth): implement jwt sessions + middleware`
  - Files: `src/lib/auth/jwt.ts`, `src/lib/auth/session.ts`, `src/middleware/auth.ts`

- [x] T8. Dice Roller Component

  **What to do**:
  - Создать `src/components/dm/DiceRoller.astro`
  - Поддержка нотаций: d4, d6, d8, d10, d12, d20, d100
  - Поле ввода: "2d6+3" или кнопки быстрого выбора
  - Модификатор (+/-)
  - Использовать `crypto.getRandomValues` из `src/lib/client/random.ts`
  - Анимация броска (вращение кубика)
  - История бросков
  - TDD: написать тесты перед реализацией

  **Must NOT do**:
  - Не делать сервер-side броски (клиент-side только)
  - Не добавлять advantage/disadvantage (MVP scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Reason**: Простой клиентский компонент

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T4, T3

  **References**:
  - `src/lib/client/random.ts` — `randomInt`, `crypto.getRandomValues`
  - `src/components/generators/NumberGenerator.astro` — паттерн генератора
  - `src/components/ResultBox.astro` — паттерн отображения результата

  **Acceptance Criteria**:
  - [ ] "1d20" генерирует число 1-20
  - [ ] "2d6" генерирует число 2-12
  - [ ] История бросков сохраняется в sessionStorage
  - [ ] Анимация отображается при броске

  **QA Scenarios**:
  ```
  Scenario: d20 produces valid range
    Tool: Playwright
    Steps:
      1. Открыть /dm/
      2. Кликнуть "d20"
      3. Проверить результат 1-20
    Expected Result: Число в диапазоне [1, 20]
    Evidence: .sisyphus/evidence/t8-d20-roll.png

  Scenario: Invalid input shows error
    Tool: Playwright
    Steps:
      1. Ввести "abc" в поле dice
      2. Кликнуть "Roll"
    Expected Result: Сообщение об ошибке "Неверная нотация"
    Evidence: .sisyphus/evidence/t8-invalid-dice.png
  ```

  **Commit**: YES
  - Message: `feat(dm): add dice roller component`
  - Files: `src/components/dm/DiceRoller.astro`, `tests/dice-roller.test.ts`

- [x] T9. Initiative Tracker Component

  **What to do**:
  - Создать `src/components/dm/InitiativeTracker.astro`
  - Форма добавления: Имя + Бросок инициативы (или авто-бросок d20 + модификатор)
  - Список combatants, отсортированный по убыванию
  - Кнопка "Следующий ход" — подсвечивает активного
  - Кнопка "Удалить" для каждого
  - Кнопка "Очистить всё"
  - Данные в sessionStorage (обнуляются при refresh — MVP)
  - TDD: написать тесты перед реализацией

  **Must NOT do**:
  - Не добавлять HP/статусы/раунды (MVP scope)
  - Не сохранять в PostgreSQL (MVP scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Reason**: Простой клиентский компонент

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T4, T3

  **References**:
  - `src/lib/client/random.ts` — `randomInt`
  - `src/lib/client/animations.ts` — `popElement`
  - `src/lib/client/validation.ts` — `createErrorDisplay`

  **Acceptance Criteria**:
  - [ ] Добавление combatant увеличивает список
  - [ ] Сортировка по убыванию броска
  - [ ] "Следующий ход" меняет активного
  - [ ] Refresh сбрасывает список

  **QA Scenarios**:
  ```
  Scenario: Initiative sorts descending
    Tool: Playwright
    Steps:
      1. Добавить "Гоблин" с 15
      2. Добавить "Воин" с 18
      3. Проверить порядок: Воин, Гоблин
    Expected Result: Воин (18) выше Гоблина (15)
    Evidence: .sisyphus/evidence/t9-initiative-sort.png

  Scenario: Turn cycling works
    Tool: Playwright
    Steps:
      1. Добавить 3 combatants
      2. Кликнуть "Следующий ход" 3 раза
      3. Проверить, что цикл замкнулся
    Expected Result: После 3-го клика активен первый
    Evidence: .sisyphus/evidence/t9-initiative-cycle.png
  ```

  **Commit**: YES
  - Message: `feat(dm): add initiative tracker component`
  - Files: `src/components/dm/InitiativeTracker.astro`, `tests/initiative-tracker.test.ts`

- [x] T10. Open5e API Client + Cache

  **What to do**:
  - Создать `src/lib/open5e/client.ts`:
    - `searchMonsters(query, filters)` — поиск монстров
    - `getMonster(key)` — получение по slug
    - `searchSpells(query, filters)` — поиск заклинаний
    - `getSpell(key)` — получение заклинания
  - Создать `src/lib/open5e/cache.ts`:
    - Кэширование в localStorage с TTL (24 часа)
    - Ключи: `open5e:monsters:query`, `open5e:monster:key`
  - Использовать Open5e V2 API с `fields=` parameter
  - Обработка ошибок (API недоступен → fallback message)
  - TDD: тесты с mock fetch

  **Must NOT do**:
  - Не кэшировать в IndexedDB (MVP: localStorage достаточно)
  - Не делать server-side cache (MVP: client-side only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Reason**: API клиент + кэш

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T11, T14
  - **Blocked By**: T1, T3

  **References**:
  - Open5e V2 API: `https://api.open5e.com/v2/creatures/`, `https://api.open5e.com/v2/spells/`
  - Open5e docs: field filtering, pagination

  **Acceptance Criteria**:
  - [ ] Поиск "dragon" возвращает монстров
  - [ ] Кэш сохраняет результаты в localStorage
  - [ ] Повторный поиск использует кэш
  - [ ] API недоступен → показывается ошибка

  **QA Scenarios**:
  ```
  Scenario: Search monsters returns results
    Tool: Bash (curl)
    Steps:
      1. curl -s "https://api.open5e.com/v2/creatures/?name__icontains=dragon&fields=name,key,challenge_rating_decimal"
    Expected Result: JSON с массивом существ
    Evidence: .sisyphus/evidence/t10-open5e-search.json

  Scenario: Cache stores results
    Tool: Playwright
    Steps:
      1. Открыть /dm/
      2. Поискать "goblin"
      3. Проверить localStorage
    Expected Result: localStorage содержит ключ open5e:*
    Evidence: .sisyphus/evidence/t10-open5e-cache.log
  ```

  **Commit**: YES
  - Message: `feat(dm): add open5e api client + localstorage cache`
  - Files: `src/lib/open5e/client.ts`, `src/lib/open5e/cache.ts`, `tests/open5e-client.test.ts`

- [x] T11. Open5e Search UI

  **What to do**:
  - Создать `src/components/dm/Open5eReference.astro`
  - Табы: Монстры / Заклинания
  - Поисковая строка с debounce (300ms)
  - Фильтры: CR (для монстров), Уровень (для заклинаний), Тип
  - Список результатов с пагинацией
  - Карточка деталей (модалка или раскрывающаяся карточка)
  - TDD: тесты на поиск и фильтрацию

  **Must NOT do**:
  - Не добавлять закладки (Итерация 2)
  - Не добавлять "добавить в энкаунтер" (Итерация 2)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]
  - **Reason**: UI компонент с поиском

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T4, T10, T3

  **References**:
  - `src/components/dm/Open5eReference.astro` (новый)
  - `src/lib/open5e/client.ts` — API клиент
  - `src/components/GeneratorCard.astro` — паттерн карточки

  **Acceptance Criteria**:
  - [ ] Поиск "goblin" отображает гоблинов
  - [ ] Фильтр по CR работает
  - [ ] Карточка деталей открывается по клику
  - [ ] Пагинация переключает страницы

  **QA Scenarios**:
  ```
  Scenario: Search goblins and view details
    Tool: Playwright
    Steps:
      1. Открыть /dm/
      2. Перейти в таб "Монстры"
      3. Ввести "goblin" в поиск
      4. Кликнуть на первый результат
    Expected Result: Открывается карточка с HP, AC, действиями
    Evidence: .sisyphus/evidence/t11-open5e-details.png

  Scenario: Filter by CR
    Tool: Playwright
    Steps:
      1. Выбрать фильтр CR: 1/4
      2. Проверить, что все результаты имеют CR 1/4
    Expected Result: Только существа с CR 1/4
    Evidence: .sisyphus/evidence/t11-open5e-filter.png
  ```

  **Commit**: YES
  - Message: `feat(dm): add open5e search ui`
  - Files: `src/components/dm/Open5eReference.astro`, `tests/open5e-ui.test.ts`

- [x] T12. Notes Component

  **What to do**:
  - Создать `src/components/dm/NotesPanel.astro`
  - Текстовая область для заметок
  - Автосохранение в localStorage (debounce 500ms)
  - Индикатор "Сохранено"
  - Кнопка "Очистить"
  - Несколько заметок? (MVP: одна большая заметка)
  - TDD: тесты на localStorage persistence

  **Must NOT do**:
  - Не сохранять в PostgreSQL (MVP scope)
  - Не добавлять rich text/Markdown (MVP: plain text)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Reason**: Простой клиентский компонент

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T4, T3

  **References**:
  - `src/lib/client/clipboard.ts` — паттерны клиентских утилит
  - `src/components/ResultBox.astro` — паттерн панели

  **Acceptance Criteria**:
  - [ ] Текст сохраняется в localStorage
  - [ ] После refresh текст восстанавливается
  - [ ] Индикатор "Сохранено" появляется через 500ms

  **QA Scenarios**:
  ```
  Scenario: Notes persist across refresh
    Tool: Playwright
    Steps:
      1. Открыть /dm/
      2. Ввести "Тестовая заметка" в поле
      3. Подождать 1 секунду
      4. Refresh страницы
    Expected Result: Текст "Тестовая заметка" остался
    Evidence: .sisyphus/evidence/t12-notes-persist.png

  Scenario: Clear button empties notes
    Tool: Playwright
    Steps:
      1. Ввести текст
      2. Кликнуть "Очистить"
      3. Проверить localStorage
    Expected Result: localStorage пустой
    Evidence: .sisyphus/evidence/t12-notes-clear.png
  ```

  **Commit**: YES
  - Message: `feat(dm): add notes panel with localstorage`
  - Files: `src/components/dm/NotesPanel.astro`, `tests/notes.test.ts`

- [x] T13. Auth UI (Login / Logout / Profile)

  **What to do**:
  - Создать `src/components/dm/AuthPanel.astro`
  - Кнопки "Войти через VK" и "Войти через Yandex"
  - После входа: аватар + имя + кнопка "Выйти"
  - Получение данных пользователя из Astro.locals.user
  - Показывать гостевое состояние для неавторизованных
  - TDD: тесты на отображение состояний

  **Must NOT do**:
  - Не показывать email/чувствительные данные
  - Не добавлять регистрацию по email (только OAuth)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]
  - **Reason**: UI компонент аутентификации

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T6, T7, T4

  **References**:
  - `src/components/LanguageSwitcher.astro` — паттерн верхней панели
  - `src/layouts/BaseLayout.astro` — интеграция в layout

  **Acceptance Criteria**:
  - [ ] Неавторизованный видит кнопки входа
  - [ ] Авторизованный видет аватар и имя
  - [ ] Клик "Выйти" очищает сессию

  **QA Scenarios**:
  ```
  Scenario: Guest sees login buttons
    Tool: Playwright
    Steps:
      1. Открыть /dm/ в инкогнито
      2. Проверить наличие "Войти через VK"
    Expected Result: Кнопки входа видны
    Evidence: .sisyphus/evidence/t13-guest-view.png

  Scenario: Logout clears session
    Tool: Playwright
    Steps:
      1. Авторизоваться (mock сессия)
      2. Кликнуть "Выйти"
      3. Проверить cookies
    Expected Result: Cookie auth очищен, показывается гостевое состояние
    Evidence: .sisyphus/evidence/t13-logout.png
  ```

  **Commit**: YES
  - Message: `feat(dm): add auth ui panel`
  - Files: `src/components/dm/AuthPanel.astro`, `tests/auth-ui.test.ts`

- [x] T14. DM Dashboard Layout + Page

  **What to do**:
  - Создать `src/layouts/DmLayout.astro`:
    - Наследует BaseLayout (SEO, analytics)
    - Оранжевая тема (подключает dm-theme.css)
    - Хедер с логотипом DM Dashboard + AuthPanel
    - Основной слот для контента
    - Футер с ссылками
  - Создать `src/pages/dm/index.astro`:
    - Использует DmLayout
    - Отображает все инструменты: DiceRoller, InitiativeTracker, Open5eReference, NotesPanel
    - Табы или секции для переключения между инструментами
    - RU i18n через `src/i18n/dm-translations.ts`
  - Добавить `src/i18n/dm-translations.ts` со всеми строками DM Dashboard

  **Must NOT do**:
  - Не менять существующие layouts (BaseLayout, GeneratorLayout)
  - Не добавлять sidebar или сложную навигацию (MVP: простая страница)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`/frontend-ui-ux`]
  - **Reason**: Интеграция всех компонентов в единый layout

  **Parallelization**:
  - **Can Run In Parallel**: NO (зависит от многих задач)
  - **Parallel Group**: Wave 3
  - **Blocks**: T15, T16, T17
  - **Blocked By**: T4, T6, T7, T8, T9, T10, T11, T12, T13

  **References**:
  - `src/layouts/GeneratorLayout.astro` — паттерн обёртки
  - `src/layouts/BaseLayout.astro` — базовый layout
  - `src/pages/generators/numbers.astro` — паттерн страницы

  **Acceptance Criteria**:
  - [ ] `/dm/` открывается без ошибок
  - [ ] Все 4 инструмента отображаются
  - [ ] AuthPanel показывает правильное состояние
  - [ ] Оранжевая тема применена
  - [ ] RU переводы работают

  **QA Scenarios**:
  ```
  Scenario: DM Dashboard loads all tools
    Tool: Playwright
    Steps:
      1. Открыть http://localhost:4321/dm/
      2. Сделать скриншот
      3. Проверить наличие: Кубики, Инициатива, Справочник, Заметки
    Expected Result: Все 4 секции видны, оформление оранжевое
    Evidence: .sisyphus/evidence/t14-dashboard-full.png

  Scenario: Auth state reflected
    Tool: Playwright
    Steps:
      1. Открыть /dm/ в инкогнито
      2. Проверить "Войти через VK"
      3. Авторизоваться (mock)
      4. Проверить имя пользователя
    Expected Result: После входа показывается имя и аватар
    Evidence: .sisyphus/evidence/t14-auth-state.png
  ```

  **Commit**: YES
  - Message: `feat(dm): integrate dashboard layout + page`
  - Files: `src/layouts/DmLayout.astro`, `src/pages/dm/index.astro`, `src/i18n/dm-translations.ts`

- [x] T15. Navigation + Routing

  **What to do**:
  - Добавить ссылку на DM Dashboard в главное меню (LanguageSwitcher или отдельная кнопка)
  - Создать `src/pages/dm/dice.astro` — отдельная страница кубиков (опционально)
  - Создать `src/pages/dm/initiative.astro` — отдельная страница инициативы (опционально)
  - Создать `src/pages/dm/reference.astro` — отдельная страница справочника (опционально)
  - Создать `src/pages/dm/notes.astro` — отдельная страница заметок (опционально)
  - Или: сделать навигацию по якорям на главной странице `#dice`, `#initiative`, `#reference`, `#notes`
  - Обновить `src/pages/index.astro` — добавить карточку DM Dashboard среди генераторов

  **Must NOT do**:
  - Не создавать дублирующих маршрутов
  - Не ломать существующую навигацию

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Reason**: Навигация и роутинг

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: T14

  **References**:
  - `src/pages/index.astro` — главная страница со списком генераторов
  - `src/components/GeneratorCard.astro` — карточка генератора

  **Acceptance Criteria**:
  - [ ] С главной страницы есть ссылка на /dm/
  - [ ] С /dm/ можно вернуться на главную
  - [ ] Навигация между инструментами работает (якоря или табы)

  **QA Scenarios**:
  ```
  Scenario: Navigation from homepage
    Tool: Playwright
    Steps:
      1. Открыть /
      2. Кликнуть "DM Dashboard"
      3. Проверить URL
    Expected Result: URL = /dm/
    Evidence: .sisyphus/evidence/t15-nav-home-to-dm.png
  ```

  **Commit**: YES
  - Message: `feat(dm): add navigation and routing`
  - Files: `src/pages/dm/*.astro`, `src/pages/index.astro`

- [x] T16. Build Verification + CI Update

  **What to do**:
  - Обновить `.github/workflows/deploy.yml`:
    - Добавить шаг запуска PostgreSQL (docker-compose)
    - Добавить миграции перед деплоем
    - Обновить rsync для Node.js приложения (или перейти на docker deploy)
  - Проверить `npm run build` — нет ошибок
  - Проверить `npm run test` — все тесты проходят
  - Проверить `npm run lint` — нет ошибок
  - Добавить health-check endpoint `/api/health`
  - Обновить `docker-compose.yml` для production

  **Must NOT do**:
  - Не удалять существующий деплой основного сайта
  - Не коммитить secrets в CI

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Reason**: CI/CD, деплой

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: T1, T14

  **References**:
  - `.github/workflows/deploy.yml` — текущий workflow
  - `docker-compose.yml` — Docker конфигурация
  - `Dockerfile` — обновлённый образ

  **Acceptance Criteria**:
  - [ ] `npm run build` — SUCCESS
  - [ ] `npm run test` — все тесты PASS
  - [ ] `npm run lint` — нет ошибок
  - [ ] Docker compose запускает app + postgres
  - [ ] CI workflow проходит

  **QA Scenarios**:
  ```
  Scenario: Full build succeeds
    Tool: Bash
    Steps:
      1. npm run build
      2. npm run test
      3. npm run lint
    Expected Result: Все команды завершаются с кодом 0
    Evidence: .sisyphus/evidence/t16-build.log

  Scenario: Docker compose health check
    Tool: Bash
    Steps:
      1. docker compose up -d
      2. curl -s http://localhost:4321/api/health
    Expected Result: {"status":"ok"}
    Evidence: .sisyphus/evidence/t16-health.json
  ```

  **Commit**: YES
  - Message: `ci(dm): update build, tests, and deployment`
  - Files: `.github/workflows/deploy.yml`, `docker-compose.yml`, `src/pages/api/health.ts`

- [x] T17. Final Styling Polish

  **What to do**:
  - Проверить responsive design (mobile, tablet, desktop)
  - Проверить accessibility (focus-visible, aria-labels)
  - Оптимизировать шрифты и spacing
  - Проверить консистентность оранжевой темы
  - Добавить hover/active состояния для интерактивных элементов
  - Проверить тёмную тему (контрастность)
  - TDD: визуальные регрессионные тесты (скриншоты)

  **Must NOT do**:
  - Не менять функционал
  - Не добавлять новые фичи

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`/frontend-ui-ux`]
  - **Reason**: UI полировка

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: T14, T15

  **References**:
  - `src/styles/dm-theme.css` — текущая тема
  - Tailwind CSS docs: responsive design, accessibility

  **Acceptance Criteria**:
  - [ ] Mobile: все элементы помещаются на экране 375px
  - [ ] Desktop: адекватные отступы и размеры
  - [ ] Focus-visible работает на всех интерактивных элементах
  - [ ] Контрастность текста ≥ 4.5:1

  **QA Scenarios**:
  ```
  Scenario: Responsive design
    Tool: Playwright
    Steps:
      1. Открыть /dm/ в viewport 375x667
      2. Сделать скриншот
      3. Открыть /dm/ в viewport 1920x1080
      4. Сделать скриншот
    Expected Result: Оба скриншота показывают удобочитаемый интерфейс
    Evidence: .sisyphus/evidence/t17-responsive-mobile.png, t17-responsive-desktop.png
  ```

  **Commit**: YES
  - Message: `style(dm): final polish and responsive design`
  - Files: `src/styles/dm-theme.css`, `src/components/dm/*.astro`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `npm run lint` + `npm run test`. Review changed files for AI slop patterns.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Execute EVERY QA scenario from EVERY task. Test cross-task integration. Capture evidence.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1. Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Plan Reviews

### Metis Review
- **Status**: COMPLETED
- **Findings**: Core Objective разделён на MVP и Product Vision; Scope IN/OUT определены; противоречия задокументированы.

### Oracle Verification Phase 1
- **Status**: PASS
- **Verdict**: CHECK 5/5 PASS | GO

### Oracle Verification Phase 2
- **Status**: PASS
- **Verdict**: CHECK 6/6 PASS | GO

### Momus Review
- **Status**: OKAY
- **Verdict**: План хорошо структурирован, все ссылки валидны, каждая задача имеет конкретную точку входа, чёткие критерии приёмки и исполняемые QA-сценарии.

### Oracle Verification Phase 3
- **Status**: PASS (after fixes)
- **Verdict**: CHECK 5/5 PASS | GO

## Commit Strategy

- **T1-T5**: `chore(dm): setup hybrid astro + docker + db + tests + theme`
- **T6-T7**: `feat(auth): implement oauth + jwt sessions`
- **T8-T13**: `feat(dm): add dice, initiative, open5e, notes, auth ui`
- **T14-T17**: `feat(dm): integrate dashboard layout + navigation + polish`
- **F1-F4**: `chore(dm): final verification and fixes`

---

## Success Criteria

### Verification Commands
```bash
# Build
npm run build

# Tests
npm run test

# Lint
npm run lint

# Docker
docker compose up -d

# OAuth callback routes exist
curl -s http://localhost:4321/api/auth/callback/vk -w "%{http_code}"
curl -s http://localhost:4321/api/auth/callback/yandex -w "%{http_code}"

# DM Dashboard page loads
curl -s http://localhost:4321/dm/ | grep -q "DM Dashboard"

# Database migrations
docker compose exec postgres psql -U dmuser -d dmdashboard -c "\dt"
```

### Final Checklist
- [x] All "Must Have" present
- [x] All "Must NOT Have" absent
- [x] All tests pass
- [x] Build succeeds
- [x] Docker compose запускается
- [x] OAuth callbacks отвечают
- [x] DM Dashboard страница доступна
- [x] Таблицы в PostgreSQL созданы
