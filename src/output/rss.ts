import { Item } from "../models/item.js";

interface RssChannelMeta {
  title: string;
  link: string;
  description: string;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRss(items: Item[], meta: RssChannelMeta): string {
  const channelItems = items
    .map((item) => {
      const summary = item.summary_one || item.summary;
      const keyPointsHtml =
        item.key_points && item.key_points.length > 0
          ? `<p><strong>Key Points:</strong></p><ul>${item.key_points
              .slice(0, 5)
              .map((point) => `<li>${escapeXml(point)}</li>`)
              .join("")}</ul>`
          : "";
      const tagsHtml =
        item.tags && item.tags.length > 0
          ? `<p><strong>Tags:</strong> ${escapeXml(item.tags.join(", "))}</p>`
          : "";
      const source = item.source_site || item.source;
      const description = [
        summary ? `<p>${escapeXml(summary)}</p>` : "",
        keyPointsHtml,
        tagsHtml,
        `<p><strong>Source:</strong> ${escapeXml(source)}</p>`,
      ]
        .filter(Boolean)
        .join("");

      return [
        "<item>",
        `<title>${escapeXml(item.title)}</title>`,
        `<link>${escapeXml(item.url)}</link>`,
        `<guid isPermaLink=\"true\">${escapeXml(item.url)}</guid>`,
        `<pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>`,
        `<description><![CDATA[${description}]]></description>`,
        "</item>",
      ].join("");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(meta.title)}</title>
<link>${escapeXml(meta.link)}</link>
<description>${escapeXml(meta.description)}</description>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<ttl>60</ttl>
${channelItems}
</channel>
</rss>`;
}
