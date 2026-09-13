# Phase 1 Regression Checks

Run every numbered check before a checkpoint. Record each as pass, fail, or blocked; never delete or weaken an earlier check.

1. **Page load:** serve the project over HTTP and confirm the page loads with no console errors.
2. **Main action:** choose **Load sample** and confirm two generic sample cards appear.
3. **Empty state:** choose **Show empty state** and confirm a readable successful-but-empty message appears.
4. **Error state:** choose **Show error state** and confirm the controlled error is readable and no stack trace appears.
5. **Busy state:** choose a load action and confirm the working indicator appears, actions disable, and both recover afterward.
6. **Status state:** confirm status text changes after actions and clears with **Clear results**.
7. **Clear results:** load cards, choose **Clear results**, and confirm cards and transient messages are removed.
8. **Narrow layout:** at 375px wide, confirm text is readable, controls are usable, and there is no horizontal scrolling.
9. **Secret scan:** confirm no tracked file contains a credential or API key value.
10. **App boundary:** confirm `app.js` contains no `fetch`, DOM query, DOM mutation, source URL, or rendering markup.
11. **Source boundary:** confirm `source.js` is the only browser module that reads external/local data.
12. **UI boundary:** confirm `ui.js` owns all DOM queries, event binding, and visible DOM updates.
13. **Detail seam:** in a module-capable browser console, confirm `source.detail("foundation-curtain-call")` resolves to the deeper sample record.
14. **Persistence exclusions:** confirm `source.list()` resolves to `[]` and `source.save({})` rejects with a readable “not used in this project” error.
15. **Phase boundary:** confirm there are no packages, API routes, secrets, live sources, or scraping code; the only additions beyond Phase 0 are the approved Phase 1 product controls and pure helper.
16. **Regions:** switch among Broadway, West End, and Germany; confirm the selected state and listings update.
17. **Seven dates:** confirm seven dates begin on the current `Asia/Shanghai` day and cross month/year boundaries correctly.
18. **Context reset:** add a comparison item and open a detail, then change region or date; confirm both clear.
19. **Location filter:** confirm choices derive from the current loaded city/theatre values and filtering does not reload the fixture.
20. **Budget filter:** set a maximum budget; confirm known prices filter numerically in the region currency and unknown prices are excluded with an explanation.
21. **Clear filters:** confirm the current region/date sample set returns without a new source request.
22. **Comparison:** compare one, two, and three cards; confirm a fourth is rejected readably and removals work.
23. **Shared detail:** open two details in sequence; confirm the second replaces the first in the one shared panel and no private `id` is rendered.
24. **Missing fields:** confirm missing time, price, status, or booking values use readable unavailable labels and are never inferred.
25. **Responsive and keyboard:** confirm the product remains usable without horizontal scrolling at 375px and all controls have visible keyboard focus.

## Phase 2 Regression Checks

26. **Earlier checks:** confirm the permanent Phase 0/1 contracts and applicable interaction checks still pass.
27. **Feasibility report:** confirm all six approved sources and their date-evidence results are recorded.
28. **Normalized regions:** confirm all three live regions return the permanent listing response and item keys.
29. **Input validation:** reject invalid region, date, and `refreshDay` with readable JSON errors.
30. **Selected-date evidence:** discard every extracted item not explicitly tied to the requested date.
31. **Local facts:** preserve source performance times and USD/GBP/EUR values without conversion.
32. **Missing values:** return every key and list unavailable optional fields in `missingFields` without guessing.
33. **Live filters:** confirm date, location, and numeric budget filters operate on normalized live results.
34. **Live comparison:** confirm up to three live cards compare and a fourth is rejected readably.
35. **Bounded detail:** confirm one displayed item retrieves exactly one allowlisted page into the shared detail panel.
36. **Detail URL security:** reject malformed, credential-bearing, cross-region, localhost, private/internal, and unapproved detail URLs and unapproved redirects.
37. **Failure isolation:** confirm listing and deep-read failures remain readable and do not destroy accepted controls.
38. **Beijing rollover:** confirm a new Beijing `refreshDay` produces a new listing URL/cache key.
39. **Shared cache:** confirm only successful listing GETs receive the intentional shared 15-minute cache and six-hour stale window.
40. **Secret isolation:** confirm `FIRECRAWL_API_KEY` appears only as a server-side environment-variable name and no credential appears in Git, browser files, logs, or responses.
41. **Response isolation:** confirm no raw Firecrawl body or stack trace reaches the browser.
42. **Scope exclusions:** confirm there is no live seat query, purchase, map, account, crawl, ticket API, or arbitrary scrape URL.
43. **Production usability:** confirm syntax/tests, keyboard focus, and the 375px layout remain healthy.
44. **Public definition of done:** confirm the public Vercel root, three listing journeys, one detail journey, and readable error paths work.

## Latest run

Run on 2026-09-13 against `http://127.0.0.1:4173`:

1. PASS — page loaded and the browser console reported no errors.
2. PASS — the preserved main action rendered two foundation sample cards.
3. PASS — the preserved successful empty state displayed its readable message.
4. PASS — the controlled error displayed without a stack trace.
5. PASS — the working indicator appeared, controls disabled, and both recovered.
6. PASS — status text changed after actions and cleared.
7. PASS — clear results removed cards and transient messages.
8. PASS — at 375px, body text was 16px, visible buttons were at least 44px high, and horizontal overflow was false.
9. PASS — the tracked-runtime credential-pattern scan found no secret-like values.
10. PASS — `app.js` contains no fetch, DOM, source URL, or rendering markup access.
11. PASS — the runtime data-access scan found `fetch` only in `source.js`.
12. PASS — the DOM-access scan found visible DOM work only in `ui.js`.
13. PASS — `source.detail("foundation-curtain-call")` returned `Curtain Call`.
14. PASS — `source.list()` returned `[]`; `source.save({})` returned the required readable error.
15. PASS — there are no packages, API/server routes, secrets, live sources, or scraping code; additions are limited to approved Phase 1 files.
16. PASS — all three region controls loaded four region-specific day-one samples and updated currency/selection.
17. PASS — seven Beijing-calendar dates rendered; the 2026-12-29 test rolled correctly through 2027-01-04.
18. PASS — changing region cleared a three-item comparison and hid the open detail panel.
19. PASS — Germany location choices came only from loaded cities/theatres; Hamburg filtered to two cards locally.
20. PASS — an 80 USD budget showed two of four Broadway cards and explained that one unknown-price item was excluded.
21. PASS — clear filters restored all four current-context cards without a source request.
22. PASS — one, two, and three comparison cards rendered; a fourth produced the readable limit message.
23. PASS — opening `Midnight Matinee` then `Harbor Lights` replaced the one shared detail result; the private lookup ID was omitted.
24. PASS — intentionally missing time, price, status, facts, and booking values rendered readable unavailable states.
25. PASS — keyboard focus styles are present; the 375px browser check had 16px body text, 44px visible buttons, and no horizontal overflow.
