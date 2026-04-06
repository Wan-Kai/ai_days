import { load } from "cheerio";
import { Item } from "../models/item.js";

const CURSOR_CHANGELOG_URL = "https://cursor.com/cn/changelog";

interface CursorEntryMeta {
  version: string;
  dateISO: string;
  title: string;
  url: string;
}

function extractMeta($: cheerio.Root, article: cheerio.Element): CursorEntryMeta | null {
  const root = $(article);
  const headerLink = root.find("a[href^='/changelog/']").first();
  const title = headerLink.text().trim();
  const urlPath = headerLink.attr("href") || "";
  const url = urlPath.startsWith("http") ? urlPath : `https://cursor.com${urlPath}`;

  const metaLink = root.prevAll("div").first().find("a[href^='/changelog/']");
  const versionMatch = metaLink.text().trim().match(/([0-9]+\.[0-9]+(?:\.[0-9]+)?)/);
  const version = versionMatch ? versionMatch[1] : "";
  const timeEl = metaLink.find("time");
  const dateISO = timeEl.attr("datetime") || new Date().toISOString();

  if (!title || !url) return null;

  return { version, dateISO, title, url };
}

export async function collectCursorChangelog(limit = 3): Promise<Item[]> {
  const res = await fetch(CURSOR_CHANGELOG_URL, {
    headers: {
      "User-Agent": "ai_days_cursor_scraper",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error(`Cursor changelog fetch failed: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const $ = load(html);

  const articles: cheerio.Element[] = [];
  $("article").each((_, el) => {
    articles.push(el);
  });

  const items: Item[] = [];

  for (const article of articles.slice(0, limit)) {
    const meta = extractMeta($, article);
    if (!meta) continue;

    const bodyText = $(article)
      .find("h2, h3, p, li")
      .map((_, el) => $(el).text())
      .get()
      .join("\n");

    const summaryLines = bodyText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const summary_one = summaryLines[0] || "";
    const key_points = summaryLines.slice(1, 6);

    items.push({
      id: `cursor:${meta.version || meta.url}`,
      title: meta.title,
      url: meta.url,
      source: "Cursor",
      sourceType: "tool_update",
      lang: "zh",
      publishedAt: new Date(meta.dateISO).toISOString(),
      summary: summary_one,
      summary_one,
      key_points,
      tags: ["Cursor", "IDE", "Changelog"],
    });
  }

  return items;
}
