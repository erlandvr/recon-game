# Speed Game: model prices and cumulative upgrades (D121)

2026-10-12. Implemented locally after the user's request for cheaper models, all models purchasable, and benefits combined. Long Game unchanged.

## Price review

The old intermediates cost 150/250 cr, and the finals another 900/1,100. That put total branch investment at 1,050/1,350 cr, compared with 1,430 cr for all eleven additional systems. Finals mainly added the missing automation; under cumulative ownership, the two intermediates would already provide it for 400 cr. Retaining those finals unchanged would make them especially poor purchases.

| Model | Previous price | New price | Current benefit |
| --- | ---: | ---: | --- |
| Scan Scout | 150 | 100 | 1s automatic scans, 5 cr/job |
| Repair Specialist | 250 | 180 | 1s automatic fixes, 5 cr/job |
| Speedy Scanner | 900 | 350 | 0.5s scans, 2 cr/job; both jobs automatic |
| Fixing Master | 1,100 | 500 | 0.5s fixes, 2 cr/job; both jobs automatic |

Each final still requires its corresponding intermediate. All owned benefits combine without multiplying bonuses; the best duration/cost wins. Both intermediates provide 1s/5cr scans and fixes for a combined 280 cr. Buying all four costs 1,130 cr and gives 0.5s/2cr work. Base is included. Purchases never downgrade benefits, remove coverage, or charge twice. Queued jobs retain prepaid costs; running jobs retain duration.

Unowned logos and details stay grey even when affordable. Buy buttons show affordability separately. Owned models retain colour and an Installed label. No confirmation step.

## Paid simulation evidence

Reproduce with `node scripts/speed-benchmark.ts`. Snapshot: [D121 results](speed-game-benchmark-d121.json). No injected money, work or coverage. Three reaction intervals (1/3/5s), three first-purchase thresholds (3/4/6 active systems), two workers, default seed. Second purchase threshold is seven systems. Four policies give 36 upgraded runs, plus three manual controls.

| Strategy | Finish range |
| --- | --- |
| Scanning branch | 265.5–288s |
| Repair branch | 267–289s |
| Both intermediates | 237.5–277.5s |
| All four models | 298–321.5s |

All upgraded policies finish; all manual controls remain incomplete at 900s. First upgrade: 72–145s. Early 3–4-system policies purchase Scout at 72–90s and Specialist at 85–100s. D118's 18 upgraded policies finished in 327–374s.

## Tradeoffs for playtesting

The combined-intermediate policy is now the fastest of these policies. Buying all four is possible, but is not required to win and is not the tested fastest route. Finals add capacity and lower upkeep; their three-credit per-job savings alone need about 117 scans or 167 fixes to repay the purchase, so they are not advertised as guaranteed short-run profit. Lower speed durations also reduce worker occupation and recovery delays.

Faster skilled routes can finish below the original 5–8 minute aspiration. We have not raised system prices, incident pressure, trial requirements or forced final purchases to compensate. Medals are unchanged and provisional. Human testing should determine whether the extra accessibility is preferable, whether optional finals feel useful, and whether the target/medals need a separate revision. These scripted strategies are not proof of optimal play or human enjoyment.

## Verification

All 88 engine tests and the production-base build pass. Full paid UI replay finishes match engine plans exactly: Scanner 280.5s, Master 270.5s, combined intermediates 245s, all four 306.5s. Actual credit charges, victory freeze/practice/retry, both branch purchase orders, grey/owned visuals, pause/comparison, future-system coverage and restoration pass. Four desktop layouts (1440×1000, 1280×800, 1024×768, 800×700) fit; mixed-ownership and short-screen screenshots inspected. Speed/Long Game group browser regression passes. This is local verification, not a deployment.
