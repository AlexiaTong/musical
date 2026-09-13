# Phase 0 Regression Checks

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
15. **Scope:** confirm there are no packages, API routes, secrets, live sources, scraping code, or product filters/comparison controls.

## Latest run

Run on 2026-09-13 against `http://127.0.0.1:4173`:

1. PASS — page loaded and the browser console reported no errors.
2. PASS — the main action rendered two sample cards.
3. PASS — the empty state displayed its readable message.
4. PASS — the controlled error displayed without a stack trace.
5. PASS — the working indicator appeared, buttons disabled, and both recovered.
6. PASS — status text changed and cleared.
7. PASS — results and transient messages cleared.
8. PASS — at 375px, body text remained 16px, buttons were 44px high, and no horizontal overflow appeared.
9. PASS — the credential-pattern scan found no secret-like values.
10. PASS — the `app.js` prohibited-pattern scan found no fetch, DOM, URL, or markup access.
11. PASS — the runtime data-access scan found `fetch` only in `source.js`.
12. PASS — the DOM-access scan found DOM work only in `ui.js`.
13. PASS — `source.detail("foundation-curtain-call")` returned the deeper sample record.
14. PASS — `source.list()` returned `[]`; `source.save({})` returned the required readable error.
15. PASS — the runtime scope scan found no packages, API routes, scraping, live sources, or product controls.
