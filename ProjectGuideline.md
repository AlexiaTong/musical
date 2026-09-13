# Musicals This Week - Project Guideline

**Audience:** Codex and a university student learning to build with Codex, GitHub, and Vercel  
**Project category:** 2 - web retrieval  
**Build mode:** Three lock-step phases with a test, Git checkpoint, public deployment, and stop gate after each phase  
**Companion file:** `TechnicalGuideline.md`

---

## 1. Product Goal

Build a desktop-first website that helps musical audiences find and compare performances without searching many scattered social accounts and theatre websites.

The completed MVP lets a visitor:

- choose **Broadway**, **West End**, or **Germany**;
- choose one of the next seven dates;
- filter that day's results by location and maximum budget;
- compare up to three musical cards;
- see title, theatre, city, date, performance time, lowest advertised price, and ticket-sale status where the source provides them;
- request one deeper factual read for one selected musical;
- open an external source or booking link;
- see when the information was last refreshed;
- understand when information is missing or a source is unavailable.

The website does not sell tickets. It helps the visitor decide what to investigate and then sends them to the source or booking page.

---

## 2. Jobs-to-be-Done Statement

> When I am deciding which musical to attend during the coming week, I want to compare performances across my chosen theatre region by date, time, location, price, and ticket availability, so I can confidently find a suitable show without searching many scattered accounts and websites.

### Job dimensions

- **Functional:** Find and compare suitable performances.
- **Emotional:** Feel confident that important information has not been missed.
- **Social:** Make an informed plan that is easy to share with companions.

---

## 3. Intended Audience

Primary users are musical-theatre audiences planning a visit during the coming week, including travellers and students who want a quick comparison before opening multiple ticket sites.

The first build is desktop-first. It must remain usable at a basic narrow width, but a mobile-first redesign is not part of the MVP.

---

## 4. Prepared Public Sources

Use the six user-approved public source families below. Phase 2 listing retrieval uses the first date-feasible source for each region; approved alternatives remain documented rather than being treated as implicit fallback data.

| Region | Prepared source | Starting page | MVP coverage meaning |
|---|---|---|---|
| Broadway | Broadway Direct | `https://broadwaydirect.com/shows/` | Approved, but its prepared listing page did not expose selected-date times in the Phase 2 gate. |
| Broadway | Broadway.com | `https://www.broadway.com/` | Date-feasible catalogue homepage used by the live adapter. |
| West End | Official London Theatre | `https://officiallondontheatre.com/london-musicals/` | Approved, but its prepared listing page did not expose selected-date times in the Phase 2 gate. |
| West End | London Theatre Direct | `https://www.londontheatredirect.com/` | Catalogue homepage plus a bounded set of approved musical detail pages used by the live adapter. |
| Germany | Stage Entertainment Germany | `https://www.stage-entertainment.de/` | Approved, but its prepared landing page did not expose selected-date times in the Phase 2 gate. |
| Germany | Musical1 | `https://www.musical1.de/musicals/hamburg/` | Date-feasible prepared Hamburg listing used by the live adapter. |

“All relevant musicals” means all performances that these bounded source adapters can reliably verify for the selected region and date. The site must not claim exhaustive market coverage.

Before live integration, Codex must verify that every source is publicly accessible and that Firecrawl can retrieve useful date-supported content. If a source cannot support the core date journey, Codex must stop and report the evidence gap instead of inventing data or adding another provider.

---

## 5. Core User Journey

1. The visitor opens **Musicals This Week** and immediately sees a simple Broadway-poster visual identity.
2. The visitor selects Broadway, West End, or Germany.
3. The visitor selects one of seven dates calculated using the Beijing calendar.
4. The website loads verified musical listings for that region/date.
5. The visitor optionally filters by location and maximum budget.
6. The visitor may select up to three cards for comparison.
7. The visitor may choose **View details** on one card.
8. One shared detail panel displays a deeper factual result from one approved page.
9. The visitor opens the external source or booking link to confirm current information or continue toward purchase.

Changing region or date clears the comparison and detail panel so information from different contexts is not mixed.

