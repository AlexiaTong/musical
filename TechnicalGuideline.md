# Musicals This Week - Technical Guideline

**Project category:** 2 - web retrieval  
**Purpose:** Give Codex the permanent architecture, contracts, security rules, and regression discipline for `ProjectGuideline.md`

---

## 1. Read This Before Every Phase

Before changing any file, Codex must:

1. read `ProjectGuideline.md` and this file completely;
2. read the repository's current `CONTRACTS.md` and `CHECKS.md` if they exist;
3. state the requested phase;
4. list the smallest set of files expected to change;
5. identify any requested change to a permanent contract;
6. stop and ask before changing anything under **DO NOT CHANGE WITHOUT ASKING**;
7. preserve every accepted check from earlier phases.

At the end of a phase, Codex must report files changed, dependencies added, checks passed/failed, security checks, public deployment result, and unresolved issues. Then it stops.

---

## 2. Fixed Stack

Use:

- HTML;
- CSS with custom properties;
- plain browser JavaScript using ES modules;
- Node.js-compatible Vercel serverless API routes only in Phase 2;
- built-in `fetch` where available;
- Firecrawl **Scrape** only;
- JSON;
- Git and GitHub;
- Vercel.

Do not install:

- React, Next.js, Vue, Svelte, Astro, or another frontend framework;
- a CSS framework;
- a bundler;
- a UI or state library;
- a linter or test runner merely for workshop convenience;
- a Firecrawl SDK when a small direct server-side HTTPS request is sufficient.

If a package later becomes genuinely necessary, Codex must stop and explain why before installing it.

---

## 3. Foundation File Structure

Phase 0 creates exactly:

```text
index.html
style.css
app.js
ui.js
source.js
config.js
data/sample.json
CONTRACTS.md
CHECKS.md
README.md
.gitignore
```

Create `.gitignore` first. It must include:

```text
.env
.env.local
node_modules
.DS_Store
```

Phase 2 may add the smallest server-only structure, for example:

```text
api/shows.js
api/show-detail.js
server/firecrawl.js
server/sources.js
server/normalize.js
server/time.js
```

These Phase 2 filenames are recommended rather than permanent. Add only files required by the working implementation. Do not reorganize the accepted Phase 0/1 browser files.

---

## 4. Permanent Layer Boundaries

### `index.html`

Contains semantic markup and required elements/IDs only. It does not contain application logic, inline event handlers, source URLs, or secrets.

### `style.css`

Contains all styling. Define colour, spacing, typography, radius, and layout tokens as CSS custom properties at `:root`. Include clear disabled, selected, loading, error, focus, card, comparison, and detail-panel styles plus one basic mobile/narrow-width breakpoint.

No JavaScript-generated style strings and no CSS framework.

During Phase 0, keep the stylesheet to roughly 120 lines, include one narrow-width breakpoint, and use no animation. Later phases may extend it additively, but should still avoid decorative complexity.

### `app.js`

Orchestrates state and calls other modules. It may:

- receive semantic UI events through `ui.bindHandlers()`;
- call `source.load(params)` and `source.detail(id)`;
- maintain current region/date/filter/compare/detail state;
- call pure helper functions;
- pass view models to `ui.js`.

It must not:

- call `fetch`;
- manipulate `innerHTML`, `textContent`, `classList`, attributes, or DOM elements directly;
- contain source URLs;
- render markup;
- contain an API key;
- duplicate source or UI logic.

### `ui.js`

Owns every DOM read, DOM event binding, and visible DOM update. No other module directly changes the page.

### `source.js`

Is the only browser-side data-entry seam.

- Phase 0/1: reads `data/sample.json`.
- Phase 2: changes the inside of `source.load()` and `source.detail()` to call same-origin server routes.
- No other browser module fetches data.

### `config.js`

Exports one frozen object containing every safe browser-side tunable value: sample-data path, result/compare limits, excerpt limits, timeouts, supported region IDs, feature flags, and display settings.

Secrets and server-only source URLs do not belong in browser `config.js`; keep them in a server-only configuration object in Phase 2.

