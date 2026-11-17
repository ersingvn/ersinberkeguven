import { marked } from "/vendor/marked.js";

const $ = (id) => document.getElementById(id);
const SITE = "https://ersinberkeguven.vercel.app";

let posts = [];
let server = {};
let cur = null; // { file, published, title, summary, date, lang, draft, body }
let saveTimer = null;
let saving = Promise.resolve();
let lastSavedAt = null;
let dirty = false;
let view = localStorageGet("view") || "split";

// ---------- helpers ----------

function localStorageGet(k) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function localStorageSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {}
}

async function api(method, url, body, raw) {
  const res = await fetch(url, {
    method,
    headers: raw ? {} : { "Content-Type": "application/json" },
    body: raw ? body : body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Hata ${res.status}`);
  return data;
}

const slugOf = (file) => file.replace(/\.(tr|en)\.md$/, "");
const clock = (t) => new Date(t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
const longDate = (iso, lang) =>
  iso
    ? new Date(`${iso}T12:00:00Z`).toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

function confirmDialog({ title, text, items = [], ok, danger }) {
  return new Promise((resolve) => {
    const d = $("dialog");
    $("d-title").textContent = title;
    $("d-text").textContent = text || "";
    $("d-list").innerHTML = "";
    for (const it of items) {
      const li = document.createElement("li");
      const mark = document.createElement("span");
      mark.className = it.ok ? "ok" : "warn";
      mark.textContent = it.ok ? "✓" : "!";
      li.append(mark, document.createTextNode(it.text));
      $("d-list").append(li);
    }
    $("d-ok").textContent = ok;
    $("d-ok").className = danger ? "btn danger" : "btn primary";
    const done = (v) => {
      d.close();
      $("d-ok").onclick = $("d-cancel").onclick = null;
      resolve(v);
    };
    $("d-ok").onclick = () => done(true);
    $("d-cancel").onclick = () => done(false);
    d.oncancel = () => done(false);
    d.showModal();
    $("d-ok").focus();
  });
}

function autosize(el) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// ---------- list ----------

async function loadList() {
  posts = await api("GET", "/api/posts");
  renderList();
}

function renderList() {
  const q = $("search").value.trim().toLocaleLowerCase("tr");
  const shown = posts.filter((p) => !q || `${p.title} ${p.summary}`.toLocaleLowerCase("tr").includes(q));
  const groups = [
    ["Taslaklar", shown.filter((p) => !p.published)],
    ["Yayında", shown.filter((p) => p.published)],
  ];
  const list = $("list");
  list.innerHTML = "";
  for (const [name, items] of groups) {
    const h = document.createElement("div");
    h.className = "group-title";
    h.textContent = `${name} · ${items.length}`;
    list.append(h);
    if (!items.length) {
      const e = document.createElement("div");
      e.className = "empty-list";
      e.textContent = name === "Taslaklar" ? "Taslak yok." : "Henüz yayında yazı yok.";
      list.append(e);
    }
    for (const p of items) {
      const b = document.createElement("button");
      b.className = `item${cur && cur.file === p.file ? " active" : ""}`;
      const t = document.createElement("div");
      t.className = `t${p.title ? "" : " untitled"}`;
      const s = document.createElement("span");
      s.textContent = p.title || "Başlıksız yazı";
      t.append(s);
      if (p.published && p.unsent) {
        const dot = document.createElement("i");
        dot.className = "dot";
        dot.title = "Gönderilmemiş değişiklik";
        t.append(dot);
      }
      const m = document.createElement("div");
      m.className = "m";
      m.textContent = `${p.date || "—"} · ${p.lang.toUpperCase()} · ${p.words} kelime`;
      b.append(t, m);
      b.onclick = () => openPost(p.file);
      list.append(b);
    }
  }
}

// ---------- editor ----------

async function openPost(file) {
  await flushSave();
  const data = await api("GET", `/api/posts/${encodeURIComponent(file)}`);
  cur = {
    file: data.file,
    published: data.published,
    title: data.meta.title || "",
    summary: data.meta.summary || "",
    date: data.meta.date || "",
    draft: data.meta.draft === "true",
    lang: data.file.endsWith(".en.md") ? "en" : "tr",
    body: data.body,
  };
  localStorageSet("last", cur.file);
  $("empty").hidden = true;
  $("panes").hidden = $("bar").hidden = $("foot").hidden = false;
  $("title").value = cur.title;
  $("summary").value = cur.summary;
  $("date").value = cur.date;
  $("lang").value = cur.lang;
  $("lang").disabled = cur.published;
  $("lang").title = cur.published ? "Yayındaki bir yazının dili değiştirilemez" : "";
  $("body").value = cur.body;
  dirty = false;
  lastSavedAt = null;
  autosize($("title"));
  autosize($("body"));
  renderPreview();
  renderMeta();
  renderStatus();
  renderList();
  if (!cur.title) $("title").focus();
}

function closeEditor() {
  cur = null;
  $("empty").hidden = false;
  $("panes").hidden = $("bar").hidden = $("foot").hidden = true;
  renderList();
}

function readForm() {
  cur.title = $("title").value.replace(/\n/g, " ");
  cur.summary = $("summary").value;
  cur.date = $("date").value;
  cur.lang = $("lang").value;
  cur.body = $("body").value;
}

function changed() {
  readForm();
  dirty = true;
  renderPreview();
  renderMeta();
  $("saved").textContent = "Kaydediliyor…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 700);
}

function save() {
  clearTimeout(saveTimer);
  if (!cur || !dirty) return saving;
  dirty = false;
  const snapshot = { ...cur };
  saving = saving
    .then(() =>
      api("PUT", `/api/posts/${encodeURIComponent(snapshot.file)}`, {
        title: snapshot.title,
        summary: snapshot.summary,
        date: snapshot.date,
        lang: snapshot.lang,
        draft: snapshot.draft,
        body: snapshot.body,
      }),
    )
    .then((r) => {
      if (cur && cur.file === snapshot.file && r.file !== snapshot.file) {
        cur.file = r.file;
        localStorageSet("last", r.file);
        // Image links follow a renamed post; keep the text box in step.
        if (r.body !== snapshot.body && $("body").value === snapshot.body) {
          $("body").value = cur.body = r.body;
          renderPreview();
        }
      }
      lastSavedAt = Date.now();
      $("saved").textContent = `Kaydedildi ${clock(lastSavedAt)}`;
      renderMeta();
      return loadList();
    })
    .catch((err) => {
      dirty = true;
      $("saved").textContent = `Kaydedilemedi: ${err.message}`;
    });
  return saving;
}

function flushSave() {
  if (dirty) return save();
  return saving;
}

function renderMeta() {
  if (!cur) return;
  const words = cur.body.split(/\s+/).filter(Boolean).length;
  $("words").textContent = `${words} kelime`;
  $("read").textContent = `~${Math.max(1, Math.round(words / 200))} dk okuma`;
  $("addr").textContent = `${SITE.replace("https://", "")}/${cur.lang}/blog/${slugOf(cur.file)}`;
  $("addr").title = cur.published ? "Yazının adresi" : "Adres, yayınlanana kadar başlığa göre güncellenir";
}

function renderPreview() {
  if (!cur) return;
  $("p-title").textContent = cur.title || "Başlıksız yazı";
  $("p-date").textContent = longDate(cur.date, cur.lang);
  $("p-body").innerHTML = marked.parse(cur.body || "");
}

function renderStatus() {
  const el = $("status");
  const pub = $("publish");
  const live = $("open-live");
  if (!cur) return;
  const entry = posts.find((p) => p.file === cur.file);
  const unsent = entry ? entry.unsent : false;
  el.innerHTML = "";
  const pill = document.createElement("span");
  const msg = document.createElement("span");
  msg.className = "msg";
  el.append(pill, msg);

  live.hidden = !cur.published;
  live.href = `${SITE}/${cur.lang}/blog/${slugOf(cur.file)}`;
  $("m-unpublish").hidden = !cur.published;
  pub.hidden = false;
  pub.disabled = false;

  if (cur.draft && !cur.published) {
    pill.className = "pill draft";
    pill.textContent = "Taslak";
    msg.textContent = "Yalnızca bu bilgisayarda";
    pub.textContent = "Yayınla";
    return;
  }
  pill.className = "pill live";
  pill.textContent = cur.published ? "Yayında" : "Yayınlanıyor";

  if (server.error) {
    msg.className = "msg err";
    msg.textContent = `Gönderilemedi: ${server.error.split("\n")[0]}`;
    msg.title = server.error;
    pub.textContent = "Tekrar dene";
  } else if (server.phase === "sending") {
    msg.textContent = "Siteye gönderiliyor…";
    pub.textContent = "Gönderiliyor…";
    pub.disabled = true;
  } else if (server.phase === "waiting" && (unsent || dirty)) {
    const s = Math.max(0, Math.ceil((server.dueAt - Date.now()) / 1000));
    msg.textContent = `Değişiklikler ${s} sn sonra siteye gönderilecek`;
    pub.textContent = "Şimdi gönder";
  } else if (unsent || dirty) {
    msg.textContent = "Gönderilmemiş değişiklik var";
    pub.textContent = "Şimdi gönder";
  } else {
    msg.textContent = server.lastAt ? `Son gönderim ${clock(server.lastAt)} · ~30 sn içinde sitede` : "Sitedeki sürümle aynı";
    pub.hidden = true;
  }
}

async function pollStatus() {
  try {
    server = await api("GET", "/api/status");
  } catch {
    server = { error: "Editör sunucusuna ulaşılamıyor. Siyah pencere kapalı olabilir." };
  }
  renderStatus();
}

// ---------- actions ----------

async function newPost() {
  await flushSave();
  const { file } = await api("POST", "/api/posts", { lang: "tr" });
  await loadList();
  await openPost(file);
}

async function publishNow() {
  if (!cur) return;
  if (cur.draft && !cur.published) {
    readForm();
    if (!cur.title.trim()) {
      toast("Yayınlamadan önce bir başlık yaz.");
      $("title").focus();
      return;
    }
    const ok = await confirmDialog({
      title: "Yazı yayınlansın mı?",
      text: "Yazı herkese açık olacak. Sonradan düzenleyebilir ya da yayından kaldırabilirsin.",
      items: [
        { ok: true, text: `Başlık: ${cur.title}` },
        cur.summary.trim()
          ? { ok: true, text: "Özet yazılmış" }
          : { ok: false, text: "Özet boş: yazı listesinde yalnızca başlık görünecek" },
        { ok: cur.body.trim().length > 0, text: cur.body.trim() ? `${cur.body.split(/\s+/).filter(Boolean).length} kelime` : "Yazı boş" },
        { ok: true, text: `Adres: /${cur.lang}/blog/${slugify(cur.title) || slugOf(cur.file)}` },
      ],
      ok: "Yayınla",
    });
    if (!ok) return;
    cur.draft = false;
    dirty = true;
  }
  await save();
  server = await api("POST", "/api/publish");
  await loadList();
  const entry = posts.find((p) => p.file === cur.file);
  if (entry) cur.published = entry.published;
  $("lang").disabled = cur.published;
  renderStatus();
  if (server.error) toast("Gönderilemedi. Ayrıntı üstte yazıyor.");
  else toast("Gönderildi. Yaklaşık 30 saniye içinde sitede.");
}

async function unpublishCurrent() {
  $("menu").hidden = true;
  if (!cur) return;
  const ok = await confirmDialog({
    title: "Yayından kaldırılsın mı?",
    text: "Yazı siteden kaldırılır ama silinmez: bu bilgisayarda taslak olarak kalır, istediğin zaman tekrar yayınlayabilirsin.",
    ok: "Yayından kaldır",
    danger: true,
  });
  if (!ok) return;
  await flushSave();
  server = await api("POST", `/api/unpublish/${encodeURIComponent(cur.file)}`);
  toast(server.error ? "Kaldırılamadı. Ayrıntı üstte yazıyor." : "Yayından kaldırıldı. Taslaklarda duruyor.");
  await loadList();
  await openPost(cur.file);
}

async function deleteCurrent() {
  $("menu").hidden = true;
  if (!cur) return;
  const ok = await confirmDialog({
    title: "Yazı silinsin mi?",
    text: cur.published
      ? "Yazı bu bilgisayardan silinir ve siteden de kaldırılır. Bu işlem geri alınamaz."
      : "Taslak bu bilgisayardan silinir. Bu işlem geri alınamaz.",
    ok: "Sil",
    danger: true,
  });
  if (!ok) return;
  clearTimeout(saveTimer);
  dirty = false;
  await saving;
  await api("DELETE", `/api/posts/${encodeURIComponent(cur.file)}`);
  toast("Yazı silindi.");
  closeEditor();
  await loadList();
}

// Same rules as scripts/lib/publish.mjs, only used for the address shown before publishing.
function slugify(text) {
  return text
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ---------- markdown commands ----------

const ta = () => $("body");

function insert(text, selectFrom, selectTo) {
  const el = ta();
  el.focus();
  const start = el.selectionStart;
  // execCommand keeps Ctrl+Z working; fall back if it is unavailable.
  if (!document.execCommand("insertText", false, text)) el.setRangeText(text, start, el.selectionEnd, "end");
  if (selectFrom !== undefined) el.setSelectionRange(start + selectFrom, start + (selectTo ?? selectFrom));
  autosize(el);
  changed();
}

function wrap(before, after = before, placeholder = "metin") {
  const el = ta();
  const sel = el.value.slice(el.selectionStart, el.selectionEnd) || placeholder;
  insert(`${before}${sel}${after}`, before.length, before.length + sel.length);
}

function prefixLines(make) {
  const el = ta();
  const v = el.value;
  const start = v.lastIndexOf("\n", el.selectionStart - 1) + 1;
  let end = v.indexOf("\n", el.selectionEnd);
  if (end === -1) end = v.length;
  el.setSelectionRange(start, end);
  const lines = v.slice(start, end).split("\n");
  insert(lines.map((l, i) => make(l, i)).join("\n"));
}

const commands = {
  h2: () => prefixLines((l) => `## ${l.replace(/^#+\s*/, "")}`),
  h3: () => prefixLines((l) => `### ${l.replace(/^#+\s*/, "")}`),
  bold: () => wrap("**"),
  italic: () => wrap("*"),
  code: () => wrap("`", "`", "kod"),
  codeblock: () => {
    const el = ta();
    const sel = el.value.slice(el.selectionStart, el.selectionEnd) || "kod buraya";
    insert(`\n\`\`\`\n${sel}\n\`\`\`\n`, 5, 5 + sel.length);
  },
  ul: () => prefixLines((l) => `- ${l.replace(/^([-*]|\d+\.)\s+/, "")}`),
  ol: () => prefixLines((l, i) => `${i + 1}. ${l.replace(/^([-*]|\d+\.)\s+/, "")}`),
  quote: () => prefixLines((l) => `> ${l.replace(/^>\s?/, "")}`),
  link: () => {
    const el = ta();
    const sel = el.value.slice(el.selectionStart, el.selectionEnd) || "link metni";
    const text = `[${sel}](https://)`;
    insert(text, sel.length + 3, text.length - 1);
  },
  image: () => $("file").click(),
};

async function uploadImages(files) {
  if (!cur) return;
  for (const f of files) {
    if (!f.type.startsWith("image/")) continue;
    const marker = `![Yükleniyor: ${f.name || "resim"}…]()`;
    insert(marker);
    try {
      await flushSave();
      const name = f.name && f.name !== "image.png" ? f.name : `resim-${Date.now()}.png`;
      const { url } = await api("POST", `/api/upload?slug=${encodeURIComponent(slugOf(cur.file))}&name=${encodeURIComponent(name)}`, f, true);
      const alt = (f.name || "resim").replace(/\.[a-z]+$/i, "");
      $("body").value = $("body").value.replace(marker, `![${alt}](${url})`);
    } catch (err) {
      $("body").value = $("body").value.replace(marker, "");
      toast(`Resim yüklenemedi: ${err.message}`);
    }
    autosize($("body"));
    changed();
  }
}

// ---------- wiring ----------

function setView(v) {
  view = v;
  localStorageSet("view", v);
  $("panes").className = `panes ${v}`;
  for (const b of $("view").querySelectorAll("button")) b.classList.toggle("on", b.dataset.view === v);
}

$("new-post").onclick = newPost;
$("new-post-2").onclick = newPost;
$("search").oninput = renderList;
$("publish").onclick = publishNow;
$("m-unpublish").onclick = unpublishCurrent;
$("m-delete").onclick = deleteCurrent;
$("more").onclick = (e) => {
  e.stopPropagation();
  $("menu").hidden = !$("menu").hidden;
};
document.addEventListener("click", () => ($("menu").hidden = true));
$("view").onclick = (e) => e.target.dataset.view && setView(e.target.dataset.view);
$("toolbar").onclick = (e) => {
  const cmd = e.target.closest("button")?.dataset.cmd;
  if (cmd) commands[cmd]();
};
$("file").onchange = (e) => {
  uploadImages([...e.target.files]);
  e.target.value = "";
};

for (const id of ["title", "summary", "date", "lang", "body"]) {
  $(id).addEventListener(id === "date" || id === "lang" ? "change" : "input", () => {
    if (id === "title" || id === "body") autosize($(id));
    changed();
  });
}
$("title").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    $("summary").focus();
  }
});
$("summary").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    $("body").focus();
  }
});

