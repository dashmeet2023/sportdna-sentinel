import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { GuardianAgent } from "@/components/GuardianAgent";
import { RiskPredictionPanel } from "@/components/RiskPredictionPanel";
import { RevenueEstimator } from "@/components/RevenueEstimator";
import { Database, AlertOctagon, Globe2, Banknote } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { HOURLY_DETECTIONS, PLATFORM_BREAKDOWN } from "@/lib/mockData";
import heroTrophy from "@/assets/hero-trophy.png";
import heroPlayer from "@/assets/hero-player.png";

import heroMatch from "@/assets/hero-match.png";
import heroWorldcup from "@/assets/hero-worldcup.png";
import heroStars from "@/assets/hero-stars.png";
import heroCrowd from "@/assets/hero-crowd.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SportDNA — Self-Tracing Sports Media Protection" },
      { name: "description", content: "AI-powered anti-piracy intelligence platform for sports leagues and broadcasters. Detect, track, and prevent unauthorized media use in real time." },
      { property: "og:title", content: "SportDNA — Self-Tracing Sports Media Protection" },
      { property: "og:description", content: "AI-powered anti-piracy intelligence platform for sports leagues and broadcasters." },
    ],
  }),
  component: Dashboard,
});

const PIE_COLORS = ["oklch(0.78 0.17 70)", "oklch(0.65 0.22 25)", "oklch(0.72 0.17 155)", "oklch(0.70 0.15 250)", "oklch(0.82 0.17 85)", "oklch(0.55 0.05 60)"];