---

## 6. Required Interface

### Header

- Product name: **Musicals This Week**
- Subtitle: **Seven days of Broadway, West End, and German musical performances**
- Visible **Last refreshed** value after live data loads
- Visible disclaimer: **Prices and availability can change. Confirm current details on the linked ticket page.**

### Region controls

- Broadway
- West End
- Germany

Use accessible buttons with an unmistakable selected state.

### Seven-day controls

Show seven dates beginning with the current date in `Asia/Shanghai`. Each control shows weekday plus day/month. Handle month and year rollover.

Performance times remain in the theatre's displayed local time; do not convert them to Beijing time.

### Filters

- **Location:** choices come only from city/theatre data in the loaded result.
- **Maximum budget:** interpreted in the selected region's source currency.
- **Clear filters:** restores the loaded result set without an unnecessary new scrape.

When a budget is active, a listing with no verified price does not qualify. Explain that it was excluded because its price is unknown; never treat missing price as zero.

### Musical cards

Prioritize:

1. title;
2. theatre and city;
3. selected performance date;
4. one or more verified performance times;
5. lowest advertised price or unavailable label;
6. ticket-sale status or unavailable label;
7. source attribution;
8. external booking/source link;
9. **Add to compare**;
10. **View details**.

### Comparison

- Compare no more than three cards.
- Compare only cards from the current region and date.
- Align title, location, times, advertised price, status, and source/booking link.
- Preserve unavailable labels.
- Permit removal and clear-all.
- Keep comparison in browser memory only; do not save it.

### Detail/deep-read panel

- One shared panel, not one result box per card.
- Show one selected musical at a time.
- Show loading, result, unavailable, and retry states.
- Display only a short factual excerpt and normalized details.
- Keep the source/booking link visible.
- Do not return or display raw scraped markdown, full page text, reviews, seat maps, or seat-level data.

---

## 7. Look and Feel

Use a Broadway-poster-inspired design:

- deep theatre red;
- black or near-black;
- warm cream;
- restrained gold accents;
- bold theatrical headings;
- highly readable body text;
- playbill/poster-inspired borders and cards;
- a subtle CSS-only marquee motif;
- generous spacing and strong hierarchy.

Do not use copied show artwork, video backgrounds, heavy animation, carousels, or an elaborate design system. Colour must not be the only indicator of selection, status, or error.

---

## 8. Accuracy Rules

- Never invent a title, theatre, city, date, time, price, status, or link.
- A performance appears under a date only when the source explicitly supports that date.
- A general run date does not prove a performance occurs every day.
- Preserve the source currency: USD, GBP, or EUR.
- Do not perform currency conversion.
- Keep wording such as **Tickets from** when the value is only an advertised starting price.
- A missing booking button does not mean sold out.
- Use **Unavailable from source** or **Unknown** for missing optional fields.
- Every listing must retain source attribution and retrieval time.
- External booking links open in a new tab with safe link attributes.
- Final price and availability must be confirmed on the linked site.

---

## 9. Daily Freshness Rule

The MVP does not run an unattended job at exactly 00:00.

Instead:

1. the app calculates the current calendar day in `Asia/Shanghai`;
2. listing requests include that day as `refreshDay`;
3. the server independently validates it;
4. the full region/date/refresh-day URL becomes the response-cache key;
5. the first request for a new Beijing day retrieves or revalidates current information;
6. later visitors may receive the cached shared response;
7. every response includes `dataDay` and `fetchedAt`.

Caching is best-effort. The product must not promise a single worldwide scrape or execution exactly at midnight.

---

# 10. Three Build Phases

Codex must read this file and `TechnicalGuideline.md` before every phase. It implements only the explicitly requested phase and stops at the phase gate.

---

## Phase 0 - Universal Foundation

### Purpose

Create a stable, deployed scaffold before building product features. This is a foundation task, not a feature task.

### Required structure

Create exactly this foundation structure:

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

Create `.gitignore` first with `.env`, `.env.local`, `node_modules`, and `.DS_Store`.

### Required behavior

