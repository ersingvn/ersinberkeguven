import Link from "next/link";
import type { Project } from "@/content/site";
import { dateParts, isoDate, type Locale } from "@/lib/i18n";
import type { Post } from "@/lib/posts";

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="font-mono text-xs tracking-wide text-muted uppercase">{children}</h2>
      {action}
    </div>
  );
}

export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-muted no-underline hover:text-fg">
      {children} →
    </Link>
  );
}

export function ProjectList({ projects, lang }: { projects: Project[]; lang: Locale }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {projects.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/${lang}/projects/${p.slug}`}
            className="group grid gap-1 py-5 no-underline sm:grid-cols-[9rem_1fr] sm:gap-6"
          >
            <span className="font-medium group-hover:text-accent">{p.name}</span>
            <span>
              <span className="block text-[0.95rem] leading-relaxed text-muted">{p.summary[lang]}</span>
              <span className="mt-2 block font-mono text-xs text-muted/80">{p.stack.slice(0, 4).join(" · ")}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function PostList({ posts, lang }: { posts: Post[]; lang: Locale }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/${lang}/blog/${p.slug}`}
            className="group grid gap-1 py-5 no-underline sm:grid-cols-[9rem_1fr] sm:gap-6"
          >
            <time dateTime={isoDate(p.date)} className="font-mono text-xs leading-6 text-muted">
              {dateParts(p.date, lang).day}
              {dateParts(p.date, lang).time && <span className="block leading-4 text-muted/70">{dateParts(p.date, lang).time}</span>}
            </time>
            <span>
              {p.draft && <DraftBadge />}
              <span className="font-medium group-hover:text-accent">{p.title}</span>
              {p.lang !== lang && (
                <span className="ml-2 font-mono text-[0.7rem] text-muted uppercase">{p.lang}</span>
              )}
              {p.summary && <span className="mt-1 block text-[0.95rem] leading-relaxed text-muted">{p.summary}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Only visible locally: drafts are left out of the live site. */
export function DraftBadge() {
  return (
    <span className="mr-2 rounded border border-accent px-1.5 py-0.5 align-middle font-mono text-[0.65rem] text-accent uppercase">
      draft
    </span>
  );
}

/** Renders `inline code` inside plain strings from site.ts. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part,
      )}
    </>
  );
}