function Dashboard() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [parallaxY, setParallaxY] = useState(0);
  const heroImages = [heroTrophy, heroWorldcup, heroStars, heroCrowd];
  const heroLabels = ["TROPHY", "TOURNAMENT", "STARS", "CROWD"];
  const SLIDE_DURATION = 6000; // 24s loop / 4 images
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((s) => (s + 1) % heroImages.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [heroImages.length]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = heroRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Shift image layer up to ~40px as the hero scrolls past viewport
        const progress = Math.max(-1, Math.min(1, -rect.top / Math.max(1, rect.height)));
        setParallaxY(progress * 40);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Hero banner */}
        <section ref={heroRef} className="relative overflow-hidden rounded-2xl border border-border glass-strong">
          <div
            className="absolute inset-0 -top-8 -bottom-8 will-change-transform"
            style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
          >
            {[heroTrophy, heroWorldcup, heroStars, heroCrowd].map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Sports media hero"
                className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
                style={{ animationDelay: `${i * 6}s` }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
          </div>
          {/* Animated grid + particles overlay (cyberpunk depth) */}
          <div className="pointer-events-none absolute inset-0 grid-drift opacity-60 mix-blend-screen" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => {
              const left = (i * 53) % 100;
              const delay = (i * 0.7) % 9;
              const duration = 8 + ((i * 1.3) % 7);
              const drift = ((i % 5) - 2) * 18;
              const size = 2 + (i % 3);
              return (
                <span
                  key={i}
                  className="particle"
                  style={{
                    left: `${left}%`,
                    bottom: `-10px`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    ["--px" as string]: `${drift}px`,
                  }}
                />
              );
            })}
          </div>
          <div className="relative p-6 md:p-8 flex items-stretch justify-between flex-wrap gap-6 min-h-[260px]">
            <div className="max-w-xl flex flex-col justify-end">
              <div className="text-[11px] mono uppercase tracking-[0.2em] text-primary text-glow-amber">Intelligence Dashboard</div>
              <h1 className="text-3xl md:text-4xl font-bold mt-2 leading-tight">
                Protecting the world's <span className="text-primary text-glow-amber">most-watched</span> moments.
              </h1>
              <p className="text-sm text-muted-foreground mt-2">Real-time monitoring of sports media propagation and unauthorized usage across 847 platforms.</p>
              <div className="flex flex-wrap items-center gap-2 mt-4 text-[10px] mono">
                <span className="px-2 py-1 rounded bg-success/15 text-success border border-success/40">DETECTION ENGINE OK</span>
                <span className="px-2 py-1 rounded bg-primary/15 text-primary border border-primary/40">DNA INDEX 12.4M</span>
                <span className="px-2 py-1 rounded bg-destructive/15 text-destructive border border-destructive/40">847 ACTIVE THREATS</span>
              </div>
            </div>
            <div className="relative hidden lg:block w-[340px] rounded-xl overflow-hidden border border-primary/30 self-end shadow-[0_0_40px_-10px_oklch(0.78_0.17_70/0.5)]">
              <img src={heroWorldcup} alt="Global tournament montage" className="w-full h-44 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-[10px] mono text-primary">FEATURED EVENT · LIVE</div>
                <div className="text-sm font-bold leading-tight">Global Tournament Coverage</div>
                <div className="text-[10px] mono text-muted-foreground mt-0.5">42,180 fingerprints · 64 countries</div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] mono bg-destructive/80 text-destructive-foreground px-1.5 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> REC
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Media Assets Protected" value={12847} icon={Database} tone="amber" delta="+184 in last 24h" />
          <StatCard label="Unauthorized Uploads" value={3421} icon={AlertOctagon} tone="red" delta="+217 today" />
          <StatCard label="Platforms Monitored" value={847} icon={Globe2} tone="blue" delta="across 64 countries" />
          <StatCard label="Revenue Loss Prevented" value={2847500} prefix="$" icon={Banknote} tone="green" delta="this quarter" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold">DETECTION VOLUME · 24H</h3>
                <p className="text-[10px] mono text-muted-foreground">DETECTIONS vs TAKEDOWNS</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={HOURLY_DETECTIONS}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.17 70)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.78 0.17 70)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.17 155)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.17 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="hour" stroke="oklch(0.68 0.02 80)" fontSize={10} interval={2} />
                <YAxis stroke="oklch(0.68 0.02 80)" fontSize={10} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.008 60)", border: "1px solid oklch(1 0 0 / 0.1)", fontSize: 12 }} />
                <Area type="monotone" dataKey="detections" stroke="oklch(0.78 0.17 70)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="takedowns" stroke="oklch(0.72 0.17 155)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2">PIRACY BY PLATFORM</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={PLATFORM_BREAKDOWN} dataKey="value" nameKey="platform" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {PLATFORM_BREAKDOWN.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="oklch(0.16 0.005 60)" />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.18 0.008 60)", border: "1px solid oklch(1 0 0 / 0.1)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold">PROTECTED EVENT INTELLIGENCE</h3>
              <p className="text-[10px] mono text-muted-foreground">CATEGORY · ACTIVE FINGERPRINTS · RISK BAND</p>
            </div>
            <span className="text-[10px] mono text-primary">SHOWING 4 / 28</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { img: heroMatch, tag: "MATCH FOOTAGE", title: "Live broadcast streams", meta: "327 fingerprints", risk: "HIGH" },
              { img: heroPlayer, tag: "PLAYER HIGHLIGHTS", title: "Star athlete clips", meta: "892 derivatives", risk: "CRITICAL" },
              { img: heroStars, tag: "TOURNAMENT", title: "International cup montage", meta: "1,540 sources", risk: "ELEVATED" },
              { img: heroCrowd, tag: "FAN-CAM", title: "Stadium crowd reactions", meta: "1,284 reuploads", risk: "MODERATE" },
            ].map((c) => {
              const riskTone = c.risk === "CRITICAL" ? "bg-destructive/20 text-destructive border-destructive/50"
                : c.risk === "HIGH" ? "bg-destructive/15 text-destructive border-destructive/40"
                : c.risk === "ELEVATED" ? "bg-primary/15 text-primary border-primary/40"
                : "bg-warning/15 text-warning border-warning/40";
              return (
                <div key={c.title} className="relative h-52 rounded-xl overflow-hidden border border-border group cursor-pointer">
                  <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-0 grid-bg opacity-10" />
                  <div className="absolute top-2 right-2">
                    <span className={`text-[9px] mono px-1.5 py-0.5 rounded border ${riskTone}`}>{c.risk}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-[9px] mono px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/40">{c.tag}</span>
                    <div className="text-sm font-bold mt-2 leading-tight">{c.title}</div>
                    <div className="text-[10px] mono text-muted-foreground">{c.meta}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><ActivityFeed /></div>
          <div className="space-y-4">
            <RiskPredictionPanel />
            <RevenueEstimator />
          </div>
        </section>

        <section><GuardianAgent /></section>
      </div>
    </AppShell>
  );
}
