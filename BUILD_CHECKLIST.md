# Recon Game — build checklist

Updated: 2026-10-12. Scope and tuning live in [GAME_BRIEF.md](GAME_BRIEF.md); this file tracks delivery evidence, not a second set of rules.

Earlier sections record delivery at that time. Pause/save checks and full-slot rejection were superseded by D42–D44; later sections record current verification. The earlier combined automation was superseded by D51; D69 now adds separately purchased automatic remediation. Fixed elapsed-time milestones and unattended debug presets are superseded by D65–D67.

## Stage 1 — establish the design baseline

- [x] Capture the user's intent and distinguish it from working design choices.
- [x] Define the player, core loop, and connection to Recon's value.
- [x] Specify a starting economy, issue lifecycle, growth, and recovery behaviour.
- [x] Bound the first playable and distinguish later features.
- [x] Create the decision log and resumption handover.
- [x] Review local links, consistency, and illustrative arithmetic.

## Stage 2 — first playable prototype

- [x] Recheck the dedicated Recon Game project folder, version-control state, and applicable instructions before implementation. Documentation-only folder; no Git repository or applicable AGENTS.md found.
- [x] Create a standalone game application in Recon Game and document how to launch it. React/TypeScript/Vite; launch instructions in README.md.
- [x] Implement active simulation time, deterministic growth, issues, and income. Pure engine in src/game.ts; deterministic tests pass.
- [x] Implement scan discovery, repair completion, capacity, and spending. Start-time coverage and duplicate rejection exercised by engine tests.
- [x] Implement the three prototype investments and their visible effects. Engine tests confirm duration/capacity changes; speed upgrades are one-time and capacity is now repeatable to five (D41).
- [x] Build the backend view, symptoms, findings, jobs, upgrade controls, and event history. Ecosystem-first UI, contextual system actions, speed upgrades below and capacity right.
- [x] Add guided first discovery, pause, local save/resume, restart, and six-minute results. Browser checks include unfinished-job reload, incompatible saves, restart and continue.
- [x] Check resource accounting, duplicate actions, scan timing, recovery, and save/resume. 13 engine/persistence tests pass; production build passes.
- [x] Play the complete loop in a browser and inspect the rendered result. Chromium UI journey reached 06:00, continued, and purchased all three upgrades; desktop and phone screenshots inspected.
- [x] Record observed pacing and remaining fun/usability questions in the handover. Initial economy preserved; enjoyment and final balance still need human playtests.

## Stage 2 usability feedback — implemented

- [x] Fit the primary game board and controls into tested desktop and narrow viewports without page scrolling.
- [x] Replace the general action panel with a system click that opens scan/repair actions, as explicitly chosen by the user.
- [x] Initial selection-based scan mode delivered; subsequently removed under D40 in the simplification pass.
- [x] Place speed upgrades below the ecosystem and work slots/Add work slot on the right.
- [x] Remove focus-loss pausing; freeze hidden tabs with automatic return, preserve manual pause, and explain modal suspension.
- [x] Check keyboard system actions/dialogs, selection scanning, slot assignment, viewport fit and persistence in Chromium.

## Stage 3 — complete first session

- [x] Preserve the six-minute introduction. Both stages now use shared direct system actions under D40.
- [x] Add connected Frontend and Identity systems with targeted scans, shared capacity and dependency effects.
- [x] Add security escalation and compliance deadlines with explicit warnings and recovery.
- [x] Add paid, scoped, opt-in scheduled scanning and routine bug repairs.
- [x] Add a final release challenge, session results and continuation.
- [x] Keep old saves readable; validate new campaign state and unfinished jobs.
- [x] Run deterministic campaign/ledger/dependency/automation tests: 21 total tests pass.
- [x] Verify the complete expanded browser journey and inspect desktop/mobile rendering. Final release cleared (3/3, 93% health); original smoke/usability runners pass.
- [x] Finalise verification evidence and remaining playtest questions. Four viewport bounds checks pass, including un-clipped nodes/forecasts and automation without scrolling; handover records evidence and tuning limits.

## Simplification — direct ecosystem actions

