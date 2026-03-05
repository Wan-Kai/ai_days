# Scheduling Layer (v0)

> Deployment: GitHub Actions for fetch/generate, GitHub Pages for publish.

## 1) Workflow Goals
- Daily pipeline: collect → normalize → filter → generate → publish
- Weekly pipeline: same, with weekly inputs and outputs

## 2) Schedules
- **Daily**: 08:00 Asia/Shanghai
- **Weekly**: Sunday 09:00 Asia/Shanghai

(Use cron in UTC; convert at implementation time.)

## 3) GitHub Actions Structure
```
.github/workflows/
├─ daily.yml
└─ weekly.yml
```

Each workflow:
1. checkout repo
2. setup node
3. install deps
4. run pipeline (daily/weekly)
5. commit generated files to `public/`
6. deploy to GitHub Pages

## 4) Data Flow
- Inputs: sources.yaml + raw fetch
- Outputs: public/rss/*.xml + public/*.html
- Optional: cache raw JSON to `data/`

## 5) Deployment Strategy
Option A: **Pages from /docs**
- Action writes to `/docs`
- Pages set to `/docs` branch `main`

Option B: **Pages from gh-pages branch** (recommended)
- Action deploys `public/` to `gh-pages`
- Keeps source clean

## 6) Secrets (if needed)
- GitHub token (default)
- Optional: 3rd party APIs

## 7) Failure Handling
- Action fails on error
- Optional: post failure summary to issue/Slack (future)

---

Next: decide Pages strategy (main/docs vs gh-pages) + cron exact times.
