import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DETECTIONS } from "@/lib/mockData";
import { GuardianAgent } from "@/components/GuardianAgent";
import { Eye, Send, Flag } from "lucide-react";

export const Route = createFileRoute("/detection")({
  head: () => ({
    meta: [
      { title: "Piracy Detection · SportDNA" },
      { name: "description", content: "AI-detected unauthorized uploads of protected sports media across TikTok, Telegram, YouTube and more." },
      { property: "og:title", content: "Piracy Detection · SportDNA" },
      { property: "og:description", content: "AI-detected unauthorized sports media uploads with confidence scoring." },
    ],
  }),
  component: DetectionPage,
});

function DetectionPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="text-[11px] mono uppercase tracking-[0.2em] text-primary">Detection Engine</div>
          <h1 className="text-2xl font-bold mt-1">Unauthorized Uploads Detected</h1>
          <p className="text-sm text-muted-foreground">AI-matched copies across monitored platforms. Take action directly from the console.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DETECTIONS.map((d) => (
            <article key={d.id} className="glass rounded-xl p-4 hover:border-primary/40 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md grid place-items-center text-2xl bg-white/5 border border-border">{d.thumbnail}</div>
                  <div>
                    <div className="text-sm font-semibold">{d.platform}</div>
                    <div className="text-[10px] mono text-muted-foreground">{d.account} · {d.uploaded}</div>
                  </div>
                </div>
                <span className={`text-[10px] mono px-2 py-1 rounded ${d.confidence >= 95 ? "bg-destructive/15 text-destructive border border-destructive/40" : "bg-primary/15 text-primary border border-primary/40"}`}>
                  {d.confidence}% MATCH
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-md bg-white/5 border border-border p-2">
                  <dt className="text-[10px] mono text-muted-foreground">CLIP LEN</dt>
                  <dd className="font-bold mono">{d.clipLength}</dd>
                </div>
                <div className="rounded-md bg-white/5 border border-border p-2">
                  <dt className="text-[10px] mono text-muted-foreground">VIEWS</dt>
                  <dd className="font-bold mono">{d.views}</dd>
                </div>
                <div className="rounded-md bg-white/5 border border-border p-2">
                  <dt className="text-[10px] mono text-muted-foreground">RISK</dt>
                  <dd className="font-bold mono text-destructive">{d.confidence >= 95 ? "HIGH" : "MED"}</dd>
                </div>
              </dl>

              <div className="mt-2">
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full gradient-amber" style={{ width: `${d.confidence}%` }} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-1 text-[11px] px-2 py-2 rounded-md border border-border hover:border-primary/50 hover:bg-white/5">
                  <Eye className="w-3.5 h-3.5" /> Evidence
                </button>
                <button className="flex items-center justify-center gap-1 text-[11px] px-2 py-2 rounded-md gradient-amber text-primary-foreground font-semibold glow-amber">
                  <Send className="w-3.5 h-3.5" /> Takedown
                </button>
                <button className="flex items-center justify-center gap-1 text-[11px] px-2 py-2 rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10">
                  <Flag className="w-3.5 h-3.5" /> Flag
                </button>
              </div>
            </article>
          ))}
        </div>

        <GuardianAgent message="Detection cluster suggests coordinated re-uploading by a single network. 4 of 6 accounts share device fingerprints. Recommend bulk takedown + register accounts as repeat infringers." />
      </div>
    </AppShell>
  );
}
