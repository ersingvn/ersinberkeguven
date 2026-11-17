import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Inline } from "@/components/lists";
import { projects } from "@/content/site";
import { formatMonth, getDict, isLocale } from "@/lib/i18n";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p || !isLocale(lang)) return {};
  return { title: p.name, description: p.summary[lang] };
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p || !isLocale(lang)) notFound();
  const t = getDict(lang);
  const started = formatMonth(p.started, lang);

  return (
    <article>
      <Link href={`/${lang}/projects`} className="no-print text-sm text-muted no-underline hover:text-fg">
        {t.projects.back}
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">{p.name}</h1>
      <p className="mt-3 text-[1.05rem] leading-relaxed text-muted">{p.summary[lang]}</p>

      <dl className="mt-8 grid gap-x-6 gap-y-3 border-y border-line py-5 text-sm sm:grid-cols-[9rem_1fr]">
        <dt className="font-mono text-xs leading-6 text-muted uppercase">{t.projects.status}</dt>
        <dd className="leading-6">{p.status[lang]}</dd>
        <dt className="font-mono text-xs leading-6 text-muted uppercase">{t.projects.stack}</dt>
        <dd className="leading-6">{p.stack.join(", ")}</dd>
        <dt className="font-mono text-xs leading-6 text-muted uppercase">{t.projects.started}</dt>
        <dd className="leading-6">{started}</dd>
        {p.links.length > 0 && (
          <>
            <dt className="font-mono text-xs leading-6 text-muted uppercase">{t.projects.links}</dt>
            <dd className="flex gap-4 leading-6">
              {p.links.map((l) => (
                <a key={l.href} href={l.href} className="text-accent underline">
                  {l.label}
                </a>
              ))}
            </dd>
          </>
        )}
      </dl>

      <div className="prose mt-10">
        {p.description[lang].map((para, i) => (
          <p key={i}>
            <Inline text={para} />
          </p>
        ))}
      </div>
    </article>
  );
}
