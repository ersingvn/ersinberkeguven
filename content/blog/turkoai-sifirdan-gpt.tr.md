---
title: turkoAI: Türkçe bir dil modelini sıfırdan yazmak
date: 2026-11-17 17:03
summary: Hazır model kullanmadan küçük bir Türkçe GPT yazdım. Nasıl çalıştığı ve neler öğrendiğim.
---

Dil modellerini her gün kullanıyoruz ama çoğumuz içlerinde ne olduğunu bilmiyoruz. Ben de bilmiyordum. Anlamanın en iyi yolu bir tane yazmak gibi geldi, ben de turkoAI'yi yazdım: Türkçe metin üreten, sohbet edebilen küçük bir GPT. Hazır bir model ya da Hugging Face'ten indirilmiş ağırlıklar yok; mimari, eğitim döngüsü ve metin üretimi kendi yazdığım birkaç yüz satır PyTorch kodu.

## Model

Mimari bildiğimiz GPT: kelime parçalarını vektörlere çeviren bir gömme (embedding) katmanı, üst üste dizilmiş Transformer blokları ve her adımda bir sonraki parçanın olasılığını veren bir çıkış katmanı. Her blokta bir dikkat (attention) katmanı ve bir MLP var. Dikkat katmanı "maskeli": model bir kelimeye bakarken yalnızca ondan öncekileri görebiliyor, sonrakileri göremiyor. Metin üretmek de bu yüzden basit: model bir sonraki parçayı tahmin ediyor, onu metne ekliyor ve tekrar ediyor.

Şu anki sohbet modeli 12 katmanlı ve yaklaşık 110 milyon parametreli.

## Tokenizer

Model harfleri değil sayıları görüyor, bu yüzden metni önce parçalara bölmek gerekiyor. İlk denemede karakter tabanlı bir tokenizer kullandım: her harf bir parça. Bu çalışıyor ama model aynı kelimeyi harf harf öğrenmek zorunda kalıyor. Sohbet modeli için kendi BPE (Byte Pair Encoding) tokenizer'ımı eğittim. BPE, metinde en sık yan yana gelen parçaları birleştirerek bir sözlük kuruyor; Türkçe gibi eklerle çalışan bir dilde "ler", "ında" gibi sık ekler kendiliğinden ayrı parçalar haline geliyor.

## Eğitim iki aşamada

1. **Ön eğitim:** Model Türkçe Vikipedi'yi okuyarak dili öğreniyor. Bu aşamada tek görevi bir sonraki parçayı tahmin etmek.
2. **Sohbet eğitimi:** Ardından soru-cevap biçimindeki konuşma örnekleriyle ince ayar yapılıyor. Model burada bir metni devam ettirmek yerine cevap vermeyi öğreniyor.

Ön eğitim uzun sürüyor. Bilgisayarımı saatlerce meşgul etmemek için büyük eğitimleri Kaggle'ın ücretsiz GPU'larında çalıştırıyorum: kod, yüklenip çalıştırılabilecek bir notebook'a dönüştürülüyor, eğitim bitince ağırlık dosyasını indiriyorum.

## Araç çağırma

110 milyon parametreli bir model "15 çarpı 23 kaç eder" sorusuna güvenilir cevap veremez. Bu yüzden modele cevap yerine bir **araç çağrısı** üretmeyi öğrettim: hesap gerektiren bir soruda hesap makinesini, bilgi gerektiren bir soruda internetsiz çalışan bir Vikipedi aramasını çağırıyor, sonucu okuyup cevabı kendisi yazıyor. Bilgisayarda dosya oluşturma ya da program açma gibi işlemler de yapabiliyor; değişiklik yapan her işlem uygulamada önce onay istiyor.

## Sırada ne var

Bir sonraki adım modeli 24 katmana, yaklaşık 183 milyon parametreye büyütmek. Küçük modelin öğrendiklerini çöpe atmamak için büyük modeli sıfırdan başlatmak yerine mevcut ağırlıkların üzerine katman ekleyerek eğitiyorum.

Bu küçük bir model ve büyük modellerle yarışması mümkün değil. Ama artık bir sohbet botunun cevabını okurken arkasında neler olduğunu biliyorum, bu projenin asıl amacı da buydu.
