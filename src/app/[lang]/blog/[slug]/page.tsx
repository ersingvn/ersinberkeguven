import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftBadge } from "@/components/lists";
import { formatDate, getDict, isLocale } from "@/lib/i18n";
import { allSlugs, getPost } from "@/lib/posts";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = getPost(slug, lang);
  return post ? { title: post.title, description: post.summary } : {};
}

export default async function PostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = getPost(slug, lang);
  if (!post) notFound();
  const t = getDict(lang);

  return (
    <article>
      <Link href={`/${lang}/blog`} className="no-print text-sm text-muted no-underline hover:text-fg">
        {t.blog.back}
      </Link>

      <header className="mt-6 mb-10">
        {post.draft && <DraftBadge />}
        <h1 className="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">{post.title}</h1>
        <time dateTime={post.date} className="mt-3 block font-mono text-xs text-muted">
          {formatDate(post.date, lang)}
        </time>
        {post.lang !== lang && <p className="mt-4 text-sm text-muted">{t.blog.onlyOther}</p>}
      </header>

      <div className="prose" lang={post.lang} dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}
