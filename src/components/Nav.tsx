"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav({ lang, items }: { lang: string; items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
      {items.map((item) => {
        const href = `/${lang}${item.href}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={item.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={active ? "text-fg no-underline" : "text-muted no-underline hover:text-fg"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
