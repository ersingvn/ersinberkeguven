import { profile } from "@/content/site";
import { isLocale, locales } from "@/lib/i18n";
import { listPosts } from "@/lib/posts";
import { siteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// RSS feed of posts in one language: /tr/rss.xml, /en/rss.xml
export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) return new Response("Not found", { status: 404 });

  const posts = listPosts(lang).filter((p) => p.lang === lang && !p.draft);
  const items = posts
    .map((p) => {
      const url = `${siteUrl}/${lang}/blog/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.summary)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(profile.name)}</title>
    <link>${siteUrl}/${lang}/blog</link>
    <description>${esc(profile.intro[lang])}</description>
    <language>${lang}</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
