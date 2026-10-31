import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Inbox } from "lucide-react";
import { useApi } from "../lib/api";
import { TOOLS } from "../lib/tools";
import OutputPanel from "../components/OutputPanel";
import { BackLink } from "../components/MobileNav";

const fmt = (iso) => new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function History() {
  const api = useApi();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");
  useEffect(() => { api("/history").then(setItems).catch(() => setItems([])); }, [api]);

  const remove = async (id) => {
    await api(`/history/${id}`, { method: "DELETE" });
    setItems((s) => s.filter((x) => x.id !== id));
    toast.success("Silindi");
  };
  const shown = (items || []).filter((x) => filter === "all" || x.tool === filter);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-28 pt-8 sm:px-8">
      <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">Geçmiş</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {[["all", "Tümü"], ...Object.entries(TOOLS).map(([k, v]) => [k, v.short])].map(([k, l]) => (
          <button key={k} data-testid={`history-filter-${k}`} onClick={() => setFilter(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${filter === k ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {items === null ? <p className="p-6 text-sm text-slate-400">Yükleniyor…</p> : shown.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center text-slate-400" data-testid="history-empty">
            <Inbox className="mb-3 h-10 w-10" /><p className="text-sm">Henüz içerik yok.</p>
            <Link to="/panel" className="mt-3 text-sm font-semibold text-blue-600">İlk içeriğini oluştur →</Link>
          </div>
        ) : shown.map((x) => (
          <div key={x.id} data-testid="history-item-row" className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50">
            <Link to={`/gecmis/${x.id}`} className="min-w-0 flex-1" data-testid={`history-open-${x.id}`}>
              <p className="truncate font-semibold text-slate-900">{x.title}</p>
              <p className="text-xs text-slate-500">{TOOLS[x.tool]?.short} · {fmt(x.created_at)}</p>
            </Link>
            <button data-testid={`history-delete-${x.id}`} onClick={() => remove(x.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </main>
  );
}

export function HistoryDetail() {
  const { id } = useParams();
  const api = useApi();
  const [doc, setDoc] = useState(null);
  useEffect(() => { api(`/history/${id}`).then(setDoc).catch(() => setDoc(false)); }, [api, id]);
  return (
    <main className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:px-8">
      <BackLink to="/gecmis">Geçmişe dön</BackLink>
      {doc === false ? <p className="mt-6 text-slate-500">İçerik bulunamadı.</p> : doc && (
        <>
          <h1 className="mb-1 mt-4 font-heading text-xl font-bold text-slate-900 sm:text-2xl" data-testid="history-detail-title">{doc.title}</h1>
          <p className="mb-5 text-sm text-slate-500">{TOOLS[doc.tool]?.short} · {fmt(doc.created_at)}</p>
          <OutputPanel text={doc.output} filename={`kazandiran-${doc.tool}`} />
        </>
      )}
    </main>
  );
}
