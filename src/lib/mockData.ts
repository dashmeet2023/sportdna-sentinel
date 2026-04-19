export type Severity = "low" | "medium" | "high" | "critical";

export interface Alert {
  id: string;
  time: string;
  platform: string;
  message: string;
  severity: Severity;
  confidence: number;
}

export const PLATFORMS = ["TikTok", "Telegram", "YouTube", "Twitter/X", "Reddit", "Instagram", "Facebook", "Twitch", "Pirate Stream"];

export const seedAlerts: Alert[] = [
  { id: "a1", time: "12:42:08", platform: "TikTok", message: "Unauthorized highlight detected — 8s edited clip", severity: "high", confidence: 97 },
  { id: "a2", time: "12:41:51", platform: "Telegram", message: "Edited clip shared in piracy channel (24k members)", severity: "critical", confidence: 99 },
  { id: "a3", time: "12:40:33", platform: "YouTube", message: "Re-uploaded match highlight — meme overlay added", severity: "medium", confidence: 88 },
  { id: "a4", time: "12:39:14", platform: "Twitter/X", message: "Compressed clip variant matched DNA hash", severity: "high", confidence: 94 },
  { id: "a5", time: "12:37:02", platform: "Reddit", message: "Cropped goal-replay detected in r/soccer", severity: "low", confidence: 81 },
  { id: "a6", time: "12:35:48", platform: "Pirate Stream", message: "Live re-broadcast attempt blocked", severity: "critical", confidence: 98 },
];

export const ALERT_TEMPLATES = [
  "Unauthorized highlight detected on {p}",
  "Edited clip detected on {p}",
  "Possible piracy network discovered on {p}",
  "Compressed re-upload matched on {p}",
  "Screen-recorded variant flagged on {p}",
  "Meme overlay variant detected on {p}",
  "Cropped goal replay detected on {p}",
  "Account flagged for repeated piracy on {p}",
];

export interface Country { id: string; name: string; coords: [number, number]; platform: string; views: number; risk: number; }

export const PROPAGATION_NODES: Country[] = [
  { id: "uk", name: "United Kingdom", coords: [-0.13, 51.5], platform: "Official Broadcast", views: 4_200_000, risk: 5 },
  { id: "us", name: "United States", coords: [-95, 38], platform: "TikTok", views: 1_240_000, risk: 92 },
  { id: "br", name: "Brazil", coords: [-55, -10], platform: "Telegram", views: 880_000, risk: 88 },
  { id: "in", name: "India", coords: [78, 22], platform: "YouTube Re-upload", views: 2_100_000, risk: 81 },
  { id: "ru", name: "Russia", coords: [60, 60], platform: "Pirate Stream", views: 540_000, risk: 96 },
  { id: "ng", name: "Nigeria", coords: [8, 9], platform: "Twitter/X", views: 320_000, risk: 74 },
  { id: "id", name: "Indonesia", coords: [113, -2], platform: "Telegram", views: 410_000, risk: 79 },
  { id: "de", name: "Germany", coords: [10, 51], platform: "Reddit", views: 190_000, risk: 62 },
  { id: "ar", name: "Argentina", coords: [-64, -34], platform: "TikTok", views: 670_000, risk: 84 },
];

export const PROPAGATION_EDGES: [string, string][] = [
  ["uk", "us"], ["uk", "in"], ["uk", "de"],
  ["us", "br"], ["us", "ar"],
  ["in", "id"], ["br", "ng"],
  ["us", "ru"], ["de", "ru"],
];

export const TIMELINE = [
  { t: "12:01", label: "Official Upload", detail: "Premier League official channel", kind: "official" as const },
  { t: "12:07", label: "TikTok Clip Uploaded", detail: "8s edited clip — @sportshub_x", kind: "alert" as const },
  { t: "12:10", label: "Telegram Group Share", detail: "Forwarded to 4 piracy channels", kind: "alert" as const },
  { t: "12:14", label: "YouTube Re-upload", detail: "Meme overlay added — 320k views", kind: "alert" as const },
  { t: "12:18", label: "Twitter/X Cross-post", detail: "Compressed variant — DNA matched 94%", kind: "alert" as const },
  { t: "12:22", label: "Piracy Website Upload", detail: "Mirror stream — takedown dispatched", kind: "critical" as const },
  { t: "12:28", label: "Takedown Accepted", detail: "TikTok removed clip + flagged account", kind: "success" as const },
];

