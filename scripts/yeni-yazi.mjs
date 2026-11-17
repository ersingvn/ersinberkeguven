// Creates a draft post: npm run yazi -- "Yazının başlığı" [--en]
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const lang = args.includes("--en") ? "en" : "tr";
const title = args.filter((a) => a !== "--en").join(" ").trim();

if (!title) {
  console.error('Kullanım: npm run yazi -- "Yazının başlığı"   (İngilizce için sonuna --en ekle)');
  process.exit(1);
}

const slug = title
  .toLocaleLowerCase("tr")
  .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

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
Yayınlamak için: draft: true satırını sil, sonra commit + push.`);
