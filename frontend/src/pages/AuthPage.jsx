import { SignIn, SignUp } from "@clerk/react";
import { Logo } from "../components/Navbar";
import { Coins } from "lucide-react";

export default function AuthPage({ mode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="[&_a]:text-white"><Logo /></div>
        <div>
          <p className="font-heading text-4xl font-extrabold leading-tight">İlanın, CV'n ve gönderilerin<br />saniyeler içinde hazır.</p>
          <p className="mt-4 flex items-center gap-2 text-emerald-300"><Coins className="h-5 w-5" /> Kayıt ol, 5 ücretsiz kredi kazan.</p>
        </div>
        <p className="text-sm text-slate-400">© Kazandıran</p>
      </aside>
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-10">
        <div className="lg:hidden"><Logo /></div>
        {mode === "up"
          ? <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
          : <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" withSignUp />}
      </div>
    </div>
  );
}
