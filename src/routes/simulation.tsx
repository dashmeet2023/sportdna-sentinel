import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Square, Radar, Fingerprint, Shield, AlertOctagon, CheckCircle2, Activity, Globe2, Cpu, Wifi, Server, Database, Bot } from "lucide-react";
import { GuardianAgent } from "@/components/GuardianAgent";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Live Attack Simulation · SportDNA" },
      { name: "description", content: "Simulate a piracy attack and watch SportDNA detect, match, verify, and dispatch takedown in real time." },
      { property: "og:title", content: "Live Attack Simulation · SportDNA" },
      { property: "og:description", content: "Simulate piracy attacks and observe AI detection in real time." },
    ],
  }),
  component: SimPage,
});

const STEPS = [
  { id: "upload", label: "Pirated upload detected on TikTok", Icon: AlertOctagon, tone: "destructive" },
  { id: "scan", label: "Crawler scanning frame embeddings", Icon: Radar, tone: "primary" },
  { id: "match", label: "AI similarity matching against DNA index", Icon: Fingerprint, tone: "primary" },
  { id: "watermark", label: "Watermark verification confirmed", Icon: Shield, tone: "primary" },
  { id: "alert", label: "Alert dispatched + DMCA notice queued", Icon: CheckCircle2, tone: "success" },
] as const;

const CRAWLERS = [
  { name: "TikTok", region: "EU-WEST", Icon: Globe2 },
  { name: "Telegram", region: "RU-CENTRAL", Icon: Wifi },
  { name: "YouTube", region: "US-EAST", Icon: Server },
  { name: "X / Twitter", region: "AP-SOUTH", Icon: Bot },
  { name: "Reddit", region: "US-WEST", Icon: Database },
  { name: "Discord", region: "EU-NORTH", Icon: Cpu },
] as const;

const PACKET_SAMPLES = [
  "GET /api/v3/scan/frame?h=a91f...c7 200 OK 41ms",
  "POST /dna/match shard=07 vec=512d  ▸ score=0.974",
  "TLS handshake tiktok-cdn-eu-2.akamai.net  ✔",
  "crawler[tg-bot-44] fetched media_id=7311_x ✓",
  "embed[Δ]=0.018  watermark:LCMS=true  ▸ HIGH",
  "rule.fire ANTI-PIRACY-7  asset=MID-77231",
  "queue.dmca enqueue ticket=T-9417 platform=TIKTOK",
  "geoip 95.214.55.12 → MOSCOW · ASN 49720",
  "sha256:b3a91…d77 verified against ledger",
  "crawler[yt-edge-3] heartbeat 200 lat=88ms",
  "dnaIndex.lookup vec=512  ▸ 12 candidates",
  "siglog → SOC sev=HIGH src=TG conf=0.96",
];

type Packet = { id: number; t: string; line: string };

