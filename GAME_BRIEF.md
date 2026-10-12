# Recon Game — game brief

Status: Stages 1–7 implemented and locally verified. Pacing and balance await human playtesting.

Updated: 2026-10-12.

Owner: Erland.

Companion records: [build checklist](BUILD_CHECKLIST.md), [decisions](DECISIONS.md), [handover](HANDOVER.md).

Chapter lore uses 50% larger type throughout the game, including the opening and victory briefing; other game text uses 20% larger type, both relative to original sizes (D95). Action buttons share the Start game sage colour with dark text; chapter navigation, work slots, map labels and the logo retain their original colours, and disabled actions remain muted (D96). Use Fix, Fixes and Fixing in all player-facing text (D97).

System headings are read-only status summaries in their original health colours. Scan and Fix act directly on the map; there is no findings popup. When credits are limited, Fix submits as many eligible findings as affordable, prioritising the earliest deadlines and then oldest findings, with count and cost shown before purchase (D98).

When a chapter goal is reached, show a 3.6-second celebration before the next chapter briefing: the completed goal, a gold ring/check, and the next chapter title. Keep a static equivalent for reduced motion. Briefings continue to pause the game (D99).

Fully automated repositories have a gold outline and Automated label. Modules and projects display a glowing gold circle and the same label once every connected member has both scan and fix automation. New uncovered members remove the group marker. Gold indicates purchased coverage, independent of health or temporary work delays; health retains its own colours (D100).

## Game modes (D101–D108)

Choose **Speed Game · 5 min** or **Long Game · ~20 min** before starting. Long Game is the current 100-repository experience described below; its economy, chapter progression, paused briefings and speed toggle are unchanged.

Speed Game is a race to autonomy across 12 repositories in three modules, aiming for under five minutes. Its elapsed timer includes unhealthy time and keeps running beyond 05:00 until victory. First fix, scan coverage and module automation unlock successive teams. Repositories connect one at a time every 2.5 seconds on the same map. Automation purchases unlock after two active minutes and the first fix. The unlock pauses for a short explanation; Dive Back In resumes, excluding reading time from the finish time. Later phases use brief banners. Two efficiency tiers and lower setup costs support the shorter run. All 12 must become fully automated and pass a 20-second autonomy trial. Record actual finish time; Gold ≤04:30, Silver ≤04:45, Bronze ≤05:00, with later completion still valid but no time medal. Retry and unranked continued play are available. A future scoreboard will compare fastest finish times; it is not implemented yet. See [Speed Game rules and calibration](SPEED_MODE.md).

In both modes, the whole-ecosystem overview automatically fits new repositories. Selecting a repository or group, zooming or panning preserves that view during growth. Resizing preserves manual zoom or reframes the selected group. Fit all or the Ecosystem breadcrumb re-enables automatic overview framing. Animate framing smoothly, or immediately with reduced motion (D106).

Bundled controls live on module/application nodes, using the same Scan/Fix and stacked automation order as repositories. Click a compact group to open its inline action card. Counts, exact costs and purchased coverage apply only to that group; View repos or View modules opens its members. There is no top bundled-action bar. Scope pricing, affordability and job queues remain unchanged (D107).

## Supported devices

**Desktop and laptop browsers only (D94).** The game is not expected to work on mobile. Mobile layouts, touch-specific adaptations and mobile validation are outside the product requirements. Validate desktop/laptop readability, mouse/trackpad controls and keyboard use. Earlier phone screenshots and test results are historical evidence, not ongoing acceptance criteria. Existing mobile styles may remain, but do not spend work maintaining them.

## Visual identity

D89 applies the supplied Recon design system: Space Grotesk and Space Mono, the supplied brand mark, neutral dark surfaces, green healthy/active accents, amber degradation and red failure. Compact ecosystem-first geometry, stacked automation and all gameplay rules remain unchanged. See [design-system integration](DESIGN_SYSTEM.md) for source provenance and adaptations.

## Executive Summary

Recon Game is a browser management game about keeping a growing software ecosystem healthy. Players begin with one backend, discover hidden problems through scans, manually resolve findings, and invest in capabilities that let them manage increasing scale. The intended experience is enjoyable without programming knowledge and makes the value of visibility, prioritisation, and automation understandable through play.

The user's confirmed direction is an independently growing ecosystem, increasing difficulty, manual scanning and fixing at first, and purchased improvements that eventually automate work across many repositories. The rules below are the current prototype contract; implementation and verification evidence is recorded in the checklist and handover. They are not claims about current Recon product capabilities. All numerical values remain initial tuning assumptions.

## Contents

