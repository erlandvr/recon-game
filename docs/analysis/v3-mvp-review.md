# V3.1 — playable MVP review record

2026-10-20 · **Historical candidate A delivery evidence.** Candidate B supersedes the maintenance tuning: see [current maintenance review](v3-maintenance-review.md). This record retains the first MVP results; local browser screenshots now reflect the latest checked build.

Local `codex/v3` implementation. The original sandbox remains historical. This record concerns the production V3 mode and candidate A, not deployed behavior or observed visitor comprehension.

## Review point

Run `npm run dev`, choose **V3**, then **Start V3**. The three-second countdown holds the run at zero; gameplay begins at GO. Build, hire, save or buy automation. Pause & plan allows spending while all work and costs are held. Reach 1,200 spendable credits to freeze the workshop and result. Play again returns to a fresh opening. No V3 score submission is implemented.

The simple board shows reserved destinations, assembly at right-side benches, oversized carried machines, installation, broken panels, developer repair trips and returns. Recon takes the oldest repair, including work already in a developer's hands, and keeps completed repair work. The released developer returns along the travelled path. Detailed shelf props, radar motion, gold-piece tosses and celebration belong to later slices.

## Configuration and implementation choices

- Source: `src/v3Game.ts` and `src/v3World.ts`. UI/lifecycle: `src/V3Game.tsx`, `src/V3Board.tsx`, `src/v3-game.css`. The Speed/Long simulation is untouched.
- Use the specification's candidate costs, wages, income, five-second assembly, one-second installation, six-second developer repair, four-second Recon repair, 12-system cap and four-developer cap.
- Fixed 50 ms simulation steps; income uses the operating state during the preceding step. The first cash-target crossing freezes all work, cash, time and purchases on that step. Results have 0.05-second resolution.
- Stable world coordinates and 150 world units/second along measured polylines. Routes pass below machines and then approach the actual work position. Across all 48 worker/destination pairs, one-way travel is **1.67–7.56 seconds**, median **4.39 seconds**, before rounding phase completion to the next 50 ms tick. The proposed four–six-second range is typical guidance, not a uniform journey guarantee.
- Age begins at installation, advances during outages and stops during pauses. Repair does not reset age. Operating-time failure hazard increases continuously as the interval decreases from 60 to 40 seconds by age 90. Each subsequent interval has seeded ±15% variation; one outstanding incident per system. The initial machine first fails at 22 seconds. New systems do not inherit that special opening event.
- Browser runs start with seed 31 for comparable retries. Benchmark seeds vary. Hidden tabs hold gameplay and countdown; fractional visible active time survives pause/resume. Manual camera position survives purchases/growth; Fit workshop restores the overview.
- Recon is required before Plus; no recurring automation charge. These implement the specification's recommended defaults and remain part of the candidate economy.
- **Owner-confirmed cash rule:** a visible negative balance is permitted; wages and work continue. Purchases still require enough cash. No dismissals, bailout, interest or bankruptcy mechanic. The late-spending fixture buys one developer and two systems at second 21, reaches **−3.91 credits**, then recovers to **104.75 credits at second 51**. The initial report before route refinement was −3.21; the approved behavior is the same.

## Strategy results

Reproduce with `npm run v3:mvp:benchmark`. The [machine-readable evidence](v3-mvp-benchmark-a.json) contains every purchase timestamp, finish facts, income/wages, minimum cash, total developer occupation by phase, queue waiting and idle time. Eight policies × five seeds × two reaction intervals (one and three seconds) give **80 paid runs**. Another nine runs delay the first action by 10, 30 or 60 seconds. All finish within the 15-minute observation bound; the game itself has no time limit.