function SimPage() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [log, setLog] = useState<{ t: string; m: string; tone: string }[]>([]);

  // Live monitoring state
  const [threats, setThreats] = useState(1247);
  const [scanned, setScanned] = useState(89432);
  const [blocked, setBlocked] = useState(312);
  const [bandwidth, setBandwidth] = useState(184);
  const [traffic, setTraffic] = useState<number[]>(() => Array.from({ length: 48 }, () => 40));
  const [packets, setPackets] = useState<Packet[]>([]);
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); }, []);
  const packetId = useRef(0);

  // Pipeline ticker
  useEffect(() => {
    if (!running) return;
    if (step >= STEPS.length - 1) { setRunning(false); return; }
    const id = setTimeout(() => {
      const next = step + 1;
      const s = STEPS[next];
      const t = new Date().toTimeString().slice(0, 8);
      setLog((l) => [{ t, m: s.label, tone: s.tone }, ...l].slice(0, 30));
      setStep(next);
    }, 1100);
    return () => clearTimeout(id);
  }, [running, step]);

  // Always-on monitoring (clock, traffic graph, counters, packets, latency)
  useEffect(() => {
    const intensity = running ? 2.4 : 1;
    const clock = setInterval(() => setNow(new Date()), 1000);

    const trafficTick = setInterval(() => {
      setTraffic((arr) => {
        const base = running ? 55 : 30;
        const spike = Math.random() < (running ? 0.25 : 0.1) ? Math.random() * 35 : 0;
        const next = Math.max(8, Math.min(100, base + (Math.random() - 0.5) * 30 + spike));
        return [...arr.slice(1), next];
      });
      setBandwidth((b) => Math.max(60, Math.min(980, b + (Math.random() - 0.45) * 40 * intensity)));
    }, 600);

    const counters = setInterval(() => {
      setScanned((n) => n + Math.floor(8 + Math.random() * 22 * intensity));
      if (Math.random() < 0.35 * intensity) setThreats((n) => n + 1);
      if (Math.random() < 0.25 * intensity) setBlocked((n) => n + 1);
    }, 900);

    const pkts = setInterval(() => {
      const line = PACKET_SAMPLES[Math.floor(Math.random() * PACKET_SAMPLES.length)];
      const t = new Date().toTimeString().slice(0, 8);
      packetId.current += 1;
      setPackets((p) => [{ id: packetId.current, t, line }, ...p].slice(0, 14));
    }, running ? 550 : 1300);

    const lat = setInterval(() => {
      setLatencies(() => Object.fromEntries(
        CRAWLERS.map((c) => [c.name, Math.floor(28 + Math.random() * (running ? 180 : 90))])
      ));
    }, 1500);

    return () => { clearInterval(clock); clearInterval(trafficTick); clearInterval(counters); clearInterval(pkts); clearInterval(lat); };
  }, [running]);

  function start() { setLog([]); setStep(-1); setRunning(true); }
  function stop() { setRunning(false); }

  const trafficPath = useMemo(() => {
    const w = 100, h = 100, n = traffic.length;
    return traffic.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (n - 1)) * w} ${h - v}`).join(" ");
  }, [traffic]);

  const trafficArea = useMemo(() => `${trafficPath} L 100 100 L 0 100 Z`, [trafficPath]);

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] mono uppercase tracking-[0.2em] text-destructive">Red Team Mode</div>
            <h1 className="text-2xl font-bold mt-1">Live Attack Simulation</h1>
            <p className="text-sm text-muted-foreground">Trigger a simulated piracy upload and observe the SportDNA detection pipeline end-to-end.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-[10px] mono text-muted-foreground border border-border rounded-md px-3 py-2 bg-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              SOC · {now ? now.toUTCString().slice(17, 25) : "--:--:--"} UTC
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <span className="text-muted-foreground mono">SIMULATION</span>
              <span className={`relative w-12 h-6 rounded-full transition-colors ${running ? "bg-destructive glow-red" : "bg-white/10"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${running ? "translate-x-6" : "translate-x-0.5"}`} />
              </span>
            </label>
            {!running ? (
              <button onClick={start} className="flex items-center gap-2 text-sm px-4 py-2 rounded-md gradient-alert text-white font-semibold glow-red">
                <Play className="w-4 h-4" /> Launch Attack
              </button>
            ) : (
              <button onClick={stop} className="flex items-center gap-2 text-sm px-4 py-2 rounded-md border border-border hover:bg-white/5">
                <Square className="w-4 h-4" /> Stop
              </button>
            )}
          </div>
        </header>

        {/* Live monitoring KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI label="ASSETS SCANNED / 24H" value={scanned.toLocaleString()} tone="primary" Icon={Activity} pulse={running} />
          <KPI label="ACTIVE THREATS" value={threats.toLocaleString()} tone="destructive" Icon={AlertOctagon} pulse />
          <KPI label="TAKEDOWNS DISPATCHED" value={blocked.toLocaleString()} tone="success" Icon={Shield} pulse={running} />
          <KPI label="EDGE BANDWIDTH" value={`${Math.round(bandwidth)} Mb/s`} tone="primary" Icon={Wifi} pulse={running} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass rounded-xl p-6 relative overflow-hidden min-h-[420px] scanline">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="flex items-center justify-between relative">
              <h3 className="text-sm font-semibold">DETECTION PIPELINE</h3>
              <span className="text-[10px] mono text-muted-foreground">
                {running ? <span className="text-destructive">● LIVE</span> : <span className="text-success">● IDLE</span>}
              </span>
            </div>
            <div className="mt-6 space-y-3 relative">
              {STEPS.map((s, i) => {
                const active = step === i && running;
                const done = step > i || (!running && step === STEPS.length - 1 && i <= step);
                const Icon = s.Icon;
                const tone = s.tone === "destructive" ? "text-destructive border-destructive/40" :
                             s.tone === "success" ? "text-success border-success/40" :
                             "text-primary border-primary/40";
                return (
                  <div key={s.id} className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                    active ? `${tone} bg-white/5 scale-[1.01]` :
                    done ? "border-success/30 bg-success/5 text-success" :
                    "border-border text-muted-foreground"
                  }`}>
                    <div className={`relative w-10 h-10 rounded-md grid place-items-center border ${active || done ? tone : "border-border"}`}>
                      <Icon className="w-4 h-4" />
                      {active && <span className="absolute inset-0 rounded-md animate-pulse-ring" style={{ background: "currentColor", opacity: 0.25 }} />}
                    </div>
                    <div className="flex-1 text-sm">{s.label}</div>
                    <div className="text-[10px] mono">
                      {done ? "OK" : active ? "RUNNING…" : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <h3 className="text-sm font-semibold">SOC LOG</h3>
              <span className="ml-auto text-[10px] mono text-muted-foreground">{log.length} events</span>
            </div>
            <div className="space-y-1.5 max-h-96 overflow-auto">
              {log.length === 0 && (
                <div className="text-xs text-muted-foreground mono">// awaiting attack…</div>
              )}
              {log.map((l, i) => (
                <div key={i} className="animate-float-up flex gap-2 text-xs mono">
                  <span className="text-muted-foreground">{l.t}</span>
                  <span className={
                    l.tone === "destructive" ? "text-destructive" :
                    l.tone === "success" ? "text-success" : "text-primary"
                  }>{l.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Network + crawlers + packet stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Network throughput */}
          <div className="glass rounded-xl p-4 lg:col-span-2 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">NETWORK THROUGHPUT</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px] mono text-muted-foreground">
                <span>peak <span className="text-primary">{Math.max(...traffic).toFixed(0)}</span></span>
                <span>avg <span className="text-primary">{(traffic.reduce((a, b) => a + b, 0) / traffic.length).toFixed(0)}</span></span>
                <span>{running ? <span className="text-destructive">▲ surge</span> : <span className="text-success">stable</span>}</span>
              </div>
            </div>
            <div className="relative h-44">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="trafficFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.17 70)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="oklch(0.78 0.17 70)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[20, 40, 60, 80].map((y) => (
                  <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="oklch(1 0 0 / 0.06)" strokeWidth="0.2" />
                ))}
                <path d={trafficArea} fill="url(#trafficFill)" />
                <path d={trafficPath} fill="none" stroke="oklch(0.78 0.17 70)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="absolute top-1 right-1 text-[10px] mono text-primary">{Math.round(bandwidth)} Mb/s</div>
            </div>
          </div>

          {/* Crawler fleet */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">CRAWLER FLEET</h3>
              <span className="ml-auto text-[10px] mono text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> {CRAWLERS.length} ONLINE
              </span>
            </div>
            <ul className="space-y-2">
              {CRAWLERS.map((c) => {
                const lat = latencies[c.name] ?? 0;
                const tone = lat < 80 ? "text-success" : lat < 150 ? "text-primary" : "text-destructive";
                return (
                  <li key={c.name} className="flex items-center gap-3 text-xs">
                    <c.Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-[10px] mono text-muted-foreground">{c.region}</div>
                    </div>
                    <div className={`mono text-[10px] ${tone}`}>{lat}ms</div>
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Packet stream */}
        <div className="glass rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="flex items-center gap-2 mb-3 relative">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-sm font-semibold">PACKET STREAM · tcpdump -i edge0</h3>
            <span className="ml-auto text-[10px] mono text-muted-foreground">{packets.length}/14 buffered</span>
          </div>
          <div className="space-y-1 relative max-h-64 overflow-hidden">
            {packets.length === 0 && (
              <div className="text-xs text-muted-foreground mono">// listening…</div>
            )}
            {packets.map((p) => (
              <div key={p.id} className="animate-float-up flex gap-3 text-[11px] mono">
                <span className="text-muted-foreground">{p.t}</span>
                <span className="text-primary/60">edge0</span>
                <span className="text-foreground/85 truncate">{p.line}</span>
              </div>
            ))}
          </div>
        </div>

        <GuardianAgent
          live={step >= STEPS.length - 1}
          scenario="alert_feed"
          payload={{
            pipelineStage: STEPS[Math.max(0, Math.min(step, STEPS.length - 1))]?.label ?? "idle",
            stepIndex: step,
            totalSteps: STEPS.length,
            recentAlerts: log.slice(0, 5).map((l) => l.m),
            stats: { threats, scanned, blocked, bandwidthMbps: Math.round(bandwidth) },
            crawlerLatencyMs: latencies,
          }}
          message="Simulation mode active. Pipeline detected the pirated upload in 4.2s end-to-end."
        />
      </div>
    </AppShell>
  );
}

function KPI({ label, value, tone, Icon, pulse }: { label: string; value: string; tone: "primary" | "destructive" | "success"; Icon: React.ComponentType<{ className?: string }>; pulse?: boolean }) {
  const c = tone === "destructive" ? "text-destructive border-destructive/30" : tone === "success" ? "text-success border-success/30" : "text-primary border-primary/30";
  return (
    <div className={`glass rounded-xl p-3 border ${c} relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] mono text-muted-foreground tracking-wider">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${c.split(" ")[0]}`} />
      </div>
      <div className={`mt-1 text-xl font-bold mono ${c.split(" ")[0]}`}>{value}</div>
      {pulse && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-current opacity-40 animate-pulse" />}
    </div>
  );
}
