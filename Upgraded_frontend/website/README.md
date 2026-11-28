# Resume Analyser — Frontend

A career-intelligence workspace: it scores a resume against a real job description, reports the
skill gaps, rewrites weak bullets, and answers career questions in a chat advisor.

This repository folder contains **only the frontend**. It talks to a separate FastAPI backend
whose base URL is configurable through an environment variable.

---

## Tech stack, and why each piece is here

| Layer | Choice | Why this, and not something else |
|---|---|---|
| UI library | **React 18** | The app is a set of stateful forms and result views that update in place (upload → analyse → render report). React's component model handles that directly. No framework migration was needed, so nothing was rewritten for its own sake. |
| Language | **TypeScript 5** | The backend returns a nested JSON report (`score`, `analysis`, `review`, `improvements`). Those shapes are modelled in `src/types/api.ts`, so a response field rename becomes a compile error instead of a runtime `undefined` on screen. |
| Build tool | **Vite 5** | Sub-second dev server, native ES modules, and route-level code splitting out of the box. The production build is one command with no config beyond the plugin. |
| Styling | **Tailwind CSS 3** | The design system is a small token set (canvas / surface / line / ink / cyan / violet). Tailwind keeps those tokens as the only source of colour and spacing, so pages cannot drift apart. It also strips unused CSS at build time. |
| Routing | **React Router 6** | Five distinct workspaces (`/`, `/analyze`, `/classify`, `/advisor`, `/about`) plus a 404. Each route lazy-loads its own chunk. |
| HTTP | **Axios** | Multipart file uploads, per-request timeouts, and a retry policy that inspects the response status (retry on `408 / 425 / 429 / 5xx` and network failures; chat turns are never retried, so one question can never be appended twice). One interceptor-free wrapper in `src/services/api.ts` is the only place that knows the base URL. |
| Markdown | **marked** | The chat advisor replies in Markdown. Rendered output is sanitised in `src/pages/AdvisorPage.tsx` before it reaches the DOM (scripts, event handlers and `javascript:` URLs are stripped). |

**Important:** no animation library, no 3D library, no state-management library, and no UI kit were
added. Motion is CSS transitions plus a small `requestAnimationFrame` canvas; shared state is React
context; the report renderer is hand-built. Every dependency above earns its place.

---

## Running it locally

Requirements: **Node.js 18+** and npm.

```bash
cd Upgraded_frontend/website
npm install
npm run dev
```

Open **http://localhost:5173** (Vite prints the exact URL).

In a second terminal, start the backend on **port 8000**:

```bash
cd <backend-folder>
.venv/Scripts/python.exe -m uvicorn main:app --reload --port 8000
```

> Port **11434** is the LLM provider (Ollama) that the backend uses internally. The browser must
> never be pointed at it — the app API is a different service on port 8000.

### The backend must be running

The frontend does not fake results. Without a reachable backend, the pages render fine but
Analyze, Role check and the Advisor chat show an error state, and the navbar badge reads
**"Backend offline"**.

The client expects these endpoints on `VITE_API_BASE_URL`:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Backend status badge (`status`, `brain_loaded`) |
| `POST` | `/classify/` | Single document → type, role, confidence (`multipart`, field `file`) |
| `POST` | `/analyze/` | Resume + job description → full report (`multipart`, fields `resume`, `jd`) |
| `POST` | `/api/chat` | CareerBuddy reply (`message`, `use_web_search`, optional `session_id`); the response echoes `session_id` |
| `POST` | `/api/chat/clear` | Forgets one conversation (`session_id` in the JSON body) |

That backend lives outside this folder and is **not** modified by the frontend.

### Conversation sessions

The chat is session-scoped on the backend. The first message of a conversation is sent without a
`session_id`; the reply carries one, and every following message sends it back so earlier turns are
included in context. **Clear** posts the current id and then forgets it, so the next message begins a
new conversation instead of continuing the old one.

The id lives only in a React ref (`src/pages/AdvisorPage.tsx`). It is never written to `localStorage`
or `sessionStorage`, so a refresh or a second tab starts a fresh conversation. The backend keeps its
copy in memory and expires it after `CHAT_SESSION_TTL_SECONDS` (30 minutes idle by default); it is
not shared between serverless instances, so a conversation can be forgotten by a redeploy.

If the backend ever answers `422` for a stored id, the client drops that id and retries the turn once
without it — bounded recovery, never a retry loop.

---

## Configuration

