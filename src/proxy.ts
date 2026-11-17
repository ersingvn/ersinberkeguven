import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n";

// Sends visitors without a language in the URL to /tr or /en, based on their browser.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return;

  const accept = request.headers.get("accept-language") ?? "";
  const preferred = accept
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase())
    .find((code) => (locales as readonly string[]).includes(code));

  request.nextUrl.pathname = `/${preferred ?? defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon|robots.txt|sitemap.xml|.*\\..*).*)"],
};
