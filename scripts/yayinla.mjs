// Publishes blog changes to the live site.
//   npm run yayinla   send finished posts now
//   npm run izle      keep running; send 20 s after the last save
//
// Only content/blog and public/blog are sent. Posts with `draft: true`
// are never sent: the GitHub repo is public, so drafts stay on this PC.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PATHS = ["content/blog", "public/blog"];
const QUIET_MS = 20_000;
const SITE = "https://ersinberkeguven.vercel.app";

// Raw output: status lines start with a space that must not be trimmed away.
const gitRaw = (...args) =>
  execFileSync("git", ["-c", "core.quotepath=false", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const git = (...args) => gitRaw(...args).trim();
const time = () => new Date().toLocaleTimeString("tr-TR");
const log = (msg) => console.log(`[${time()}] ${msg}`);

function isDraft(file) {
  if (!file.endsWith(".md") || !fs.existsSync(file)) return false;
  const head = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---/);
  return !!head && /^draft:\s*true\s*$/m.test(head[1]);
}

function titleOf(file) {
  if (!fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, "utf8").match(/^title:\s*(.+)$/m);
  return m ? m[1].trim() : path.basename(file);
}

function publish() {
  try {
    run();
  } catch (err) {
    log("Beklenmeyen hata:");
    console.error(String(err.stderr || err.message).trim());
  }
}

function run() {
  PATHS.forEach((p) => fs.mkdirSync(p, { recursive: true }));
  const changed = gitRaw("status", "--porcelain", "-uall", "--", ...PATHS)
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^"|"$/g, ""))
    .map((f) => (f.includes(" -> ") ? f.split(" -> ")[1] : f));

  const drafts = changed.filter(isDraft);
  const ready = changed.filter((f) => !isDraft(f));

  if (drafts.length) log(`Taslak, gönderilmedi: ${drafts.map((f) => path.basename(f)).join(", ")}`);
  if (!ready.length) {
    log("Gönderilecek değişiklik yok.");
    return;
  }

  const posts = ready.filter((f) => f.endsWith(".md"));
  const titles = posts.map(titleOf).filter(Boolean);
  const message = titles.length
    ? `Yazı: ${titles.join(", ")}`
    : posts.length
      ? `Yazı silindi: ${posts.map((f) => path.basename(f)).join(", ")}`
      : "Yazı görselleri güncellendi";

  try {
    git("add", "-A", "--", ...ready);
    git("commit", "-m", message, "--", ...ready);
    git("pull", "--rebase", "--autostash", "-q");
    git("push", "-q");
    log(`Gönderildi: ${message}`);
    log(`~30 saniye içinde sitede: ${SITE}/tr/blog`);
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
  publish();
  let timer = null;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(publish, QUIET_MS);
  };
  PATHS.forEach((p) => {
    fs.mkdirSync(p, { recursive: true });
    fs.watch(p, { recursive: true }, schedule);
  });
} else {
  publish();
}
