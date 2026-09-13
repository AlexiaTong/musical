# Phase 2 Source Feasibility

The gate ran on 2026-09-13 from the deployed Vercel project using server-side Firecrawl Scrape. It tested fixed prepared pages only, returned strict bounded JSON, and did not expose raw scrape output or the API key.

| Region | Source | Test date | Result | Evidence |
|---|---|---:|---|---|
| Broadway | Broadway Direct | 2026-09-13 | Not date-feasible | The prepared shows page exposed titles, theatres, prices, statuses, and links but no explicit selected-date performance or time. |
| Broadway | Broadway.com | 2026-09-15 | Pass | Wicked, Gershwin Theatre, New York, 7:00pm, advertised USD price, availability, detail page, and booking link were explicit. |
| West End | Official London Theatre | 2026-09-15 | Not date-feasible | The prepared musicals page returned no musical explicitly connected to the selected date. |
| West End | London Theatre Direct | 2026-09-15 | Pass | Hadestown, Lyric Theatre, London, 14:30 and 19:30, advertised GBP price, availability, detail page, and booking link were explicit. |
| Germany | Stage Entertainment | 2026-09-19 | Not date-feasible | The prepared landing page returned no musical explicitly connected to the selected date. |
| Germany | Musical1 | 2026-09-13 | Pass | Multiple Hamburg musicals exposed explicit date, local times, theatres, advertised EUR prices, availability, detail pages, and booking links. |

The live adapters therefore use Broadway.com, London Theatre Direct, and Musical1. Coverage is intentionally limited to facts exposed by those prepared pages and is not a claim of exhaustive market coverage.
