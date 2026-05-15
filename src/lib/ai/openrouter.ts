import { z } from "zod";
import type { Monster } from "@/lib/open5e/client";

export type Open5eMonster = Monster;

export interface NPCParams {
  theme?: string;
  setting?: string;
  role?: string;
  level?: number;
  race?: string;
}

export interface NPCResult {
  name: string;
  race: string;
  role: string;
  hp: number;
  ac: number;
  cr: string;
  speed: string;
  appearance: string;
  trait: string;
  motivation: string;
  secret: string;
  history: string;
}

const npcResultSchema = z.object({
  name: z.string(),
  race: z.string(),
  role: z.string(),
  hp: z.number(),
  ac: z.number(),
  cr: z.string(),
  speed: z.string(),
  appearance: z.string(),
  trait: z.string(),
  motivation: z.string(),
  secret: z.string(),
  history: z.string(),
});

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b:free";
const TIMEOUT_MS = 10_000;

function buildSystemPrompt(): string {
  return "You are a creative D&D NPC generator. Respond with valid JSON only, no markdown, no code fences, no explanatory text.";
}

function buildUserPrompt(params: NPCParams, reference?: Monster): string {
  const schema = JSON.stringify({
    name: "string (unique name)",
    race: "string (e.g. Human, Elf, Orc)",
    role: "string (e.g. Merchant, Bandit, Wizard)",
    hp: "number (hit points)",
    ac: "number (armor class)",
    cr: "string (challenge rating, e.g. '1/4', '5')",
    speed: "string (e.g. '30 ft.')",
    appearance: "string (2-3 sentences)",
    trait: "string (personality trait)",
    motivation: "string (what drives them)",
    secret: "string (a hidden secret)",
    history: "string (1-2 sentence backstory)",
  });

  let prompt = `Generate a D&D NPC with the following parameters:\n`;
  if (params.theme) prompt += `- Theme: ${params.theme}\n`;
  if (params.setting) prompt += `- Setting: ${params.setting}\n`;
  if (params.role) prompt += `- Role: ${params.role}\n`;
  if (params.level) prompt += `- Level/CR range: around ${params.level}\n`;
  if (params.race) prompt += `- Race: ${params.race}\n`;

  if (reference) {
    prompt += `\nUse this reference monster stat block for balance:\n`;
    prompt += `- Name: ${reference.name}\n`;
    prompt += `- Type: ${reference.type}\n`;
    prompt += `- HP: ${reference.hit_points}\n`;
    prompt += `- AC: ${reference.armor_class}\n`;
    prompt += `- CR: ${reference.challenge_rating_decimal}\n`;
  }

  prompt += `\nRespond with valid JSON matching this schema:\n${schema}`;
  return prompt;
}

export async function translateOpen5eContent(
  content: Record<string, unknown>,
  type: "creature" | "spell",
  model: string = DEFAULT_MODEL
): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const systemPrompt =
    "You are a D&D content translator. Translate the provided JSON object into Russian. " +
    "Preserve the exact JSON structure and all keys. " +
    "Translate only human-readable text fields (names, descriptions, labels, etc.). " +
    "Keep numeric values, slugs, URLs, and mechanical identifiers unchanged. " +
    "Respond with valid JSON only, no markdown, no code fences, no explanatory text.";

  const userPrompt = `Translate this D&D ${type} into Russian. Preserve JSON structure exactly. Only translate text values.\n\n${JSON.stringify(content, null, 2)}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.PUBLIC_APP_URL || "https://randify.pro",
        "X-Title": "Randify.pro DM Dashboard",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (response.status === 429) {
      throw new Error("Rate limited by OpenRouter (429)");
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const responseContent = data.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenRouter");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(responseContent);
    } catch {
      throw new Error(`Invalid JSON in OpenRouter response: ${responseContent}`);
    }

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("OpenRouter response is not a JSON object");
    }

    return parsed as Record<string, unknown>;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("OpenRouter request timed out after 10s");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateNPC(
  params: NPCParams,
  reference?: Monster,
  model: string = DEFAULT_MODEL
): Promise<NPCResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.PUBLIC_APP_URL || "https://randify.pro",
        "X-Title": "Randify.pro DM Dashboard",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(params, reference) },
        ],
        temperature: 0.8,
      }),
      signal: controller.signal,
    });

    if (response.status === 429) {
      throw new Error("Rate limited by OpenRouter (429)");
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenRouter");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(`Invalid JSON in OpenRouter response: ${content}`);
    }

    const validated = npcResultSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error(
        `NPC schema validation failed: ${validated.error.message}`
      );
    }

    return validated.data;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("OpenRouter request timed out after 10s");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
