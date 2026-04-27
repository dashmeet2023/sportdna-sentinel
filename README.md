🧬 SportDNA

Self-Tracing Anti-Piracy Intelligence for Sports Media

Built with Antigravity · Deployed on Google Cloud · Powered by Gemini 3.1 Pro

🚀 Overview

SportDNA is an AI-powered anti-piracy platform that embeds a perceptual fingerprint ("DNA") into sports media.

Unlike traditional watermarking or hash-based systems, SportDNA detects edited, transformed, and redistributed pirated content across platforms in real time — and autonomously initiates takedown actions.

⚠️ Problem

Sports leagues lose $28B+ annually due to piracy across platforms like TikTok, Telegram, X, and YouTube.

⏳ Manual DMCA takedowns take 6–48 hours
📉 Viral clips spread before action is taken
🔍 Existing tools fail against:
Cropped videos
Mirrored content
Recolored clips
Frame-rate manipulation
❌ No unified real-time intelligence system exists
💡 Solution

SportDNA introduces self-tracing media intelligence:

🧬 256-dimensional perceptual DNA fingerprints
🔁 Edit-resilient matching
🤖 AI-powered threat reasoning with Gemini
⚡ Automated DMCA takedown pipeline
📊 Real-time analytics + propagation prediction
✨ Key Features
🔬 Self-Tracing Media

Each video carries a unique identity without visible watermarks.

🛡️ Edit-Resilient Detection

Matches survive:

Cropping
Mirroring
Recoloring
Speed/frame-rate changes
🤖 AI Guardian Agent

Powered by Gemini 3.1 Pro:

Analyzes threats
Prioritizes takedowns
Generates actionable insights
📈 Propagation Intelligence

Predicts viral spread patterns before peak impact.

🏗️ Architecture
Frontend (TanStack Start / React 19)
        ↓
Cloud Run (Server Functions + SSE)
        ↓
AI Layer (Gemini via Vertex AI)
        ↓
Database (Cloud SQL - PostgreSQL)
        ↓
Storage (Google Cloud Storage)
        ↓
Pipeline:
Upload → DNA Generation → Matching → AI Analysis → DMCA Dispatch
🔄 Process Flow
📤 Upload match footage
🧬 Generate 256-dim DNA fingerprint
🗄️ Store in registry (Cloud SQL)
🌐 Crawl platforms (TikTok, YouTube, X, Telegram)
🔍 Perform cosine similarity matching (≥ 0.92)
🤖 AI threat analysis via Gemini
⚖️ Auto-DMCA dispatch
📊 Display analytics dashboard
🧠 Tech Stack
Layer	Technology
Platform	Antigravity
Hosting	Google Cloud (Cloud Run)
AI	Vertex AI · Gemini 3.1 Pro / Flash
Frontend	TanStack Start · React 19 · Tailwind CSS v4
Backend	Cloud Run Functions
Database	Cloud SQL (PostgreSQL)
Auth	Firebase Auth / Supabase
Storage	Google Cloud Storage
Streaming	Server-Sent Events (SSE)
📊 Demo Features
📂 DNA Registry Upload
🔎 Live Detection Feed
🤖 Gemini Guardian Chatbot
🌍 Propagation Map
⚖️ Auto-DMCA Timeline
💰 Business Model
💼 SaaS Licensing: €50K – €500K/year (leagues & broadcasters)
📈 Usage-based: Per takedown / detection
🌍 Impact
🏆 Protects broadcast rights & revenue
⚡ Reduces takedown time from hours → minutes
🔒 Reduces exposure to unsafe pirate streams
🌱 Supports UN SDG 8 — Decent Work & Economic Growth
🔮 Future Scope
🎥 Real-time live-stream fingerprinting (sub-second latency)
🔊 Audio DNA (commentary + crowd noise)
🌐 Multi-league global registry
🔗 Direct API integrations (YouTube CMS, TikTok Content ID)
🛠️ Setup (Local Development)
# Clone repo
git clone https://github.com/your-username/sportdna.git

# Install dependencies
cd sportdna
npm install

# Run development server
npm run dev
🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss.

📜 License

MIT License
