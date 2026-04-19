import { Link, useLocation } from "@tanstack/react-router";
import { Activity, Globe, Fingerprint, Radar, GitBranch, Gavel, FlaskConical, Shield } from "lucide-react";
import { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/map", label: "Propagation Map", icon: Globe },
  { to: "/dna", label: "Media DNA", icon: Fingerprint },
  { to: "/detection", label: "Piracy Detection", icon: Radar },
  { to: "/timeline", label: "Timeline", icon: GitBranch },
  { to: "/takedown", label: "Takedown Center", icon: Gavel },
  { to: "/simulation", label: "Live Simulation", icon: FlaskConical },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 glass-strong border-r border-border flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg gradient-amber grid place-items-center glow-amber">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full glow-green" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide">SportDNA</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Self-Tracing Protection</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const active = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all relative ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r glow-amber" />}
                <Icon className="w-4 h-4" />
                <span className="font-medium">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="glass rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse glow-green" />
              SYSTEM ONLINE
            </div>
            <div className="text-[10px] mono text-muted-foreground/70">
              ai-engine v4.2.1<br />uptime 99.998%
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="h-14 border-b border-border glass-strong px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 text-xs mono text-muted-foreground">
        <span className="w-2 h-2 bg-destructive rounded-full animate-pulse glow-red" />
        <span>THREAT LEVEL: <span className="text-destructive font-bold">ELEVATED</span></span>
        <span className="mx-2 text-border">|</span>
        <span>SCANNING <span className="text-primary">847</span> PLATFORMS</span>
        <span className="mx-2 text-border">|</span>
        <span>QUEUE: <span className="text-foreground">12,847</span></span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md glass">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-muted-foreground">Operator</span>
          <span className="font-medium">analyst@sportdna</span>
        </div>
      </div>
    </header>
  );
}
