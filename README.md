# SportDNA — Self-Tracing Sports Media Protection

> AI-powered anti-piracy intelligence platform for sports leagues and broadcasters. Detect, track, and prevent unauthorized use of sports media in real time.

SportDNA is a Security Operations Center (SOC)–style dashboard that monitors how sports media (match footage, player highlights, tournament montages, fan-cam clips) propagates across the internet, identifies pirated derivatives via frame-level "DNA" fingerprinting, and orchestrates takedowns across hundreds of platforms.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Routes / Pages](#routes--pages)
6. [Design System](#design-system)
7. [Getting Started](#getting-started)
8. [Available Scripts](#available-scripts)
9. [Deployment](#deployment)
10. [Data & Mocks](#data--mocks)
11. [Contributing](#contributing)
12. [License](#license)

---

## Overview

SportDNA simulates a real-time intelligence platform used by rights holders to:

- **Fingerprint** every protected asset at frame level (the "DNA").
- **Detect** unauthorized re-uploads, edits, and derivatives across 800+ platforms in 64 countries.
- **Trace** how content propagates: Official Upload → TikTok → Telegram → Pirate Stream.
- **Predict** risk hotspots before viral piracy occurs.
- **Estimate** revenue loss prevented and dispatch DMCA takedowns at scale.

The app is built as a polished demo/prototype with mocked data, but is architected so a real backend (database, detection engine, takedown service) can be plugged in without restructuring the UI.

## Core Features

- 🎯 **Intelligence Dashboard** — Hero with auto-rotating Ken-Burns imagery, live stat cards, detection-volume chart, platform-piracy breakdown, and a curated "Protected Event Intelligence" gallery.
- 📡 **Radar Sweep Widget** — SOC-style radar with concentric rings, rotating sweep beam, synchronized blip dots, and floating threat labels (e.g. `TG-44 · MOSCOW`).
- 🌍 **Global Propagation Map** — D3-powered world map showing origin → spread → piracy edges between countries.
- 🧬 **DNA Fingerprint Index** — View of the 12.4M+ media-asset fingerprint catalog.
- 🚨 **Detection Feed** — Live activity stream of new unauthorized uploads.
- 📈 **Risk Prediction Panel** — AI-projected hotspots and probability scores.
- 💰 **Revenue Estimator** — Quantifies revenue loss prevented per quarter.
- ⚖️ **Takedown Orchestration** — Dispatch and track DMCA takedowns across platforms.
- 🤖 **SportDNA Guardian Agent** — Inline AI analyst that explains detections in plain language and recommends actions.
- 🕸️ **Timeline & Simulation** views — Historical and predictive piracy modeling.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start v1](https://tanstack.com/start) (React 19, SSR, file-based routing) |
| Build tool | [Vite 7](https://vitejs.dev/) |
| Language | TypeScript (strict mode) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`, configured in `src/styles.css`) |
| UI primitives | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Charts | [Recharts](https://recharts.org/) |
| Maps | [d3-geo](https://github.com/d3/d3-geo) + [topojson-client](https://github.com/topojson/topojson-client) + `world-atlas` |
| Animation | CSS keyframes + [framer-motion](https://www.framer.com/motion/) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| Forms | [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/) |
| Deployment target | Cloudflare Workers (via `@cloudflare/vite-plugin`, `wrangler.jsonc`) |

## Project Structure

```
.
├── src/
│   ├── routes/                  # File-based routes (TanStack Router)
│   │   ├── __root.tsx           # Root layout (HTML shell + providers)
│   │   ├── index.tsx            # / — Intelligence Dashboard
│   │   ├── detection.tsx        # /detection
│   │   ├── dna.tsx              # /dna
│   │   ├── map.tsx              # /map
│   │   ├── simulation.tsx       # /simulation
│   │   ├── takedown.tsx         # /takedown
│   │   └── timeline.tsx         # /timeline
│   ├── components/
│   │   ├── AppShell.tsx         # Sidebar nav + page shell
│   │   ├── ActivityFeed.tsx
│   │   ├── GuardianAgent.tsx    # AI analyst card
│   │   ├── PropagationMap.tsx   # D3 world map
│   │   ├── RevenueEstimator.tsx
│   │   ├── RiskPredictionPanel.tsx
│   │   ├── StatCard.tsx
│   │   └── ui/                  # shadcn primitives
│   ├── hooks/
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   ├── mockData.ts          # Hourly detections, platform breakdown, propagation graph
│   │   └── utils.ts
│   ├── assets/                  # Hero imagery (trophy, world cup, stars, crowd, …)
│   ├── router.tsx               # Router bootstrap + QueryClient
│   ├── routeTree.gen.ts         # Auto-generated — do not edit
│   └── styles.css               # Tailwind v4 + design tokens + custom keyframes
├── components.json              # shadcn config
├── wrangler.jsonc               # Cloudflare Worker config
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Routes / Pages

| Path | File | Purpose |
|---|---|---|
| `/` | `routes/index.tsx` | Intelligence Dashboard — hero, KPIs, charts, event gallery, Guardian agent |
| `/detection` | `routes/detection.tsx` | Live unauthorized-upload detections |
| `/dna` | `routes/dna.tsx` | Fingerprint catalog browser |
| `/map` | `routes/map.tsx` | Full-screen propagation map |
| `/simulation` | `routes/simulation.tsx` | Predictive piracy modeling |
| `/takedown` | `routes/takedown.tsx` | DMCA takedown orchestration |
| `/timeline` | `routes/timeline.tsx` | Historical incident timeline |

Each route uses `createFileRoute(...)` and ships its own `head()` metadata (title, description, OG tags) for proper SSR + SEO.

## Design System

The visual identity is **cyberpunk SOC × tactical broadcast**.

- **Color palette** — Tactical Amber primary (`oklch(0.78 0.17 70)`) on a deep warm-charcoal background, with success green, alert red, and intel blue accents.
- **Tokens** — All colors live in `src/styles.css` as CSS custom properties (`--background`, `--primary`, `--destructive`, `--success`, `--warning`, etc.) defined in `oklch`. Components NEVER use raw color classes — only semantic tokens.
- **Typography** — Sans for body, monospace (`mono`) for telemetry, codes, and timestamps.
- **Custom utilities** (in `styles.css`):
  - `.glass`, `.glass-strong` — frosted panels
  - `.grid-bg`, `.grid-drift` — animated grid overlays
  - `.particle` — floating ambient particles
  - `.radar-sweep`, `.radar-pulse`, `.radar-blip`, `.radar-blip-label` — SOC radar widget
  - `.animate-ken-burns-active` — slow zoom on hero images
  - `.animate-slide-progress` — synchronized hero indicator progress bar
  - `.animate-dash` — flowing dash on map propagation edges
  - `.text-glow-amber`, `.glow-amber`, `.gradient-amber` — accent treatments

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 (Node 22 recommended)
- **bun**, **npm**, or **pnpm**

### Install

```bash
# Using bun (recommended — lockfile is bun.lockb)
bun install

# or npm
npm install
```

### Run the dev server

```bash
bun run dev
# → http://localhost:5173 (or the port Vite chooses)
```

The TanStack Router Vite plugin auto-generates `src/routeTree.gen.ts` on save — never edit it manually. Just add a new file under `src/routes/` and the route registers itself.

## Available Scripts

| Script | What it does |
|---|---|
| `bun run dev` | Start Vite dev server with HMR |
| `bun run build` | Production build (Cloudflare Worker target) |
| `bun run build:dev` | Build with development mode flag |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint over the project |
| `bun run format` | Format the codebase with Prettier |

## Deployment

The project is configured for **Cloudflare Workers** via `@cloudflare/vite-plugin` and `wrangler.jsonc`.

- `bun run build` produces a Worker-ready bundle.
- Server functions and SSR run inside the Worker runtime with the `nodejs_compat` flag — avoid Node-only packages (`child_process`, `sharp`, `puppeteer`, native add-ons).
- The simplest path is to publish via the Lovable platform, which handles the Worker deployment automatically.

## Data & Mocks

All data shown in the UI is mocked in `src/lib/mockData.ts` and includes:

- `HOURLY_DETECTIONS` — 24h time-series of detections vs. takedowns
- `PLATFORM_BREAKDOWN` — Piracy share per platform (TikTok, Telegram, YouTube, etc.)
- `PROPAGATION_NODES` / `PROPAGATION_EDGES` — Country graph for the world map
- Asset/event metadata for the dashboard gallery

To wire a real backend, replace these mocks with TanStack Query hooks fetching from your API or Lovable Cloud (Postgres + Edge Functions). The component layer does not need to change.

## Contributing

1. Branch off `main`.
2. Keep changes focused — one concern per PR.
3. Use semantic design tokens (no raw color classes in components).
4. Run `bun run lint` and `bun run format` before pushing.
5. Add a new route by creating a file in `src/routes/` (flat dot-separated naming, e.g. `reports.weekly.tsx` → `/reports/weekly`).

## License

Proprietary — internal demo project. All hero imagery is illustrative only and not affiliated with any real league, team, broadcaster, or tournament.
