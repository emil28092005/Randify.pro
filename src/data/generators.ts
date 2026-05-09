export interface Generator {
  slug: string;
  title: string;
  description: string;
  icon: string;
  status: 'live' | 'coming-soon';
}

export const generators: Generator[] = [
  {
    slug: 'numbers',
    title: 'Number',
    description: 'Pick a random number within any range you choose.',
    icon: 'hash',
    status: 'live',
  },
  {
    slug: 'colors',
    title: 'Color',
    description: 'Generate a random color in HEX, RGB, or HSL format.',
    icon: 'palette',
    status: 'live',
  },
  {
    slug: 'password',
    title: 'Password',
    description: 'Create a strong, random password with custom rules.',
    icon: 'lock',
    status: 'live',
  },
  {
    slug: 'lottery',
    title: 'Lottery',
    description: 'Draw a set of unique numbers for lottery-style picks.',
    icon: 'ticket',
    status: 'live',
  },
  {
    slug: 'dice',
    title: 'Dice',
    description: 'Roll one or more dice with any number of sides.',
    icon: 'dice-6',
    status: 'live',
  },
  {
    slug: 'cards',
    title: 'Card',
    description: 'Draw a random playing card from a standard deck.',
    icon: 'square-stack',
    status: 'live',
  },
];
