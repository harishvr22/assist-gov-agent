import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, Lock, Layers } from "lucide-react";

const floats = [
  { l: "Government Schemes", x: "8%", y: "18%", d: 0 },
  { l: "Eligibility AI", x: "62%", y: "10%", d: 0.4 },
  { l: "RAG Engine", x: "12%", y: "62%", d: 0.8 },
  { l: "Recommendations", x: "60%", y: "70%", d: 1.2 },
  { l: "Citizen Profiles", x: "38%", y: "40%", d: 1.6 },
];

const trust = [
  { i: ShieldCheck, l: "Secure Authentication" },
  { i: Lock, l: "Government Data Protection" },
  { i: Sparkles, l: "AI-Powered Assistance" },
  { i: Layers, l: "Personalized Recommendations" },
];

export function AuthVisual({
  title = "Your Gateway To Smarter Government Benefits",
  subtitle = "Access personalized recommendations, AI-powered eligibility assessments, and government opportunities tailored to you.",
  children,
}: {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[var(--navy)] text-white p-12 xl:p-16">
      {/* mesh + grid */}
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "var(--gradient-mesh)" }} />
      <div className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

      {/* network svg */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lg" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.15 210)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="oklch(0.62 0.22 260)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {[
          [60, 160, 380, 80], [380, 80, 230, 320], [230, 320, 80, 500],
          [80, 500, 360, 560], [360, 560, 230, 320], [230, 320, 480, 240],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#lg)" strokeWidth="1" strokeDasharray="3 6">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur={`${6 + i}s`} repeatCount="indefinite" />
          </line>
        ))}
        {[[60, 160], [380, 80], [230, 320], [80, 500], [360, 560], [480, 240]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3" fill="oklch(0.82 0.15 210)" />
            <circle cx={cx} cy={cy} r="3" fill="oklch(0.82 0.15 210)" opacity="0.3">
              <animate attributeName="r" from="3" to="22" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>

      {/* floating chips */}
      {floats.map((f) => (
        <motion.div key={f.l}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{ delay: f.d * 0.2, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: f.d } }}
          className="absolute z-10 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-tight glass-dark text-white/90"
          style={{ left: f.x, top: f.y }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--cyan)] mr-2 align-middle" />
          {f.l}
        </motion.div>
      ))}

      {/* Header */}
      <div className="relative z-20">
        <Link to="/" className="inline-flex items-center gap-2 font-medium">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-md bg-white/10" />
            <div className="absolute inset-[3px] rounded-sm bg-[var(--electric)]" />
            <div className="absolute inset-[6px] rounded-[2px] bg-[var(--cyan)]" />
          </div>
          <span className="text-[15px] tracking-tight">GovAssist<span className="text-[var(--cyan)]">.</span>AI</span>
        </Link>
      </div>

      {/* Center copy */}
      <div className="relative z-20 max-w-md">
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-4xl xl:text-5xl leading-[1.05] tracking-[-0.03em]">
          {title.split(" ").map((w, i) => (
            <span key={i} className={i % 4 === 2 ? "italic text-gradient" : ""}>{w} </span>
          ))}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 text-white/60 text-[15px] leading-relaxed max-w-sm">
          {subtitle}
        </motion.p>
        {children}
      </div>

      {/* trust */}
      <div className="relative z-20 grid grid-cols-2 gap-3 max-w-md">
        {trust.map((t, i) => (
          <motion.div key={t.l}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-center gap-2.5 text-[12px] text-white/70">
            <div className="grid place-items-center w-6 h-6 rounded-full bg-white/5 border border-white/10">
              <t.i className="w-3 h-3 text-[var(--cyan)]" />
            </div>
            {t.l}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function AuthShell({ left, children }: { left?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {left ?? <AuthVisual />}
      <div className="relative flex items-center justify-center p-6 sm:p-10 overflow-hidden">
        <div className="absolute inset-0 opacity-70 lg:hidden" style={{ backgroundImage: "var(--gradient-mesh)" }} />
        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
