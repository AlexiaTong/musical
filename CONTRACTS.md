# Musicals This Week — Permanent Contracts

Read this file before editing the project. Phase work must remain additive inside these seams.

## Listing response shape

Every `source.load(params)` result has: `region`, `selectedDate`, `dataDay`, `fetchedAt`, `source`, `listings`, and `warnings`. `source` always has `name` and `url`. `listings` and `warnings` are always arrays.

Every listing has all of these keys:

```text
id, region, title, theatre, city, performanceDate, performanceTimes,
lowestPrice, ticketStatus, detailUrl, bookingUrl, sourceName, sourceUrl,
retrievedAt, missingFields
```

`performanceTimes` and `missingFields` are arrays. `lowestPrice` is either `null` or an object with `amount`, `currency`, and `display`.

## Detail shape

Every detail has all of these keys:

```text
title, region, theatre, city, performanceFacts, ticketFacts, excerpt,
sourceName, sourceUrl, bookingUrl, retrievedAt, missingFields
```

`performanceFacts`, `ticketFacts`, and `missingFields` are arrays.

The Phase 0 local fixture also includes a private `id` solely so `source.detail(id)` can locate the record. The normalized value returned by `source.detail(id)` omits no documented detail key; Phase 1 will remove that private lookup field before rendering.

In Phase 2, the public detail action remains ID-based. `source.js` resolves that ID only from the most recently loaded in-memory set, then sends its region and approved detail URL to the same-origin detail route. The product exposes no arbitrary URL input.

## Required DOM IDs

Universal Phase 0 IDs are `app-shell`, `page-title`, `demo-title`, `working-indicator`, `main-action`, `empty-action`, `error-action`, `clear-action`, `status-message`, `error-message`, `empty-message`, `results-section`, `results-title`, and `results-list`.

Phase 1 adds `region-controls`, `date-controls`, `filter-controls`, `location-filter`, `budget-filter`, `budget-currency`, `clear-filters`, `comparison-title`, `comparison-list`, `compare-count`, `clear-comparison`, `detail-panel`, `detail-title`, `detail-content`, `close-detail`. Existing IDs remain unchanged and retain their Phase 0 roles.

## UI module

Universal functions:

```js
setBusy(isBusy)
setStatus(message)
showError(message)
showEmpty(message)
renderList(items)
clearResults()
```

The event seam `bindHandlers(handlers)` is established in Phase 0. Phase 1 adds and records:

```js
renderControls(viewModel)
renderComparison(items)
renderDetail(detail)
clearDetail()
```

`renderControls(viewModel)` receives selected region/date, seven date options, derived locations, selected filters, currency, and region label. `renderList(items)` may receive an `isCompared` display flag added by `app.js`; normalized source records are not mutated. `renderDetail(detail)` accepts a loading, result, or readable-error view model and always updates the one shared detail panel.

## Source module

`source.js` exports one object named `source` with four async methods:

```js
source.load(params)
source.detail(id)
source.save(record)
source.list()
```

`source.save(record)` always throws a readable “not used in this project” error. `source.list()` always returns `[]`.

## Phase 1 pure helper

`finder.js` contains only deterministic calendar, filtering, location, and comparison helpers. It has no DOM or data access. The sample fixture is anchored to `sampleBaseDate`; `source.js` shifts its dates into the current seven-day `Asia/Shanghai` window before returning the unchanged normalized listing shape.

## Phase 2 server seam

`source.load(params)` calls the same-origin `/api/shows` route with region, selected date, and the current Beijing `refreshDay`. `source.detail(id)` calls `/api/show-detail` only after resolving a displayed item. Server-only source configuration, Firecrawl access, normalization, URL validation, and response caching live under `api/`; browser contracts and normalized keys remain unchanged.

## Supported values

Supported region IDs are `broadway`, `west-end`, and `germany`.

Allowed ticket-status values are `on-sale`, `coming-soon`, `sold-out`, `closed`, and `unknown`. A missing booking button never implies `sold-out`.

## Missing-value policy

Keys are never omitted. Missing scalar text is `""`; a missing price is `null`; missing lists are `[]`. Missing optional listing or detail fields are named in `missingFields`. A missing price is never represented as zero.

## DO NOT CHANGE WITHOUT ASKING

- Filenames and layer responsibilities: markup in `index.html`; styles in `style.css`; orchestration in `app.js`; all DOM access and visible updates in `ui.js`; all browser data access in `source.js`; safe tunables in `config.js`.
- DOM IDs listed above.
- UI function names and conceptual signatures listed above.
- Source method names and signatures listed above.
- Normalized listing-response, listing-item, and detail keys listed above.
- Supported region IDs: `broadway`, `west-end`, and `germany`.
- Missing-value policy listed above.