- [x] Remove Scan mode, selection state and selection-scan controls from both stages.
- [x] Put paid Scan and single-finding Repair buttons directly on each system; retain a chooser for multiple available findings.
- [x] Keep system details accessible by clicking the name, including keyboard inspection and Escape.
- [x] Preserve shared upgrades, work slots and scheduled-automation controls.
- [x] Check all four viewport sizes for map/action/forecast fit and inspect screenshots.
- [x] Finish direct-action browser regressions and record outcomes. Tutorial and complete expanded-session runners pass; 21 engine/save tests and production build pass.

## Capacity expansion — up to five slots

- [x] Allow four individual 150-credit purchases, with a maximum of five shared slots.
- [x] Show current → next slot count and the maximum in both stages.
- [x] Preserve legacy one/two-slot saves and validate purchase accounting and new counts.
- [x] Verify five manual and automatic jobs, sixth-job rejection, unfinished-job restoration and checkpoint purchases. 26 engine/save tests pass.
- [x] Finish five-slot browser and viewport checks. Four paid purchases, five running repairs, sixth-job rejection, reload/completion and four viewport sizes passed; screenshots inspected.

## Continuous play, overflow queue and removal of saving — current

- [x] Start immediately; remove pause/resume controls and first-repair growth gate.
- [x] Keep advancing while the page is open, through hidden-tab callback delays and all optional dialogs; no offline progression.
- [x] Record six- and eighteen-minute milestones without interrupting play or requiring continuation.
- [x] Add a FIFO queue count beneath work slots, available with one through five slots; pay once on submission.
- [x] Start queued actions on completion or capacity purchase; use actual-start scan coverage and upgraded duration.
- [x] Preserve affordability/duplicate checks, shared capacity, and manual queue priority over automation.
- [x] Remove saving code and all autosave/restore/import/export controls. No browser storage access; each load starts fresh.
- [x] Replace obsolete pause/save browser runners with the continuous-play regression in tests/browser-smoke.mjs.
- [x] Pass 21 deterministic engine tests and the production build.
- [x] Pass Chromium journey: direct first repair, live dialogs/background catch-up, both milestones, four slot purchases, five busy slots plus two queued repairs, automatic dispatch, automation controls, fresh reload/restart and blocked storage access.
- [x] Check map, five-slot queue and automation layouts at 1280×800, 1024×768, 800×700 and 390×844; inspect desktop/phone screenshots.
- [x] Update game brief, decisions, handover and launch instructions.

## Automation UX — per-system purchase on the map

- [x] Replace global capability purchases, scope selection and toggles with one purchase for each connected system.
- [x] Activate scans and routine bug repairs immediately for 210 credits per system; retain normal job costs and reserve.
- [x] Put purchase/status directly on system cards and explanations in system details; remove Automation tab.
- [x] Preserve manual queue priority, duplicate protection, scan cadence and manual security/compliance repair.
- [x] Pass 23 engine tests, including separate charges/coverage, affordability, reserve recovery and critical findings left for manual repair.
- [x] Pass final build and Chromium checks at all four viewport sizes, including controls inside map bounds. Inspect desktop/phone screenshots after compacting the mobile summary and upgrades.
- [x] Record module/project targeting as a later-level candidate, not current functionality (D47).

## Testing speed control

- [x] Add an accessible button beside the timer toggling 1× / 2× in both boards.
- [x] Scale simulation time uniformly; retain fractional time and background catch-up.
- [x] Preserve the selected rate across expansion/restart; use 1× on reload.
- [x] Pass 23 engine tests and the production build.
- [x] Verify fractional speed changes, income/job timing, background catch-up, expansion/restart retention, reload reset and mobile layout in Chromium.

## Faster normal pace — D49

- [x] Make the previous 2× pace the default 1× with normal clock seconds.
- [x] Halve durations, growth/automation intervals and deadlines; double income while preserving prices.
- [x] Set first milestone to 03:00, connections to 03:30 and release results to 09:00.
- [x] Support half-second job durations and keep the optional 2× override.
- [x] Update current records, countdowns, milestone labels and upgrade descriptions.
- [x] Pass 25 engine tests and production build.
- [x] Pass Chromium timing and layout regression: normal clock seconds, exact 03:00 expansion, 03:30 connections, 09:00 results, job durations, 2× override and all four viewports.

## Scan-only automation — D51

