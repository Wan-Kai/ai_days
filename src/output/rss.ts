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
      const description = [
        item.summary ? `<p>${escapeXml(item.summary)}</p>` : "",
        `<p><strong>Source:</strong> ${escapeXml(item.source)}</p>`,
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
