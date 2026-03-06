export type SourceType = "article" | "release";

export interface Item {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceType: SourceType;
  lang: "zh" | "en";
  publishedAt: string;
  summary?: string;
  score?: number;
}
