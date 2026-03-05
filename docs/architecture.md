# Architecture (v0)

> Deployment decision: **GitHub Actions** for fetch/generate, **GitHub Pages** for RSS/Web output.

## Pipeline Overview
1. **Collect** (GitHub Actions, scheduled)
2. **Normalize** (unify into Item JSON)
3. **Filter + Dedupe** (developer-focused rules)
4. **Generate** (RSS + Web assets)
5. **Publish** (commit to repo → GitHub Pages)

## Code Structure (proposed)
```
ai_days/
├─ src/
│  ├─ config/
│  │  ├─ sources.yaml      # source definitions
│  │  └─ keywords.yaml     # focus keywords
│  ├─ collectors/
│  │  ├─ bestblogs.ts
│  │  ├─ github_releases.ts
│  │  ├─ html_changelog.ts
│  │  └─ blog_rss.ts
│  ├─ parsers/
│  │  ├─ rss.ts
│  │  ├─ html.ts
│  │  └─ bestblogs_desc.ts
│  ├─ models/
│  │  └─ item.ts           # unified Item type
│  ├─ pipeline/
│  │  ├─ fetch.ts
│  │  ├─ normalize.ts
│  │  └─ dedupe.ts
│  ├─ output/
│  │  ├─ rss.ts
│  │  └─ json.ts
│  └─ main.ts
├─ data/
│  ├─ raw/
│  └─ items/
└─ docs/
```

## Item Schema (draft)
```
{
  id: "source:unique",
  title: "",
  url: "",
  source: "",
  source_type: "article|tweet|tool_update|blog|podcast|video",
  lang: "zh|en",
  published_at: "ISO8601",
  summary_one: "",
  summary_long: "",
  key_points: ["", ""],
  tags: [""],
  score: 0-100,
  raw_html: ""
}
```

## Actions → Pages Flow
- Action runs daily/weekly
- Writes `public/` artifacts (`rss/daily.xml`, `rss/weekly.xml`, `index.html`, etc.)
- Commits to `gh-pages` or `/docs` depending on Pages config

---

Next: finalize collectors + parsing rules per source type.
