# Musicals This Week

Musicals This Week helps audiences compare verified performances across Broadway, the West End, and Germany for the coming seven Beijing-calendar days. The current code is **Phase 2**: the accepted interface now reads normalized live information through bounded Vercel routes while preserving the Phase 0/1 contracts.

It includes region/date selection, location and budget filters, missing-value states, an in-memory three-card comparison, and one shared deep-read panel. Live retrieval uses Firecrawl Scrape against one prepared public page per request. It deliberately excludes live seat inventory, purchasing, maps, accounts, saved comparisons, currency conversion, notifications, unrestricted crawl, and arbitrary URLs.

## Run locally

This project uses browser ES modules, so open it through a small local HTTP server rather than double-clicking `index.html`.

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

No dependency installation is required. `FIRECRAWL_API_KEY` is configured only in the Vercel project environment; this project does not require a local environment file.

## Deploy

The public path is GitHub to Vercel. The repository root serves the static browser interface and the `api/` directory provides the two Node.js-compatible serverless routes.

## Permanent working rules

1. Read `ProjectGuideline.md`, `TechnicalGuideline.md`, `CONTRACTS.md`, and `CHECKS.md` before editing.
2. Stop before changing anything under **DO NOT CHANGE WITHOUT ASKING** in `CONTRACTS.md`.
3. Work additively inside existing seams.
4. Implement one approved phase at a time.
5. Put safe human-tunable values in `config.js` and server-only values in server configuration.
6. Keep browser data access inside `source.js`.
7. Keep visible DOM work inside `ui.js`.
8. Keep secrets server-side and out of files, commits, logs, and responses.
9. Run all of `CHECKS.md` before a checkpoint.
10. Debug one reproduced symptom at a time.
11. End each phase with changed files, dependencies, check results, unresolved issues, and a stop.

## Architecture

- `index.html` contains semantic structure only.
- `style.css` contains all visible styling and responsive rules.
- `app.js` orchestrates state and calls the UI and source seams.
- `ui.js` owns every DOM read, event binding, and visible update.
- `source.js` is the only browser-side data-entry seam.
- `config.js` contains safe browser settings.
- `finder.js` contains pure date, filter, location, and comparison helpers.
- `data/sample.json` remains available only to the collapsed Phase 0 regression controls; the primary Phase 2 journey uses live routes.
- `api/shows.js` validates the Beijing seven-day listing request and returns normalized live cards.
- `api/show-detail.js` validates one approved detail URL and returns one bounded normalized detail.
- `api/_lib/live.js` owns server-only source selection, host allowlists, Firecrawl Scrape, validation, normalization, and readable errors.

The public `source` method names and UI functions remain stable across all phases.
