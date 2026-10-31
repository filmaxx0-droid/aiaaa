import { Check } from "lucide-react";

export const PACKS = [
  { id: "baslangic", name: "Başlangıç", credits: 50, price: 99, per: "1,98 TL / içerik", perks: ["50 içerik üretimi", "Tüm araçlar", "Süresiz kullanım"] },
  { id: "profesyonel", name: "Profesyonel", credits: 200, price: 299, per: "1,50 TL / içerik", popular: true, perks: ["200 içerik üretimi", "Tüm araçlar", "Süresiz kullanım", "Taksit imkânı"] },
  { id: "isletme", name: "İşletme", credits: 600, price: 699, per: "1,17 TL / içerik", perks: ["600 içerik üretimi", "Ajans ve mağazalar için", "Süresiz kullanım", "Taksit imkânı"] },
];

export default function PackCard({ pack, cta, onClick, disabled }) {
  return (
    <div data-testid={`pricing-card-${pack.id}`}
      className={`relative flex flex-col rounded-2xl border bg-white p-7 ${pack.popular ? "border-blue-600 shadow-lg ring-4 ring-blue-50" : "border-slate-200"}`}>
      {pack.popular && <span className="absolute -top-3 left-7 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">En popüler</span>}
      <h3 className="font-heading text-lg font-bold text-slate-900">{pack.name}</h3>
      <p className="mt-4 flex items-baseline gap-1"><span className="font-heading text-4xl font-extrabold text-slate-900">{pack.price}</span><span className="font-semibold text-slate-500">TL</span></p>
      <p className="mt-1 text-sm text-slate-500">{pack.credits} kredi · {pack.per}</p>
      <ul className="mt-6 flex-1 space-y-2.5">
        {pack.perks.map((p) => <li key={p} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-emerald-600" />{p}</li>)}
      </ul>
      <button data-testid={`pricing-btn-buy-${pack.id}`} onClick={onClick} disabled={disabled}
        className={`mt-7 rounded-xl px-5 py-3 text-sm font-bold transition-colors disabled:opacity-50 ${pack.popular ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-900 text-white hover:bg-slate-700"}`}>{cta}</button>
    </div>
  );
}
