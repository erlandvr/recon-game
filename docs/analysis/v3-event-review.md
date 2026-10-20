# V3.4 event experience review

2026-10-20 · local `codex/v3` · D163 / V3-F007 · Ready for review. No merge or deployment.

## Current opening revision — D164 / V3-F008

The owner rejected the live preview because it looked like gameplay had begun, and requested only the gameplay explanation and start button. The opening now leads with the owner’s slogan “Experience the Benefit of Recon”, followed by the 1,200-credit goal, three short paragraphs explaining building/wages, failures/P1s and Recon/feature work, plus one focused **Start game** button. The underlying workshop and header stay hidden until countdown. Opening sound, reduced-motion and mode-choice controls are removed; settings remain in gameplay. The unused demo component, simulation and its unit test are removed; the mode chooser retains its small separate illustration.

The production build and focused opening/journey checks verify this revision. The opening check covers one button, keyboard focus, no live preview, no time/cash movement while reading, four desktop sizes and fresh countdown/replay. Sound is tested through the gameplay header. No mechanics, routing or economic values change. Owner review remains pending.

The original V3.4 implementation/evidence below is historical for the opening demo; its layout evidence still applies. D165 changes feature priorities and removes feature delivery; see the [desk-feature review](v3-desk-features-review.md) for current pacing. The pre-change balance below is preserved in `v3-mvp-benchmark-islands.json`.

## Delivered behaviour

The owner accepted V3.3 by requesting the next slice, after asking for more space around Recon and a less regular ecosystem. The twelve fixed destinations now form four uneven islands. Soft shared footprints and curved dependency wires show grouping; existing systems do not move when another is purchased. The nearest machine housing is 46 world units from Recon (previously 11). The radar and three repair bays retain their existing size, names, ownership and progress. Western loaded routes cross below the tower. Their rendered position and simulation cost use the same geometry, including P1 detours/resumption. Width remains 1180; world height increases from 460 to 535. Workbenches and the shared feature backlog stay in their established positions.

The chooser has a small living workshop illustration. Opening V3 shows an immediately available Start button, cash goal, sound/reduced-motion controls and a labelled 2× demo. The demo uses an independent paid simulation: build, carry, install, earn, fail, developer repair, Recon repair and feature work. It loops after 90 simulated seconds (45 visible seconds), stays silent, holds while hidden and becomes a still scene with explanatory text under reduced motion. Start removes it and starts the normal fresh countdown. It never purchases for the player or changes their time, cash, guidance history or result.

The wider opening gives the preview room on laptops. Paused carried work has a small pause badge and accessible title; its previous free-standing label could collide with a system name during a P1 takeover. The main camera resets for a fresh run and remains stable during growth. Existing contextual guidance, cash-only victory, immediate gameplay freeze, separate six-second party, Help, opt-in sound and replay remain in place.

## Verification

- 155 engine/unit tests pass, including new minimum-clearance, loaded-route and paid-demo/replay checks. Existing P1 interruption/resumption tests cover all feature phases. Old fixed-time test assumptions were replaced with isolated ordinary-failure fixtures or a longer repeated-feature observation; assertions still verify the original behaviours.
- Production-base TypeScript/Vite build passes.
- `v3:event:browser` passes: independent demo state, full loop, immediate keyboard-focused Start, hidden hold, static reduced motion, 1024×768 / 1280×720 / 1440×900 / 1920×1080 opening bounds and fresh replay.
- Full paid gameplay browser checks pass with exact engine time/cash: balanced 146.40s, hire-first 201.35s, small-estate 386.10s, four developers 222.75s. Covers countdown/hidden clock, camera, pause-and-buy, both repair handoffs, negative balance, victory and reset without backend traffic.
- Workshop checks pass: actual one/three-bay work, stable ownership/percentages, completion/installation coins, freeze, reduced motion and dense four-size layouts.
- Journey checks pass: deliberate Help/keyboard behaviour, guidance, opt-in sound, immediate result freeze and unfinished-build preservation through the party. Paid late-build finish: 261.20s, four installed systems and one unfinished system.
- Shared-feature paid route checks pass: three early systems/three developers expose a real P1 during feature delivery at 47.50s; then ordinary purchases expand to four developers and Plus. Finish 150.00s with nine delivered features. Covers six feature phases, exact rendered worker positions/income, paused four-size scenes, reduced motion, frozen result and fresh reset. This is a test route, not the unchanged four-developer benchmark policy.
- Final takeover-spacing checks pass, including negative-balance recovery and Long entry. Dedicated paid construction P1 checks pass: interruption at 101.50s, resume at 118.75s, retained cargo/progress, paused/reduced-motion fire at four sizes, and paid Recon urgent takeover/repair by 157s. The route uses paid builds at 34/49/64/79s to expose delivery interruption under the new geometry; the first P1 hint is verified once per run.

Rendered evidence is under ignored `test-results/v3-event/`, `v3-workshop/`, `v3-features/`, `v3-mvp/` and `v3-journey/`. Opening, full-estate Recon, paused feature interruption and results screenshots were inspected. Browser checks use Chromium with controlled time; they are not human venue sessions.

## Balance impact of actual walking

Prices, wages, feature timings/value, failure frequency/severity and walking speed are unchanged. Paths now take 1.45–10.65 seconds (median 5.40; previously 1.67–7.56, median 4.39). The broader westward route delays construction and developer repairs. Do not present these timings as unchanged visual-only polish.

The current [benchmark](v3-mvp-benchmark.json) contains 80 paid strategy runs, nine delayed starts and 20 mature-capacity fixtures. All paid/delayed runs finish. The previous feature-layout evidence is preserved in [the archived benchmark](v3-mvp-benchmark-features.json).

| Strategy | Previous median | V3.4 median |
| --- | ---: | ---: |
| Save | 448.20s | 578.80s |
| Small estate | 286.10s | 393.75s |
| Expand only | 293.75s | 372.80s |
| Hire first | 171.73s | 202.18s |
| Balanced | 139.35s | 146.38s |
| Recon first | 221.00s | 233.30s |
| Plus first | 279.10s | 303.95s |
| Four developers | 181.35s | 223.80s |

The mixed strategy remains within the two-to-three-minute aim; several legal strategies exceed it, especially saving and no-Recon play. Mature Plus capacity is unchanged (85.405–86.431% uptime without developers; burst clears within 16.25s). The legal late-spending case reaches −5.7775 credits and recovers to 53.4625 at second 51, under the approved visible-negative-balance rule. These are simulations, not evidence of enjoyable pacing. Keep this as the geometry candidate for owner review rather than silently speeding up the workers to reproduce old scores.

## Remaining review

- Owner acceptance of grouping, Recon prominence and longer trips.
- Unassisted first-time visitors and spectators: immediate Start, clear repairs/P1s, feature value, bay comprehension and desire to replay. Use the [observation sheet](v3-human-playtest.md); no sessions recorded.
- Safari, physical mouse/trackpad feel and broader accessibility evaluation.
- Final numeric balance after human feedback. Public V3 ranking remains outside this slice's committed scope.