- `source.load()` reads `data/sample.json`.
- The main action renders the generic sample list.
- Busy, status, empty, error, list, and clear states are each visible and manually tested.
- `source.detail(id)` returns one sample item in more depth.
- Because persistence is excluded, `source.save()` throws a readable **not used in this project** error and `source.list()` returns `[]`.
- No product controls, real sources, scraping, backend, packages, keys, or live data are added.
- The static foundation is deployed through GitHub to Vercel.

### Acceptance criteria

1. All required files exist and match `TechnicalGuideline.md`.
2. `.gitignore` was created before any secret file.
3. The page loads locally without console errors.
4. The generic main action produces a sample result.
5. Busy, status, empty, error, list, and clear states are visibly proven.
6. `app.js` does not fetch or manipulate the DOM.
7. `source.js` is the only data-entry seam.
8. `ui.js` owns all visible DOM updates.
9. `CONTRACTS.md`, `CHECKS.md`, and `README.md` contain the required permanent rules.
10. No package, API route, key, scraping, or product feature exists.
11. `CHECKS.md` passes.
12. Git checkpoint and public Vercel deployment succeed when authorized.

### Suggested checkpoint

`Phase 0 - foundation`

### Stop gate

Report created files, checks, local URL, Git/GitHub status, and public Vercel URL. Stop and wait for approval. Do not begin Phase 1.

---

## Phase 1 - Product Experience with Sample Data

### Purpose

Build the complete musical-finder interaction using final-shape sample data while preserving the Phase 0 seams. No real network retrieval is introduced yet.

### Additive work

- Expand `data/sample.json` with fictional Broadway, West End, and Germany listings in the final contract shape.
- Add region and seven-day selection.
- Add local location and budget filters.
- Add musical cards and missing-field states.
- Add comparison for up to three cards.
- Add the shared sample detail panel through `source.detail(id)`.
- Apply the approved Broadway-poster visual direction.
- Add only the smallest pure helper module if filtering/comparison logic would otherwise violate the `app.js` or `ui.js` boundaries.
- Update `CONTRACTS.md`, `CHECKS.md`, and `README.md` additively; do not remove earlier checks.

### Required behavior

- Region/date changes update the sample context.
- Location choices derive from loaded sample data.
- Budget filtering uses known numeric prices and explains unknown-price exclusion.
- Clear filters restores the current sample set.
- One, two, and three cards compare correctly; a fourth is rejected readably.
- Comparison and detail clear when region/date changes.
- **View details** replaces one shared sample detail result.
- All visible states still go through `ui.js`.
- All data still enters through `source.js`.

### Acceptance criteria

1. Every Phase 0 regression check still passes.
2. Broadway, West End, and Germany controls work.
3. Seven Beijing-calendar dates render correctly.
4. Date, location, and budget filtering works with sample data.
5. Unknown prices are handled honestly.
6. Comparison works up to three cards and blocks a fourth.
7. Comparison/detail reset on context change.
8. The shared sample detail action works.
9. The poster style remains readable and keyboard accessible.
10. Layout works at desktop width and remains usable at 375px.
11. No real source, Firecrawl call, API key, backend route, live seat data, purchase, map, account, crawl, or ticket API exists.
12. Updated `CHECKS.md` passes.
13. Git checkpoint and public Vercel deployment succeed when authorized.

### Suggested checkpoint

`Phase 1 - sample musical finder experience`

### Stop gate

Report changed files, checks, public behavior, and limitations. Stop and wait for approval. Do not begin Phase 2.

---

## Phase 2 - Live Retrieval, Deep Read, Daily Refresh, and Polish

### Purpose

Replace the inside of the Phase 1 data seams with safe live retrieval while keeping the accepted interface and contracts stable.

### Source-feasibility gate

Before interface integration, test each prepared source for:

- public access;
- identification of musicals;
- explicit selected-date evidence;
- performance times;
- theatre/city;
- advertised price;
- ticket status/action;
- source/detail link;
- useful Firecrawl Scrape output.

If a source cannot support the date journey, stop and report the exact gap and smallest options. Do not invent facts, enable Crawl, or add another API.

