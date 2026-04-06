export type SourceType = "article" | "release" | "tool_update";

export interface Item {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceType: SourceType;
  lang: "zh" | "en";
  publishedAt: string;
  summary?: string;
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
  raw_html?: string;
}
