import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_MODELS = new Set([
  "google/gemini-3.1-pro-preview",
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
]);

const SYSTEM_PROMPT = `You are SportDNA Guardian, an AI threat-analyst embedded in an anti-piracy platform for sports leagues and broadcasters.
You are powered by Google Gemini through the Lovable AI Gateway.

Capabilities you can discuss:
- Perceptual fingerprinting (256-dim DCT-luminance embeddings) of match footage
- Cross-platform piracy detection (TikTok, Telegram, YouTube, Twitter/X)
- Cosine-similarity matching against the asset DNA registry
- Automated DMCA takedown dispatch with response-time analytics
- Propagation-graph threat intelligence and risk prediction

Style: confident, technical, calm. Use short paragraphs and bullets. Cite percentages, hashes, and asset IDs precisely if the user provides them. Never invent IDs. Use markdown.`;

export const Route = createFileRoute("/api/guardian-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: { messages?: Array<{ role: string; content: string }>; model?: string };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }

        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
          return new Response(JSON.stringify({ error: "No messages" }), { status: 400 });
        }
        const model = body.model && ALLOWED_MODELS.has(body.model) ? body.model : "google/gemini-3.1-pro-preview";

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            stream: true,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages.filter((m) => m.role === "user" || m.role === "assistant"),
            ],
          }),
        });

        if (upstream.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
            status: 429, headers: { "Content-Type": "application/json" },
          });
        }
        if (upstream.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Top up in Settings → Workspace → Usage." }), {
            status: 402, headers: { "Content-Type": "application/json" },
          });
        }
        if (!upstream.ok || !upstream.body) {
          const t = await upstream.text();
          console.error("Guardian chat upstream error:", upstream.status, t);
          return new Response(JSON.stringify({ error: `Upstream error ${upstream.status}` }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream" },
        });
      },
    },
  },
});
