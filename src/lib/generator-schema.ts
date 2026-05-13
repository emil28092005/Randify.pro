import { z } from "zod";

export const generatorSchema = z
  .object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    status: z.enum(["live", "coming-soon"]),
    seoTitle: z.string(),
    seoDescription: z.string(),
    ruTitle: z.string(),
    ruDescription: z.string(),
    ruSeoTitle: z.string(),
    ruSeoDescription: z.string(),
    pageTitle: z.string(),
    ruPageTitle: z.string(),
    howTo: z.array(z.string()),
    whenTo: z.array(z.string()),
    ruHowTo: z.array(z.string()),
    ruWhenTo: z.array(z.string()),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    ruFaq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    category: z.enum(["gaming", "security", "decision-making", "creative", "utility"]),
  })
  .strict();

export type Generator = z.infer<typeof generatorSchema>;
