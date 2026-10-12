# Speed Game — first implementation balance review

Historical D109–D112 evidence. The current model-tree implementation and calibration are in [D118 review](speed-game-model-tree-review.md).

2026-10-12. Original implementation evidence for D109. Earlier Python economy experiments and D101–D108 benchmarks are historical and do not establish this version's balance. Exact current rules: [SPEED_MODE.md](../../SPEED_MODE.md).

## Historical D112 recalibration

The extra expansion reserve is removed after first activation; all models permit either automation order (D111). The same 36 paid policies now produce 35 completions, with **34 within 480 seconds**, in **376.5–495.5 seconds**. Fastest tested remains Master. Scanner's four-system, three-second-decision policy installs at 90s and finishes at 446.5s; Master's seven-system policy installs at 192s and finishes at 416.5s. These are engine results, not new full browser replays. One slow ten-system Master policy still fails to complete within the policy bound despite ample credits. Full output: [D112 benchmark](speed-game-benchmark-d112.json). Medals remain provisional.

All 85 tests and production build pass. Targeted browser checks verify the first-restoration protection, Buy becoming enabled at exactly 30 credits, spending to zero and recovery income. The new coin balance is inspected in both views at four desktop sizes. No Long Game rules or UI changed.

## Historical D109–D110 paid policy results

The following numbers and complete UI replays predate D112. Use the current recalibration above for the latest economy.


The TypeScript benchmark runs the real game engine. One manual map command is allowed per 1-, 3- or 5-second decision interval. Automation/model purchases occur in paused planning time, so multiple planning purchases can happen at one decision point. D110 moves capacity purchase to the live map; the benchmark now follows that path, with unchanged finish times. No credits, health, coverage or capacity are granted by the policy. Prices, reserves, discovery, repair, deadlines, queues and the autonomy trial are enforced by ordinary actions.

Policies expand to a specified number of owned systems before saving for a model, maintain discovered work, buy the second slot after three activations when affordable, and retain 55 credits after automation purchases. Model purchases retain 35 credits. The benchmark supports early automation before buying the model, including keeping Model 1 throughout. These are candidate strategies, not optimal solvers or measured human behavior.

36 policies, seed 1: **35 finish**, **25 finish within 480 seconds**. Successful finishes range from **383.5 to 510.5 seconds**. Results are preserved in [speed-game-benchmark.json](speed-game-benchmark.json).

| Route | Decision interval | Systems before saving for model | Early automation | Model bought | Finish |
| --- | --- | --- | --- | --- | --- |
| Model 1 throughout | 3s | — | No | — | 452.5s |
| Scanner | 3s | 4 | No | 99s | 473.5s |
| Scanner, more expansion | 3s | 7 | No | 159s | 437.5s |
| Master | 3s | 7 | No | 204s | 431.5s |
| Master, early coverage | 3s | 7 | Yes | 327s | 482.5s |
| Master, fastest tested | 1s | 10 | No | 221s | 383.5s |

The early Scanner route reaches its purchase near 1:30; a seven-system Master opening buys around 3:13 with one-second decisions or 3:24 with three-second decisions. Expansion and automation timing materially affect results. Buying a model immediately is not automatically better than expanding first; Model 1 remains viable. Master can recover its later investment through cheaper and faster fixing. Early automation postpones that purchase.

One five-second policy insisting on ten owned systems before Master does **not** finish within the 1,200-second benchmark bound. It keeps prioritizing maintenance before sufficient expansion, ends with 9,681.6 credits, no model and no automation. This exposes a poor policy, not insolvency or an unavoidable engine deadlock. Players can change strategy, buy a model earlier or add automation. Human playtesting should check whether they recognize this situation.

Provisional medals: Gold 420s, Silver 450s, Bronze 480s. Gold leaves 36.5 seconds above the fastest tested route. These are first-version targets, not validated difficulty percentiles. Late completion remains valid.

## Browser and engine verification

- 84 unit tests pass, including unchanged Long Game cases and new Speed ownership, activation, budget protection, model exclusivity, per-system ordering, atomic scopes, pause, queue, neglect/recovery and paid-win cases.
- Production build passes with `/recon-game/` base path.
- Paid browser replay follows every recorded action and compares every resulting wallet against the engine: Scanner 473.5s, Master 431.5s. This includes pause/resume, frozen victory, continued practice preserving the result, and restart. The displayed finish rounds upward to 07:54 / 07:12.
- Opening/map/upgrades inspected at 1440×1000, 1280×800, 1024×768 and 800×700. Map fits without page scrolling or overlapping system cards. Upgrades may scroll vertically for optional mechanics and confirmation. Compact nodes prevent overlap when zooming far out.
- Dedicated upgrade checks cover pause icon contrast, meaningful keyboard focus, cancellation without spending, mechanics disclosures at all four desktop sizes, tier-dependent quotes and Model 1 automation.
- Fixed-map navigation checks cover preserved component, camera and selected system across upgrades, keyboard pan/zoom, Fit all and reduced motion.
- Paid group-action checks cover both desktop sizes, per-owned-system charges and unchanged Long Game group cards.
- Long Game automation-layout regression passes 20 desktop views; chapter-pause regression passes opening/reopened briefings, running jobs/queue, hidden reading, 2×, autonomy/victory and restart.

Commands: `npm test`; `npm run build -- --base=/recon-game/`; `node scripts/speed-benchmark.ts`. Browser scripts use `GAME_URL` and `PLAYWRIGHT_MODULE_DIR`; run `tests/speed-browser.mjs`, `tests/speed-arrival-browser.mjs`, `tests/speed-upgrades-browser.mjs`, `tests/group-node-browser.mjs`, `tests/automation-layout-browser.mjs`, and `tests/chapter-pause-browser.mjs`. Screenshots and detailed UI reports are ignored in `test-results/`.

## First human playtest

The automated evidence supports a playable first version, not proven enjoyment or final balance. Observe an unassisted first run and a second attempt: understanding restore→earn→expand, recognizing paused planning, finding useful model details, discovering per-system automation, and choosing a different investment order. Note active finish time, model purchase time, perceived waiting and moments of confusion. Revisit setup costs/medals after that evidence. Safari, physical trackpad feel and custom worker artwork remain unverified; this version uses animated worker emoji with a drawn hammer and magnifier.

No online scoreboard, persistence or deployment is part of this implementation.
