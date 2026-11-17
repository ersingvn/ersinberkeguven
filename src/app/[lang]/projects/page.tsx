import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectList } from "@/components/lists";
import { projects } from "@/content/site";
import { getDict, isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDict(lang).projects.title } : {};
}

export default async function Projects({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{t.projects.title}</h1>
      <p className="mt-3 mb-10 leading-relaxed text-muted">{t.projects.intro}</p>
      <ProjectList projects={projects} lang={lang} />
    </>
  );
}
