import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useApi, useCredits } from "../lib/api";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const api = useApi();
  const { refresh } = useCredits();
  const [order, setOrder] = useState(null);
  const id = params.get("order");

  useEffect(() => {
    let tries = 0, timer;
    const poll = async () => {
      try {
        const o = await api(`/payments/status/${id}`);
        if (o.status !== "pending" || ++tries > 10) { setOrder(o); refresh(); return; }
      } catch { return setOrder({ status: "failed" }); }
      timer = setTimeout(poll, 2000);
    };
    if (id) poll(); else setOrder({ status: "failed" });
    return () => clearTimeout(timer);
  }, [api, id, refresh]);

  const ok = order?.status === "paid";
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 pt-20 text-center" data-testid="payment-result">
      {!order ? <Loader2 className="h-10 w-10 animate-spin text-blue-600" /> : ok
        ? <CheckCircle2 className="h-14 w-14 text-emerald-600" /> : <XCircle className="h-14 w-14 text-red-500" />}
      <h1 className="mt-5 font-heading text-2xl font-bold text-slate-900" data-testid="payment-result-title">
        {!order ? "Ödeme kontrol ediliyor…" : ok ? `${order.credits} kredi yüklendi` : "Ödeme tamamlanmadı"}
      </h1>
      <p className="mt-2 text-slate-600">{ok ? "Teşekkürler! Kredilerin hesabında." : order ? "Kartından para çekilmediyse tekrar deneyebilirsin." : ""}</p>
      {order && <Link to={ok ? "/panel" : "/kredi"} data-testid="payment-result-cta" className="mt-8 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">{ok ? "Üretmeye başla" : "Tekrar dene"}</Link>}
    </main>
  );
}
