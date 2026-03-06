import Parser from "rss-parser";

export interface ParsedRssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
}

const parser = new Parser<unknown, ParsedRssItem>();

export async function parseRssFromUrl(url: string): Promise<ParsedRssItem[]> {
  const feed = await parser.parseURL(url);
  return feed.items ?? [];
}
