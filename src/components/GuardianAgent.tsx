import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askGuardian, GUARDIAN_MODELS, DEFAULT_GUARDIAN_MODEL, type GuardianModel } from "@/server/guardian.functions";

interface Props {
  message?: string;
  scenario?: "dna_analysis" | "alert_feed" | "takedown_summary" | "propagation";
  payload?: Record<string, unknown>;
  /** When true, fetch live AI commentary instead of using `message`. */
  live?: boolean;
}

const FALLBACK = "This clip appears to be an edited version of official Premier League match footage. Frame-level DNA match against asset MID-77231. Confidence level: 96%. Recommended action: dispatch DMCA takedown to TikTok and flag uploader account.";

export function GuardianAgent({ message, scenario, payload, live = false }: Props) {
  const ask = useServerFn(askGuardian);
  const [text, setText] = useState<string>(message ?? FALLBACK);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [model, setModel] = useState<GuardianModel>(DEFAULT_GUARDIAN_MODEL);

  // Stable key to refetch when payload or model meaningfully changes
  const key = live && scenario ? scenario + ":" + model + ":" + JSON.stringify(payload ?? {}) : null;

  async function fetchLive() {
    if (!live || !scenario) return;
    setLoading(true); setErrored(false);
    try {
      const res = await ask({ data: { scenario, payload: payload ?? {}, model } });
      setText(res.text);
      setErrored(!!res.error);
    } catch (e) {
      console.error(e);
      setText("Guardian unreachable.");
      setErrored(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (key !== null) void fetchLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Sync external static message changes
  useEffect(() => {
    if (!live && message) setText(message);
  }, [live, message]);

  return (
    <div className="glass rounded-xl p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="flex items-center gap-2 mb-3 relative">
        <div className="w-8 h-8 rounded-md gradient-amber grid place-items-center glow-amber">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <div className="text-sm font-semibold">SportDNA Guardian</div>
          <div className="text-[10px] mono text-muted-foreground">
            {live ? "GEMINI · LOVABLE AI" : "AI ANALYST"} · {loading ? "ANALYZING" : errored ? "DEGRADED" : "ONLINE"}
          </div>
        </div>
        <span className="ml-auto flex items-center gap-2">
          {live && (
            <button
              onClick={fetchLive}
              disabled={loading}
              className="text-[10px] mono text-primary hover:opacity-80 inline-flex items-center gap-1 disabled:opacity-40"
              title="Re-ask Guardian"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? "thinking" : "refresh"}
            </button>
          )}
          {errored ? (
            <span className="text-[10px] mono text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> ERROR
            </span>
          ) : (
            <span className="text-[10px] mono text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> {loading ? "THINKING" : "READY"}
            </span>
          )}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90 relative whitespace-pre-wrap">{text}</p>
    </div>
  );
}
