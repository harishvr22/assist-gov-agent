import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, UserCircle2, Brain, Compass, ShieldCheck, Loader2 } from "lucide-react";
import { AuthVisual } from "@/components/auth/AuthVisual";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your identity — GovAssist AI" },
      { name: "description", content: "Build your citizen profile and unlock personalized government opportunities." },
    ],
  }),
  component: RegisterPage,
});

const steps = ["Account", "Personal Information", "Verification"] as const;

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  const [f, setF] = useState(false);
  const active = f || value.length > 0;
  return (
    <div className="relative">
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        className="peer w-full px-4 pt-5 pb-2 rounded-xl border border-border bg-white/70 backdrop-blur outline-none transition-all focus:border-[var(--electric)] focus:bg-white focus:shadow-[0_0_0_4px_oklch(0.62_0.22_260/0.08)] text-[14px] text-[var(--navy)]"
      />
      <label className={`absolute left-4 pointer-events-none transition-all duration-200 ${active ? "top-1 text-[10px] text-[var(--electric)] font-medium" : "top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground"}`}>{label}</label>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 pt-5 pb-2 rounded-xl border border-border bg-white/70 outline-none focus:border-[var(--electric)] text-[14px] text-[var(--navy)] appearance-none">
        <option value="">Select…</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <label className="absolute left-4 top-1 text-[10px] text-[var(--electric)] font-medium pointer-events-none">{label}</label>
    </div>
  );
}

