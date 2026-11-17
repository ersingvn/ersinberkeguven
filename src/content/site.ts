import type { T } from "@/lib/i18n";

/*
 * Everything personal on the site lives in this file.
 * Edit it freely: pages read from here and nothing else needs to change.
 */

export const profile = {
  name: "Ersin Berke Güven",
  // Square photo in public/. Set to "" to hide it.
  photo: "/ersin.jpg",
  // Tighter crop around the face for the small round photo on the home page.
  avatar: "/ersin-avatar.jpg",
  role: { tr: "Yazılım mühendisliği öğrencisi", en: "Software engineering student" } as T,
  // Short intro on the home page.
  intro: {
    tr: "Yazılım mühendisliği okuyorum. Derslerin dışında kendi araçlarımı yazıyorum: yapay zeka ajanları için bir oyun motoru, bir video editörü, sıfırdan eğittiğim Türkçe bir dil modeli ve bir blockchain. Bu sitede ne yaptığımı ve yaparken ne öğrendiğimi paylaşıyorum.",
    en: "I study software engineering. Outside of class I build my own tools: a game engine for AI agents, a video editor, a Turkish language model trained from scratch, and a blockchain. This site is where I share what I make and what I learn along the way.",
  } as T,
  // What you are working on right now. Keep it to one sentence.
  now: {
    tr: "Ludra'yı 1.0 sürümüne hazırlıyorum: Studio editörü ve oyun sistemleri (diyalog, envanter, kayıt) üzerinde çalışıyorum.",
    en: "Getting Ludra ready for 1.0: working on the Studio editor and game systems (dialogue, inventory, saving).",
  } as T,
  // Longer text for the About page. Each entry is a paragraph.
  about: {
    tr: [
      "Merhaba, ben Ersin. Yazılım mühendisliği öğrencisiyim.",
      "Bir şeyi en iyi, onu kendim yaparak öğreniyorum. Dil modellerinin nasıl çalıştığını merak edince hazır bir model kullanmak yerine tokenizer'ından eğitim döngüsüne kadar kendim yazdım. Blockchain'i anlamak için Rust'ta kendi zincirimi kurdum. Kullandığım video editöründen sıkılınca kendi editörümü yazdım.",
      "Son zamanlarda en çok, yapay zeka ajanlarıyla birlikte yazılım geliştirmek ilgimi çekiyor. Ludra bu merakın sonucu: oyunları bir ajanın okuyup test edebileceği biçimde tanımlayan, açık kaynak bir oyun motoru.",
    ],
    en: [
      "Hi, I'm Ersin. I'm a software engineering student.",
      "I learn things best by building them. When I got curious about how language models work, I wrote one myself, from the tokenizer to the training loop, instead of using a ready-made model. To understand blockchains I built my own chain in Rust. When my video editor started to annoy me, I wrote my own.",
      "Lately I'm most interested in building software together with AI agents. Ludra came out of that: an open-source game engine that describes games in a form an agent can read and test.",
    ],
  },
  links: {
    github: "https://github.com/ersingvn",
    youtube: "https://www.youtube.com/@bayfreespeecher",
    x: "https://x.com/onlyfener_1",
    // Fill these in to show them on the site; leave empty to hide.
    email: "",
    linkedin: "https://www.linkedin.com/in/ersinberkeguven/",
  },
  siteSource: "",
};

/** Public links in display order. Empty ones are skipped everywhere. */
export function socialLinks() {
  const l = profile.links;
  return [
    { label: "GitHub", href: l.github },
    { label: "YouTube", href: l.youtube },
    { label: "X", href: l.x },
    { label: "LinkedIn", href: l.linkedin },
    { label: "E-mail", href: l.email && `mailto:${l.email}` },
  ]
    .filter((s) => s.href)
    .map((s) => ({ ...s, display: s.href.replace(/^mailto:/, "").replace(/^https:\/\/(www\.)?/, "") }));
}

