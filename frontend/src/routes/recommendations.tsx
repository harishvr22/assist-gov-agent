import { createFileRoute, Link } from "@tanstack/react-router";
import { useEligibility } from "../hooks/useEligibility";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  ArrowRight, Sparkles, Bookmark, GitCompare, Eye, Clock, Trophy,
  TrendingUp, ShieldCheck, ChevronDown, Check, Zap, Target, Award, Activity,
} from "lucide-react";
import { VoiceControls } from "../components/VoiceControls";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "AI Personalized Recommendations — GovAssist AI" },
      { name: "description", content: "Government schemes ranked for you by Multi-Agent RAG reasoning, with benefits and confidence scoring." },
    ],
  }),
  component: RecommendationsPage,
});

type LocalMockScheme = {
  name: string;
  match: number;
  benefit: string;
  category: string;
  level: "Central" | "State" | "Joint";
  confidence: number;
  rank?: "benefit" | "approval" | "support";
  reasons: string[];
};

const mockSchemes: LocalMockScheme[] = [
  { name: "PM Vidya Lakshmi Education Loan", match: 98, benefit: "₹ 10,00,000", category: "Education Loan", level: "Central", confidence: 96, rank: "benefit",
    reasons: ["Student status matched", "Income < ₹ 4.5L confirmed", "Age 18-30 eligible", "Recognised institution"] },
  { name: "Post-Matric Scholarship (OBC)", match: 95, benefit: "₹ 48,000 /yr", category: "Scholarship", level: "Central", confidence: 94, rank: "approval",
    reasons: ["OBC category verified", "Family income criteria met", "Undergraduate level eligible", "Domicile certificate present"] },
  { name: "Maharashtra Rajarshi Shahu Merit", match: 93, benefit: "₹ 25,000 /yr", category: "State Scholarship", level: "State", confidence: 91, rank: "support",
    reasons: ["Maharashtra resident", "OBC category eligible", "Merit threshold met", "Approved course"] },
  { name: "PMKVY Skill Certification", match: 89, benefit: "Free + Stipend", category: "Skill Development", level: "Central", confidence: 88,
    reasons: ["Youth eligibility", "Undergraduate qualified", "Open enrolment"] },
  { name: "National Career Service", match: 86, benefit: "Career Support", level: "Central", category: "Employment", confidence: 84,
    reasons: ["Job-seeker bracket", "Aadhaar linked", "Skill mapping aligned"] },
  { name: "Mukhyamantri Annapurna Yojana", match: 81, benefit: "Subsidised Meal", category: "Welfare", level: "State", confidence: 79,
    reasons: ["State eligibility", "Income tier matched"] },
];

const mockPodium = [
  { rank: "Rank #1", label: "Highest Financial Benefit", scheme: mockSchemes.find(s => s.rank === "benefit")!, color: "from-[var(--electric)] to-[var(--cyan)]", h: "h-44" },
  { rank: "Rank #2", label: "Highest Approval Probability", scheme: mockSchemes.find(s => s.rank === "approval")!, color: "from-[var(--navy)] to-[var(--electric)]", h: "h-36" },
  { rank: "Rank #3", label: "Best Long-Term Support", scheme: mockSchemes.find(s => s.rank === "support")!, color: "from-[var(--cyan)] to-[var(--electric)]", h: "h-28" },
];

function useCounter(target: number, dur = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const v = useCounter(value);
  const fmt = value >= 1000 ? Math.round(v).toLocaleString() : value % 1 === 0 ? Math.round(v) : v.toFixed(1);
  return (
    <div className="p-5 rounded-2xl glass shadow-[var(--shadow-soft)]">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-display text-[var(--navy)]">{fmt}{suffix}</div>
    </div>
  );
}

