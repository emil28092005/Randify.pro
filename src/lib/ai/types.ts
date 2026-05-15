import { z } from "zod";

export const npcParamsSchema = z.object({
  race: z.string(),
  role: z.string(),
  level: z.number().int().min(1).max(20),
  tone: z.string(),
  theme: z.string().optional(),
  setting: z.string().optional(),
});

export type NPCParams = z.infer<typeof npcParamsSchema>;

export const npcResultSchema = z.object({
  name: z.string(),
  race: z.string(),
  role: z.string(),
  level: z.number().int(),
  hp: z.number().int(),
  ac: z.number().int(),
  cr: z.string(),
  speed: z.string(),
  appearance: z.string(),
  trait: z.string(),
  motivation: z.string(),
  secret: z.string(),
  history: z.string(),
});

export type NPCResult = z.infer<typeof npcResultSchema>;

export const spellParamsSchema = z.object({
  name: z.string().optional(),
  level: z.number().int().min(0).max(9),
  school: z.string(),
  classes: z.string().optional(),
  tone: z.string().optional(),
});

export type SpellParams = z.infer<typeof spellParamsSchema>;

export const spellResultSchema = z.object({
  name: z.string(),
  level: z.number().int().min(0).max(9),
  school: z.string(),
  casting_time: z.string(),
  range: z.string(),
  components: z.string(),
  duration: z.string(),
  classes: z.string(),
  description: z.string(),
  higher_levels: z.string().optional(),
});

export type SpellResult = z.infer<typeof spellResultSchema>;

export interface Open5eSpell {
  name: string;
  level?: number;
  school?: string;
  casting_time?: string;
  range?: string;
  components?: string;
  duration?: string;
  desc?: string | string[];
  higher_level?: string | string[];
  ritual?: boolean;
  concentration?: boolean;
  classes?: Array<{ name: string }> | string[];
}

export interface Open5eMonster {
  name: string;
  size?: string;
  type?: string;
  subtype?: string;
  alignment?: string;
  armor_class?: number;
  hit_points?: number;
  speed?: Record<string, string | number | null> | string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  challenge_rating_decimal?: number;
  languages?: string;
  senses?: string;
  damage_immunities?: string;
  damage_resistances?: string;
  damage_vulnerabilities?: string;
  condition_immunities?: string;
  actions?: Array<{ name: string; desc: string }>;
  special_abilities?: Array<{ name: string; desc: string }>;
  legendary_actions?: Array<{ name: string; desc: string }>;
}
