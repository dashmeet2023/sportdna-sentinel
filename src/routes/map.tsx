import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PropagationMap } from "@/components/PropagationMap";
import { GuardianAgent } from "@/components/GuardianAgent";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Propagation Map · SportDNA" },
      { name: "description", content: "Interactive global propagation map showing how sports media spreads across platforms and countries in real time." },
      { property: "og:title", content: "Propagation Map · SportDNA" },
      { property: "og:description", content: "Interactive global map of sports media piracy propagation." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="text-[11px] mono uppercase tracking-[0.2em] text-primary">Geo-Intelligence</div>
          <h1 className="text-2xl font-bold mt-1">Global Propagation Map</h1>
          <p className="text-sm text-muted-foreground">Trace how an official sports clip propagates across countries and platforms.</p>
        </header>
        <PropagationMap height={560} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">PROPAGATION CHAIN · MID-77231</h3>
            <div className="flex items-center gap-2 flex-wrap text-xs mono">
              {["Official Upload (UK)", "TikTok (US)", "Telegram (BR)", "YouTube (IN)", "Pirate Stream (RU)"].map((s, i, arr) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-md border ${i === 0 ? "border-success/40 text-success bg-success/5" : i === arr.length - 1 ? "border-destructive/40 text-destructive bg-destructive/5" : "border-primary/30 text-primary bg-primary/5"}`}>
                    {s}
                  </span>
                  {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ))}
            </div>
          </div>
          <GuardianAgent message="Propagation pattern matches known piracy network 'StreamMirror-EU'. Cluster originated 8 minutes after official upload. Recommended: pre-emptive takedowns on 4 mirror domains." />
        </div>
      </div>
    </AppShell>
  );
}
