# Examify

A Quizlet-style study platform for the "Exam 11/5–11/13" set (210 terms), with five study modes, a graded practice test, and a PDF/prose importer.

## Quick start

Requires **Node.js 20 or newer**.

```bash
npm ci        # install exact dependency versions from package-lock.json
npm run dev   # start the dev server
```

Then open <http://localhost:3000>.

To run the production build instead:

```bash
npm run build
npm start     # serves the build on http://localhost:3000
```

Port 3000 is the default. To use another port: `npm run dev -- -p 4000`.

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
- **PDF upload** — text is extracted on the server with `unpdf`, then parsed automatically.
- **Prose Q&A dumps** — Quizlet/Word exports where each question is followed by its answer are auto-detected when delimiter parsing yields fewer than two cards. The parser strips Quizlet headers, `N / 10` footers and URLs, repairs hyphenated line breaks, respects quotes and abbreviations, and handles essay markers such as `— Point 3` and `(Point 3)`.

## Data

Sets and progress live in `data/db.json`, a plain JSON file written by the API routes in `app/api/`. It is **not committed** — on first run it is regenerated from `lib/seed-data.ts`, so a fresh clone starts with the full 210-term set and zero progress.

Because state is a local file, the app expects a normal Node server with a writable disk (local, or a container/VM with a persistent volume).

## Project layout

```
app/            routes, layout, global CSS, API handlers
  api/extract   PDF → text (server-side unpdf)
  api/parse     text → cards (delimiter + prose parsers)
  api/sets      set CRUD
  api/progress  per-term progress
components/     sidebar, set view, and one view per study mode
lib/            seed data, store, question builders, learn engine, parsers
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
