import { useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert, Info, Zap } from "lucide-react";
import { Alert, randomAlert, seedAlerts, Severity } from "@/lib/mockData";

const sevConfig: Record<Severity, { color: string; Icon: typeof AlertTriangle; label: string }> = {
  low: { color: "text-muted-foreground border-border", Icon: Info, label: "LOW" },
  medium: { color: "text-warning border-warning/40", Icon: Zap, label: "MED" },
  high: { color: "text-primary border-primary/50", Icon: AlertTriangle, label: "HIGH" },
  critical: { color: "text-destructive border-destructive/60", Icon: ShieldAlert, label: "CRIT" },
};

export function ActivityFeed({ live = true, max = 12 }: { live?: boolean; max?: number }) {
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setAlerts((prev) => [randomAlert(), ...prev].slice(0, max));
    }, 2500);
    return () => clearInterval(id);
  }, [live, max]);

  return (
    <div className="glass rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse glow-red" />
          <h3 className="text-sm font-semibold tracking-wide">REAL-TIME ALERTS</h3>
        </div>
        <span className="text-[10px] mono text-muted-foreground">LIVE FEED</span>
      </div>
      <div className="flex-1 overflow-hidden space-y-1.5">
        {alerts.map((a) => {
          const c = sevConfig[a.severity];
          const I = c.Icon;
          return (
            <div
              key={a.id}
              className={`animate-float-up flex items-start gap-3 px-3 py-2 rounded-md bg-white/[0.02] border ${c.color} hover:bg-white/[0.05] transition-colors`}
            >
              <I className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] mono text-muted-foreground">
                  <span>{a.time}</span>
                  <span>·</span>
                  <span className="font-semibold text-foreground/80">{a.platform}</span>
                  <span>·</span>
                  <span>conf {a.confidence}%</span>
                </div>
                <div className="text-sm text-foreground truncate">{a.message}</div>
              </div>
              <span className={`text-[10px] mono font-bold px-1.5 py-0.5 rounded ${c.color} bg-current/10`}>
                {c.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
