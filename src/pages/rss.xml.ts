import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog");
  const enPosts = posts.filter(
    (post) => post.data.lang === "en" && post.data.draft !== true
  );

  return rss({
    title: "Randify Blog",
    description:
      "Latest updates, tutorials, and tips from Randify — tools that help you make random decisions.",
    site: context.site!,
    items: enPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.slug}/`,
    })),
    customData: "<language>en</language>",
  });
}
