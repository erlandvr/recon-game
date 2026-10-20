# V3.4 automation price and maintenance review

## Current adjustment — D175 / V3-F019

2026-10-21: the owner revised their earlier acceptance and requested the original prices with systems failing a bit faster. Restore **Recon 180 / additional Plus 260**, and trial **32/24-second** young/mature operating intervals instead of 36/26. Nominal hazard rises 12.5% / 8.3%; opening failure stays at 22s. Repair speed/capacity, P1 share, features, wages and cash target remain unchanged.

62 V3 tests and production build pass. The current benchmark completes all 80 paid routes and nine delayed starts, plus 20 capacity fixtures. Balanced median: 145.30s versus 142.50s at the same prices with 36/26 maintenance; hire-first without Recon: 154.775s versus 144.925s. These are simulations, not evidence of player preference. Plus mature uptime is 84.54–85.56%; initial full-estate bursts clear in 16s, with nominal capacity 0.75 repairs/s versus 0.50 demand/s before downtime suppression.

All benchmark routes remain solvent. The former seed-200 shortage no longer occurs; the unit regression now explicitly creates a near-zero balance during an actual failure to verify wages, work and automatic recovery. It is an isolated rule fixture, not a paid playthrough. Paid upgrade browser checks pass for 180/260 prices, deductions, affordability loss/recovery, one/three bays, restart hold, reduced motion and four desktop sizes. Recon-ready screenshot inspected. Full-run browser checks pass: four paid strategies match the engine, restart hold/cancel, frozen results/replay, fixed workshop and both outward/mid-repair handoffs. Owner review of 32/24 remains pending.

The 600/680 data is preserved in [price-trial benchmark](v3-mvp-benchmark-price-trial.json). The [original-price baseline](v3-mvp-benchmark-before-price-trial.json) preserves 180/260 with 36/26. [Current benchmark](v3-mvp-benchmark.json) is D175.

## Historical 600/680 trial — superseded by D175

2026-10-21 · D171 / V3-F015 · local `codex/v3` · Accepted by the owner after playtesting on 2026-10-21; no further changes requested.

The owner considers Recon's current payoff correct but finds automation affordable before the manual maintenance workflow has had enough time to register. This trial sets **Recon to 600 credits** and **the additional Plus upgrade to 680**. The purpose is a longer manual phase, not a faster finish.

Repair speed (4 seconds), capacity (one/three bays), P1 priority, developer work, features, wages, failure frequency and the 1,200-credit win threshold are unchanged. Prices in buttons, affordability effects, Help and purchase acknowledgements use the engine configuration. Existing no-Recon paths remain valid.

## Verification

- 169/169 tests and production build pass. Existing fixture budgets and browser affordability bounds use current configuration.
- Paid upgrade browser checks pass: visible 600/680 labels, matching Help, −600/−680 purchase receipts, single deduction, three unlocked bays, unavailable/affordable/spent-below-price/purchased states, persistent glow, pause, reduced motion and four desktop sizes.
- Full paid gameplay browser regression and takeover/layout checks pass: four strategies match the engine, including no-Recon wins, pause, frozen results and replay. Later affordability required extending the test wait for an eligible mid-repair takeover; no gameplay timing was changed. The 1024 Plus screenshot was visually inspected.
- Current preview at port 5175 serves the rebuilt game. No merge/deployment.

## Pacing evidence

The [pre-trial benchmark](v3-mvp-benchmark-before-price-trial.json) preserves the immediate prior configuration. [Trial results](v3-mvp-benchmark-price-trial.json) cover 80 paid policies, nine delayed starts and 20 separate capacity fixtures. All paid and delayed routes finish; capacity and no-Recon results are unchanged.

| Policy | Before median seconds | 600/680 median seconds |
| --- | ---: | ---: |
| Balanced | 142.50 | 191.05 |
| Four developers then automation | 147.825 | 175.025 |
| Recon first | 207.10 | 350.625 |
| Plus first | 242.975 | 400.125 |
| Hire first, no Recon | 144.925 | 144.925 |

Across the balanced runs, the median first Recon purchase moves from **68.5s to 103s**; Plus moves from **96s to 150s**. These are fixed-policy simulation results across five seeds and two reaction intervals, not evidence of user comprehension or enjoyment. The slower automation runs were an intentional trial trade-off. The owner subsequently reported that the adjusted prices work perfectly and requested no further changes; this is owner playtest acceptance, not broader user validation. Price alone does not ensure a full developer team.

## Closed conditional experiment — D172 / V3-F016

If playtesting finds winning without Recon too easy, consider improving Plus efficiency and adding a few hundred credits to its price to strengthen the motivation to buy it. This proposal was closed without implementation on 2026-10-21 following owner acceptance of the adjusted prices. No buff or further price increase is needed; retain the current effectiveness and 600/680 prices.
