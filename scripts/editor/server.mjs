// Local writing app for the blog: npm run editor
// Runs only on this PC (127.0.0.1). Saves posts to content/blog and
// publishes finished ones to GitHub, which deploys the live site.
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  IMAGES_DIR,
  POSTS_DIR,
  ROOT,
  SITE,
  pendingChanges,
  publish,
  readFront,
  slugify,
  trackedPosts,
  unpublish,
  writePost,
} from "../lib/publish.mjs";

// EDITOR_PORT lets tests run a separate editor without touching the real one.
const PORT = Number(process.env.EDITOR_PORT) || 4321;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const QUIET_MS = 20_000;
const FILE_RE = /^[a-z0-9][a-z0-9-]*\.(tr|en)\.md$/;

const log = (msg) => console.log(`[${new Date().toLocaleTimeString("tr-TR")}] ${msg}`);
const today = () => {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, "0")).join("-");
};

// ---------- publishing state ----------

const state = { phase: "idle", dueAt: null, lastAt: null, lastMessage: "", error: "" };
let timer = null;
let busy = false;

function runPublish() {
  if (busy) return schedule(3000);
  clearTimeout(timer);
  busy = true;
  state.phase = "sending";
  state.dueAt = null;
  try {
    const r = publish();
    state.error = "";
    if (r.sent) {
      state.lastAt = Date.now();
      state.lastMessage = r.message;
      log(`Gönderildi: ${r.message}`);
    }
  } catch (err) {
    state.error = String(err.stderr || err.message).trim();
    log(`Gönderilemedi: ${state.error}`);
  } finally {
    busy = false;
    state.phase = "idle";
  }
}

function schedule(ms = QUIET_MS) {
  clearTimeout(timer);
  state.phase = "waiting";
  state.dueAt = Date.now() + ms;
  timer = setTimeout(runPublish, ms);
}

function status() {
  let pending = [];
  try {
    pending = pendingChanges();
  } catch {}
  return { ...state, pending: pending.length, site: SITE, root: ROOT };
}

// ---------- posts ----------

const rel = (file) => `content/blog/${file}`;

function listPosts() {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  const tracked = trackedPosts();
  let pending = new Set();
  try {
    pending = new Set(pendingChanges());
  } catch {}
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => FILE_RE.test(f))
    .map((file) => {
      const { meta, body } = readFront(path.join(POSTS_DIR, file));
      return {
        file,
        slug: file.replace(/\.(tr|en)\.md$/, ""),
        lang: file.endsWith(".en.md") ? "en" : "tr",
        title: meta.title || "",
        date: meta.date || "",
        summary: meta.summary || "",
        draft: meta.draft === "true",
        published: tracked.has(rel(file)),
        unsent: pending.has(rel(file)),
        words: body.split(/\s+/).filter(Boolean).length,
      };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || a.title.localeCompare(b.title, "tr"));
}

function uniqueFile(slug, lang, except) {
  let name = `${slug || "yazi"}.${lang}.md`;
  for (let i = 2; fs.existsSync(path.join(POSTS_DIR, name)) && name !== except; i++) name = `${slug || "yazi"}-${i}.${lang}.md`;
  return name;
}

