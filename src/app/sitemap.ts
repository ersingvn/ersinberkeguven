import type { MetadataRoute } from "next";
import { projects } from "@/content/site";
import { locales } from "@/lib/i18n";
import { allSlugs } from "@/lib/posts";
import { siteUrl as base } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/projects",
    "/blog",
    "/about",
    "/store",
    ...projects.map((p) => `/projects/${p.slug}`),
    ...allSlugs().map((s) => `/blog/${s}`),
  ];
  return locales.flatMap((lang) => paths.map((p) => ({ url: `${base}/${lang}${p}` })));
}
