import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { DETECTIONS, type Detection } from "@/lib/mockData";
import { GuardianAgent } from "@/components/GuardianAgent";
import { Eye, Send, Flag, Check, Loader2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

type TakedownState = "idle" | "sending" | "sent";

function DetectionPage() {
  const [takedowns, setTakedowns] = useState<Record<string, TakedownState>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [evidenceFor, setEvidenceFor] = useState<Detection | null>(null);

  const dispatchTakedown = (d: Detection) => {
    if (takedowns[d.id] === "sending" || takedowns[d.id] === "sent") return;
    setTakedowns((t) => ({ ...t, [d.id]: "sending" }));
    const ticketId = `T-${Math.floor(9000 + Math.random() * 999)}`;
    toast.loading(`Dispatching DMCA to ${d.platform}…`, { id: d.id });
    setTimeout(() => {
      setTakedowns((t) => ({ ...t, [d.id]: "sent" }));
      toast.success(`Takedown ${ticketId} sent`, {
        id: d.id,
        description: `${d.platform} · ${d.account} — clip queued for removal.`,
      });
    }, 1200);
  };

  const toggleFlag = (d: Detection) => {
    setFlagged((f) => {
      const next = !f[d.id];
      if (next) {
        toast(`Flagged ${d.account}`, {
          icon: <Flag className="w-4 h-4 text-destructive" />,
          description: `${d.platform} account added to repeat-infringer watchlist.`,
        });
      } else {
        toast(`Removed flag from ${d.account}`);
      }
      return { ...f, [d.id]: next };
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="text-[11px] mono uppercase tracking-[0.2em] text-primary">Detection Engine</div>
          <h1 className="text-2xl font-bold mt-1">Unauthorized Uploads Detected</h1>
          <p className="text-sm text-muted-foreground">AI-matched copies across monitored platforms. Take action directly from the console.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DETECTIONS.map((d) => {
            const tState = takedowns[d.id] ?? "idle";
            const isFlagged = !!flagged[d.id];
            return (
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

                {(tState === "sent" || isFlagged) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tState === "sent" && (
                      <span className="text-[9px] mono px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/40">
                        TAKEDOWN DISPATCHED
                      </span>
                    )}
                    {isFlagged && (
                      <span className="text-[9px] mono px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/40">
                        FLAGGED · WATCHLIST
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEvidenceFor(d)}
                    className="flex items-center justify-center gap-1 text-[11px] px-2 py-2 rounded-md border border-border hover:border-primary/50 hover:bg-white/5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Evidence
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatchTakedown(d)}
                    disabled={tState !== "idle"}
                    className="flex items-center justify-center gap-1 text-[11px] px-2 py-2 rounded-md gradient-amber text-primary-foreground font-semibold glow-amber disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {tState === "sending" ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                    ) : tState === "sent" ? (
                      <><Check className="w-3.5 h-3.5" /> Sent</>
                    ) : (
                      <><Send className="w-3.5 h-3.5" /> Takedown</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFlag(d)}
                    aria-pressed={isFlagged}
                    className={`flex items-center justify-center gap-1 text-[11px] px-2 py-2 rounded-md border transition-colors ${
                      isFlagged
                        ? "bg-destructive/20 text-destructive border-destructive/60"
                        : "border-destructive/40 text-destructive hover:bg-destructive/10"
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" /> {isFlagged ? "Flagged" : "Flag"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <GuardianAgent
          live
          scenario="alert_feed"
          payload={{
            totalDetections: DETECTIONS.length,
            byPlatform: DETECTIONS.reduce((acc, d) => { acc[d.platform] = (acc[d.platform] ?? 0) + 1; return acc; }, {} as Record<string, number>),
            highestConfidence: Math.max(...DETECTIONS.map((d) => d.confidence)),
            samples: DETECTIONS.slice(0, 4).map((d) => ({ platform: d.platform, account: d.account, confidence: d.confidence, views: d.views })),
          }}
          message="Detection cluster suggests coordinated re-uploading by a single network."
        />
      </div>

      <Dialog open={!!evidenceFor} onOpenChange={(o) => !o && setEvidenceFor(null)}>
        <DialogContent className="glass-strong max-w-lg border-primary/40">
          {evidenceFor && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  <DialogTitle className="text-sm tracking-wide">DNA EVIDENCE · {evidenceFor.platform}</DialogTitle>
                </div>
                <DialogDescription className="text-xs">
                  Frame-level fingerprint match for {evidenceFor.account}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-2 text-[11px] mono">
                  <div className="rounded-md bg-white/5 border border-border p-2">
                    <div className="text-muted-foreground">ASSET ID</div>
                    <div className="font-bold">MID-{77000 + parseInt(evidenceFor.id.replace(/\D/g, "")) * 31}</div>
                  </div>
                  <div className="rounded-md bg-white/5 border border-border p-2">
                    <div className="text-muted-foreground">CONFIDENCE</div>
                    <div className="font-bold text-primary">{evidenceFor.confidence}%</div>
                  </div>
                  <div className="rounded-md bg-white/5 border border-border p-2">
                    <div className="text-muted-foreground">CLIP LENGTH</div>
                    <div className="font-bold">{evidenceFor.clipLength}</div>
                  </div>
                  <div className="rounded-md bg-white/5 border border-border p-2">
                    <div className="text-muted-foreground">VIEWS</div>
                    <div className="font-bold">{evidenceFor.views}</div>
                  </div>
                </div>

                <div className="rounded-md bg-white/5 border border-border p-3">
                  <div className="text-[10px] mono text-muted-foreground mb-1">FRAME HASH</div>
                  <code className="text-[10px] mono break-all text-primary/90">
                    sha256:{evidenceFor.id}-{Array.from({ length: 8 }).map(() => Math.floor(Math.random() * 16).toString(16)).join("")}…
                  </code>
                </div>

                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 rounded-sm"
                      style={{
                        background: `oklch(0.78 0.17 70 / ${0.15 + ((i * 37) % 80) / 100})`,
                      }}
                    />
                  ))}
                </div>
                <div className="text-[10px] mono text-muted-foreground text-center">
                  32-frame DNA signature · matched against asset library
                </div>
              </div>

              <DialogFooter className="mt-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEvidenceFor(null)}
                  className="text-[11px] px-3 py-2 rounded-md border border-border hover:bg-white/5"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatchTakedown(evidenceFor);
                    setEvidenceFor(null);
                  }}
                  className="text-[11px] px-3 py-2 rounded-md gradient-amber text-primary-foreground font-semibold glow-amber flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch Takedown
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
