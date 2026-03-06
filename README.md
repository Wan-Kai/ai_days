# ai_days

面向开发者的 **AI 日报 / 周报** 项目。

## 目标
- 建立稳定的“信息采集 → 过滤 → 生成”流程
- 以 RSS 为主源输出，网页与小红书从 RSS 二次消费

## 内容结构
**日报**（文字为主）
- 文章 / 技术解读
- 社媒观点（高质量推文 / 长评）
- 工具与产品更新
- 官方博客与重要公告

**周报**（长内容沉淀）
- 播客精选
- 视频精选
- 本周主题综述

## 信息源清单
详见：`news/ai-daily-sources.md`

## 约定
- BestBlogs 为主信息池
- 工具更新 / 官方博客为独立来源并行
- 后续新增来源请在 `news/ai-daily-sources.md` 追加

## 本地运行（MVP 日报管线）
1. 安装依赖：`npm install`
2. 执行日报流程：`npm run daily`
3. 产物：
   - `data/bestblogs.json`
   - `data/github-releases.json`
   - `data/daily-merged.json`
   - `public/rss/daily.xml`