$("body").addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    insert("  ");
  }
});

document.addEventListener("keydown", (e) => {
  if (!(e.ctrlKey || e.metaKey) || !cur) return;
  const k = e.key.toLowerCase();
  if (k === "s") {
    e.preventDefault();
    save().then(() => toast(cur && !cur.draft ? "Kaydedildi. Siteye kısa süre içinde gönderilecek." : "Kaydedildi."));
  } else if (document.activeElement === ta() && (k === "b" || k === "i" || k === "k")) {
    e.preventDefault();
    commands[{ b: "bold", i: "italic", k: "link" }[k]]();
  }
});

$("body").addEventListener("paste", (e) => {
  const files = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith("image/"));
  if (files.length) {
    e.preventDefault();
    uploadImages(files);
  }
});

let dragDepth = 0;
document.addEventListener("dragenter", (e) => {
  if (cur && e.dataTransfer?.types.includes("Files")) {
    dragDepth++;
    document.body.classList.add("dragging");
  }
});
document.addEventListener("dragleave", () => {
  if (--dragDepth <= 0) {
    dragDepth = 0;
    document.body.classList.remove("dragging");
  }
});
document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", (e) => {
  e.preventDefault();
  dragDepth = 0;
  document.body.classList.remove("dragging");
  if (cur && e.dataTransfer?.files.length) uploadImages([...e.dataTransfer.files]);
});

// Closing the window mid-sentence must not lose text: send the last save with keepalive.
window.addEventListener("beforeunload", () => {
  if (!dirty || !cur) return;
  readForm();
  fetch(`/api/posts/${encodeURIComponent(cur.file)}`, {
    method: "PUT",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: cur.title, summary: cur.summary, date: cur.date, lang: cur.lang, draft: cur.draft, body: cur.body }),
  });
});

// Tells the background server the window is gone, so it can stop (after sending anything pending).
window.addEventListener("pagehide", () => navigator.sendBeacon("/api/bye"));

// ---------- start ----------

setView(view);
await loadList();
await pollStatus();
const wanted = decodeURIComponent(location.hash.slice(1)) || localStorageGet("last");
if (wanted && posts.some((p) => p.file === wanted)) await openPost(wanted);
window.addEventListener("hashchange", () => {
  const f = decodeURIComponent(location.hash.slice(1));
  if (f && posts.some((p) => p.file === f)) openPost(f);
});
setInterval(pollStatus, 1000);
setInterval(() => {
  if (!dirty) loadList().then(renderStatus);
}, 4000);