function RegisterPage() {
  const nav = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "", email: "", pwd: "", pwd2: "",
    age: "", gender: "", state: "", occupation: "", education: "", income: "",
    code: "",
  });
  const set = (k: keyof typeof data) => (v: string) => setData(d => ({ ...d, [k]: v }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeness = useMemo(() => {
    const fields = Object.values(data).filter(v => v.length > 0).length;
    return Math.min(100, Math.round((fields / 11) * 100));
  }, [data]);

  const aiSteps = [
    { l: "Citizen Profile Created", done: completeness >= 25, icon: UserCircle2 },
    { l: "Eligibility Mapping", done: completeness >= 55, icon: Compass },
    { l: "Scheme Discovery Ready", done: completeness >= 80, icon: Sparkles },
    { l: "AI Assistant Ready", done: completeness >= 95, icon: Brain },
  ];

  const next = async () => {
    if (step < 2) {
      setError(null);
      if (step === 0) {
        if (!data.name || !data.email || !data.pwd || !data.pwd2) {
          setError("All account fields are required");
          return;
        }
        if (data.pwd !== data.pwd2) {
          setError("Passwords do not match");
          return;
        }
      }
      return setStep(s => s + 1);
    }
    
    setLoading(true);
    setError(null);
    const result = await signup({
      name: data.name,
      email: data.email,
      pwd: data.pwd,
      age: data.age,
      gender: data.gender,
      state: data.state,
      occupation: data.occupation,
      education: data.education,
      income: data.income,
    });
    setLoading(false);
    if (result.success) {
      nav({ to: "/onboarding" });
    } else {
      setError(result.message || "Registration failed");
    }
  };

  const visual = (
    <AuthVisual
      title="Create Your GovAssist AI Identity"
      subtitle="Build your citizen profile and unlock personalized government opportunities."
    >
      <div className="mt-10 space-y-6">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono mb-2 text-white/70">
            <span>PROFILE STRENGTH</span>
            <span className="text-[var(--cyan)]">{completeness}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div animate={{ width: `${completeness}%` }} transition={{ type: "spring", stiffness: 80 }}
              className="h-full rounded-full bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)]" />
          </div>
          <div className="mt-2 text-[11px] text-white/50 font-mono">AI Readiness Score · {Math.round(completeness * 0.92)}/100</div>
        </div>

        <div className="space-y-2">
          {aiSteps.map((s, i) => (
            <motion.div key={s.l}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: s.done ? 1 : 0.4 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-dark"
              transition={{ delay: i * 0.05 }}>
              <div className={`grid place-items-center w-7 h-7 rounded-lg ${s.done ? "bg-[var(--electric)]" : "bg-white/5"} transition-colors`}>
                {s.done ? <Check className="w-4 h-4 text-white" /> : <s.icon className="w-3.5 h-3.5 text-white/60" />}
              </div>
              <div className="text-[12.5px] flex-1">{s.l}</div>
              {s.done && <span className="text-[10px] font-mono text-[var(--cyan)]">READY</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </AuthVisual>
  );

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {visual}
      <div className="relative flex items-center justify-center p-6 sm:p-10 overflow-hidden">
        <div className="absolute inset-0 opacity-70 lg:hidden" style={{ backgroundImage: "var(--gradient-mesh)" }} />
        <div className="relative w-full max-w-md">
          {/* stepper */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`grid place-items-center w-7 h-7 rounded-full text-[11px] font-mono transition-all ${i < step ? "bg-[var(--electric)] text-white" : i === step ? "bg-[var(--navy)] text-white" : "bg-secondary text-muted-foreground"}`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-[var(--electric)]" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--electric)] mb-2">Step {step + 1} of 3</div>
            <h2 className="text-3xl md:text-4xl text-[var(--navy)] tracking-[-0.03em] leading-[1.05]">
              {step === 0 && <>Open your <span className="italic text-gradient">account</span></>}
              {step === 1 && <>Tell us about <span className="italic text-gradient">yourself</span></>}
              {step === 2 && <>Verify your <span className="italic text-gradient">identity</span></>}
            </h2>
            <p className="mt-2 text-muted-foreground text-[14px]">
              {step === 0 && "We'll use this to secure your gateway."}
              {step === 1 && "The AI uses these signals — never shared."}
              {step === 2 && "We sent a 6-digit code to your email."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }} className="space-y-3">
              {step === 0 && (
                <>
                  <Input label="Full name" value={data.name} onChange={set("name")} />
                  <Input label="Email address" type="email" value={data.email} onChange={set("email")} />
                  <Input label="Password" type="password" value={data.pwd} onChange={set("pwd")} />
                  <Input label="Confirm password" type="password" value={data.pwd2} onChange={set("pwd2")} />
                </>
              )}
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Age" type="number" value={data.age} onChange={set("age")} />
                    <Select label="Gender" value={data.gender} onChange={set("gender")} options={["Female", "Male", "Other", "Prefer not to say"]} />
                  </div>
                  <Select label="State" value={data.state} onChange={set("state")} options={["Andhra Pradesh", "Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Other"]} />
                  <Select label="Occupation" value={data.occupation} onChange={set("occupation")} options={["Student", "Farmer", "Salaried", "Self-employed", "Unemployed", "Retired"]} />
                  <Select label="Education" value={data.education} onChange={set("education")} options={["Primary", "Secondary", "Graduate", "Postgraduate"]} />
                  <Select label="Income range" value={data.income} onChange={set("income")} options={["< ₹2L", "₹2L – ₹5L", "₹5L – ₹10L", "₹10L+"]} />
                </>
              )}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="relative h-40 rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[oklch(0.25_0.08_260)] overflow-hidden grid place-items-center">
                    <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)", opacity: 0.4 }} />
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}
                      className="relative grid place-items-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur">
                      <ShieldCheck className="w-10 h-10 text-[var(--cyan)]" />
                      <span className="absolute inset-0 rounded-2xl border border-[var(--cyan)]/40 animate-ping" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input key={i} maxLength={1}
                        value={data.code[i] || ""}
                        onChange={e => {
                          const c = (data.code.slice(0, i) + e.target.value + data.code.slice(i + 1)).slice(0, 6);
                          set("code")(c);
                          const nx = e.target.nextElementSibling as HTMLInputElement | null;
                          if (e.target.value && nx) nx.focus();
                        }}
                        className="w-12 h-14 text-center text-2xl font-mono text-[var(--navy)] rounded-xl border border-border bg-white/70 outline-none focus:border-[var(--electric)] focus:shadow-[0_0_0_4px_oklch(0.62_0.22_260/0.08)]" />
                    ))}
                  </div>
                  <p className="text-center text-[12px] text-muted-foreground">Didn't get the code? <button className="text-[var(--electric)] hover:underline">Resend</button></p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl mt-6">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button onClick={next} disabled={loading}
              className="group flex-1 flex items-center justify-center gap-2 bg-[var(--navy)] text-white py-3.5 rounded-2xl text-[14px] font-medium hover:bg-[var(--navy-deep)] transition-all disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>{step === 2 ? "Complete Registration" : "Continue"} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </button>
          </div>

          <p className="mt-8 text-center text-[13px] text-muted-foreground">
            Already a citizen? <Link to="/login" className="text-[var(--navy)] font-medium hover:text-[var(--electric)]">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
