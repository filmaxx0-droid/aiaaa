import { ShoppingBag, FileText, Share2 } from "lucide-react";

const LANG = { name: "language", label: "Çıktı dili", type: "select", options: ["Türkçe", "English", "Deutsch", "العربية"] };

export const TOOLS = {
  listing: {
    title: "Ürün İlanı Yazarı",
    short: "Ürün İlanı",
    icon: ShoppingBag,
    desc: "Trendyol, Hepsiburada, n11, Amazon ve Etsy için SEO uyumlu başlık, açıklama ve anahtar kelimeler.",
    fields: [
      { name: "platform", label: "Pazar yeri", type: "select", options: ["Trendyol", "Hepsiburada", "n11", "Amazon", "Etsy"] },
      { name: "product_name", label: "Ürün adı", placeholder: "Örn: Kadın Keten Gömlek Oversize", required: true },
      { name: "brand", label: "Marka", placeholder: "Örn: Lina Butik" },
      { name: "features", label: "Özellikler", type: "textarea", placeholder: "%100 keten, 4 renk, S-XL beden, yazlık, nefes alır kumaş...", required: true },
      { name: "audience", label: "Hedef kitle", placeholder: "Örn: 25-40 yaş, şık ve rahat giyinen kadınlar" },
      { name: "tone", label: "Ton", type: "select", options: ["Satış odaklı", "Samimi", "Lüks", "Teknik"] },
      LANG,
    ],
  },
  cv: {
    title: "CV ve Ön Yazı Hazırlayıcı",
    short: "CV ve Ön Yazı",
    icon: FileText,
    desc: "İş ilanına göre düzenlenmiş, ATS uyumlu CV metni ve kişisel ön yazı.",
    fields: [
      { name: "position", label: "Başvurulan pozisyon", placeholder: "Örn: Dijital Pazarlama Uzmanı", required: true },
      { name: "company", label: "Şirket", placeholder: "Örn: Getir" },
      { name: "background", label: "Kendi bilgilerin", type: "textarea", rows: 6, placeholder: "Ad soyad, eğitim, deneyimler, yetenekler, başarılar...", required: true },
      { name: "job_post", label: "İş ilanı metni", type: "textarea", rows: 5, placeholder: "İlanı buraya yapıştır" },
      LANG,
    ],
  },
  social: {
    title: "Sosyal Medya İçerik Üretici",
    short: "Sosyal Medya",
    icon: Share2,
    desc: "Gönderi metinleri, hashtag'ler ve 7 günlük paylaşım planı.",
    fields: [
      { name: "business", label: "İşletme türü", placeholder: "Örn: Kafe, kuaför, butik, emlakçı", required: true },
      { name: "topic", label: "İşletme / ürün hakkında", type: "textarea", placeholder: "Kadıköy'de üçüncü dalga kahve dükkanı, ev yapımı tatlılar...", required: true },
      { name: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "LinkedIn", "Facebook"] },
      { name: "audience", label: "Hedef kitle", placeholder: "Örn: Üniversite öğrencileri ve genç profesyoneller" },
      { name: "tone", label: "Ton", type: "select", options: ["Samimi", "Eğlenceli", "Profesyonel", "İlham verici"] },
      LANG,
    ],
  },
};

export const TOOL_IDS = Object.keys(TOOLS);
