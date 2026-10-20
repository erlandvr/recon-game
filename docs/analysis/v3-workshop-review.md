# V3.2 living workshop review

2026-10-20 · local `codex/v3` · Ready for review.

**Historical delivery evidence before D161/P1.** Current interruption rules and verification are in the [P1 review](v3-p1-review.md); the pre-P1 numeric baseline is preserved in [candidate B data](v3-mvp-benchmark-b.json).

The owner accepted V3.1 candidate B and requested V3.2, specifically a more impressive Recon and clearer slots. This slice implements D133–D134, D141, D143 and D145–D152, with implementation direction D159. It does not change the independent simulation or world routes.

## Delivered presentation

- `V3Recon.tsx` replaces the small circle/bars with a central chunky radar tower. Three numbered repair bays show Offline / Buy Recon, Locked / Requires Plus, Ready / Repair bay, or the actual system name and repair percentage. Base unlocks one bay; Plus unlocks three. Ongoing jobs retain their bay when a neighbouring job finishes.
- A sweep and failure blips communicate monitoring. Actual owned repairs light a connection and move a small machine token through its bay. A completion check travels back to the repaired system. The sweep never controls job selection or timing; partial developer work appears immediately at its real percentage. The SVG accessible description includes tier, working-bay count, system names and progress.
- `V3Board.tsx` adds personal tool benches, six progressively assembled cubes, simple vacant/ready/away labels and a recruitment greeting. Reserved destinations remain outlines until installed. The 80-unit carried machine is approximately 2.5 times the nominal 32-unit worker, with visible head/feet, forward lean, lift within the existing delivery phase and lowering within installation. Workers raise an arm and lean as they turn after a takeover. Their original paths and speed remain intact.
- `V3WorkshopProps.tsx` supplies a cube crate, recruit, miniature radar and expansion module on a shared shelf. Each remains a real one-click button with the existing accessible action name, price, wage, affordability and cap reasons. Focus remains visible.
- Installation releases a gold coin from the developer's location towards net earnings. The 1.2-second screen-space flight illustrates the income change; the model starts income at installation completion and applies no bonus. Reduced motion shows a static coin beside earnings. The actual current income remains visible, including concurrent failures.
- Radar, job progress, turn/install poses and coin flight use simulation time and freeze on pause. CSS worker/tool/light motion pauses with the world and stops under reduced motion. Tokens and completion cues have static reduced-motion positions.

## Verification

- All **121 automated tests** pass; production build with `/recon-game/` base passes.
- The existing V3 production-browser suite passes with the new artwork. Paid finish times and cash match the accepted candidate B exactly: mixed **2:09.75**, hiring-only **2:59.75**, four-system/no-Recon **4:51.25**, and four developers **4:16.35**. Separate outward and mid-repair takeovers pass, as do countdown/hidden hold, pause-and-buy, camera preservation, reduced motion, result freeze/retry, negative-balance display/recovery and the three-mode entry/Long entry checks. No V3 backend requests occurred.
- The focused `tests/v3-workshop-browser.ts` suite checks paid base/Plus bay ownership, real percentages, stable bay assignment, completion cues, installation-only coins, exact model time/cash, pause freeze, reduced motion and reset. It also checks controls, bay text and bench-label bounds at 1024×768, 1280×720, 1440×900 and 1920×1080. **Pass** after simplifying bench labels to avoid crowding the following workbench. The final focused paid run also finishes at 4:16.35 with exactly matching cash, and reports zero page errors.
- Representative rendered images reviewed: concurrent carries, base Recon processing with two locked bays, full Plus processing, paused dense laptop view and income cues. Final 1024px triple-repair and installation-coin captures were also inspected. Latest output is ignored under `test-results/v3-mvp/` and `test-results/v3-workshop/`; the latter includes a machine-readable result after a successful run.

Reproduce the focused check after building and starting preview:

```sh
PLAYWRIGHT_MODULE_DIR=/Users/erland/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules GAME_URL=http://127.0.0.1:5175/recon-game/ npm run v3:workshop:browser
```

Use the actual preview port if different. The existing full check remains `npm run v3:mvp:browser` with the same variables. No new balance benchmark is needed: `v3Game.ts` and `v3World.ts` retain candidate B, and paid UI runs reproduce its exact outcomes.

## Limits and remaining work

This is a reviewable visual implementation, not evidence that uncoached spectators understand Recon. The laptop view keeps the bays explicit, but fine text is naturally smaller; review it on the intended event display. Routes pass in front of the central machine, so a moving worker/load can briefly overlap a bay edge. Paths were deliberately preserved to avoid altering economics. Physical trackpad feel, Safari, full accessibility assessment and unassisted novice/bystander observation remain unperformed.

Contextual guidance, the themed countdown, richer recap and victory party belong to V3.3. Attract mode and final event/visitor polish belong to V3.4. No merge, push or deployment was performed.