export interface Detection {
  id: string;
  platform: string;
  clipLength: string;
  confidence: number;
  views: string;
  thumbnail: string;
  account: string;
  uploaded: string;
}

export const DETECTIONS: Detection[] = [
  { id: "d1", platform: "TikTok", clipLength: "8s", confidence: 97, views: "1.2M", thumbnail: "🎬", account: "@sportshub_x", uploaded: "6m ago" },
  { id: "d2", platform: "Telegram", clipLength: "24s", confidence: 99, views: "340k", thumbnail: "📺", account: "Piracy Channel #4421", uploaded: "9m ago" },
  { id: "d3", platform: "YouTube", clipLength: "1m 12s", confidence: 88, views: "320k", thumbnail: "▶️", account: "@MemeFootball", uploaded: "14m ago" },
  { id: "d4", platform: "Twitter/X", clipLength: "11s", confidence: 94, views: "92k", thumbnail: "🐦", account: "@goal_compilations", uploaded: "21m ago" },
  { id: "d5", platform: "Reddit", clipLength: "6s", confidence: 81, views: "44k", thumbnail: "🔥", account: "u/highlights_daily", uploaded: "33m ago" },
  { id: "d6", platform: "Pirate Stream", clipLength: "Full match", confidence: 99, views: "12k live", thumbnail: "📡", account: "stream-mirror.xyz", uploaded: "Live", },
];

export type TakedownStatus = "queued" | "sent" | "accepted" | "rejected";

export interface Takedown {
  id: string;
  platform: string;
  target: string;
  status: TakedownStatus;
  filed: string;
  responseMs: number | null;
  confidence: number;
}

export const TAKEDOWNS: Takedown[] = [
  { id: "T-9821", platform: "TikTok", target: "@sportshub_x / clip 8s", status: "accepted", filed: "12:09", responseMs: 184_000, confidence: 97 },
  { id: "T-9820", platform: "Telegram", target: "Channel #4421", status: "sent", filed: "12:11", responseMs: null, confidence: 99 },
  { id: "T-9819", platform: "YouTube", target: "@MemeFootball / re-upload", status: "accepted", filed: "12:15", responseMs: 412_000, confidence: 88 },
  { id: "T-9818", platform: "Twitter/X", target: "@goal_compilations", status: "rejected", filed: "12:19", responseMs: 980_000, confidence: 94 },
  { id: "T-9817", platform: "Reddit", target: "u/highlights_daily", status: "queued", filed: "12:34", responseMs: null, confidence: 81 },
  { id: "T-9816", platform: "Pirate Stream", target: "stream-mirror.xyz", status: "sent", filed: "12:23", responseMs: null, confidence: 99 },
  { id: "T-9815", platform: "Instagram", target: "@reels_football", status: "accepted", filed: "11:58", responseMs: 240_000, confidence: 92 },
  { id: "T-9814", platform: "Facebook", target: "Page: Football Memes", status: "accepted", filed: "11:42", responseMs: 612_000, confidence: 86 },
];

export const HOURLY_DETECTIONS = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  detections: Math.round(40 + Math.sin(i / 3) * 30 + Math.random() * 25),
  takedowns: Math.round(20 + Math.cos(i / 4) * 15 + Math.random() * 12),
}));

export const PLATFORM_BREAKDOWN = [
  { platform: "TikTok", value: 38 },
  { platform: "Telegram", value: 22 },
  { platform: "YouTube", value: 14 },
  { platform: "Twitter/X", value: 11 },
  { platform: "Reddit", value: 7 },
  { platform: "Other", value: 8 },
];

export function randomAlert(): Alert {
  const p = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
  const tpl = ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];
  const sev: Severity = (["low", "medium", "high", "critical"] as Severity[])[Math.floor(Math.random() * 4)];
  const now = new Date();
  return {
    id: `a${Math.random().toString(36).slice(2, 8)}`,
    time: now.toTimeString().slice(0, 8),
    platform: p,
    message: tpl.replace("{p}", p),
    severity: sev,
    confidence: 75 + Math.floor(Math.random() * 24),
  };
}
