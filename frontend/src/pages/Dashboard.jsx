import { Link } from "react-router-dom";
import { useUser } from "@clerk/react";
import { ArrowRight, Coins, Zap } from "lucide-react";
import { TOOLS, TOOL_IDS } from "../lib/tools";
import { useCredits } from "../lib/api";

export default function Dashboard() {
  const { user } = useUser();
  const { credits } = useCredits();
  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-8 sm:pb-16">
      <div className="fade-up flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm font-medium text-slate-500">Hoş geldin{user?.firstName ? `, ${user.firstName}` : ""}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">Bugün ne üretelim?</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-emerald-50 px-5 py-3" data-testid="dashboard-credit-banner">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Kalan kredi</p>
            <p className="flex items-center gap-2 font-heading text-3xl font-extrabold text-emerald-700"><Coins className="h-6 w-6" />{credits ?? "…"}</p>
          </div>
          <Link to="/kredi" data-testid="dashboard-buy-credits-btn" className="flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700">
            <Zap className="h-4 w-4" /> Kredi al
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {TOOL_IDS.map((id, i) => {
          const t = TOOLS[id];
          const Icon = t.icon;
          return (
            <Link key={id} to={`/arac/${id}`} data-testid={`tool-card-${id}`} style={{ animationDelay: `${(i + 1) * 80}ms` }}
              className="fade-up group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:p-7">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon className="h-6 w-6" /></span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">1 kredi</span>
              </div>
              <h2 className="mt-5 font-heading text-lg font-bold text-slate-900">{t.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{t.desc}</p>
              <span className="mt-6 flex items-center gap-1.5 text-sm font-bold text-blue-600">Hemen oluştur <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          );
        })}
      </div>
      <Link to="/gecmis" data-testid="dashboard-history-link" className="mt-8 inline-block text-sm font-semibold text-slate-600 hover:text-blue-600">Önceki içeriklerini gör →</Link>
    </main>
  );
}
