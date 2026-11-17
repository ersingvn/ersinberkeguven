import type { MetadataRoute } from "next";
import { projects } from "@/content/site";
import { locales } from "@/lib/i18n";
import { allSlugs } from "@/lib/posts";

// Set this to the real address once the site is online.
const base = process.env.SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/projects",
    "/blog",
    "/about",
    "/cv",
    ...projects.map((p) => `/projects/${p.slug}`),
    ...allSlugs().map((s) => `/blog/${s}`),
  ];
  return locales.flatMap((lang) => paths.map((p) => ({ url: `${base}/${lang}${p}` })));
}
