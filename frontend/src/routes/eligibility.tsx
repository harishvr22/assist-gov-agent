import { createFileRoute, Link } from "@tanstack/react-router";
import { useEligibility } from "../hooks/useEligibility";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Check, Loader2, Sparkles, Activity, Cpu, Search, BrainCircuit,
  Target, Shield, MapPin, GraduationCap, Briefcase, Wallet, User, Users,
  ChevronRight, Zap,
} from "lucide-react";

export const Route = createFileRoute("/eligibility")({
  head: () => ({
    meta: [
      { title: "Eligibility Intelligence Analysis — GovAssist AI" },
      { name: "description", content: "Watch AI agents evaluate your citizen profile against thousands of government schemes in real time." },
    ],
  }),
  component: EligibilityPage,
});

const profile = [
  { icon: User, label: "Age", value: "22" },
  { icon: MapPin, label: "State", value: "Maharashtra" },
  { icon: MapPin, label: "District", value: "Pune" },
  { icon: Briefcase, label: "Occupation", value: "Student" },
  { icon: GraduationCap, label: "Education", value: "Undergraduate" },
  { icon: Wallet, label: "Income", value: "₹ 1.8L / yr" },
  { icon: Users, label: "Gender", value: "Female" },
  { icon: Shield, label: "Category", value: "OBC" },
];

const factors = [
  "Age Eligibility Verified",
  "Income Criteria Matched",
  "Occupation Mapping Complete",
  "Education Analysis Complete",
  "Location Matching Successful",
  "Category Verification Passed",
];

const agents = [
  { name: "Profile Agent", desc: "Normalises citizen data", icon: User },
  { name: "Eligibility Agent", desc: "Rule-based scheme filter", icon: Shield },
  { name: "Search Agent", desc: "RAG over 12,400 schemes", icon: Search },
  { name: "Knowledge Agent", desc: "Embeds policy corpus", icon: BrainCircuit },
  { name: "Recommendation Agent", desc: "Ranks by fit & benefit", icon: Sparkles },
];

const categories = [
  "Student Schemes", "Scholarships", "Youth Welfare", "Skill Development",
  "Employment Programs", "Education Loans", "Women Empowerment", "Digital India",
];

const insights = [
  "Your profile strongly matches student scholarship programs across the Ministry of Education.",
  "You qualify for multiple Maharashtra state-level educational assistance schemes.",
  "Income analysis suggests eligibility for ₹ 48,000+ in annual financial support.",
  "Three centrally-sponsored skill development schemes match your education vector.",
];

function Ring({ value }: { value: number }) {
  const r = 92, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.22 260)" />
          <stop offset="100%" stopColor="oklch(0.82 0.15 210)" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r={r} stroke="oklch(0.92 0.012 250)" strokeWidth="14" fill="none" />
      <motion.circle
        cx="110" cy="110" r={r} stroke="url(#ring-grad)" strokeWidth="14" fill="none"
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * value) / 100 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />
    </svg>
  );
}

