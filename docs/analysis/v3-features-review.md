# V3.3 — shared feature backlog trial

2026-10-20 · D162 / V3-F006 · local `codex/v3` · Historical V3.3 baseline, accepted on advancement to V3.4.

The owner wanted developers to spend capacity released by Recon on useful feature work. They clarified one shared column beside the workbenches, with every developer collecting from its top, then approved trying it. This implements that loop in the current V3.3 slice. V3.4, public scoring and deployment remain outside this change.

The subsequent [V3.4 event review](v3-event-review.md) owns cluster geometry. [Desk-feature feedback](v3-desk-features-review.md) supersedes delivery, targeting, priority and pacing below. Figures here describe the original feature trial, preserved in `v3-mvp-benchmark-features.json`.

## Behaviour and trial choices

One shared column displays six blue New feature cards and replenishes as cards are collected. After a short 0.75-second idle transition, a developer with no queued build or repair walks to its top pickup area, takes a card, walks back to their own bench, assembles a smaller blue module, carries it to a system and installs it. Pickup positions are slightly separated within the same top area for simultaneous arrivals. There is no per-bench backlog or new purchase action. The four-developer cap remains.

Trial defaults are **3 seconds assembly**, **0.35 seconds pickup**, **0.75 seconds installation** and **+0.25 credits/s per delivered feature**. All walking uses actual paths at the existing speed; ongoing wages still apply. There is no additional feature fee. Supply replenishes indefinitely and bonuses stack for this trial. Total job time depends on the pickup and destination walks; only assembly is necessarily faster than a full system build.

Choose a working installed system with the fewest delivered plus in-flight features, tie by system ID. Reserve that destination at assignment. If it fails during the journey, the feature can still be installed but earns nothing until repair; existing bonuses survive outages. Construction jobs and ordinary repairs take precedence over starting another feature, but do not interrupt a feature already started. P1 interrupts every feature phase, retaining progress, reserved destination and visible saved props. Recon handles repairs only.

The workshop reserves extra space on the right for the shared column and routes; original machine locations, bench positions and ordinary travel distances remain. Blue card/module artwork, blue assembly parts, a per-system feature counter, actual income labels, live feature counts, Help, a dismissible feature hint and a factual result recap explain the new work. No bonus is credited before delivery. Pause, hidden-tab hold, victory freeze and retry include features and counters.

## Verification

**152 automated tests and the production-base build pass.** Eleven new feature tests cover the complete physical lifecycle, shorter assembly, delivery-only income, P1 save/resume during all six feature phases, ordinary queue precedence, bonus survival through outage/repair, destination distribution including reservations, Recon exclusion, deterministic long runs, pause/victory/reset and eligible targets. Existing ordinary/P1 scheduling, accounting and guidance tests remain green.

Paid Chromium tests use real controls and compare displayed cash/time, developer phase and physical position with the pure engine:

- `v3:features:browser`: four-developer route, **2:55.15**, 12 installed systems, Recon Plus and **22 delivered features**. Captures fetching from the common column, pickup, return to each desk, blue assembly/delivery/installation, truthful per-system income, and P1 interruption of feature delivery. Checks replenishing card sequence, pause freeze, reduced motion, result recap and fresh retry. Four-size bounds confirm no overlap between the column and benches and card labels stay inside their cards. Screenshots inspected at 1024×768 and 1280×720, with additional 1440×900 and 1920×1080 captures.
- `v3:mvp:browser`: four paid strategies still match the engine exactly, with cash-only victory, ordinary/P1 Recon handoffs, countdown/hidden hold, paused purchases, negative-cash recovery, camera/layout, frozen results and retry. The handoff assertion now distinguishes walking back to a saved feature from returning to an empty bench.
- `v3:workshop:browser`: uses the mixed paid policy to reach three simultaneous Recon repairs before victory. The former four-developer route now finishes before that particular sampled state. Actual one/three bay ownership/progress, stable assignments, coins/completion, pause, reduced motion, four-size bounds and reset pass. Mixed finish: **2:23.55**.
- `v3:journey:browser`: Help/keyboard/focus, guidance/dismissal, optional sound, four-size results and celebration still pass. The paid no-Recon late-build strategy wins at **3:33.90** with four systems installed and a fifth delivery unfinished; the party cannot complete it or alter the result.

No browser errors or V3 backend requests were observed. Ignored screenshots and reports are under `test-results/v3-features/`, `v3-mvp/`, `v3-workshop/` and `v3-journey/`. Tests are technical evidence, not proof of unassisted understanding or enjoyment.

## Balance

The [archived feature benchmark](v3-mvp-benchmark-features.json) includes 80 paid runs across eight policies, five seeds and one/three-second reaction intervals, nine delayed starts and 20 mature-capacity fixtures. Every paid and delayed run finishes. [Pre-feature P1 data](v3-mvp-benchmark-p1.json) preserves the comparison baseline.

| Policy | Pre-feature median | Shared-feature median |
| --- | ---: | ---: |
| Mixed expansion and automation | 130.50s | 139.35s |
| Three developers, no Recon | 181.675s | 171.725s |
| Four developers, then automation | 254.95s | 181.35s |
| Four-system saving | 286.10s | 286.10s |
| Pure saving | 646.65s | 448.20s |

The seed-31 four-developer route delivers 22 features; the one-developer small-estate route delivers none because construction and repairs occupy its capacity. Feature work can delay later system orders as well as raise income, so some policies become slower. The tested mixed route remains within the two-to-three-minute pacing ambition. Slow saving routes remain legal and exceed that ambition.

The no-developer mature Plus fixtures retain **85.41–86.43% mean uptime** and clear the artificial full-estate opening burst within 16.25s. Features do not add repair demand. Four early hires can reach **−21.60 credits** before recovery; the existing negative-cash rule continues. The specific second-21 spending regression now reaches **−1.135 credits**, recovering to **67.20** at second 51.

The replenishing supply, destination rule, income increment and timings are starting choices for this trial. Owner review should assess the shared pickup motion, whether Recon now visibly frees productive work, and whether the income feels right. Unassisted novice/spectator validation, Safari and full accessibility assessment remain pending. Busy travellers can briefly overlap each other and the central Recon artwork as in the existing workshop; the dedicated backlog space does not overlap benches.

## Reproduce

```sh
npm test
npm run build -- --base=/recon-game/
npm run v3:mvp:benchmark
# Against the local production preview, using the external browser runtime:
export GAME_URL=http://127.0.0.1:5175/recon-game/
export PLAYWRIGHT_MODULE_DIR=/Users/erland/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules
npm run v3:features:browser
npm run v3:mvp:browser
npm run v3:workshop:browser
npm run v3:journey:browser
```

Current rules and implementation traceability are in `V3_MODE.md`, D162, and the V3.3 shared-feature record in `V3_DELIVERY.md`.