Copy the example file and adjust if your backend is elsewhere:

```bash
cp .env.example .env
```

```ini
VITE_API_BASE_URL=http://localhost:8000
```

- The variable is read once, in `src/services/api.ts`. No URL is hardcoded in any component.
- Defaults to `http://localhost:8000` if the variable is missing.
- `.env` is gitignored; `.env.example` is committed.
- The backend must allow this app's origin in its own `CORS_ORIGINS` setting, otherwise the browser
  blocks every API call. Locally that is `http://localhost:5173`; in production it is the deployed
  frontend origin.
- `VITE_*` values are **compiled into the bundle**. Never put a secret or API key in one — the
  browser can read them. Provider keys belong on the backend.

---

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload on port 5173 |
| `npm run build` | Type-checks (`tsc --noEmit`) then builds to `dist/` |
| `npm run preview` | Serves the production build locally on port 4173 — **use this to check the real bundle** |
| `npm run typecheck` | Type check only |
| `npm run lint` | ESLint over all `.ts` / `.tsx` |

Checking the production build locally:

```bash
npm run build
npm run preview
# → http://localhost:4173
```

---

## Routes

| Route | Page | Loaded |
|---|---|---|
| `/` | Product home, sample report preview, how it works | eager (it is the entry point) |
| `/analyze` | Upload resume + job description, render the full report | lazy chunk |
| `/classify` | Single-document type and role detection | lazy chunk |
| `/advisor` | CareerBuddy chat | lazy chunk |
| `/about` | Product, stack, data handling, limitations | lazy chunk |
| `*` | 404 | lazy chunk |

Chunks are also preloaded on nav hover/focus (`src/routes/preload.ts`), so a route change never
suspends in the middle of its transition.

---

## Project structure

```
src/
├─ components/
│  ├─ fx/            NeuralField (canvas), TiltPanel (CSS 3D), Reveal (scroll)
│  ├─ layout/        PageShell, PageHeader, PageFallback
│  ├─ report/        ReportView, KpiStrip, SkillGroups, BulletDiff, primitives
│  ├─ BackendStatus  health polling + context
│  ├─ FileDrop       drag & drop upload with validation
│  ├─ Navbar, Footer, Layout, RouteTransition, ScoreRing, icons
├─ hooks/            useReducedMotion
├─ pages/            one file per route
├─ routes/           lazy import map + preloader
├─ services/api.ts   the only place that talks HTTP
├─ types/api.ts      response contracts
└─ index.css         design tokens and shared component classes
```

Rules the code follows: components never call Axios directly, API shapes live only in
`types/api.ts`, and every colour comes from a Tailwind token.

---

## Design system

- **Palette:** midnight navy canvas `#070B18`, surface `#0D1428`, cyan `#22D3EE` (primary action —
  always with near-black text `#061021`, never white on cyan), electric blue `#3B82F6`, restrained
  violet `#A78BFA` for secondary accents, text `#E6ECF8`.
- **Elevation:** a border plus one inset highlight. Glow appears in exactly one place, the home hero.
- **Motion:** a canvas constellation and pointer tilt on the hero, scroll reveals, and a 350 ms
  route out/in transition. Only `transform` and `opacity` animate.
- **Reduced motion:** `prefers-reduced-motion` disables the canvas loop, tilt, reveals and route
  transitions (`src/hooks/useReducedMotion.ts` plus a CSS block in `index.css`).

## Accessibility

Skip link, visible focus rings, ≥44 px touch targets, `aria-live` regions for async status, labelled
form controls, and keyboard-operable menus and uploads.

---

## Deploying

`vercel.json` is already configured:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Set the Vercel project **Root Directory** to `Upgraded_frontend/website`. The rewrite is required:
without it, a hard refresh on `/analyze` returns 404 because routing happens client-side.

---

## Limitations (honest ones)

- There is no account system, no saved history and no database. A refresh clears the current report;
  chats live in the tab only (the backend keeps a conversation in memory for at most 30 idle minutes).
- Scanned or image-only PDFs extract poorly — text-based PDFs give the best results.
- Long analyses can take up to a minute. The loading state shows elapsed time and honest activity
  labels, not a fake percentage, because the backend streams no progress.
- The sample report on the home page is clearly labelled **Sample data**; it is never presented as a
  real result.

## Legacy

The previous single-file version of this site (`index.html`, `script.js`, `style.css`) is preserved
in [`legacy/`](./legacy) for reference. It is not used by the app and is excluded from linting.