No magic URL, result limit, timeout, or excerpt length may be scattered elsewhere.

---

## 5. Permanent UI Contract

`ui.js` must export and implement these exact universal functions from Phase 0:

```js
setBusy(isBusy)
setStatus(message)
showError(message)
showEmpty(message)
renderList(items)
clearResults()
```

Meaning:

- `setBusy(isBusy)`: disables relevant actions and shows/clears a working indicator.
- `setStatus(message)`: displays one plain status sentence; an empty string clears it.
- `showError(message)`: shows a readable user message, never a stack trace or raw response.
- `showEmpty(message)`: shows a successful-but-empty state.
- `renderList(items)`: renders result cards from normalized items.
- `clearResults()`: clears the result area.

Add these project-specific seams by Phase 1 and record them in `CONTRACTS.md`:

```js
bindHandlers(handlers)
renderControls(viewModel)
renderComparison(items)
renderDetail(detail)
clearDetail()
```

Meaning:

- `bindHandlers(handlers)`: binds DOM events once and emits semantic payloads to `app.js`.
- `renderControls(viewModel)`: renders/updates region, date, location, budget, and selected states.
- `renderComparison(items)`: renders zero to three normalized items in the compare panel.
- `renderDetail(detail)`: renders one normalized detail object.
- `clearDetail()`: resets/closes the shared detail panel.

Do not rename these functions or change their conceptual inputs without stopping for approval and updating `CONTRACTS.md`.

Every visible state must be deliberately triggered and inspected at least once.

---

## 6. Permanent Source Contract

`source.js` exports one object named `source` with these exact async methods:

```js
source.load(params)
source.detail(id)
source.save(record)
source.list()
```

### `source.load(params)`

- Phase 0/1: returns normalized data from `data/sample.json`.
- Phase 2: calls the same-origin listings route and returns the same shape.

### `source.detail(id)`

- Phase 0/1: finds and returns the sample detail for one loaded item.
- Phase 2: finds the selected item in the most recent in-memory loaded set and calls the detail route using that item's approved `detailUrl`.
- The public method remains ID-based; arbitrary user-entered URLs are never accepted.

### `source.save(record)`

Persistence is excluded. This method throws a readable **not used in this project** error. Do not silently store records.

### `source.list()`

Persistence is excluded. This method returns `[]`.

The method names are permanent seams. Live integration changes their internals, not their callers.

All four methods remain `async`, including the unused persistence methods.

### Phase 0 wiring proof

The generic main control must call `source.load()`, then pass the returned items to `ui.renderList()`. Around that call, `app.js` uses `setBusy`, `setStatus`, `showEmpty`, and `showError`. Force one controlled error during testing to prove that the error state is readable and clears correctly.

---

## 7. `CONTRACTS.md` Requirements

Phase 0 creates `CONTRACTS.md`. It must contain:

1. exact item and detail shapes;
2. every required DOM ID;
3. universal and project-specific `ui.js` function names;
4. all four `source.js` method names;
5. supported region identifiers;
6. allowed ticket-status values;
7. missing-value policy;
8. a heading named **DO NOT CHANGE WITHOUT ASKING**.

Under that heading, list:

- filenames/layer responsibilities;
- DOM IDs;
- UI function names and conceptual signatures;
- source method names and signatures;
- normalized response/item/detail keys;
- supported region IDs;
- missing-value policy.

Keys are never omitted. Missing scalar values are `""` or `null` according to the contract; missing lists are `[]`.

### `README.md` requirements

Phase 0 also records these permanent rules in `README.md` so they survive a new Codex conversation:

1. Read `CONTRACTS.md` before editing.
2. Stop before changing anything under **DO NOT CHANGE WITHOUT ASKING**.
3. Work additively inside existing seams.
4. Implement one approved phase at a time.
5. Put safe human-tunable values in `config.js` and server-only values in server configuration.
6. Keep browser data access inside `source.js`.
7. Keep visible DOM work inside `ui.js`.
8. Keep secrets server-side and out of files, commits, logs, and responses.
9. Run all of `CHECKS.md` before a checkpoint.
10. Debug one reproduced symptom at a time.
11. End each phase with changed files, dependencies, check results, unresolved issues, and a stop.

