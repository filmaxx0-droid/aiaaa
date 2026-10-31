import ReactMarkdown from "react-markdown";
import { Copy, Download, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";

export default function OutputPanel({ text, loading, onRegenerate, filename = "kazandiran" }) {
  const words = text ? text.trim().split(/\s+/).length : 0;
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success("Metin kopyalandı");
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${filename}.txt` });
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div data-testid="output-document-panel" className="relative min-h-[500px] rounded-2xl border border-slate-200 bg-white shadow-document">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 sm:px-8">
        <span className="font-mono text-xs text-slate-400" data-testid="output-word-count">
          {loading ? "Yazıyor…" : `${words} kelime`}
        </span>
        <div className="flex gap-1">
          <IconBtn id="btn-copy-output" onClick={copy} disabled={!text || loading} icon={Copy} label="Kopyala" />
          <IconBtn id="btn-download-output" onClick={download} disabled={!text || loading} icon={Download} label="İndir" />
          {onRegenerate && <IconBtn id="btn-regenerate" onClick={onRegenerate} disabled={loading} icon={RefreshCw} label="Yeniden üret" />}
        </div>
      </div>
      <div className="px-5 py-6 sm:px-10 sm:py-8">
        {text ? (
          <div className={`doc ${loading ? "doc-caret" : ""}`} data-testid="output-text"><ReactMarkdown>{text}</ReactMarkdown></div>
        ) : loading ? (
          <div className="space-y-3" data-testid="output-loading">
            {[90, 75, 85, 60].map((w, i) => <div key={i} className="h-3 animate-pulse rounded bg-slate-100" style={{ width: `${w}%` }} />)}
          </div>
        ) : (
          <div className="flex min-h-[380px] flex-col items-center justify-center text-center text-slate-400" data-testid="output-empty">
            <FileText className="mb-3 h-10 w-10" />
            <p className="max-w-xs text-sm">Formu doldurup “Oluştur”a bastığında içeriğin burada canlı olarak yazılacak.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const IconBtn = ({ id, onClick, disabled, icon: Icon, label }) => (
  <button data-testid={id} onClick={onClick} disabled={disabled}
    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40">
    <Icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{label}</span>
  </button>
);
