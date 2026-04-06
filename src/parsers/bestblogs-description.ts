export interface BestBlogsStructuredDescription {
  summary_one?: string;
  summary_long?: string;
  key_points?: string[];
  quotes?: string[];
  score?: number;
  author?: string;
  source_site?: string;
  category?: string;
  language?: string;
  reading_time?: string;
  word_count?: number;
  tags?: string[];
  raw_html: string;
  plain_text: string;
}

const SECTION_KEYS = [
  { key: "summary_one", token: "一句话摘要" },
  { key: "summary_long", token: "详细摘要" },
  { key: "key_points", token: "主要观点" },
  { key: "quotes", token: "文章金句" },
  { key: "info", token: "文章信息" },
] as const;

type SectionKey = (typeof SECTION_KEYS)[number]["key"];

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, dec) => {
      const cp = Number(dec);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : _;
    })
    .replace(/&#x([\da-f]+);/gi, (_, hex) => {
      const cp = Number.parseInt(hex, 16);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : _;
    })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function htmlToText(raw: string): string {
  return decodeHtmlEntities(
    raw
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\s*\/\s*(p|div|section|article|h[1-6]|li|ul|ol)\s*>/gi, "\n")
      .replace(/<\s*li\b[^>]*>/gi, "\n- ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeLine(line: string): string {
  return line
    .replace(/[📌📝💡💬📊]/g, "")
    .replace(/[•·●]/g, "")
    .replace(/^[-*\s]+/, "")
    .trim();
}

function findSectionByHeading(line: string): SectionKey | undefined {
  const normalized = normalizeLine(line);
  return SECTION_KEYS.find((entry) => normalized.includes(entry.token))?.key;
}

function firstNonEmpty(lines: string[]): string | undefined {
  return lines.map((line) => normalizeLine(line)).find(Boolean);
}

function cleanValue(value?: string): string | undefined {
  if (!value) return undefined;
  const cleaned = normalizeLine(value)
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || undefined;
}

function parseScore(text: string): number | undefined {
  const match = text.match(/AI\s*评分\s*[:：]\s*(\d{1,3})/i) || text.match(/评分\s*[:：]\s*(\d{1,3})/i);
  if (!match) return undefined;
  const score = Number(match[1]);
  return Number.isFinite(score) ? score : undefined;
}

function parseWordCount(text: string): number | undefined {
  const match = text.match(/字数\s*[:：]\s*([\d,，]+)/);
  if (!match) return undefined;
  const count = Number(match[1].replace(/[，,]/g, ""));
  return Number.isFinite(count) ? count : undefined;
}

function parseInfoSection(infoLines: string[]): {
  score?: number;
  source_site?: string;
  author?: string;
  category?: string;
  language?: string;
  reading_time?: string;
  word_count?: number;
  tags?: string[];
} {
  const text = infoLines.join("\n");

  const source_site = cleanValue(text.match(/来源\s*[:：]\s*([^\n]+)/)?.[1]);
  const author = cleanValue(text.match(/作者\s*[:：]\s*([^\n]+)/)?.[1]);
  const category = cleanValue(text.match(/分类\s*[:：]\s*([^\n]+)/)?.[1]);
  const language = cleanValue(text.match(/语言\s*[:：]\s*([^\n]+)/)?.[1]);
  const reading_time = cleanValue(text.match(/阅读时间\s*[:：]\s*([^\n]+)/)?.[1]);
  const score = parseScore(text);
  const word_count = parseWordCount(text);

  const tagsStart = text.match(/标签\s*[:：]\s*([\s\S]*)/);
  const tagsText = cleanValue(tagsStart?.[1]);
  const tags = tagsText
    ?.split(/[，,、]/)
    .map((tag) => cleanValue(tag))
    .filter((tag): tag is string => Boolean(tag));

  return {
    score,
    source_site,
    author,
    category,
    language,
    reading_time,
    word_count,
    tags: tags && tags.length > 0 ? tags : undefined,
  };
}

function parseBlocks(sectionLines: string[]): string[] {
  const joined = sectionLines.join("\n");
  const blocks = joined
    .split(/\n\s*\n+/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => cleanValue(line))
        .filter((line): line is string => Boolean(line)),
    )
    .filter((lines) => lines.length > 0)
    .map((lines) => lines[0])
    .filter((line) => line !== "阅读完整文章");

  return blocks;
}

function parseQuotes(sectionLines: string[]): string[] {
  const quotes = sectionLines
    .map((line) => cleanValue(line))
    .filter((line): line is string => Boolean(line))
    .filter((line) => line !== "阅读完整文章");

  return quotes;
}

export function parseBestBlogsDescription(rawHtml?: string): BestBlogsStructuredDescription {
  const html = (rawHtml || "").trim();
  const plain_text = htmlToText(html);

  const sections: Partial<Record<SectionKey, string[]>> = {};
  let currentSection: SectionKey | undefined;

  for (const line of plain_text.split("\n")) {
    const heading = findSectionByHeading(line);
    if (heading) {
      currentSection = heading;
      if (!sections[currentSection]) sections[currentSection] = [];
      continue;
    }

    if (!currentSection) continue;
    sections[currentSection]!.push(line);
  }

  const summary_one = firstNonEmpty(sections.summary_one ?? []);
  const summary_long = cleanValue((sections.summary_long ?? []).join(" "));
  const key_points = parseBlocks(sections.key_points ?? []);
  const quotes = parseQuotes(sections.quotes ?? []);
  const info = parseInfoSection(sections.info ?? []);

  return {
    summary_one,
    summary_long,
    key_points: key_points.length > 0 ? key_points : undefined,
    quotes: quotes.length > 0 ? quotes : undefined,
    score: info.score,
    author: info.author,
    source_site: info.source_site,
    category: info.category,
    language: info.language,
    reading_time: info.reading_time,
    word_count: info.word_count,
    tags: info.tags,
    raw_html: html,
    plain_text,
  };
}
