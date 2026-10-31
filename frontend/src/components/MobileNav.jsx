import { Link, NavLink } from "react-router-dom";
import { LayoutGrid, History, Coins } from "lucide-react";

const items = [
  { to: "/panel", label: "Panel", icon: LayoutGrid, id: "mobile-nav-panel" },
  { to: "/gecmis", label: "Geçmiş", icon: History, id: "mobile-nav-history" },
  { to: "/kredi", label: "Kredi al", icon: Coins, id: "mobile-nav-credits" },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden">
      {items.map(({ to, label, icon: Icon, id }) => (
        <NavLink key={to} to={to} end data-testid={id}
          className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${isActive ? "text-blue-600" : "text-slate-500"}`}>
          <Icon className="h-5 w-5" />{label}
        </NavLink>
      ))}
    </nav>
  );
}

export const BackLink = ({ to = "/panel", children = "Panele dön" }) => (
  <Link to={to} data-testid="back-link" className="text-sm font-medium text-slate-500 hover:text-slate-900">← {children}</Link>
);
