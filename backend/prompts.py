from fastapi import HTTPException

LIMITS = {
    "Trendyol": "başlık en fazla 100 karakter",
    "Hepsiburada": "başlık en fazla 150 karakter",
    "n11": "başlık en fazla 65 karakter",
    "Amazon": "title max 200 characters, 5 bullet points, backend keywords max 250 bytes",
    "Etsy": "title max 140 characters, exactly 13 tags each max 20 characters",
}

BASE = (
    "Sen Kazandıran adlı içerik stüdyosunun uzman metin yazarısın. Çıktıyı temiz Markdown "
    "başlıkları ve maddelerle ver. Giriş veya kapanış cümlesi yazma, doğrudan içeriğe başla."
)


def _f(data: dict, key: str) -> str:
    return str(data.get(key, "")).strip()[:4000]


def listing(d):
    platform = _f(d, "platform") or "Trendyol"
    return (
        f"Pazar yeri: {platform} ({LIMITS.get(platform, '')}).\nÜrün adı: {_f(d, 'product_name')}\n"
        f"Marka: {_f(d, 'brand')}\nÖzellikler: {_f(d, 'features')}\nHedef kitle: {_f(d, 'audience')}\n"
        f"Ton: {_f(d, 'tone')}\nDil: {_f(d, 'language') or 'Türkçe'}\n\n"
        "Şunları üret: ## SEO Başlığı (karakter sınırına uy, sonuna karakter sayısını parantezle yaz), "
        "## Öne Çıkan Özellikler (5-7 madde), ## Ürün Açıklaması (ikna edici, 150-250 kelime), "
        "## Anahtar Kelimeler (virgülle ayrılmış 15-20 kelime)."
    )


def cv(d):
    return (
        f"Aday bilgileri:\n{_f(d, 'background')}\n\nHedef pozisyon: {_f(d, 'position')}\n"
        f"Şirket: {_f(d, 'company')}\nİş ilanı:\n{_f(d, 'job_post')}\nDil: {_f(d, 'language') or 'Türkçe'}\n\n"
        "Şunları üret: ## CV (Profesyonel Özet, Deneyim - başarı odaklı ve ölçülebilir maddeler, Yetenekler, Eğitim; "
        "ilandaki anahtar kelimelerle ATS uyumlu), ## Ön Yazı (250-350 kelime, şirkete ve ilana özel). "
        "Adayın vermediği bilgi uydurma; eksik yerleri [köşeli parantez] ile işaretle."
    )


def social(d):
    return (
        f"İşletme türü: {_f(d, 'business')}\nİşletme/ürün: {_f(d, 'topic')}\nPlatform: {_f(d, 'platform') or 'Instagram'}\n"
        f"Hedef kitle: {_f(d, 'audience')}\nTon: {_f(d, 'tone')}\nDil: {_f(d, 'language') or 'Türkçe'}\n\n"
        "Şunları üret: ## 7 Günlük Paylaşım Planı (her gün için: ### Gün X - tema, format (Reels/Gönderi/Hikaye), "
        "görsel/video fikri, paylaşım metni, en iyi paylaşım saati) ve ## Hashtag Seti (20-25 hashtag, popüler ve niş karışık)."
    )


TOOLS = {"listing": ("Ürün İlanı", listing), "cv": ("CV ve Ön Yazı", cv), "social": ("Sosyal Medya", social)}


def build_prompt(tool: str, data: dict) -> tuple[str, str]:
    if tool not in TOOLS:
        raise HTTPException(400, "Bilinmeyen araç")
    label, fn = TOOLS[tool]
    return label, fn(data)
