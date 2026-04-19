import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

export function RevenueEstimator() {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const target = 2_847_500;
    let cur = 0;
    const step = () => {
      cur += target / 60;
      if (cur >= target) { setVal(target); return; }
      setVal(Math.floor(cur));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-md bg-success/15 border border-success/40 grid place-items-center glow-green">
          <DollarSign className="w-4 h-4 text-success" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">REVENUE PROTECTION</h3>
          <p className="text-[10px] mono text-muted-foreground">PIRACY LOSS PREVENTED · 24H</p>
        </div>
      </div>
      <div className="text-3xl font-bold mono text-success text-glow-amber">
        ${val.toLocaleString()}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-white/5 border border-border p-2">
          <div className="text-[10px] mono text-muted-foreground">ADS RECOVERED</div>
          <div className="font-bold mono">$1.84M</div>
        </div>
        <div className="rounded-md bg-white/5 border border-border p-2">
          <div className="text-[10px] mono text-muted-foreground">SUBS PROTECTED</div>
          <div className="font-bold mono">$1.00M</div>
        </div>
      </div>
    </div>
  );
}
