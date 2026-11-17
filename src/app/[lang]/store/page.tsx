import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { products, socialLinks } from "@/content/site";
import { getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/store">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDict(lang).store.title, description: getDict(lang).store.intro } : {};
}

export default async function Store({ params }: PageProps<"/[lang]/store">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang).store;

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-3 mb-10 leading-relaxed text-muted">{t.intro}</p>

      {products.length === 0 ? (
        <section className="border-y border-line py-10">
          <p className="font-mono text-xs tracking-wide text-muted uppercase">{t.soonTitle}</p>
          <p className="mt-3 leading-relaxed">{t.soonText}</p>
          <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {socialLinks()
              .filter((s) => !s.href.startsWith("mailto:"))
              .map((s) => (
                <a key={s.label} href={s.href} rel="me" className="text-accent underline">
                  {s.label}
                </a>
              ))}
          </p>
        </section>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {products.map((p) => {
            const free = !p.price || /^(0|ücretsiz|free)$/i.test(p.price.trim());
            return (
              <li key={p.slug} className="grid gap-5 py-8 sm:grid-cols-[9rem_1fr] sm:gap-6">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={288}
                    height={288}
                    className="aspect-square w-full max-w-[9rem] rounded-md border border-line object-cover"
                  />
                ) : (
                  <span className="hidden sm:block" />
                )}
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="text-lg font-semibold tracking-tight">{p.name}</h2>
                    <span className="font-mono text-sm">{free ? t.free : p.price}</span>
                  </div>
                  <p className="mt-2 leading-relaxed text-muted">{p.summary[lang]}</p>
                  {p.includes && p.includes[lang].length > 0 && (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.95rem] marker:text-muted">
                      {p.includes[lang].map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg no-underline hover:opacity-90"
                      >
                        {free ? t.get : t.buy} →
                      </a>
                    ) : (
                      <span className="rounded-md border border-line px-4 py-2 text-sm text-muted">{t.soon}</span>
                    )}
                    {p.format && <span className="font-mono text-xs text-muted">{p.format}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
