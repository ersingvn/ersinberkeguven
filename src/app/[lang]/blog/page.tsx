import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList } from "@/components/lists";
import { getDict, isLocale } from "@/lib/i18n";
import { listPosts } from "@/lib/posts";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDict(lang).blog.title } : {};
}

export default async function Blog({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const posts = listPosts(lang);

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.blog.title}</h1>
      <p className="mt-3 mb-10 leading-relaxed text-muted">
        {t.blog.intro}{" "}
        <a href={`/${lang}/rss.xml`} className="font-mono text-xs whitespace-nowrap text-muted underline hover:text-fg">
          RSS
        </a>
      </p>
      {posts.length > 0 ? <PostList posts={posts} lang={lang} /> : <p className="text-muted">{t.blog.empty}</p>}
    </>
  );
}
