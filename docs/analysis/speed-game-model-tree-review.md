# Speed Game — model-tree calibration (D118)

2026-10-12. Current implementation review. Supersedes D109/D112 balance conclusions where the model tree, automation costs and incident schedule differ. Exact rules: [SPEED_MODE.md](../../SPEED_MODE.md).

## Implemented choices

Five models: Recon Model 1; Scan Scout → Speedy Scanner; Repair Specialist → Fixing Master. Costs are 150 + 900 and 250 + 1,100 credits. Intermediate models remove one manual chore; final models automate both. Coverage includes current/future systems. Per-job costs, two shared workers, paid queues, deadlines, income recovery and the autonomy trial remain.

A permanent left-hand tree replaces the Upgrades page. Pause & plan and Compare models provide deliberate frozen planning; direct purchases work live or paused. Old model confirmation and per-system automation setup are absent. Gold/silver/bronze thresholds remain the previous provisional 420/450/480 seconds; they now need separate human calibration because all sampled upgraded policies earn gold.

## Paid simulation

[Complete report](speed-game-benchmark-d118.json). Run `node scripts/speed-benchmark.ts` against the actual engine. No injected credits, coverage or health. One manual command every 1, 3 or 5 seconds; model purchases can be made while paused. Policies expand to 3, 4 or 6 systems before saving for the intermediate model, then buy the second worker, expand to seven and save for the final model. Existing engine charges, queues, incidents and trial conditions apply. Seed 1; deterministic tuning does not yet vary incident cadence by seed.

18/18 upgraded policies complete, **327–374 seconds (5:27–6:14)**. Intermediate purchases occur at 80–145s; final purchases at 227–265s. Early 3–4-system policies buy Scout at 80–95s and Specialist at 102–115s. The fastest sampled Master run wins at 327s; the fastest sampled Scanner at 327.5s. These samples demonstrate viability, not global optimality or a guaranteed branch advantage.

| Policy | Intermediate | Final | Finish |
| --- | --- | --- | --- |
| Scanner, 3-second decisions, 4 systems first | 90s | 237s | 338.5s |
| Scanner, 1-second decisions, 6 systems first | 118s | 227s | 327.5s |
| Master, 3-second decisions, 4 systems first | 111s | 252s | 339.5s |
| Master, 1-second decisions, 6 systems first | 126s | 240s | 327s |

Three base-only controls remain incomplete at 900 seconds. The fastest control owns 12 systems at four minutes (96.7% health), then falls to 78.3% at five minutes and 70% at six. Its recovery budget remains positive. Pressure accumulates rather than switching to an unwinnable state exactly at four minutes. Slower controls prioritize maintenance and stop expanding at six or ten systems; this is policy behavior, not an engine ownership cap.

At full scale, the 40-second issue period implies about 2.4 base-model worker-equivalents for one scan/fix per issue, against two available slots. Scanner needs 1.8, Master 1.2. Batching, deadlines, staggered arrivals and human choices affect actual health and backlog. The income floor permits recovery; severe prolonged neglect can still require several minutes of work and income before returning to health.

## Verification

86 engine tests and production build pass. New checks cover both paid stages, branch exclusivity, duplicate/skip rejection, partial automation, future-system coverage/restoration, pause and running/queued job semantics, workload ramp and late recovery. Existing Long Game tests remain green.

Full browser paid replays match every engine debit: Scanner 338.5s, Master 330.5s (the replay uses seven systems before the intermediate Master step). These runs verify victory freeze, practice, retry, opening guidance, scan/fix animation, map identity and pause fractions. Targeted browser checks cover models and comparison, paused purchases, future coverage, heavy-neglect recovery, four desktop sizes with two workers, group Scan/Fix, purchase thresholds and the retained Long Game group view. Model shimmer uses a static reduced-motion alternative. Screenshots and browser logs live in ignored `test-results/`.

Not established: first-time comprehension, fun, Safari, physical trackpad feel, final medal difficulty or optimal strategy. Next: an unassisted first run and a second attempt focused on branch choice and expansion timing.
