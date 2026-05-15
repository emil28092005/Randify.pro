export const dmTranslations = {
  // Header / navigation
  title: "DM Dashboard",
  subtitle: "Инструменты для мастера подземелий",
  backToRandify: "← Назад к Randify",
  footer: "Часть Randify — генераторов случайных значений",

  // Legacy anchor labels (kept for backwards compatibility)
  dice: "Кубики",
  initiative: "Инициатива",
  reference: "Справочник",
  notes: "Заметки",
  anchorDice: "Кубики",
  anchorInitiative: "Инициатива",
  anchorReference: "Справочник",
  anchorNotes: "Заметки",

  // Tab labels
  tabDice: "Кубики",
  tabInitiative: "Инициатива",
  tabReference: "Справочник",
  tabNotes: "Заметки",

  // Sidebar sections
  sidebarTools: "ИНСТРУМЕНТЫ",
  sidebarReference: "СПРАВОЧНИК",
  sidebarCampaigns: "Кампании",
  sidebarCharacters: "Персонажи",

  // Action labels
  actionRoll: "Бросить",
  actionNextTurn: "Следующий ход",
  actionClear: "Очистить",
  actionAdd: "+ Добавить",
  actionSaved: "Сохранено",
  actionCopy: "Скопировать",
  actionSearch: "Поиск",
  actionClose: "Закрыть",
  actionRetry: "Повторить",

  // Empty states
  emptyDiceHistory: "Нет истории бросков",
  emptyCombatants: "Нет участников боя",
  emptySearchResults: "Ничего не найдено",
  emptyNotesPlaceholder: "Начните писать заметки...",

  // Loading states
  loading: "Загрузка...",
  searching: "Поиск...",

  // Open5e tabs
  monsters: "Монстры",
  spells: "Заклинания",

  // Initiative
  turnBadge: "Ход",
  modifier: "Модификатор",
  name: "Имя",
  hp: "ХП",

  // Dice
  customFormula: "Своя формула",
  rollHistory: "История бросков",
  criticalHit: "Критический успех!",
  criticalFail: "Критический провал!",
  resultLabel: "Результат",
  rollsLabel: "Броски",
  invalidNotation: "Неверная нотация",
  ariaQuickDice: "Быстрый выбор кубика",
  ariaRollHistory: "История бросков",

  // Initiative
  turnOrder: "Порядок хода",
  initiativeTotal: "Итого",
  initiativeHelp: "Бросок d20 + модификатор, или введите итог вручную",
  ariaCombatants: "Участники боя",

  // Auth
  loginVk: "Войти через VK",
  loginYandex: "Войти через Яндекс",
  logout: "Выйти",
  badgeFree: "FREE",
  badgePro: "PRO",
} as const;

export type DmT = typeof dmTranslations;
