# Musicals This Week

Musicals This Week will help audiences compare performances across Broadway, the West End, and Germany for the coming seven days. The current code is **Phase 0 only**: a stable static foundation with local fictional data and generic controls that prove the application states and architecture.

It deliberately does not yet include musical-finder controls, live retrieval, Firecrawl, a backend, ticket inventory, purchasing, maps, accounts, saved comparisons, currency conversion, or notifications.

## Run locally

This project uses browser ES modules, so open it through a small local HTTP server rather than double-clicking `index.html`.

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

No dependency installation or environment file is required in Phase 0.

## Deploy

The intended public path is GitHub to Vercel as a plain static site. Connect the selected GitHub repository to a Vercel project and deploy the repository root without a build command. Deployment is performed only when explicitly authorized for the selected accounts and projects.

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
- `data/sample.json` is the fictional local fixture used in Phases 0 and 1.

Phase 2 will change the inside of `source.js` to use approved same-origin server routes while its public method names remain stable.
