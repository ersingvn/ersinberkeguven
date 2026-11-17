// Creates a draft post: npm run yazi -- "Yazının başlığı" [--en]
import fs from "node:fs";
import path from "node:path";
import { slugify } from "./lib/publish.mjs";

const args = process.argv.slice(2);
const lang = args.includes("--en") ? "en" : "tr";
const title = args.filter((a) => a !== "--en").join(" ").trim();

if (!title) {
  console.error('Kullanım: npm run yazi -- "Yazının başlığı"   (İngilizce için sonuna --en ekle)');
  process.exit(1);
}

const slug = slugify(title);

const today = new Date();
const date = [today.getFullYear(), today.getMonth() + 1, today.getDate()].map((n) => String(n).padStart(2, "0")).join("-");

const file = path.join("content", "blog", `${slug}.${lang}.md`);
if (fs.existsSync(file)) {
  console.error(`Bu dosya zaten var: ${file}`);
  process.exit(1);
}

fs.writeFileSync(
  file,
  `---
title: ${title}
date: ${date}
summary: Listede görünecek tek cümle.
draft: true
---

Buraya yaz.
`,
);

console.log(`Oluşturuldu: ${file}
Önizleme: npm run dev, sonra http://localhost:3000/${lang}/blog/${slug}
Yayınlamak için: draft: true satırını sil. "Blog Yazma Modu" açıksa kendiliğinden gider, değilse: npm run yayinla`);
