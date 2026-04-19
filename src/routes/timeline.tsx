import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TIMELINE } from "@/lib/mockData";
import { CheckCircle2, AlertTriangle, ShieldCheck, Radio } from "lucide-react";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Propagation Timeline · SportDNA" },
      { name: "description", content: "Minute-by-minute timeline of how a protected sports clip propagates across platforms." },
      { property: "og:title", content: "Propagation Timeline · SportDNA" },
      { property: "og:description", content: "Timeline of sports media propagation and takedown response." },
    ],
  }),
  component: TimelinePage,
});

const iconFor = {
  official: Radio,
  alert: AlertTriangle,
  critical: ShieldCheck,
  success: CheckCircle2,
} as const;

const toneFor = {
  official: "text-success border-success/40 bg-success/10",
  alert: "text-primary border-primary/40 bg-primary/10",
  critical: "text-destructive border-destructive/40 bg-destructive/10",
  success: "text-success border-success/40 bg-success/10",
} as const;

function TimelinePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="text-[11px] mono uppercase tracking-[0.2em] text-primary">Forensic Timeline</div>
          <h1 className="text-2xl font-bold mt-1">Propagation Timeline · MID-77231</h1>
          <p className="text-sm text-muted-foreground">From official upload to detection, takedown, and resolution.</p>
        </header>

        <div className="glass rounded-xl p-6 relative">
          <div className="absolute left-[88px] top-6 bottom-6 w-px bg-gradient-to-b from-primary via-destructive to-success opacity-60" />
          <ol className="space-y-5 relative">
            {TIMELINE.map((e, i) => {
              const I = iconFor[e.kind];
              return (
                <li key={i} className="flex items-start gap-4 animate-float-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-16 mono text-xs text-muted-foreground pt-2 text-right">{e.t}</div>
                  <div className={`relative w-10 h-10 rounded-full grid place-items-center border ${toneFor[e.kind]}`}>
                    <I className="w-4 h-4" />
                    {e.kind !== "success" && <span className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: "currentColor", opacity: 0.2 }} />}
                  </div>
                  <div className="flex-1 glass rounded-lg p-3">
                    <div className="text-sm font-semibold">{e.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{e.detail}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}
