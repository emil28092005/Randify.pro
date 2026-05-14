export const dmTranslations = {
  title: "DM Dashboard",
  subtitle: "Инструменты для мастера подземелий",
  dice: "Кубики",
  initiative: "Инициатива",
  reference: "Справочник",
  notes: "Заметки",
  backToRandify: "← Назад к Randify",
  footer: "Часть Randify — генераторов случайных значений",
  anchorDice: "Кубики",
  anchorInitiative: "Инициатива",
  anchorReference: "Справочник",
  anchorNotes: "Заметки",
} as const;

export type DmT = typeof dmTranslations;