function savePost(file, input) {
  const abs = path.join(POSTS_DIR, file);
  if (!fs.existsSync(abs)) throw httpError(404, "Yazı bulunamadı");
  const published = trackedPosts().has(rel(file));
  const meta = { title: input.title, date: input.date || today(), summary: input.summary, draft: !!input.draft };
  const fileLang = file.endsWith(".en.md") ? "en" : "tr";
  // Language and address can change only until the post is on the site.
  const lang = !published && (input.lang === "tr" || input.lang === "en") ? input.lang : fileLang;

  // While a post has never been on the site, its address follows its title.
  let target = file;
  if (!published) {
    const slug = slugify(meta.title || "") || file.replace(/\.(tr|en)\.md$/, "");
    const wanted = `${slug}.${lang}.md`;
    if (wanted !== file && FILE_RE.test(wanted)) target = uniqueFile(slug, lang, file);
  }
  if (target !== file) {
    fs.renameSync(abs, path.join(POSTS_DIR, target));
    const oldImgs = path.join(IMAGES_DIR, file.replace(/\.(tr|en)\.md$/, ""));
    const newImgs = path.join(IMAGES_DIR, target.replace(/\.(tr|en)\.md$/, ""));
    let body = input.body;
    if (fs.existsSync(oldImgs) && !fs.existsSync(newImgs)) {
      fs.renameSync(oldImgs, newImgs);
      body = body.split(`/blog/${file.replace(/\.(tr|en)\.md$/, "")}/`).join(`/blog/${target.replace(/\.(tr|en)\.md$/, "")}/`);
    }
    input = { ...input, body };
  }
  writePost(path.join(POSTS_DIR, target), meta, input.body);

  // Finished posts go out on their own a little after the last keystroke.
  if (!meta.draft) schedule();
  return { file: target, body: input.body };
}

// ---------- http ----------