export type Project = {
  slug: string;
  name: string;
  summary: T;
  description: Record<keyof T, string[]>;
  status: T;
  stack: string[];
  started: string; // YYYY-MM
  links: { label: string; href: string }[];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "ludra",
    name: "Ludra",
    featured: true,
    summary: {
      tr: "Yapay zeka ajanları için oyun motoru. Oyunlar JSON, her oyun komut satırından oynanıp test edilebiliyor.",
      en: "A game engine built for AI agents. Games are JSON, and every game can be played and tested from the command line.",
    },
    description: {
      tr: [
        "Unity, Unreal ve Godot, bir editörde tıklayarak çalışan insanlar için tasarlandı. Ludra ise Claude gibi bir ajanın kullanması için: oyunlar düz JSON dosyaları, her hata makinenin okuyabileceği bir açıklamayla geliyor ve oyun bir ekran olmadan da oynatılıp ölçülebiliyor.",
        "Simülasyon deterministik, yani aynı girdiler her seferinde aynı sonucu veriyor. Bu sayede `ludra test` bir oyunu baştan sona oynatıp \"kazanıldı mı, kaç kez ölündü\" gibi sorulara kesin cevap verebiliyor. `ludra review` seviye tasarımındaki sorunları (ulaşılamayan yerler, kare hassasiyetinde zıplamalar, birbirine çok benzeyen bölümler) raporluyor.",
        "2D ve 3D fizik için Rapier kullanıyor. v0.97 ile Electron tabanlı bir editör (Ludra Studio) geldi; şu an diyalog, envanter, kayıt/yükleme gibi oyun sistemleri ve editör araçları üzerinde çalışıyorum.",
      ],
      en: [
        "Unity, Unreal and Godot are designed for people clicking around an editor. Ludra is designed for an agent like Claude: games are plain JSON files, every problem comes with a machine-readable explanation, and a game can be played and measured without a screen.",
        "The simulation is deterministic, so the same inputs always give the same result. That lets `ludra test` play a game from start to finish and answer questions like \"was it won, how many deaths\" exactly. `ludra review` reports level-design problems such as unreachable areas, frame-perfect jumps and levels that look too alike.",
        "It uses Rapier for 2D and 3D physics. v0.97 added an Electron-based editor, Ludra Studio; right now I'm working on game systems (dialogue, inventory, save/load) and editor tools.",
      ],
    },
    status: {
      tr: "Açık kaynak (MIT). npm'de v0.97 yayında, 1.0 üzerinde çalışılıyor.",
      en: "Open source (MIT). v0.97 is on npm, 1.0 is in progress.",
    },
    stack: ["TypeScript", "Node.js", "Rapier", "Three.js", "Electron"],
    started: "2026-10",
    links: [
      { label: "GitHub", href: "https://github.com/ersingvn/ludra" },
      { label: "npm", href: "https://www.npmjs.com/package/@ludra/cli" },
    ],
  },
  {
    slug: "turkoai",
    name: "turkoAI",
    featured: true,
    summary: {
      tr: "Sıfırdan yazılmış ve eğitilmiş Türkçe GPT dil modeli, masaüstü sohbet uygulamasıyla birlikte.",
      en: "A Turkish GPT language model written and trained from scratch, with a desktop chat app.",
    },
    description: {
      tr: [
        "Hazır bir model ya da kütüphane modeli kullanmadan yazdığım küçük bir Transformer. Dikkat (attention) katmanları, eğitim döngüsü ve metin üretimi birkaç yüz satır PyTorch kodu.",
        "Model önce Türkçe Vikipedi üzerinde ön eğitimden geçiyor, sonra sohbet verisiyle ince ayar yapılıyor. Kendi BPE tokenizer'ı var ve basit araç çağrıları yapabiliyor. Şu anki sohbet modeli yaklaşık 110 milyon parametre ve 12 katman.",
        "Büyük eğitimleri kendi bilgisayarımda değil Kaggle'ın ücretsiz GPU'larında çalıştırıyorum. Sıradaki adım modeli 24 katmana (yaklaşık 183 milyon parametre) büyütmek.",
      ],
      en: [
        "A small Transformer I wrote without using a pretrained model or a model library. The attention layers, the training loop and text generation are a few hundred lines of PyTorch.",
        "The model is first pretrained on Turkish Wikipedia, then fine-tuned on chat data. It has its own BPE tokenizer and can make simple tool calls. The current chat model has about 110 million parameters and 12 layers.",
        "I run the big training jobs on Kaggle's free GPUs rather than my own machine. The next step is growing the model to 24 layers (about 183 million parameters).",
      ],
    },
    status: {
      tr: "Kişisel proje, çalışıyor. Daha büyük model eğitiliyor.",
      en: "Personal project, working. A larger model is being trained.",
    },
    stack: ["Python", "PyTorch", "Kaggle"],
    started: "2026-10",
    links: [],
  },
  {
    slug: "nyxo",
    name: "Nyxo",
    featured: true,
    summary: {
      tr: "Masaüstü video editörü. Altyazı, seslendirme ve görsel üretimi için yapay zekayı tamamen kendi bilgisayarında çalıştırıyor.",
      en: "A desktop video editor. Captions, voice-over and image generation run fully on my own machine.",
    },
    description: {
      tr: [
        "Kendi kullanımım için yazdığım bir video editörü. Zaman çizelgesi, kesme, geçişler, filtreler, metin animasyonları ve MP4 dışa aktarımı var. Dışa aktarma FFmpeg ile yapılıyor; önizleme ile çıktının birebir aynı görünmesi için renk ve efekt hesaplarını ortak bir modülde tuttum.",
        "Yapay zeka özellikleri buluta değil, bilgisayarımdaki ekran kartına (RTX 4060, 8 GB) dayanıyor: otomatik altyazı için whisper.cpp, Türkçe seslendirme için Piper, görsel üretimi için ComfyUI üzerinde FLUX. 8 GB belleğe sığdırmak için modelleri gerektiğinde yükleyip CPU'ya taşımak gerekti.",
      ],
      en: [
        "A video editor I wrote for my own use. It has a timeline, cutting, transitions, filters, animated text and MP4 export. Export goes through FFmpeg; to make the preview and the output look exactly the same, color and effect math lives in one shared module.",
        "The AI features run on my own graphics card (RTX 4060, 8 GB), not in the cloud: whisper.cpp for automatic captions, Piper for Turkish voice-over, and FLUX through ComfyUI for image generation. Fitting all of this into 8 GB meant loading models on demand and offloading to the CPU.",
      ],
    },
    status: {
      tr: "Kişisel kullanım için, ticari değil. Windows kurulum dosyası var.",
      en: "For personal use, not commercial. Has a Windows installer.",
    },
    stack: ["TypeScript", "React", "Electron", "Vite", "FFmpeg", "whisper.cpp"],
    started: "2026-10",
    links: [],
  },
  {
    slug: "ersin-coin",
    name: "Ersin Coin",
    summary: {
      tr: "Rust ile sıfırdan yazılmış, Proof of Authority kullanan bağımsız bir Layer 1 blockchain.",
      en: "An independent Layer 1 blockchain written from scratch in Rust, using Proof of Authority.",
    },
    description: {
      tr: [
        "Bir blockchain'in içinde ne olduğunu anlamak için başka bir ağ üzerinde token çıkarmak yerine kendi zincirimi yazdım. Bloklar, işlemler, cüzdanlar ve doğrulayıcı mantığı Rust'ta; durumu tarayıcıdan izlemek için yerel bir web paneli de var.",
        "Şu an tek düğümlü bir v0.1. Sıradaki büyük adım düğümlerin birbiriyle konuştuğu bir P2P ağı ve herkese açık bir test ağı.",
      ],
      en: [
        "To understand what's inside a blockchain, I wrote my own chain instead of launching a token on someone else's network. Blocks, transactions, wallets and validator logic are in Rust, and there's a local web panel to watch the chain from a browser.",
        "Right now it's a single-node v0.1. The next big step is a P2P network where nodes talk to each other, and a public testnet.",
      ],
    },
    status: {
      tr: "v0.1, tek düğüm. Güvenlik denetiminden geçmedi; gerçek para için kullanılamaz.",
      en: "v0.1, single node. Not audited; not for real money.",
    },
    stack: ["Rust"],
    started: "2026-11",
    links: [],
  },
  {
    slug: "orta-cag-dunyasi",
    name: "Orta Çağ Dünyası",
    summary: {
      tr: "Rastgele üretilen yuvarlak bir dünyada geçen orta çağ strateji oyunu.",
      en: "A medieval strategy game set on a procedurally generated round world.",
    },
    description: {
      tr: [
        "100-150 küçük beylikten biriyle başlıyorsun: kaynak topluyor, yapı kuruyor, komşularınla ticaret, ittifak ya da savaş yapıyorsun. Arazi, nehirler, yollar ve medeniyetler her oyunda yeniden üretiliyor.",
        "Diğer beylikleri ve diplomasiyi basit bir yapay zeka yönetiyor. Müzik de kodla üretiliyor: oyun kendi orta çağ müziğini besteliyor. Three.js ile çiziliyor, Electron ile masaüstü uygulaması olarak paketleniyor.",
      ],
      en: [
        "You start as one of 100-150 small principalities: gather resources, build, and trade, ally or go to war with your neighbours. Terrain, rivers, roads and civilizations are generated fresh every game.",
        "A simple AI runs the other principalities and diplomacy. Even the music is generated in code: the game composes its own medieval soundtrack. Rendered with Three.js and packaged as a desktop app with Electron.",
      ],
    },
    status: { tr: "Oynanabilir prototip (v0.3).", en: "Playable prototype (v0.3)." },
    stack: ["JavaScript", "Three.js", "Electron"],
    started: "2026-10",
    links: [{ label: "GitHub", href: "https://github.com/ersingvn/orta-cag-dunyasi" }],
  },
];

