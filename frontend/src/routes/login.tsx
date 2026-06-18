import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthVisual";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — GovAssist AI" },
      { name: "description", content: "Continue your eligibility journey with GovAssist AI." },
    ],
  }),
  component: LoginPage,
});

function Field({ label, type = "text", value, onChange, autoComplete }: { label: string; type?: string; value: string; onChange: (v: string) => void; autoComplete?: string }) {
  const [focus, setFocus] = useState(false);
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  const t = isPwd && show ? "text" : type;
  const active = focus || value.length > 0;
  return (
    <div className="relative">
      <input
        type={t}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        autoComplete={autoComplete}
        className="peer w-full px-4 pt-6 pb-2 rounded-2xl border border-border bg-white/60 backdrop-blur outline-none transition-all focus:border-[var(--electric)] focus:bg-white focus:shadow-[0_0_0_4px_oklch(0.62_0.22_260/0.08)] text-[15px] text-[var(--navy)]"
      />
      <label className={`absolute left-4 pointer-events-none transition-all duration-200 ${active ? "top-1.5 text-[11px] text-[var(--electric)] font-medium" : "top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground"}`}>
        {label}
      </label>
      {isPwd && (
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, pwd);
    setLoading(false);
    if (result.success) {
      nav({ to: "/" });
    } else {
      setError(result.message || "Failed to sign in");
    }
  };

  return (
    <AuthShell>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] text-[var(--navy)] mb-6 lg:hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--electric)] animate-pulse" />
            Identity Gateway
          </div>
          <h2 className="text-4xl md:text-5xl text-[var(--navy)] tracking-[-0.03em] leading-[1]">Welcome <span className="italic text-gradient">back</span></h2>
          <p className="mt-3 text-muted-foreground text-[15px]">Continue your eligibility journey.</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" />
          <Field label="Password" type="password" value={pwd} onChange={setPwd} autoComplete="current-password" />

          <div className="flex items-center justify-between pt-1 text-[13px]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className={`relative w-9 h-5 rounded-full transition-colors ${remember ? "bg-[var(--navy)]" : "bg-border"}`} onClick={() => setRemember(r => !r)}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${remember ? "translate-x-[18px]" : "translate-x-0.5"}`} />
              </span>
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-[var(--electric)] hover:underline underline-offset-4">Forgot password?</Link>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="group mt-4 w-full flex items-center justify-center gap-2 bg-[var(--navy)] text-white py-3.5 rounded-2xl text-[14px] font-medium hover:bg-[var(--navy-deep)] transition-all disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
          </button>

          <div className="relative my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Google", svg: <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6c-.2 1.3-1 2.4-2.1 3.2v2.6h3.4c2-1.8 3.1-4.5 3.1-7.6z"/><path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-1 .6-2.2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.5 19.8 8 22 12 22z"/><path fill="#FBBC05" d="M6.2 13.6c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V6.9H2.7C2 8.4 1.5 10.1 1.5 12s.5 3.6 1.2 5.1l3.5-2.5z"/><path fill="#EA4335" d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3C17.2 2.7 14.8 1.5 12 1.5 8 1.5 4.5 3.7 2.7 6.9l3.5 2.7C7 7.6 9.3 5.8 12 5.8z"/></svg> },
              { l: "Microsoft", svg: <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#F25022" d="M2 2h10v10H2z"/><path fill="#7FBA00" d="M12 2h10v10H12z"/><path fill="#00A4EF" d="M2 12h10v10H2z"/><path fill="#FFB900" d="M12 12h10v10H12z"/></svg> },
            ].map(o => (
              <button key={o.l} type="button"
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-border bg-white hover:border-[var(--electric)] hover:bg-secondary transition-all text-[13px] font-medium text-[var(--navy)]">
                {o.svg} Continue with {o.l}
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-[13px] text-muted-foreground">
            New to GovAssist? <Link to="/register" className="text-[var(--navy)] font-medium hover:text-[var(--electric)]">Create your identity →</Link>
          </p>
        </form>
      </motion.div>
    </AuthShell>
  );
}
