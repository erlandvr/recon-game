# V3.1 — more frequent maintenance (candidate B)

2026-10-20 · V3-F004 / D158 · local `codex/v3`.

**Historical delivery evidence before D161/P1.** Current interruption rules and verification are in the [P1 review](v3-p1-review.md); the pre-P1 numeric baseline is preserved in [candidate B data](v3-mvp-benchmark-b.json).

The owner approved implementing more frequent maintenance after finding developer-only play too forgiving. **Candidate B changes only the nominal young/mature operating intervals from 60/40 to 36/26 seconds.** That is about 67% higher young-system hazard and 54% higher mature-system hazard. This describes the demand rate, not a guaranteed increase in observed failures: queues, downtime and different purchase timing also affect realized events.

The age ramp still plateaus at 90 active seconds and uses ±15% seeded variation. The initial machine's first failure remains at 22 seconds. Movement, assembly, repair speeds, prices, wages, income, cap, FIFO, takeover, cash goal and the approved negative-balance behavior retain their existing rules. The visual feedback items V3-F002–003 remain V3.2 work.

## Comparison and selection

Reproduce with `node scripts/v3-maintenance-comparison.ts`. The harness creates isolated temporary copies of the current engine, substitutes only the two interval constants, and runs the same paid policies and capacity fixtures. It does not change production settings while comparing. The [comparison data](v3-maintenance-comparison.json) contains **320 paid runs and 80 mature-capacity fixtures** across four configurations. Each configuration has eight policies, five seeds and two reaction intervals (one and three seconds).

| Young / mature interval | Mixed Recon strategy, median | Three developers, no Recon, median | Developer maintenance in hiring-only route, median* | Plus mature mean uptime range |
| --- | --- | --- | --- | --- |
| 60 / 40 — previous A | 2:02.63 | 2:34.00 | 72.43 developer-seconds | 90.29–91.02% |
| 45 / 30 | 2:05.75 | 2:46.83 | 105.60 developer-seconds | 87.16–88.21% |
| **36 / 26 — selected B** | **2:10.05** | **3:01.38** | **131.40 developer-seconds** | **85.38–86.41%** |
| 30 / 24 | 2:13.70 | 3:15.40 | 161.00 developer-seconds | 84.40–85.41% |

*Maintenance sums outward repair travel and repair work across developers; return time is recorded separately with construction returns. These are total durations over runs of different length, not maintenance rates normalized per minute.

B gives a stronger contrast while retaining a roughly two-minute efficient route and roughly three-minute hiring-only route. The mild alternative changes pressure less; the strongest alternative extends hiring-only play further and reduces Plus headroom. This is an implementation tuning choice within the owner's direction, pending another human playtest.

For the comparable seed-31, one-second-reaction mixed route, **three failures have occurred before Recon is bought at second 59, with two outstanding repairs**, versus one failure and no outstanding repair at second 56 in A. Developer outward/repair work before that purchase rises from 11.35 to 18.05 developer-seconds. This supports earlier maintenance pressure during growth; it does not prove the player will notice or enjoy it. Hiring-only idle time falls from a median 41.68% to 35.29%, and its total outward/repair occupation rises about 81%.

## Viability, capacity and limits

The regenerated [current benchmark](v3-mvp-benchmark-b.json) contains B's 80 paid runs, nine delayed-start runs and 20 mature-capacity fixtures. [Candidate A](v3-mvp-benchmark-a.json) is preserved for comparison.

All 80 B policy runs and all nine delayed starts finish. The four-system no-Recon strategy now has a 4:43.55 median, expansion with one developer 4:53.90, and pure saving 10:46.95. Those remain legal wins but fall outside event pacing. Four early hires can briefly reach **−13.32 credits**, then recover with wages and work continuing as approved; no new recovery mechanic is introduced. The previous late-spending case still bottoms at −3.91 and recovers normally.

At maximum age and 12 systems, Plus still services three jobs every four seconds: **0.75 jobs/s**, versus nominal demand **12/26 ≈ 0.462 jobs/s** before downtime suppression. At the shortest varied interval (22.1s), demand is about **0.543 jobs/s**, leaving about 28% of nominal service capacity spare. All five artificial all-system initial bursts clear by 16.25s at 250ms sample resolution. Later bursts can still leave seven systems broken at once. Mean uptime is lower than A, as expected from deliberately higher demand; zero waiting or continuous full operation is not claimed.

The stress fixtures have no developer assistance, suppress victory by resetting cash between samples, sample after a 60-second warm-up and run for ten minutes. They are not paid wins. Each system has only one outstanding incident; failure demand advances only while operating. These assumptions still bound the capacity claim.

## Verification

- Fourteen focused V3 engine tests cover the existing lifecycle/ownership/accounting invariants plus the earlier purchased-system failure and exact mature interval.
- **121 automated tests and the `/recon-game/` production build pass.** Four paid Chromium runs match the engine: mixed **2:09.75**, hiring-only/no-Recon **2:59.75**, four-system/no-Recon **4:51.25**, four-developer **4:16.35**. The mixed route now visibly hands four repairs from developers to Recon (zero in A). Separate outward/mid-repair takeover checks, countdown/hidden hold, pause buying, camera and desktop fit, reduced motion, first-result freeze/retry, no V3 backend requests and negative-balance recovery also pass. Screenshots reviewed; reports and images are in ignored `test-results/v3-mvp/`.
- The browser's takeover-spacing check now waits for an actual affordable repair state, replacing the old timing-specific timestamp. It still verifies visible continuity/spacing; gameplay is not injected to make the test pass.
- Human retest remains pending. The desired result is maintenance visibly delaying new work and Recon feeling like useful relief. Beginner comprehension and bystander interpretation remain unverified.
