import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Show } from "@clerk/react";
import ReactMarkdown from "react-markdown";
import { ArrowRight, Coins, Zap, ShieldCheck, Globe2 } from "lucide-react";
import Navbar from "../components/Navbar";
import PackCard, { PACKS } from "../components/PackCard";
import { TOOLS, TOOL_IDS } from "../lib/tools";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";

const SAMPLES = {
  listing: {
    input: "Trendyol · Kadın Keten Gömlek · %100 keten, 4 renk",
    output: `## SEO Başlığı
Kadın Oversize Keten Gömlek %100 Doğal Keten Yazlık Uzun Kollu Rahat Kesim (71)

## Öne Çıkan Özellikler
- **%100 doğal keten:** Sıcak günlerde nefes alan, terletmeyen kumaş
- **Oversize kesim:** Her vücut tipine rahat oturur
- **4 renk seçeneği:** Ekru, bej, haki ve siyah`,
  },
  cv: {
    input: "Dijital Pazarlama Uzmanı · 3 yıl deneyim · Getir",
    output: `## Profesyonel Özet
Performans pazarlamasında 3 yıllık deneyime sahip, veri odaklı dijital pazarlama uzmanı.

## Deneyim
- Meta ve Google Ads kampanyalarında **ROAS'ı %38 artırdım**
- Aylık 1,2 milyon TL reklam bütçesini yönettim`,
  },
  social: {
    input: "Kafe · Kadıköy · Instagram · Samimi ton",
    output: `### Gün 1 - Sabah Ritüeli (Reels)
**Fikir:** Barista latte art yaparken yakın çekim
**Metin:** Güne güzel bir kahveyle başlamak bir ayrıcalık değil, hak ☕ Bugün ilk fincan bizden mi?
**Saat:** 08:30

#kadıköy #kadıköykafe #thirdwavecoffee`,
  },
};

const FAQ = [
  ["Krediler nasıl düşer?", "Her içerik üretimi 1 kredi. Kayıt olunca 5 kredi hediye. Üretim başarısız olursa kredi otomatik iade edilir."],
  ["Trendyol ve Hepsiburada kurallarına uyuyor mu?", "Evet. Her pazar yerinin başlık karakter sınırı ve yapısı dikkate alınarak yazılır. Amazon ve Etsy için İngilizce de üretebilirsin."],
  ["Kredilerin süresi var mı?", "Hayır. Satın aldığın krediler süresizdir, abonelik yoktur."],
  ["Hangi dillerde içerik üretebilirim?", "Türkçe, İngilizce, Almanca ve Arapça. Yurt dışına satış yapanlar için idealdir."],
  ["Ürettiğim içerikler kimin?", "Tamamen senin. Dilediğin yerde ticari olarak kullanabilirsin."],
];

const Cta = ({ id, children = "Ücretsiz dene" }) => (
  <>
    <Show when="signed-out"><Link to="/sign-up" data-testid={id} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700">{children} <ArrowRight className="h-4 w-4" /></Link></Show>
    <Show when="signed-in"><Link to="/panel" data-testid={id} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white hover:bg-blue-700">Panele git <ArrowRight className="h-4 w-4" /></Link></Show>
  </>
);

function SampleViewer() {
  const [tab, setTab] = useState("listing");
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-document">
      <div className="flex gap-1 border-b border-slate-100 p-2">
        {TOOL_IDS.map((id) => (
          <button key={id} data-testid={`hero-sample-tab-${id}`} onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:text-sm ${tab === id ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}>{TOOLS[id].short}</button>
        ))}
      </div>
      <div className="p-5 sm:p-7" key={tab}>
        <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500">→ {SAMPLES[tab].input}</p>
        <div className="doc fade-up" data-testid="hero-sample-output"><ReactMarkdown>{SAMPLES[tab].output}</ReactMarkdown></div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar landing />
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-8 lg:grid-cols-12 lg:py-24">
        <div className="fade-up lg:col-span-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700"><Coins className="h-3.5 w-3.5" /> 5 ücretsiz kredi</span>
          <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Satan ilanlar, işe aldıran CV'ler, <span className="text-blue-600">beğenilen gönderiler.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-slate-600 sm:text-lg">Kazandıran, yapay zekayla Trendyol ilanını, CV'ni ve haftalık Instagram planını saniyeler içinde yazar. Sen sadece kopyala, yapıştır, kazan.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Cta id="hero-try-free-btn" />
            <a href="#fiyatlar" className="text-sm font-semibold text-slate-600 hover:text-slate-900" data-testid="hero-pricing-link">Fiyatları gör</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" /> 10 saniyede hazır</span>
            <span className="flex items-center gap-1.5"><Globe2 className="h-4 w-4 text-blue-600" /> 4 dilde içerik</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Abonelik yok</span>
          </div>
        </div>
        <div className="fade-up lg:col-span-6" style={{ animationDelay: "120ms" }}><SampleViewer /></div>
      </section>

      <section id="araclar" className="border-y border-slate-200 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">Tek hesap, üç güçlü araç</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Online satıcılar, iş arayanlar ve küçük işletmeler için tasarlandı.</p>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TOOL_IDS.map((id) => { const t = TOOLS[id]; const I = t.icon; return (
              <div key={id} data-testid={`landing-tool-${id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white"><I className="h-6 w-6" /></span>
                <h3 className="mt-5 font-heading text-lg font-bold text-slate-900">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.desc}</p>
              </div>); })}
          </div>
        </div>
      </section>

      <section id="fiyatlar" className="mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:py-24">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">Basit fiyatlar</h2>
        <p className="mt-3 text-slate-600">Tek seferlik ödeme. Krediler süresiz. İlk 5 üretim bizden.</p>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PACKS.map((p) => <PackCard key={p.id} pack={p} cta="Başla" onClick={() => navigate("/kredi")} />)}
        </div>
      </section>

      <section id="sss" className="border-t border-slate-200 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Sık sorulan sorular</h2>
          <Accordion type="single" collapsible className="mt-8">
            {FAQ.map(([q, a], i) => (
              <AccordionItem key={q} value={`q${i}`}>
                <AccordionTrigger data-testid={`faq-item-${i}`} className="text-left font-semibold">{q}</AccordionTrigger>
                <AccordionContent className="text-slate-600">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="bg-slate-900 px-4 py-16 text-center sm:px-8">
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">İlk içeriğin 1 dakika uzakta.</h2>
        <p className="mt-3 text-slate-400">Kart bilgisi gerekmez. 5 ücretsiz kredi seni bekliyor.</p>
        <div className="mt-8"><Cta id="footer-cta-btn" children="Ücretsiz başla" /></div>
        <p className="mt-12 text-xs text-slate-500">© {new Date().getFullYear()} Kazandıran</p>
      </section>
    </div>
  );
}
