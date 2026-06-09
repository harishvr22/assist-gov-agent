import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Menu, X, Sparkles, Search, FileCheck, Languages, Bell, LayoutDashboard,
  Brain, MessageSquare, GraduationCap, HeartHandshake, Tractor, Rocket,
  Stethoscope, Home, Users, Briefcase, Accessibility, BookOpen, Send,
  ArrowRight, CheckCircle2, Zap, Target, ShieldCheck, Globe, Twitter,
  Linkedin, Github, Mail, Phone, MapPin, Database, Cpu, Network, Bot,
} from "lucide-react";
import heroImg from "@/assets/hero-ai.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GovAssist AI — Find Government Schemes You're Eligible For" },
      { name: "description", content: "Agentic government scheme eligibility assistant. Discover schemes, check eligibility, and generate document checklists using multi-agent RAG AI." },
      { property: "og:title", content: "GovAssist AI — AI-Powered Government Scheme Discovery" },
      { property: "og:description", content: "Intelligent multi-agent platform helping citizens discover government schemes." },
    ],
  }),
  component: Landing,
});

const nav = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "Categories", href: "#categories" },
  { label: "AI Assistant", href: "#assistant" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function useCounter(target: number, start: boolean, duration = 1600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return val;
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVis(true), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const n = useCounter(value, vis);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold font-[var(--font-display)] bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
        {n.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Landing() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-background/85 backdrop-blur-md border-b border-border shadow-[var(--shadow-soft)]" : "bg-transparent"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2 font-bold text-lg">
            <span className="grid place-items-center w-9 h-9 rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="font-[var(--font-display)]">GovAssist <span className="text-primary">AI</span></span>
          </a>
          <nav className="hidden lg:flex items-center gap-7 text-sm">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-muted-foreground hover:text-foreground transition-colors">{n.label}</a>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors">Login</button>
            <button className="px-4 py-2 text-sm font-semibold text-primary-foreground rounded-lg shadow-[var(--shadow-elegant)] hover:opacity-90 transition" style={{ background: "var(--gradient-primary)" }}>Register</button>
          </div>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {open && (
          <div className="lg:hidden border-t border-border bg-background animate-fade-in">
            <div className="px-4 py-4 flex flex-col gap-2">
              {nav.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-2 text-sm text-muted-foreground hover:text-foreground">{n.label}</a>
              ))}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 px-4 py-2 text-sm border border-border rounded-lg">Login</button>
                <button className="flex-1 px-4 py-2 text-sm text-primary-foreground rounded-lg" style={{ background: "var(--gradient-primary)" }}>Register</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, oklch(0.68 0.18 245 / 0.25), transparent 40%), radial-gradient(circle at 80% 60%, oklch(0.52 0.21 260 / 0.25), transparent 40%)" }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-border text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" /> Multi-Agent RAG Architecture
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]">
              Find Government Schemes You Are Eligible For —{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>Instantly with AI</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              An intelligent multi-agent platform that helps citizens discover government schemes, check eligibility, understand benefits, and generate required document checklists through advanced AI and RAG technology.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-primary-foreground font-semibold shadow-[var(--shadow-elegant)] hover:translate-y-[-1px] transition-all" style={{ background: "var(--gradient-primary)" }}>
                Check Eligibility <ArrowRight className="w-4 h-4" />
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-border font-semibold hover:bg-secondary transition-all">
                <MessageSquare className="w-4 h-4" /> Talk to AI Assistant
              </button>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { v: 100, s: "+", l: "Govt Schemes" },
                { v: 10, s: "+", l: "Categories" },
                { v: 24, s: "/7", l: "AI Recommendations" },
                { v: 8, s: "+", l: "Languages" },
              ].map((s) => <Stat key={s.l} value={s.v} suffix={s.s} label={s.l} />)}
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -inset-6 rounded-3xl blur-3xl opacity-50" style={{ background: "var(--gradient-primary)" }} />
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-[var(--shadow-elegant)] animate-float">
              <img src={heroImg} alt="AI assistant helping citizens with government services" width={1280} height={1024} className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl border border-border shadow-[var(--shadow-soft)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Eligible for 12 schemes</div>
                <div className="text-xs text-muted-foreground">Analyzed in 2.4s</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section id="about" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Making Government Benefits Accessible for Everyone</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Many citizens are unaware of government schemes available to them. GovAssist AI simplifies discovery, eligibility verification, and application preparation through intelligent AI-powered assistance.
            </p>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { i: Zap, t: "Faster Discovery", d: "Identify relevant schemes in seconds instead of hours of research." },
              { i: Target, t: "Personalized Recommendations", d: "AI tailored to your profile, region, and income bracket." },
              { i: CheckCircle2, t: "Simplified Eligibility", d: "Automated checks against scheme criteria with clear results." },
              { i: FileCheck, t: "Smart Document Guidance", d: "Auto-generated checklists of required documents per scheme." },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="group p-6 rounded-2xl border border-border bg-card hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <I className="w-6 h-6" />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">FEATURES</div>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold">Everything you need, powered by AI</h2>
            <p className="mt-4 text-muted-foreground">A complete intelligence layer between citizens and government benefits.</p>
          </div>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { i: ShieldCheck, t: "Smart Eligibility Assessment", d: "Multi-agent reasoning evaluates your profile against scheme criteria." },
              { i: Brain, t: "AI-Powered Recommendations", d: "Personalized suggestions ranked by relevance and benefit value." },
              { i: Search, t: "Natural Language Search", d: "Ask in plain English, Hindi, Tamil or other languages." },
              { i: FileCheck, t: "Document Checklist Generation", d: "Auto-generated, scheme-specific document requirements." },
              { i: BookOpen, t: "Schemes in Simple Language", d: "Plain-language summaries of complex government documents." },
              { i: Languages, t: "Multilingual Support", d: "Conversational AI in 8+ regional Indian languages." },
              { i: Bell, t: "Latest Scheme Updates", d: "Real-time updates as new schemes launch or rules change." },
              { i: LayoutDashboard, t: "Personalized Dashboard", d: "Track applications, deadlines, and saved schemes in one place." },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-[var(--shadow-elegant)] transition-all">
                <I className="w-7 h-7 text-primary" />
                <h3 className="mt-4 font-semibold">{t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">How GovAssist AI Works</h2>
            <p className="mt-4 text-muted-foreground">Five intelligent agents working together to find your benefits.</p>
          </div>
          <div className="mt-16 relative">
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5" style={{ background: "var(--gradient-primary)", opacity: 0.3 }} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { n: 1, t: "Create Profile", d: "Share basic information about your background." },
                { n: 2, t: "Eligibility Agent", d: "AI agent analyzes your profile attributes." },
                { n: 3, t: "Search Agent", d: "Retrieves relevant schemes from the knowledge base." },
                { n: 4, t: "RAG + AI Processing", d: "Reasoning across scheme documents in real time." },
                { n: 5, t: "Recommendations", d: "Get schemes, benefits & document checklists." },
              ].map((s) => (
                <div key={s.n} className="relative text-center">
                  <div className="relative mx-auto w-20 h-20 rounded-2xl grid place-items-center text-primary-foreground font-bold text-2xl shadow-[var(--shadow-elegant)] animate-pulse-glow" style={{ background: "var(--gradient-primary)" }}>
                    {s.n}
                  </div>
                  <h3 className="mt-5 font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-20 md:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Explore Scheme Categories</h2>
            <p className="mt-4 text-muted-foreground">Comprehensive coverage across every major welfare category.</p>
          </div>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {[
              { i: GraduationCap, t: "Student Scholarships" },
              { i: HeartHandshake, t: "Women Welfare" },
              { i: Tractor, t: "Farmer Support" },
              { i: Rocket, t: "Startup & Entrepreneurship" },
              { i: Stethoscope, t: "Healthcare" },
              { i: Home, t: "Housing Assistance" },
              { i: Users, t: "Senior Citizen Benefits" },
              { i: Briefcase, t: "Employment & Skills" },
              { i: Accessibility, t: "Disability Support" },
              { i: BookOpen, t: "Education Assistance" },
            ].map(({ i: I, t }) => (
              <div key={t} className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] transition-all cursor-pointer">
                <div className="w-11 h-11 rounded-xl grid place-items-center bg-primary/10 text-primary group-hover:text-primary-foreground transition-colors" style={{ backgroundImage: "var(--gradient-primary)", backgroundClip: "padding-box" }}>
                  <I className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="mt-4 font-semibold text-sm">{t}</h3>
                <div className="mt-3 text-xs text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI ASSISTANT */}
      <section id="assistant" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Bot className="w-3.5 h-3.5" /> AI ASSISTANT
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold">Conversational AI that understands your needs</h2>
            <p className="mt-4 text-muted-foreground">Ask questions in natural language. Our multi-agent system retrieves the right schemes, explains them simply, and prepares everything you need to apply.</p>
            <ul className="mt-6 space-y-3">
              {["Natural language eligibility queries", "Context-aware multi-turn conversations", "Document & deadline reminders", "Voice support in regional languages"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-30" style={{ background: "var(--gradient-primary)" }} />
            <div className="relative rounded-3xl bg-card border border-border shadow-[var(--shadow-elegant)] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-secondary/50">
                <div className="w-8 h-8 rounded-lg grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">GovAssist AI</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online</div>
                </div>
              </div>
              <div className="p-5 space-y-4 min-h-[320px]">
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm text-primary-foreground text-sm" style={{ background: "var(--gradient-primary)" }}>
                    I am a student from Tamil Nadu with annual income below ₹3 lakh.
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg grid place-items-center bg-primary/10 text-primary shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm bg-secondary text-secondary-foreground text-sm">
                    Based on your profile, you may be eligible for:
                    <ul className="mt-2 space-y-1.5">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> PM Scholarship Scheme</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> National Scholarship Scheme</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> TN Higher Education Assistance</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border flex gap-2">
                <input className="flex-1 px-4 py-2.5 rounded-xl bg-secondary text-sm outline-none" placeholder="Ask about a scheme..." />
                <button className="w-10 h-10 rounded-xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH */}
      <section className="py-20 md:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Built on a Modern AI Stack</h2>
            <p className="mt-4 text-muted-foreground">Multi-agent architecture with retrieval-augmented generation at its core.</p>
          </div>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { i: LayoutDashboard, t: "React Frontend" },
              { i: Cpu, t: "Flask Backend" },
              { i: Database, t: "MongoDB Atlas" },
              { i: Database, t: "ChromaDB" },
              { i: Sparkles, t: "Gemini AI" },
              { i: Network, t: "CrewAI" },
              { i: Bot, t: "Multi-Agent System" },
              { i: Brain, t: "RAG Engine" },
            ].map(({ i: I, t }) => (
              <div key={t} className="p-5 rounded-2xl bg-card border border-border text-center hover:shadow-[var(--shadow-elegant)] transition-all">
                <div className="w-12 h-12 mx-auto rounded-xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  <I className="w-5 h-5" />
                </div>
                <div className="mt-3 text-sm font-semibold">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Empowering Citizens Through Intelligent Access to Government Benefits</h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Stat value={92} suffix="%" label="Improved Awareness" />
            <Stat value={85} suffix="%" label="Faster Eligibility Checks" />
            <Stat value={78} suffix="%" label="Better Accessibility" />
            <Stat value={3} suffix="x" label="Simpler Applications" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Trusted by Citizens Across India</h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { n: "Priya S.", r: "Student, Tamil Nadu", q: "GovAssist AI helped me discover scholarship schemes I never knew existed. I got approved in two weeks." },
              { n: "Ramesh K.", r: "Farmer, Maharashtra", q: "The eligibility check was so simple. It listed three subsidy programs I qualified for instantly." },
              { n: "Anita M.", r: "Entrepreneur, Karnataka", q: "Document checklists saved me weeks of back-and-forth. A genuinely useful AI for citizens." },
            ].map((t) => (
              <div key={t.n} className="p-6 rounded-2xl bg-card border border-border hover:shadow-[var(--shadow-elegant)] transition-all">
                <div className="flex gap-1 text-primary">{"★★★★★"}</div>
                <p className="mt-3 text-sm text-muted-foreground italic">"{t.q}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full grid place-items-center text-primary-foreground font-semibold" style={{ background: "var(--gradient-primary)" }}>
                    {t.n[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.n}</div>
                    <div className="text-xs text-muted-foreground">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center" style={{ background: "var(--gradient-cta)" }}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white, transparent 40%)" }} />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-white">Ready to Discover Your Eligible Government Benefits?</h2>
              <p className="mt-4 text-white/85 max-w-2xl mx-auto">Join thousands of citizens using AI to unlock the benefits they deserve.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button className="px-6 py-3 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 transition-all shadow-lg">Check Eligibility Now</button>
                <button className="px-6 py-3 rounded-xl bg-white/10 border border-white/30 text-white font-semibold backdrop-blur hover:bg-white/20 transition-all">Explore Schemes</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="grid place-items-center w-9 h-9 rounded-xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <ShieldCheck className="w-5 h-5" />
              </span>
              GovAssist <span className="text-primary">AI</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Agentic Government Scheme Eligibility Assistant using Multi-Agent RAG Architecture.</p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Linkedin, Github].map((I, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg grid place-items-center border border-border hover:bg-secondary transition-colors">
                  <I className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {nav.slice(0, 5).map((n) => <li key={n.href}><a href={n.href} className="hover:text-foreground">{n.label}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Resources</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground">API Reference</a></li>
              <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> hello@govassist.ai</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +91 80000 00000</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Bengaluru, India</li>
              <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Available in 8+ languages</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
            <span>© {new Date().getFullYear()} GovAssist AI. All rights reserved.</span>
            <span>Built with Multi-Agent RAG Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
