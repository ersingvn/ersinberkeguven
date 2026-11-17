"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

export function LangSwitch({ current }: { current: Locale }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <div className="flex gap-1 font-mono text-xs" aria-label="Language">
      {locales.map((l, i) => (
        <span key={l} className="flex gap-1">
          {i > 0 && <span className="text-line">/</span>}
          {l === current ? (
            <span className="text-fg" aria-current="true">
              {l.toUpperCase()}
            </span>
          ) : (
            <Link
              href={`/${l}${rest ? `/${rest}` : ""}`}
              hrefLang={l}
              className="text-muted no-underline hover:text-fg"
            >
              {l.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
