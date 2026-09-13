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

## Required DOM IDs

Universal Phase 0 IDs are `app-shell`, `page-title`, `demo-title`, `working-indicator`, `main-action`, `empty-action`, `error-action`, `clear-action`, `status-message`, `error-message`, `empty-message`, `results-section`, `results-title`, and `results-list`.

Phase 1 may add IDs for its region, date, filter, comparison, and shared-detail controls, but existing IDs are not renamed or repurposed.

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

## Source module

`source.js` exports one object named `source` with four async methods:

```js
source.load(params)
source.detail(id)
source.save(record)
source.list()
```

`source.save(record)` always throws a readable “not used in this project” error. `source.list()` always returns `[]`.

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