The README also explains in plain language what the project does, how to run it locally, how to deploy it, and what it deliberately excludes.

---

## 8. Listing Data Contract

The live/sample load result has this shape:

```js
{
  region: "broadway",
  selectedDate: "2026-09-13",
  dataDay: "2026-09-13",
  fetchedAt: "2026-09-13T02:15:00.000Z",
  source: {
    name: "Broadway Direct",
    url: "https://broadwaydirect.com/shows/"
  },
  listings: [],
  warnings: []
}
```

One listing has every key:

```js
{
  id: "stable-source-derived-id",
  region: "broadway",
  title: "Example Musical",
  theatre: "Example Theatre",
  city: "New York",
  performanceDate: "2026-09-13",
  performanceTimes: ["14:00", "19:30"],
  lowestPrice: {
    amount: 58.39,
    currency: "USD",
    display: "Tickets from $58.39"
  },
  ticketStatus: "on-sale",
  detailUrl: "https://approved-source.example/show/example",
  bookingUrl: "https://approved-ticket-page.example/example",
  sourceName: "Example Source",
  sourceUrl: "https://approved-source.example/show/example",
  retrievedAt: "2026-09-13T02:15:00.000Z",
  missingFields: []
}
```

Allowed `ticketStatus` values:

- `on-sale`
- `coming-soon`
- `sold-out`
- `closed`
- `unknown`

Never infer sold out from a missing booking button.

`lowestPrice` is `null` when unavailable. Never use zero for missing price.

---

## 9. Detail Data Contract

One detail result has every key:

```js
{
  title: "Example Musical",
  region: "broadway",
  theatre: "Example Theatre",
  city: "New York",
  performanceFacts: ["Saturday performances listed at 14:00 and 19:30"],
  ticketFacts: ["Tickets advertised from $58.39"],
  excerpt: "A short factual excerpt from the approved detail page.",
  sourceName: "Example Source",
  sourceUrl: "https://approved-source.example/show/example",
  bookingUrl: "https://approved-ticket-page.example/example",
  retrievedAt: "2026-09-13T02:15:00.000Z",
  missingFields: []
}
```

Return one detail at a time. Bound the excerpt and fact arrays through configuration. Do not return raw markdown, a full page, reviews, images, seat maps, or seat inventory.

---

## 10. Pure Filtering and Comparison Logic

If Phase 1 needs a helper module, add one small pure module rather than putting rendering in `app.js` or data access in `ui.js`.

### Date

The selected date controls the loaded result context. In Phase 2 it becomes an API parameter.

### Location

- Derive choices from loaded `city` and `theatre` values.
- Do not call a map/geocoding service.
- Match normalized text without inventing locations.

### Budget

- Interpret budget in the selected region's source currency.
- Compare only with numeric `lowestPrice.amount`.
- Exclude unknown-price listings while a budget is active and expose a readable explanation.
- Do not convert currencies.

### Comparison

- Maximum three items, set in `config.js`.
- Only one region/date context.
- Clear on region/date change.
- Browser memory only.
- Preserve unavailable fields.

---

## 11. Phase 2 Server Routes

### Listings

`GET /api/shows?region=<region>&date=<YYYY-MM-DD>&refreshDay=<YYYY-MM-DD>`

Rules:

- allow only `broadway`, `west-end`, and `germany`;
- require a real date in the server-calculated seven-day `Asia/Shanghai` window;
- require `refreshDay` to equal server-calculated Beijing today;
- select source URLs from server configuration only;
- return the listing contract or `{ error: { code, message } }`;
- never expose stack traces, secrets, or raw scraped content.

### Detail

`POST /api/show-detail`

Rules:

- one region and one URL per action;
- URL must come from the selected normalized item's `detailUrl`;
- accept only `http:`/`https:` and the approved content hosts for that region;
- reject credentials in the URL, localhost/private/internal targets, malformed URLs, and redirects to an unapproved host;
- return the detail contract;
- no arbitrary user input field is exposed in the product.

