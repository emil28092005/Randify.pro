import { defineCollection } from "astro:content";
import { generatorSchema } from "@/lib/generator-schema";

const generators = defineCollection({
  type: "data",
  schema: generatorSchema,
});

export const collections = {
  generators,
};
