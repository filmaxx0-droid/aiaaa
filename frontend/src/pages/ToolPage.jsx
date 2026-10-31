import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { TOOLS } from "../lib/tools";
import { useApi, useCredits } from "../lib/api";
import OutputPanel from "../components/OutputPanel";
import { BackLink } from "../components/MobileNav";

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100";

const Field = ({ f, value, onChange }) => {
  const id = `form-input-${f.name.replace(/_/g, "-")}`;
  if (f.type === "select")
    return <select data-testid={id} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      {f.options.map((o) => <option key={o}>{o}</option>)}
    </select>;
  if (f.type === "textarea")
    return <textarea data-testid={id} rows={f.rows || 4} className={inputCls} placeholder={f.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />;
  return <input data-testid={id} className={inputCls} placeholder={f.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />;
};

export default function ToolPage() {
  const { tool } = useParams();
  const cfg = TOOLS[tool];
  const api = useApi();
  const navigate = useNavigate();
  const { credits, setCredits } = useCredits();
  const [form, setForm] = useState(() => Object.fromEntries((cfg?.fields || []).map((f) => [f.name, f.options ? f.options[0] : ""])));
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  if (!cfg) return <Navigate to="/panel" replace />;

  const run = async () => {
    const missing = cfg.fields.find((f) => f.required && !String(form[f.name]).trim());
    if (missing) return toast.error(`“${missing.label}” alanını doldurun`);
    if (credits === 0) { toast.error("Krediniz bitti. Paket seçerek devam edin."); return navigate("/kredi"); }
    setLoading(true); setText("");
    try {
      const res = await api("/generate", { method: "POST", body: JSON.stringify({ tool, data: form }), raw: true });
      if (res.status === 402) { toast.error("Krediniz bitti. Paket seçerek devam edin."); setCredits(0); return navigate("/kredi"); }
      if (!res.ok) throw new Error("Bir hata oluştu");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop();
        for (const ev of events) {
          if (!ev.startsWith("data: ")) continue;
          const msg = JSON.parse(ev.slice(6));
          if (msg.type === "start") setCredits(msg.credits);
          if (msg.type === "delta") setText((t) => t + msg.text);
          if (msg.type === "done") toast.success("İçerik hazır ve geçmişe kaydedildi");
          if (msg.type === "error") { toast.error(msg.message); setCredits((c) => (c ?? 0) + 1); }
        }
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const Icon = cfg.icon;
  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-8 sm:pb-12">
      <BackLink />
      <div className="mt-4 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon className="h-5 w-5" /></span>
            <div>
              <h1 className="font-heading text-xl font-bold text-slate-900 sm:text-2xl" data-testid="tool-title">{cfg.title}</h1>
              <p className="text-sm text-slate-500">Her üretim 1 kredi</p>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            {cfg.fields.map((f) => (
              <label key={f.name} className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">{f.label}{f.required && <span className="text-blue-600"> *</span>}</span>
                <Field f={f} value={form[f.name]} onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))} />
              </label>
            ))}
            <button data-testid="form-btn-submit" onClick={run} disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Oluşturuluyor…" : "Oluştur (1 kredi)"}
            </button>
          </div>
        </section>
        <section className="lg:col-span-7 lg:sticky lg:top-24">
          <OutputPanel text={text} loading={loading} onRegenerate={text ? run : null} filename={`kazandiran-${tool}`} />
        </section>
      </div>
    </main>
  );
}