### Approved content hosts

Keep the allowlist server-side:

- `broadwaydirect.com` and `www.broadwaydirect.com`
- `officiallondontheatre.com` and `www.officiallondontheatre.com`
- `stage-entertainment.de` and `www.stage-entertainment.de`
- `broadway.com` and `www.broadway.com`
- `londontheatredirect.com` and `www.londontheatredirect.com`
- `musical1.de` and `www.musical1.de`

Booking URLs may lead to an approved external seller, but that does not make the seller eligible for deep-read scraping.

---

## 12. Firecrawl Rules

Use Firecrawl **Scrape**, never unrestricted **Crawl**.

### Listing retrieval

- Prepared public pages or one fixed, same-source public catalogue filter only.
- Strict JSON schema.
- Explicit selected date and region in the extraction instruction.
- Extract musicals only.
- Return a bounded number of items.
- Treat extraction as untrusted input and validate it.
- Discard items without explicit selected-date evidence.

### Detail retrieval

- Exactly one allowlisted detail page per user action.
- No recursive link following.
- One bounded normalized result.

### Never

- accept arbitrary user scrape URLs;
- crawl a whole domain;
- bypass login, CAPTCHA, robots rules, or access controls;
- query live seats;
- interact with checkout;
- call multiple ticket APIs or aggregate reseller APIs;
- send a raw Firecrawl response to the browser;
- retry without a strict limit.

If a source requires bypassing access controls, mark it unavailable and stop for a scope decision.

---

## 13. Firecrawl Extraction Instruction

Use wording similar to:

> Extract only musical-theatre performances that this prepared public source explicitly supports for the requested calendar date and region. Exclude plays, concerts, opera, archived productions, navigation, editorial articles, and promotional blocks. Return the exact visible title, theatre, city, selected performance date, all visible performance times for that date, lowest explicitly advertised price with currency, explicit ticket-sale wording, an approved same-source detail URL, direct booking URL when present, and source URL. Use empty values for unavailable fields. Do not infer, translate, convert currency, or invent facts. Return no more than the configured limit.

Validate the result after extraction. The extraction instruction is not a substitute for runtime checks.

---

## 14. Validation and Accuracy

For each listing:

1. require a non-empty title;
2. require the requested region;
3. require `performanceDate` to equal the requested date;
4. accept valid normalized local times only;
5. accept non-negative finite prices only;
6. preserve source currency and **from** wording;
7. validate all URLs and schemes;
8. allow deep read only from the region allowlist;
9. cap all text and arrays;
10. remove exact duplicates;
11. sort by earliest known performance time, then title;
12. list every unavailable optional field in `missingFields`;
13. limit one region/date response through `config.js`/server configuration.

Do not use a title-only fuzzy merge. Do not infer that a general run date proves a performance on every day.

---

## 15. Daily Caching

- Use `Asia/Shanghai` for the seven-day window and `refreshDay`.
- Include `refreshDay` in the GET URL so a new Beijing day produces a new cache key.
- Validate the value server-side.
- Cache only successful, shared, non-sensitive GET listing responses.
- Use intentional Vercel caching headers with a conservative explainable TTL.
- Keep browser caching short or disabled when appropriate.
- Include `dataDay` and `fetchedAt`.
- Do not cache the POST detail response as if it were the shared listing response without an explicit safe reason.
- Do not promise execution at exactly midnight or a single worldwide scrape.

---

## 16. Secret Rules

Use exactly:

`FIRECRAWL_API_KEY`

- Local: not required for this project; do not create a local key file merely to run the deployed flow.
- Vercel: selected project environment settings.
- Server-side only.
- Never in `config.js`, `source.js`, frontend assets, Markdown, fixtures, screenshots, logs, errors, JSON responses, or commits.
- Inspect staged changes and browser-accessible assets before checkpointing.
- Do not print the key while debugging.

---

## 17. UI State Rules

The following states must be visually different and manually tested:

