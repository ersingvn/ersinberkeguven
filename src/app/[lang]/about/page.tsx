import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/lists";
import { courses, profile, skills, socialLinks } from "@/content/site";
import { getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDict(lang).about.title } : {};
}

export default async function About({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  const contact = socialLinks();

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.about.title}</h1>
      {profile.photo && (
        <Image
          src={profile.photo}
          alt={profile.name}
          width={224}
          height={224}
          preload
          className="mt-8 size-44 rounded-md object-cover sm:size-56"
        />
      )}
      <div className="prose mt-8 text-[1.05rem]">
        {profile.about[lang].map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <section className="mt-16">
        <SectionTitle>{t.about.skills}</SectionTitle>
        <dl className="grid gap-x-6 gap-y-4 border-y border-line py-5 sm:grid-cols-[9rem_1fr]">
          {skills.map((s) => (
            <div key={s.group.en} className="contents">
              <dt className="text-sm text-muted">{s.group[lang]}</dt>
              <dd className="text-[0.95rem]">{s.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16">
        <SectionTitle>{t.about.courses}</SectionTitle>
        <ul className="divide-y divide-line border-y border-line">
          {courses.map((c) => (
            <li key={c.en} className="py-3 text-[0.95rem]">
              {c[lang]}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16">
        <SectionTitle>{t.about.contact}</SectionTitle>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_1fr]">
          {contact.map((c) => (
            <div key={c.label} className="contents">
              <dt className="text-sm text-muted">{c.label}</dt>
              <dd>
                <a href={c.href} rel="me" className="text-accent underline">
                  {c.display}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
