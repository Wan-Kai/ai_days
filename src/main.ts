import { mkdir, writeFile } from "node:fs/promises";
import { collectBestBlogs } from "./collectors/bestblogs.js";
import { collectGithubReleases } from "./collectors/github.js";
import { Item } from "./models/item.js";
import { buildRss } from "./output/rss.js";

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

function mergeAndDedupe(items: Item[]): Item[] {
  const byUrl = new Map<string, Item>();

  for (const item of items.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))) {
    const key = normalizeUrl(item.url);
    if (!byUrl.has(key)) {
      byUrl.set(key, item);
    }
  }

  return [...byUrl.values()];
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(data, null, 2), "utf8");
}

async function main(): Promise<void> {
  const [bestblogsItems, githubItems] = await Promise.all([
    collectBestBlogs(),
    collectGithubReleases(),
  ]);

  const merged = mergeAndDedupe([...bestblogsItems, ...githubItems]);

  await mkdir("data", { recursive: true });
  await mkdir("public/rss", { recursive: true });

  await Promise.all([
    writeJson("data/bestblogs.json", bestblogsItems),
    writeJson("data/github-releases.json", githubItems),
    writeJson("data/daily-merged.json", merged),
  ]);

  const dailyXml = buildRss(merged, {
    title: "ai_days daily",
    link: "https://example.com",
    description: "Daily feed merged from BestBlogs and openai/codex releases",
  });

  await writeFile("public/rss/daily.xml", dailyXml, "utf8");

  console.log(
    `daily pipeline done: bestblogs=${bestblogsItems.length}, github=${githubItems.length}, merged=${merged.length}`,
  );
}

main().catch((error) => {
  console.error("daily pipeline failed", error);
  process.exitCode = 1;
});
