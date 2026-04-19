import { useState } from "react";
import { Brain, TrendingUp } from "lucide-react";

export function RiskPredictionPanel() {
  const [confidence] = useState(91);
  const [views] = useState(5);

  return (
    <div className="glass rounded-xl p-4 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-md bg-destructive/15 border border-destructive/40 grid place-items-center glow-red">
          <Brain className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">AI RISK PREDICTION</h3>
          <p className="text-[10px] mono text-muted-foreground">VIRALITY FORECAST · NEXT 2H</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center gap-2 text-destructive">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold mono uppercase tracking-wider">High Spread Predicted</span>
          </div>
          <p className="mt-2 text-sm leading-snug">
            This clip may reach <span className="text-destructive font-bold mono">{views}M</span> illegal views within 2 hours across TikTok and Telegram.
          </p>
        </div>

        <div>
          <div className="flex justify-between text-[10px] mono text-muted-foreground mb-1">
            <span>MODEL CONFIDENCE</span>
            <span className="text-foreground">{confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full gradient-amber glow-amber" style={{ width: `${confidence}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { l: "VELOCITY", v: "+412%" },
            { l: "PLATFORMS", v: "7" },
            { l: "MIRRORS", v: "23" },
          ].map((s) => (
            <div key={s.l} className="rounded-md bg-white/5 border border-border p-2 text-center">
              <div className="text-[9px] mono text-muted-foreground">{s.l}</div>
              <div className="text-sm font-bold mono text-primary">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
