import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";
import { PROPAGATION_EDGES, PROPAGATION_NODES, Country } from "@/lib/mockData";
type AnyFeature = { type: string; geometry: unknown; properties?: Record<string, unknown> };
type AnyFeatureCollection = { type: "FeatureCollection"; features: AnyFeature[] };

export function PropagationMap({ height = 520 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);
  const [active, setActive] = useState<Country | null>(PROPAGATION_NODES[0]);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((e) => setW(e[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const { paths, projected, edges } = useMemo(() => {
    const topo = worldData as any;
    const geo = feature(topo, topo.objects.countries) as unknown as AnyFeatureCollection;
    const proj = geoNaturalEarth1().fitSize([w, height], geo as any);
    const path = geoPath(proj);
    const paths = geo.features.map((f: AnyFeature, i: number) => ({ d: path(f as any) ?? "", id: i }));

    const projected: Record<string, [number, number]> = {};
    for (const n of PROPAGATION_NODES) {
      const p = proj(n.coords);
      if (p) projected[n.id] = p;
    }
    const edges = PROPAGATION_EDGES.map(([a, b]) => {
      const pa = projected[a]; const pb = projected[b];
      if (!pa || !pb) return null;
      const mx = (pa[0] + pb[0]) / 2;
      const my = (pa[1] + pb[1]) / 2 - Math.abs(pb[0] - pa[0]) * 0.25;
      return { a, b, d: `M${pa[0]},${pa[1]} Q${mx},${my} ${pb[0]},${pb[1]}` };
    }).filter(Boolean) as { a: string; b: string; d: string }[];

    return { paths, projected, edges };
  }, [w, height]);

  return (
    <div className="glass rounded-xl p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="flex items-center justify-between mb-3 relative">
        <div>
          <h3 className="text-sm font-semibold tracking-wide">GLOBAL PROPAGATION MAP</h3>
          <p className="text-[11px] text-muted-foreground mono">Official Upload → TikTok → Telegram → Pirate Stream</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] mono text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" /> ORIGIN</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> SPREAD</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> PIRACY</span>
        </div>
      </div>

      <div ref={ref} className="relative w-full" style={{ height }}>
        <svg width={w} height={height} className="block">
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.78 0.17 70)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="oklch(0.78 0.17 70)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="edgeGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="oklch(0.72 0.17 155)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="oklch(0.65 0.22 25)" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {paths.map((p) => (
            <path key={p.id} d={p.d} fill="oklch(0.22 0.005 60)" stroke="oklch(1 0 0 / 0.08)" strokeWidth={0.5} />
          ))}

          {edges.map((e, i) => (
            <g key={i}>
              <path d={e.d} fill="none" stroke="url(#edgeGrad)" strokeWidth={1.2} opacity={0.5} />
              <path d={e.d} fill="none" stroke="oklch(0.78 0.17 70)" strokeWidth={1.5} className="animate-dash" opacity={0.85} strokeLinecap="round" />
            </g>
          ))}

          {PROPAGATION_NODES.map((n) => {
            const p = projected[n.id]; if (!p) return null;
            const isOrigin = n.risk < 10;
            const isCritical = n.risk > 90;
            const color = isOrigin ? "oklch(0.72 0.17 155)" : isCritical ? "oklch(0.65 0.22 25)" : "oklch(0.78 0.17 70)";
            const isActive = active?.id === n.id;
            return (
              <g key={n.id} transform={`translate(${p[0]},${p[1]})`} className="cursor-pointer" onClick={() => setActive(n)}>
                <circle r={18} fill="url(#nodeGlow)" />
                <circle r={6} fill={color} className="animate-pulse-ring" style={{ transformOrigin: "center" }} opacity={0.5} />
                <circle r={isActive ? 6 : 4} fill={color} stroke="white" strokeWidth={isActive ? 1.5 : 0.5} />
                <text y={-12} textAnchor="middle" className="mono" fontSize={9} fill="oklch(0.96 0.01 80 / 0.85)">
                  {n.name}
                </text>
              </g>
            );
          })}
        </svg>

        {active && (
          <div className="absolute bottom-3 left-3 glass-strong rounded-lg p-3 w-64 animate-float-up">
            <div className="text-[10px] mono text-muted-foreground">{active.id.toUpperCase()}</div>
            <div className="text-sm font-semibold">{active.name}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground text-[10px] mono">PLATFORM</div>
                <div>{active.platform}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-[10px] mono">VIEWS</div>
                <div className="mono">{active.views.toLocaleString()}</div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground text-[10px] mono mb-1">PIRACY RISK</div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${active.risk}%`,
                      background: active.risk > 80 ? "oklch(0.65 0.22 25)" : "oklch(0.78 0.17 70)",
                      boxShadow: active.risk > 80 ? "0 0 8px oklch(0.65 0.22 25)" : "0 0 8px oklch(0.78 0.17 70)",
                    }}
                  />
                </div>
                <div className="mono text-[10px] mt-1 text-right">{active.risk}/100</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
