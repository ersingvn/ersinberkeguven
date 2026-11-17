// Sends finished blog changes to GitHub (and from there to the live site).
// Only content/blog and public/blog are ever touched. Posts with `draft: true`
// are never sent: the repo is public, so drafts stay on this PC.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const POSTS_DIR = path.join(ROOT, "content", "blog");
export const IMAGES_DIR = path.join(ROOT, "public", "blog");
export const SITE = "https://ersinberkeguven.vercel.app";
const PATHS = ["content/blog", "public/blog"];

// Raw output: status lines start with a space that must not be trimmed away.
const gitRaw = (...args) =>
  execFileSync("git", ["-c", "core.quotepath=false", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
const git = (...args) => gitRaw(...args).trim();

export function readFront(file) {
  const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
  if (!fs.existsSync(abs)) return null;
  const raw = fs.readFileSync(abs, "utf8").replace(/\r\n/g, "\n");
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: fm ? raw.slice(fm[0].length).replace(/^\n/, "") : raw };
}

/** "Çığır Açan Şeyler" → "cigir-acan-seyler" */
export function slugify(text) {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function writePost(abs, meta, body) {
  const line = (v) => String(v ?? "").replace(/[\r\n]+/g, " ").trim();
  const head = [`title: ${line(meta.title)}`, `date: ${line(meta.date)}`, `summary: ${line(meta.summary)}`];
  if (meta.draft) head.push("draft: true");
  const text = `---\n${head.join("\n")}\n---\n\n${String(body ?? "").replace(/\r\n/g, "\n").replace(/^\n+/, "")}`;
  fs.writeFileSync(abs, text.endsWith("\n") ? text : `${text}\n`);
}

export const isDraft =(file) => file.endsWith(".md") && readFront(file)?.meta.draft === "true";

/** Files under content/blog or public/blog that git sees as changed. */
function changedFiles() {
  return gitRaw("status", "--porcelain", "-uall", "--", ...PATHS)
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^"|"$/g, ""))
    .map((f) => (f.includes(" -> ") ? f.split(" -> ")[1] : f));
}

/** Paths of posts that are in the repo, i.e. already on the site. */
export function trackedPosts() {
  return new Set(git("ls-files", "--", "content/blog").split("\n").filter(Boolean));
}

/** Changes waiting to be sent (excluding drafts). */
export const pendingChanges = () => changedFiles().filter((f) => !isDraft(f));

function sync() {
  git("pull", "--rebase", "--autostash", "-q");
  git("push", "-q");
}

/** Commits and pushes every finished change. Returns a short Turkish summary. */
export function publish() {
  PATHS.forEach((p) => fs.mkdirSync(path.join(ROOT, p), { recursive: true }));
  const changed = changedFiles();
  const drafts = changed.filter(isDraft);
  const ready = changed.filter((f) => !isDraft(f));
  if (!ready.length) return { sent: false, drafts, message: "Gönderilecek değişiklik yok." };

  const posts = ready.filter((f) => f.endsWith(".md"));
  const titles = posts.map((f) => readFront(f)?.meta.title).filter(Boolean);
  const message = titles.length
    ? `Yazı: ${titles.join(", ")}`
    : posts.length
      ? `Yazı silindi: ${posts.map((f) => path.basename(f)).join(", ")}`
      : "Yazı görselleri güncellendi";

  git("add", "-A", "--", ...ready);
  git("commit", "-q", "-m", message, "--", ...ready);
  sync();
  return { sent: true, drafts, message };
}

/** Takes a post off the site but keeps it on this PC as a draft. */
export function unpublish(file, title) {
  git("rm", "-q", "--cached", "--", file);
  // No pathspec here: `git commit -- file` would re-add the file from disk.
  git("commit", "-q", "-m", `Yayından kaldırıldı: ${title || path.basename(file)}`);
  sync();
}
