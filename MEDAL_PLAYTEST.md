# Autonomy medals — calibration and playtest

## Current calibration — D87, 2026-10-10

Simulation and scoring now begin together on **Start game**. D91 (2026-10-12): all chapter briefing reading is now free, including reopened chapters; unhealthy active time still counts. The full simulation pauses while a chapter briefing is open, at either speed. Engine policy benchmarks and medal thresholds below are unchanged; the recorded browser replay predates this presentation change. Normal game time remains the scoring unit at 1× and 2×.

Efficiency now discounts new automatic-scan setups as well as recurring scans. Tier prices are 20/100/500/2500/6000; setup prices after each tier are 210/199.5/168/105/31.5. Already purchased coverage receives no refund. Automatic repair setup remains 480. The former D86 economic lower bound and investment advice below no longer apply.

Reran all 20 prior policies, then tested saving for tiers 4 and 5 before buying automation. On seed 1: the old lean tier-2 policy finished at 1306.5s; buying higher models whenever available but continually buying automation finished at 1300.5s; deliberately saving for tier 4 finished at 1261.5s; saving for tier 5 finished at **1251.5s**. Tier 5's 6000-credit incremental cost saves 73.5 per new setup versus tier 4: 82 subsequent setups repay it even before scan savings. Buying it after most coverage is installed remains a poor race investment.

The fastest tested route: maintain health with manual scan/repair, buy the efficiency tiers when affordable while retaining 60 credits, buy both speed upgrades and a second slot in expansion, expand to five slots at corporate growth, postpone scan/repair automation until tier 5, then buy both coverages as funds permit and maintain uncovered repositories. Finish with hands off for the trial. This policy uses current visible symptoms and prices, never injected funds or future-event knowledge. It is an idealized reactive policy, not proof of a global optimum.

| Seed | One-second decisions | Five-second decisions |
| --- | --- | --- |
| 1 | 20:51.5 | 20:55.5 |
| 7 | 20:53.5 | 21:00.5 |
| 42 | **20:49.5** | 20:55.5 |
| 12345 | 20:53.5 | 21:00.5 |
| 987654321 | 20:51.5 | 20:55.5 |

**Retain Gold ≤25:00, Silver ≤30:00, Bronze thereafter.** These leave about 20% / 44% above the fastest tested route. Human completion times have not been measured; the extra margin is intentional rather than tightening medals around perfect input.

A complete fresh Chromium replay on seed 1 submitted **579 normal paid commands**, reached **1251.5s (display 20:52)**, verified intermediate credit balances, earned Gold, continued another 90 seconds without changing the result, reopened it and restarted. Result dialogs fit at 1280×800, 800×700 and 390×844. Synthetic time compresses wall duration without skipping engine ticks. No claim of human-speed clicking or subjective enjoyment.

Evidence: `test-results/d87-seed-validation.json`, `test-results/medal-save-model-5-1.json`, `test-results/medal-playthrough-browser.json`. D86 artifacts were copied to `test-results/d86-medal-baseline/` before recalibration. Durable summary is this file; generated artifacts may be removed.

Reproduce:

```sh
node scripts/medal-benchmark.ts save-model-5 1
MEDAL_PLAN=test-results/medal-save-model-5-1.json PLAYWRIGHT_MODULE_DIR=/Users/erland/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node tests/medal-playthrough-browser.mjs
```

Use seeds 1, 7, 42, 12345 and 987654321; for five-second decisions import `play` and `strategies`, then pass `{...strategies[4], saveForEfficiency:true, reaction:5}`. Human sessions are pending in [HUMAN_PLAYTEST.md](HUMAN_PLAYTEST.md).

## Historical D86 baseline — superseded economy and start timing

The remaining sections preserve the original calibration; use D87 above for current strategy and prices.

Date: 2026-10-10. Decision D86. Rules: 120 + 360 healthy seconds, 80% progress threshold, 100 repositories, 210/480-credit scan/repair coverage, 60-second autonomy trial. Recalibrate if those rules or the economy change.

## Result and medal thresholds

The fastest **tested** strategy reached autonomy in 1,312.5 game seconds (21:52.5). This is a tested benchmark, not a proof of the globally optimal action sequence. A complete fresh browser replay on seed 1 reached 1,313.5 seconds, displayed as **21:54**, with every action submitted through the ordinary UI and paid at the normal price.

| Medal | Total elapsed game time | Rationale |
| --- | --- | --- |
| Gold | At most 25:00 | About 14% room above the fastest tested route for reading, navigation and imperfect decisions. |
| Silver | Over 25:00, at most 30:00 | About 37% room above the benchmark for recovery and less efficient investment. |
| Bronze | Over 30:00 | Every completed autonomous company deserves a finish medal. No timeout or failure cutoff. |

These margins are design choices informed by the benchmark, not measured human completion-time percentiles. Human difficulty/enjoyment testing remains outstanding.

The clock is the existing total ecosystem time, from a fresh run until the immutable victory tick. It includes unhealthy periods and the autonomy trial. D91 excludes paused chapter reading. It does not use healthy time or just the last chapter. 2× changes wall-clock duration, not the scoring unit; interaction and non-chapter dialogs while running at 2× consume game time at that rate; chapter briefings consume none. No saving/offline progression was added. Compare exact half-second time against inclusive thresholds; round the displayed finish time upward to a whole second so a silver finish at 25:00.5 displays 25:01, not 25:00.