- [x] Remove automatic repairs and their result counters; all finding types require manual repair.
- [x] Label card actions Automate scans / Auto-scans and explain scope, scan cost and reserve in system details.
- [x] Show Repair findings when scans have revealed unresolved work; retain scan cadence, per-system price and manual queue priority.
- [x] Pass 25 engine tests and production build, including no automatic repairs across all three finding types and queued manual work taking priority over scans.
- [x] Pass Chromium regression, including idle slots with known findings awaiting manual repair, scan-only explanation and all four viewport bounds checks. Inspect phone rendering.
- [x] Update current records and retain paid remediation bundles as a future candidate (D52).

## Findings stay open — D54

- [x] Keep system findings open after starting or queuing a repair in both boards, including when the last repair finishes.
- [x] Verify successive repairs without reopening: seven repairs across five slots plus queue in expansion, two repairs across one slot plus queue in the introduction. Active/queued buttons disable; completed findings disappear; Close and Escape dismiss.
- [x] Production build and full Chromium regression pass. Update brief, decisions and handover.

## Contextual scan help and outside dismissal — D55

- [x] Remove the automation explanation from findings; put an independent i button inside the visual automation purchase/status control.
- [x] Support hover, keyboard focus and tap; keep help accessible without buying automation, including after purchase. Position the tooltip within the viewport and outside clipped card containers.
- [x] Dismiss findings on outside pointer clicks in both boards; preserve repair submission, inside clicks, Close and Escape.
- [x] Production build and full Chromium regression pass: no spending from help interactions, hover/focus/tap, tooltip Escape/outside dismissal, findings outside dismissal and all four viewport bounds. Desktop/phone screenshots inspected.
- [x] Update current records and launch guidance.

## Stage 4 — corporate ecosystem expansion — complete

User clarification: prioritise expansion to 100 repositories, with randomly sized modules of 3–5 repositories and projects of 3–5 modules. Remediation/endgame implementation is deferred.

- [x] Generate a seeded 100-repository hierarchy with valid 3–5 sizes and stable ownership.
- [x] Extend the simulation beyond the release milestone with connected repositories, health, dependency effects and work on each repository.
- [x] Add project/module/repository navigation and scoped scan, repair and scan-automation actions with explicit aggregate costs.
- [x] Verify group action accounting, ownership, capacity, growth boundaries, repeatability and the 100-repository limit. 31 engine tests pass.
- [x] Validate desktop/mobile navigation, pagination, queue and scan help through the browser. Full regression passes at four viewport sizes; project/module/generated-repository screenshots inspected. A generated repository is scanned and repaired through real controls.
- [x] Update brief, decisions, handover and launch instructions with current rules, evidence and tuning limits. Production build passes.

## Hidden debug level selector — D60

- [x] Three Recon-logo clicks within two seconds unlock the selector; provide a Debug footer button afterward and explicit exit.
- [x] Offer all eight named gameplay checkpoints, including the 100-repository company, using normal unattended simulation and retaining layout seed/speed.
- [x] Reset old UI, work and clock remainder on jumps; support backward jumps and continuous play while selecting.
- [x] Verify 33 engine tests and production build. Full Chromium regression passes all starting points, click timeout, keyboard unlock, speed/clock retention, restart/exit/reload behavior and no storage access.
- [x] Inspect desktop/phone debug screenshots; selector fits without scrolling at 1280×800 and 390×844. Update project records and usage instructions.

## Later milestones — not started

- [x] Implement full autonomy under Stage 6 / D69–D70; keep the release milestone distinct and preserve continuous play.

- [ ] ON HOLD by user direction: paid remediation tiers and finding bundles (D52). Existing speed upgrades accelerate individual manual/automatic jobs; no bundle/discount tree is implemented.

