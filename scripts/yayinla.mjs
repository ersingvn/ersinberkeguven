// Publishes blog changes to the live site.
//   npm run yayinla   send finished posts now
//   npm run izle      keep running; send 20 s after the last save
// Drafts (draft: true) are never sent. See scripts/lib/publish.mjs.
import fs from "node:fs";
import path from "node:path";
import { IMAGES_DIR, POSTS_DIR, SITE, publish } from "./lib/publish.mjs";

const QUIET_MS = 20_000;
const log = (msg) => console.log(`[${new Date().toLocaleTimeString("tr-TR")}] ${msg}`);

function run() {
  try {
    const r = publish();
    if (r.drafts.length) log(`Taslak, gönderilmedi: ${r.drafts.map((f) => path.basename(f)).join(", ")}`);
    log(r.sent ? `Gönderildi: ${r.message}` : r.message);
    if (r.sent) log(`~30 saniye içinde sitede: ${SITE}/tr/blog`);
  } catch (err) {
    log("Gönderilemedi. Git'in mesajı:");
    console.error(String(err.stderr || err.message).trim());
    log("İnternet bağlantını kontrol et; düzelmezse Claude'a bu mesajı göster.");
  }
}

if (process.argv.includes("--watch")) {
  log("Yazı klasörü izleniyor: content/blog");
  log(`Kaydettiğin yazılar ${QUIET_MS / 1000} saniye sonra siteye gönderilir. Taslaklar (draft: true) gönderilmez.`);
  log("Durdurmak için bu pencereyi kapat ya da Ctrl+C.");
  run();
  let timer = null;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(run, QUIET_MS);
  };
  for (const dir of [POSTS_DIR, IMAGES_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
    fs.watch(dir, { recursive: true }, schedule);
  }
} else {
  run();
}
