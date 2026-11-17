import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { LangSwitch } from "@/components/LangSwitch";
import { Nav } from "@/components/Nav";
import { profile, socialLinks } from "@/content/site";
import { getDict, isLocale, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site-url";
import "../globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: { default: profile.name, template: `%s · ${profile.name}` },
    description: profile.intro[lang],
    metadataBase: new URL(siteUrl),
    alternates: {
      languages: { tr: "/tr", en: "/en" },
      types: { "application/rss+xml": `/${lang}/rss.xml` },
    },
    openGraph: { title: profile.name, description: profile.intro[lang], type: "website" },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  const nav = [
    { href: "/projects", label: t.nav.projects },
    { href: "/blog", label: t.nav.blog },
    { href: "/about", label: t.nav.about },
    { href: "/store", label: t.nav.store },
  ];

  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-bg text-fg antialiased">
        <div className="mx-auto flex min-h-dvh max-w-[42rem] flex-col px-5 sm:px-6">
          <header className="no-print flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 pt-10 pb-14 sm:pt-14">
            <Link href={`/${lang}`} className="font-medium no-underline">
              {profile.name}
            </Link>
            <div className="flex items-baseline gap-6">
              <Nav lang={lang} items={nav} />
              <LangSwitch current={lang} />
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="no-print mt-24 flex flex-wrap justify-between gap-3 border-t border-line py-8 font-mono text-xs text-muted">
            <span>{profile.name}</span>
            <span className="flex gap-4">
              {socialLinks().map((s) => (
                <a key={s.label} href={s.href} rel="me" className="no-underline hover:text-fg">
                  {s.label}
                </a>
              ))}
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