- [ ] Design cascading failures after neglect (D50): local repository failure, delayed spread to dependants, onward propagation and resolution. Define scan-staleness behaviour, warnings, cycles, downstream recovery and compatibility with the health/income floor before implementation.
- [x] Implement per-level startup lore from the user's first-round feedback (D45): first team/database/backend with design underway, then summit recognition, investors, hiring and ecosystem expansion. Implemented under Stage 7 / D71; chapter boundaries follow earned milestones and connected counts.
- [x] Review opening idle gaps and add contextual investment planning, next-action guidance and clear unlock goals (D72); retain timing/prices for human comparison.
- [ ] Human playtest: do story context and meaningful goals improve engagement and upgrade decisions?
- [x] Resolve D47 through Stage 4: project/module/repository navigation, 3–5 grouping, scoped actions and transparent scan automation pricing (D56–D58).
- [ ] Strategic balancing: viable investment choices, fair warnings, and recovery.
- [ ] Release polish: visual identity, optional sound, smaller screens, accessibility, and onboarding.
- [ ] Human playtests: comprehension, enjoyable decisions, upgrade satisfaction, and Recon takeaway.
- [ ] Shareable release: production build, deployment, browser verification, and delivery notes.
- [ ] Endless mode: continued expansion, aggregation, varied scenarios, and performance checks.

## Evidence discipline

Only mark implementation complete after inspecting or exercising it. Record test commands and outcomes in the handover when there is code to test. A successful build does not establish enjoyable gameplay, and simulated metrics do not establish real Recon outcomes.

## Stage 5 — economy and healthy progression (D65–D67)

- [x] Separate cumulative healthy-time goals from continuously running world time; threshold ≥90%, retained progress, 3-minute/6-minute goals, explicit held status and automatic resumption.
- [x] Anchor expansion events and corporate growth to actual earned transitions; preserve world-time income, jobs, forecasts and deadlines.
- [x] Add five global scan-efficiency tiers, transparent prices/payback, exact fractional scan accounting and prepaid-queue consistency.
- [x] Add stable recovery income and ease full-pace backend development; exercise a paid recovery strategy from a neglected state.
- [x] Replace unattended debug timestamps with coached gameplay checkpoints, using paid actions and retained seed/speed.
- [x] Keep focused-project module labels separate on short canvases, retaining leader lines to fixed world anchors; test 100 seeded hierarchies.
- [x] Engine/map suite: 43 tests passing, including healthy-goal boundaries, delayed transitions, tier limits, affordability, group/automatic costs, queue prepayment and recovery.
- [x] Production build and full Chromium regression pass. Screenshots inspected at 1280×800, 1024×768, 800×700 and 390×844; healthy clocks, efficiency purchases, all three expansion repositories, focused corporate actions and five-slot queue fit without page scrolling.
- [ ] Human playtest of upgrade value, recovery feel and progression; average-health relevance at 100 repositories remains a design question.

## Connected ecosystem canvas — D63

- [x] Replace corporate group cards and pagination with fixed world positions, group orbits and dependency links on one canvas.
- [x] Add pointer-anchored trackpad pinch, two-axis pan, blank-space drag, touch gestures, keyboard alternatives and Fit all.
- [x] Frame groups on the same map; reveal original repository controls when zoomed in; add a repository finder. Preserve scoped actions, prices and queue.
- [x] Verify stable layout/viewport fitting across 100 seeds and zoom anchors/limits; 35 engine/map tests pass.
- [x] Complete Chromium regression: camera gestures/keyboard controls, touch pinch and subsequent clicks, scope actions/accounting/queue, repository work, scan help, speed and debug jumps. Inspect desktop/phone screenshots at four viewports and preserve no page overflow. Physical trackpad feel and Safari remain unverified.

## Deliberate scan help — D64

- [x] Remove hover/focus opening and delayed mouse-leave behavior; click/tap/keyboard activation toggles the i-button explanation. Retain Escape/outside dismissal.
- [x] Update existing browser expectations and project records; D55 hover behavior is historical.
- [x] Production build and focused desktop/phone Chromium checks pass: no hover/focus opening, click toggle, Enter/Space, Escape/outside dismissal and unchanged credits.

## Repository repair-all and stable findings list — D68

- [x] Show finding count/total, submit affordable repository repairs atomically, fill slots and queue overflow at existing individual prices.
- [x] Open individual choices without spending when total funds are insufficient; keep repository-name inspection available.
- [x] Move selected findings to the bottom in submission order with Repairing/Queued status, retaining scroll and next-choice keyboard focus.
- [x] Five new engine tests; all 48 tests and production build pass. Update decision, brief, README and handover.
- [x] Full desktop/phone Chromium regression passes; repair controls/list screenshots inspected. Verify no charge on fallback, exact bulk cost, overflow queue, selected-row ordering, keyboard focus and stable scroll.

