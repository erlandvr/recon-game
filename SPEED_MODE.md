# Speed Game

Current local implementation: **D129, 2026-10-12**. Doubling waves replace individual system arrivals. Only final models unlock automation; final model prices are 50 credits higher than D125. Systems develop recurring issues twice as frequently as D126 (3.92× the original rate); victory follows five stable seconds after health recovers. Long Game is unchanged.

## Player experience

Start with 40 credits and one broken Backend. The paused opening contains only SPEED GAME, SCAN → FIX → EARN → EVOLVE → EXPAND and LET’S GO. Scan and Fix have opening guidance; it ends when Backend is restored.

LET’S GO launches a three-second arcade countdown. The game and timer start exactly at GO!, while the sparkle overlay fades without blocking input. Countdown time is excluded from the score. Finish times show quarter-second precision; optional nickname submission publishes the frozen result to the shared `speed-d129-v1` scoreboard. See [SCOREBOARD_PLAN.md](SCOREBOARD_PLAN.md).

Restoring Backend immediately releases **Wave 1: +2 systems**. Twenty active seconds later, **Wave 2 adds 4**; another twenty seconds later, **Wave 3 adds 8**. Totals are **1 → 3 → 7 → 15**. The schedule is anchored to completion of the first fix, not time since opening the game. Members of a wave arrive together, free and offline, inheriting purchased automation. Wave arrivals do not depend on credits or health.

The existing map grows to three groups of five systems. Only connected nodes/groups render; coordinates stay stable. Fit all follows growth, while manual selection, pan and zoom preserve the camera. A brief “Wave N · +N systems connected” banner appears for three active seconds; reduced motion removes its flash. The countdown shows the next wave number, size and remaining time. There are no chapter dialogs or system purchase controls. All 15 systems arrive 40 seconds after the first restoration.


The model tree stays left, ecosystem centre, workers right. Unowned logos/details stay grey even when affordable; purchased models become colourful and show Installed. Buy buttons indicate affordability separately. Current credits, health, clock, income coins, scan magnifier, workers, group Scan/Fix and centred actions remain.

Pause & plan freezes the whole simulation, including wave countdowns. Model/worker purchases are allowed while paused, but no jobs start until resume. Compare models opens paused details. Camera and fractional active time remain intact.

## Model upgrades

Buy both branches; owned benefits combine. Each final requires its own intermediate model. Purchases are immediate and permanent; duplicates are rejected. Use the best owned duration/cost and all unlocked automation, without multiplying bonuses. Running jobs retain duration; queued jobs retain their prepaid price and use combined speeds when dispatched.

| Model | Price | Scan | Fix | Automatic work |
| --- | ---: | --- | --- | --- |
| Recon Model 1 | Included | 3s / 5 cr | 5s / 15 cr | None |
| Scan Scout | 50 cr | 1s / 5 cr | Unchanged | None |
| ↳ Speedy Scanner | 225 cr | 0.25s / 2 cr | Unchanged | Scans only |
| Repair Specialist | 90 cr | Unchanged | 1s / 5 cr | None |
| ↳ Fixing Master | 300 cr | Unchanged | 0.25s / 2 cr | Fixes only |

Both intermediate models still require manual scanning and fixing. Speedy Scanner unlocks automatic scans; Fixing Master unlocks automatic fixes. **Both final models are needed for full autonomy.** All four purchases cost 665 credits. Automation covers connected systems and future arrivals, including restoration.

## Economy and workload

- Initial balance 40 cr; manual base scan/fix cost 5/15 cr. First-restoration budget protection remains.
- Arrivals cost nothing. Credits buy models and the second worker, and pay for scans/fixes.
- Healthy activated systems earn 2 cr/s. Income: `2 × (0.25 + 0.75 × health/100)`. Health floor 20% preserves 0.8 cr/s; offline systems earn zero. Unconnected systems create no work or health penalties.
- Second worker costs 150 cr; maximum two shared slots. Manual overflow queues; automation uses free slots with the existing 20-credit reserve and a 2-second automatic-scan cooldown (Long Game retains 15 seconds).
- Recurring issue frequency is 3.92× the original rate (2× D126). Backend's first recurring issue is scheduled 32/3.92 ≈ 8.2 seconds after restoration; other systems' first issues are 60/3.92 ≈ 15.3 seconds after restoration (dispatched on the next quarter-second tick).
- Subsequent incident interval: `max(40, 60 − 1.5 × max(0, active systems − 3) − min(8, max(0, elapsed − 90) × 8/150)) / 3.92` seconds, recalculated per next incident. The minimum interval is now ≈10.2 seconds. Issue damage and compliance deadlines remain unchanged; purchased models do not degrade.

## Autonomy and results

Restore all 15 arriving systems and install both final models. Maintain average health ≥90%, each system ≥60%, no overdue findings/manual work and at least 35 credits for **five stable seconds**, with income covering scan/fix costs during that check. Automatic scans and fixes must each have run at least once during the game. Gold indicates coverage; it no longer grants a low-health victory. Buying the final model, including while paused, never bypasses recovery.

The map announces automatic recovery, then shows the five-second countdown and progress bar. Final models do real 0.25-second jobs using Speed-only quarter-second simulation ticks; automatic scans can repeat after two seconds. No healing bonus or instant issue removal is injected. One worker can recover a neglected ecosystem, while a second worker speeds up the recovery.

Victory scan/fix counters describe the run; net income describes the five-second check. Long Game retains its half-second simulation, 15-second scan cooldown and all original 60-second trial requirements.

Victory freezes the result. Retry starts fresh; practice preserves the result. The 5–8 minute target is not a cutoff. Medals remain provisional at 7:00 / 7:30 / 8:00. Gameplay changes are local. Score submission validation uses the new `speed-d129-v1` rules, with a separate local migration; no database deployment was performed here.

## Verification and balance limits

The paid benchmark tests scanner-first, fixer-first and intermediates-first purchase orders at three reaction intervals (1/3/5s) and three first-upgrade thresholds (3/4/6 connected systems). Each finishing strategy buys all four models. No free funds, work or coverage are injected beyond the actual free-arrival mechanic.

All 27 fully upgraded policies finish in **133–273.25 seconds**. Three base-model controls and nine intermediate-only controls do not achieve autonomy at the 900-second bound. Final health in these winning runs is 93.3–100%. First model purchases occur at 45–77 seconds in these policies, so early waves test manual handling before upgrades take over. Job costs/speeds, income, workers and wave timing are unchanged.

D129 supersedes D128 instant victory and D127 model performance. Representative paid routes at 3-second reaction intervals recover and finish 12–18.5 seconds after both final models with two workers, or 27.75–42.25 seconds with one. A neglected-ecosystem regression checks visible improvement before victory while new issues keep arriving.

These scripted runs are below the original 5–8 minute aspiration. Wave difficulty and human enjoyment still need playtesting; automated completion is not proof that the opening is fun. Historical single-arrival results no longer describe the current game.


Reproduce: `node scripts/speed-benchmark.ts`. Snapshot: [D129 benchmark](docs/analysis/speed-game-benchmark-d129.json). Earlier D118/D121 reports are historical and no longer describe current automation or growth.