- initial;
- busy/loading;
- status/instruction;
- successful results;
- no verified performances from the prepared source;
- filters produced zero matches;
- missing optional field;
- source partial warning;
- source failure;
- malformed/invalid request;
- detail loading;
- detail result;
- detail failure;
- fourth comparison item rejected.

Use plain user-facing sentences. Never display a raw response, exception, stack trace, authorization detail, or secret name/value beyond a safe configuration message.

---

## 18. `CHECKS.md` Requirements

Create a numbered manual regression list that can be run quickly. Phase 0 begins with:

1. page loads with no console errors;
2. main action produces a result;
3. empty state is visible;
4. error state is visible and readable;
5. busy state appears and clears;
6. status appears and clears;
7. clear-results works;
8. layout is usable at 375px;
9. no secret appears in tracked files;
10. `app.js` does not fetch or manipulate the DOM;
11. `source.js` is the only browser data-entry seam;
12. `ui.js` owns visible DOM updates.

At the end of every phase:

- add checks for the new behavior;
- never delete or weaken an earlier check;
- run the full list;
- report every line as pass, fail, or blocked.

Phase 1 adds region/date/filter/compare/detail-sample checks. Phase 2 adds live route, validation, Firecrawl, allowlist, timezone rollover, cache, error-isolation, and public deployment checks.

---

## 19. GitHub and Vercel Discipline

After each passing phase:

1. inspect the working tree;
2. ensure unrelated user changes remain untouched;
3. run `CHECKS.md` completely;
4. inspect for secret leakage;
5. create the phase's named Git checkpoint when authorized;
6. push only to the selected repository;
7. wait for the existing Vercel project to redeploy;
8. test the public URL, not only localhost;
9. stop at the phase gate.

Do not repeat first-time project import after every phase.

---

## 20. Permission Rules

Use least privilege:

| Permission | Preferred scope |
|---|---|
| Project files | Current project/task |
| Localhost | Allow once |
| Internet/source testing | Current phase/once |
| Package access | Only after explaining a genuine need |
| Git | Current repository |
| GitHub | Selected project repository |
| Vercel | Selected project |
| Browser/screen control | Current supervised session only when necessary |

Close unrelated sensitive windows before granting visual/browser control. Do not request access to unrelated repositories, projects, accounts, or folders.

---

## 21. Non-Negotiable Exclusions

Do not add:

- live seat inventory;
- ticket purchase, reservation, payment, or checkout;
- maps or geocoding;
- accounts, login, profiles, favourites, or saved comparisons;
- unrestricted, recursive, or whole-site crawling;
- multiple ticket APIs or reseller aggregation;
- user-entered scrape URLs;
- database or persistent history;
- exact-midnight scheduler;
- currency conversion;
- notifications;
- separate AI provider;
- chatbot, RAG, embeddings, vector database, or agent framework;
- frontend/CSS framework, bundler, state library, or UI library;
- Docker or custom CI/CD.

If Codex believes an excluded component is required, it must stop and explain the conflict instead of adding it.

---

## 22. Failure Recovery

Use:

**observe -> reproduce -> isolate -> change one thing -> retest**

1. Identify one visible symptom.
2. Determine whether it belongs to UI, orchestration, source seam, server validation, Firecrawl/source extraction, caching, or deployment.
3. Change the smallest relevant code.
4. Retest the symptom.
5. Run the full regression list.
6. Do not rename permanent seams, reorganize the project, add a provider, or redesign the UI as a debugging shortcut.

---

## 23. Guard Prompt for Every Later Phase

> Before changing anything, read `ProjectGuideline.md`, `TechnicalGuideline.md`, `CONTRACTS.md`, and `CHECKS.md`. Tell me which phase I requested and list the smallest set of files you expect to change. Tell me whether the request would change anything under **DO NOT CHANGE WITHOUT ASKING**; if so, stop and explain. Implement only the requested phase additively. All browser data access remains inside `source.js`; all DOM work remains inside `ui.js`; all safe tunables remain in `config.js`; secrets remain server-side. When finished, add new regression checks without removing old ones, run the full checklist, report files/dependencies/results/unresolved issues, and stop.