## Stage 6 — automatic remediation and autonomy (D69–D70)

- [x] Add per-repository automatic repairs, independent from scan setup; ordinary finding costs/types, shared capacity, reserve, manual priority and duplicate protection.
- [x] Add exact overlap-safe module/project setup purchases and local status. Keep paid remediation tiers/bundles explicitly on hold.
- [x] Implement sustained full-autonomy criteria, observed-work/operating-income proof, interruption/reset rules and immutable victory with continued simulation.
- [x] Add criteria/progress UI, milestone victory and a paid coached Autonomy trial debug checkpoint.
- [x] All 57 engine/map tests and build pass; verify all finding kinds, affordability, queue priority, reserve recovery, scheduler fairness, scope overlap, victory blockers/reset, no-work non-victory and deterministic attainable win.
- [x] Full Chromium regression passes; inspect corporate/three-repo automation controls and victory/criteria at desktop and phone sizes. Short-screen map footer remains inside its parent. Final focused check distinguishes scan/repair job statuses. Handover evidence updated.
- [ ] Human playtest of automatic-repair pricing, operating balance and victory pacing.

## Stage 7 — startup story and pacing clarity (D71–D72)

- [x] Six narrative chapters tied to earned milestones, connected counts and full autonomy; early development story beats.
- [x] Compact chapter link and optional current story/roadmap, with reached/current/future states. Continue world time while reading; reset/debug remain consistent.
- [x] Show the next unlock and remaining healthy time, growth countdown or autonomy coverage. Keep unhealthy progress reasons explicit.
- [x] Contextual known-repair/scan guidance, running/queued-work awareness, investment reserve advice and named system navigation. Fully covered trials avoid manual-work coaching.
- [x] Preserve the original ecosystem/canvas, prices, timings, continuous play and deferred features.
- [x] Add five deterministic story/guidance tests; 62 engine/map/story tests pass. Build passes.
- [x] Full Chromium regression and dedicated story/navigation journey pass. Inspect screenshots at desktop/phone sizes; check no scrolling/section overlap, live story time, keyboard focus return, named repository navigation, chapter/reset mapping and no storage/browser errors. Reports: `test-results/continuous-browser.json`, `test-results/story-browser.json`.
- [ ] Human playtest of startup engagement, narrative fit, investment value and quiet intervals. No enjoyment claim from automated tests.

## Post-Stage 7 feedback — D73–D75

- [x] Automatically introduce chapters, including fresh runs; defer behind existing dialogs, freeze the displayed chapter, and avoid repeat prompts. World time continues.
- [x] Show System failure and the 90% goal-hold reason beneath ecosystem health; clear at recovery. Keep the three-healthy-minute goal.
- [x] Move speed control to the right edge of the timer column with a visible gap.
- [x] Increase scan-efficiency prices to 20/100/500/2500/12500, retaining scan reductions and updating payback/accounting checks.
- [x] All 62 engine/map/story tests and production build pass. Full gameplay, story and feedback Chromium journeys pass at desktop/phone sizes. Inspect chapter-entry, health-failure and connected-failure screenshots; verify all chapter transitions, deferral, continuous time, recovery, timer gap, layout bounds and no browser errors/storage access.
- [ ] Human playtest: initial reading time, first goal duration and later-tier value.

## First-chapter rules — D76

- [x] Replace chapter 1's roadmap with four simple gameplay steps and explain the 90% healthy-time hold/retained progress.
- [x] Production build passes; focused Chromium check verifies four steps, dismissal and no modal scrolling at desktop/phone sizes. Inspect `test-results/chapter-one-rules-390.png`. No engine rules changed.

## Healthy-time threshold — D77

- [x] Lower level-progress threshold to 80%, inclusive; retain earned time below it. Keep the separate autonomy victory criterion at 90%.
- [x] Use shared threshold in rules modal, health warning, progress clock, guide and release log. Update brief and handover.
- [x] All 62 engine/map/story tests and production build pass. Feedback Chromium journey passes desktop/phone layouts, exactly-80% progress, low-health hold and repair recovery; inspect updated phone failure screenshot.
- [x] Full Chromium gameplay regression passes after updating threshold-sensitive timing assertions; no browser errors or storage access.

