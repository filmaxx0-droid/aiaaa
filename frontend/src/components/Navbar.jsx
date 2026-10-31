import { Link, NavLink } from "react-router-dom";
import { Show, SignInButton, UserButton } from "@clerk/react";
import { Coins, Sparkles } from "lucide-react";
import { useCredits } from "../lib/api";

export const Logo = () => (
  <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight text-slate-900">
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white"><Sparkles className="h-4 w-4" /></span>
    Kazandıran
  </Link>
);

const CreditBadge = () => {
  const { credits } = useCredits();
  return (
    <Link to="/kredi" data-testid="nav-credit-badge"
      className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
      <Coins className="h-4 w-4" />
      <span data-testid="credit-count">{credits ?? "…"}</span> kredi
    </Link>
  );
};

const linkCls = ({ isActive }) =>
  `hidden rounded-md px-3 py-2 text-sm font-medium transition-colors sm:block ${isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`;

export default function Navbar({ landing }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          {landing ? (
            <>
              <a href="#araclar" data-testid="nav-link-tools" className={linkCls({})}>Araçlar</a>
              <a href="#fiyatlar" data-testid="nav-link-pricing" className={linkCls({})}>Fiyatlar</a>
              <a href="#sss" data-testid="nav-link-faq" className={linkCls({})}>SSS</a>
            </>
          ) : (
            <Show when="signed-in">
              <NavLink to="/panel" end data-testid="nav-link-panel" className={linkCls}>Panel</NavLink>
              <NavLink to="/gecmis" data-testid="nav-link-history" className={linkCls}>Geçmiş</NavLink>
            </Show>
          )}
          <Show when="signed-out">
            <SignInButton>
              <button data-testid="nav-sign-in-btn" className="hidden whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 sm:block">Giriş yap</button>
            </SignInButton>
            <Link to="/sign-up" data-testid="nav-sign-up-btn" className="whitespace-nowrap rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">Ücretsiz başla</Link>
          </Show>
          <Show when="signed-in">
            {landing && <Link to="/panel" data-testid="nav-btn-dashboard" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Panele git</Link>}
            {!landing && <CreditBadge />}
            <UserButton />
          </Show>
        </nav>
      </div>
    </header>
  );
}