export const skills: { group: T; items: string[] }[] = [
  { group: { tr: "Diller", en: "Languages" }, items: ["TypeScript", "JavaScript", "Python", "Rust", "SQL"] },
  { group: { tr: "Web ve masaüstü", en: "Web and desktop" }, items: ["React", "Next.js", "Node.js", "Electron", "Vite", "Tailwind CSS"] },
  { group: { tr: "Yapay zeka", en: "Machine learning" }, items: ["PyTorch", "Transformers", "ComfyUI", "whisper.cpp"] },
  { group: { tr: "Grafik ve medya", en: "Graphics and media" }, items: ["Three.js", "Rapier", "FFmpeg"] },
  { group: { tr: "Araçlar", en: "Tools" }, items: ["Git", "GitHub Actions", "npm", "Kaggle"] },
];

export const courses: T[] = [
  { tr: "Ayrık Matematik", en: "Discrete Mathematics" },
  { tr: "Olasılık", en: "Probability" },
  { tr: "Veritabanı Sistemleri", en: "Database Systems" },
  { tr: "İşletim Sistemleri ve Ağlar", en: "Operating Systems and Networks" },
];

export const education = {
  // Fill in your university and years.
  school: "",
  degree: { tr: "Yazılım Mühendisliği (Lisans)", en: "B.Sc. Software Engineering" } as T,
  years: "",
};
