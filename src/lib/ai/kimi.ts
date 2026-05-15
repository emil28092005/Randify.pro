import {
  npcParamsSchema,
  npcResultSchema,
  spellParamsSchema,
  spellResultSchema,
  type NPCParams,
  type NPCResult,
  type Open5eMonster,
  type SpellParams,
  type SpellResult,
  type Open5eSpell,
} from "./types";

const KIMI_API_URL = "https://api.moonshot.ai/v1/chat/completions";
const KIMI_MODEL = "moonshot-v1-8k";
const REQUEST_TIMEOUT_MS = 10_000;

const npcJsonSchema = {
  type: "object" as const,
  properties: {
    name: { type: "string" },
    race: { type: "string" },
    role: { type: "string" },
    level: { type: "integer" },
    hp: { type: "integer" },
    ac: { type: "integer" },
    cr: { type: "string" },
    speed: { type: "string" },
    appearance: { type: "string" },
    trait: { type: "string" },
    motivation: { type: "string" },
    secret: { type: "string" },
    history: { type: "string" },
  },
  required: [
    "name",
    "race",
    "role",
    "level",
    "hp",
    "ac",
    "cr",
    "speed",
    "appearance",
    "trait",
    "motivation",
    "secret",
    "history",
  ],
};

function buildSystemPrompt(): string {
  return [
    "You are a Dungeons & Dragons NPC generator.",
    "You MUST respond with valid JSON only. Do NOT wrap the response in markdown code blocks.",
    "Do NOT include any explanatory text outside the JSON object.",
    "The JSON must exactly match the provided schema.",
  ].join(" ");
}

function formatMonsterReference(monster: Open5eMonster): string {
  const parts: string[] = [`Open5e Reference Monster: ${monster.name}`];
  if (monster.size) parts.push(`Size: ${monster.size}`);
  if (monster.type) parts.push(`Type: ${monster.type}`);
  if (monster.alignment) parts.push(`Alignment: ${monster.alignment}`);
  if (monster.armor_class != null) parts.push(`AC: ${monster.armor_class}`);
  if (monster.hit_points != null) parts.push(`HP: ${monster.hit_points}`);
  if (monster.challenge_rating_decimal != null)
    parts.push(`CR: ${monster.challenge_rating_decimal}`);
  if (monster.speed) {
    const speedText =
      typeof monster.speed === "string"
        ? monster.speed
        : Object.entries(monster.speed)
            .map(([k, v]) => `${k} ${v}`)
            .join(", ");
    parts.push(`Speed: ${speedText}`);
  }
  if (monster.languages) parts.push(`Languages: ${monster.languages}`);
  if (monster.senses) parts.push(`Senses: ${monster.senses}`);
  if (monster.actions?.length) {
    parts.push(
      `Actions: ${monster.actions.map((a) => `${a.name} (${a.desc})`).join("; ")}`
    );
  }
  if (monster.special_abilities?.length) {
    parts.push(
      `Special Abilities: ${monster.special_abilities.map((a) => `${a.name} (${a.desc})`).join("; ")}`
    );
  }
  return parts.join("\n");
}

function buildUserPrompt(params: NPCParams, reference?: Open5eMonster): string {
  const lines: string[] = [
    `Generate a D&D NPC with the following parameters:`,
    `- Race: ${params.race}`,
    `- Role/Class: ${params.role}`,
    `- Level: ${params.level}`,
    `- Tone: ${params.tone}`,
  ];

  if (reference) {
    lines.push("");
    lines.push("Use the following Open5e monster as a mechanical reference for balancing stats:");
    lines.push(formatMonsterReference(reference));
  }

  lines.push("");
  lines.push("Respond with a single JSON object matching this schema:");
  lines.push(JSON.stringify(npcJsonSchema, null, 2));

  return lines.join("\n");
}

export class KimiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseBody?: string
  ) {
    super(message);
    this.name = "KimiClientError";
  }
}

const spellJsonSchema = {
  type: "object" as const,
  properties: {
    name: { type: "string" },
    level: { type: "integer" },
    school: { type: "string" },
    casting_time: { type: "string" },
    range: { type: "string" },
    components: { type: "string" },
    duration: { type: "string" },
    classes: { type: "string" },
    description: { type: "string" },
    higher_levels: { type: "string" },
  },
  required: [
    "name",
    "level",
    "school",
    "casting_time",
    "range",
    "components",
    "duration",
    "classes",
    "description",
  ],
};

function buildSpellSystemPrompt(): string {
  return [
    "You are a Dungeons & Dragons 5e spell designer.",
    "You MUST respond with valid JSON only. Do NOT wrap the response in markdown code blocks.",
    "Do NOT include any explanatory text outside the JSON object.",
    "The JSON must exactly match the provided schema.",
  ].join(" ");
}