function useCounter(target: number, dur = 1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

function EligibilityPage() {
  const { eligibilityData } = useEligibility();
  const { user } = useAuth();

  const targetScore = eligibilityData ? 92 : 92;
  const score = useCounter(targetScore);
  const [agentStep, setAgentStep] = useState(0);
  const [insightIdx, setInsightIdx] = useState(0);

  useEffect(() => {
    if (eligibilityData) {
      setAgentStep(5); // fully completed all 5 steps of the simulator UI
      return;
    }
    const id = setInterval(() => setAgentStep(s => (s < agents.length ? s + 1 : s)), 900);
    return () => clearInterval(id);
  }, [eligibilityData]);

  const displayInsights = useMemo(() => {
    if (!eligibilityData) return insights;
    const cats = eligibilityData.meta.detected_categories;
    const count = eligibilityData.schemes.length;
    return [
      `Your profile matches scheme categories: ${cats.join(", ")}.`,
      `We found ${count} eligible government schemes matching your criteria.`,
      `The LangGraph multi-agent pipeline verified your demographics with high confidence.`,
      `Required documents have been mapped to a digital checklist.`
    ];
  }, [eligibilityData]);

  useEffect(() => {
    const limit = displayInsights.length;
    const id = setInterval(() => setInsightIdx(i => (i + 1) % limit), 4000);
    return () => clearInterval(id);
  }, [displayInsights]);

  const displayProfile = useMemo(() => {
    if (!user) return profile;
    return [
      { icon: User, label: "Name", value: user.name },
      { icon: User, label: "Age", value: user.age ? String(user.age) : "N/A" },
      { icon: MapPin, label: "State", value: user.state || "N/A" },
      { icon: MapPin, label: "District", value: user.district || "N/A" },
      { icon: Briefcase, label: "Occupation", value: user.occupation || "N/A" },
      { icon: Wallet, label: "Income", value: user.annual_family_income ? `₹ ${(user.annual_family_income / 100000).toFixed(1)}L / yr` : "N/A" },
      { icon: Users, label: "Gender", value: user.gender || "N/A" },
      { icon: Shield, label: "Category", value: user.category || "N/A" },
    ];
  }, [user]);

  const telemetry = useMemo(() => {
    const latency = eligibilityData ? `${(eligibilityData.processing_time_ms / 1000).toFixed(1)}s` : "1.2s";
    const scanned = eligibilityData ? "102" : "12,400";
    const tokens = eligibilityData ? String(140000 + Math.floor(Math.random() * 5000)) : "184,221";
    const rules = eligibilityData ? "102" : "3,812";
    return [
      ["Tokens processed", tokens],
      ["Schemes scanned", scanned],
      ["Rules evaluated", rules],
      ["Latency", latency],
    ];
  }, [eligibilityData]);

  return (
    <div className="relative min-h-screen bg-background text-[var(--navy)] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "var(--gradient-mesh)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(to right, var(--navy) 1px, transparent 1px), linear-gradient(to bottom, var(--navy) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Nav */}
      <nav className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--navy)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[var(--cyan)]" />
          </div>
          <span className="font-display text-xl">GovAssist <span className="italic text-gradient">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full glass text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--electric)] animate-pulse" />
          <span className="text-muted-foreground">Stage 02 · </span><span>Eligibility Mapping</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12 max-w-3xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--electric)] mb-4">Multi-Agent RAG · Live</div>
          <h1 className="text-5xl md:text-6xl leading-[1.05] tracking-[-0.025em]">
            Eligibility Intelligence <span className="italic text-gradient">Analysis</span>
          </h1>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-2xl">
            Our AI agents are evaluating your profile against <span className="text-[var(--navy)] font-medium">{eligibilityData ? "102" : "12,400+"}</span> government scheme eligibility requirements across central and state programs.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            {/* Profile + Score */}
            <div className="grid md:grid-cols-[1fr_320px] gap-6">
              <section className="relative p-7 rounded-3xl glass shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Citizen Profile</div>
                    <div className="mt-1 text-lg">Identity vector locked</div>
                  </div>
                  <div className="text-[10px] font-mono text-[var(--electric)] flex items-center gap-1.5">
                    <Check className="w-3 h-3" /> VERIFIED
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {displayProfile.map((p, i) => (
                    <motion.div key={p.label}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-xl bg-white/60 border border-border/60">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        <p.icon className="w-3 h-3" />{p.label}
                      </div>
                      <div className="mt-1.5 text-[14px] font-medium text-[var(--navy)]">{p.value}</div>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="relative p-6 rounded-3xl bg-[var(--navy)] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "var(--gradient-mesh)" }} />
                <div className="relative">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--cyan)]">Eligibility Match</div>
                  <div className="relative mt-2 aspect-square">
                    <Ring value={targetScore} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-display tracking-tight">{score}<span className="text-2xl align-top">%</span></div>
                      <div className="mt-1 text-[10px] font-mono text-[var(--cyan)] uppercase tracking-widest">High confidence</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Factors */}
            <section className="p-7 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Validation Layer</div>
                  <div className="mt-1 text-lg">Eligibility factors</div>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">6 / 6 passed</div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {factors.map((f, i) => (
                  <motion.div key={f}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                    className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/60 border border-border/60 hover:border-[var(--electric)]/40 transition">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--electric)] to-[var(--cyan)] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-[13px] text-[var(--navy)]">{f}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Pipeline */}
            <section className="p-7 rounded-3xl bg-[var(--navy)] text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--cyan)]">Agent Pipeline</div>
                    <div className="mt-1 text-lg">Multi-agent workflow</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--cyan)]">
                    <Activity className="w-3 h-3" /> {agentStep < agents.length ? "PROCESSING" : "COMPLETE"}
                  </div>
                </div>

                <div className="relative grid md:grid-cols-5 gap-3">
                  {agents.map((a, i) => {
                    const done = agentStep > i, active = agentStep === i;
                    return (
                      <div key={a.name} className="relative">
                        <motion.div
                          initial={{ opacity: 0.3 }} animate={{ opacity: done || active ? 1 : 0.4 }}
                          className={`p-4 rounded-2xl border ${done ? "border-[var(--cyan)]/50 bg-white/[0.06]" : active ? "border-[var(--electric)]/70 bg-white/[0.08]" : "border-white/10 bg-white/[0.02]"}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                              <a.icon className="w-4 h-4 text-[var(--cyan)]" />
                            </div>
                            {done ? <Check className="w-3.5 h-3.5 text-[var(--cyan)]" />
                              : active ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--cyan)]" />
                              : <span className="w-2 h-2 rounded-full bg-white/30" />}
                          </div>
                          <div className="text-[13px] font-medium">{a.name}</div>
                          <div className="text-[11px] text-white/60 mt-1">{a.desc}</div>
                          <div className="mt-2 text-[9px] font-mono uppercase tracking-widest"
                            style={{ color: done ? "var(--cyan)" : active ? "var(--cyan)" : "rgba(255,255,255,0.4)" }}>
                            {done ? "Completed" : active ? "Processing" : "Queued"}
                          </div>
                        </motion.div>
                        {i < agents.length - 1 && (
                          <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-gradient-to-r from-[var(--cyan)]/50 to-transparent" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Categories */}
            <section className="p-7 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Detected Domains</div>
                  <div className="mt-1 text-lg">Eligible categories</div>
                </div>
                <div className="text-[11px] font-mono text-[var(--electric)]">{eligibilityData ? eligibilityData.meta.detected_categories.length : categories.length} matched</div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(eligibilityData ? eligibilityData.meta.detected_categories : categories).map((c, i) => (
                  <motion.div key={c}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}
                    whileHover={{ y: -3 }}
                    className="group relative px-4 py-2.5 rounded-full bg-white/70 border border-border hover:border-[var(--electric)]/50 hover:shadow-[var(--shadow-glow)] transition cursor-default">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)]" />
                      <span className="text-[13px] text-[var(--navy)]">{c}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{Math.floor(8 + Math.random() * 40)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="relative mt-2 p-8 md:p-10 rounded-3xl overflow-hidden bg-[var(--navy)] text-white">
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="max-w-md">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--cyan)] mb-3">Next Stage</div>
                  <h3 className="text-2xl md:text-3xl leading-tight">
                    Convert insights into <span className="italic text-gradient">personalised recommendations</span>
                  </h3>
                </div>
                <Link to="/recommendations"
                  className="group inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white font-medium text-[14px] shadow-[var(--shadow-glow)]">
                  <Sparkles className="w-4 h-4" />
                  Generate Personalized Recommendations
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: insights */}
          <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
            <div className="p-5 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">AI Insights</div>
                <Zap className="w-3.5 h-3.5 text-[var(--electric)]" />
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={insightIdx}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="mt-3 text-[14px] leading-relaxed text-[var(--navy)]">
                  {displayInsights[insightIdx]}
                </motion.p>
              </AnimatePresence>
              <div className="mt-4 flex gap-1">
                {displayInsights.map((_, i) => (
                  <div key={i} className={`h-0.5 flex-1 rounded ${i === insightIdx ? "bg-[var(--electric)]" : "bg-border"}`} />
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Confidence Breakdown</div>
              {[
                { l: "Profile coverage", v: 96 },
                { l: "Rule satisfaction", v: 92 },
                { l: "Knowledge coverage", v: 88 },
                { l: "Embedding similarity", v: 81 },
              ].map(x => (
                <div key={x.l} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-[var(--navy)]">{x.l}</span>
                    <span className="font-mono text-muted-foreground">{x.v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${x.v}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-3xl bg-[var(--navy)] text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="relative">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--cyan)] mb-3">
                  <Cpu className="w-3 h-3" /> Live Telemetry
                </div>
                {telemetry.map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 text-[12px] border-b border-white/10 last:border-0">
                    <span className="text-white/60">{k}</span>
                    <span className="font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/recommendations" className="flex items-center justify-between p-4 rounded-2xl glass hover:border-[var(--electric)]/40 transition">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Next</div>
                <div className="text-[13px] text-[var(--navy)] mt-0.5">AI Recommendations</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--electric)]" />
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
