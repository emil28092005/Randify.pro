export type Lang = "en" | "ru";

export const translations = {
  en: {
    allGenerators: "All generators",
    live: "Live",
    comingSoon: "Coming soon",
    copy: "Copy",
    copied: "Copied",
    copyAll: "Copy all",
    howToUse: "How to use",
    whenToUse: "When to use",
    faq: "FAQ",
    about: "About",

    generate: "Generate",
    draw: "Draw",
    roll: "Roll",
    flip: "Flip",
    pick: "Pick",
    spin: "Spin",

    from: "From",
    to: "To",
    length: "Length",
    count: "Count",
    winner: "Winner",
    total: "Total",
    sides: "Sides",
    numberOfDice: "Number of dice",
    numberOfCoins: "Number of coins",
    cardsToDraw: "Cards to draw",
    allowDuplicates: "Allow duplicates",
    uppercase: "Uppercase (A–Z)",
    lowercase: "Lowercase (a–z)",
    digits: "Digits (0–9)",
    symbols: "Symbols (!@#…)",
    type: "Type",
    lengthBytes: "Length (bytes)",
    itemsOneLine: "one per line",
    itemsOneLine224: "one per line, 2–24",
    items: "Items",
    headsLabel: "H",
    tailsLabel: "T",
    headsWord: "heads",
    tailsWord: "tails",

    errBothIntegers: "Both values must be whole numbers.",
    errFromLessThanTo: '"From" must be less than "To".',
    errSelectOneType: "Select at least one character type.",
    errAllIntegers: "All values must be whole numbers.",
    errPickAtLeastOne: '"Pick" must be at least 1.',
    errDiceAtLeast: "Number of dice must be at least 1.",
    errDiceMax: "Maximum 20 dice at once.",
    errDrawAtLeast: "Draw at least 1 card.",
    errMaxUniqueCards: "Cannot draw more than 52 unique cards.",
    errMax52Cards: "Maximum 52 cards at once.",
    errAddAtLeast2: "Add at least 2 items.",
    errMax24: "Maximum 24 items.",
    errAddAtLeast1: "Add at least one item to the list.",
    errPickAtLeast1: "Pick at least 1 item.",

    homeTitle: "Random generators for every occasion",
    homeSubtitle:
      "Simple tools for raffles, games, and everything that needs randomness.",
    defaultTitle: "Randify — Random Value Generators",
    defaultDesc:
      "Simple tools for raffles, games, and everything that needs randomness.",
    brandLabel: "randify",
    backToAll: "All generators",

    aboutTitle: "About Randify",
    aboutMission:
      "Randify exists to make randomness simple, fast, and accessible to everyone. Whether you are picking a winner, rolling dice, or generating a secure password, you should not need to install an app or create an account. Just open the page and get your result.",
    aboutHistory:
      "The idea for Randify came from a simple frustration: every time we needed a quick random number or a coin flip, we ended up on cluttered websites full of ads, pop-ups, and unnecessary steps. We wanted something cleaner — a tool that just works, without distractions.\n\nWe started with a single number generator and gradually expanded the collection based on what people actually use: dice for board games, wheels for raffles, passwords for security, and more. Each tool was built with the same philosophy — minimal interface, instant results, zero friction.",
    aboutHowItWorks:
      "Everything on Randify runs entirely in your browser. No data is sent to any server, no personal information is collected, and no account is required. The random values are generated locally using the Web Crypto API, which provides cryptographically secure randomness. This means your passwords, numbers, and choices stay private — we never see them.",
    aboutContact:
      "Have a suggestion, found a bug, or just want to say hello? Drop us a line at hello@randify.pro — we read every message.",
    aboutCta:
      "Ready to give it a spin? Explore the generators and let chance do the work.",
  },
  ru: {
    allGenerators: "Все генераторы",
    live: "Активен",
    comingSoon: "Скоро",
    copy: "Копировать",
    copied: "Скопировано",
    copyAll: "Копировать всё",
    howToUse: "Как пользоваться",
    whenToUse: "Когда использовать",
    faq: "Частые вопросы",
    about: "О проекте",

    generate: "Сгенерировать",
    draw: "Тянуть",
    roll: "Бросить",
    flip: "Подбросить",
    pick: "Выбрать",
    spin: "Крутить",

    from: "От",
    to: "До",
    length: "Длина",
    count: "Количество",
    winner: "Победитель",
    total: "Итого",
    sides: "Грани",
    numberOfDice: "Количество кубиков",
    numberOfCoins: "Количество монет",
    cardsToDraw: "Карт вытащить",
    allowDuplicates: "Разрешить повторения",
    uppercase: "Заглавные (A–Z)",
    lowercase: "Строчные (a–z)",
    digits: "Цифры (0–9)",
    symbols: "Символы (!@#…)",
    type: "Тип",
    lengthBytes: "Длина (байты)",
    itemsOneLine: "по одному на строку",
    itemsOneLine224: "по одному на строку, 2–24",
    items: "Элементы",
    headsLabel: "О",
    tailsLabel: "Р",
    headsWord: "орёл",
    tailsWord: "решка",

    errBothIntegers: "Оба значения должны быть целыми числами.",
    errFromLessThanTo: "«От» должно быть меньше «До».",
    errSelectOneType: "Выберите хотя бы один тип символов.",
    errAllIntegers: "Все значения должны быть целыми числами.",
    errPickAtLeastOne: "«Выбрать» должно быть не менее 1.",
    errDiceAtLeast: "Количество кубиков должно быть не менее 1.",
    errDiceMax: "Максимум 20 кубиков одновременно.",
    errDrawAtLeast: "Вытащите хотя бы 1 карту.",
    errMaxUniqueCards: "Нельзя вытащить более 52 уникальных карт.",
    errMax52Cards: "Максимум 52 карты одновременно.",
    errAddAtLeast2: "Добавьте хотя бы 2 элемента.",
    errMax24: "Максимум 24 элемента.",
    errAddAtLeast1: "Добавьте хотя бы один элемент в список.",
    errPickAtLeast1: "Выберите хотя бы 1 элемент.",

    homeTitle: "Генераторы случайных значений на любой случай",
    homeSubtitle:
      "Простые инструменты для розыгрышей, игр и всего, что требует случайности.",
    defaultTitle: "Randify — Генераторы случайных значений",
    defaultDesc:
      "Простые инструменты для розыгрышей, игр и всего, что требует случайности.",
    brandLabel: "randify",
    backToAll: "Все генераторы",

    aboutTitle: "О проекте",
    aboutMission:
      "Randify создан, чтобы сделать случайность простой, быстрой и доступной каждому. Независимо от того, выбираете ли вы победителя, бросаете кубики или создаёте надёжный пароль — не нужно устанавливать приложение или регистрироваться. Просто откройте страницу и получите результат.",
    aboutHistory:
      "Идея Randify родилась из простого раздражения: каждый раз, когда нам нужно было быстро сгенерировать случайное число или подбросить монетку, мы попадали на перегруженные рекламой сайты с всплывающими окнами и лишними шагами. Мы хотели создать что-то чище — инструмент, который просто работает, без отвлекающих элементов.\n\nМы начали с одного генератора чисел и постепенно расширяли коллекцию, ориентируясь на реальные потребности: кубики для настольных игр, колесо фортуны для розыгрышей, генератор паролей для безопасности и многое другое. Каждый инструмент создавался по одному принципу — минимальный интерфейс, мгновенный результат, никаких препятствий.",
    aboutHowItWorks:
      "Всё на Randify работает полностью в вашем браузере. Данные не отправляются на сервер, личная информация не собирается, регистрация не требуется. Случайные значения генерируются локально с помощью Web Crypto API, который обеспечивает криптографически стойкую случайность. Это означает, что ваши пароли, числа и выбор остаются приватными — мы их не видим.",
    aboutContact:
      "Есть предложение, нашли ошибку или просто хотите поздороваться? Напишите нам на hello@randify.pro — мы читаем каждое сообщение.",
    aboutCta:
      "Готовы попробовать? Откройте генераторы и позвольте случайности сделать выбор за вас.",
  },
} as const;

export type T = typeof translations.en;

export function useT(lang: Lang): T {
  return translations[lang] as T;
}
