# Speed Game

Approved 2026-10-12 (D101); growth, automatic framing and timing refined through direct player feedback (D102–D105).

## Player experience

The opening offers Speed Game (5 minutes) and Long Game (~20 minutes). Long Game retains the original 100-repository campaign, prices, healthy-time goals, chapter briefings, 1×/2× toggle and medals. No progress or mode preference is saved.

Speed Game starts only after its briefing. One visible Backend problem teaches Scan then Fix. The elapsed timer runs at one real-time second per game second, including unhealthy periods and target/restart dialogs. Five minutes is a target, never a cutoff: keep playing until autonomy. There are no healthy-time gates or speed toggle. At the first automation unlock, a one-time explanation pauses the whole simulation on that exact tick. Dive Back In resumes; reading time and hidden-page time during that explanation do not count. Other hidden-page time counts while the page is open. Victory freezes the run and records an immutable finish result. Continue practising resumes unranked; it never replaces the original result or awards a new race medal.

The fixed organization has 12 repositories, three modules of four and one company. Short display names make the small ecosystem easier to recognize. The same connected map, pan/zoom, direct actions, FIFO queue and group actions are used throughout.

| Team unlock | Condition | New total |
| --- | --- | --- |
| Core experience | Complete the first real fix | 4 |
| Commerce | Two scan automations purchased and four findings fixed | 8 |
| Operations | Both automations on every Core experience repository | 12 |

Each unlock starts a connection sequence: one new repository every 2.5 seconds. The first new repo therefore arrives at 10.5 seconds in a perfect opening, with the first team complete at 15.5 seconds. Later teams also arrive individually. A new phase cannot unlock until the previous arrival sequence finishes. Growth preserves the map component. Every arrival animates back to Fit all over 850ms, including from manually focused or panned views. Browser/overview width changes also refit; ordinary gameplay ticks preserve manual navigation. Reduced motion uses immediate framing and no arrival fade. Restart resets the camera to Backend.

Short team announcements replace the long campaign's chapter dialogs. The target, next useful action, coverage and remaining time stay visible. Gold coverage markers follow the existing rule: both scans and fixes on all connected members.

## Independent tuning

| Item | Speed Game |
| --- | --- |
| Starting credits | 40 |
| Income capacity | 2 credits/s per connected repo, adjusted by existing health rules |
| Failure | Below 80% average health, income is reduced 25%; elapsed timer continues |
| Manual scan / fix | 5 / 15 credits; 3 / 5 seconds |
| Scan / fix speed upgrades | 70 / 90 credits; reduce jobs to 1.5 / 2.5 seconds |
| Additional work slot | 100 credits; five slots maximum |
| Automatic scan setup | 80 credits per repo before efficiency |
| Automatic fix setup | 140 credits per repo; ordinary fixes still cost 15 |
| Efficiency tier 1 | 60 credits; scans cost 3, new scan setup 64 |
| Efficiency tier 2 | 140 credits; scans cost 1, new scan setup 40 |

Automatic jobs retain the shared scheduler, manual priority, 20-credit reserve and 15-second scan cooldown. There are no refunds on previous purchases. Group actions retain ordinary prepaid costs and affordability checks.

First finding is present at the start. The next appears at 22 seconds; subsequent intervals are 22s for one repo, 16s below eight, and 8s thereafter. Alternate new repository arrivals bring hidden bugs. A compliance review arrives 15 seconds after Commerce unlocks, with a visible 40-second deadline. Existing direct dependency penalties apply.

Victory: all 12 have both automations, mean health ≥90%, every repo ≥60%, no overdue findings, at least 35 credits, no manual work. Sustain for 20 seconds, including an actual automatic scan and completed automatic fix, with nonnegative operating income. Failed conditions or manual work reset the trial. The race stops only at victory. The exact finish time remains recorded during continued play.

Medals: Gold ≤04:00, Silver ≤04:30, Bronze ≤05:00. Finishing after five minutes still achieves autonomy, without a time medal. Results show total finish time, fully automated modules and health, with retry, continued practice and mode selection. A fastest-time scoreboard is future work; no online scoreboard or storage is added here.

## Calibration evidence

After staggered growth, 27 paid policies (1/3/5-second decision intervals; zero/one/two efficiency tiers; two/three/five slots) all reached autonomy between **230.5 and 285.5 seconds**. The fastest tested route was 03:50.5 (display 03:51), with 57 paid commands; this is not a proven optimum. Full UI replay reached the same finish.

One-action-at-a-time probes are stricter: 2–3 second decisions finished between 03:56.5 and 04:05.5 with one efficiency tier. Under the original hard-cutoff prototype, the tested maintenance-first policies at 5–8 seconds per individual action had not finished by 05:00. Group maintenance improved the 5-second policy's final coverage from one repo to four, but did not win. These are idealized policies, not human enjoyment or accessibility measurements. First-time comprehension and perceived difficulty still need human playtesting; avoid describing every slow strategy as winnable.

Reproduce with `node scripts/speed-benchmark.ts`. `playSpeed` also accepts `actionLimit`, `groupWork`, `reaction`, `efficiency`, `capacity`, `upgrades`, `startDelay` and `maxSeconds` (a benchmark-only safety bound) for targeted probes. Reports and replay plan are ignored artifacts in `test-results/`. `tests/speed.test.ts` covers rule isolation, continued play beyond the target, late paid victory, batching, frozen victory spending, practice, earned growth, prices, affordability and trial gates. `tests/speed-browser.mjs` exercises the paid victory, paused automation explanation, play beyond five minutes, restart, practice and Long Game entry. `tests/speed-arrival-browser.mjs` checks stable-map identity, gradual arrivals, interpolated camera motion, reduced motion and focused-card/control bounds.
