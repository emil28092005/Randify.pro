import { defineCollection, z } from "astro:content";
import { generatorSchema } from "@/lib/generator-schema";

const generators = defineCollection({
  type: "data",
  schema: generatorSchema,
});

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      description: z.string().max(160),
      pubDate: z.date(),
      modDate: z.date().optional(),
      draft: z.boolean().default(false),
      lang: z.enum(["en", "ru"]),
      category: z.enum(["tutorial", "guide", "news", "tips"]),
      tags: z.array(z.string()).default([]),
      ogImage: image().optional(),
      relatedGenerators: z.array(z.string()).optional(),
      relatedPosts: z.array(z.string()).optional(),
    }),
});

export const collections = {
  generators,
  blog,
};
