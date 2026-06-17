import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, GraduationCap, Briefcase, Wallet, Sparkles, MapPin,
  ArrowRight, Check, Loader2, Brain, Compass, ShieldCheck,
  Tractor, Search, Building2, Rocket, UserCog, Heart, BookOpen,
  Award, Stethoscope, Coins, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build Your Citizen Profile — GovAssist AI" },
      { name: "description", content: "Create your AI-powered Citizen Identity Profile and let intelligent agents discover government schemes tailored for you." },
    ],
  }),
  component: OnboardingPage,
});

// ---------- data ----------
const STATES = ["Andhra Pradesh", "Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Kerala", "Gujarat", "Rajasthan", "Punjab", "West Bengal"];
const EDUCATION = [
  { l: "School Student", i: BookOpen }, { l: "Diploma", i: Award },
  { l: "UG Student", i: GraduationCap }, { l: "PG Student", i: GraduationCap },
  { l: "Research Scholar", i: Brain }, { l: "Professional Certification", i: Award },
];
const OCCUPATIONS = [
  { l: "Student", i: BookOpen }, { l: "Farmer", i: Tractor },
  { l: "Job Seeker", i: Search }, { l: "Government Employee", i: Building2 },
  { l: "Private Employee", i: Briefcase }, { l: "Entrepreneur", i: Rocket },
  { l: "Self Employed", i: UserCog }, { l: "Senior Citizen", i: Heart },
];
const INCOME = ["Below ₹1 Lakh", "₹1–3 Lakh", "₹3–5 Lakh", "₹5–8 Lakh", "Above ₹8 Lakh"];
const CATEGORIES = [
  "Woman", "Minority", "Differently Abled", "Farmer Family", "First Graduate",
  "Veteran Family", "Widow", "Orphan", "Economically Weaker Section",
];

type Data = {
  name: string; age: string; gender: string; state: string; district: string;
  education: string; occupation: string; income: number; categories: string[]; area: string;
};

function useCount(target: number, key: unknown) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const from = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 700);
      setV(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, key]);
  return v;
}

