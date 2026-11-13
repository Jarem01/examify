# Examify

A Quizlet-style study platform for the "Exam 11/5–11/13" set (210 terms), with seven study modes, a graded practice test, and a PDF/prose importer.

**Live app: <https://jarem01.github.io/examify/>** — no install, works on a phone or laptop. Everything runs in the browser and your progress is saved on that device.

## Run it locally

Requires **Node.js 20 or newer**.

```bash
npm ci        # install exact dependency versions from package-lock.json
npm run dev   # http://localhost:3000
```

Production build:

```bash
npm run build   # writes a static site to out/
npm start       # or serve out/ with any static file server
```

## How hosting works

The app is a Next.js static export (`output: 'export'`) — there is no server, no database and no API. `npm run build` emits plain HTML/CSS/JS into `out/`, which is what makes it runnable from GitHub Pages.

`.github/workflows/pages.yml` builds and publishes `out/` on every push to `main`. The build sets `NEXT_PUBLIC_BASE_PATH=/examify` so asset paths resolve under `https://<user>.github.io/examify/`; locally the variable is unset and the app serves from the root.

Because the site is served from a subpath on Pages, a project page must keep that base path — if you fork this to a differently named repo, change `/examify` in the workflow.

## Where your data lives

Sets and progress are stored in your browser's **localStorage** under `examify.db.v1`. On first visit the store is seeded from `lib/seed-data.ts`, so the 210-term set is always there to start from.

Consequences worth knowing:

- Progress is **per browser and per device** — it does not sync, and a different browser starts fresh.
- Clearing site data resets your progress (back to the seed set).
- Imported sets stay in that browser; export anything you want to keep by re-importing the source text or PDF.

## Study modes

| Mode | What it does |
| --- | --- |
| **Flashcards** | Flip cards, shuffle, mark terms known, text-to-speech |
| **Learn** | Adaptive rounds of 7–10 cards in a progress ring (N/210). A term counts as learned only after two consecutive correct answers; missed questions are re-asked after the round with a "You missed this question" banner |
| **Test** | Static graded run mixing multiple choice, true/false and matching, with a report and grade at the end |
| **Match** | Clear all pairs against the clock; wrong pairs add a time penalty |
| **Blast** | Timed scoring with lives, impact feedback and resume |
| **Blocks** | Clear every pair from a board |
| **Charms** | Find matching pairs across a charm grid |

Every answer is **selection-only** — no typing required. Settings let you pick the accent colour, choose which question types appear, set the Learn round size (7–10), and toggle text-to-speech.

## Importing your own sets

The importer (`Import` in the sidebar) accepts:

- **Delimiter-separated text** — term/definition split by tab, comma, semicolon or a custom character; cards split by new line or semicolon. A live preview shows the parsed count as you type.
- **PDF upload** — text is extracted **in the browser** with `unpdf` and its bundled PDF.js build, then parsed automatically. First extraction takes a few seconds while PDF.js loads.
- **Prose Q&A dumps** — Quizlet/Word exports where each question is followed by its answer are auto-detected when delimiter parsing yields fewer than two cards. The parser strips Quizlet headers, `N / 10` footers and URLs, repairs hyphenated line breaks, respects quotes and abbreviations, and handles essay markers such as `— Point 3` and `(Point 3)`.

## Project layout

```
app/            the single page, layout and global CSS
components/     sidebar, set view, one view per study mode, import and settings modals
lib/            seed data, browser store, question builders, learn engine, parsers
.github/        Pages build-and-deploy workflow
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Static export into `out/` |
| `npm start` | Serve the production output |
