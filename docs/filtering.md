# Filtering Layer (v0)

> Goal: select developer-relevant items, dedupe, and rank for daily/weekly outputs.

## 1) Filtering Stages

1. **Basic validity**
   - require: `id`, `title`, `url`
   - drop empty or obviously broken items

2. **Time window**
   - daily: last 24h (or `timeFilter=1d` from sources)
   - weekly: last 7d

3. **Source weighting (priority)**
   - tool_update > official_blog > bestblogs_article > bestblogs_twitter
   - (tunable weights; affects ranking not hard filter)

4. **Quality threshold**
   - BestBlogs: `score >= 85` (daily), `>= 80` (weekly)
   - Non-BestBlogs: no score → pass

5. **Keyword relevance**
   - whitelist: tool names, model names, frameworks
   - If keyword hit → boost score
   - No hit → still keep (but lower rank), unless low-quality

6. **Blacklist / low-signal filter**
   - remove: hiring-only, event promo only, empty changelog
   - simple regex rules

7. **Deduplication**
   - exact URL match
   - title similarity (Jaccard / cosine) > threshold
   - prefer higher-priority source; merge tags

8. **Final ranking**
   - `final_score = base_score + source_weight + keyword_bonus - penalties`
   - output sorted per section

---

## 2) Section Mapping

Daily:
- 工具/产品更新
- 研究/技术文章
- 社媒观点
- 官方博客

Weekly:
- 播客精选
- 视频精选
- 本周主题综述（由 weekly summarizer 汇总生成）

---

## 3) Config Hooks (planned)
- `keywords.yaml`: positive keywords
- `blacklist.yaml`: negative keywords / regex
- `weights.yaml`: source weights + boosts

---

## 4) Output Constraints
- No hard cap on item count
- Allow manual pinning (future)