// ---------- field primitives ----------
function TextField({ label, value, onChange, icon: Icon, type = "text" }: { label: string; value: string; onChange: (v: string) => void; icon: any; type?: string }) {
  const [f, setF] = useState(false);
  const active = f || value.length > 0;
  return (
    <div className="relative group">
      <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${active ? "text-[var(--electric)]" : "text-muted-foreground"}`} />
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        className="peer w-full pl-11 pr-4 pt-5 pb-2 rounded-2xl border border-border bg-white/70 backdrop-blur outline-none transition-all focus:border-[var(--electric)] focus:bg-white focus:shadow-[0_0_0_4px_oklch(0.62_0.22_260/0.08)] text-[14px] text-[var(--navy)]"
      />
      <label className={`absolute left-11 pointer-events-none transition-all duration-200 ${active ? "top-1 text-[10px] text-[var(--electric)] font-medium" : "top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground"}`}>{label}</label>
    </div>
  );
}

function PillSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-full text-[12px] border transition-all ${
              value === o
                ? "bg-[var(--navy)] text-white border-[var(--navy)] shadow-[0_4px_18px_-4px_oklch(0.18_0.07_260/0.4)]"
                : "bg-white/60 border-border text-muted-foreground hover:border-[var(--electric)] hover:text-[var(--navy)]"
            }`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- page ----------
function OnboardingPage() {
  const nav = useNavigate();
  const [data, setData] = useState<Data>({
    name: "", age: "", gender: "", state: "", district: "",
    education: "", occupation: "", income: 1, categories: [], area: "Urban",
  });
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  const set = <K extends keyof Data>(k: K) => (v: Data[K]) => setData(d => ({ ...d, [k]: v }));
  const toggleCat = (c: string) =>
    setData(d => ({ ...d, categories: d.categories.includes(c) ? d.categories.filter(x => x !== c) : [...d.categories, c] }));

  // completeness across 9 buckets
  const completeness = useMemo(() => {
    let n = 0;
    if (data.name) n++; if (data.age) n++; if (data.gender) n++;
    if (data.state) n++; if (data.district) n++;
    if (data.education) n++; if (data.occupation) n++;
    if (data.income >= 0) n++; if (data.categories.length) n++;
    return Math.round((n / 9) * 100);
  }, [data]);

  const journey = [
    { l: "Profile Setup", at: 0 },
    { l: "Eligibility Mapping", at: 35 },
    { l: "AI Recommendations", at: 70 },
    { l: "Scheme Discovery", at: 95 },
  ];

  const readiness = [
    { l: "Identity Verified", ok: !!(data.name && data.age && data.gender) },
    { l: "Education Profile Ready", ok: !!data.education },
    { l: "Occupation Mapped", ok: !!data.occupation },
    { l: "Income Analyzed", ok: data.income >= 0 },
    { l: "Eligibility Mapping Active", ok: !!(data.state && (data.occupation || data.education)) },
  ];

  // dynamic opportunity counters
  const opps = useMemo(() => {
    const w = data.occupation, e = data.education, c = data.categories;
    const scholarships = (e ? 8 : 2) + (c.includes("First Graduate") ? 4 : 0) + (c.includes("Minority") ? 2 : 0);
    const farmer = w === "Farmer" || c.includes("Farmer Family") ? 8 : 1;
    const skill = (w === "Job Seeker" || w === "Student" ? 6 : 2) + (e ? 2 : 0);
    const health = 4 + (c.includes("Differently Abled") ? 3 : 0) + (c.includes("Senior Citizen") ? 2 : 0);
    return { scholarships, farmer, skill, health };
  }, [data]);

  // AI insights
  const insights = useMemo(() => {
    const out: string[] = [];
    if (data.education) out.push("You may qualify for multiple student scholarship programs.");
    if (data.income <= 2) out.push("Your income range matches several state welfare initiatives.");
    if (data.categories.includes("First Graduate")) out.push("First graduate benefits may be available.");
    if (data.occupation === "Farmer") out.push("PM-KISAN and crop insurance schemes match your profile.");
    if (data.categories.includes("Woman")) out.push("Women empowerment & entrepreneurship schemes detected.");
    if (!out.length) out.push("Start adding details — opportunities appear here in real-time.");
    return out.slice(0, 3);
  }, [data]);

  const generate = async () => {
    setGenerating(true);
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 750));
      setGenStep(i + 1);
    }
    await new Promise(r => setTimeout(r, 500));
    nav({ to: "/" });
  };

  return (
    <div className="relative min-h-screen bg-background text-[var(--navy)] overflow-x-hidden">
      {/* ambient bg */}
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "var(--gradient-mesh)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(to right, var(--navy) 1px, transparent 1px), linear-gradient(to bottom, var(--navy) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* nav */}
      <header className="relative z-20 max-w-[1400px] mx-auto px-6 lg:px-10 pt-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 font-medium">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-md bg-[var(--navy)]/10" />
            <div className="absolute inset-[3px] rounded-sm bg-[var(--electric)]" />
            <div className="absolute inset-[6px] rounded-[2px] bg-[var(--cyan)]" />
          </div>
          <span className="text-[15px] tracking-tight">GovAssist<span className="text-[var(--electric)]">.</span>AI</span>
        </Link>
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hidden sm:flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AI Profile Builder · Secure Session
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--electric)] mb-3">Citizen Identity · v1.0</div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-[-0.035em] leading-[1.02] max-w-3xl">
            Build Your <span className="italic text-gradient">Citizen Profile</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] text-muted-foreground leading-relaxed">
            Help our AI understand your background and discover government schemes tailored specifically for you.
          </p>
        </motion.div>

        {/* journey roadmap */}
        <div className="mt-10 relative">
          <div className="flex items-center justify-between text-[11px] font-mono mb-3">
            <span className="text-muted-foreground uppercase tracking-widest">Profile Completion</span>
            <span className="text-[var(--electric)]">{completeness}%</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div animate={{ width: `${completeness}%` }} transition={{ type: "spring", stiffness: 80 }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--electric)] via-[var(--cyan)] to-[var(--electric)] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {journey.map((j, i) => {
              const active = completeness >= j.at;
              return (
                <div key={j.l} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${active ? "bg-white/70 border-[var(--electric)]/30 shadow-[var(--shadow-soft)]" : "bg-white/30 border-border"}`}>
                  <div className={`grid place-items-center w-6 h-6 rounded-md text-[10px] font-mono ${active ? "bg-[var(--electric)] text-white" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
                  <span className={`text-[12px] ${active ? "text-[var(--navy)]" : "text-muted-foreground"}`}>{j.l}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* split layout */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 grid gap-8 lg:grid-cols-[1.85fr_1fr]">
        {/* LEFT */}
        <div className="space-y-8">
          {/* 1 Personal */}
          <Block index="01" title="Who are you?" desc="Let's start with the basics." icon={User}>
            <div className="grid sm:grid-cols-2 gap-3">
              <TextField label="Full name" value={data.name} onChange={set("name")} icon={User} />
              <TextField label="Age" type="number" value={data.age} onChange={set("age")} icon={UserCog} />
            </div>
            <PillSelect label="Gender" value={data.gender} onChange={set("gender")} options={["Female", "Male", "Other", "Prefer not to say"]} />
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">State</div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select value={data.state} onChange={e => set("state")(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-white/70 outline-none focus:border-[var(--electric)] text-[14px] appearance-none">
                    <option value="">Select state…</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <TextField label="District" value={data.district} onChange={set("district")} icon={Compass} />
            </div>
          </Block>

          {/* 2 Education */}
          <Block index="02" title="Tell us about your education" desc="Pick the stage that best reflects you." icon={GraduationCap}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EDUCATION.map(({ l, i: Icon }) => {
                const active = data.education === l;
                return (
                  <motion.button key={l} onClick={() => set("education")(l)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative p-4 rounded-2xl border text-left transition-all overflow-hidden ${
                      active ? "border-[var(--electric)] bg-white shadow-[var(--shadow-glow)]" : "border-border bg-white/60 hover:border-[var(--electric)]/40 hover:bg-white"
                    }`}>
                    {active && <motion.div layoutId="eduGlow" className="absolute -inset-px rounded-2xl pointer-events-none"
                      style={{ background: "linear-gradient(135deg, oklch(0.62 0.22 260 / 0.12), oklch(0.82 0.15 210 / 0.12))" }} />}
                    <div className="relative flex items-start gap-3">
                      <div className={`grid place-items-center w-9 h-9 rounded-xl ${active ? "bg-[var(--electric)] text-white" : "bg-secondary text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-[var(--navy)]">{l}</div>
                        {active && <div className="mt-1 text-[10px] font-mono text-[var(--electric)] flex items-center gap-1"><Check className="w-3 h-3" /> Selected</div>}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Block>

          {/* 3 Occupation */}
          <Block index="03" title="What best describes you?" desc="We map your role to the right scheme families." icon={Briefcase}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {OCCUPATIONS.map(({ l, i: Icon }) => {
                const active = data.occupation === l;
                return (
                  <motion.button key={l} onClick={() => set("occupation")(l)}
                    whileTap={{ scale: 0.96 }}
                    className={`group relative aspect-square p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all overflow-hidden ${
                      active ? "border-[var(--navy)] bg-[var(--navy)] text-white" : "border-border bg-white/60 hover:border-[var(--electric)]/40 hover:bg-white"
                    }`}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: "var(--gradient-mesh)", opacity: active ? 0.3 : 0 }} />
                    <div className={`relative grid place-items-center w-11 h-11 rounded-2xl mb-2 ${active ? "bg-white/10" : "bg-secondary"}`}>
                      <Icon className={`w-5 h-5 ${active ? "text-[var(--cyan)]" : "text-[var(--navy)]"}`} />
                    </div>
                    <div className={`relative text-[12px] font-medium ${active ? "text-white" : "text-[var(--navy)]"}`}>{l}</div>
                  </motion.button>
                );
              })}
            </div>
          </Block>

          {/* 4 Financial */}
          <Block index="04" title="Help us identify suitable opportunities" desc="Slide to set your annual household income." icon={Wallet}>
            <div className="p-5 rounded-2xl bg-white/60 border border-border">
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Annual Income</div>
                <div className="text-[10px] font-mono text-[var(--electric)]">Step {data.income + 1}/5</div>
              </div>
              <div className="text-2xl tracking-tight text-[var(--navy)] mb-4">
                <span className="italic text-gradient">{INCOME[data.income]}</span>
              </div>
              <input
                type="range" min={0} max={4} step={1} value={data.income}
                onChange={e => set("income")(parseInt(e.target.value))}
                className="w-full accent-[var(--electric)]"
              />
              <div className="mt-3 flex justify-between text-[10px] font-mono text-muted-foreground">
                {INCOME.map((l, i) => (
                  <span key={l} className={i === data.income ? "text-[var(--electric)]" : ""}>{l.replace("₹", "").replace(" Lakh", "L").replace("Below ", "<").replace("Above ", ">")}</span>
                ))}
              </div>
            </div>
          </Block>

          {/* 5 Categories */}
          <Block index="05" title="Additional Information" desc="Select all that apply — multi-select unlocks more matches." icon={Sparkles}>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => {
                const active = data.categories.includes(c);
                return (
                  <motion.button key={c} onClick={() => toggleCat(c)}
                    whileTap={{ scale: 0.96 }}
                    className={`px-3.5 py-2 rounded-full text-[12.5px] border transition-all flex items-center gap-1.5 ${
                      active
                        ? "bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white border-transparent shadow-[0_6px_24px_-8px_oklch(0.62_0.22_260/0.5)]"
                        : "bg-white/60 border-border text-[var(--navy)] hover:border-[var(--electric)]"
                    }`}>
                    {active && <Check className="w-3 h-3" />}
                    {c}
                  </motion.button>
                );
              })}
            </div>
          </Block>

          {/* 6 Location */}
          <Block index="06" title="Where can we find schemes for you?" desc="State-level mapping + urban/rural targeting." icon={MapPin}>
            <div className="grid md:grid-cols-[1fr_1.2fr] gap-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--navy)] to-[oklch(0.25_0.08_260)] border border-border grid place-items-center">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "var(--gradient-mesh)" }} />
                {/* abstract india outline */}
                <svg viewBox="0 0 200 220" className="relative w-3/4 h-3/4">
                  <path d="M60 20 L120 15 L150 40 L160 80 L140 130 L130 170 L100 200 L80 195 L70 170 L40 150 L30 110 L40 70 Z"
                    fill="oklch(0.62 0.22 260 / 0.15)" stroke="oklch(0.82 0.15 210)" strokeWidth="1.2" strokeDasharray="3 4" />
                  {data.state && (
                    <motion.circle initial={{ r: 0 }} animate={{ r: [4, 12, 4] }} transition={{ duration: 2, repeat: Infinity }}
                      cx="95" cy="110" fill="oklch(0.82 0.15 210)" />
                  )}
                </svg>
                <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl glass-dark text-white text-[11px] font-mono flex items-center justify-between">
                  <span>{data.state || "Select a state"}</span>
                  <span className="text-[var(--cyan)]">{data.district || "—"}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Region Type</div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Urban", "Rural"].map(a => (
                      <button key={a} onClick={() => set("area")(a)}
                        className={`p-3 rounded-2xl border text-[13px] font-medium transition-all ${
                          data.area === a ? "bg-[var(--navy)] text-white border-[var(--navy)]" : "bg-white/60 border-border text-[var(--navy)] hover:border-[var(--electric)]"
                        }`}>{a}</button>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/60 border border-border">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Detected Region</div>
                  <div className="text-[14px] text-[var(--navy)]">
                    {data.state ? `${data.state}${data.district ? ` · ${data.district}` : ""} · ${data.area}` : "Awaiting state selection…"}
                  </div>
                </div>
              </div>
            </div>
          </Block>

          {/* CTA */}
          <div className="relative mt-6 p-8 md:p-10 rounded-3xl overflow-hidden bg-[var(--navy)] text-white">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "var(--gradient-mesh)" }} />
            <div className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-md">
                <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--cyan)] mb-3">Final Step</div>
                <h3 className="text-2xl md:text-3xl tracking-[-0.025em] leading-tight">
                  Your AI Assistant Is Ready To <span className="italic text-gradient">Discover Opportunities</span>
                </h3>
              </div>
              <motion.button onClick={generate} disabled={generating}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white font-medium text-[14px] shadow-[var(--shadow-glow)] disabled:opacity-80">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Generating…" : "Generate My Eligibility Profile"}
                {!generating && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
              </motion.button>
            </div>

            <AnimatePresence>
              {generating && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="relative mt-8 grid sm:grid-cols-4 gap-3">
                  {["Profile Building", "Eligibility Mapping", "Scheme Discovery", "Recommendation"].map((s, i) => {
                    const done = genStep > i, active = genStep === i;
                    return (
                      <div key={s} className={`p-3 rounded-xl border ${done ? "border-[var(--cyan)]/40 bg-white/5" : active ? "border-[var(--electric)]/60 bg-white/5" : "border-white/10"}`}>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-white/70">
                          {done ? <Check className="w-3 h-3 text-[var(--cyan)]" /> : active ? <Loader2 className="w-3 h-3 animate-spin text-[var(--cyan)]" /> : <span className="w-3 h-3 rounded-full border border-white/30" />}
                          {s}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT — AI panel */}
        <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
          {/* completion ring */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Profile Completion</div>
                <div className="mt-1 text-[12px] text-[var(--navy)] font-medium">AI Eligibility Engine</div>
              </div>
              <div className="text-[10px] font-mono text-[var(--electric)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--electric)] animate-pulse" /> LIVE
              </div>
            </div>
            <div className="grid place-items-center">
              <Ring value={completeness} />
            </div>
          </Card>

          {/* AI readiness */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-[var(--electric)]" />
              <div className="text-[12px] font-medium text-[var(--navy)]">AI Readiness</div>
            </div>
            <div className="space-y-1.5">
              {readiness.map(r => (
                <div key={r.l} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-secondary/60">
                  <div className={`grid place-items-center w-5 h-5 rounded ${r.ok ? "bg-[var(--electric)]" : "bg-border"}`}>
                    {r.ok ? <Check className="w-3 h-3 text-white" /> : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />}
                  </div>
                  <div className={`text-[12px] ${r.ok ? "text-[var(--navy)]" : "text-muted-foreground"}`}>{r.l}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* opportunities */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-[var(--electric)]" />
              <div className="text-[12px] font-medium text-[var(--navy)]">Potential Opportunities</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Counter icon={GraduationCap} label="Scholarships" v={opps.scholarships} />
              <Counter icon={Tractor} label="Farmer" v={opps.farmer} />
              <Counter icon={Award} label="Skill Dev" v={opps.skill} />
              <Counter icon={Stethoscope} label="Healthcare" v={opps.health} />
            </div>
          </Card>

          {/* AI insights */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--electric)]" />
              <div className="text-[12px] font-medium text-[var(--navy)]">Live AI Insights</div>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {insights.map((t) => (
                  <motion.div key={t}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="flex gap-2 text-[12px] text-[var(--navy)] p-2.5 rounded-lg bg-gradient-to-br from-[oklch(0.62_0.22_260/0.06)] to-[oklch(0.82_0.15_210/0.06)] border border-[var(--electric)]/10">
                    <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--electric)]" />
                    <span className="leading-snug">{t}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--electric)]" />
            End-to-end encrypted · Data never leaves your profile
          </div>
        </aside>
      </section>

      <style>{`@keyframes shimmer { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  );
}

// ---------- ui helpers ----------
function Block({ index, title, desc, icon: Icon, children }: { index: string; title: string; desc: string; icon: any; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}
      className="relative p-6 md:p-8 rounded-3xl border border-border bg-white/50 backdrop-blur-xl shadow-[var(--shadow-soft)]">
      <header className="flex items-start gap-4 mb-6">
        <div className="shrink-0 grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[oklch(0.25_0.08_260)] text-white">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--electric)]">Section {index}</div>
          <h2 className="mt-0.5 text-xl md:text-2xl tracking-[-0.02em] text-[var(--navy)]">{title}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{desc}</p>
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </motion.section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-white/70 backdrop-blur-xl shadow-[var(--shadow-soft)]">
      {children}
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const offset = c - (c * value) / 100;
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} stroke="oklch(0.92 0.012 250)" strokeWidth="8" fill="none" />
        <defs>
          <linearGradient id="ringg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.22 260)" />
            <stop offset="100%" stopColor="oklch(0.82 0.15 210)" />
          </linearGradient>
        </defs>
        <motion.circle cx="60" cy="60" r={r} stroke="url(#ringg)" strokeWidth="8" fill="none"
          strokeLinecap="round" strokeDasharray={c}
          animate={{ strokeDashoffset: offset }} transition={{ type: "spring", stiffness: 80 }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl tracking-tight text-[var(--navy)]">{value}<span className="text-base text-muted-foreground">%</span></div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Complete</div>
        </div>
      </div>
    </div>
  );
}

function Counter({ icon: Icon, label, v }: { icon: any; label: string; v: number }) {
  const n = useCount(v, v);
  return (
    <div className="p-3 rounded-xl bg-secondary/60 border border-border">
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
        <Icon className="w-3 h-3" />{label}
      </div>
      <div className="text-xl text-[var(--navy)] tabular-nums">{n}</div>
    </div>
  );
}
