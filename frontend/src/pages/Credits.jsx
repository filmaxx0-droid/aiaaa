import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import PackCard, { PACKS } from "../components/PackCard";
import { useApi, useCredits } from "../lib/api";

const inputCls = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100";
const FIELDS = [
  ["name", "Ad"], ["surname", "Soyad"], ["phone", "Telefon", "+905xxxxxxxxx"], ["city", "Şehir", "İstanbul"], ["address", "Fatura adresi", "Mahalle, sokak, no"],
];

export default function Credits() {
  const api = useApi();
  const { credits } = useCredits();
  const [enabled, setEnabled] = useState(null);
  const [pack, setPack] = useState(null);
  const [form, setForm] = useState({ name: "", surname: "", phone: "", city: "", address: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { api("/packs").then((d) => setEnabled(d.enabled)).catch(() => setEnabled(false)); }, [api]);

  const pay = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await api("/payments/initialize", { method: "POST", body: JSON.stringify({ ...form, pack_id: pack.id, origin_url: window.location.origin }) });
      window.location.href = d.payment_page_url;
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-8">
      <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">Kredi yükle</h1>
      <p className="mt-2 text-slate-600">Şu an <b data-testid="credits-page-balance">{credits ?? "…"}</b> kredin var. Tek seferlik ödeme, abonelik yok. Krediler hiç bitmez, süresizdir.</p>
      {enabled === false && (
        <div data-testid="payments-disabled-notice" className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" /> Kartla ödeme çok yakında aktif oluyor. Şimdilik ücretsiz kredilerini kullanabilirsin.
        </div>
      )}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PACKS.map((p) => <PackCard key={p.id} pack={p} cta="Satın al" disabled={!enabled} onClick={() => setPack(p)} />)}
      </div>
      <p className="mt-6 flex items-center gap-2 text-sm text-slate-500"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Ödemeler iyzico güvencesiyle alınır. Kart bilgilerin bizde saklanmaz.</p>

      <Dialog open={!!pack} onOpenChange={(o) => !o && setPack(null)}>
        <DialogContent data-testid="billing-dialog">
          <DialogHeader>
            <DialogTitle>{pack?.name} · {pack?.price} TL</DialogTitle>
            <DialogDescription>Fatura bilgileri iyzico tarafından zorunlu tutulur.</DialogDescription>
          </DialogHeader>
          <form onSubmit={pay} className="space-y-3">
            {FIELDS.map(([k, l, ph]) => (
              <label key={k} className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">{l}</span>
                <input required data-testid={`billing-input-${k}`} className={inputCls} placeholder={ph} value={form[k]} onChange={(e) => setForm((s) => ({ ...s, [k]: e.target.value }))} />
              </label>
            ))}
            <button data-testid="billing-submit-btn" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Ödemeye geç
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
