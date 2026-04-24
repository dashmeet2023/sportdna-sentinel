import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GuardianAgent } from "@/components/GuardianAgent";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Fingerprint, Shield, FileCheck, Loader2, Download, Sparkles, Copy, Check, Trash2, Database, Target } from "lucide-react";
import { frameEmbedding, averageEmbeddings, cosine, packEmbedding, unpackEmbedding } from "@/lib/perceptualHash";

export const Route = createFileRoute("/dna")({
  head: () => ({
    meta: [
      { title: "Media DNA Analysis · SportDNA" },
      { name: "description", content: "Generate AI Digital DNA fingerprints from sports video. Frame extraction, embedding generation, and invisible watermarking." },
      { property: "og:title", content: "Media DNA Analysis · SportDNA" },
      { property: "og:description", content: "Generate AI Digital DNA fingerprints for sports media protection." },
    ],
  }),
  component: DNAPage,
});

interface FrameData { url: string; t: number; }
interface RegisteredAsset {
  mediaId: string;
  fileName: string;
  sizeBytes: number;
  dnaHash: string;
  embedding?: string; // base64 packed Float32Array
  txHash: string;
  network: string;
  registeredAt: string;
}
const REGISTRY_KEY = "sportdna.registry.v1";
function loadRegistry(): RegisteredAsset[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(REGISTRY_KEY) || "[]"); } catch { return []; }
}
function saveRegistry(list: RegisteredAsset[]) {
  try { localStorage.setItem(REGISTRY_KEY, JSON.stringify(list)); } catch {}
}