## Failure revenue — D78

- [x] Reduce health-adjusted credit income by 25% below 80% average health; restore at 80%. Keep positive income and existing cent rounding for recovery.
- [x] Show reduced income and −25% in both early and expanded views; explain it in chapter 1.
- [x] All 63 engine/map/story tests and production build pass. Verify threshold, actual earnings, recovery, expanded income, automatic job reserves and paid recovery from neglect; no free funds used.
- [x] Chapter rules still fit without scrolling at 1280×800, 800×700 and 390×844.
- [x] Feedback Chromium journey passes desktop/phone layouts and income reduction/recovery; inspected chapter modal and both early/connected phone failure views. Narrow-screen income label wraps cleanly.
- [ ] Human playtest the 25% penalty and recovery pace before further balance changes.

## Two-minute first chapter — D79

- [x] Change the first goal to 120 healthy seconds; keep 80% threshold, failure revenue and the later 360-second goal.
- [x] Derive first-goal labels from the rule in chapter modal, unlock text, automation prerequisite, help and milestone heading.
- [x] All 64 tests and production build pass, including exact 119.5/120-second transition boundary, subsequent goal and debug checkpoints. Focused Chromium check confirms 2m timer, rules text and no modal scrolling on desktop/phone.

## Story action label — D80

- [x] Rename Back to game to Start Next Chapter and update browser selectors. Existing dismissal behavior retained.
- [x] Typecheck and production build pass; project records updated.

## Repository automation controls — D81

- [x] Move Auto repairs below manual actions and automatic scans; remove automatic-scan information button, popup and component.
- [x] Double repair automation setup to 480 credits per repository, including scoped purchases; update debug budget checks and cost assertions.
- [x] All 64 engine/map/story tests and production build pass; paid autonomy still succeeds at the higher price.
- [x] Feedback browser journey passes at 1280×800, 1024×768, 800×700 and 390×844; inspect desktop/phone connected-system screenshots. The compact shared-bottom-row layout was later corrected by D84 to keep automations vertically stacked.
- [x] Full gameplay Chromium regression passes: no scan-info button/popup, correct individual and group setup charges, queued repairs, debug checkpoints and paid autonomy victory. Corporate phone screenshot inspected. Browser funding waits updated for current prices/income.

## Healthy corporate chapter milestones — D82

- [x] Require ≥25 repositories and ≥80% health for chapter 4, then 100 and ≥80% for chapter 5. Latch earned milestones after simulation events so chapters cannot regress.
- [x] Keep growth running below threshold; display the active count target, current/required health and Chapter held. Update roadmap unlocks and coached company checkpoint.
- [x] All 66 tests pass, including unhealthy arrivals, both delayed milestones, exact 80% recovery, continued growth, retained chapters and deterministic advances. Story/debug tests rerun after final assertions; production build passes.
- [x] Story browser journey passes desktop/phone targets, modal layouts, coached checkpoints and victory. Reduce the short-laptop canvas minimum and compact credit font to avoid overflow in held-chapter layouts.
- [x] Feedback browser journey passes: unhealthy growth through 25 and 100 keeps chapter 3 active without a modal; earned chapter 5 stays unlocked after degradation; deferred victory modal still works. Held-target layouts fit desktop and phone; phone screenshot inspected.

## Chapter completion feedback — D83

- [x] Add final-10-second Almost there cue, completed timer snapshot, gold fill/sweep/glow and checkmarked chapter feedback before the next modal.
- [x] Keep simulation live; use a 2.4-second visible wall-clock interval at either speed. Respect reduced motion, existing dialog deferral, hidden pages and restart/debug reset.
- [x] Production build passes. Dedicated completion browser journey passes paid first-chapter play, near-goal cue, completed clock, modal timing, continued world time, 2×, reduced motion, interruption/hidden-page deferral and restart cancellation at desktop/phone sizes. Screenshots inspected.
- [x] Existing feedback and story browser journeys pass with the presentation delay, including health holds, dialog deferral, debug and victory. Keep short-laptop map controls inside their container by reducing vertical gaps.

## Stacked automation and card spacing — D84