- [1. Solution concept](#1-solution-concept)
- [2. How it works](#2-how-it-works-simplified-flow)
- [3. Solution characteristics](#3-solution-characteristics)
- [4. Current release and future scenarios](#4-current-release-vs-future-scenarios)
- [5. Key dependencies](#5-key-dependencies)

## 1. Solution Concept

### Player and promise

The player operates Recon, earning a management budget from a healthy fictional ecosystem. Intended players include curious non-developers and people familiar with software delivery. The initial language is English. Real code, accounts, and repository connections are unnecessary for play.

The emotional progression is: “I can fix this myself” → “I need to choose where to spend my time” → “My Recon operation handles work I could no longer manage alone.”

Development continues independently. The player chooses investments and interventions, rather than manually creating every feature or repository. Future release forecasts provide time to prepare. Growth introduces dependencies and competing priorities as well as volume.

### Three design commitments

1. **Legible consequences:** symptoms and event history let players understand setbacks. Scanning reveals an existing problem; discovery itself never causes damage.
2. **Meaningful investment:** improved detection, remediation, and prevention address different bottlenecks. There should be no universally best purchase sequence.
3. **Increasing agency:** automation removes familiar repetitive work while the player takes responsibility for more consequential decisions.

### The value of Recon through play

| Player experience | Intended takeaway | Where introduced |
| --- | --- | --- |
| Symptoms have a discoverable cause | Visibility enables informed action | First prototype |
| Limited capacity forces a repair order | Findings need prioritisation | First prototype |
| Growing development outpaces the original workflow | Capability must grow with the ecosystem | First prototype |
| A shared dependency affects several services | Connections change the impact of a finding | Complete first session |
| Scheduled scans reveal findings without repeated clicks | Automation expands manageable coverage | Complete first session |
| Recurring defects become less frequent after prevention investment | Improving the system reduces future work | Later balancing |

These are simulated lessons. Marketing text that names an actual Recon feature must be checked against the real product before release. In-game outcomes are not evidence of real-world risk reduction or certification.

## 2. How It Works (Simplified Flow)

1. Watch a backend earn credits and expand through development.
2. Notice degraded operation without yet knowing the exact cause.
3. Spend credits on a scan; it starts when capacity is available.
4. Review revealed findings and their impact.
5. Choose a finding to fix; its impact remains until the repair completes.
6. Restore operation and invest the resulting income in Recon capabilities.
7. Repeat as development increases the workload, then progress to connected services and automation.

### Economy and operating rules

Use one spendable currency: **credits**. Healthy service operation earns them; scans, repairs, and upgrades consume them. Do not pay per defect discovered or fixed, which would reward growing an unhealthy backlog.

**Work slots** limit concurrent scans and repairs. Start with one slot and buy up to five for 150 credits each (four purchases, 600 credits). Manual and automatic jobs share this capacity. When all slots are busy, manual actions enter a first-in, first-out queue. A count beneath the slots shows waiting actions, including before all five slots are purchased. Actions are paid when submitted; starting a queued action never charges again. New capacity immediately starts the next queued order. Duplicate scans on a system and duplicate repairs of a finding are rejected whether running or queued. Costs and discovery requirements still apply. The queue has no fixed count limit; cancellation and reordering are not implemented.

**Service health** communicates operational condition. In the prototype, each unresolved bug reduces health by 20 percentage points. Health is capped between 20% and 100%, and income equals healthy income capacity × (0.75 + 0.25 × average health / 100). Below 80% unrounded average health, apply a further 25% failure reduction (×0.75); remove it immediately at recovery to 80%. At the 20% health floor, 60% of healthy income remains available for recovery (Backend 1.20 cr/s). Credits retain the existing cent rounding per half-second tick. The Income metric shows −25% during failure, and chapter 1 explains it (D78). This recovery floor is a deliberate early-game simplification; the prototype has no bankruptcy or terminal failure.

Scans reveal unresolved bugs present when the scan starts. New bugs during scanning need a later scan. Show the scan's coverage time and indicate when subsequent development has made its results older. Never label an unscanned repository as verified healthy.

A repair requires a known finding. It consumes its cost on submission, completes reliably once a work slot becomes available, and restores the health lost to that finding. One finding cannot have duplicate repairs. Rescanning must not resurrect a repaired finding or duplicate an existing one.

The player may postpone any finding and see its continuing cost. Bugs affect operation before discovery; scanning changes knowledge rather than the underlying health calculation. Repair completion is directly confirmed in the prototype; verification scans are a later design question.

Prototype timing uses half-second simulation steps; the clock displays normal elapsed seconds at 1×. A fresh game waits at its opening rules: no time, income or findings advance until Start game is pressed (D87). Simulation and medal clock begin together, then keep advancing while its page remains open, except while a chapter/story modal is open (D91). Chapter reading pauses income, jobs, queue dispatch, health, growth, deadlines, trial progress and elapsed/medal time. Reopening a chapter also pauses. Closing resumes without counting reading time, including hidden-tab reading; fractional active time is preserved. Log, results and restart dialogs remain live, as do hidden/unfocused pages outside chapter briefings. Browser throttling may delay callbacks; elapsed open-page time is caught up in bounded batches without discarding the remainder. There is no separate pause control or tutorial growth gate. Closing/reloading begins a fresh run on the next load, with no offline progression. Speed upgrades affect jobs when they actually start, including queued orders; running jobs retain their original completion time.

The ecosystem is the main game board. Each system shows direct Scan and Repair buttons beside its health, known-finding count and running-work feedback. At corporate scale, projects and modules aggregate those repositories; a pan/zoom canvas keeps those groups and their repositories in one connected world (D63). Scan submits a paid scan when undiscovered problems exist. Repair submits all available known findings for that repository when the total is affordable. With several findings it shows **Repair all (N) · total cr**; each finding still costs 15 credits and uses an ordinary work slot or the FIFO queue. When the total is unaffordable, it opens individual choices without spending. Hidden, completed, running and queued findings are excluded from the total. Clicking the system name opens full contextual details and actions. Starting or queuing a repair keeps this view open so the player can submit other repairs in the same visit. Submitted findings move to the bottom of the list in submission order, labelled Repairing or Queued. Their buttons are disabled; unsubmitted findings stay above them. Scroll position is retained and keyboard focus moves to the next available choice. Completed findings disappear without closing the view. Close, Escape or clicking outside dismisses it. Clicking within the view, including submitting repairs, keeps it open. Full slots change actions to Queue scan / Queue repair; queued actions show their status. The scan-mode switch and selection workflow remain removed. Speed and scan-efficiency upgrades sit below the map and work slots and queue on the right.

The **Healthy time** display has an adjacent **1× / 2× speed** control. Level progress accumulates only while the unrounded mean ecosystem health is at least 80%. Below that threshold, earned progress stays and the guide explains how to resume. Level 1 needs two healthy minutes, expansion needs six more, and corporate operation displays ongoing healthy uptime without a final goal. A secondary **Elapsed** clock keeps running with income, jobs, queue dispatch, automation, development and deadlines. At 2×, both clocks and the whole simulation advance twice as fast when eligible. The selected speed survives expansion and in-page restart; reload defaults to 1×. Gameplay seconds at 1× remain ordinary seconds (D49/D65).

### Initial tuning values

| Parameter | Starting hypothesis |
| --- | --- |
| Starting credits | 40 |
| Healthy backend income | 2 credits per elapsed second |
| Starting work slots | 1 shared by scanning and remediation |
| Basic scan | 5 credits; 3 seconds |
| Basic repair | 15 credits; 5 seconds |
| First bug | At 15 seconds; 20-point health impact |
| Subsequent bugs | One every 30 seconds after the first bug; interval becomes 22.5 seconds at development stage 2 and 20 seconds at stage 3 |
| Development growth | Stages advance at 60 and 120 seconds; forecasts appear 15 seconds beforehand |
| Additional work slot | 150 credits per added slot; repeatable up to 5 total |
| Faster scans | 110 credits; scan duration becomes 1.5 seconds; one purchase |
| Faster remediation | 130 credits; repair duration becomes 2.5 seconds; one purchase |
| Prototype results | Snapshot after 2 healthy minutes; play continues automatically |

Growth does not depend on completing the first repair. Development stages advance at 60 and 120 seconds even if the player does nothing. After each bug, schedule the next using the current interval; a stage change keeps an already scheduled bug rather than adding another immediately. The first bug is at 15 seconds and the second at 45 seconds.

The health floor lets a player with no credits earn enough to scan and repair individual findings. A deterministic recovery test repairs a neglected backend after capacity, repair-speed and first-tier efficiency investments; human recovery pacing still needs playtesting. On-demand milestones report condition and work completed without claiming that a fixed score proves good real-world practice. Tune these values after play; arithmetic alone cannot establish enjoyment.

After earning two healthy minutes, record an immutable milestone snapshot and start expansion automatically. Milestones are available on demand and never interrupt play. A restart requires confirmation. All saving features are removed for now: no autosave, restore, import, export, storage schema or backup controls. Existing browser data is ignored. Saving may be reconsidered later.

### A concrete early decision

After the first bug, income falls from 2 to 1.9 credits per second. A scan and repair cost 20 credits and occupy the initial slot for 8 seconds. The repair restores full income. The player can then save for faster scans, faster remediation, or another slot while further development adds work.

All investments must have visible before/after behaviour. If testing shows that one is never useful in the single-repository prototype, change its cost or timing before adding further upgrades.

## 3. Solution Characteristics

| Dimension | Approach |
| --- | --- |
| Architecture | A standalone browser game planned in React/TypeScript in the dedicated Recon Game folder; simulation rules remain independent of the interface |
| Data ownership | Fictional ecosystem held in memory for the open page |
| Integration | Self-contained play; no live Recon service or external account required |
| Scalability | First prototype models one repository; later releases group large ecosystems into systems and portfolios |
| User experience | Ecosystem-first play, system-click actions, speed upgrades below the map and work capacity to the right; viewport layout with compact map/capacity views on narrow screens |
| Device strategy | Desktop first; smaller-screen controls and layout refined before shareable release |
| Time | Runs while the page is open; chapter briefings pause the full simulation; no closed-page progression |
| Accessibility | Written state labels alongside colour, keyboard controls, readable text, reduced motion |
| Persistence | Removed for now; each page load starts fresh |
| Visual identity | Recon-inspired neutral surfaces, deliberate accents, and motion that explains scans, growth, and repair |

The first prototype uses deterministic events so balancing and bug reports can reproduce the same situation. Varied scenarios come later. It should show development progress, symptoms, known findings, current jobs, credits, and the effect of upgrades without presenting the screen as a dense administration dashboard.

The opening sequence requires nine accumulated healthy minutes: three for the initial backend, then six more for expansion. Actual elapsed duration depends on recovery. This replaces the earlier 15–20-minute target after user playtesting. Play continues beyond the milestone.

## 4. Current Release vs. Future Scenarios

### First playable scope

| Capability | Player outcome | Boundary |
| --- | --- | --- |
| Developing backend | As a player, I want development to add work so that I must adapt | One backend, three development stages; no new repositories yet |
| Scanning | As a player, I want to reveal causes so that I can act on symptoms | One scan type; no specialist or scheduled scans |
| Manual remediation | As a player, I want to choose repairs so that I can protect operation | One reliable repair action per finding; no code puzzle |
| Investment | As a player, I want visible capability improvements so that progress feels useful | Two one-time speed upgrades, five scan-efficiency tiers and capacity purchases up to five slots |
| Continuity | As a player, I want uninterrupted play so that ecosystem growth stays predictable | Page lifetime only; fresh run on reload |
| Feedback | As a player, I want to understand outcomes so that I can improve my next run | Event history, action feedback, and a short results screen |

Stage 1 established the design baseline. Stage 2 implementation and verification evidence is maintained in the checklist and handover. The two-minute introduction retains this scope. Stage 3 adds simulated connected systems, automation and distinct issue families automatically after two healthy minutes; real integrations and hosting remain outside the local game.

### Stage 3 — complete first session

The three-healthy-minute milestone begins expansion automatically. The release milestone requires six additional healthy minutes; actual elapsed time varies, and the ecosystem keeps running throughout and beyond it. Events below follow world time since expansion begins; only the result uses healthy time. These timings and costs are working tuning choices, not playtest conclusions.

| Expansion time | Event |
| --- | --- |
| +00:15 | Forecast the new connections |
| +00:30 | Frontend and Identity join Backend |
| +01:00 | Identity security warning; 45 seconds to prevent escalation |
| +02:00 | Frontend retention obligation; 60 seconds to meet the deadline |
| +03:00 | Shared Identity access drift; 45-second security deadline |
| +04:30 | Forecast the final release |
| +05:00 | Final release adds Backend bug, Identity exposure and Frontend compliance obligation |
| +06:00 healthy time | Record release results without interrupting play |

Each system has its own findings and scans. Direct Scan costs the current efficiency price (initially 5 credits); Repair costs 15 credits. With several available findings, Repair all shows their count and total cost. An affordable click submits all eligible repairs; an unaffordable click opens the choice list without spending. Clicking the system name opens contextual details. The same visible overflow queue applies across all services and up to five concurrent jobs. Scan coverage and job duration are determined when work starts, rather than when it joins the queue.

Local health is floored at 20%. Bugs cost 20 health. Security costs 10 before escalation and 40 afterward. Compliance costs no health before its deadline and 20 after. Warnings and countdowns appear even before scanning, while scans reveal the specific actionable finding. Completing a repair exactly at the deadline prevents escalation. Missing a deadline is counted once; repairing removes continuing damage. Obligations are fictional, with no claim of real certification.

Identity supports both Backend and Frontend. Its total unresolved health impact, capped at 20, is also deducted from each dependent service. Repairing Identity restores that shared effect. Ecosystem health displays the mean of connected service health rounded to one decimal. Healthy income capacity is Backend 2.0 + Frontend 1.6 + Identity 1.2 = 4.8 credits/second; actual income uses the 75% stable base plus 25% health-dependent formula above, with the additional ×0.75 failure multiplier below 80%. Health displays one decimal, but the 80% progress threshold uses the unrounded mean. Ordinary development introduces one bug across the connected systems every 25 seconds after entering expansion (the already scheduled next bug is retained).

**Scan automation:** available from the two-minute expansion, directly on each connected system in the ecosystem. The **Automate scans** button shows its current one-time per-repository price: 210 credits before efficiency discounts, falling to 31.5 at tier 5 (D87). Each additional repository needs its own purchase; there is no global unlock, scope checkbox or on/off switch. Each automatic scan costs the current efficiency price, shares work slots, and preserves a 20-credit reserve. The automatic-scan information button and popup are removed (D81). Purchased cards show **Auto-scans**.

Automated scans only target undiscovered findings and start no sooner than 15 seconds after the previous automatic scan on that system. Scan automation never repairs findings; separately purchased automatic remediation can repair all three kinds (Stage 6). Manual orders and the queue get capacity first; automation never queues a backlog. Each automated system displays its current state: watching, scanning, ready, waiting for credits/capacity, manual work first, or scan cooldown. When no hidden findings remain but known findings are unresolved, scan status shows **Repair findings**, or **Awaiting repairs** when automatic remediation is enabled; separate automatic-repair status shows its progress. Scanning resumes as new findings, credits and capacity become available. The former Automation tab is removed; the side panel retains work slots and queue. Manual repairs still cost 15 credits each.

The final release adds three findings simultaneously. Its security exposure escalates after 45 seconds and its compliance obligation after 60 seconds. The release snapshot reports health and how many of the three release findings were resolved; the intended target is all three resolved and at least 80% health. This target does not add a separate transition gate beyond the healthy-time goal. The optional results snapshot also reports missed deadlines and automatic scans started. Time continues and the snapshot remains unchanged. Stage 4 continues with corporate expansion after this milestone; endless growth beyond 100 repositories remains outside scope.


### Stage 5 — scan efficiency and healthy progress

D65 implements the healthy-time rules above. D66 addresses the reported cash squeeze with a stable income base, a 20-second full-pace backend bug cadence, and five global scan-efficiency investments. Efficiency improves price, not discovery or speed. New manual, grouped and automatic scans all use the current price; prepaid queued scans are not refunded or charged again.

| Tier | Upgrade price | Scan price afterward | New scan automation setup | Scan-only payback |
| --- | --- | --- | --- | --- |
| 1 | 20 credits | 4 credits | 210 credits | 20 |
| 2 | 100 credits | 3 credits | 199.5 credits | 100 |
| 3 | 500 credits | 2 credits | 168 credits | 500 |
| 4 | 2,500 credits | 1 credit | 105 credits | 2,500 |
| 5 | 6,000 credits | 0.25 credits | 31.5 credits | 8,000 |

D87 keeps strongly rising upgrade costs, reduces tier 5 to 6,000 and discounts new automatic-scan setups. Existing setups and prepaid work receive no refund. The investment shows the next scan price and next setup price; desktop also shows scan-only payback, which excludes setup savings. Repair cost remains 15, auto-repair setup 480, speed upgrades 110/130 and capacity 150 per slot. Automatic scans preserve the same 20-credit reserve at every tier.

These are first-pass tuning choices. A paid recovery simulation from 180 seconds of neglect reaches the first healthy-time milestone at 639 elapsed seconds with about 70.8 credits remaining (D79; waiting for first-tier efficiency funds after buying capacity and repair speed). This proves one recoverable strategy, not enjoyable pacing or balanced choices at all scales. At 100 repositories an average-health goal can mask isolated severe failures; corporate healthy uptime does not award autonomy victory.

### Health feedback and timer spacing (D74)

Below the **Ecosystem health** metric, **System failure** and **Goal time held · need 80%** appear whenever unrounded average health falls below 80%. They clear as soon as health recovers to the threshold. The label identifies why healthy-time progress has stopped; income continues at the reduced failure rate, while jobs and development continue. It adds no failure damage. Chapter 1 still requires 120 healthy seconds and can take longer than two elapsed minutes. The 1×/2× speed button sits at the right edge of its timer column, separated from the clock value.

### Stage 7 — company story and next-action guidance

The existing progression now tells a startup story (D71): **The first team → The summit demo → Teams of teams → A growing company → The handover → Full autonomy**. The first chapter describes a database/backend team while designers develop the product. Its short beat changes with the two development releases. The summit investment chapter starts only after two healthy minutes; the company release opens the teams/modules chapter after six further healthy minutes. Chapter 3 completes with at least 25 connected repositories and unrounded average health ≥80%; chapter 4 completes with 100 repositories and the same health requirement (D82). Both conditions must hold in the same simulation tick, after arrivals, new findings and completed repairs. Earned chapter milestones are retained if health later falls. Repository growth continues while a chapter is held; the guide shows the current 25- or 100-repository target, current/required health and Chapter held when the count is reached below 80%. If recovery happens only after reaching 100, both completed growth milestones can be earned together; the existing latest-chapter introduction behavior applies. Only the existing sustained autonomy victory earns the final chapter. Narrative investment is fictional context; it does not grant extra credits.

The guide above the ecosystem presents a brief story beat, a current action and the actual next unlock. D90 replaces the long opening with the approved arcade briefing: SumZero builds and maintains software; the player is its new Recon operator protecting a startup against maintenance costs and compliance threats. One screen presents SCAN → FIX → UPGRADE and the 80% / two-healthy-minute target. Opening roadmap, medal thresholds and investment advice are omitted. D92 also removes the Chapter 1 subtitle and pre-start timer sentence, and uses “We build software and keep it running.” Medal targets remain beside the live timer; Plan investment opens contextual advice after starting. The first undiscovered problem gets a First problem detected cue. Later chapters use a short situation/stakes narrative and current target instead of the roadmap. This fictional assignment draws on [SumZero](https://www.sumzero.eu/) and [Recon](https://www.sumzero.eu/recon), reviewed 2026-10-12; game outcomes do not certify real-world compliance.

A fresh run and explicit debug/restart show the chapter immediately. Naturally earned chapters retain the 2.4-visible-second completion presentation (D83), with full clock and chapter feedback; simulation continues during this interval, and 2× does not shorten it. Other dialogs/hidden pages defer presentation; restart/debug cancels it. When the chapter modal opens, the entire simulation pauses (D91). It stays paused until dismissal, including reopened stories, later debug introductions and the final victory chapter. A visible Game paused note explains this. No reading time is caught up on return. The initial opening waits for Start game and cannot be skipped by Escape; later briefings resume through their action or Escape. Labels remain Start game / Start Next Chapter / Keep playing. Presentation state remains separate from engine progress. Other dialogs do not pause.

Next-action guidance (D72) is observational: it never spends credits or starts jobs. It points to known unsubmitted repairs (deadline then age), otherwise hidden problems needing scans. Named buttons locate systems on the same corporate canvas and open findings where appropriate; automation suggestions focus the repository's controls. It accounts for queued/running work and installed automation. If a suggested action is unaffordable, the story view explains continued income and an estimated wait. Quiet periods offer an investment plan, keeping enough for one scan and repair and explaining speed, capacity and scan savings. This is a suggestion, not a compulsory purchase order. Fully covered autonomy trials point to trial conditions rather than manual interventions that would reset progress.

Stage 7 originally retained cadences, prices and healthy-time goals; D75 subsequently steepens efficiency prices. The pacing review improves purpose, preparation and next-action clarity; it does not yet establish that opening idle gaps or the economy feel enjoyable. Human playtesting remains necessary before adjusting pressure or adding cascading failures. D91 now pauses chapter briefings; saving and paid remediation tiers remain absent. D73 subsequently adds automatic chapter introductions.

### Stage 6 — automatic remediation and full autonomy

User direction, 2026-10-10 (D69/D70): implement automatic remediation and the full-autonomy finish now; **keep paid remediation tiers and finding bundles on hold**.

**Automatic repairs:** the repository action order is manual Scan/Repair, scan automation, then Auto repairs at the bottom (D81/D84). Scan automation and Auto repairs remain vertically stacked at every viewport size, including installed status controls. Automatic repairs unlock with ecosystem expansion. Enable for 480 credits per connected repository using its Auto repairs button, then pay 15 credits for each ordinary individual repair. Separate scan automation starts at 210 credits to set up, reduced by efficiency tiers and uses the efficiency-adjusted scan price. Repair automation only handles known findings, including bugs, security and compliance; it does not replace scans, discount costs or bundle jobs. Existing repair-speed upgrades apply. Each automatic job requires enough money to retain a 20-credit reserve and a free shared slot. Manual orders/queue take priority. Automatic work never builds a queue and never duplicates existing repairs. Scans and repairs alternate when both have eligible work, with known deadlines prioritized, so a backlog cannot indefinitely starve discovery. Status shows Repairing, Needs scan, Watching, Waiting for credits/slot, Manual work first or Ready.

Module/project **Auto-repairs** purchases cover only currently connected, uncovered members at 480 credits each. The displayed total is charged atomically; overlapping purchases never double-charge. Future repository arrivals need their own setup. There are no added automation toggles.

**Full autonomy victory:** all 100 repositories must have both automations. Maintain a consecutive trial for at least 60 game seconds while:

- Average ecosystem health is at least 90%, and every repository is at least 60% healthy.
- No unresolved finding is overdue, at least 35 credits remain available, and no manual scan/repair is running or queued.
- Automatic scans actually start and automatic repairs actually complete during the trial.
- Income earned during the trial covers scan and repair charges incurred during it; setup/upgrade spending is excluded from this operating comparison.

Manual scan/repair submissions or failed operating conditions reset the trial; purchases are allowed. This consecutive trial is distinct from retained healthy-time level progress. A lower per-repository floor permits temporary local defects while preventing a large healthy majority from hiding a critically degraded repository. All thresholds are tuning choices.

The corporate guide shows coverage and trial progress. The Autonomy footer button opens full requirements and the current blocker. Victory changes the guide heading, records a milestone with observed work and net operating income, and leaves the ecosystem running. The final chapter opens its story under D73, while simulation continues. Once earned, the victory snapshot remains even if later conditions deteriorate. Restart/reload clears the run.

**Finish medals (D86):** the final screen shows total elapsed game time to autonomy and an earned Gold (≤25:00), Silver (>25:00 and ≤30:00), or Bronze (>30:00) medal. Every completed run receives a medal. The time includes unhealthy periods and the autonomy trial, but excludes all paused chapter reading (D91), measured from pressing Start game; 2× changes wall-clock pace without halving scored game time. Classification uses the exact victory tick, with the displayed finish rounded up to a second. Freeze both medal and time when victory is earned; continued play cannot change them. Replace the completed chapter roadmap with the medal/result and a Keep playing action; make the result available again through Victory and milestones. Later-level debug jumps label the award as a practice preview including coached time; fresh starts are eligible. No save history or leaderboard is added.

D87 rechecked the 20 prior engine policies and investment-saving variants, then validated the new tier-5 route across five seeds at one- and five-second decision intervals. Fastest tested finish: 20:49.5; fresh paid browser completion: 20:51.5. Retained Gold/Silver cutoffs leave about 20%/44% room; these are design margins, not human performance percentiles. See [medal playtest](MEDAL_PLAYTEST.md) for current strategy, limitations and reproduction. Recalibrate when prices, growth, income or trial rules change.

The additional **Autonomy trial** debug checkpoint uses normal income to buy the necessary coverage and lets automation recover the company. It does not inject free money or health. Paid remediation tiers/bundles (D52) and recursive failures remain deferred. Story is implemented under Stage 7.

### Story feedback and verification boundary

Recorded 2026-10-09 from Erland's first-round playtest; implemented under D71/D72 on 2026-10-10. The player reported boredom between scans and little emotional connection to an abstract backend. The approved startup concept supplies context and goals, while next-action guidance supports preparation during quiet moments. Chapters, triggers and presentation are described under Stage 7 above. Whether these changes improve enjoyment remains a human-playtest question. Story chapters are distinct from the project's build stages.

### Stage 4 — corporate ecosystem expansion

User clarification, 2026-10-10 (D56): ecosystem expansion takes priority over remediation/endgame. Grow toward a corporate scale of **100 repositories**, organized into **3–5 repositories per module** and **3–5 modules per project**, with varied sizes. This resolves the hierarchy from D47 as project → module → repository, without an additional application layer.

Each fresh run chooses a seed and partitions exactly 100 repositories into valid groups at both levels. Groups keep stable membership as their repositories connect; partial groups display connected/total counts while filling. There are no undersized completed groups or leftover unassigned repositories. Engine tests use fixed seeds to reproduce a run; reload/restart picks a fresh layout. The seed is in memory only.

**Growth (working tuning choice):** healthy-time goals govern entry into expansion and the release milestone (D65). After the actual release milestone, one repository connects every six world seconds; the first arrives six seconds later and repository 100 arrives 582 seconds later. At the cap, development and maintenance continue. New repositories start with a discoverable bug and contribute individual income/health. Ongoing bug cadence scales from 25 seconds toward 2.5 seconds as the company grows; existing scheduled arrivals are retained. All progression respects the selected 1×/2× speed and open-page-only time.

**Navigation (D63):** corporate growth uses one connected ecosystem canvas with fixed positions for the seeded organization. Zooming out emphasises project/module labels; zooming in reveals repository health and findings. Full direct scan/repair/automation cards appear at 100% zoom and above, with narrower cards and vertically stacked automation controls to avoid overlapping neighbors (D84). Group orbits and dependency lines preserve spatial context. Click a project/module or a focus breadcrumb to frame it on the same map. Click a compact repository node or use **Find repo…** to focus its actions. Two-finger trackpad scrolling pans; pinch zooms around the pointer. Drag blank space to pan; repositories cannot be dragged or rearranged. **Fit all** restores an overview of connected repositories. Zoom buttons and focused-canvas arrow keys, +/− and Home provide keyboard alternatives; touch supports pan/pinch. New repositories keep their predetermined positions without forcibly moving the camera. When a project is framed on a short screen, module labels can shift slightly with leader lines to their fixed anchors so labels remain clickable. Work slots and queue remain available. This replaces the paginated group-card interface. Large credit totals retain the compact k display.

**Group actions:** a selected module/project offers Scan, Repair and Auto-scans with eligible-action counts and total prices. Scans target repositories with undiscovered findings and no scan already running/queued (current efficiency price each). Repairs submit available known findings as ordinary individual repairs (15 credits each), prioritizing deadlines then age. These are bulk manual orders, not the deferred paid finding bundles or automatic remediation. Each job uses the shared five-slot maximum and normal FIFO overflow queue; charges occur once when submitted. If funds cannot cover the displayed group total, the entire action is rejected without partial purchases.

Group scan automation uses the current efficiency-adjusted setup price per uncovered connected repository; purchased repositories are excluded from overlapping module/project purchases. It still only scans, preserving the 20-credit reserve and manual-queue priority. Newly connected repositories need their own purchase, either individually or through an updated group action. Scope coverage is never a free subscription to future members.

**Dependencies:** keep the existing shared Identity relationship. New repositories depend on their module's first repository; a new module's first repository depends on the first repository in its project's first module. Only connected dependencies apply. Local finding damage in direct dependencies contributes a shared penalty capped at 20 points. The local 20% health floor and aggregate income model remain. This is a bounded direct effect, not the future cascading-failure mechanic (D50).

Prices, six-second growth, issue cadence and the resulting economy are working choices. Functional tests do not establish enjoyable pacing or balanced late-game investment. Lore, paid remediation tiers/bundles and cascading failures remain deferred. Automatic remediation and victory are covered by Stage 6.

### Debug starting points

For testing (D60/D67), click the Recon logo three times within two seconds. The selector opens immediately; a **Debug** footer button then provides access at any time. Choose Starting backend, Growing backend, Full-pace backend, Ecosystem expansion, Connected systems, Release challenge, Corporate expansion, 100-repository company, or Autonomy trial. These are named gameplay checkpoints, distinct from build stages.

Each selection replaces the run with deterministic coached play until that checkpoint: normal income pays for scans, repairs and investments, maintaining enough health to earn transitions. The 100-repository company checkpoint also earns the healthy chapter-5 milestone. Fixed elapsed timestamps would be misleading under healthy-time goals. No free health or credits are injected. Keep the organization seed and selected speed, discard old jobs/queue/UI context and introduce later checkpoints with a paused chapter briefing; closing it resumes play. Starting backend waits for Start game. Coached jobs may still be in flight. Opening the selector does not pause play. Debug access persists through restart and can be exited explicitly; reload starts with debug hidden. The logo is keyboard accessible.

### Future feature note — cascading repository failures

Recorded 2026-10-09 from the user's proposal. **For later implementation; not implemented or scheduled.** If repositories remain unscanned or findings remain unfixed for too long, failures should grow from a local problem into an ecosystem-wide threat:

1. The neglected repository begins failing on its own.
2. After further neglect, repositories that depend on it begin failing too.
3. Failures spread onward through those repositories' dependants, like a virus, until the underlying matters are resolved.

The intent is mounting, visible consequences for neglect and a reason to prioritise dependencies. This extends beyond the current fixed Identity health penalty: recursive, time-based propagation is not present today.

Working interpretation to preserve the discovery mechanic: unscanned problems can worsen unnoticed; scanning reveals the cause but does not repair it or reset its age. Whether scan staleness itself should trigger escalation remains a design question. Define warning periods, failure thresholds, propagation delays, handling of dependency cycles, and recovery before implementation. In particular, decide whether fixing the source restores downstream repositories automatically or leaves secondary repairs. Reconcile repository failure with the current 20% health floor and stable income base and preserve a recoverable path. Any timers follow open-page progression and the selected game speed.

### Later scenarios

Expansion beyond 100 repositories, prevention investments, configurable automation policies, incident isolation, specialist remediation and varied repeatable scenarios. Corporate portfolio grouping is implemented in Stage 4. Expansion should stay visible through new systems even when individual repositories are aggregated.

Accounts, multiplayer, leaderboards, monetisation, real repository scanning, offline earnings, prestige resets, and a literal infinite number of rendered nodes are outside the first release scope. They are not prerequisites for demonstrating the core idea.

## 5. Key Dependencies

- **Playtesting:** initial user feedback reports boredom during idle gaps and little attachment to the backend; see the story feedback above. Broader enjoyment, upgrade comprehension and the effect of narrative remain unverified.
- **Product wording:** verify any claims about actual Recon capabilities before public presentation. The local platform README describes product intent, not proof of every deployed capability.
- **Browser delivery:** select and verify hosting when a tested build exists. Hosting is not needed to establish Stage 1.
- **Balance:** the prototype must test pressure, recovery, and competing purchases. Do not treat the initial numbers as an approved final economy.
- **Continuity:** keep these companion records current at milestone boundaries. The handover must report actual implemented and tested state, with a concrete next action.

Source basis: Erland's Recon Game concept and request to start the first stage; the build plan in this conversation; the local [Recon platform overview](../nx_sumzero_recon/README.md) and the original Recon workspace stack. The game now has its own project folder and does not inherit the platform application or its Nx configuration. No external product research or live Recon verification was performed for this brief.

### D87 finishing feedback

The timer shows the current medal target beside elapsed time; opening rules omit medal details to keep the first assignment short (D90). Chapter 5 shows repositories with both automations, a continuous 0–60s trial bar and the current blocker. Interrupting a running trial records its cause, announces it for 12 game seconds and retains it in the operation log. Brief repair/automation border feedback lasts 900 ms, with static feedback under reduced motion. Optional chapter-completion sound defaults off, is enabled deliberately in the footer and has no persistence. Completion audio plays once when the existing completion presentation becomes visible, never as repeated progress audio.

Recalibration and limitations: MEDAL_PLAYTEST.md. Unassisted human sessions remain pending in HUMAN_PLAYTEST.md.

### Public delivery (D88)

The game is published at [erlandvr.github.io/recon-game](https://erlandvr.github.io/recon-game/) with source at [erlandvr/recon-game](https://github.com/erlandvr/recon-game). GitHub Actions tests and builds main before deploying the static site. First deployment and live gameplay were verified on 2026-10-10. Current fixed-order problem distribution is deliberately unchanged following the user review.