### Additive work

- Add the approved Vercel serverless routes.
- Change the inside of `source.load(params)` to call the listing route.
- Change the inside of `source.detail(id)` to call the detail route for the selected loaded item.
- Preserve the permanent `source` method names and UI functions.
- Add server-only prepared-source configuration and URL allowlists.
- Add strict Firecrawl JSON extraction, validation, normalization, deduplication, limits, and readable errors.
- Add Beijing-day request/cache behavior and **Last refreshed**.
- Replace sample labels with live source attribution.
- Complete loading, empty, filtered-to-zero, partial, source-failure, and deep-read-failure states.
- Complete accessibility and layout polish.
- Add all new regression checks without removing earlier checks.

### Listing route

Recommended contract:

`GET /api/shows?region=<region>&date=<YYYY-MM-DD>&refreshDay=<YYYY-MM-DD>`

Accept only the three approved regions and dates in the current Beijing seven-day window. Source URLs are selected server-side.

### Detail route

Recommended contract:

`POST /api/show-detail`

One action may scrape exactly one approved detail URL associated with a displayed listing. Validate the region, scheme, hostname, redirects, and private-network restrictions server-side.

### Acceptance criteria

1. Every earlier regression check still passes.
2. The source-feasibility report is complete.
3. All three regions use one normalized listing contract.
4. Invalid region/date/refresh inputs fail readably.
5. Every displayed performance has explicit selected-date evidence.
6. Local theatre times and source currencies remain unchanged.
7. Missing data is labelled rather than guessed.
8. Date/location/budget filters work on live normalized results.
9. Up to three live cards compare correctly.
10. **View details** retrieves exactly one allowlisted page into one shared bounded panel.
11. Unapproved, malformed, credential-bearing, redirecting, or private/internal detail URLs are rejected.
12. Source/detail failure does not blank accepted UI behavior.
13. A new Beijing `refreshDay` creates a new listing cache path.
14. Successful shared listing responses use intentional safe caching headers.
15. `FIRECRAWL_API_KEY` remains server-side and absent from Git, bundles, logs, and responses.
16. No raw scrape or stack trace reaches the browser.
17. No live seat inventory, ticket purchase, map, account, unrestricted crawl, or multiple ticket API is added.
18. Accessibility, 375px usability, and production build checks pass.
19. The public Vercel URL passes the complete definition of done.

### Suggested checkpoint

`Phase 2 - live retrieval deep read and polish`

### Final stop gate

Report source feasibility, files, dependencies, checks, security review, cache behavior, public URL, and known coverage limits. Stop. Do not add more sources or excluded features without a new approved specification.

---

## 11. Explicit Exclusions

The MVP excludes:

- live seat inventory;
- ticket purchase, reservation, payment, or checkout;
- maps or geocoding;
- accounts, login, profiles, favourites, or saved comparisons;
- unrestricted, recursive, or whole-site crawling;
- multiple ticket APIs or reseller aggregation;
- user-entered scrape URLs;
- database or persistent history;
- exact-midnight scheduler or cron job;
- notifications or alerts;
- currency conversion;
- reviews, ratings, or social feeds;
- copied show artwork;
- separate AI provider;
- chatbot, RAG, embeddings, vector database, or agent framework;
- frontend framework, CSS framework, bundler, state library, or UI library;
- Docker or custom CI/CD.

An external booking/source link is included when trustworthy. The visitor completes any purchase outside this website.

---

## 12. Overall Definition of Done

Another student can open the public URL without coaching and:

1. recognize the Broadway-poster identity;
2. choose Broadway, West End, or Germany;
3. choose one of seven dates;
4. filter by location and budget;
5. compare up to three cards;
6. open one deeper factual result;
7. identify missing information and source limitations;
8. see the source and refresh time;
9. open the external booking/source link;
10. recover from empty or failed results;
11. explain that the site retrieves prepared public information but does not crawl freely, show live seats, or sell tickets;
12. explain the architecture: UI -> `source.js` -> Vercel route -> Firecrawl/prepared source -> normalized JSON -> `ui.js`.
