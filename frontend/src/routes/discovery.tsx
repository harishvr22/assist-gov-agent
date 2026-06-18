import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Search, Mic, Sparkles, GraduationCap, Tractor, Heart, Rocket, Stethoscope,
  Home, Briefcase, UserCheck, Accessibility, BookOpen, ArrowRight, X, Bookmark,
  Eye, ChevronRight, MessageCircle, Check, TrendingUp, Star, Activity,
} from "lucide-react";

export const Route = createFileRoute("/discovery")({
  head: () => ({
    meta: [
      { title: "Discover Government Opportunities — GovAssist AI" },
      { name: "description", content: "Explore thousands of government schemes through an AI-powered discovery experience tailored to your profile." },
    ],
  }),
  component: DiscoveryPage,
});

const cats = [
  { name: "Student", icon: GraduationCap, count: 482 },
  { name: "Farmer", icon: Tractor, count: 367 },
  { name: "Women", icon: Heart, count: 291 },
  { name: "Startup", icon: Rocket, count: 124 },
  { name: "Healthcare", icon: Stethoscope, count: 318 },
  { name: "Housing", icon: Home, count: 162 },
  { name: "Employment", icon: Briefcase, count: 405 },
  { name: "Senior Citizen", icon: UserCheck, count: 88 },
  { name: "Disability Support", icon: Accessibility, count: 76 },
  { name: "Education", icon: BookOpen, count: 612 },
];

type Scheme = {
  id: string; name: string; gov: string; benefit: string; match: number; category: string; summary: string;
};

const schemes: Scheme[] = [
  { id: "1", name: "PM Vidya Lakshmi", gov: "Central", benefit: "₹ 10L loan", match: 98, category: "Education", summary: "Single-window education loan portal for higher studies." },
  { id: "2", name: "Post-Matric Scholarship", gov: "Central", benefit: "₹ 48,000 /yr", match: 95, category: "Scholarship", summary: "Maintenance & study allowance for OBC students post-class 10." },
  { id: "3", name: "Rajarshi Shahu Merit", gov: "Maharashtra", benefit: "₹ 25,000 /yr", match: 93, category: "Scholarship", summary: "State merit scholarship for OBC undergraduate students." },
  { id: "4", name: "PMKVY 4.0", gov: "Central", benefit: "Free + Stipend", match: 89, category: "Skill", summary: "Short-term skill training with certification and placement support." },
  { id: "5", name: "Startup India Seed", gov: "Central", benefit: "₹ 20L grant", match: 76, category: "Startup", summary: "Proof-of-concept and prototype funding for early stage startups." },
  { id: "6", name: "Ayushman Bharat", gov: "Central", benefit: "₹ 5L cover", match: 84, category: "Healthcare", summary: "Cashless hospitalisation across empanelled hospitals." },
  { id: "7", name: "Mahila Samman Savings", gov: "Central", benefit: "7.5% interest", match: 71, category: "Women", summary: "Two-year savings certificate for women and girls." },
  { id: "8", name: "Mukhyamantri Awas Yojana", gov: "Maharashtra", benefit: "Housing subsidy", match: 68, category: "Housing", summary: "Affordable housing assistance for low-income citizens." },
  { id: "9", name: "NCS Job Portal", gov: "Central", benefit: "Career support", match: 86, category: "Employment", summary: "Free job-matching, career counselling and skill mapping." },
];

const trending = {
  "Most Applied": ["PM Vidya Lakshmi", "Ayushman Bharat", "PMKVY 4.0"],
  "Recently Added": ["Mahila Samman Savings", "Startup India Seed 2.0", "NCS Job Portal"],
  "Trending This Month": ["Post-Matric Scholarship", "Rajarshi Shahu Merit", "Mukhyamantri Awas"],
  "Recommended For You": ["PM Vidya Lakshmi", "Post-Matric Scholarship", "PMKVY 4.0"],
};

function DiscoveryPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<Scheme | null>(null);
  const [tab, setTab] = useState<keyof typeof trending>("Recommended For You");

  const filtered = useMemo(() => {
    return schemes.filter(s => {
      const matchesQ = !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.summary.toLowerCase().includes(q.toLowerCase());
      const matchesCat = !active || s.category.toLowerCase().includes(active.toLowerCase()) || active === "Student" && s.category === "Education";
      return matchesQ && matchesCat;
    });
  }, [q, active]);

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
          <span className="text-muted-foreground">Stage 04 ·</span><span>Discovery</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 max-w-3xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--electric)] mb-4">Opportunity Marketplace</div>
          <h1 className="text-5xl md:text-6xl leading-[1.05] tracking-[-0.025em]">
            Discover Government <span className="italic text-gradient">Opportunities</span>
          </h1>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-2xl">
            Explore thousands of schemes tailored to your profile, your interests, and the moments in life when support matters most.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative p-2 rounded-3xl glass shadow-[var(--shadow-soft)] mb-10">
          <div className="flex items-center gap-2">
            <div className="pl-4"><Search className="w-4 h-4 text-muted-foreground" /></div>
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search schemes, benefits, categories, documents, or ask a question..."
              className="flex-1 py-4 px-2 bg-transparent outline-none text-[15px] placeholder:text-muted-foreground" />
            <button className="p-2.5 rounded-2xl bg-white/70 border border-border hover:border-[var(--electric)]/40 transition" aria-label="voice">
              <Mic className="w-4 h-4 text-[var(--electric)]" />
            </button>
            <button className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white text-[13px] font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Ask AI
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[260px_1fr_300px] gap-6">
          {/* Filters */}
          <aside className="space-y-4 order-2 lg:order-1">
            <div className="p-5 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Smart Filters</div>
              {[
                { l: "State", o: ["Maharashtra", "Karnataka", "Delhi"] },
                { l: "Income range", o: ["< 2L", "2 – 5L", "5 – 10L", "10L+"] },
                { l: "Occupation", o: ["Student", "Farmer", "Salaried", "Self-employed"] },
                { l: "Government level", o: ["Central", "State", "Joint"] },
                { l: "Benefit type", o: ["Cash", "Subsidy", "Training", "Loan"] },
              ].map(g => (
                <div key={g.l} className="mb-4 last:mb-0">
                  <div className="text-[11px] text-[var(--navy)] font-medium mb-2">{g.l}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.o.map(o => (
                      <button key={o} className="px-2.5 py-1 rounded-full bg-white/70 border border-border text-[11px] hover:border-[var(--electric)]/50 transition">
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Middle */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Categories */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Category explorer</h2>
                {active && (
                  <button onClick={() => setActive(null)} className="text-[11px] font-mono text-[var(--electric)] flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear filter
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {cats.map((c, i) => {
                  const isActive = active === c.name;
                  return (
                    <motion.button key={c.name} onClick={() => setActive(isActive ? null : c.name)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      whileHover={{ y: -3 }}
                      className={`group p-4 rounded-2xl text-left transition ${isActive ? "bg-[var(--navy)] text-white shadow-[var(--shadow-glow)]" : "glass hover:border-[var(--electric)]/40"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${isActive ? "bg-white/10" : "bg-gradient-to-br from-[var(--electric)]/10 to-[var(--cyan)]/10"}`}>
                        <c.icon className={`w-4 h-4 ${isActive ? "text-[var(--cyan)]" : "text-[var(--electric)]"}`} />
                      </div>
                      <div className={`text-[13px] font-medium ${isActive ? "text-white" : "text-[var(--navy)]"}`}>{c.name}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isActive ? "text-[var(--cyan)]" : "text-muted-foreground"}`}>{c.count} schemes</div>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* Trending */}
            <section className="p-6 rounded-3xl bg-[var(--navy)] text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--cyan)]">Live signals</div>
                    <h3 className="mt-1 text-xl">Trending across India</h3>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[var(--cyan)]" />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(Object.keys(trending) as Array<keyof typeof trending>).map(k => (
                    <button key={k} onClick={() => setTab(k)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-mono transition ${tab === k ? "bg-white text-[var(--navy)]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                      {k}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="grid sm:grid-cols-3 gap-2">
                    {trending[tab].map((s, i) => (
                      <div key={s} className="p-3 rounded-xl bg-white/[0.06] border border-white/10">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--cyan)] mb-2">
                          <Star className="w-3 h-3" /> #{i + 1}
                        </div>
                        <div className="text-[13px]">{s}</div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>

            {/* Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Scheme universe</h2>
                <div className="text-[11px] font-mono text-muted-foreground">{filtered.length} of {schemes.length} shown</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {filtered.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="group p-5 rounded-3xl glass shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.gov} · {s.category}</div>
                        <div className="mt-1.5 text-[15px] font-medium text-[var(--navy)]">{s.name}</div>
                      </div>
                      <div className="shrink-0 px-2 py-1 rounded-lg bg-gradient-to-br from-[var(--electric)] to-[var(--cyan)] text-white text-[11px] font-mono">
                        {s.match}%
                      </div>
                    </div>
                    <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{s.summary}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="px-2 py-1 rounded-md bg-white/70 border border-border text-[11px] font-mono text-[var(--navy)]">{s.benefit}</span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setDrawer(s)} className="p-1.5 rounded-lg hover:bg-white/70 transition" aria-label="view">
                          <Eye className="w-3.5 h-3.5 text-[var(--electric)]" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/70 transition" aria-label="save">
                          <Bookmark className="w-3.5 h-3.5 text-[var(--electric)]" />
                        </button>
                        <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--navy)] text-white text-[11px]">
                          Apply <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="relative p-8 md:p-10 rounded-3xl overflow-hidden bg-[var(--navy)] text-white">
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="max-w-md">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--cyan)] mb-3">You're ready</div>
                  <h3 className="text-2xl md:text-3xl leading-tight">
                    Ready to apply for the <span className="italic text-gradient">right opportunity?</span>
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[var(--navy)] font-medium text-[13px]">
                    View Full Details <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white font-medium text-[13px] shadow-[var(--shadow-glow)]">
                    <MessageCircle className="w-4 h-4" /> Talk To AI Assistant
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right rail */}
          <aside className="space-y-4 order-3">
            <div className="p-5 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                <Sparkles className="w-3 h-3 text-[var(--electric)]" /> AI Discovery Assistant
              </div>
              <p className="text-[13px] text-[var(--navy)] leading-relaxed">
                "Based on your profile, I found <span className="font-medium text-[var(--electric)]">12 additional scholarship opportunities</span> across two new state portals."
              </p>
              <p className="mt-3 text-[13px] text-[var(--navy)] leading-relaxed">
                "You may qualify for newly added state benefits launched this month."
              </p>
              <button className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--navy)] text-white text-[12px]">
                <MessageCircle className="w-3.5 h-3.5" /> Open chat
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--navy)] text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="relative">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--cyan)] mb-3">
                  <Activity className="w-3 h-3" /> Agent activity
                </div>
                {[
                  "Profile Analyzed",
                  "Eligibility Calculated",
                  "125 Schemes Scanned",
                  "18 Matches Found",
                  "Recommendations Generated",
                  "Discovery Engine Updated",
                ].map(x => (
                  <div key={x} className="flex items-center gap-2 py-1.5 text-[12px] text-white/85 border-b border-white/10 last:border-0">
                    <Check className="w-3 h-3 text-[var(--cyan)]" /> {x}
                  </div>
                ))}
              </div>
            </div>

            <Link to="/recommendations" className="flex items-center justify-between p-4 rounded-2xl glass hover:border-[var(--electric)]/40 transition">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Back to</div>
                <div className="text-[13px] text-[var(--navy)] mt-0.5">AI Recommendations</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--electric)]" />
            </Link>
          </aside>
        </div>
      </main>

      {/* Drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawer(null)} className="fixed inset-0 z-40 bg-[var(--navy)]/40 backdrop-blur-sm" />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[480px] bg-background border-l border-border overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{drawer.gov} · {drawer.category}</div>
                  <button onClick={() => setDrawer(null)} className="p-1.5 rounded-lg hover:bg-muted transition"><X className="w-4 h-4" /></button>
                </div>
                <h3 className="text-2xl tracking-[-0.02em] text-[var(--navy)]">{drawer.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/70 border border-border text-[11px] font-mono">{drawer.benefit}</span>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--electric)]/10 text-[var(--electric)] text-[11px] font-mono">{drawer.match}% match</span>
                </div>
                <p className="mt-4 text-[14px] text-muted-foreground leading-relaxed">{drawer.summary}</p>

                {[
                  { t: "Overview", c: "A flagship scheme designed to provide structured support to qualifying citizens through a single-window digital experience." },
                  { t: "Benefits", c: drawer.benefit + " disbursed annually or as a one-time grant depending on the applicant profile." },
                  { t: "Eligibility", c: "Indian citizen · matches profile vector · documents verifiable via DigiLocker." },
                  { t: "Required Documents", c: "Aadhaar · Income proof · Caste certificate · Bonafide / Admission letter." },
                  { t: "Application Process", c: "Apply online via the official portal · upload documents · track status via DBT dashboard." },
                  { t: "AI Summary", c: "GovAssist AI ranks this scheme highly because your profile satisfies all primary rules with high embedding similarity." },
                ].map(s => (
                  <div key={s.t} className="mt-5">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--electric)] mb-1.5">{s.t}</div>
                    <p className="text-[13px] text-[var(--navy)] leading-relaxed">{s.c}</p>
                  </div>
                ))}

                <div className="mt-6 flex gap-2">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white text-[13px] font-medium">
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-3 rounded-2xl border border-border text-[13px]">Official link</button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
