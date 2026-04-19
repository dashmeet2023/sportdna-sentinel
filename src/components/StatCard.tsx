import { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "amber" | "red" | "green" | "blue";
}

export function StatCard({ label, value, prefix = "", suffix = "", delta, icon: Icon, tone = "amber" }: Props) {
  const [n, setN] = useState(0);
  const startTs = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const dur = 1400;
    const step = (ts: number) => {
      if (startTs.current === null) startTs.current = ts;
      const p = Math.min(1, (ts - startTs.current) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else setN(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const toneClass: Record<string, string> = {
    amber: "text-primary",
    red: "text-destructive",
    green: "text-success",
    blue: "text-chart-4",
  };
  const glowClass: Record<string, string> = {
    amber: "glow-amber",
    red: "glow-red",
    green: "glow-green",
    blue: "",
  };

  return (
    <div className="glass rounded-xl p-5 relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{label}</div>
          <div className={`mt-2 text-3xl font-bold mono ${toneClass[tone]} text-glow-amber`}>
            {prefix}{n.toLocaleString()}{suffix}
          </div>
          {delta && <div className="mt-1 text-xs text-muted-foreground">{delta}</div>}
        </div>
        <div className={`w-10 h-10 rounded-lg grid place-items-center bg-white/5 border border-border ${glowClass[tone]}`}>
          <Icon className={`w-5 h-5 ${toneClass[tone]}`} />
        </div>
      </div>
    </div>
  );
}
