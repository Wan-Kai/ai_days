import { Item } from "../models/item.js";
import { parseRssFromUrl } from "../parsers/rss.js";

const BESTBLOGS_URL =
  "https://www.bestblogs.dev/zh/feeds/rss?type=article&timeFilter=1d&minScore=85";
const MIN_SCORE = 85;
const WINDOW_MS = 24 * 60 * 60 * 1000;

function extractScore(text?: string): number | undefined {
  if (!text) return undefined;
  const matches = [...text.matchAll(/(?:score|评分|热度)?\s*[:：]?\s*([1-9]\d|100)\b/gi)];
  if (matches.length === 0) return undefined;
  const score = Number(matches[matches.length - 1][1]);
  return Number.isFinite(score) ? score : undefined;
}

function isWithinLastDay(isoOrDate?: string): boolean {
  if (!isoOrDate) return false;
  const ts = Date.parse(isoOrDate);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= WINDOW_MS;
}

export async function collectBestBlogs(): Promise<Item[]> {
  const rssItems = await parseRssFromUrl(BESTBLOGS_URL);

  return rssItems
    .map((entry) => {
      const rawText = [entry.title, entry.summary, entry.contentSnippet, entry.content]
        .filter(Boolean)
        .join(" ");
      const score = extractScore(rawText);
      const publishedAt = entry.isoDate ?? entry.pubDate;

      return {
        id: `bestblogs:${entry.link ?? entry.title ?? Math.random().toString(36).slice(2)}`,
        title: entry.title?.trim() || "(untitled)",
        url: entry.link?.trim() || "",
        source: "BestBlogs",
        sourceType: "article",
        lang: "zh",
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        summary: entry.contentSnippet?.trim() || entry.summary?.trim(),
        score,
      } satisfies Item;
    })
    .filter((item) => item.url)
    .filter((item) => isWithinLastDay(item.publishedAt))
    .filter((item) => (item.score ?? 0) >= MIN_SCORE)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