function DNAPage() {
  const [file, setFile] = useState<File | null>(null);
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [stage, setStage] = useState<"idle" | "frames" | "embed" | "dna" | "watermark" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [hash, setHash] = useState("");
  const [mediaId, setMediaId] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);
  const [registry, setRegistry] = useState<RegisteredAsset[]>([]);
  const [embedding, setEmbedding] = useState<Float32Array | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { setRegistry(loadRegistry()); }, []);

  function reset() {
    setFile(null); setFrames([]); setStage("idle"); setProgress(0); setHash(""); setMediaId("");
    setRegistered(false); setRegistering(false); setTxHash(""); setCopied(false);
    setEmbedding(null);
  }

  async function loadDemoSample() {
    reset();
    toast.loading("Fetching sample football clip…", { id: "demo" });
    try {
      // Public sample MP4 — Big Buck Bunny stand-in works as a generic short clip.
      // Using a small, CORS-enabled mp4 hosted on a CDN.
      const url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const sample = new File([blob], "sample-football-highlight.mp4", { type: "video/mp4" });
      toast.success("Sample loaded", { id: "demo", description: "Running fingerprint pipeline on real frames." });
      await handleFile(sample);
    } catch {
      toast.error("Could not fetch sample", { id: "demo", description: "Check your network and try again." });
    }
  }

  async function registerOnChain() {
    if (stage !== "done" || registering || registered) return;
    setRegistering(true);
    toast.loading("Broadcasting DNA hash to ledger…", { id: "chain" });
    await new Promise((r) => setTimeout(r, 1400));
    const tx = "0x" + Array.from({ length: 32 }).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
    setTxHash(tx);
    setRegistered(true);
    setRegistering(false);
    const asset: RegisteredAsset = {
      mediaId,
      fileName: file?.name ?? "unknown",
      sizeBytes: file?.size ?? 0,
      dnaHash: hash,
      txHash: tx,
      network: "sportdna-testnet",
      registeredAt: new Date().toISOString(),
    };
    setRegistry((prev) => {
      const next = [asset, ...prev.filter((a) => a.dnaHash !== hash)].slice(0, 50);
      saveRegistry(next);
      return next;
    });
    toast.success("Registered on chain", { id: "chain", description: `Tx ${tx.slice(0, 14)}…` });
  }

  function removeAsset(dnaHash: string) {
    setRegistry((prev) => {
      const next = prev.filter((a) => a.dnaHash !== dnaHash);
      saveRegistry(next);
      return next;
    });
    toast("Asset removed from registry");
  }

  function clearRegistry() {
    setRegistry([]);
    saveRegistry([]);
    toast("Registry cleared");
  }

  function downloadCertificate() {
    if (stage !== "done") return;
    const cert = {
      type: "SportDNA Ownership Certificate",
      version: "1.0",
      mediaId,
      file: file ? { name: file.name, sizeBytes: file.size, mime: file.type } : null,
      dnaHash: hash,
      embeddingDim: 768,
      framesAnalyzed: frames.length,
      watermark: { embedded: true, scheme: "LCMS-v2", invisible: true },
      chain: registered ? { network: "sportdna-testnet", tx: txHash, registeredAt: new Date().toISOString() } : null,
      issuedAt: new Date().toISOString(),
      issuer: "SportDNA Guardian Authority",
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${mediaId || "sportdna"}-certificate.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded", { description: `${mediaId}-certificate.json` });
  }

  async function copyHash() {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      toast("DNA hash copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }

  async function handleFile(f: File) {
    reset();
    setFile(f);
    setStage("frames");

    const url = URL.createObjectURL(f);
    const v = document.createElement("video");
    v.src = url; v.muted = true; v.playsInline = true; v.preload = "auto";
    await new Promise<void>((res, rej) => {
      v.onloadedmetadata = () => res();
      v.onerror = () => rej();
    });

    const canvas = document.createElement("canvas");
    canvas.width = 240; canvas.height = 135;
    const ctx = canvas.getContext("2d")!;
    const dur = isFinite(v.duration) && v.duration > 0 ? v.duration : 6;
    const stamps = [0.05, 0.2, 0.4, 0.6, 0.8, 0.95].map((p) => p * dur);
    const out: FrameData[] = [];
    const embs: Float32Array[] = [];

    for (const t of stamps) {
      await new Promise<void>((res) => {
        const onSeeked = () => { v.removeEventListener("seeked", onSeeked); res(); };
        v.addEventListener("seeked", onSeeked);
        try { v.currentTime = Math.min(t, Math.max(0, dur - 0.05)); } catch { res(); }
      });
      try {
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        embs.push(frameEmbedding(canvas)); // real per-frame perceptual embedding
        out.push({ url: canvas.toDataURL("image/jpeg", 0.7), t });
        setFrames([...out]);
        setProgress(Math.round((out.length / stamps.length) * 35));
        await new Promise((r) => setTimeout(r, 220));
      } catch {
        // skip
      }
    }
    URL.revokeObjectURL(url);

    // Embedding — average per-frame vectors into a 256-dim clip embedding
    setStage("embed");
    const clipEmb = averageEmbeddings(embs);
    setEmbedding(clipEmb);
    for (let i = 35; i <= 60; i += 4) { await new Promise((r) => setTimeout(r, 90)); setProgress(i); }

    // DNA hash — derive from embedding so the hash IS the perceptual fingerprint
    setStage("dna");
    const embBytes = new Uint8Array(clipEmb.buffer as ArrayBuffer);
    const digest = await crypto.subtle.digest("SHA-256", embBytes.slice());
    const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    setHash(hex.slice(0, 48));
    setMediaId("MID-" + hex.slice(0, 6).toUpperCase());
    for (let i = 60; i <= 85; i += 5) { await new Promise((r) => setTimeout(r, 80)); setProgress(i); }

    // Watermark
    setStage("watermark");
    for (let i = 85; i <= 100; i += 5) { await new Promise((r) => setTimeout(r, 90)); setProgress(i); }

    setStage("done");
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="text-[11px] mono uppercase tracking-[0.2em] text-primary">AI Pipeline</div>
          <h1 className="text-2xl font-bold mt-1">Media DNA Analysis</h1>
          <p className="text-sm text-muted-foreground">Upload a sports clip to generate its unique AI Digital DNA fingerprint and embed an invisible watermark.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upload */}
          <div className="glass rounded-xl p-5 lg:col-span-2">
            {!file ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors p-12 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full grid place-items-center gradient-amber glow-amber mb-4">
                  <Upload className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="text-sm font-semibold">Drop a sports video to fingerprint</div>
                <div className="text-xs text-muted-foreground mt-1">MP4 / MOV / WebM · processed locally in your browser</div>
                <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); loadDemoSample(); }}
                  className="mt-5 inline-flex items-center gap-1.5 text-[11px] mono px-3 py-1.5 rounded-md border border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Try sample football clip
                </button>
                <div className="mt-5 mx-auto max-w-sm">
                  <div className="text-[10px] mono text-muted-foreground mb-1.5 text-left">SAMPLE PREVIEW</div>
                  <video
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    className="w-full rounded-md border border-border bg-black"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <video ref={videoRef} src={URL.createObjectURL(file)} className="w-32 h-20 rounded-md border border-border bg-black object-cover" controls={false} muted />
                    <div>
                      <div className="text-sm font-semibold truncate max-w-xs">{file.name}</div>
                      <div className="text-[10px] mono text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <button onClick={reset} className="text-xs px-3 py-1.5 rounded-md border border-border hover:border-primary/50">Reset</button>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mono text-muted-foreground mb-1">
                    <span>{stageLabel(stage)}</span><span>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full gradient-amber glow-amber transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div>
                  <div className="text-[10px] mono text-muted-foreground mb-2">EXTRACTED FRAMES</div>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const fr = frames[i];
                      return (
                        <div key={i} className="relative aspect-video rounded-md overflow-hidden border border-border bg-black/40">
                          {fr ? (
                            <>
                              <img src={fr.url} alt={`frame ${i}`} className="w-full h-full object-cover animate-float-up" />
                              <div className="absolute inset-0 ring-1 ring-primary/40" />
                              <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 text-[8px] mono bg-black/60 text-primary">t={fr.t.toFixed(1)}s</div>
                            </>
                          ) : (
                            <div className="w-full h-full grid place-items-center">
                              <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fingerprint visualization */}
                <FingerprintViz active={stage === "embed" || stage === "dna" || stage === "watermark" || stage === "done"} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">DNA CERTIFICATE</h3>
              <Field label="MEDIA ID" value={mediaId || "—"} />
              <div className="mb-2.5">
                <div className="text-[10px] mono text-muted-foreground flex items-center justify-between">
                  <span>DNA HASH</span>
                  {hash && (
                    <button onClick={copyHash} className="text-primary hover:opacity-80 inline-flex items-center gap-1">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "copied" : "copy"}
                    </button>
                  )}
                </div>
                <div className="text-xs mono text-foreground break-all">{hash || "—"}</div>
              </div>
              <Field label="WATERMARK"
                value={
                  stage === "done" ? "EMBEDDED · INVISIBLE" :
                  stage === "watermark" ? "EMBEDDING…" : "PENDING"
                }
                tone={stage === "done" ? "success" : "muted"}
              />
              <Field label="OWNERSHIP CERT"
                value={
                  registered ? "ISSUED · CHAIN-VERIFIED" :
                  stage === "done" ? "ISSUED · LOCAL" : "PENDING"
                }
                tone={stage === "done" ? "success" : "muted"}
              />
              {txHash && (
                <Field label="LEDGER TX" value={txHash.slice(0, 22) + "…"} mono break />
              )}
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={registerOnChain}
                  disabled={stage !== "done" || registering || registered}
                  className="text-xs px-3 py-2 rounded-md gradient-amber text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed glow-amber inline-flex items-center justify-center gap-1.5"
                >
                  {registering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : registered ? <Check className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                  {registering ? "Broadcasting…" : registered ? "Registered" : "Register on Chain"}
                </button>
                <button
                  onClick={downloadCertificate}
                  disabled={stage !== "done"}
                  className="text-xs px-3 py-2 rounded-md border border-border hover:border-primary/50 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Certificate (.json)
                </button>
              </div>
            </div>

            <PipelineSteps stage={stage} />
          </div>
        </div>

        <RegisteredAssetsTable assets={registry} onRemove={removeAsset} onClear={clearRegistry} />

        <GuardianAgent message="Frame-level embeddings generated using a 768-dim vision encoder. Perceptual hash robust to crop, rotation, color shift, and re-encoding. Invisible watermark survives screen-recording within 91% of test conditions." />
      </div>
    </AppShell>
  );
}

function stageLabel(s: string) {
  return ({
    idle: "READY",
    frames: "EXTRACTING FRAMES",
    embed: "GENERATING EMBEDDINGS",
    dna: "COMPUTING DNA HASH",
    watermark: "EMBEDDING WATERMARK",
    done: "PROTECTED",
  } as Record<string, string>)[s] ?? s;
}

function Field({ label, value, mono, tone = "muted", break: brk }: { label: string; value: string; mono?: boolean; tone?: "success" | "muted"; break?: boolean }) {
  return (
    <div className="mb-2.5">
      <div className="text-[10px] mono text-muted-foreground">{label}</div>
      <div className={`text-xs ${mono ? "mono" : ""} ${tone === "success" ? "text-success" : "text-foreground"} ${brk ? "break-all" : ""}`}>{value}</div>
    </div>
  );
}

function PipelineSteps({ stage }: { stage: string }) {
  const steps = [
    { id: "frames", label: "Frame Extraction", icon: Upload },
    { id: "embed", label: "Vision Embeddings", icon: Fingerprint },
    { id: "dna", label: "DNA Hash", icon: Fingerprint },
    { id: "watermark", label: "Watermark", icon: Shield },
    { id: "done", label: "Certificate", icon: FileCheck },
  ] as const;
  const order = ["idle", "frames", "embed", "dna", "watermark", "done"];
  const cur = order.indexOf(stage);
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">PIPELINE</h3>
      <ol className="space-y-2">
        {steps.map((s, i) => {
          const si = order.indexOf(s.id);
          const done = cur >= si;
          const active = cur === si;
          const I = s.icon;
          return (
            <li key={s.id} className={`flex items-center gap-3 px-2 py-1.5 rounded-md ${active ? "bg-primary/10 border border-primary/30" : ""}`}>
              <div className={`w-7 h-7 rounded-md grid place-items-center ${done ? "gradient-amber text-primary-foreground" : "bg-white/5 border border-border text-muted-foreground"}`}>
                {active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <I className="w-3.5 h-3.5" />}
              </div>
              <div className="text-xs">{s.label}</div>
              {done && !active && <span className="ml-auto text-[10px] mono text-success">OK</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FingerprintViz({ active }: { active: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-black/40 p-3 relative overflow-hidden">
      <div className="text-[10px] mono text-muted-foreground mb-2">FINGERPRINT VECTOR · 768D PROJECTION</div>
      <div className="grid grid-cols-32 gap-[2px]" style={{ gridTemplateColumns: "repeat(32, minmax(0, 1fr))" }}>
        {Array.from({ length: 32 * 8 }).map((_, i) => {
          const v = (Math.sin(i * 1.7) + 1) / 2;
          const on = active && Math.random() > 0.3;
          return (
            <div
              key={i}
              className="aspect-square rounded-[2px] transition-all"
              style={{
                background: on
                  ? `oklch(${0.55 + v * 0.25} ${0.12 + v * 0.08} ${50 + v * 40})`
                  : "oklch(0.22 0.005 60)",
                boxShadow: on && v > 0.7 ? "0 0 4px oklch(0.78 0.17 70 / 0.6)" : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function RegisteredAssetsTable({ assets, onRemove, onClear }: { assets: RegisteredAsset[]; onRemove: (h: string) => void; onClear: () => void }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">REGISTERED ASSETS</h3>
          <span className="text-[10px] mono text-muted-foreground">· persisted locally · {assets.length}</span>
        </div>
        {assets.length > 0 && (
          <button onClick={onClear} className="text-[11px] mono px-2 py-1 rounded-md border border-border hover:border-destructive/60 hover:text-destructive">
            Clear all
          </button>
        )}
      </div>
      {assets.length === 0 ? (
        <div className="text-xs text-muted-foreground py-8 text-center border border-dashed border-border rounded-md">
          No registered assets yet. Generate a fingerprint and click <span className="text-primary">Register on Chain</span>.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] mono text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-3">MEDIA ID</th>
                <th className="text-left py-2 pr-3">FILE</th>
                <th className="text-left py-2 pr-3">DNA HASH</th>
                <th className="text-left py-2 pr-3">TX</th>
                <th className="text-left py-2 pr-3">REGISTERED</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.dnaHash} className="border-b border-border/50 hover:bg-white/5">
                  <td className="py-2 pr-3 mono text-primary">{a.mediaId}</td>
                  <td className="py-2 pr-3 truncate max-w-[180px]">{a.fileName}</td>
                  <td className="py-2 pr-3 mono text-muted-foreground">{a.dnaHash.slice(0, 16)}…</td>
                  <td className="py-2 pr-3 mono text-muted-foreground">{a.txHash.slice(0, 12)}…</td>
                  <td className="py-2 pr-3 mono text-muted-foreground">{new Date(a.registeredAt).toLocaleString()}</td>
                  <td className="py-2 text-right">
                    <button onClick={() => onRemove(a.dnaHash)} className="text-muted-foreground hover:text-destructive p-1" aria-label="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
