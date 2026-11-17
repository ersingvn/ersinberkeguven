# Yazı yayınlama rehberi

Yazılar `content/blog/` klasöründeki Markdown dosyalarıdır. GitHub'a giden her değişiklik yaklaşık 30 saniyede siteye yansır.

## Yol 1: Bilgisayardan (önerilen)

```bash
npm run yazi -- "Ludra'yı neden JSON tabanlı yaptım"
```

Bu komut `content/blog/ludrayi-neden-json-tabanli-yaptim.tr.md` dosyasını bugünün tarihiyle ve **taslak** olarak oluşturur. İngilizce yazı için sonuna `--en` ekle.

1. Dosyayı VS Code'da aç ve yaz.
2. `npm run dev` çalıştır ve http://localhost:3000/tr/blog adresini aç. Taslaklar yalnızca burada, "DRAFT" etiketiyle görünür.
3. Yazı hazır olunca `draft: true` satırını sil.
4. Gönder:
   ```bash
   git add content/blog
   git commit -m "Yeni yazı: Ludra'yı neden JSON tabanlı yaptım"
   git push
   ```

## Yol 2: Telefondan ya da tarayıcıdan

Bu linki aç (yer imlerine ekleyebilirsin):

https://github.com/ersingvn/ersinberkeguven/new/main/content/blog?filename=yazi-adi.tr.md&value=---%0Atitle%3A%20Ba%C5%9Fl%C4%B1k%0Adate%3A%202026-01-01%0Asummary%3A%20Listede%20g%C3%B6r%C3%BCnecek%20tek%20c%C3%BCmle.%0A---%0A%0ABuraya%20yaz.%0A

1. Üstteki dosya adını değiştir. Dosya adı küçük harfli, Türkçe karaktersiz ve tireli olmalı, sonu `.tr.md` ya da `.en.md` ile bitmeli. Örnek: `ersin-coin-p2p.tr.md`. Bu ad aynı zamanda yazının adresi olur.
2. Başlığı, tarihi ve özeti düzelt, yazını yaz. "Preview" sekmesinden nasıl görüneceğine bakabilirsin.
3. **Commit changes** düğmesine bas. 30 saniye sonra yazı sitede.

Mevcut bir yazıyı düzenlemek için: GitHub'da dosyayı aç, kalem simgesine bas, değiştir, commit et.

## Dosyanın başı

```md
---
title: Yazının başlığı
date: 2026-11-20
summary: Yazı listesinde görünen tek cümle.
draft: true
---
```

- `date`: YYYY-AA-GG biçiminde olmalı. Yazılar bu tarihe göre sıralanır.
- `draft: true`: yazı canlı sitede görünmez. Yayınlamak için bu satırı sil.

## Markdown kısa notlar

```md
## Ara başlık

**kalın**, *italik*, `kod`, [link](https://ornek.com)

- madde
- madde

1. sıralı
2. madde

> alıntı

![Resim açıklaması](/blog/yazi-adi/resim.png)
```

Kod bloğu için kodu üç ters tırnak (```) arasına al.

**Resimler:** `public/blog/<yazı-adı>/` klasörüne koy ve yazıda `/blog/<yazı-adı>/resim.png` diye kullan.

## Çeviri

Aynı yazının İngilizcesi için aynı adla bir `.en.md` dosyası aç, örneğin `ersin-coin-p2p.en.md`. Bir yazının tek dili varsa diğer dildeki listede de görünür ve hangi dilde olduğu belirtilir.

## Takip

Okuyucular yeni yazıları RSS ile takip edebilir: `/tr/rss.xml` ve `/en/rss.xml`.