function SchemeCard({ s, idx, isSaved, onToggleSave }: { s: any; idx: number; isSaved: boolean; onToggleSave: () => void }) {
  const [open, setOpen] = useState(false);
  const name = s.scheme_name || s.name;
  const match = s.match_percent || s.match || 80;
  const description = s.description || "Eligible under policy rules.";
  const benefit = Array.isArray(s.benefits) ? s.benefits[0] : s.benefits;
  const category = s.category || "Welfare";
  const stateVal = s.state || "Central";
  
  const reasons = s.reason ? [s.reason] : (s.required_documents || ["Passed basic demographic checks"]);
  const applyUrl = s.apply_url || "#";

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
      className="group relative p-6 rounded-3xl glass shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition">
      <div className="absolute -top-3 left-6 px-2.5 py-1 rounded-full bg-[var(--navy)] text-[10px] font-mono uppercase tracking-widest text-[var(--cyan)]">
        Rank #{idx + 1}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <span>{stateVal}</span><span>·</span><span>{category}</span>
          </div>
          <h3 className="mt-2 text-xl text-[var(--navy)] tracking-[-0.02em]">{name}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/70 border border-border text-[11px] font-mono text-[var(--navy)]">{benefit}</span>
            <span className="px-2.5 py-1 rounded-full bg-[var(--electric)]/10 text-[var(--electric)] text-[11px] font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {match - 2}% confidence
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--electric)] to-[var(--cyan)] text-white flex flex-col items-center justify-center shadow-[var(--shadow-glow)]">
            <div className="text-lg font-display leading-none">{match}%</div>
            <div className="text-[8px] font-mono uppercase tracking-widest mt-0.5">Match</div>
          </div>
        </div>
      </div>

      <button onClick={() => setOpen(o => !o)}
        className="mt-5 w-full flex items-center justify-between text-[12px] font-mono text-[var(--electric)] py-2 border-t border-border">
        <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Why this scheme matches you</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="grid sm:grid-cols-2 gap-2 pt-3">
              {reasons.map((r: string) => (
                <div key={r} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/60 border border-border/60">
                  <Check className="w-3.5 h-3.5 text-[var(--electric)]" />
                  <span className="text-[12px] text-[var(--navy)]">{r}</span>
                </div>
              ))}
              {s.failed_criteria && s.failed_criteria.length > 0 && (
                s.failed_criteria.map((fc: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-[12px]">{fc}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={onToggleSave}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] border transition ${isSaved ? "bg-[var(--navy)] text-white border-[var(--navy)]" : "bg-white/70 border-border hover:border-[var(--electric)]/40"}`}>
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} /> {isSaved ? "Saved" : "Save"}
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 border border-border text-[12px] hover:border-[var(--electric)]/40 transition">
          <GitCompare className="w-3.5 h-3.5" /> Compare
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 border border-border text-[12px] hover:border-[var(--electric)]/40 transition">
          <Eye className="w-3.5 h-3.5" /> Details
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 border border-border text-[12px] hover:border-[var(--electric)]/40 transition">
          <Clock className="w-3.5 h-3.5" /> Apply later
        </button>
        {applyUrl !== "#" ? (
          <a href={applyUrl.startsWith("http") ? applyUrl : `https://${applyUrl}`} target="_blank" rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white text-[12px] font-medium no-underline hover:opacity-90">
            Apply <ArrowRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white text-[12px] font-medium">
            Apply <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function RecommendationsPage() {
  const { eligibilityData, savedSchemes, toggleSaveScheme } = useEligibility();

  // Mapped list of schemes to render
  const displaySchemes = useMemo(() => {
    if (eligibilityData && eligibilityData.schemes && eligibilityData.schemes.length > 0) {
      return eligibilityData.schemes;
    }
    // fallback to original static schemes
    return [
      { name: "PM Vidya Lakshmi Education Loan", scheme_name: "PM Vidya Lakshmi Education Loan", match_percent: 98, benefits: ["₹ 10,00,000"], category: "Education Loan", state: "Central", required_documents: ["Student status matched", "Income < ₹ 4.5L confirmed"], apply_url: "vidyalakshmi.co.in", scheme_id: "SCH011" },
      { name: "Post-Matric Scholarship (OBC)", scheme_name: "Post-Matric Scholarship (OBC)", match_percent: 95, benefits: ["₹ 48,000 /yr"], category: "Scholarship", state: "Central", required_documents: ["OBC category verified", "Family income criteria met"], apply_url: "scholarships.gov.in", scheme_id: "SCH012" },
      { name: "Maharashtra Rajarshi Shahu Merit", scheme_name: "Maharashtra Rajarshi Shahu Merit", match_percent: 93, benefits: ["₹ 25,000 /yr"], category: "State Scholarship", state: "Maharashtra", required_documents: ["Maharashtra resident", "OBC category eligible"], apply_url: "mahadbt.maharashtra.gov.in", scheme_id: "SCH018" },
      { name: "PMKVY Skill Certification", scheme_name: "PMKVY Skill Certification", match_percent: 89, benefits: ["Free + Stipend"], category: "Skill Development", state: "Central", required_documents: ["Youth eligibility", "Undergraduate qualified"], apply_url: "pmkvyofficial.org", scheme_id: "SCH044" },
    ];
  }, [eligibilityData]);

  const displayPodium = useMemo(() => {
    if (displaySchemes.length === 0) return [];
    const s1 = displaySchemes[0];
    const s2 = displaySchemes[1] || s1;
    const s3 = displaySchemes[2] || s2 || s1;
    
    return [
      { rank: "Rank #2", label: "Highest Approval Probability", scheme: s2, color: "from-[var(--navy)] to-[var(--electric)]", h: "h-36" },
      { rank: "Rank #1", label: "Highest Financial Benefit", scheme: s1, color: "from-[var(--electric)] to-[var(--cyan)]", h: "h-44" },
      { rank: "Rank #3", label: "Best Long-Term Support", scheme: s3, color: "from-[var(--cyan)] to-[var(--electric)]", h: "h-28" },
    ];
  }, [displaySchemes]);

  const displayChecklist = useMemo(() => {
    if (eligibilityData && eligibilityData.document_checklist && eligibilityData.document_checklist.length > 0) {
      return eligibilityData.document_checklist;
    }
    return ["Aadhaar Card", "Income Certificate", "Caste Certificate (if applicable)", "Academic Marksheets", "Bank Passbook"];
  }, [eligibilityData]);

  const agentLogs = useMemo(() => {
    if (eligibilityData && eligibilityData.agent_logs && eligibilityData.agent_logs.length > 0) {
      return eligibilityData.agent_logs.map(log => log.message);
    }
    return [
      "Eligibility vector locked",
      "Embeddings retrieved · 3.2k",
      "Cross-checked with policy KB",
      "Ranking complete — opportunity compiled",
    ];
  }, [eligibilityData]);

  return (
    <div className="relative min-h-screen bg-background text-[var(--navy)] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "var(--gradient-mesh)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(to right, var(--navy) 1px, transparent 1px), linear-gradient(to bottom, var(--navy) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <nav className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--navy)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[var(--cyan)]" />
          </div>
          <span className="font-display text-xl">GovAssist <span className="italic text-gradient">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full glass text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--electric)] animate-pulse" />
          <span className="text-muted-foreground">Stage 03 ·</span><span>Recommendations</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 max-w-3xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--electric)] mb-4">Reasoning Engine · Output</div>
          <h1 className="text-5xl md:text-6xl leading-[1.05] tracking-[-0.025em]">
            AI Personalized <span className="italic text-gradient">Recommendations</span>
          </h1>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-2xl">
            Synthesised using eligibility analysis, AI reasoning over policy embeddings, and scheme intelligence drawn from central and state portals.
          </p>
          <div className="mt-4">
            <VoiceControls
              textToRead={
                displaySchemes.length > 0
                  ? `Here are your top recommended government schemes. ${
                      displaySchemes[0].scheme_name || displaySchemes[0].name
                    }. Benefit: ${
                      Array.isArray(displaySchemes[0].benefits)
                        ? displaySchemes[0].benefits[0]
                        : displaySchemes[0].benefits
                    }.`
                  : "No recommendations available yet."
              }
            />
          </div>
        </motion.div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <Stat label="Total matches" value={displaySchemes.length} />
          <Stat label="Top opportunities" value={Math.min(displaySchemes.length, 3)} />
          <Stat label="Estimated benefits" value={displaySchemes.length * 12000} suffix=" /yr" />
          <Stat label="Confidence score" value={92} suffix="%" />
        </div>

        {/* Podium */}
        {displayPodium.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Reasoning Podium</div>
                <h2 className="text-2xl mt-1">Top three recommendations</h2>
              </div>
              <Trophy className="w-5 h-5 text-[var(--electric)]" />
            </div>
            <div className="grid grid-cols-3 gap-3 items-end">
              {displayPodium.map((p, i) => {
                const sName = (p.scheme as any).scheme_name || p.scheme.name;
                const matchVal = p.scheme.match_percent || (p.scheme as any).match || 80;
                return (
                  <motion.div key={p.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="mb-3 p-4 rounded-2xl glass shadow-[var(--shadow-soft)]">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--electric)]">{p.rank}</div>
                      <div className="mt-1 text-[13px] text-[var(--navy)] font-medium leading-tight">{sName}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{p.label}</div>
                    </div>
                    <div className={`${p.h} rounded-t-2xl bg-gradient-to-b ${p.color} relative overflow-hidden flex items-end justify-center pb-3`}>
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(to top, transparent, white 200%)" }} />
                      <div className="relative text-white text-2xl font-display">{matchVal}%</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">All recommendations</h2>
              <div className="text-[11px] font-mono text-muted-foreground">Sorted by AI fit score</div>
            </div>
            {displaySchemes.map((s, i) => {
              const sId = s.scheme_id || `MOCK${i}`;
              const isSaved = savedSchemes.some(item => item.scheme_id === sId);
              return (
                <SchemeCard
                  key={sId}
                  s={s}
                  idx={i}
                  isSaved={isSaved}
                  onToggleSave={() => toggleSaveScheme(sId)}
                />
              );
            })}

            <div className="relative mt-2 p-8 md:p-10 rounded-3xl overflow-hidden bg-[var(--navy)] text-white">
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="max-w-md">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--cyan)] mb-3">Continue</div>
                  <h3 className="text-2xl md:text-3xl leading-tight">
                    Explore the full <span className="italic text-gradient">opportunity universe</span>
                  </h3>
                </div>
                <Link to="/discovery"
                  className="group inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white font-medium text-[14px] shadow-[var(--shadow-glow)]">
                  Explore All Available Schemes
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start space-y-4">
            <div className="p-5 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">AI Diagnostics</div>
              {[
                { l: "AI Confidence", v: 92, icon: ShieldCheck },
                { l: "Recommendation Strength", v: 88, icon: Target },
                { l: "Potential Benefit Score", v: 95, icon: TrendingUp },
                { l: "Scheme Priority Index", v: 81, icon: Award },
              ].map(x => (
                <div key={x.l} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="flex items-center gap-1.5 text-[var(--navy)]"><x.icon className="w-3 h-3" />{x.l}</span>
                    <span className="font-mono text-muted-foreground">{x.v}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${x.v}%` }} transition={{ duration: 1.2 }}
                      className="h-full bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)]" />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-3xl bg-[var(--navy)] text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="relative">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--cyan)] mb-3">
                  <Activity className="w-3 h-3" /> Agent logs
                </div>
                {agentLogs.map((x, index) => (
                  <div key={index} className="flex items-start gap-2 py-1.5 text-[12px] text-white/80">
                    <Check className="w-3 h-3 mt-0.5 text-[var(--cyan)] shrink-0" />
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                <Zap className="w-3 h-3 text-[var(--electric)]" /> Required Documents Checklist
              </div>
              <div className="space-y-1.5">
                {displayChecklist.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 text-[12px] text-[var(--navy)] bg-white/50 px-2.5 py-1.5 rounded-lg border border-border/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--electric)] shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
