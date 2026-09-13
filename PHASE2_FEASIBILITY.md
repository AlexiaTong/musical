# Phase 2 Source Feasibility

The gate ran on 2026-09-13 from the deployed Vercel project using server-side Firecrawl Scrape. It tested fixed prepared pages only, returned strict bounded JSON, and did not expose raw scrape output or the API key.

| Region | Source | Test date | Result | Evidence |
|---|---|---:|---|---|
| Broadway | Broadway Direct | 2026-09-13 | Not date-feasible | The prepared shows page exposed titles, theatres, prices, statuses, and links but no explicit selected-date performance or time. |
| Broadway | Broadway.com | 2026-09-15 | Pass | Its catalogue homepage returned fifteen date-explicit musicals with times, prices, availability, detail pages, and booking links in the production diagnostic. |
| West End | Official London Theatre | 2026-09-15 | Not date-feasible | The prepared musicals page returned no musical explicitly connected to the selected date. |
| West End | London Theatre Direct | 2026-09-15 | Pass | Its public catalogue date filter returned 27 musicals for the exact date in one request, including theatre, advertised price, and approved detail/booking links; catalogue times are honestly marked unavailable. |
| Germany | Stage Entertainment | 2026-09-19 | Not date-feasible | The prepared landing page returned no musical explicitly connected to the selected date. |
| Germany | Musical1 | 2026-09-13 | Pass | Multiple Hamburg musicals exposed explicit date, local times, theatres, advertised EUR prices, availability, detail pages, and booking links. |

The live adapters therefore use Broadway.com, London Theatre Direct, and Musical1. Broadway and Germany use one bounded Firecrawl catalogue scrape. London Theatre Direct uses the same fixed public date-filter request as its catalogue UI, while its approved detail pages remain available for Firecrawl deep reads. Coverage is intentionally limited to verified facts and is not a claim of exhaustive market coverage.
