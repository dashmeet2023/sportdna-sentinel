import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { Play, Square, Radar, Fingerprint, Shield, AlertOctagon, CheckCircle2 } from "lucide-react";
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

function SimPage() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [log, setLog] = useState<{ t: string; m: string; tone: string }[]>([]);

  useEffect(() => {
    if (!running) return;
    if (step >= STEPS.length - 1) { setRunning(false); return; }
    const id = setTimeout(() => {
      const next = step + 1;
      const s = STEPS[next];
      const now = new Date().toTimeString().slice(0, 8);
      setLog((l) => [{ t: now, m: s.label, tone: s.tone }, ...l].slice(0, 30));
      setStep(next);
    }, 1100);
    return () => clearTimeout(id);
  }, [running, step]);

  function start() {
    setLog([]); setStep(-1); setRunning(true);
  }
  function stop() { setRunning(false); }

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass rounded-xl p-6 relative overflow-hidden min-h-[420px] scanline">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <h3 className="text-sm font-semibold relative">DETECTION PIPELINE</h3>
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

        <GuardianAgent message="Simulation mode active. Pipeline detected the pirated upload in 4.2s end-to-end. In production, takedown notices would be auto-dispatched to platform legal endpoints with attached DNA evidence and ownership certificate." />
      </div>
    </AppShell>
  );
}
