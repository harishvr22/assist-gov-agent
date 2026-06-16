import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Sparkles, BrainIcon, Search, FileText, Cpu,
  CheckCircle2, GraduationCap, HeartHandshake, Tractor, Stethoscope,
  Home, Rocket, Briefcase, Accessibility, Send, Bot, Mic, Bell, Languages,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GovAssist AI — Government Benefits, Finally Understandable" },
      { name: "description", content: "An AI-powered eligibility intelligence system that discovers, explains, and recommends government schemes tailored to every citizen." },
      { property: "og:title", content: "GovAssist AI" },
      { property: "og:description", content: "AI-powered eligibility intelligence for government schemes." },
    ],
  }),
  component: Page,
});

/* =====================  NAV  ===================== */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    f(); window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  const links = [
    { l: "Intelligence", h: "#brain" },
    { l: "Simulator", h: "#simulator" },
    { l: "Universe", h: "#universe" },
    { l: "Roadmap", h: "#roadmap" },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className={`flex items-center justify-between transition-all duration-500 rounded-full px-5 py-2.5 ${scrolled ? "glass shadow-[var(--shadow-soft)]" : ""}`}>
          <a href="#top" className="flex items-center gap-2 font-medium">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-md bg-[var(--navy)]" />
              <div className="absolute inset-[3px] rounded-sm bg-[var(--electric)]" />
              <div className="absolute inset-[6px] rounded-[2px] bg-[var(--cyan)]" />
            </div>
            <span className="text-[15px] tracking-tight">GovAssist<span className="text-[var(--electric)]">.</span>AI</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-[13px] text-muted-foreground">
            {links.map(l => <a key={l.h} href={l.h} className="hover:text-foreground transition-colors">{l.l}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline text-[13px] text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link to="/register" className="group flex items-center gap-1.5 text-[13px] font-medium bg-[var(--navy)] text-white pl-4 pr-1 py-1 rounded-full">
              Begin
              <span className="grid place-items-center w-7 h-7 rounded-full bg-[var(--electric)] group-hover:rotate-45 transition-transform"><ArrowUpRight className="w-3.5 h-3.5" /></span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =====================  NEURAL NET BG  ===================== */
function NeuralNet() {
  const nodes = [
    { x: 10, y: 20, r: 4 }, { x: 25, y: 70, r: 5 }, { x: 40, y: 30, r: 3 },
    { x: 50, y: 85, r: 4 }, { x: 65, y: 25, r: 5 }, { x: 78, y: 65, r: 4 },
    { x: 90, y: 35, r: 3 }, { x: 15, y: 50, r: 3 }, { x: 55, y: 55, r: 5 },
    { x: 85, y: 80, r: 4 }, { x: 35, y: 15, r: 3 }, { x: 70, y: 10, r: 3 },
  ];
  const edges = [
    [0,2],[0,7],[1,7],[1,8],[2,4],[2,10],[3,8],[4,5],[4,6],[5,8],[5,9],[6,11],[7,8],[8,9],[10,4],[11,6],
  ];
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="oklch(0.62 0.22 260)" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="oklch(0.62 0.22 260)" stopOpacity="0.4" />
          <stop offset="1" stopColor="oklch(0.82 0.15 210)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="url(#edge)" strokeWidth="0.15" vectorEffect="non-scaling-stroke" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r / 8} fill="oklch(0.62 0.22 260)" opacity="0.15">
            <animate attributeName="r" values={`${n.r/8};${n.r/5};${n.r/8}`} dur={`${3 + (i%4)}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={n.x} cy={n.y} r={n.r / 18} fill="oklch(0.62 0.22 260)" />
        </g>
      ))}
      {edges.slice(0, 8).map(([a, b], i) => (
        <circle key={`p${i}`} r="0.25" fill="oklch(0.82 0.15 210)">
          <animateMotion dur={`${4 + i}s`} repeatCount="indefinite"
            path={`M ${nodes[a].x} ${nodes[a].y} L ${nodes[b].x} ${nodes[b].y}`} />
        </circle>
      ))}
    </svg>
  );
}

/* =====================  HERO  ===================== */
const heroPrompts = [
  "I am a student from Tamil Nadu",
  "I am a farmer with low income",
  "I am a 65-year-old retiree",
  "I run a small startup in Karnataka",
];
function Hero() {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "processing" | "done">("typing");

  useEffect(() => {
    const target = heroPrompts[idx];
    if (phase === "typing") {
      if (text.length < target.length) {
        const t = setTimeout(() => setText(target.slice(0, text.length + 1)), 60);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("processing"), 800);
      return () => clearTimeout(t);
    }
    if (phase === "processing") {
      const t = setTimeout(() => setPhase("done"), 3200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setText(""); setPhase("typing"); setIdx((idx + 1) % heroPrompts.length);
    }, 1800);
    return () => clearTimeout(t);
  }, [text, phase, idx]);

  const steps = ["Eligibility Agent", "Search Agent", "RAG Engine", "Recommendation"];

  return (
    <section id="top" className="relative min-h-screen pt-32 pb-20 overflow-hidden" style={{ backgroundImage: "var(--gradient-mesh)" }}>
      <div className="absolute inset-0 grid-bg opacity-[0.4]" />
      <div className="absolute inset-0 opacity-60"><NeuralNet /></div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-[12px] text-[var(--navy)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--electric)] animate-pulse" />
          Multi-Agent RAG · Live Eligibility Intelligence
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}
          className="mt-7 text-[44px] sm:text-6xl md:text-[88px] leading-[0.95] tracking-[-0.04em] text-[var(--navy)]">
          Government Benefits.<br />
          <span className="italic text-gradient">Finally Understandable.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}
          className="mt-6 max-w-2xl mx-auto text-[17px] text-muted-foreground leading-relaxed">
          An AI-powered eligibility intelligence system that discovers, explains, and recommends government schemes — tailored to every citizen.
        </motion.p>

        {/* Conversational input */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9 }}
          className="mt-12 max-w-2xl mx-auto">
          <div className="relative glass rounded-2xl p-2 shadow-[var(--shadow-elegant)]">
            <div className="absolute -inset-px rounded-2xl pointer-events-none opacity-60" style={{ background: "var(--gradient-glow)", filter: "blur(20px)", zIndex: -1 }} />
            <div className="flex items-center gap-3 px-4 py-3">
              <Sparkles className="w-4 h-4 text-[var(--electric)] shrink-0" />
              <div className="flex-1 text-left text-[15px] text-[var(--navy)] min-h-[24px]">
                <span>{text}</span>
                {phase === "typing" && <span className="cursor-blink" />}
              </div>
              <button className="grid place-items-center w-9 h-9 rounded-xl bg-[var(--navy)] text-white">
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Processing workflow */}
            <AnimatePresence>
              {phase !== "typing" && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="px-4 pt-3 pb-4 border-t border-border/60 flex flex-wrap items-center justify-center gap-2 text-[12px]">
                    {steps.map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: phase === "done" || i < 4 ? 1 : 0.3 }}
                          transition={{ delay: i * 0.6 }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 border border-border">
                          <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ delay: i * 0.6, duration: 0.6 }}
                            className="w-1.5 h-1.5 rounded-full bg-[var(--electric)]" />
                          {s}
                        </motion.div>
                        {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground font-mono">
            Try: "student" · "farmer" · "retiree" · "entrepreneur"
          </div>
        </motion.div>

        {/* Bottom marquee of trust */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}
          className="mt-20 flex items-center justify-center gap-8 text-[11px] text-muted-foreground font-mono tracking-widest uppercase">
          <span>100+ Schemes</span><span className="w-1 h-1 rounded-full bg-border" />
          <span>10 Categories</span><span className="w-1 h-1 rounded-full bg-border" />
          <span>8 Languages</span>
        </motion.div>
      </div>
    </section>
  );
}

/* =====================  PROBLEM WALL  ===================== */
function ProblemWall() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

  const items = [
    { p: "Too many schemes", s: "AI surfaces only what's relevant to you" },
    { p: "Complex eligibility", s: "Plain-language criteria, auto-evaluated" },
    { p: "Difficult government language", s: "Translated to simple human terms" },
    { p: "Missing opportunities", s: "Proactive matches as policies change" },
  ];

  return (
    <section ref={ref} className="relative h-[320vh] bg-background">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="mx-auto max-w-6xl px-6 w-full">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-[11px] font-mono text-[var(--electric)] tracking-widest">CHAPTER 01 · THE PROBLEM</div>
              <h2 className="mt-3 text-4xl md:text-6xl text-[var(--navy)]">A wall between<br />citizens and benefits.</h2>
            </div>
            <div className="hidden md:block text-[11px] font-mono text-muted-foreground">SCROLL →</div>
          </div>
        </div>
        <motion.div style={{ x }} className="flex gap-8 px-6 pl-[10vw]">
          {items.map((it, i) => (
            <div key={i} className="relative shrink-0 w-[78vw] md:w-[56vw] lg:w-[44vw] h-[55vh] rounded-3xl overflow-hidden bg-[var(--navy)] text-white p-10 flex flex-col justify-between">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, oklch(0.62 0.22 260) 0%, transparent 50%)" }} />
              <div className="relative">
                <div className="text-[12px] font-mono text-white/40">PROBLEM 0{i + 1}</div>
                <div className="mt-6 text-5xl md:text-6xl font-[var(--font-display)] tracking-tight">{it.p}</div>
              </div>
              <div className="relative flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-[var(--cyan)] to-white/10" />
                <ArrowRight className="w-5 h-5 text-[var(--cyan)]" />
                <div className="text-[15px] text-white/80 max-w-[60%]">{it.s}</div>
              </div>
            </div>
          ))}
          <div className="shrink-0 w-[10vw]" />
        </motion.div>
      </div>
    </section>
  );
}

/* =====================  AI BRAIN  ===================== */
const brainNodes = [
  { id: "user", l: "User", x: 50, y: 8, d: "Citizen provides profile information." },
  { id: "elig", l: "Eligibility Agent", x: 50, y: 26, d: "Analyzes age, income, occupation, location." },
  { id: "search", l: "Search Agent", x: 50, y: 44, d: "Retrieves candidate schemes from indexes." },
  { id: "kb", l: "Knowledge Base", x: 22, y: 60, d: "Curated scheme corpus & criteria." },
  { id: "live", l: "Live Retrieval", x: 78, y: 60, d: "Real-time government source fetch." },
  { id: "rag", l: "RAG Engine", x: 50, y: 76, d: "Reasons across documents to ground answers." },
  { id: "out", l: "Recommendations", x: 50, y: 92, d: "Personalized schemes + document checklists." },
];
const brainEdges: [string,string][] = [["user","elig"],["elig","search"],["search","kb"],["search","live"],["kb","rag"],["live","rag"],["rag","out"]];
function BrainSection() {
  const [hover, setHover] = useState<string | null>("rag");
  const node = brainNodes.find(n => n.id === hover) ?? brainNodes[5];
  const get = (id: string) => brainNodes.find(n => n.id === id)!;
  return (
    <section id="brain" className="relative py-32 bg-[var(--navy)] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, oklch(0.62 0.22 260) 0%, transparent 60%)" }} />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="text-[11px] font-mono text-[var(--cyan)] tracking-widest">CHAPTER 02 · ARCHITECTURE</div>
          <h2 className="mt-3 text-4xl md:text-6xl">Inside the <span className="italic" style={{ color: "var(--cyan)" }}>AI brain.</span></h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">Seven coordinated systems turn raw citizen input into grounded, explainable recommendations.</p>
        </div>

        <div className="mt-16 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div className="relative aspect-square w-full max-w-[560px] mx-auto">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              {brainEdges.map(([a, b], i) => {
                const A = get(a), B = get(b);
                const active = hover === a || hover === b;
                return (
                  <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                    stroke={active ? "oklch(0.82 0.15 210)" : "oklch(1 0 0 / 0.15)"}
                    strokeWidth="0.3" vectorEffect="non-scaling-stroke"
                    strokeDasharray={active ? "0" : "1 1"} />
                );
              })}
            </svg>
            {brainNodes.map(n => {
              const active = hover === n.id;
              return (
                <button key={n.id}
                  onMouseEnter={() => setHover(n.id)}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group">
                  <div className="relative">
                    {active && <div className="absolute inset-0 rounded-full bg-[var(--cyan)]/30" style={{ animation: "pulse-ring 1.6s ease-out infinite" }} />}
                    <div className={`relative w-12 h-12 rounded-full grid place-items-center transition-all ${active ? "bg-[var(--cyan)] scale-110" : "bg-white/10 backdrop-blur"}`}>
                      <div className={`w-2 h-2 rounded-full ${active ? "bg-[var(--navy)]" : "bg-white"}`} />
                    </div>
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[11px] font-mono whitespace-nowrap transition-opacity ${active ? "opacity-100" : "opacity-50"}`}>
                      {n.l}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={node.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-dark rounded-2xl p-8">
              <div className="text-[11px] font-mono text-[var(--cyan)]">NODE / {node.id.toUpperCase()}</div>
              <h3 className="mt-3 text-3xl">{node.l}</h3>
              <p className="mt-4 text-white/70 leading-relaxed">{node.d}</p>
              <div className="mt-6 flex gap-2 flex-wrap">
                {["Async", "Stateless", "Observable", "Composable"].map(t => (
                  <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-white/15 text-white/60">{t}</span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* =====================  SIMULATOR  ===================== */
const occupations = ["Student", "Farmer", "Entrepreneur", "Senior", "Worker"];
const eduOptions = ["School", "Diploma", "Graduate", "Postgraduate"];
const schemes = [
  { n: "PM Scholarship", c: ["Student"], ageMax: 30, incomeMax: 5 },
  { n: "Kisan Samman Nidhi", c: ["Farmer"], ageMax: 80, incomeMax: 8 },
  { n: "Startup India Seed", c: ["Entrepreneur"], ageMax: 45, incomeMax: 50 },
  { n: "Atal Pension Yojana", c: ["Senior", "Worker"], ageMax: 80, incomeMax: 6 },
  { n: "PMAY Housing", c: ["Worker", "Farmer", "Entrepreneur"], ageMax: 70, incomeMax: 9 },
  { n: "Ayushman Bharat", c: ["Senior", "Worker", "Farmer"], ageMax: 90, incomeMax: 5 },
  { n: "Skill India", c: ["Student", "Worker"], ageMax: 35, incomeMax: 6 },
];
function Simulator() {
  const [age, setAge] = useState(22);
  const [income, setIncome] = useState(3);
  const [occ, setOcc] = useState("Student");
  const [edu, setEdu] = useState("Graduate");

  const matches = schemes.filter(s => s.c.includes(occ) && age <= s.ageMax && income <= s.incomeMax);

  return (
    <section id="simulator" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)", opacity: 0.5 }} />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <div className="text-[11px] font-mono text-[var(--electric)] tracking-widest">CHAPTER 03 · SIMULATOR</div>
          <h2 className="mt-3 text-4xl md:text-6xl text-[var(--navy)]">Adjust your life.<br /><span className="italic text-gradient">Watch eligibility breathe.</span></h2>
        </div>

        <div className="mt-16 grid lg:grid-cols-[1fr_1.2fr] gap-12">
          {/* Controls */}
          <div className="space-y-10">
            {/* Age */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-[11px] font-mono text-muted-foreground tracking-widest">AGE</label>
                <span className="text-5xl text-[var(--navy)] tabular-nums">{age}</span>
              </div>
              <input type="range" min={16} max={80} value={age} onChange={e => setAge(+e.target.value)}
                className="w-full accent-[var(--electric)]" />
            </div>
            {/* Income */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-[11px] font-mono text-muted-foreground tracking-widest">ANNUAL INCOME</label>
                <span className="text-5xl text-[var(--navy)] tabular-nums">₹{income}L</span>
              </div>
              <input type="range" min={0} max={30} value={income} onChange={e => setIncome(+e.target.value)}
                className="w-full accent-[var(--electric)]" />
            </div>
            {/* Occupation chips */}
            <div>
              <div className="text-[11px] font-mono text-muted-foreground tracking-widest mb-3">OCCUPATION</div>
              <div className="flex flex-wrap gap-2">
                {occupations.map(o => (
                  <button key={o} onClick={() => setOcc(o)}
                    className={`px-3.5 py-1.5 rounded-full text-[13px] border transition-all ${occ === o ? "bg-[var(--navy)] text-white border-[var(--navy)]" : "bg-white/60 border-border text-foreground hover:border-[var(--electric)]"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-muted-foreground tracking-widest mb-3">EDUCATION</div>
              <div className="flex flex-wrap gap-2">
                {eduOptions.map(e => (
                  <button key={e} onClick={() => setEdu(e)}
                    className={`px-3.5 py-1.5 rounded-full text-[13px] border transition-all ${edu === e ? "bg-[var(--navy)] text-white border-[var(--navy)]" : "bg-white/60 border-border text-foreground hover:border-[var(--electric)]"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live result */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl opacity-30 blur-2xl" style={{ background: "var(--gradient-glow)" }} />
            <div className="relative glass rounded-3xl p-7 shadow-[var(--shadow-elegant)]">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono text-muted-foreground">LIVE / ELIGIBILITY</div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--electric)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--electric)] animate-pulse" /> Computing
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <div className="text-7xl text-[var(--navy)] tabular-nums">{matches.length}</div>
                <div className="text-muted-foreground">schemes match your profile</div>
              </div>
              <div className="mt-6 space-y-2">
                <AnimatePresence mode="popLayout">
                  {matches.map((s, i) => (
                    <motion.div key={s.n}
                      layout
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/80 border border-border">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-[var(--electric)]" />
                        <span className="text-[14px] text-[var(--navy)]">{s.n}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {matches.length === 0 && (
                  <div className="text-sm text-muted-foreground py-6 text-center">Adjust your inputs to discover schemes.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================  SCHEME UNIVERSE  ===================== */
const planets = [
  { id: "edu", l: "Student", icon: GraduationCap, x: 18, y: 25, r: 64, count: 24 },
  { id: "women", l: "Women", icon: HeartHandshake, x: 78, y: 18, r: 56, count: 18 },
  { id: "farm", l: "Farmer", icon: Tractor, x: 12, y: 70, r: 72, count: 31 },
  { id: "health", l: "Healthcare", icon: Stethoscope, x: 70, y: 75, r: 60, count: 22 },
  { id: "house", l: "Housing", icon: Home, x: 48, y: 12, r: 50, count: 14 },
  { id: "startup", l: "Startup", icon: Rocket, x: 45, y: 88, r: 54, count: 16 },
  { id: "emp", l: "Employment", icon: Briefcase, x: 88, y: 50, r: 58, count: 19 },
  { id: "dis", l: "Disability", icon: Accessibility, x: 30, y: 48, r: 48, count: 11 },
];
function Universe() {
  const [active, setActive] = useState("farm");
  const cur = planets.find(p => p.id === active)!;
  return (
    <section id="universe" className="relative py-32 bg-[var(--navy)] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, oklch(0.3 0.1 260) 0%, transparent 70%)" }} />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] font-mono text-[var(--cyan)] tracking-widest">CHAPTER 04 · UNIVERSE</div>
          <h2 className="mt-3 text-4xl md:text-6xl">A universe of <span className="italic" style={{ color: "var(--cyan)" }}>opportunities.</span></h2>
          <p className="mt-4 text-white/60">Every category is an interconnected world. Explore the ecosystem.</p>
        </div>

        <div className="mt-16 relative aspect-[16/10] w-full">
          {/* Orbits */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full border border-white/5" style={{ animation: "drift 8s ease-in-out infinite" }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square rounded-full border border-white/5" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square rounded-full border border-white/10" />

          {/* Center sun */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="relative w-28 h-28 rounded-full grid place-items-center" style={{ background: "var(--gradient-glow)", boxShadow: "var(--shadow-glow)" }}>
              <BrainIcon className="w-9 h-9 text-white" />
              <div className="absolute inset-0 rounded-full" style={{ animation: "pulse-ring 2.5s ease-out infinite", background: "oklch(0.82 0.15 210 / 0.3)" }} />
            </div>
            <div className="mt-3 text-[11px] font-mono text-white/60">GOVASSIST CORE</div>
          </div>

          {/* Planets */}
          {planets.map((p) => {
            const Icon = p.icon;
            const isActive = active === p.id;
            return (
              <button key={p.id} onMouseEnter={() => setActive(p.id)}
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.r, height: p.r, animation: `drift ${5 + (p.r % 4)}s ease-in-out infinite` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group">
                <div className={`w-full h-full rounded-full grid place-items-center transition-all ${isActive ? "bg-[var(--cyan)] text-[var(--navy)]" : "glass-dark text-white"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[11px] font-mono whitespace-nowrap transition-opacity ${isActive ? "opacity-100" : "opacity-60"}`}>
                  {p.l} <span className="text-[var(--cyan)]">·</span> {p.count}
                </div>
              </button>
            );
          })}

          {/* Detail card */}
          <AnimatePresence mode="wait">
            <motion.div key={cur.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 glass-dark rounded-2xl p-5">
              <div className="text-[11px] font-mono text-[var(--cyan)]">CATEGORY</div>
              <div className="mt-1 text-2xl">{cur.l} Welfare</div>
              <div className="mt-1 text-white/60 text-sm">{cur.count} schemes available</div>
              <div className="mt-4 flex items-center gap-2 text-[12px] text-white/80">
                <span>Explore</span><ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* =====================  CONVERSATION SHOWCASE  ===================== */
const convoSteps = [
  { l: "Understanding User", d: "Parsing profile: farmer · TN · income < ₹2L" },
  { l: "Searching Schemes", d: "Querying 14 indexes across 8 ministries" },
  { l: "Analyzing Eligibility", d: "Matching 47 criteria across 23 candidates" },
  { l: "Generating Documents", d: "Compiling checklist & application links" },
];
function Conversation() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    setStep(0);
    const id = setInterval(() => {
      i++;
      if (i >= convoSteps.length) { clearInterval(id); return; }
      setStep(i);
    }, 900);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <div className="text-[11px] font-mono text-[var(--electric)] tracking-widest">CHAPTER 05 · CONVERSATION</div>
          <h2 className="mt-3 text-4xl md:text-6xl text-[var(--navy)]">Talk like a human.<br /><span className="italic text-gradient">Get answers like a citizen.</span></h2>
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-10 items-start">
          {/* Chat */}
          <div className="glass rounded-3xl p-6 shadow-[var(--shadow-elegant)]">
            <div className="flex items-center gap-2 pb-4 border-b border-border/60">
              <div className="w-8 h-8 rounded-lg grid place-items-center text-white" style={{ background: "var(--gradient-glow)" }}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-sm font-medium text-[var(--navy)]">GovAssist AI</div>
              <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
              </div>
            </div>
            <div className="py-5 space-y-4 min-h-[260px]">
              <div className="flex justify-end">
                <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-[var(--navy)] text-white text-sm">
                  I am a farmer from Tamil Nadu with income below ₹2 lakh.
                </div>
              </div>
              <AnimatePresence>
                {step >= convoSteps.length - 1 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                    <div className="w-8 h-8 rounded-lg grid place-items-center text-white shrink-0" style={{ background: "var(--gradient-glow)" }}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm bg-secondary text-sm text-[var(--navy)]">
                      You qualify for <b>3 schemes</b>:
                      <div className="mt-2 space-y-1.5">
                        {["Kisan Samman Nidhi (₹6,000/yr)", "PM Fasal Bima Yojana", "Ayushman Bharat health cover"].map(s => (
                          <div key={s} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--electric)]" />{s}</div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Status timeline */}
          <div className="space-y-3">
            {convoSteps.map((s, i) => {
              const done = step > i;
              const active = step === i;
              return (
                <div key={s.l} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${active ? "bg-white border-[var(--electric)]/30 shadow-[var(--shadow-soft)]" : done ? "bg-white/60 border-border" : "bg-transparent border-border/50 opacity-50"}`}>
                  <div className={`mt-0.5 w-7 h-7 rounded-full grid place-items-center text-[11px] font-mono ${done ? "bg-[var(--electric)] text-white" : active ? "bg-[var(--navy)] text-white" : "bg-secondary text-muted-foreground"}`}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-[var(--navy)]">{s.l}</div>
                      {active && <span className="text-[10px] font-mono text-[var(--electric)] animate-pulse">RUNNING</span>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5 font-mono text-[12px]">{s.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================  IMPACT  ===================== */
function useCount(target: number, on: boolean, dur = 1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      setV(Math.floor(p * (2 - p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, target, dur]);
  return v;
}
function Impact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-150px" });
  const missed = useCount(680, inView);
  const reached = useCount(94, inView);
  const speed = useCount(8, inView);

  return (
    <section ref={ref} className="relative py-32 bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[11px] font-mono text-[var(--electric)] tracking-widest">CHAPTER 06 · IMPACT</div>
            <h2 className="mt-3 text-5xl md:text-7xl text-[var(--navy)] leading-[0.95]">
              <span className="tabular-nums text-gradient">{missed}M+</span><br />
              <span className="italic">citizens miss</span><br /> benefits every year.
            </h2>
            <p className="mt-6 text-muted-foreground max-w-md">
              Most never know what they qualify for. GovAssist AI rewrites the discovery layer — turning silence into opportunity.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-[var(--navy)] text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-3xl" style={{ background: "var(--cyan)" }} />
              <div className="relative">
                <div className="text-[11px] font-mono text-[var(--cyan)] tracking-widest">AWARENESS UPLIFT</div>
                <div className="mt-3 text-7xl tabular-nums">{reached}<span className="text-3xl text-white/40">%</span></div>
                <div className="mt-2 text-white/70 text-sm">citizens discover schemes they didn't know existed</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl glass">
                <div className="text-[11px] font-mono text-muted-foreground">SPEED</div>
                <div className="mt-2 text-4xl text-[var(--navy)] tabular-nums">{speed}s</div>
                <div className="mt-1 text-xs text-muted-foreground">avg. eligibility check</div>
              </div>
              <div className="p-6 rounded-2xl glass">
                <div className="text-[11px] font-mono text-muted-foreground">LANGUAGES</div>
                <div className="mt-2 text-4xl text-[var(--navy)] tabular-nums">8+</div>
                <div className="mt-1 text-xs text-muted-foreground">regional + national</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================  ROADMAP  ===================== */
const roadmap = [
  { p: "TODAY", t: "Scheme Discovery", d: "AI-powered eligibility & recommendations.", icon: Sparkles, done: true },
  { p: "TOMORROW", t: "Application Tracking", d: "Live application status across ministries.", icon: FileText, done: false },
  { p: "Q3", t: "Voice Assistant", d: "Conversational queries in regional languages.", icon: Mic, done: false },
  { p: "Q4", t: "Multilingual AI", d: "Native fluency in 12+ Indian languages.", icon: Languages, done: false },
  { p: "FUTURE", t: "Proactive Alerts", d: "We notify you when new schemes match.", icon: Bell, done: false },
];
function Roadmap() {
  return (
    <section id="roadmap" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-mesh)", opacity: 0.4 }} />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] font-mono text-[var(--electric)] tracking-widest">CHAPTER 07 · FUTURE</div>
          <h2 className="mt-3 text-4xl md:text-6xl text-[var(--navy)]">A roadmap to <span className="italic text-gradient">proactive government.</span></h2>
        </div>

        <div className="mt-20 relative">
          <div className="absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-[var(--electric)]/40 to-transparent hidden md:block" />
          <div className="grid md:grid-cols-5 gap-8">
            {roadmap.map((r, i) => {
              const I = r.icon;
              return (
                <motion.div key={r.t}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative text-center">
                  <div className="relative mx-auto w-24 h-24">
                    <div className={`w-full h-full rounded-2xl grid place-items-center ${r.done ? "bg-[var(--navy)] text-white" : "glass text-[var(--navy)]"}`}>
                      <I className="w-6 h-6" />
                    </div>
                    {r.done && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--electric)] grid place-items-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
                  </div>
                  <div className="mt-5 text-[10px] font-mono text-[var(--electric)] tracking-widest">{r.p}</div>
                  <div className="mt-1 font-medium text-[var(--navy)]">{r.t}</div>
                  <div className="mt-1.5 text-[12px] text-muted-foreground">{r.d}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================  CTA  ===================== */
function CTA() {
  return (
    <section id="cta" className="relative py-40 bg-[var(--navy-deep)] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 50% 100%, oklch(0.62 0.22 260) 0%, transparent 60%)" }} />
      <div className="absolute inset-0"><NeuralNet /></div>
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent opacity-10" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="text-[11px] font-mono text-[var(--cyan)] tracking-widest">CHAPTER 08 · BEGIN</div>
        <h2 className="mt-6 text-5xl md:text-7xl leading-[0.95]">
          Every citizen deserves access<br />to the <span className="italic" style={{ color: "var(--cyan)" }}>right opportunity.</span>
        </h2>
        <p className="mt-8 text-white/60 max-w-xl mx-auto text-lg">
          Let AI bridge the gap between people and government benefits.
        </p>

        <div className="mt-14 inline-block relative group">
          <div className="absolute -inset-3 rounded-full opacity-70 blur-2xl group-hover:opacity-100 transition-opacity" style={{ background: "var(--gradient-glow)" }} />
          <button className="relative flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[var(--navy)] font-medium text-base">
            Start Your Eligibility Journey
            <span className="grid place-items-center w-8 h-8 rounded-full bg-[var(--navy)] text-white group-hover:rotate-45 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </button>
        </div>

        <div className="mt-24 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-white/40 font-mono">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rounded-sm bg-white/20" />
              <div className="absolute inset-[2px] rounded-sm bg-[var(--electric)]" />
            </div>
            GOVASSIST.AI · MULTI-AGENT RAG
          </div>
          <div>© {new Date().getFullYear()} · BUILT FOR CITIZENS</div>
        </div>
      </div>
    </section>
  );
}

/* =====================  PAGE  ===================== */
function Page() {
  return (
    <main className="relative bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <ProblemWall />
      <BrainSection />
      <Simulator />
      <Universe />
      <Conversation />
      <Impact />
      <Roadmap />
      <CTA />
    </main>
  );
}
