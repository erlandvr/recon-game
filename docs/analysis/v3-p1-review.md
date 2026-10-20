# V3.3 — P1 interruption feedback

2026-10-20 · D161 / V3-F005 · local `codex/v3` · Ready for review.

**Historical evidence before shared features (D162).** See [feature review](v3-features-review.md) for current behaviour and timings.

The owner confirmed that occasional P1 failures should interrupt developer work and show a system on fire. Ordinary failures keep their existing queue behaviour. This is feedback on V3.3; V3.4 has not started. No merge or deployment was performed.

## Delivered behaviour

- Existing failures receive a seeded 20% P1 chance after the first ordinary opening failure. This frequency is an implementation candidate for playtesting. Severity has an independent deterministic stream; it does not add failure demand or consume threshold random draws.
- A free Recon bay takes the oldest P1 first, then ordinary repairs in arrival order. Busy bays finish their current repair. If Recon is occupied, prefer an idle developer, then the nearest eligible developer by actual walking distance. One developer responds per P1. An existing P1 response is never interrupted by another; additional emergencies wait in arrival order when necessary.
- Save the exact phase, elapsed work, repair fraction and physical position. Keep paused jobs reserved, preserve visible bench assembly or park a carried machine at the interruption point. Walk along existing aisles at the normal speed to repair the emergency, then back to the saved position before resuming. Another P1 during that return retains the original saved task.
- Recon handoff retains partial repair work. The developer resumes paused work immediately via real travel. If Recon also takes the paused repair, the developer returns to the bench rather than retrieving obsolete work.
- Fire and an explicit P1 badge stay on the failed system until actual completion. Crew, machine and Recon-bay status identify the urgency. Help and a dismissible event hint explain interruption and saved progress. Paused builds are labelled. Fire animation freezes on pause and has a static reduced-motion equivalent.
- Costs, wages, repair speeds, the 36/26s ageing curve, local zero-income failure, approved negative cash and cash-only victory remain unchanged. Pause and victory freeze both active and saved work. Speed/Long mechanics and backend behaviour are unaffected.

## Verification

**141 automated tests pass**, including 15 P1 tests. They cover all six active phases, same-tick failure interruption before ordinary work completes, exact positions/progress, valid orthogonal travel, idle preference, simultaneous P1s, repeated interruption during resumption, free/busy Recon, priority/retained work, obsolete saved repairs, ordinary FIFO, pause/victory and deterministic severity. The production-base build and TypeScript check pass.

Paid Chromium checks use real controls and compare cash, active time, phase and worker coordinates with the pure engine:

- A four-system saving route interrupts delivery at 42.50s (underlying failure at 42.45s). The paused cargo stays in place through two P1s; delivery resumes at 70s with saved progress. A later paid Recon purchase takes a P1 without teleporting, and the fire clears only at repair completion.
- Pause for 20 seconds, static reduced motion and 1024×768 / 1280×720 / 1440×900 / 1920×1080 layouts pass. Inspected screenshots are in `test-results/v3-p1/`, with assertions/results in `results.json`.
- The full paid V3 suite passes: mixed **2:13.35**, hiring-only **2:59.65**, small estate **4:42.00**, four developers **4:13.65**. UI time/cash match the engine. Ordinary Recon handoffs, countdown/hidden hold, pause-and-buy, camera, negative-cash recovery, victory freeze and retry remain covered.
- Workshop regression passes with real one/three bay ownership, retained percentages, stable assignments, completion cues, pause, reduced motion and four viewport sizes.
- Journey regression passes: Help/keyboard/focus, opt-in sound, hints and a paid **4:08.00** no-Recon victory during unfinished delivery. The party leaves cash/time and unfinished work frozen. No V3 backend requests or page errors were observed.

These timings supersede pre-P1 timings. Prior delivery reports remain historical; their candidate B benchmark is preserved as `v3-mvp-benchmark-b.json`.

## Balance evidence and limits

The [pre-feature benchmark](v3-mvp-benchmark-p1.json) contains 80 paid strategy runs (eight policies, five seeds, one/three-second reaction intervals), nine delayed starts and 20 mature-capacity fixtures. All paid and delayed runs finish. Median mixed play is 130.50s; three developers without Recon 181.675s; four-system saving 286.10s; pure saving 646.65s. Slower legal strategies remain outside the event pacing goal.

Across the mature maximum-estate fixtures without developer assistance, Plus maintains **85.41–86.43% mean uptime** and clears the artificial all-system opening burst in **16–16.25s**. Nominal service remains 0.75 jobs/s against 12/26 = 0.462 jobs/s mature demand before outage suppression. P1 priority does not add demand. Four early developers can briefly reach −12.47 credits and recover under the existing shortage rule.

The seed-31 mixed run sees five P1s and two developer interruptions; the four-system saving run sees four P1s and three interruptions. Fast repair can restore income earlier as well as delaying construction, so P1s do not uniformly make every strategy slower. The purpose is credible urgency and visible interrupted work, not an extra numerical punishment.

Owner judgement of frequency and fire readability, unassisted novice/spectator comprehension, Safari and a full accessibility assessment remain unperformed. Simulation and automated browser checks do not establish enjoyment or event readiness.

## Reproduce

```sh
npm test
npm run build -- --base=/recon-game/
npm run v3:mvp:benchmark
# Run against a local preview, with an external Playwright installation:
export GAME_URL=http://127.0.0.1:5175/recon-game/
export PLAYWRIGHT_MODULE_DIR=/Users/erland/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules
npm run v3:p1:browser
npm run v3:mvp:browser
npm run v3:workshop:browser
npm run v3:journey:browser
```

Screenshots and browser reports are ignored local evidence under `test-results/`. The benchmark and this review are repository records. Current requirements and traceability are in `V3_MODE.md`, D161 and the V3.3 feedback table in `V3_DELIVERY.md`.