| Policy | Median finish | Range | Interpretation |
| --- | --- | --- | --- |
| Save, no purchases | 9:26.45 | 9:13.05–9:26.45 | Legal win; far outside event pacing. |
| Four-system estate, no Recon | 3:06.50 | 2:58.15–3:10.95 | Small-estate saving remains viable. |
| Expand with one developer, no Recon | 3:07.40 | 3:04.90–3:12.60 | Maintenance and return trips compete with construction. |
| Hire to three developers, no Recon | 2:34.00 | 2:32.00–2:36.15 | Hiring can meet the pacing target without automation. |
| Mixed expansion, second hire, Recon and Plus | 2:02.63 | 2:02.15–2:03.10 | Strongest tested policy; near the intended very-good run. |
| Save for Recon, then expand | 3:18.68 | 3:17.75–3:19.80 | Early automation delays growth. |
| Save for both automation tiers first | 4:59.95 | 4:55.20–5:00.75 | Plus has little useful work at the initial estate size. |
| Hire four first, then expand and automate | 3:40.23 | 3:38.35–3:44.15 | Upfront hiring delays productive expansion. |

No baseline strategy enters material negative cash. The separate late-spending case above exposes a recoverable deficit and is covered by the confirmed rule. These policies are comparisons, not an exhaustive optimization or proof of multiple equally attractive strategies. The mixed route reaches Recon while developers are still committed to queued construction, so it records no developer takeovers; dedicated paid browser cases validate those transitions separately. Check in human review whether normal play exposes the maintenance/capacity story clearly enough. No medal thresholds were added. The two–three-minute ambition is met by the strongest and hiring-only routes; weaker investment paths still exceed it. Waiting/enjoyment and choice clarity need human review.

## Mature capacity and bursts

Twenty separate ten-minute stress fixtures cover five seeds, one/three Recon slots, and staggered/all-at-once initial failures. They start with 12 fully aged systems and **no developer repair assistance**. Cash is reset between samples to prevent victory ending the capacity test; these are deliberately not paid gameplay runs. Uptime is sampled every 250 ms after a 60-second warm-up.

- Plus averages **90.29–91.02% uptime** across these fixtures, versus **82.09–83.12%** for base Recon.
- Three four-second repair slots provide nominal service capacity of **0.75 jobs/second**. Twelve systems at the nominal 40-second mature interval demand **0.30 jobs/second** before outage suppression; the lowest varied interval of 34 seconds gives about **0.353 jobs/second**. This leaves service headroom, not guaranteed zero waiting.
- The artificial all-system opening burst clears by **16.25 seconds** with Plus at the sampling resolution. Later bursts still reach seven simultaneous broken systems in the checked samples. Their downtime is real, not hidden by a health-based victory gate.
- One incident per system and operating-only failure accumulation suppress demand during downtime. These results do not establish behavior under a different arrival model or unlimited estate size.

## Verification and limits

- Engine checks: `tests/v3.test.ts` covers paid purchases/caps, FIFO, non-interruption, parallel builds, stable destinations, real route durations, income at installation, return occupancy, both takeover positions, retained repair progress, exclusive ownership, paused purchasing/dispatch, bounded ageing, wages, cash-only victory/freeze, deterministic update batches, and the approved deficit/recovery rule.
- Browser runner: `tests/v3-browser.ts` compares real paid UI actions with the engine, tests countdown/hidden hold/GO/focus, pause, reduced motion, manual camera preservation, viewport fit, results/retry, no backend requests, and outward/mid-repair takeover. The supplementary `tests/v3-layout-browser.ts` checks the three entry tiles, Long entry, negative-balance display/recovery and takeover label spacing. Both runners pass; local screenshots and the main report are under ignored `test-results/v3-mvp/`.
- **120 automated tests and the `/recon-game/` production-base build pass. Four paid Chromium runs match the engine exactly: 122.50s, 152.70s, 190.95s and 222.70s, with both no-Recon and automated wins. Separate paid browser checks verify outward and mid-repair takeover.** The inherited Speed opening regression is checked because V3 reuses its countdown with optional label/focus/reduced-motion props; Speed defaults remain unchanged.
- Human first-time play and bystander comprehension remain unperformed. Safari and a full accessibility audit remain unperformed. Basic keyboard controls, native modal behavior and reduced motion are included; this is not an accessibility certification.
- Detailed art, supply-shelf props, coin-flight feedback, radar choreography and route-overlap polish remain V3.2. Contextual hints and victory party remain V3.3; attract mode and final event validation remain V3.4. No public V3 ranking, merge or deployment is part of this local slice.
