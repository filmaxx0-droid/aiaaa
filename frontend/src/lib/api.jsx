import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useApi() {
  const { getToken } = useAuth();
  return useCallback(async (path, options = {}) => {
    const token = await getToken();
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    if (options.raw) return res;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.detail || "Bir hata oluştu"), { status: res.status });
    return data;
  }, [getToken]);
}

const CreditsCtx = createContext({ credits: null, setCredits: () => {}, refresh: () => {} });

export function CreditsProvider({ children }) {
  const api = useApi();
  const { isSignedIn } = useAuth();
  const [credits, setCredits] = useState(null);
  const [email, setEmail] = useState("");
  const refresh = useCallback(async () => {
    try {
      const me = await api("/me");
      setCredits(me.credits);
      setEmail(me.email);
    } catch {}
  }, [api]);
  useEffect(() => { if (isSignedIn) refresh(); }, [isSignedIn, refresh]);
  return <CreditsCtx.Provider value={{ credits, setCredits, refresh, email }}>{children}</CreditsCtx.Provider>;
}

export const useCredits = () => useContext(CreditsCtx);