- [x] Keep scan automation above Auto repairs at all viewport sizes, including installed states; retain repair automation as the last action.
- [x] Narrow compact corporate cards and show full cards only from 100% zoom. Keep smaller nodes below that zoom and preserve click/Find repo focus.
- [x] Reserve room for the full focused card and map controls; compact secondary guidance/spacing on short screens and keep connected-phone deadline cards clear of the growth footer.
- [x] Production build and dedicated Chromium geometry journey pass at 1440×1000, 1280×800, 1024×768, 800×700 and 390×844: stacking/alignment, overlap, button overflow, focused-card visibility, map controls and page bounds. Cover connected/corporate unhealthy states, installed automation and zoom-out. Report: `test-results/automation-layout-browser.json`. Desktop/phone screenshots inspected.
- [x] Existing story and chapter-completion browser journeys pass during the layout change; final feedback journey passes health failure, deadline cards, chapter holds, modal deferral and victory. Engine rules unchanged; earlier engine/full gameplay regression evidence remains D82/D81.

## First chapter start label — D85

- [x] Chapter 1 uses Start game; later story chapters retain Start Next Chapter. Use the presented chapter and keep behavior unchanged.
- [x] Update existing browser dismissal selectors for both labels. Production build and focused Chromium check pass for first/later chapter labels and dismissal.

## Autonomy medals and measured baseline — D86

- [x] Compare 20 paid fresh-run engine strategies and validate the best policy on five seeds at 1s/5s decision intervals. Record route, results, threshold rationale and limitations in MEDAL_PLAYTEST.md.
- [x] Award Gold ≤25:00, Silver ≤30:00, Bronze on later finishes from exact total elapsed game time. Freeze medal/time at victory; mark later debug starts as practice previews.
- [x] Show medal, finish time and thresholds on final chapter/Victory/milestones; final chapter uses Keep playing. Preserve Start game and later introduction labels.
- [x] All 68 tests and production build pass. Boundary, rounding, practice and immutable result tests included.
- [x] Replay 553 ordinary paid UI actions from a fresh seeded game to an earned Gold victory at 21:53.5. Check credits, frozen result after 90s continued play, reopening, restart and scroll-free result at 1280×800, 800×700 and 390×844. Screenshots inspected; story browser regression passes.
- [ ] Human playtest medal difficulty; engine search and automated UI input are not human performance distributions.

## D87 — accepted finishing pass, 2026-10-10

- [x] First Start game starts the simulation and total medal clock together. Initial reading and Escape do not consume time; subsequent dialogs stay live. Fresh restarts wait again.
- [x] Show the current medal target beside elapsed time and all three thresholds in the opening rules.
- [x] Make higher scan-efficiency tiers useful for a large rollout: lower new automatic-scan setup costs; cap the fifth upgrade price at 6000. Preserve separate repair costs, prepaid work and no refunds. Shared individual/group quotes and guards tested.
- [x] Show joint automation coverage, a 60-second trial bar, the current blocker and an interrupted trial's reason. Retain the reset event in the log without repeated log spam.
- [x] Add brief repair/automation border feedback with reduced-motion support. Add optional session-only chapter sound, initially off, playing once on visible completion.
- [x] All 70 engine/map/story tests pass; production build passes. Two new tests verify setup discounts/accounting/overlaps and joint coverage/reset reasons.
- [x] Focused finishing Chromium checks pass: free initial reading, Escape/start/restart, live later story, reduced-motion repair feedback, automation-purchase feedback, gold-to-silver-to-bronze target changes and opt-in/once-only/opt-out sound scheduling. AudioContext was stubbed for deterministic scheduling assertions; subjective audible quality remains untested.
- [x] Existing story, health-feedback and completion browser journeys pass, including desktop/phone bounds, healthy-time holds/recovery, deferred chapter/victory presentation and 2×.
- [x] Automation stack/focused-card browser checks pass across 1440×1000, 1280×800, 1024×768, 800×700 and 390×844.
- [x] Rebenchmark prior policies and saving for expensive models; validate the new tier-5 policy on five seeds and two reaction intervals. Retain 25/30-minute medals. Current best tested 20:49.5, not a proven global optimum.
- [x] Fresh full paid Chromium replay: 579 commands, 20:51.5 exact, Gold earned, immutable result after continued play, reopened result and restart. Report: test-results/medal-playthrough-browser.json.
- [x] Prepare HUMAN_PLAYTEST.md for 3–5 unassisted sessions and update the brief, decisions, README, handover and medal calibration.
- [ ] Conduct real unassisted human playtests; validate enjoyment, investment comprehension and medal difficulty. Safari/physical-trackpad feel also remain unverified.

