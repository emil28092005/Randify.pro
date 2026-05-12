import { generatorSchema } from "@/lib/generator-schema";
import type { Generator } from "@/lib/generator-schema";

const modules = import.meta.glob<{ default: unknown }>(
  "../content/generators/*.json",
  {
    eager: true,
  },
);

export const generators: Generator[] = Object.values(modules).map((mod) =>
  generatorSchema.parse(mod.default),
);

export function findGenerator(slug: string): Generator {
  const g = generators.find((gen) => gen.slug === slug);
  if (!g) throw new Error(`Generator not found: ${slug}`);
  return g;
}

export type { Generator };