## Search method and results

Used the real `newGame`, `act`, and `advance` engine. No extra credits, removed findings, forced health, skipped chapters, debug starts or future-event knowledge. The policy reacts to current symptoms, known findings, available credits and installed coverage. It pays for every action; manual repair-all and shared slots/queues follow normal rules. Twenty strategy configurations were compared on seed 1: eight broad policies and twelve capacity/efficiency/automation-timing variants. Multiple affordable commands can be submitted at a decision instant; this is assisted, idealized input, not a measurement of human motor speed.

| Policy on seed 1 | Finish (exact game seconds) |
| --- | --- |
| Five slots, manual until all 100 repositories | 1,319.5 |
| Five slots, automate during growth, efficiency tier 1 | 1,317.5 |
| Five slots, automate during growth, efficiency tier 2 | 1,315.5 |
| Five slots, target efficiency tier 3 | 1,318.5 |
| Five slots, target efficiency tier 5 | 1,318.5 |
| Three slots, one early slot, efficiency tier 1 | 1,315.5 |
| No speed upgrades | 1,319.5 |
| Five-second decisions, five slots | 1,325.5 |
| Best lean search: three slots, tier 2, automate during growth | **1,313.5** |
| Two slots, tier 1, wait until 100 to automate | 1,356.0 |

“Target tier 5” invests when affordable; it only reached tier 4 before victory. The expensive model ceiling was not useful within the measured run. Spending more on efficiency or five work slots was not the fastest route in this comparison.

Validation of the best lean policy:

| Layout seed | One-second decisions | Five-second decisions |
| --- | --- | --- |
| 1 | 21:53.5 | 22:15.5 |
| 7 | 21:57.5 | 22:15.5 |
| 42 | **21:52.5** | 22:10.5 |
| 12345 | 21:57.5 | 22:15.5 |
| 987654321 | 21:54.5 | 22:15.5 |

An optimistic economic lower bound is roughly 21:00.5–21:04 across those seeds: assume earliest possible growth, perfect health, **free** maintenance and upgrades, and wait until income can pay the mandatory 69,000 credits of coverage plus the 35-credit reserve, then add the 60-second trial. This deliberately unattainable ideal is about 52–55 seconds faster than the tested policy; the benchmark is already close to the economy's limit. It does not prove optimality.

## Fastest practical route found

1. Scan symptoms and repair known findings promptly. Keep progress eligible so chapter 1 finishes at 02:00 and corporate expansion begins at 08:00.
2. Buy scan-efficiency tiers 1 and 2, keeping a 35-credit working reserve. Avoid the much more expensive tiers during the race to autonomy.
3. Buy faster scans, then faster repairs. One work slot handled the early chapters in the best policy; expand to **three** at corporate growth.
4. Add automatic scans as funds permit while continuing manual repairs on uncovered repositories. Add automatic repairs when affordable, preserving the reserve. Continue covering newly connected repositories.
5. Once every repository has both automations and manual work is finished, let the autonomous trial run without manual intervention.

Seed 1 purchase/milestone example: tier 1 at 00:08; tier 2 at 01:28; faster scans at 02:39; faster repairs at 03:18; first automatic scans at 04:13; slots 2 and 3 at 08:00/08:01; 100 repositories at 17:42; last automatic repair purchase at 20:53; victory at 21:53.5. These are outcomes of this seeded policy, not prescribed deadlines for players.

## Implementation and verification

- `src/medals.ts`: tier thresholds, exact classification, rounded-up finish display.
- `src/game.ts` / `src/campaign.ts`: record medal and practice status with the immutable victory time.
- `src/VictorySummary.tsx`: medal badge, frozen total time, timing explanation and medal targets; reused by the final chapter, Victory panel and milestones.
- Final chapter replaces the completed roadmap with the result, and uses **Keep playing**. Chapter 1 retains **Start game**; other chapter introductions retain **Start Next Chapter**.
- A later-level debug jump shows a labelled **medal preview** with coached time, not an earned award. Merely opening Debug changes nothing. Starting backend/restart/new page starts a fresh eligible run.
- All 68 engine/map/story tests pass, including medal boundaries, display rounding, practice status and immutable victory after more play. Production build passes.
- A full fresh paid browser replay executes all 553 manual commands on seed 1, checks intermediate credit balances against the engine, reaches the expected victory, verifies the Gold medal is earned rather than a debug preview, waits another 90 seconds to verify the frozen result, reopens it, and restarts cleanly. Synthetic clock advancement compresses the test's real duration; it does not skip simulation ticks.
- Earned result screenshots inspected at 1280×800 and 390×844; dialog has no internal scrolling at those sizes or 800×700. Existing story browser journey also passes, including the debug victory preview.
- Reports and detailed paid action traces: `test-results/medal-*.json`; browser report `test-results/medal-playthrough-browser.json`. Generated artifacts are ignored by Git; the durable numerical summary is this document.

Reproduce all 20 baseline strategies: `node scripts/medal-benchmark.ts`.

Reproduce the browser plan: `node scripts/medal-benchmark.ts slots3-eff2-auto1 1`, then run `tests/medal-playthrough-browser.mjs` with the local Playwright module path (same setup as other browser scripts). CLI accepts an optional strategy name and layout seed. `play(seed, strategy, true)` also supports custom decision intervals and emits a full paid-action trace.
