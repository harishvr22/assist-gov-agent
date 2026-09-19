import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useEligibility } from "../hooks/useEligibility";
import {
  Search, Mic, Sparkles, GraduationCap, Tractor, Heart, Rocket, Stethoscope,
  Home, Briefcase, UserCheck, Accessibility, BookOpen, ArrowRight, X, Bookmark,
  Eye, ChevronRight, MessageCircle, Check, TrendingUp, Star, Activity, Loader2,
} from "lucide-react";
import { VoiceControls } from "../components/VoiceControls";

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
  { name: "Student", icon: GraduationCap },
  { name: "Farmer", icon: Tractor },
  { name: "Women", icon: Heart },
  { name: "Startup", icon: Rocket },
  { name: "Healthcare", icon: Stethoscope },
  { name: "Housing", icon: Home },
  { name: "Employment", icon: Briefcase },
  { name: "Senior Citizen", icon: UserCheck },
  { name: "Disability Support", icon: Accessibility },
  { name: "Education", icon: BookOpen },
];

type Scheme = {
  id: string;
  name: string;
  gov: string;
  benefit: string;
  match: number;
  category: string;
  summary: string;
  documents: string[];
  apply_url: string;
};

// Frontend Match compatibility calculator
function calculateMatch(scheme: any, user: any) {
  if (!user) return 75 + (scheme.scheme_name.charCodeAt(0) % 20); // default mock-like 75-95% when signed out

  let score = 0;
  let maxScore = 0;

  // 1. State eligibility check (30 points)
  maxScore += 30;
  if (!scheme.state || scheme.state === "All India" || (user.state && user.state.toLowerCase() === scheme.state.toLowerCase())) {
    score += 30;
  }

  // 2. Age eligibility check (25 points)
  maxScore += 25;
  if (user.age !== null && user.age !== undefined) {
    const minAge = scheme.min_age ?? 0;
    const maxAge = scheme.max_age ?? 120;
    if (user.age >= minAge && user.age <= maxAge) {
      score += 25;
    } else {
      const diff = Math.min(Math.abs(user.age - minAge), Math.abs(user.age - maxAge));
      score += Math.max(0, 25 - diff * 3);
    }
  } else {
    score += 20; // default points
  }

  // 3. Income eligibility check (25 points)
  maxScore += 25;
  // Map onboarding family income to numeric fallback if needed
  let userIncome = typeof user.annual_family_income === "number" ? user.annual_family_income : null;
  if (userIncome === null && user.income) {
    // try to parse range or label
    const rawInc = user.income.replace(/[^0-9]/g, "");
    if (rawInc) userIncome = parseInt(rawInc) * 100000; // e.g. "5" -> 500000
  }
  
  if (userIncome !== null) {
    const maxLimit = scheme.max_income ?? 9999999;
    if (userIncome <= maxLimit) {
      score += 25;
    } else {
      const excess = userIncome - maxLimit;
      score += Math.max(0, 25 - Math.floor(excess / 50000) * 5);
    }
  } else {
    score += 20;
  }

  // 4. Gender eligibility check (15 points)
  maxScore += 15;
  if (!scheme.gender || scheme.gender === "All" || (user.gender && user.gender.toLowerCase() === scheme.gender.toLowerCase())) {
    score += 15;
  }

  // 5. Disability eligibility check (5 points)
  maxScore += 5;
  const disabilityRequired = scheme.disability_required === "Yes";
  const userDisabled = user.disability_status === "Yes";
  if (disabilityRequired === userDisabled) {
    score += 5;
  }

  return Math.round((score / maxScore) * 100);
}

