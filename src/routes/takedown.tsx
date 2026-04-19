import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TAKEDOWNS, TakedownStatus } from "@/lib/mockData";
import { Gavel, Clock, CheckCircle2, XCircle, Send } from "lucide-react";

export const Route = createFileRoute("/takedown")({
  head: () => ({
    meta: [
      { title: "Takedown Center · SportDNA" },
      { name: "description", content: "DMCA takedown dispatch and response tracking across TikTok, Telegram, YouTube, Twitter and more." },
      { property: "og:title", content: "Takedown Center · SportDNA" },
      { property: "og:description", content: "DMCA takedown management and platform response analytics." },
    ],
  }),
  component: TakedownPage,
});

const statusConf: Record<TakedownStatus, { color: string; Icon: typeof Clock; label: string }> = {
  queued: { color: "text-muted-foreground border-border bg-white/5", Icon: Clock, label: "QUEUED" },
  sent: { color: "text-primary border-primary/40 bg-primary/10", Icon: Send, label: "SENT" },
  accepted: { color: "text-success border-success/40 bg-success/10", Icon: CheckCircle2, label: "ACCEPTED" },
  rejected: { color: "text-destructive border-destructive/40 bg-destructive/10", Icon: XCircle, label: "REJECTED" },
};

function TakedownPage() {
  const counts = TAKEDOWNS.reduce<Record<TakedownStatus, number>>(
    (a, t) => ({ ...a, [t.status]: (a[t.status] ?? 0) + 1 }),
    { queued: 0, sent: 0, accepted: 0, rejected: 0 }
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex items-end justify-between">
          <div>
            <div className="text-[11px] mono uppercase tracking-[0.2em] text-primary">Enforcement</div>
            <h1 className="text-2xl font-bold mt-1">Takedown Center</h1>
            <p className="text-sm text-muted-foreground">DMCA notices, dispatch status, and platform response times.</p>
          </div>
          <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-md gradient-amber text-primary-foreground font-semibold glow-amber">
            <Gavel className="w-4 h-4" /> File New DMCA
          </button>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(statusConf) as TakedownStatus[]).map((k) => {
            const c = statusConf[k]; const I = c.Icon;
            return (
              <div key={k} className={`glass rounded-xl p-4 flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-md grid place-items-center border ${c.color}`}>
                  <I className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] mono text-muted-foreground">{c.label}</div>
                  <div className="text-2xl font-bold mono">{counts[k]}</div>
                </div>
              </div>
            );
          })}
        </section>

        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-[10px] mono uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Platform</th>
                <th className="text-left px-4 py-3">Target</th>
                <th className="text-left px-4 py-3">Filed</th>
                <th className="text-left px-4 py-3">Confidence</th>
                <th className="text-left px-4 py-3">Response</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {TAKEDOWNS.map((t) => {
                const c = statusConf[t.status]; const I = c.Icon;
                return (
                  <tr key={t.id} className="border-b border-border/60 hover:bg-white/[0.03]">
                    <td className="px-4 py-3 mono text-xs">{t.id}</td>
                    <td className="px-4 py-3">{t.platform}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.target}</td>
                    <td className="px-4 py-3 mono text-xs">{t.filed}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 rounded bg-white/10 overflow-hidden">
                          <div className="h-full gradient-amber" style={{ width: `${t.confidence}%` }} />
                        </div>
                        <span className="mono text-xs">{t.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 mono text-xs">{t.responseMs ? `${Math.round(t.responseMs / 1000)}s` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] mono px-2 py-1 rounded border ${c.color}`}>
                        <I className="w-3 h-3" />{c.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { p: "TikTok", t: "3m 04s", a: "94%" },
            { p: "YouTube", t: "6m 52s", a: "88%" },
            { p: "Twitter/X", t: "16m 20s", a: "61%" },
          ].map((s) => (
            <div key={s.p} className="glass rounded-xl p-4">
              <div className="text-[10px] mono text-muted-foreground">AVG RESPONSE · {s.p}</div>
              <div className="text-2xl font-bold mono text-primary mt-1">{s.t}</div>
              <div className="text-xs text-muted-foreground">acceptance rate {s.a}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
