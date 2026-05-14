import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog");
  const ruPosts = posts.filter(
    (post) => post.data.lang === "ru" && post.data.draft !== true
  );

  return rss({
    title: "Блог Randify",
    description:
      "Последние обновления, руководства и советы от Randify — инструментов, которые помогают принимать случайные решения.",
    site: context.site!,
    items: ruPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/ru/blog/${post.slug}/`,
    })),
    customData: "<language>ru</language>",
  });
}