function DiscoveryPage() {
  const { user } = useAuth();
  const { savedSchemes, toggleSaveScheme } = useEligibility();

  // Filters State
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);
  
  // Smart Filters
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedIncomeRange, setSelectedIncomeRange] = useState<string | null>(null);
  const [selectedOccupation, setSelectedOccupation] = useState<string | null>(null);
  const [selectedGovLevel, setSelectedGovLevel] = useState<string | null>(null);
  const [selectedBenefitType, setSelectedBenefitType] = useState<string | null>(null);

  const [drawer, setDrawer] = useState<Scheme | null>(null);
  const [tab, setTab] = useState<string>("Recommended For You");

  // Database Schemes list
  const [rawSchemes, setRawSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch schemes from Flask backend API catalog
  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const response = await fetch("/api/schemes");
        if (!response.ok) {
          throw new Error("Failed to load scheme catalog");
        }
        const data = await response.json();
        setRawSchemes(data.schemes || []);
      } catch (err: any) {
        console.error("Catalog fetch error:", err);
        setErrorMessage(err.message || "Could not connect to scheme catalog API.");
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  // Map Database structures to UI scheme structures
  const mappedSchemes = useMemo<Scheme[]>(() => {
    return rawSchemes.map((s: any) => {
      const isCentral = !s.state || s.state === "All India";
      const benefitStr = s.benefits || "Direct scheme benefits apply according to eligibility.";
      
      return {
        id: s.scheme_id,
        name: s.scheme_name,
        gov: isCentral ? "Central" : s.state,
        benefit: benefitStr.length > 40 ? benefitStr.substring(0, 40) + "..." : benefitStr,
        match: calculateMatch(s, user),
        category: s.category || "General",
        summary: s.benefits || "",
        documents: s.documents || ["Aadhaar Card", "Income Certificate", "Bank passbook"],
        apply_url: s.apply_url || "#"
      };
    });
  }, [rawSchemes, user]);

  // Compute dynamic category counts from loaded database schemes
  const categoryCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    rawSchemes.forEach((s: any) => {
      const cat = s.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const studentCount = (counts["Student"] || 0) + (counts["Education"] || 0);
    const educationCount = studentCount;
    const disabilityCount = counts["Disability"] || 0;

    return {
      ...counts,
      "Student": studentCount,
      "Education": educationCount,
      "Disability Support": disabilityCount,
    };
  }, [rawSchemes]);

  // Compute dynamic trending lists
  const trendingList = useMemo(() => {
    const sortedByMatch = [...mappedSchemes].sort((a, b) => b.match - a.match);
    const recommended = sortedByMatch.slice(0, 3).map(s => s.name);
    const recentlyAdded = mappedSchemes.slice(-3).map(s => s.name);
    const mostApplied = mappedSchemes.slice(0, 3).map(s => s.name);
    const trendingThisMonth = mappedSchemes.slice(3, 6).map(s => s.name);

    return {
      "Most Applied": mostApplied.length ? mostApplied : ["PM Kisan Samman Nidhi", "Ayushman Bharat PM-JAY", "PM Kaushal Vikas Yojana (PMKVY)"],
      "Recently Added": recentlyAdded.length ? recentlyAdded : ["Mahila Samman Savings Certificate", "Startup India Seed Fund Scheme", "National Apprenticeship Promotion Scheme (NAPS)"],
      "Trending This Month": trendingThisMonth.length ? trendingThisMonth : ["NSP SC Post-Matric Scholarship", "Tamil Nadu Free Laptop Scheme", "PMAY-G (Gramin Housing)"],
      "Recommended For You": recommended.length ? recommended : ["PM Kisan Samman Nidhi", "Ayushman Bharat PM-JAY", "NSP SC Post-Matric Scholarship"],
    };
  }, [mappedSchemes]);

  // Handle active client-side filtering logic
  const filtered = useMemo(() => {
    return mappedSchemes.filter(s => {
      // 1. Text Search Input Query
      const matchesQ = !q || 
        s.name.toLowerCase().includes(q.toLowerCase()) || 
        s.summary.toLowerCase().includes(q.toLowerCase()) ||
        s.category.toLowerCase().includes(q.toLowerCase());

      // 2. Main Category Explorer Selection
      const matchesCat = !active || 
        (active === "Student" && (s.category === "Student" || s.category === "Education")) ||
        (active === "Education" && (s.category === "Student" || s.category === "Education")) ||
        (active === "Disability Support" && s.category === "Disability") ||
        (s.category && s.category.toLowerCase() === active.toLowerCase());

      // 3. State filter selection
      const matchesState = !selectedState || 
        s.gov.toLowerCase() === selectedState.toLowerCase() ||
        (selectedState === "Maharashtra" && s.gov.includes("Maharashtra")) ||
        (selectedState === "Tamil Nadu" && s.gov.includes("Tamil Nadu")) ||
        (selectedState === "Uttar Pradesh" && s.gov.includes("Uttar Pradesh")) ||
        (selectedState === "Bihar" && s.gov.includes("Bihar")) ||
        (selectedState === "Karnataka" && s.gov.includes("Karnataka"));

      // 4. Income range filter selection
      let matchesIncome = true;
      if (selectedIncomeRange) {
        // find max limit for scheme in database
        const originalScheme = rawSchemes.find(os => os.scheme_id === s.id);
        const maxLim = originalScheme?.max_income ?? 9999999;
        if (selectedIncomeRange === "< 2L") {
          matchesIncome = maxLim >= 200000;
        } else if (selectedIncomeRange === "2 – 5L") {
          matchesIncome = maxLim >= 500000;
        } else if (selectedIncomeRange === "5 – 10L") {
          matchesIncome = maxLim >= 1000000;
        } else if (selectedIncomeRange === "10L+") {
          matchesIncome = maxLim >= 9999999;
        }
      }

      // 5. Occupation filter selection
      let matchesOcc = true;
      if (selectedOccupation) {
        const originalScheme = rawSchemes.find(os => os.scheme_id === s.id);
        const cat = s.category.toLowerCase();
        const occ = selectedOccupation.toLowerCase();
        if (occ === "student") {
          matchesOcc = cat === "student" || cat === "education";
        } else if (occ === "farmer") {
          matchesOcc = cat === "farmer";
        } else if (occ === "senior citizen") {
          matchesOcc = cat === "senior citizen" || (originalScheme?.min_age >= 60);
        } else {
          matchesOcc = s.summary.toLowerCase().includes(occ) || s.name.toLowerCase().includes(occ);
        }
      }

      // 6. Government level selection
      let matchesGovLevel = true;
      if (selectedGovLevel) {
        if (selectedGovLevel === "Central") {
          matchesGovLevel = s.gov === "Central" || s.gov === "All India";
        } else if (selectedGovLevel === "State") {
          matchesGovLevel = s.gov !== "Central" && s.gov !== "All India";
        }
      }

      // 7. Benefit type selection
      let matchesBenefit = true;
      if (selectedBenefitType) {
        const bType = selectedBenefitType.toLowerCase();
        const text = (s.benefit + " " + s.summary).toLowerCase();
        if (bType === "cash") {
          matchesBenefit = text.includes("₹") || text.includes("cash") || text.includes("pension") || text.includes("allowance") || text.includes("grant");
        } else if (bType === "subsidy") {
          matchesBenefit = text.includes("subsidy") || text.includes("concessional") || text.includes("free");
        } else if (bType === "training") {
          matchesBenefit = text.includes("training") || text.includes("skill") || text.includes("apprenticeship");
        } else if (bType === "loan") {
          matchesBenefit = text.includes("loan") || text.includes("credit card") || text.includes("finance");
        }
      }

      return matchesQ && matchesCat && matchesState && matchesIncome && matchesOcc && matchesGovLevel && matchesBenefit;
    });
  }, [mappedSchemes, rawSchemes, q, active, selectedState, selectedIncomeRange, selectedOccupation, selectedGovLevel, selectedBenefitType]);

  // Check if any active sidebar or category filters exist
  const hasActiveFilters = !!(active || selectedState || selectedIncomeRange || selectedOccupation || selectedGovLevel || selectedBenefitType);

  const clearAllFilters = () => {
    setActive(null);
    setSelectedState(null);
    setSelectedIncomeRange(null);
    setSelectedOccupation(null);
    setSelectedGovLevel(null);
    setSelectedBenefitType(null);
    setQ("");
  };

  return (
    <div className="relative min-h-screen bg-background text-[var(--navy)] overflow-x-hidden">
      {/* Visual background decorations */}
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
            Explore hundreds of verified schemes in the database catalog, sorted by compatibility to your profile state, age, and benefits.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative p-2 rounded-3xl glass shadow-[var(--shadow-soft)] mb-10">
          <div className="flex items-center gap-2">
            <div className="pl-4"><Search className="w-4 h-4 text-muted-foreground" /></div>
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search schemes, benefits, categories, or states..."
              className="flex-1 py-4 px-2 bg-transparent outline-none text-[15px] placeholder:text-muted-foreground" />
            
            {q && (
              <button onClick={() => setQ("")} className="p-1 rounded-full hover:bg-black/5 transition" aria-label="clear search">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}

            <VoiceControls
              compact
              onTranscriptReceived={(text) => setQ(text)}
            />

            <button className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white text-[13px] font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Find Schemes
            </button>
          </div>
        </motion.div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-[260px_1fr_300px] gap-6">
          {/* Smart Filters Sidebar */}
          <aside className="space-y-4 order-2 lg:order-1">
            <div className="p-5 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Smart Filters</div>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters} className="text-[10px] font-mono text-[var(--electric)] flex items-center gap-1 hover:underline">
                    <X className="w-2.5 h-2.5" /> Reset all
                  </button>
                )}
              </div>
              
              {/* State Filter Group */}
              <div className="mb-4">
                <div className="text-[11px] text-[var(--navy)] font-medium mb-2">State</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Central", "Maharashtra", "Tamil Nadu", "Bihar", "Uttar Pradesh", "West Bengal", "Karnataka"].map(state => {
                    const isSelected = selectedState === state;
                    return (
                      <button 
                        key={state} 
                        onClick={() => setSelectedState(isSelected ? null : state)}
                        className={`px-2.5 py-1 rounded-full border text-[11px] transition ${
                          isSelected 
                            ? "bg-[var(--navy)] text-white border-[var(--navy)]" 
                            : "bg-white/70 border-border hover:border-[var(--electric)]/50"
                        }`}
                      >
                        {state}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Income Range Filter Group */}
              <div className="mb-4">
                <div className="text-[11px] text-[var(--navy)] font-medium mb-2">Annual Income Max Cap</div>
                <div className="flex flex-wrap gap-1.5">
                  {["< 2L", "2 – 5L", "5 – 10L", "10L+"].map(range => {
                    const isSelected = selectedIncomeRange === range;
                    return (
                      <button 
                        key={range} 
                        onClick={() => setSelectedIncomeRange(isSelected ? null : range)}
                        className={`px-2.5 py-1 rounded-full border text-[11px] transition ${
                          isSelected 
                            ? "bg-[var(--navy)] text-white border-[var(--navy)]" 
                            : "bg-white/70 border-border hover:border-[var(--electric)]/50"
                        }`}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Occupation Filter Group */}
              <div className="mb-4">
                <div className="text-[11px] text-[var(--navy)] font-medium mb-2">Occupation Target</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Student", "Farmer", "Senior Citizen"].map(occ => {
                    const isSelected = selectedOccupation === occ;
                    return (
                      <button 
                        key={occ} 
                        onClick={() => setSelectedOccupation(isSelected ? null : occ)}
                        className={`px-2.5 py-1 rounded-full border text-[11px] transition ${
                          isSelected 
                            ? "bg-[var(--navy)] text-white border-[var(--navy)]" 
                            : "bg-white/70 border-border hover:border-[var(--electric)]/50"
                        }`}
                      >
                        {occ}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gov Level Filter Group */}
              <div className="mb-4">
                <div className="text-[11px] text-[var(--navy)] font-medium mb-2">Government Level</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Central", "State"].map(gov => {
                    const isSelected = selectedGovLevel === gov;
                    return (
                      <button 
                        key={gov} 
                        onClick={() => setSelectedGovLevel(isSelected ? null : gov)}
                        className={`px-2.5 py-1 rounded-full border text-[11px] transition ${
                          isSelected 
                            ? "bg-[var(--navy)] text-white border-[var(--navy)]" 
                            : "bg-white/70 border-border hover:border-[var(--electric)]/50"
                        }`}
                      >
                        {gov}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Benefit Type Filter Group */}
              <div>
                <div className="text-[11px] text-[var(--navy)] font-medium mb-2">Benefit Type</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Cash", "Subsidy", "Training", "Loan"].map(benefit => {
                    const isSelected = selectedBenefitType === benefit;
                    return (
                      <button 
                        key={benefit} 
                        onClick={() => setSelectedBenefitType(isSelected ? null : benefit)}
                        className={`px-2.5 py-1 rounded-full border text-[11px] transition ${
                          isSelected 
                            ? "bg-[var(--navy)] text-white border-[var(--navy)]" 
                            : "bg-white/70 border-border hover:border-[var(--electric)]/50"
                        }`}
                      >
                        {benefit}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Middle Content Area */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Category Explorer */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Category explorer</h2>
                {active && (
                  <button onClick={() => setActive(null)} className="text-[11px] font-mono text-[var(--electric)] flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear explorer filter
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {cats.map((c, i) => {
                  const isActive = active === c.name;
                  const count = categoryCounts[c.name as keyof typeof categoryCounts] ?? 0;
                  return (
                    <motion.button key={c.name} onClick={() => setActive(isActive ? null : c.name)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      whileHover={{ y: -3 }}
                      className={`group p-4 rounded-2xl text-left transition ${isActive ? "bg-[var(--navy)] text-white shadow-[var(--shadow-glow)]" : "glass hover:border-[var(--electric)]/40"}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${isActive ? "bg-white/10" : "bg-gradient-to-br from-[var(--electric)]/10 to-[var(--cyan)]/10"}`}>
                        <c.icon className={`w-4 h-4 ${isActive ? "text-[var(--cyan)]" : "text-[var(--electric)]"}`} />
                      </div>
                      <div className={`text-[13px] font-medium ${isActive ? "text-white" : "text-[var(--navy)]"}`}>{c.name}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${isActive ? "text-[var(--cyan)]" : "text-muted-foreground"}`}>{count} schemes</div>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* Trending across India Live Signal Block */}
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
                  {Object.keys(trendingList).map(k => (
                    <button key={k} onClick={() => setTab(k)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-mono transition ${tab === k ? "bg-white text-[var(--navy)]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
                      {k}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="grid sm:grid-cols-3 gap-2">
                    {(trendingList[tab as keyof typeof trendingList] || []).map((schemeName, i) => (
                      <div key={schemeName} className="p-3 rounded-xl bg-white/[0.06] border border-white/10">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--cyan)] mb-2">
                          <Star className="w-3 h-3" /> #{i + 1}
                        </div>
                        <div className="text-[13px] truncate" title={schemeName}>{schemeName}</div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>

            {/* Scheme universe catalog Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Scheme universe</h2>
                <div className="text-[11px] font-mono text-muted-foreground">{filtered.length} of {mappedSchemes.length} shown</div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--electric)] mb-2" />
                  <span className="text-sm font-mono">Querying database schemes catalog...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center glass rounded-3xl text-muted-foreground">
                  <p className="text-sm">No schemes matched your active query filters.</p>
                  <button onClick={clearAllFilters} className="mt-3 text-xs text-[var(--electric)] font-mono hover:underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filtered.map((s, i) => {
                    const isSaved = savedSchemes.some(saved => saved.scheme_id === s.id);
                    return (
                      <motion.div key={s.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                        className="group p-5 rounded-3xl glass shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.gov} · {s.category}</div>
                              <div className="mt-1.5 text-[15px] font-medium text-[var(--navy)] leading-tight">{s.name}</div>
                            </div>
                            <div className="shrink-0 px-2 py-1 rounded-lg bg-gradient-to-br from-[var(--electric)] to-[var(--cyan)] text-white text-[11px] font-mono">
                              {s.match}%
                            </div>
                          </div>
                          <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{s.summary}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-black/[0.03] flex items-center justify-between">
                          <span className="px-2 py-1 rounded-md bg-white/70 border border-border text-[10px] font-mono text-[var(--navy)] truncate max-w-[120px]">{s.benefit}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setDrawer(s)} className="p-1.5 rounded-lg hover:bg-white/70 transition" aria-label="view details">
                              <Eye className="w-3.5 h-3.5 text-[var(--electric)]" />
                            </button>
                            <button 
                              onClick={() => toggleSaveScheme(s.id)} 
                              className="p-1.5 rounded-lg hover:bg-white/70 transition" 
                              aria-label="bookmark opportunity"
                            >
                              <Bookmark className={`w-3.5 h-3.5 text-[var(--electric)] ${isSaved ? "fill-[var(--electric)]" : ""}`} />
                            </button>
                            <button 
                              onClick={() => setDrawer(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--navy)] text-white text-[10px]"
                            >
                              Apply <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Application CTA Callout */}
            <div className="relative p-8 md:p-10 rounded-3xl overflow-hidden bg-[var(--navy)] text-white">
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="max-w-md">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--cyan)] mb-3">Check Your Profile</div>
                  <h3 className="text-2xl md:text-3xl leading-tight">
                    Ready to run a complete <span className="italic text-gradient">AI RAG evaluation?</span>
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/recommendations" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[var(--navy)] font-medium text-[13px]">
                    View AI Recommendations <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/onboarding" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white font-medium text-[13px] shadow-[var(--shadow-glow)]">
                    <Sparkles className="w-4 h-4" /> Update Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Rail Panel */}
          <aside className="space-y-4 order-3">
            <div className="p-5 rounded-3xl glass shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                <Sparkles className="w-3 h-3 text-[var(--electric)]" /> AI Discovery Assistant
              </div>
              {user ? (
                <>
                  <p className="text-[13px] text-[var(--navy)] leading-relaxed">
                    "Welcome back, <span className="font-semibold">{user.name}</span>! I've calculated eligibility scores for all catalog opportunities based on your profile in <span className="font-semibold">{user.state || "All India"}</span>."
                  </p>
                  <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
                    Age check: <span className="font-mono text-[var(--electric)] font-medium">{user.age || "N/A"} years</span><br />
                    Category: <span className="font-mono text-[var(--electric)] font-medium">{user.category || "General"}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[13px] text-[var(--navy)] leading-relaxed">
                    "Sign in or complete profile onboarding to view personalized match scores, bookmarked opportunities, and dynamic checklists."
                  </p>
                  <Link to="/login" className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[var(--navy)] text-white text-[12px]">
                    Sign In to Profile
                  </Link>
                </>
              )}
            </div>

            <div className="p-5 rounded-3xl bg-[var(--navy)] text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "var(--gradient-mesh)" }} />
              <div className="relative">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[var(--cyan)] mb-3">
                  <Activity className="w-3 h-3" /> Core Catalog Stats
                </div>
                {[
                  `Total Seeded Schemes: ${rawSchemes.length}`,
                  `Central Gov Opportunities: ${rawSchemes.filter(s => !s.state || s.state === "All India").length}`,
                  `State Opportunities: ${rawSchemes.filter(s => s.state && s.state !== "All India").length}`,
                  `Farmer Specific: ${categoryCounts["Farmer"] || 0}`,
                  `Scholarships & Student: ${categoryCounts["Student"] || 0}`,
                  `Women Centric: ${categoryCounts["Women"] || 0}`,
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

      {/* Detail View Drawer */}
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
                  <button onClick={() => setDrawer(null)} className="p-1.5 rounded-lg hover:bg-muted transition" aria-label="close details"><X className="w-4 h-4" /></button>
                </div>
                <h3 className="text-2xl tracking-[-0.02em] text-[var(--navy)]">{drawer.name}</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/70 border border-border text-[11px] font-mono">{drawer.benefit}</span>
                  <span className="px-2.5 py-1 rounded-full bg-[var(--electric)]/10 text-[var(--electric)] text-[11px] font-mono">{drawer.match}% match</span>
                </div>
                <p className="mt-4 text-[14px] text-muted-foreground leading-relaxed">{drawer.summary}</p>

                {[
                  { t: "Overview", c: "A flagship scheme designed to provide structured support to qualifying citizens through a single-window digital experience." },
                  { t: "Benefits Details", c: drawer.summary },
                  { t: "Required Documents", c: drawer.documents && drawer.documents.length ? drawer.documents.join(" · ") : "Aadhaar Card · Income Certificate · Bank Passbook" },
                  { t: "Application Process", c: "Apply online via the official portal link · upload documents · track status via DBT dashboard." },
                  { t: "Compatibility Check", c: `Based on your profile, this opportunity matches you with ${drawer.match}% confidence. Verify rules on the official portal before applying.` },
                ].map(s => (
                  <div key={s.t} className="mt-5">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--electric)] mb-1.5">{s.t}</div>
                    <p className="text-[13px] text-[var(--navy)] leading-relaxed">{s.c}</p>
                  </div>
                ))}

                <div className="mt-6 flex gap-2">
                  <button 
                    onClick={() => {
                      if (drawer.apply_url && drawer.apply_url !== "#") {
                        window.open(drawer.apply_url.startsWith("http") ? drawer.apply_url : `https://${drawer.apply_url}`, "_blank");
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[var(--electric)] to-[var(--cyan)] text-white text-[13px] font-medium"
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  {drawer.apply_url && drawer.apply_url !== "#" && (
                    <a 
                      href={drawer.apply_url.startsWith("http") ? drawer.apply_url : `https://${drawer.apply_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-2xl border border-border text-[13px] flex items-center justify-center text-muted-foreground hover:text-[var(--navy)] transition"
                    >
                      Official Link
                    </a>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
