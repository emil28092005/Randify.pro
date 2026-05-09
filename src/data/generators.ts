export interface Generator {
  slug: string;
  title: string;
  description: string;
  icon: string;
  status: 'live' | 'coming-soon';
  seoTitle: string;
  seoDescription: string;
}

export const generators: Generator[] = [
  {
    slug: 'numbers',
    title: 'Number',
    description: 'Pick a random number within any range you choose.',
    icon: 'hash',
    status: 'live',
    seoTitle: 'Random Number Generator | Randify',
    seoDescription: 'Generate a random number between any two values instantly. Free online random number picker — perfect for giveaways, games, and decisions.',
  },
  {
    slug: 'colors',
    title: 'Color',
    description: 'Generate a random color in HEX, RGB, or HSL format.',
    icon: 'palette',
    status: 'live',
    seoTitle: 'Random Color Generator — HEX, RGB, HSL | Randify',
    seoDescription: 'Get a random color in HEX, RGB or HSL format with one click. Free online color randomizer for designers and developers.',
  },
  {
    slug: 'password',
    title: 'Password',
    description: 'Create a strong, random password with custom rules.',
    icon: 'lock',
    status: 'live',
    seoTitle: 'Random Password Generator | Randify',
    seoDescription: 'Create a strong random password with custom length, uppercase, lowercase, digits and symbols. Free and secure — runs entirely in your browser.',
  },
  {
    slug: 'lottery',
    title: 'Lottery',
    description: 'Draw a set of unique numbers for lottery-style picks.',
    icon: 'ticket',
    status: 'live',
    seoTitle: 'Lottery Number Generator — Random Pick | Randify',
    seoDescription: 'Draw a set of unique random lottery numbers from any range. Perfect for lotteries, raffles, and lucky draws. Free online lottery picker.',
  },
  {
    slug: 'dice',
    title: 'Dice',
    description: 'Roll one or more dice with any number of sides.',
    icon: 'dice-6',
    status: 'live',
    seoTitle: 'Online Dice Roller — d4, d6, d20 and more | Randify',
    seoDescription: 'Roll virtual dice online. Supports d4, d6, d8, d10, d12, d20 and d100. Roll multiple dice at once — great for D&D, board games and tabletop RPGs.',
  },
  {
    slug: 'cards',
    title: 'Card',
    description: 'Draw a random playing card from a standard deck.',
    icon: 'square-stack',
    status: 'live',
    seoTitle: 'Random Card Generator — Draw from a Deck | Randify',
    seoDescription: 'Draw random playing cards from a standard 52-card deck. Pick any number of cards, with or without replacement. Free online card picker.',
  },
  {
    slug: 'coin',
    title: 'Coin Flip',
    description: 'Flip one or more coins and see heads or tails.',
    icon: 'circle-dollar-sign',
    status: 'live',
    seoTitle: 'Coin Flip Online — Heads or Tails | Randify',
    seoDescription: 'Flip a virtual coin online. Flip multiple coins at once and see how many heads and tails you get. Free random coin toss simulator.',
  },
  {
    slug: 'list',
    title: 'List Picker',
    description: 'Paste a list of items and pick random winners.',
    icon: 'list',
    status: 'live',
    seoTitle: 'Random List Picker — Pick a Random Winner | Randify',
    seoDescription: 'Paste any list of names or items and pick random winners instantly. Great for giveaways, choosing who goes first, or any random selection.',
  },
  {
    slug: 'uuid',
    title: 'UUID / Token',
    description: 'Generate UUIDs, hex tokens, or random base64 strings.',
    icon: 'fingerprint',
    status: 'live',
    seoTitle: 'UUID Generator — UUID v4, Hex & Base64 Tokens | Randify',
    seoDescription: 'Generate random UUID v4, hex tokens, or base64 strings online. Cryptographically secure, runs in your browser. Free UUID and token generator.',
  },
  {
    slug: 'wheel',
    title: 'Spin the Wheel',
    description: 'Add your items, spin the wheel, and let chance decide.',
    icon: 'pie-chart',
    status: 'live',
    seoTitle: 'Spin the Wheel — Random Picker | Randify',
    seoDescription: 'Spin a customizable wheel of fortune to pick a random winner, choice, or option. Add your own items and let the wheel decide.',
  },
];
