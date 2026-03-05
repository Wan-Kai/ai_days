# Generation Layer (v0)

> Goal: convert filtered Items into **RSS + Web** outputs, using a unified template.

## 1) Outputs
- `public/rss/daily.xml`
- `public/rss/weekly.xml`
- `public/index.html` (latest daily)
- `public/weekly.html`
- `public/archive/` (optional)

## 2) RSS Design
**Channel fields**
- title: "AI 小喇叭 · 日报" / "AI 小喇叭 · 周报"
- link: site base URL
- description: short summary
- lastBuildDate: build timestamp
- ttl: 60

**Item mapping**
- title: `item.title`
- link: `item.url`
- guid: `item.id`
- pubDate: `item.published_at`
- description: HTML block

**Description HTML block (统一模板)**
```
<h3>摘要</h3>
<p>{summary_one or summary_long}</p>
<h4>要点</h4>
<ul><li>...</li></ul>
<p><strong>来源：</strong>{source}</p>
<p><strong>标签：</strong>{tags}</p>
```

## 3) Web Page Design
- 首页展示「最新日报」+ 链接到周报
- 每条 item 展示：标题 + 一句话摘要 + 标签 + 来源 + 时间
- 支持按 section 分组（工具/博客/文章/观点）

## 4) Section Grouping (Daily)
- 工具/产品更新
- 官方博客
- 研究/技术文章
- 社媒观点

## 5) Weekly Structure
- 本周主题综述（由汇总器生成）
- 播客精选
- 视频精选

## 6) Generation Steps
1. Read filtered JSON
2. Group by purpose (daily/weekly) and section
3. Render RSS (XML)
4. Render HTML (static templates)
5. Write to `public/`

## 7) Template Strategy
- Use simple string templates or lightweight engine (e.g., EJS)
- Keep RSS and HTML templates in `src/templates/`

---

Next: confirm template content fields + styling preference.