function httpError(code, message) {
  return Object.assign(new Error(message), { code });
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function sendFile(res, abs) {
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return send(res, 404, { error: "Bulunamadı" });
  res.writeHead(200, { "Content-Type": TYPES[path.extname(abs).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(abs).pipe(res);
}

function send(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

async function readBody(req, limit = 15 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw httpError(413, "Dosya çok büyük (en fazla 15 MB)");
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

/** Resolves a path inside base, refusing anything that escapes it. */
function inside(base, ...parts) {
  const abs = path.resolve(base, ...parts);
  if (abs !== base && !abs.startsWith(base + path.sep)) throw httpError(400, "Geçersiz yol");
  return abs;
}

const ALLOWED_HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);

async function handle(req, res) {
  // Only this PC's browser may talk to the editor.
  if (!ALLOWED_HOSTS.has(req.headers.host)) return send(res, 403, { error: "forbidden" });
  if (req.method !== "GET" && req.headers.origin && !ALLOWED_HOSTS.has(req.headers.origin.replace(/^https?:\/\//, "")))
    return send(res, 403, { error: "forbidden" });

  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);

  // Static: the app itself, marked from node_modules, and post images.
  if (req.method === "GET" && parts[0] !== "api") {
    if (parts.length === 0) return sendFile(res, path.join(HERE, "index.html"));
    if (parts[0] === "app" && parts.length === 2) return sendFile(res, inside(HERE, parts[1]));
    if (parts[0] === "vendor" && parts[1] === "marked.js")
      return sendFile(res, path.join(ROOT, "node_modules", "marked", "lib", "marked.esm.js"));
    if (parts[0] === "blog") return sendFile(res, inside(IMAGES_DIR, ...parts.slice(1)));
    if (parts[0] === "ersin-avatar.jpg") return sendFile(res, path.join(ROOT, "public", "ersin-avatar.jpg"));
    return send(res, 404, { error: "Bulunamadı" });
  }

  const [, resource, name] = parts;

  if (resource === "status" && req.method === "GET") return send(res, 200, status());

  if (resource === "posts" && !name && req.method === "GET") return send(res, 200, listPosts());

  if (resource === "posts" && !name && req.method === "POST") {
    const { lang = "tr" } = JSON.parse((await readBody(req)).toString() || "{}");
    const l = lang === "en" ? "en" : "tr";
    const file = uniqueFile("yeni-yazi", l);
    writePost(path.join(POSTS_DIR, file), { title: "", date: today(), summary: "", draft: true }, "");
    return send(res, 200, { file });
  }

  if (resource === "posts" && name) {
    if (!FILE_RE.test(name)) throw httpError(400, "Geçersiz dosya adı");
    const abs = path.join(POSTS_DIR, name);

    if (req.method === "GET") {
      const post = readFront(abs);
      if (!post) throw httpError(404, "Yazı bulunamadı");
      return send(res, 200, { file: name, ...post, published: trackedPosts().has(rel(name)) });
    }
    if (req.method === "PUT") {
      const input = JSON.parse((await readBody(req)).toString());
      return send(res, 200, savePost(name, input));
    }
    if (req.method === "DELETE") {
      const wasPublished = trackedPosts().has(rel(name));
      if (fs.existsSync(abs)) fs.rmSync(abs);
      const imgs = path.join(IMAGES_DIR, name.replace(/\.(tr|en)\.md$/, ""));
      const otherLang = fs.existsSync(path.join(POSTS_DIR, name.replace(/\.(tr|en)\.md$/, name.endsWith(".tr.md") ? ".en.md" : ".tr.md")));
      if (!otherLang && fs.existsSync(imgs)) fs.rmSync(imgs, { recursive: true });
      if (wasPublished) runPublish();
      return send(res, 200, { ok: true, status: status() });
    }
  }

  if (resource === "publish" && req.method === "POST") {
    runPublish();
    return send(res, 200, status());
  }

  if (resource === "unpublish" && name && req.method === "POST") {
    if (!FILE_RE.test(name)) throw httpError(400, "Geçersiz dosya adı");
    const abs = path.join(POSTS_DIR, name);
    const post = readFront(abs);
    if (!post) throw httpError(404, "Yazı bulunamadı");
    writePost(abs, { ...post.meta, draft: true }, post.body);
    if (trackedPosts().has(rel(name))) {
      try {
        unpublish(rel(name), post.meta.title);
        state.lastAt = Date.now();
        state.lastMessage = `Yayından kaldırıldı: ${post.meta.title}`;
        state.error = "";
      } catch (err) {
        state.error = String(err.stderr || err.message).trim();
      }
    }
    return send(res, 200, status());
  }

  if (resource === "upload" && req.method === "POST") {
    const slug = url.searchParams.get("slug") || "";
    if (!/^[a-z0-9-]+$/.test(slug)) throw httpError(400, "Geçersiz yazı adı");
    const original = url.searchParams.get("name") || "resim.png";
    const ext = (path.extname(original).toLowerCase().match(/^\.(png|jpe?g|gif|webp|svg)$/) || [".png"])[0];
    const base = slugify(path.basename(original, path.extname(original))) || "resim";
    const dir = inside(IMAGES_DIR, slug);
    fs.mkdirSync(dir, { recursive: true });
    let fname = `${base}${ext}`;
    for (let i = 2; fs.existsSync(path.join(dir, fname)); i++) fname = `${base}-${i}${ext}`;
    fs.writeFileSync(path.join(dir, fname), await readBody(req));
    return send(res, 200, { url: `/blog/${slug}/${fname}` });
  }

  throw httpError(404, "Bulunamadı");
}

const server = http.createServer((req, res) =>
  handle(req, res).catch((err) => send(res, err.code >= 400 && err.code < 600 ? err.code : 500, { error: err.message })),
);

function openApp() {
  const url = `http://127.0.0.1:${PORT}`;
  const chrome = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].find((p) => fs.existsSync(p));
  if (process.argv.includes("--no-open")) return;
  if (chrome) spawn(chrome, [`--app=${url}`, "--window-size=1400,900"], { detached: true, stdio: "ignore" }).unref();
  else spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
}

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    log("Editör zaten açık, penceresini getiriyorum.");
    openApp();
    setTimeout(() => process.exit(0), 500);
  } else throw err;
});

server.listen(PORT, "127.0.0.1", () => {
  log(`Yazı editörü açık: http://127.0.0.1:${PORT}`);
  log("Bu pencere açık kaldıkça editör çalışır. Kapatınca editör de kapanır.");
  openApp();
});

// Send anything still waiting before the window closes.
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => {
    if (state.phase === "waiting") runPublish();
    process.exit(0);
  });
}
