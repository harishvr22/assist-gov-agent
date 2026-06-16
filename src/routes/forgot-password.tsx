import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MailCheck, KeyRound, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthVisual";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recover access — GovAssist AI" },
      { name: "description", content: "Recover access to your GovAssist AI citizen profile." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(false);
  const active = focus || email.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthShell>
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div key="form" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.4 }}>
            {/* calming illustration */}
            <div className="relative mb-10 h-44 rounded-3xl overflow-hidden bg-gradient-to-br from-[oklch(0.96_0.02_240)] to-[oklch(0.92_0.04_220)] grid place-items-center">
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative grid place-items-center w-20 h-20 rounded-2xl bg-white shadow-[var(--shadow-soft)]">
                <KeyRound className="w-9 h-9 text-[var(--electric)]" />
                <span className="absolute -inset-2 rounded-3xl border border-[var(--electric)]/30 animate-ping" />
              </motion.div>
              <div className="absolute bottom-3 left-4 text-[10px] font-mono text-[var(--navy)]/60">AI · ASSISTED · RECOVERY</div>
            </div>

            <h2 className="text-4xl md:text-5xl text-[var(--navy)] tracking-[-0.03em] leading-[1]">Recover your <span className="italic text-gradient">access</span></h2>
            <p className="mt-3 text-muted-foreground text-[15px]">Enter your email and we'll send secure recovery instructions.</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="relative">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
                  className="peer w-full px-4 pt-6 pb-2 rounded-2xl border border-border bg-white/60 backdrop-blur outline-none transition-all focus:border-[var(--electric)] focus:bg-white focus:shadow-[0_0_0_4px_oklch(0.62_0.22_260/0.08)] text-[15px] text-[var(--navy)]" />
                <label className={`absolute left-4 pointer-events-none transition-all duration-200 ${active ? "top-1.5 text-[11px] text-[var(--electric)] font-medium" : "top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground"}`}>Email address</label>
              </div>

              <button type="submit" disabled={loading}
                className="group w-full flex items-center justify-center gap-2 bg-[var(--navy)] text-white py-3.5 rounded-2xl text-[14px] font-medium hover:bg-[var(--navy-deep)] transition-all disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send recovery link <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
              </button>
            </form>

            <p className="mt-8 text-center text-[13px] text-muted-foreground">
              Remembered? <Link to="/login" className="text-[var(--navy)] font-medium hover:text-[var(--electric)]">Back to sign in →</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div className="relative mb-8 h-44 rounded-3xl overflow-hidden bg-[var(--navy)] grid place-items-center">
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 180 }}
                className="relative grid place-items-center w-20 h-20 rounded-2xl bg-white">
                <MailCheck className="w-9 h-9 text-[var(--electric)]" />
              </motion.div>
            </div>
            <h2 className="text-4xl text-[var(--navy)] tracking-[-0.03em] leading-[1]">Check your <span className="italic text-gradient">inbox</span></h2>
            <p className="mt-3 text-muted-foreground text-[15px]">We've sent secure recovery instructions to <span className="text-[var(--navy)] font-medium">{email}</span>. The link expires in 30 minutes.</p>
            <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-[14px] text-[var(--electric)] hover:underline underline-offset-4">
              Back to sign in <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
