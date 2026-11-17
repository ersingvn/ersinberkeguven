import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { education, profile, projects, skills } from "@/content/site";
import { getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/cv">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDict(lang).cv.title } : {};
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-line pb-2 font-mono text-xs tracking-wide text-muted uppercase">{children}</h2>
  );
}

export default async function CV({ params }: PageProps<"/[lang]/cv">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const contact = [
    profile.links.email,
    profile.links.github.replace("https://", ""),
    profile.links.linkedin.replace(/^https:\/\/(www\.)?/, ""),
  ].filter(Boolean);

  return (
    <div className="text-[0.95rem]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="mt-1 text-muted">{profile.role[lang]}</p>
          <p className="mt-2 font-mono text-xs text-muted">{contact.join("  ·  ")}</p>
        </div>
        <PrintButton label={t.cv.print} />
      </div>

      <section className="mt-10">
        <Heading>{t.cv.education}</Heading>
        <div className="flex flex-wrap justify-between gap-x-4">
          <p>
            <span className="font-medium">{education.degree[lang]}</span>
            {education.school && <span className="text-muted">, {education.school}</span>}
          </p>
          {education.years && <p className="font-mono text-xs leading-6 text-muted">{education.years}</p>}
        </div>
      </section>

      <section className="mt-10">
        <Heading>{t.cv.projects}</Heading>
        <ul className="space-y-5">
          {projects.map((p) => (
            <li key={p.slug} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="font-medium">{p.name}</span>
                <span className="font-mono text-xs text-muted">{p.stack.join(", ")}</span>
              </div>
              <p className="mt-1 leading-relaxed text-muted">{p.summary[lang]}</p>
              {p.links[0] && (
                <p className="mt-0.5 font-mono text-xs text-muted">{p.links[0].href.replace("https://", "")}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <Heading>{t.cv.skills}</Heading>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[9rem_1fr]">
          {skills.map((s) => (
            <div key={s.group.en} className="contents">
              <dt className="text-muted">{s.group[lang]}</dt>
              <dd>{s.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
