# V3.4 desk feature review

2026-10-21 · D165 / V3-F009 · local `codex/v3` · Ready for owner review. No merge or deployment.

The owner reported that features occupied developers too early and that delivering them across the ecosystem slowed the opening. Features now yield immediately to queued builds and repairs. Developers still collect blue cards from the shared backlog and return to their personal desk; completion there applies the income bonus to a random installed system. There is no feature delivery or installation trip.

## Current behaviour

- Prefer an idle developer for a queued build/repair. Otherwise pause feature work at its actual position, retaining its card and elapsed work. An interrupted developer walks home before assembling a system or heads directly to a repair from their current position. No teleporting.
- Finish queued higher-priority work before returning to the saved feature. A P1 can also interrupt that intervening build/repair without losing the original feature.
- Keep 0.35s pickup, 3s assembly, 0.75s idle transition, +0.25 credits/s per completed feature, ongoing wages and the replenishing backlog. Remove the former 0.75s feature installation plus delivery and return walks. System construction/delivery remains unchanged.
- Select an installed target at completion, with independent seeded allocation that does not consume maintenance randomness. Broken targets retain their bonus but earn zero until repaired. No target is reserved in advance.
- The completed blue module appears briefly at the desk, its caption names the recipient, and the receiving system's count highlights. Paused blue work remains visible. Help, guidance, counters and results describe completed features.

## Verification

`npm test`: **162/162 passed**. The feature suite covers all four collection/assembly phases interrupted by build, ordinary repair and P1; exact saved progress/position; queued work before resumption; P1 interruption of a build with a parked feature; interruption during feature resumption; preference for idle developers; target eligibility/distribution; failure RNG independence; deterministic batching; outage income; pause, victory and reset.

`npm run build -- --base=/recon-game/`: passed, including TypeScript. The existing preview on port 5175 serves the rebuilt `dist`.

The paid feature browser route matches engine time, cash, jobs and worker positions. At 2.50s, a system purchase interrupts feature collection and sends the developer back to build without completing a feature first. A real P1 at 50.25s interrupts later feature work. The route finishes at **144.50s**, with 12 installed systems, four developers, Plus and 22 completed features. It verifies no feature delivery/install phases, immediate recipient feedback, one shared six-card backlog, pause, reduced motion, frozen result and fresh replay. No browser errors or backend requests.

Screenshots under `test-results/v3-desk-features/` cover pickup, fetch, assembly, build preemption, P1, completion and Recon freeing capacity. Desktop fit checks cover 1024×768, 1280×720, 1440×900 and 1920×1080; the 1024 paused/P1 and 1280 completion scenes were visually inspected.

Reproduction uses `PLAYWRIGHT_MODULE_DIR=/Users/erland/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules` and `GAME_URL=http://127.0.0.1:5175/recon-game/`, with `npm run v3:features:browser`. All companion browser checks passed: gameplay/spacing, workshop, journey, P1 and opening (`v3:mvp:browser`, `v3:workshop:browser`, `v3:journey:browser`, `v3:p1:browser`, `v3:event:browser`). Their current result files are under the corresponding `test-results/v3-*` directories. The paid construction P1 interrupts at 96.50s and resumes at 112s; the journey finishes at 184.30s while a system is still being delivered. Workshop checks observe all three active bays and preserved progress.

Test scenarios were adapted to observable current behaviour: the opening hides purchases, three simultaneously occupied bays need 250ms sampling, and the late system purchase must happen earlier to catch delivery at victory. The former late-spending deficit is now solvent; negative-balance continuation/recovery remains tested on the paid seed-200 route rather than claiming the old browser scenario still crosses zero.

## Pacing evidence (before D168 direct repairs)

The subsequent [direct-repair review](v3-direct-repair-review.md) owns current pacing. Results below are preserved in `v3-mvp-benchmark-desk-features.json`.

`npm run v3:mvp:benchmark` regenerated [current results](v3-mvp-benchmark.json). The immediate pre-change baseline is preserved in [island-layout results](v3-mvp-benchmark-islands.json). These use the same five seeds and two purchase-reaction intervals per policy. All 80 paid runs and nine delayed starts finish; 20 mature-capacity cases run separately.

| Policy | Before: median seconds | Desk features: median seconds |
| --- | ---: | ---: |
| Save | 578.80 | 345.20 |
| Small estate | 393.75 | 393.75 |
| Expand only | 372.80 | 372.70 |
| Hire first, no Recon | 202.175 | 157.275 |
| Balanced | 146.375 | 144.725 |
| Recon first | 233.30 | 207.10 |
| Plus first | 303.95 | 242.975 |
| Four developers, then automation | 223.80 | 147.80 |

This change gives spare developer capacity more value; it does not make Recon mandatory. The saving and expansion-only policies still exceed the intended short-run duration. Human assessment of pressure before Recon and the benefit afterwards remains pending; simulated wins do not establish enjoyment or comprehension.

The original spending burst at 21s now bottoms at **+1.275** and ends at **80.75** at 51s. The seed-200 four-developer policy still briefly reaches **−0.1625** and recovers with wages/work continuing. Mature Plus uptime is **85.59–86.54%**; actual system walks remain 1.45–10.65s (median 5.40s). Feature completion does not add maintenance demand. Dispatch before worker progression can start an ordinary repair one 50ms tick earlier than the prior scheduler.

Owner play review, unassisted visitors/spectators and Safari remain outstanding. The standalone engine, local results, public-scoreboard boundary and approved negative-cash rule are retained.
