import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Show } from "@clerk/react";
import { Toaster } from "./components/ui/sonner";
import ClerkAuthProvider from "./components/auth/ClerkAuthProvider";
import { CreditsProvider } from "./lib/api";
import Navbar from "./components/Navbar";
import MobileNav from "./components/MobileNav";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ToolPage from "./pages/ToolPage";
import History, { HistoryDetail } from "./pages/History";
import Credits from "./pages/Credits";
import PaymentResult from "./pages/PaymentResult";
import AuthPage from "./pages/AuthPage";

const Protected = () => (
  <>
    <Show when="signed-in">
      <Navbar />
      <Outlet />
      <MobileNav />
    </Show>
    <Show when="signed-out"><Navigate to="/sign-in" replace /></Show>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <ClerkAuthProvider>
        <CreditsProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/sign-in/*" element={<AuthPage mode="in" />} />
            <Route path="/sign-up/*" element={<AuthPage mode="up" />} />
            <Route element={<Protected />}>
              <Route path="/panel" element={<Dashboard />} />
              <Route path="/arac/:tool" element={<ToolPage />} />
              <Route path="/gecmis" element={<History />} />
              <Route path="/gecmis/:id" element={<HistoryDetail />} />
              <Route path="/kredi" element={<Credits />} />
              <Route path="/odeme/sonuc" element={<PaymentResult />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </CreditsProvider>
      </ClerkAuthProvider>
    </BrowserRouter>
  );
}

export default App;
