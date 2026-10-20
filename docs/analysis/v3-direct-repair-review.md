# V3.4 direct repair travel

2026-10-21 · D168 / V3-F012 · local `codex/v3` · Ready for owner review.

A developer used to return to the workbench after every installation, even when an ordinary repair was waiting nearby. Unassigned returning developers can now claim the next queued repair from their actual position. This applies immediately after installation or repair and during an existing walk home.

The ordinary FIFO queue remains: an older queued build is not skipped for a nearby repair. Construction still starts at the bench. P1 response and saved-work resumption remain protected, and Recon has first claim on repairs it can handle. Parked feature progress survives the detour. Travel uses the existing connected aisles and unchanged walking speed; no instant movement, repair progress during walking or nearest-job reordering. Installation income/coin feedback remains immediate, including the developer's release pose when departing towards a repair.

## Verification

- **169/169 tests pass**, including five focused cases: install-to-repair position/time, redirecting a return with pause held, repair chaining, FIFO construction/Recon ownership, and Recon takeover mid-direct-walk. Existing P1 and parked-feature tests pass.
- Production build passes, including TypeScript; port 5175 preview rebuilt.
- Paid one-worker browser reproduction: buy one system at 10 seconds. At 25.80s installation completes, the developer leaves that exact position for the ordinary failure on the other system. The direct aisle walk takes **2.20s**, with no bench visit. Browser time, cash and positions match the engine. Installation coin, pause and six-second repair completion pass; screenshot inspected.
- Full gameplay browser regression passes: four paid policies match engine time/cash, pause/countdown, frozen results/replay, both Recon takeovers, desktop fit, Long entry and label spacing.
- Existing paid P1 interruption/resumption browser check passes (96.50s interruption, 112s resumption). No page errors.

Run `node tests/v3-direct-repair-browser.ts` with the same `PLAYWRIGHT_MODULE_DIR` and `GAME_URL` variables documented for the other V3 browser checks. Screenshots are in `test-results/v3-direct-repair/`.

## Balance evidence (before the 600/680 trial)

[The price-trial review](v3-price-trial-review.md) owns current pricing and pacing. These results are preserved in `v3-mvp-benchmark-before-price-trial.json`.

The prior desk-feature benchmark is archived as [v3-mvp-benchmark-desk-features.json](v3-mvp-benchmark-desk-features.json); [current results](v3-mvp-benchmark.json) now include direct repair dispatch. All 80 paid routes and nine delayed starts finish; the 20 capacity fixtures remain separate from paid runs.

| Policy | Before median seconds | Direct repair median seconds |
| --- | ---: | ---: |
| Small estate, one developer | 393.75 | 219.45 |
| Expand only | 372.70 | 308.40 |
| Hire first, no Recon | 157.275 | 144.925 |
| Balanced | 144.725 | 142.50 |
| Four developers then automation | 147.80 | 147.825 |

Saving and Recon-first/Plus-first medians are unchanged. Avoiding repeated desk detours particularly benefits small developer-only estates. No prices, failure frequency, repair duration or feature values were retuned. Relative Recon value and overall pacing remain for owner play review. The legal negative-cash regression remains valid (seed-200 minimum −0.1625); the former 21-second spending burst stays solvent and now ends at 104.375 credits at second 51.

No merge, deployment or public scoring change. Earlier review timings describe their archived configurations.
