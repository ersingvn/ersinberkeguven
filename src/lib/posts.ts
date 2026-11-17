import "server-only";
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import type { Locale } from "./i18n";

/*
 * Posts are Markdown files in content/blog, named <slug>.<lang>.md:
 *   content/blog/sifirdan-gpt.tr.md
 *   content/blog/sifirdan-gpt.en.md   (optional translation, same slug)
 *
 * Front matter (between --- lines at the top):
 *   title: Post title
 *   date: 2026-11-17
 *   summary: One sentence shown in lists.
 *   draft: true            (optional: hidden from the site)
 */

const dir = path.join(process.cwd(), "content", "blog");

export type Post = {
  slug: string;
  lang: Locale;
  title: string;
  date: string;
  summary: string;
  draft: boolean;
  body: string;
};

function parse(file: string): Post | null {
  const match = file.match(/^(.+)\.(tr|en)\.md$/);
  if (!match) return null;
  const raw = fs.readFileSync(path.join(dir, file), "utf8").replace(/\r\n/g, "\n");
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta: Record<string, string> = {};
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return {
    slug: match[1],
    lang: match[2] as Locale,
    title: meta.title ?? match[1],
    date: meta.date ?? "1970-01-01",
    summary: meta.summary ?? "",
    draft: meta.draft === "true",
    body: fm ? raw.slice(fm[0].length) : raw,
  };
}

function all(): Post[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .map(parse)
    .filter((p): p is Post => p !== null && !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Posts for a language. A post that exists only in the other language is listed too, marked as such. */
export function listPosts(lang: Locale) {
  const posts = all();
  const bySlug = new Map<string, Post>();
  for (const p of posts) {
    const current = bySlug.get(p.slug);
    if (!current || (p.lang === lang && current.lang !== lang)) bySlug.set(p.slug, p);
  }
  return [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string, lang: Locale) {
  const posts = all().filter((p) => p.slug === slug);
  const post = posts.find((p) => p.lang === lang) ?? posts[0];
  if (!post) return null;
  return { ...post, html: marked.parse(post.body, { async: false }) };
}

export function allSlugs() {
  return [...new Set(all().map((p) => p.slug))];
}