- [x] Final full general Chromium regression passes after updating old immediate-start and fixed-price test expectations. Covers all five efficiency tiers, fractional scoped setup accounting, low-health/queued-work layouts, map gestures, repair-all and chooser retention, all debug starts, automation, victory, restart and no storage access. Report: test-results/continuous-browser.json. Final build passes.

## Investigation — apparently permanently healthy systems, 2026-10-10

- [x] Trace recurring finding generation, real health calculation, map aggregation and scoped action counts. No health freeze or scan-caused repair identified.
- [x] Reproduce from paid `debugGame('company',1)` without subsequent actions or any automation: after 20s, 8 repos targeted and 90 still healthy; after 250s, all 100 targeted and none healthy. Initial clock 1062s, first next finding 1063s. Fixed-order 2.5s cadence explains long quiet blocks at corporate scale.
- [ ] Consider seeded shuffled target cycles to spread activity across projects without increasing total pressure. Proposal only; engine rules, medal calibration and UI unchanged. Exact user run was not available.

## D88 — GitHub publication

- [x] User chose a public repository plus a playable web link; account erlandvr verified through the GitHub connection.
- [x] Initialize main, review the source/file list and exclude dependencies, builds, local test artifacts and credentials.
- [x] Add an Actions workflow for tests, repository-base production build and Pages deployment. Update landing metadata and README deployment instructions.
- [x] All 70 tests and the /recon-game/ production build pass locally.
- [x] Complete CLI sign-in, create/push public erlandvr/recon-game and enable Actions-based Pages. Initial source commit 1736713. Local production-path Chromium scan/repair and desktop/phone checks pass.
- [x] GitHub run 38052992096 succeeded (Node 24 tests/build/deploy). Public repository https://github.com/erlandvr/recon-game; playable HTTPS site https://erlandvr.github.io/recon-game/. Deployed source 1736713. Live Chromium checks pass for assets, Start game, paid scan/repair, health recovery and desktop/phone bounds; no browser errors. Evidence: test-results/published-browser.json.


## D89 — Recon design-system integration (2026-10-12)

- [x] Review supplied archive foundations, tokens, component patterns, assets and integration dependencies.
- [x] Create `codex/recon-design-system` from origin/main; preserve unrelated user image.
- [x] Apply exact dark palette, self-hosted fonts, supplied brand mark, semantic surfaces, control states, dialogs and status labels.
- [x] Preserve gameplay and compact responsive layout, including vertically stacked automation and reduced motion.
- [x] Pass all 70 tests and production build under the GitHub Pages base path.
- [x] Pass Chromium automation layout at five sizes, story, full gameplay, chapter completion and production font/scan/repair smoke checks; inspect desktop/phone screenshots.
- [x] Record provenance/adaptations and review screenshots in DESIGN_SYSTEM.md.
- [x] Push branch and open [GitHub PR #1](https://github.com/erlandvr/recon-game/pull/1). Main publication stays unchanged pending merge.
- Remote Node 24 test/build status is tracked on PR #1; browser checks above were run locally.


## D90–D91 — arcade lore and chapter pauses (2026-10-12)

- [x] Implement approved short SumZero/Recon operator opening, one action, two-minute/80% target and first-problem cue.
- [x] Shorten later chapter stories and replace roadmap with the current target; keep post-start investment advice.
- [x] Pause all simulation during every chapter briefing; explicitly label pause and resume without reading-time catch-up at 1×/2×.
- [x] Preserve free initial start, completion celebration and live non-chapter dialogs.
- [x] Pass 70 tests, production build, dedicated pause, story and completion browser checks; inspect desktop/phone opening screenshots.
- [x] Full gameplay, health-feedback and finishing/sound regressions pass. Fix short-laptop deadline-card clipping and pass five-size automation-layout checks; inspect the corrected 1024×768 view.
