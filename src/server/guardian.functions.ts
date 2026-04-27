import { createServerFn } from "@tanstack/react-start";

export const GUARDIAN_MODELS = [
  "google/gemini-3.1-pro-preview",
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
] as const;
export type GuardianModel = (typeof GUARDIAN_MODELS)[number];
export const DEFAULT_GUARDIAN_MODEL: GuardianModel = "google/gemini-3.1-pro-preview";

interface GuardianContext {
  scenario: "dna_analysis" | "alert_feed" | "takedown_summary" | "propagation";
  payload: Record<string, unknown>;
  model?: GuardianModel;
}

export const askGuardian = createServerFn({ method: "POST" })
  .inputValidator((input: GuardianContext) => {
    if (!input || typeof input !== "object") throw new Error("Invalid payload");
    if (!["dna_analysis", "alert_feed", "takedown_summary", "propagation"].includes(input.scenario)) {
      throw new Error("Invalid scenario");
    }
    if (input.model && !GUARDIAN_MODELS.includes(input.model)) {
      throw new Error("Invalid model");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { text: "Guardian offline — LOVABLE_API_KEY not configured.", error: true };
    }

    const system = `You are SportDNA Guardian, an AI threat-analyst for sports media piracy.
You produce a single concise paragraph (≤ 70 words). Tone: confident, technical, calm.
Always reference: (1) what was detected, (2) the AI confidence level, (3) recommended action.
Use mono-style precision: cite asset IDs, hashes (truncated), platforms, and percentages exactly as given.
Never hallucinate IDs or numbers — only use values from the provided JSON context.`;

    const user = `Scenario: ${data.scenario}\nContext JSON:\n${JSON.stringify(data.payload, null, 2)}\n\nProduce the analyst paragraph now.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (res.status === 429) {
        return { text: "Guardian rate-limited. Try again shortly.", error: true };
      }
      if (res.status === 402) {
        return { text: "Guardian credits exhausted — top up Lovable AI in Settings → Workspace → Usage.", error: true };
      }
      if (!res.ok) {
        const t = await res.text();
        console.error("Guardian gateway error:", res.status, t);
        return { text: `Guardian error (${res.status}).`, error: true };
      }

      const json = await res.json();
      const text = json.choices?.[0]?.message?.content?.trim() ?? "Guardian returned no content.";
      return { text, error: false };
    } catch (e) {
      console.error("Guardian call failed:", e);
      return { text: "Guardian service is unreachable.", error: true };
    }
  });
