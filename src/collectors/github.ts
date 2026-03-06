import { Item } from "../models/item.js";

const RELEASES_URL = "https://api.github.com/repos/openai/codex/releases";

interface GitHubRelease {
  id: number;
  html_url: string;
  name: string | null;
  tag_name: string;
  body: string | null;
  published_at: string | null;
  draft: boolean;
}

export async function collectGithubReleases(): Promise<Item[]> {
  const response = await fetch(RELEASES_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "ai_days_daily_pipeline",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const releases = (await response.json()) as GitHubRelease[];

  return releases
    .filter((release) => !release.draft)
    .map((release) => ({
      id: `github-release:${release.id}`,
      title: release.name?.trim() || release.tag_name,
      url: release.html_url,
      source: "GitHub/openai/codex",
      sourceType: "release",
      lang: "en",
      publishedAt: release.published_at
        ? new Date(release.published_at).toISOString()
        : new Date().toISOString(),
      summary: release.body?.slice(0, 400).trim(),
    }))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