function formatSpellReference(spell: Open5eSpell): string {
  const parts: string[] = [`Open5e Reference Spell: ${spell.name}`];
  if (spell.level !== undefined) parts.push(`Level: ${spell.level}`);
  if (spell.school) parts.push(`School: ${spell.school}`);
  if (spell.casting_time) parts.push(`Casting time: ${spell.casting_time}`);
  if (spell.range) parts.push(`Range: ${spell.range}`);
  if (spell.duration) parts.push(`Duration: ${spell.duration}`);
  if (spell.components) parts.push(`Components: ${spell.components}`);
  if (spell.desc) {
    const desc = Array.isArray(spell.desc) ? spell.desc.join(" ") : spell.desc;
    parts.push(`Description: ${desc}`);
  }
  return parts.join("\n");
}

function buildSpellUserPrompt(params: SpellParams, reference?: Open5eSpell): string {
  const lines: string[] = [
    `Generate a D&D 5e spell with the following parameters:`,
    `- Level: ${params.level}`,
    `- School: ${params.school}`,
  ];
  if (params.classes) lines.push(`- Classes: ${params.classes}`);
  if (params.tone) lines.push(`- Tone: ${params.tone}`);
  if (params.name) lines.push(`- Suggested name: ${params.name}`);

  if (reference) {
    lines.push("");
    lines.push("Use the following Open5e spell as a balance reference. Do not exceed its power band:");
    lines.push(formatSpellReference(reference));
  }

  lines.push("");
  lines.push("Respond with a single JSON object matching this schema:");
  lines.push(JSON.stringify(spellJsonSchema, null, 2));

  return lines.join("\n");
}

export async function generateSpell(
  params: SpellParams,
  reference?: Open5eSpell
): Promise<SpellResult> {
  spellParamsSchema.parse(params);

  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new KimiClientError("KIMI_API_KEY is not configured");
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(KIMI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages: [
          { role: "system", content: buildSpellSystemPrompt() },
          { role: "user", content: buildSpellUserPrompt(params, reference) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "spell_result",
            strict: true,
            schema: spellJsonSchema,
          },
        },
        temperature: 0.7,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => undefined);
      if (response.status === 429) {
        throw new KimiClientError("Kimi API rate limit exceeded", response.status, body);
      }
      throw new KimiClientError(
        `Kimi API error: ${response.status} ${response.statusText}`,
        response.status,
        body,
      );
    }

    const responseText = await response.text();
    let data: {
      choices?: Array<{ message?: { content?: string | null } }>;
      error?: { message?: string };
    };
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new KimiClientError("Kimi API returned invalid JSON", undefined, responseText);
    }

    if (data.error?.message) {
      throw new KimiClientError(`Kimi API error: ${data.error.message}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new KimiClientError("Kimi API returned empty content");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new KimiClientError("Kimi API returned invalid JSON", undefined, content);
    }

    const validation = spellResultSchema.safeParse(parsed);
    if (!validation.success) {
      throw new KimiClientError(
        `Kimi API spell validation failed: ${validation.error.message}`,
        undefined,
        content,
      );
    }

    return validation.data;
  } catch (error) {
    if (error instanceof KimiClientError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new KimiClientError("Kimi API request timed out after 10s");
    }
    throw new KimiClientError(
      error instanceof Error ? error.message : "Unknown Kimi API error",
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateNPC(
  params: NPCParams,
  reference?: Open5eMonster
): Promise<NPCResult> {
  npcParamsSchema.parse(params);

  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new KimiClientError("KIMI_API_KEY is not configured");
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(KIMI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(params, reference) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "npc_result",
            strict: true,
            schema: npcJsonSchema,
          },
        },
        temperature: 0.7,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => undefined);
      if (response.status === 429) {
        throw new KimiClientError(
          "Kimi API rate limit exceeded",
          response.status,
          body
        );
      }
      throw new KimiClientError(
        `Kimi API error: ${response.status} ${response.statusText}`,
        response.status,
        body
      );
    }

    const responseText = await response.text();

    let data: {
      choices?: Array<{
        message?: {
          content?: string | null;
        };
      }>;
      error?: {
        message?: string;
      };
    };
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new KimiClientError(
        "Kimi API returned invalid JSON",
        undefined,
        responseText
      );
    }

    if (data.error?.message) {
      throw new KimiClientError(`Kimi API error: ${data.error.message}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new KimiClientError("Kimi API returned empty content");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new KimiClientError(
        "Kimi API returned invalid JSON",
        undefined,
        content
      );
    }

    const validation = npcResultSchema.safeParse(parsed);
    if (!validation.success) {
      throw new KimiClientError(
        `Kimi API response validation failed: ${validation.error.message}`,
        undefined,
        content
      );
    }

    return validation.data;
  } catch (error) {
    if (error instanceof KimiClientError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new KimiClientError("Kimi API request timed out after 10s");
    }
    throw new KimiClientError(
      error instanceof Error ? error.message : "Unknown Kimi API error"
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
