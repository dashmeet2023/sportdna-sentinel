import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const MODELS = [
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
] as const;

const SUGGESTIONS = [
  "How does SportDNA fingerprinting work?",
  "Explain the takedown pipeline",
  "What's a cosine-similarity match threshold?",
  "Summarize current piracy threats",
];

export function GuardianChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<string>(MODELS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    let acc = "";
    const pushDelta = (chunk: string) => {
      acc += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
        }
        return [...prev, { role: "assistant", content: acc }];
      });
    };

    try {
      const res = await fetch("/api/guardian-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, model }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        pushDelta(`⚠️ ${err.error ?? "Guardian unreachable."}`);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) pushDelta(delta);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      pushDelta("⚠️ Connection lost.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full gradient-amber glow-amber grid place-items-center shadow-xl hover:scale-105 transition-transform"
        aria-label="Open Guardian chat"
      >
        {open ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageCircle className="w-6 h-6 text-primary-foreground" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[min(420px,calc(100vw-2.5rem))] h-[min(620px,calc(100vh-8rem))] glass rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/40 backdrop-blur">
            <div className="w-8 h-8 rounded-md gradient-amber grid place-items-center glow-amber">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">SportDNA Guardian</div>
              <div className="text-[10px] mono text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                {loading ? "THINKING" : "ONLINE"} · POWERED BY GEMINI
              </div>
            </div>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={loading}
              className="text-[10px] mono bg-background/60 border border-border rounded px-1.5 py-1 text-foreground/80 hover:border-primary/50 focus:outline-none focus:border-primary disabled:opacity-40"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Ask the Guardian anything about your media DNA, piracy detection, or takedown analytics.
                </div>
                <div className="grid gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-xs px-3 py-2 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "gradient-amber text-primary-foreground"
                      : "bg-background/60 border border-border"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>*]:my-1 [&>p]:leading-relaxed [&_code]:text-xs [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-background/60 border border-border rounded-xl px-3 py-2 text-sm flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" /> Guardian is analyzing…
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="border-t border-border p-3 flex items-center gap-2 bg-background/40 backdrop-blur"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Guardian…"
              disabled={loading}
              className="flex-1 bg-background/60 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-md gradient-amber grid place-items-center disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
