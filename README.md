# ersinberkeguven

Kişisel web sitem. Next.js 16 + Tailwind CSS 4, Türkçe ve İngilizce.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # yayın öncesi kontrol
```

## İçeriği düzenleme

| Ne | Nerede |
|---|---|
| İsim, tanıtım, "Şu an", hakkımda, linkler, okul | `src/content/site.ts` |
| Projeler | `src/content/site.ts` → `projects` |
| Yetenekler, dersler | `src/content/site.ts` → `skills`, `courses` |
| Arayüz metinleri (menü, başlıklar) | `src/lib/i18n.ts` |
| Blog yazıları | `content/blog/<slug>.tr.md` ve isteğe bağlı `<slug>.en.md` |
| Renkler | `src/app/globals.css` (`:root` açık tema, `prefers-color-scheme: dark` koyu tema) |

Yeni bir yazı için `content/blog` içine bir dosya aç:

```md
---
title: Yazının başlığı
date: 2026-11-20
summary: Listede görünen tek cümle.
---

Yazının kendisi, Markdown olarak.
```

`draft: true` eklersen yazı sitede görünmez. Yazının yalnızca bir dili varsa diğer dilde de listelenir ve hangi dilde olduğu belirtilir.

## Sayfalar

- `/tr`, `/en`: ana sayfa. `/` adresi tarayıcı diline göre yönlendirir.
- `/projects`, `/projects/<slug>`
- `/blog`, `/blog/<slug>`
- `/about`
- `/cv`: yazdırılabilir özgeçmiş ("PDF olarak kaydet" düğmesi)
