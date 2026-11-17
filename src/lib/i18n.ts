export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** A string written in both languages. */
export type T = Record<Locale, string>;

const ui = {
  nav: {
    projects: { tr: "Projeler", en: "Projects" },
    blog: { tr: "Yazılar", en: "Writing" },
    about: { tr: "Hakkımda", en: "About" },
    store: { tr: "Mağaza", en: "Store" },
  },
  home: {
    now: { tr: "Şu an", en: "Now" },
    projects: { tr: "Projeler", en: "Projects" },
    allProjects: { tr: "Tüm projeler", en: "All projects" },
    posts: { tr: "Son yazılar", en: "Recent writing" },
    allPosts: { tr: "Tüm yazılar", en: "All writing" },
  },
  projects: {
    title: { tr: "Projeler", en: "Projects" },
    intro: {
      tr: "Okul dışında yaptığım işler. Hepsi kendi yazdığım kod; nerede durduklarını da olduğu gibi yazdım.",
      en: "Things I build outside of class. All of it is my own code, and each page says honestly where it stands.",
    },
    status: { tr: "Durum", en: "Status" },
    stack: { tr: "Teknolojiler", en: "Stack" },
    started: { tr: "Başlangıç", en: "Started" },
    links: { tr: "Bağlantılar", en: "Links" },
    back: { tr: "← Projeler", en: "← Projects" },
  },
  blog: {
    title: { tr: "Yazılar", en: "Writing" },
    intro: {
      tr: "Proje yaparken ve derslerde öğrendiklerim üzerine notlar.",
      en: "Notes on what I learn while building things and in class.",
    },
    empty: { tr: "Henüz yazı yok.", en: "No posts yet." },
    back: { tr: "← Yazılar", en: "← Writing" },
    onlyOther: {
      tr: "Bu yazı yalnızca İngilizce.",
      en: "This post is only available in Turkish.",
    },
  },
  about: {
    title: { tr: "Hakkımda", en: "About" },
    skills: { tr: "Kullandığım teknolojiler", en: "What I work with" },
    courses: { tr: "Bu dönem okuduğum dersler", en: "Courses this term" },
    contact: { tr: "İletişim", en: "Contact" },
  },
  store: {
    title: { tr: "Mağaza", en: "Store" },
    intro: {
      tr: "Kendi projelerimden çıkan dijital ürünler. Ödeme, güvenilir bir ödeme platformunda yapılır; kart bilgin bu siteye hiç gelmez.",
      en: "Digital products that come out of my own projects. Checkout happens on a trusted payment platform; your card details never touch this site.",
    },
    soonTitle: { tr: "Yakında", en: "Coming soon" },
    soonText: {
      tr: "İlk ürünler hazırlanıyor. Çıktığında haberin olsun istersen beni takip et:",
      en: "The first products are on the way. Follow me to hear when they're out:",
    },
    buy: { tr: "Satın al", en: "Buy" },
    get: { tr: "İndir", en: "Get it" },
    free: { tr: "Ücretsiz", en: "Free" },
    soon: { tr: "Yakında", en: "Soon" },
  },
  footer: {
    source: { tr: "Bu sitenin kaynak kodu", en: "Source of this site" },
  },
} satisfies Record<string, Record<string, T>>;

export type Dict = { [K in keyof typeof ui]: { [S in keyof (typeof ui)[K]]: string } };

export function getDict(locale: Locale): Dict {
  const out = {} as Record<string, Record<string, string>>;
  for (const [section, entries] of Object.entries(ui)) {
    out[section] = {};
    for (const [key, value] of Object.entries(entries)) out[section][key] = (value as T)[locale];
  }
  return out as Dict;
}

const intlLocale = (locale: Locale) => (locale === "tr" ? "tr-TR" : "en-GB");

/*
 * Post dates are written as "2026-11-17" or "2026-11-17 18:22".
 * The time is Turkey time (Europe/Istanbul, UTC+3) and is shown as written.
 */
function splitDate(value: string) {
  const [date, time] = value.trim().split(/[ T]/);
  return { date, time: /^\d{2}:\d{2}$/.test(time ?? "") ? time : undefined };
}

/** "2026-11-17 18:22" → { day: "17 Kasım 2026", time: "18:22" } */
export function dateParts(value: string, locale: Locale) {
  const { date, time } = splitDate(value);
  const day = new Date(`${date}T12:00:00Z`).toLocaleDateString(intlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  return { day, time };
}

/** "2026-11-17 18:22" → "17 Kasım 2026, 18:22" / "17 November 2026, 18:22" */
export function formatDate(value: string, locale: Locale) {
  const { day, time } = dateParts(value, locale);
  return time ? `${day}, ${time}` : day;
}

/** Machine-readable form for <time dateTime> and RSS. */
export function isoDate(value: string) {
  const { date, time } = splitDate(value);
  return time ? `${date}T${time}:00+03:00` : date;
}

/** "2026-10" → "Ekim 2026" / "October 2026" */
export function formatMonth(yearMonth: string, locale: Locale) {
  return new Date(`${yearMonth}-15T12:00:00Z`).toLocaleDateString(intlLocale(locale), {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}
