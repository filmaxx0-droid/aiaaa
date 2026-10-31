# Kazandıran — Yapay Zeka İçerik Stüdyosu

Satıcılar, iş arayanlar ve küçük işletmeler için tek bir yerde yapay zekayla ürün ilanı, CV ve ön yazı, sosyal medya gönderisi üreten bir web uygulaması.
İlk kullanımlar ücretsiz; sonra kredi paketi satın alınıyor. Gelir kredi satışından geliyor.

## Kimler için
- **Online satıcılar** (Trendyol, Hepsiburada, n11, Etsy, Amazon): ürün başlığı, açıklama ve arama kelimelerini saniyeler içinde almak istiyorlar.
- **İş arayanlar**: iş ilanına göre hazırlanmış CV ve ön yazı istiyorlar.
- **Küçük işletmeler ve içerik üreticileri** (kafe, kuaför, butik, emlakçı): Instagram ve TikTok için gönderi metni, hashtag ve haftalık plan istiyorlar.
- Hedef pazar önce Türkiye. Arayüz Türkçe, içerikler Türkçe ve İngilizce (yurt dışı satış için) üretilebiliyor.

## Temel özellikler ve deneyim
1. **Ürün İlanı Yazarı**: ürün adı, birkaç özellik ve pazar yeri seçiliyor. Sonuç: SEO uyumlu başlık, madde madde açıklama, anahtar kelimeler. Her pazar yerinin karakter sınırlarına uyuyor.
2. **CV ve Ön Yazı Hazırlayıcı**: kullanıcı kendi bilgilerini ve hedef iş ilanını yapıştırıyor. Sonuç: ilana göre düzenlenmiş CV metni ve kişisel ön yazı.
3. **Sosyal Medya İçerik Üretici**: işletme türü, hedef kitle ve ton seçiliyor. Sonuç: gönderi metinleri, hashtag'ler ve 7 günlük paylaşım planı.
4. **Canlı yazım**: metin ekranda kelime kelime beliriyor. Tek tıkla kopyalanabiliyor ve yeniden üretilebiliyor.
5. **Geçmiş**: üretilen her içerik hesaba kaydediliyor; sonra açılıp tekrar kopyalanabiliyor.
6. **Kredi sistemi**: yeni kullanıcıya 5 ücretsiz kredi. Her üretim 1 kredi. Kredi bitince satın alma ekranı açılıyor.
7. **Kredi paketleri** (tek seferlik ödeme, abonelik yok):
   - Başlangıç: 50 kredi, 99 TL
   - Profesyonel: 200 kredi, 299 TL
   - İşletme: 600 kredi, 699 TL
8. **Tanıtım sayfası**: ne yaptığını gösteren örnekler, fiyatlar, sık sorulan sorular ve "Ücretsiz dene" butonu.

## Kullanıcı akışı
1. Ziyaretçi tanıtım sayfasına geliyor, örnek çıktıları görüyor ve "Ücretsiz başla"ya basıyor.
2. E-posta ve şifreyle kayıt oluyor; hesabına 5 ücretsiz kredi ekleniyor.
3. Panelde üç araçtan birini seçiyor, formu dolduruyor, "Oluştur"a basıyor.
4. Sonuç canlı yazılıyor; kullanıcı kopyalıyor veya geçmişe kaydedilmiş hâlini sonra açıyor.
5. Kredi bitince paket seçiyor, kartla ödüyor ve kredi hemen hesabına yükleniyor.

## Arayüz ve his
- Güven veren, profesyonel ve hızlı bir görünüm. Açık arka plan ve tek, güçlü bir vurgu rengi.
- Telefonda rahat kullanılabiliyor (hedef kitlenin çoğu mobilde).
- Panelde kalan kredi her zaman görünüyor. Araçlar büyük ve net kartlar şeklinde.
- Çıktı alanı belge gibi görünüyor ve okunması kolay.

## Uygulama aşamaları
**Aşama 1 — MVP (şimdi yapılacak)**
- Tanıtım sayfası, e-posta + şifre ile kayıt ve giriş
- Üç yapay zeka aracı, canlı yazım, kopyalama, geçmiş
- 5 ücretsiz kredi, kredi düşme, üç kredi paketi
- Stripe ile gerçek kartla ödeme (önce test modunda). Stripe hesabını talep edince gerçek para alınmaya başlanıyor

**Aşama 2**
- Türk kartları ve taksit için Iyzico ve PayTR ödemesi (bu iki firmadan şirket/şahıs başvurusu ve API anahtarları gerekiyor)
- Uygulama sahibi için yönetim paneli: kullanıcı sayısı, satışlar, en çok kullanılan araç
- CV'yi PDF olarak indirme

**Aşama 3**
- Aylık abonelik planları
- Ürün fotoğrafından ilan üretme ve ürün görseli arka plan düzenleme
- Arkadaşını getir, kredi kazan sistemi; ajanslar için toplu üretim

## Varsayımlar
- Kullanıcı "üç fikrin hepsi" dediği için üçü tek üründe birleştirildi; gelir modeli kredi paketi.
- Ödemeler MVP'de Stripe ile başlıyor, çünkü hesap ya da anahtar beklemeden hemen çalışıyor. Iyzico ve PayTR merchant başvurusu ve anahtar istediği için Aşama 2'de ekleniyor. Stripe'ın Türkiye'deki kullanılabilirliği, hesap talep edilirken kontrol edilecek. Desteklenmiyorsa Iyzico öne çekilecek.
- Fiyatlar TL cinsinden. Rakip ve piyasa seviyesine göre tahmini belirlendi; sonra değiştirilebilir.
- Yapay zeka metinleri Emergent'ın ortak anahtarıyla üretiliyor; her üretimin küçük bir maliyeti sahibin bakiyesinden düşüyor. Kredi fiyatları bu maliyetin çok üstünde tutuldu.
- Giriş sadece e-posta ve şifreyle yapılıyor (kullanıcının seçimi); şifre sıfırlama ve e-posta doğrulama dahil.
- Uygulama adı "Kazandıran" olarak geçici seçildi; değiştirilebilir.
- Kazanç garantisi verilemez. Ürün, gerçek talebi olan bir alan için tasarlandı; ama gelir pazarlamaya ve kullanıcı bulmaya bağlı.
