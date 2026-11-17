import Image from "next/image";
import { notFound } from "next/navigation";
import { MoreLink, PostList, ProjectList, SectionTitle } from "@/components/lists";
import { profile, projects, socialLinks } from "@/content/site";
import { getDict, isLocale } from "@/lib/i18n";
import { listPosts } from "@/lib/posts";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  const posts = listPosts(lang).slice(0, 3);

  return (
    <>
      <section>
        <div className="flex items-center gap-5">
          {profile.avatar && (
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={72}
              height={72}
              preload
              className="size-16 shrink-0 rounded-full object-cover sm:size-[72px]"
            />
          )}
          <div>
            <h1 className="text-[1.65rem] leading-tight font-semibold tracking-tight sm:text-3xl">{profile.name}</h1>
            <p className="mt-1 text-muted">{profile.role[lang]}</p>
          </div>
        </div>
        <p className="mt-7 text-[1.05rem] leading-relaxed">{profile.intro[lang]}</p>
        <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {socialLinks().map((s) => (
            <a key={s.label} href={s.href} rel="me" className="text-accent underline">
              {s.label}
            </a>
          ))}
        </p>

        <p className="mt-7 border-l-2 border-accent pl-4 text-[0.95rem] leading-relaxed">
          <span className="mr-2 font-mono text-xs text-muted uppercase">{t.home.now}</span>
          {profile.now[lang]}
        </p>
      </section>

      <section className="mt-16">
        <SectionTitle action={<MoreLink href={`/${lang}/projects`}>{t.home.allProjects}</MoreLink>}>
          {t.home.projects}
        </SectionTitle>
        <ProjectList projects={projects.filter((p) => p.featured)} lang={lang} />
      </section>

      {posts.length > 0 && (
        <section className="mt-16">
          <SectionTitle action={<MoreLink href={`/${lang}/blog`}>{t.home.allPosts}</MoreLink>}>
            {t.home.posts}
          </SectionTitle>
          <PostList posts={posts} lang={lang} />
        </section>
      )}
    </>
  );
}
