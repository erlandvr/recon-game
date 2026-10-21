# V3 — slices, progress and feedback

Agreed with the owner: 2026-10-20.

**Owner closeout — 2026-10-21 (D193):** the current onboarding and visual polish are accepted, including the final whole-ecosystem intro. The owner authorized committing, merging to main and pushing main to GitHub and Bitbucket. All 172 local tests and the production build pass; targeted browser checks cover intro, gameplay, hidden/restart holds, reduced motion, coffee/champagne and replay. Unassisted newcomer testing remains pending. Publication and deployment are separate checks; historical Ready for review notes below describe earlier delivery stages.

This is the delivery tracker for [V3_MODE.md](V3_MODE.md). The specification defines the game; this file defines what to build next and where feedback belongs. The four versions below are the four delivery slices. Each produces a playable result for review.

## Required documentation contract

**A slice description is not a standalone implementation specification. Do not implement from this tracker alone.**

Before starting or resuming any slice:

1. Read the complete current [V3 specification](V3_MODE.md), the [V3 decision register](DECISIONS.md#v3-current-decisions), the [handover](HANDOVER.md#v3--current-status), and this tracker including assigned feedback. Follow the slice-specific references below for detailed requirements and evidence.
2. Inspect the existing implementation and relevant checks. Distinguish agreed requirements, current implementation, provisional tuning and historical evidence. The old sandbox and older Speed/Long rules do not override V3 requirements.
3. Map the work to the referenced specification sections and decision IDs. Identify which requirements this slice delivers, which earlier behaviours it preserves, and which presentation details are intentionally staged for later slices. A requirement omitted from the slice summary is not permission to ignore it.
4. Resolve inconsistencies before implementing the affected behaviour. The latest explicit owner instruction takes precedence; reconcile it into the canonical specification and decision register. Otherwise, use the specification for behaviour and this tracker for delivery order. If sources conflict and the intended behaviour cannot be established, ask about that specific conflict while continuing unaffected work. Do not silently choose whichever source is easiest or rewrite requirements to justify an implementation defect.

During implementation and feedback processing:

- Keep changed requirements in `V3_MODE.md` and their decision references in `DECISIONS.md` aligned in the same work cycle. Record implementation choices and tested tuning as such; do not promote an experiment into an agreed rule.
- Give each deferred feedback item a requirement reference as well as a target slice. Accepted future behaviour remains explicitly pending until implemented. If feedback changes several slices, update all affected references and assignments.
- When code differs from an agreed requirement, fix the code or explicitly record the unresolved deviation. Documentation must distinguish intended behaviour from delivered behaviour rather than pretend they match.

Before marking a slice **Ready for review** or **Complete**, perform a documentation-to-implementation check. Add a concise delivery record beneath that slice containing:

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| Specification section and decision ID where available | Relevant source files and what the player can do or see | Test, browser observation or human feedback; identify checks not performed | Delivered, pending later slice, or unresolved deviation |

Cover all requirements delivered or changed by the slice and any inherited rules it affects. Link evidence rather than copying the full specification. Update the specification where authorised decisions changed, the progress table/backlog, and the handover. A slice is not review-ready while its documentation contradicts the implementation without an explicit recorded limitation. Moving on does not erase unresolved work; retain its assigned status.

## Current position

**Current slice: V3.4 — Complete event experience · Ready for review.**

V3.1 is implemented and verified locally on `codex/v3`. The owner accepted candidate B and requested V3.2 on 2026-10-20. V3.1 is complete; V3.2 now delivers the workshop artwork and Recon feedback, verified locally. The owner accepted V3.2 and asked to start V3.3. V3.3 is now implemented and verified locally, including P1 feedback V3-F005 and the approved shared feature trial V3-F006. The owner accepted this work by requesting the next slice. V3.4 now addresses the crowded Recon layout and simplifies the opening (D164), and makes features yield to builds/repairs and finish at the desk (D165). Existing sandbox experiments and the spatial study remain historical inputs. No merge or deployment was performed.

| Slice | Status | Evidence / outstanding work |
| --- | --- | --- |
| V3.1 — Playable MVP | Complete | Candidate B: 121 tests, build, four paid browser routes, both handoffs and negative-balance recovery pass; [current evidence](docs/analysis/v3-maintenance-review.md). V3-F004 accepted when the owner requested V3.2. |
| V3.2 — The living workshop | Complete | Central radar and labelled repair bays, workshop props and character/coin performance; 121 tests, build, full V3 browser suite and focused four-size workshop checks pass. [Evidence](docs/analysis/v3-workshop-review.md). |
| V3.3 — Understandable without explanation | Complete | Themed countdown, contextual hints, help, local recap and frozen-result celebration. Shared feature backlog and P1 feedback added to the journey. See [feature evidence](docs/analysis/v3-features-review.md) for the original checks and [journey evidence](docs/analysis/v3-journey-review.md) for the initial delivery. |
| V3.4 — Complete event experience | Ready for review | Desk features with immediate build/repair priority, explanation-only opening, natural islands and Recon clearance; [desk-feature review](docs/analysis/v3-desk-features-review.md) and [event review](docs/analysis/v3-event-review.md). Human visitor validation remains pending. |

## Owner assessment log — V3.4: Simple, Lovable and Complete

**Recorded 2026-10-21 · Recon — Active Animation · V3.4 · `codex/v3` · D177.** This assessment refers to the current experience through D176, including the build/hire counters, restart-only toolbar, restored 180/260 automation prices and 32/24 maintenance intervals.

The owner describes the current result as **“Simple, Lovable and Complete.”** The shared assessment is:

- **Simple:** one experience, four clear purchase actions, visible system/developer capacity and a minimal toolbar. Visitors can start and understand their available choices without navigating modes or settings.
- **Lovable:** the animated workers give the experience personality. Building, travelling, responding to failures and returning to productive work make Recon's benefit visible and enjoyable to watch.
- **Complete:** the experience has an introduction, meaningful choices, progression, a clear finish and replay. It tells a complete story for its intended role within the event.

**Event context:** visitors will already be introduced to Recon and SumZero. Active Animation is one part of a larger event offering; it does not need to explain the entire product or company independently. Its central takeaway is: **when Recon handles maintenance, developers have more time to build.** The animation reinforces the surrounding introduction by making that benefit tangible.

The agreed direction is to preserve this focused scope and use an event rehearsal to check that introduced visitors can start independently, enjoy a short run and connect the workshop behaviour to Recon. Additions are not needed merely to make the experience feel more complete; further changes should respond to observed confusion or event needs.

This records the owner's qualitative assessment and the discussion of event fit. It does not record completed visitor testing, Safari validation, a merge or deployment; those remain separately tracked.

## Owner assessment log — V3.4: Game design goal achieved

**Recorded 2026-10-21 · Recon — Active Animation · V3.4 · `codex/guided-first-play` · D178–D179 / V3-F021.** The owner reviewed the local preview and accepted this game-design pass.

The owner is happy with the combined effect of the small changes: the feature backlog appears later, the screen feels better organised and makes better use of space, and the highlights have better timing and remain visible longer. The experience feels more fluent. The existing subtle guidance is accepted; floating explanation cards are not requested.

What changed:

- A shorter opening leads into one complete first build: purchase, assembly, delivery, installation and income, with one relevant highlight at a time.
- Hiring, maintenance, the first actual Recon repair and Plus are explained when the corresponding situation occurs. The game continues and purchase choices remain free.
- The feature backlog and feature work start four active seconds after the first purchased system is installed. Muted blue-grey colours reduce their visual prominence.
- Purchase confirmations have a reserved line inside their cards, clear of developer status. Secondary information is quieter, and guidance can be dismissed or hidden.

The owner also accepted the slower saving-only route caused by delayed feature availability: a player who never buys a system never unlocks feature bonuses. The benchmark median moves from about six to thirteen minutes on that route; the balanced route remains about 2:25. No compensating balance change was requested.

**Outcome: game design goal achieved for this pass.** This is acceptance by an owner already familiar with the game. It does not establish that an unassisted newcomer understands every mechanic. Peer feedback collection remains open; no merge or deployment is recorded by this assessment.

### Guided first play delivery record

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D178; opening and first build | Short opening; guidance follows actual assembly, carrying, installation and income in `V3Game.tsx`, `v3Guidance.ts`, `V3Guidance.tsx` and `V3Board.tsx`. | Guidance unit tests and paid onboarding/browser journey checks. | Delivered; owner accepted. |
| D178; contextual choices and receipts | Queue-based hiring, actual maintenance/Recon handoff, repair-bottleneck Plus advice, independent purchase receipts and dismiss/hide/reset. | Guidance, hiring, upgrade, onboarding and full paid gameplay browser checks. | Delivered; owner accepted. |
| D178; delayed, quieter features | Engine release four active seconds after first purchased installation; hidden column/counters beforehand; muted cards and carried parts. | Feature/guidance tests, paid feature/onboarding browser checks, four desktop sizes and benchmark. | Delivered; saving-route change accepted. |
| D178; continuity and balance | Free strategies, existing prices/wages/failure rules, frozen result and replay retained. | Full unit suite 169/169; V3 suite 62/62 after final hint ordering; build; event, layout and journey browser checks. Benchmark: 80/80 paid routes and 9/9 delayed starts finish, plus 20 capacity fixtures. | Verified locally; unassisted visitor testing remains pending. |

### Worker polish and finish copy — D180–D181

Follow-up refinements on `codex/guided-first-play`, after the D179 design acceptance. The owner requested visible steps and facial expressions, accepted clearer celebration feet/tools, and asked for a finish title appropriate to the time achieved.

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D180; readable walking and expressions | `V3Board.tsx` draws separate legs and boots, focused work faces, concerned repair faces and happy celebration faces. D182 also smiles during feature work and for two active seconds after that developer completes a feature, unless responding to a repair. CSS offsets the leg cycles and gives the torso a smaller bob under load. | Paid delivery/repair browser check, opposite stride frames, restart hold, hidden-tab hold and live reduced-motion checks in `test-results/v3-worker-polish/`. | Ready for owner visual review. |
| D180; celebration silhouette | Tools lie clear of feet; a gentle raised-arm bounce replaces the large rocking jump in both the workshop and results crew. | Paid victory during a carried build, four-size result screenshots, frozen result, reduced motion and replay checks in `test-results/v3-journey/`. | Verified locally; routes and economy unchanged. |
| D181; meaningful finish title | `V3Game.tsx` uses the frozen finish time: strictly below 180 seconds gets “Peak productivity reached!”; all other wins get “You built a healthy company!”. | Current benchmark supports the trial boundary: balanced 144.2–149s, fastest sampled non-automation route 188.95s. Paid 144.35s balanced browser run shows the peak title; 205.55s/232.05s no-Recon runs, a 313.50s Plus run and the 252.70s carried-build journey show the healthy-company title. All retain their exact engine results and replay. | Time-based trial; no extra win condition or medal system. |

### Coffee welcome and smoother movement — D182–D188

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D182; happy feature work | Smile during active feature collection/assembly and for two active seconds after the developer completes a feature. Repair concern takes precedence. | Paid feature completion and repair checks, pause-held smile and expiry into ordinary building; `test-results/v3-worker-polish/feature-results.json`. | Delivered; no simulation changes. |
| D183/D187; coffee welcome | `v3Coffee.ts` derives the visit from purchase history; `V3Coffee.tsx` draws the waiter, tray, serving arm/cup movement and permanent desk cups. Visits the team present at purchase, bottom desk first; later hires queue individual one-cup visits after the current round. Earlier cups remain. | Three sequence tests; `tests/v3-coffee-browser.ts` verifies paid trigger, unchanged engine time/cash, two/four desks, later hires/Plus, hidden/restart holds, reduced motion and replay. Screenshots in `test-results/v3-coffee/`. | Ready for owner review. |
| D184; smooth travel | CSS interpolates developer/waiter transforms over the existing 50ms update interval. Explicit cancellation settles pause, hidden, reduced-motion and frozen scenes. | Live browser sample: 27 visible position changes against 11 simulation changes across 40 frames, including 26 intermediate frames. Pause and reduced-motion checks pass; `test-results/v3-motion/results.json`. | Owner accepts the calmer motion and improved face readability. |
| D185–D186; developer hair and mixed crew | Replace green caps with short, side-parted brown hair; second/fourth developers use the female variant with tied-back hair. Retain facial expressions, proportions and consistent appearances during celebration. | Production build and rendered character inspection. | Ready for owner review. |
| D188; Recon-only champagne | `V3Champagne.tsx` shares the separate victory clock through `V3Presentation.tsx`. Waiter enters beside the crew, pops the cork and settles; no-Recon wins keep only the developer party. | Four full paid browser routes verify both branches, two/four-developer result layouts, cork/spray, hidden hold, reduced motion, frozen results and replay. Screenshots: `test-results/v3-mvp/*-champagne.png`. | Ready for owner review. |

The latest build and all 65 V3 unit tests pass. The waiter is decorative and never enters developer counts, queues or accounting. These follow-up checks supplement the earlier paid full-game and frozen-result checks; no additional economy changes were made.

### Waiting welcome and simple location pointers — D190–D192 (replaces D189)

The owner rejected the four-stop banner tour: too many controls, slow text and weak accents. D190 replaces it with three location-only labels. D192 expands the first outline to the entire ecosystem, changes its label to Your ecosystem and holds it for three seconds; the other two labels remain two seconds each. D191 adds a visitor-triggered welcome modal: a large gold Get your intro button starts the seven-second sequence and automatically continues through the three-second countdown. `V3Orientation.tsx` now supplies the short sequence and stronger SVG spotlights; `V3Game.tsx` provides the welcome modal and automatic countdown; `V3Board.tsx` anchors labels beside their targets. The header banner, navigation, mechanics copy and Recon stop are removed. Existing gameplay and in-run guidance are preserved.

| Requirement | Evidence | Status |
| --- | --- | --- |
| Three exact location labels; strong focus; no banner or navigation | `tests/v3-orientation-browser.ts`; systems, developers and controls inspected at four desktop/laptop sizes. Stable workshop dimensions, nearby labels, dimmed surroundings and one shared purchase pulse. | Implemented. |
| Waiting welcome, one click, automatic intro/countdown, no gameplay before GO | Browser checks verify a minute of idle welcome, unchanged 90-credit balance/time, disabled purchases, hidden features, all three pointer timings and exact automatic countdown/GO boundary. No second Start control. | Verified. |
| Hidden/restart hold, reduced motion, fresh replay | Browser checks verify held sequence, static reduced-motion highlight, restart held during the final pointer, refresh/fresh-run welcome reset and first-build guidance after start. | Verified. |
| Existing first-play flow | Build and all 65 V3 tests pass; event-opening and onboarding browser journeys verify the existing flow. The full paid journey finishes at 252.70s with exact frozen results and returns to the welcome on Play again. | Ready for owner review; newcomer comprehension remains unverified. |

## How to work slice by slice

1. When the owner asks to **start the next slice**, follow the required documentation contract above. Use the earliest unfinished slice in the order above. Resume an in-progress slice rather than starting a later one. State the selected slice and its scope, then begin without asking the owner to repeat the plan.
2. Include open backlog items assigned to that slice. Preserve the accepted game rules and earlier working slices. Do not implement later slices merely because their ideas are already documented.
3. Build and verify the slice, then provide a playable review point and a concise account of what changed, what was tested and what remains uncertain. Update the tracker, relevant backlog entries and handover before ending the turn.
4. Work one slice at a time. After delivering a reviewable slice, wait for feedback or the instruction to move on. A request to start the next slice after delivery is sufficient direction to advance; no separate approval ceremony is needed. If a known blocker prevents progression, explain it and address the affected work rather than silently skipping it.
5. Use statuses **Not started**, **In progress**, **Ready for review**, **Complete**, or **Blocked**. Ready for review means the implementation and required checks are delivered, with any unperformed human validation clearly identified. Complete means the owner accepts the slice or asks to advance, and no known blocking work remains. Record unresolved non-blocking feedback in its assigned slice.
6. Keep “Next slice” and the status table consistent. Once V3.4 is complete, report that the planned slices are complete rather than inventing another one. Optional additions require an explicit scope decision.

“Locked documentation” means a shared starting baseline, not a prohibition on processing new owner feedback. Maintain the final current rule in the specification when feedback changes behaviour; do not accumulate contradictory alternatives.

## Slice scope and review criteria

### V3.1 — Playable MVP

**Required references:** [purpose and cash goal](V3_MODE.md#purpose-and-player-goal), [agreed game rules](V3_MODE.md#agreed-game-rules), [inherited interface behaviour](V3_MODE.md#interface-behaviour-carried-from-speed), [workplace and movement](V3_MODE.md#ecosystem-workplace-and-movement), [animation state/timing constraints](V3_MODE.md#animation-guide), [candidate tuning](V3_MODE.md#prototype-tuning-candidate), [remaining choices](V3_MODE.md#remaining-choices-and-working-recommendations), and [validation plan](V3_MODE.md#next-validation-pass). Decision coverage: D133–D145 and D149 for mechanics, D146/D150 for basic visual movement, and D153 for start/result semantics. Consult the [historical sandbox guide](experiments/v3/README.md) before reusing its code; its rules require alignment.

Build the V3 entry tile and a complete run: developers, systems, Recon and Plus purchases; wages and operating income; bounded ageing and local failures; construction and maintenance in arrival order; immediate Recon takeover with retained repair progress; cash-target-only victory.

Use a simple cluster board and basic original worker shapes. Movement is part of the MVP: show assembly, delivery, installation, repair travel and return, with their actual simulation durations. Show the developer leaving maintenance when Recon takes over. Elaborate art and choreography can follow, but travel cannot be replaced by an instantaneous action that changes the economics.

Include visible prices/wages and affordability states, cash/target, earnings and time, start/countdown, pause & plan, frozen results and restart. Provide basic accessible controls and reduced-motion readability from the outset.

**Review criteria:** a complete run works; maintenance visibly consumes developer capacity; Recon frees it; handoffs and queue ownership behave correctly. Compare saving, hiring, expansion and automation strategies, including no-Recon wins. Begin tuning towards two–three minutes and check maximum-age Plus capacity with burst headroom. Record actual results and balance gaps rather than claiming the candidate numbers are validated.

#### Owner playtest feedback — 2026-10-20

The owner enjoys watching the workers run around. Their supplied result shows **2:13.70**, 12 installed systems, three developers hired (four total), and Recon Plus. This is one owner playtest, not representative novice validation. The result image does not establish purchase timing or a causal explanation of the finish.

Recon felt visually underwhelming and its small progress bars were not immediately understood as processing slots. Those reinforce the already planned V3.2 centrepiece work (V3-F002–003). Developer-only pain felt too mild; compare tuning in V3.1 (V3-F004) before considering it accepted. Proposed experiments target maintenance demand during growth, holding wages and movement timings initially; keep cash-only victory, legal no-Recon strategies and bounded Plus capacity. The owner subsequently asked to implement more frequent maintenance; D158 and the update below record candidate B. Other visual feedback remains assigned to V3.2.

#### V3.1 delivery record — 2026-10-20

Playable from the V3 entry tile. See the [review record](docs/analysis/v3-mvp-review.md) for implementation choices, actual route durations, strategy comparisons, mature-load assumptions, screenshots and remaining validation. This initial delivery used candidate A, preserved in [v3-mvp-benchmark-a.json](docs/analysis/v3-mvp-benchmark-a.json); current candidate B is recorded in the maintenance update below; the old sandbox results are not used to certify this slice.

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| Purpose and player goal; D135–D138 | `GameEntry.tsx`, `V3Game.tsx`, `v3Game.ts`: V3 tile, four paid actions, 1,200 spendable-cash target, no system-count/automation/health gate. | Paid strategy benchmark: 80 runs and nine delayed starts. Browser: mixed route 2:02.50, hire-only 2:32.70, four-system/no-Recon 3:10.95, four-developer route 3:42.70. | Delivered; strongest routes meet the pacing ambition. Slower strategies and enjoyment remain balance/human-review questions. |
| Agreed game rules; D133–D136, D139, D144 | Shared FIFO queue, one developer per build, parallel jobs, wages during all phases, no interrupt/cancel/refund. Recon skips builds and exclusively owns one/three oldest repairs. | `tests/v3.test.ts`: FIFO in both directions, active-construction protection, caps/prices, parallelism, ownership under load. | Delivered. |
| Workbench and movement; D143, D145–D146, D149–D150 | `v3World.ts`, `V3Board.tsx`: stable connected positions, right benches, assembly, oversized back-carry, measured travel, installation and occupied return. Income begins on installation completion. | Engine path/timing/income/return checks; paid concurrent-carry screenshots; 1024×768, 1280×720, 1440×900 and 1920×1080 layouts inspected. | Basic movement delivered. Detailed character/prop art and busy-route choreography remain V3.2. Walks actually span 1.67–7.56s (median 4.39), preserving fixed speed. |
| Recon selection/takeover and animation timing; D134, D141, D144 | Takes developer-owned travel/repair jobs immediately; developer returns from the same position, repair fraction retained. No walking progress or artificial repair delay. | Engine tests for both phases and remaining duration; separate paid browser outward/mid-repair takeover checks and screenshots. | Delivered. Expressive full character turnaround remains V3.2; MVP uses direction change and a brief turn cue. |
| Income/failure/ageing/cap; D137, D140, D142, D148 | Broken system earns zero, keeps position and dim links, opens panel; other systems keep earning. Age begins on install, survives repair and plateaus in demand. | Engine local-failure/income/age tests; 20 maximum-age capacity/burst fixtures without developers. Plus uptime 90.29–91.02%; opening 12-failure burst clears by 16.25s. | Delivered with explicit candidate hazard/variation assumptions. Capacity evidence does not certify spectator comprehension. |
| Interface carried from Speed; D153 | `V3Game.tsx`, optional props in `StartCountdown.tsx`: single GO boundary, hidden hold, pause-and-buy, fractional active time, truthful HUD, frozen result/retry, preserved manual camera and Fit. | Production-bundle browser checks, exact engine/UI cash and time, keyboard GO focus, reduced motion, viewport fit; inherited Speed opening regression passes. | Delivered for MVP; full themed countdown, contextual hints, detailed recap and party remain V3.3. |
| Cash shortage; D156 | Visible negative cash; wages and work continue. Purchases require sufficient balance. | Owner approved after the late-spending finding; engine regression, browser display/recovery check and benchmark record ordinary recovery from −3.91. | Delivered; no bankruptcy mechanic. |
| Supply shelf, radar and gold cue; D147, D151–D152 | Four labelled/priced controls, clear disabled reasons, central Recon placeholder and real one/three-slot progress. | Purchase/browser checks; rendered compact controls inspected. No fictional income bonus or scan action. | Interaction basics delivered. Shelf props, radar sweep/blips, coin toss and detailed processing scenes explicitly pending V3.2. |
| Player journey and validation; D153–D155 | Local frozen result/replay, aligned spec/decisions/handover and this traceability record. | 120 tests and `/recon-game/` build pass. No backend requests during V3 browser play. | Ready for review. Human/spectator testing pending; attract/demo and final event polish V3.4. Public V3 ranking remains optional. |

#### V3.1 maintenance update — D158 / V3-F004

The owner requested implementation after the initial playtest. The [four-candidate comparison](docs/analysis/v3-maintenance-review.md) selects **36s young / 26s mature operating intervals**, replacing 60/40s. Opening failure stays at 22s; the age plateau, variation, movement, economy, repair speeds, FIFO and retained-progress takeovers keep their rules.

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| Purpose, ageing and developer pressure; D133, D136, D140, D158 | `v3Game.ts` increases young/mature demand. In the seed-31 mixed route, three failures precede Recon at 59s (previously one at 56s), with two repairs outstanding. | `v3-maintenance-comparison.json`: 320 paid runs across four candidates. Hiring-only median maintenance travel/repair rises 72.43 → 131.40 developer-seconds; median finish 2:34 → 3:01.38. | Accepted by the owner when advancing to V3.2. Broader human pressure/readability/enjoyment testing remains pending. |
| Cash-only/no-Recon victory and bounded Plus capacity; D137–D138, D156, D158 | All original purchase/goal/recovery rules retained. More frequent failures give automation a larger payoff. | Current B benchmark: all 80 paid routes and nine delayed starts win. Mixed median 2:10.05. Plus mature uptime 85.38–86.41%; five initial all-system bursts clear by 16.25s, with nominal 0.462 jobs/s demand versus 0.75 capacity. | Delivered simulation evidence. Some slow strategies exceed event pacing; hiring four early can reach −13.32 before normal recovery. |
| Interface and handoffs preserved; D134, D139, D141, D153 | Same visible movement and dispatch, paused buying, result freeze and retry. | 121 tests/build pass. Four paid browser runs match: 2:09.75 mixed (four takeovers), 2:59.75 hire-only, 4:51.25 small-estate/no-Recon, 4:16.35 four-developer. Both takeover phases, pause/freeze/retry, desktop fit and negative-cash recovery pass. | Complete; owner accepted and advanced to V3.2. |

### V3.2 — The living workshop

**Required references:** [ecosystem and routes](V3_MODE.md#ecosystem-workplace-and-movement), [Recon centrepiece](V3_MODE.md#recon-visual-centrepiece), [purchase shelf](V3_MODE.md#purchase-shelf), [animation guide](V3_MODE.md#animation-guide), [timing candidates](V3_MODE.md#prototype-tuning-candidate), and [layout feasibility limits](V3_MODE.md#layout-feasibility-study), including the linked [layout review](docs/analysis/v3-layout-review.md). Decision coverage: D133–D134 and D145–D152. Preserve all V3.1 mechanics, particularly D141 retained progress and D143 income on installation. The earlier schematic layout is evidence to revisit, not final approved art.

Build on V3.1 with the visual identity: personal workbenches, cube assembly, oversized back-carry, installation, gold-piece toss, open repair panels and expressive turn-arounds. Add the central radar with one/three active processing positions, workshop purchase shelf and growing cluster composition.

**Review criteria:** the visuals communicate construction, lost capacity and Recon's benefit. Routes and concurrent events remain readable at laptop and desktop sizes. Validate actual animation durations against the economy. Record spectator observations separately from technical checks; screen fit alone does not prove comprehension.

#### V3.2 delivery record — 2026-10-20

See [workshop review](docs/analysis/v3-workshop-review.md) for implementation choices, reproduction and limitations. V3-F002–003 were accepted by the owner when requesting V3.3; technical checks do not establish unassisted comprehension.

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| Recon centrepiece and animation; D134, D141, D151, D157, D159 | `V3Recon.tsx`: central chunky radar, live issue blips, three numbered repair bays. Actual system names/progress, explicit ready/locked/offline states, moving job tokens and returning completion checks. Jobs keep their bay; one/three slots follow the engine. | Focused paid base/Plus run checks ownership, exact percentages, stable assignment, real completion cues, pause freeze and static reduced-motion radar. Outward/mid-repair handoff regressions also pass. | Delivered. Owner impression and uncoached comprehension remain to review. |
| Personal workbench, assembly, delivery and installation; D133, D145–D146, D149–D150 | `V3Board.tsx`: numbered benches and tools, six progressive cubes, original mechanics, 2.5× nominal-height back-carry, lift/lower inside existing phases, recruitment greeting and expressive turn. Reserved destinations show outlines; connected clusters remain stable. | Paid concurrent-carry screenshots and exact model/UI times. Final bench-label bounds pass at 1024×768, 1280×720, 1440×900 and 1920×1080. Engine phase/path/ownership tests pass. | Delivered. Travellers are drawn in front of Recon and may briefly overlap bay edges; physical event-display readability still needs observation. |
| Local failure and repair; D142, D148 | Failed machines stay anchored with an open panel and dim links; developer tools stop immediately on takeover. Operating light and income resume only from actual completion. | Full paid browser routes and local income/ownership engine tests; base/Plus repair screenshots inspected. | Delivered; no cascade or hidden delay added. |
| Gold-piece income cue; D143, D147 | `V3WorkshopProps.tsx`: installation-only coin release towards actual net earnings; static reduced-motion equivalent. No extra cash and no delayed income. Flight freezes with simulation time. | Focused paid route checks coin presence against installation timestamps and exact cash/time at every step; rendered coin/toss reviewed. | Delivered. Arrival pulse/count-up remain optional art proposals, not implemented requirements. |
| Purchase shelf; D144, D152 | Original crate, recruit, radar and expansion props on a shared shelf; labelled buttons, gold prices, wages, cap/affordability reasons and keyboard focus. Successful purchases feed the existing queue and activation/greeting effects. | Four paid routes, pause-and-buy, negative-cash recovery, current shelf bounds at all four sizes, GO keyboard focus and reset checks. | Delivered. Contextual help remains V3.3. |
| Preserve accepted mechanics, interface and capacity; D133–D144, D153, D156, D158 | `v3Game.ts` and `v3World.ts` retain candidate B and fixed routes. No change to costs, demand, wages, speed, FIFO, takeover fraction, cash-only win or shortage behaviour. | 121 automated tests/build pass; mixed 2:09.75, hire-only 2:59.75, small estate 4:51.25, four developers 4:16.35 match previous cash totals exactly. Countdown/hidden hold, camera, pause, results/retry and no-backend-request checks pass. | Delivered. Existing balance evidence remains applicable; no new tuning claim. |
| Delivery and validation; D154–D155 | Specification, decisions, tracker, checklist and handover updated together. | Documentation/source check and linked browser evidence. | Ready for review. Unassisted novice/spectator, Safari and full accessibility assessment unperformed. Guidance/party V3.3; attract/final event checks V3.4. |

### V3.3 — Understandable without explanation

**Required references:** [agreed player journey](V3_MODE.md#agreed-player-journey-attraction-to-replay), [guidance behaviour](V3_MODE.md#guidance-behaviour), [onboarding evidence and observation criteria](V3_MODE.md#evidence-and-how-to-test-this-journey), [inherited interface behaviour](V3_MODE.md#interface-behaviour-carried-from-speed), [purchase shelf](V3_MODE.md#purchase-shelf), and [animation guide](V3_MODE.md#animation-guide). Decision coverage: D153, supported by D138 cash-only victory, D144 purchase freedom, D147 truthful income cue and D152 purchase feedback. Use [HUMAN_PLAYTEST.md](HUMAN_PLAYTEST.md) for its observation approach only; do not inherit Long Game durations or victory rules. Journey stage 1's attract demo is assigned to V3.4; guidance must work without it.

Complete the opening and guidance: workshop-styled countdown, clear goal, first-action cue, contextual failure and Recon hints, and accessible help. Adapt hints to real actions without requiring any purchase strategy. Complete the local results/recap flow and the worker victory party after the score freezes.

**Review criteria:** observe first-time players starting, making intentional purchases and recognising victory without coaching, including players who skip optional explanations. Ensure guidance does not block alternative strategies, charge twice, change timing or require Recon. Track human checks still pending instead of representing automated tests as evidence of understanding.

#### V3.3 delivery record — 2026-10-20

The owner accepted V3.2 and requested this slice. See [journey review](docs/analysis/v3-journey-review.md) for implementation, reproduction and technical evidence, and the [V3 observation sheet](docs/analysis/v3-human-playtest.md) for unperformed human checks.

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| Journey orient/start and inherited timing; D153, D160 | Optional workshop theme in `StartCountdown.tsx`: three lamps, 3–2–1/GO, unchanged timing/focus/hidden hold and static reduced motion. Goal stays visible. Opening and header expose session-only sound opt-in and reduced motion. | Focused browser lamps/hidden/GO checks; full V3 countdown/keyboard checks; default Speed opening regression passes in both motion modes. | Delivered. Attract demo remains V3.4. |
| First action and purchase feedback; D138, D144, D152–D153 | `v3Guidance.ts` / `V3Guidance.tsx`: affordable crate cue, clearer text after five active seconds without purchase, any purchase ends it. Successful costs and queue/wage/bay effects acknowledged. Paused purchases acknowledged without dispatch. | Guidance unit tests and browser alternative-hire route, dismissal, pause-and-buy, exact cash/time and reset. | Delivered. Five seconds and short hint durations are presentation candidates. |
| Failure, investment and independent play; D133–D134, D142, D153 | One local, dismissible hint uses real failure/owner/queue state; highlights the matching broken machine or shelf prop. Recon requires observed maintenance and affordability. Optional hire/Plus explanations require relevant queues; hints expire without pausing or forcing choices. | Tests cover failure during construction, observed/affordable Recon only, expired/dismissed hints and no advice on victory. Browser first failure, affordability boundary and hint dismissal pass. Paid no-Recon wins remain valid. | Delivered; uncoached comprehension remains unverified. |
| Help and planning; D153 | `V3Presentation.tsx`: deliberate Help pauses and explains cash, purchases, wages, queue, automatic repairs and negative balance. Close/Escape preserves planning pause; Resume explicitly resumes. | Browser frozen time/cash while reading, native dialog keyboard wrap, Escape, focus restoration, and 1024/1280 help bounds pass. | Delivered. Full accessibility audit and Safari unperformed. |
| Frozen victory and worker party; D138, D143, D147, D153 | Separate six-second presentation clock, parked props/tools, dancing and warm light. Static reduced-motion poses. Immediate final time and usable replay/inspect/mode controls; optional finish chime. Simulation remains frozen. | Paid 4:08.90 no-Recon victory during delivery: fifth system stays unfinished, cash/time unchanged throughout party; tools/cargo presentation, end-of-dance pose, one opt-in chime, four result layouts and retry pass. | Delivered. Celebration enjoyment/listening quality need human review. |
| Local recap and reset; D153 | Factual installed systems, hires, automation, earned income, wages, investment and completed repairs. Retry clears world, hints and celebration; session sound/motion preferences remain. No public score submission. | Existing four paid route results remain exact: 2:09.75 / 2:59.75 / 4:51.25 / 4:16.35. Focused retry/static motion checks pass; no V3 backend requests. | Delivered; public ranking remains optional. |
| Traceability and validation; D154–D155 | Specification, decisions, handover, checklist and this record aligned; observation sheet prepared. | 126 tests, production-base build, full V3 browser suite, Speed opening regression and focused journey suite pass. | Ready for review. No unassisted player/spectator sessions conducted; V3.4 final event validation remains pending. |

#### V3.3 feedback — P1 failures (D161 / V3-F005)

The owner confirmed adding P1 failures, immediate developer interruption and a system-on-fire severity cue. This updates current V3.3; it does not start V3.4. The original delivery tables above describe their builds at delivery time. D161 supersedes their ordinary-only FIFO statements for P1s; [P1 evidence](docs/analysis/v3-p1-review.md) and the current benchmark govern the revised behaviour.

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| Queue/P1 response, D139/D161 | `v3Game.ts` reserves saved work, prioritises P1, assigns one idle/nearest eligible developer and resumes exact progress. Additional P1s queue without interrupting active P1 repairs. `v3World.ts` routes detours through existing aisles. | Tests interrupt all six active phases; real-trigger same-tick interruption, paid carry/resume browser run, simultaneous emergencies, position/progress and ownership checks. | Delivered; 20% severity after opening is a playtest candidate. |
| Recon selection/takeover, D134/D141/D144/D161 | Free bays prioritise P1; busy bays finish. Retained-progress handoff resumes saved work or returns to bench when Recon takes the paused repair too. | Priority, partial-work, obsolete-work and capacity tests; paid P1 Recon handoff plus workshop regression. | Delivered; no extra capacity or fees. |
| Local failure/animation/guidance, D142/D148/D153/D161 | `V3Board.tsx` shows fire and a P1 badge until completion, paused assembly/cargo and responding crew. Recon bays show P1. Help and a dismissible hint explain the exception. | Paid P1 browser checks at four sizes, pause/static reduced motion and completion; screenshots inspected. | Delivered. Unassisted recognition remains unverified. |
| Inherited economy/lifecycle, D138/D153/D156/D158 | Costs, repair speeds, ordinary demand, negative cash, cash-only victory and freezing remain. Only severity/priority and physical interruption journeys change. | Full unit/build and paid browser suites; 80 paid strategies, nine delayed starts and 20 mature-capacity fixtures regenerated. | Delivered; current evidence replaces pre-P1 timings, human pacing remains open. |

#### V3.3 feedback — shared feature backlog (D162 / V3-F006)

The owner clarified one shared column beside all benches and approved trying the fetch/build/deliver loop. Existing four-developer capacity remains. This extends V3.3 without starting V3.4. This original fetch/build/deliver design is superseded by D165 below. Earlier P1 and candidate B timings are historical; see [original feature evidence](docs/analysis/v3-features-review.md).

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| Features, productive capacity; D133/D136/D162 | `v3Game.ts`: automatic feature jobs only when builds/repairs need no available worker; reserve destination, fetch, assemble in 3s, deliver and add 0.25 cr/s. Ordinary queued jobs precede the next feature. No fee beyond existing wages. | Lifecycle, actual path/time, no-early-income, queue ordering, destination distribution, outage preservation and deterministic accounting tests; 80 paid strategy runs. | Delivered trial. Numeric defaults and unlimited supply remain candidates. |
| Shared column, blue feature work, physical movement; D145/D149/D162 | `V3Features.tsx` and `V3Board.tsx`: one six-card replenishing column, top pickup area, blue carried card/bench parts/module, per-system count and truthful income. World extended on the right to reserve its space. | Paid four-developer browser route checks pickup/card IDs, phase/coordinates, bonuses and four-size bounds with no bench/card overlap; screenshots inspected. | Delivered. Human readability and impression require review. |
| P1, Recon, pause and finish; D134/D141/D153/D161/D162 | Features survive P1 during every phase; Recon only takes repairs. Saved feature props remain visible, and resume restores the original work. Pause/victory freeze feature and bonus state; retry clears backlog counters. | Six feature-phase P1 tests; paid P1 delivery interruption, pause, reduced motion, full paid regression, Recon bay and journey tests. | Delivered. No public scoreboard or V3.4 scope added. |
| Guidance and current evidence; D153/D155/D162 | Help, live feature counts, first-feature hint and results recap reflect actual work. Current benchmark regenerated; pre-feature P1 dataset preserved. | Unit guidance checks, browser Help/results/reset and linked review. | Ready for review; unassisted human testing remains pending. |

### V3.4 — Complete event experience

**Required references:** the complete [V3 specification](V3_MODE.md), particularly [player journey](V3_MODE.md#agreed-player-journey-attraction-to-replay), [animation guide](V3_MODE.md#animation-guide), [layout feasibility](V3_MODE.md#layout-feasibility-study), [remaining conditional scope](V3_MODE.md#remaining-choices-and-working-recommendations), and [validation plan](V3_MODE.md#next-validation-pass). Review D133–D153 as the final integration checklist and D154–D155 for delivery/documentation rules. Reconcile delivery records and unresolved feedback from V3.1–V3.3. If public rankings are explicitly included, also consult the existing [scoreboard implementation handover](HANDOVER.md#d131--verified-scoreboard) and [operator documentation](supabase/README.md); these describe reusable infrastructure, not permission to reuse Speed's ranking identity or deploy changes.

Complete the opening and final visual polish. D164 supersedes the initial optional demo: show only a short gameplay explanation and Start game, with no live preview or opening settings. Explicit owner feedback: replace the regular system arrangement with more natural connected groups and give Recon generous clearance; check loaded routes and labels alongside the new geometry (D163 / V3-F007). Refine dense scenes, transitions, celebration and reduced-motion presentation. Finish balance tuning and repeated visitor/replay testing across supported desktop and laptop sizes.

**Review criteria:** the full agreed journey works together, with reliable resets, clear results, readable busy scenes and evidence for the intended pacing. Check both active players and spectators. Resolve event-blocking defects and make any remaining limitations explicit.

### V3.4 opening revision — D164 / V3-F008

The owner rejected the game-like live preview and extra opening controls. `V3Game.tsx` now shows a compact gameplay explanation and one focused Start game button; the header and workshop stay hidden until countdown. The unused demo component/simulation are removed. Settings remain in gameplay. The opening browser check now verifies one button, no preview, held time/cash, four desktop sizes, countdown and reset; the journey check enables sound through the gameplay header. See [event review](docs/analysis/v3-event-review.md) for results. Owner review remains pending.

### V3.4 build and hire counters — D176 / V3-F020

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D176; visible growth capacity | `V3Game.tsx` shows Systems N/12 and Developers N/4 in styled badges on their purchase buttons. Reserved builds and busy workers count immediately; accessible descriptions and cap/disabled visibility retained. | Production build and paid browser checks pass: counts start/reset at 1/12 and 1/4, update on queued build/hire, reach 12/12 and 4/4, and fit all four desktop sizes. Compact screenshot inspected. | UI only; economy, guidance priority and win rules unchanged. |

### V3.4 restored prices and maintenance adjustment — D175 / V3-F019

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D175; original prices and more frequent maintenance | `v3Game.ts` restores 180/260; young/mature intervals 32/24. Controls/receipts read config. Opening 22s, repair performance and other mechanics retained. | 62 V3 tests, build and benchmark pass: 80 paid/9 delayed wins, 20 capacity fixtures. [Current review](docs/analysis/v3-price-trial-review.md). Paid upgrade and full-run/replay/handoff browser checks pass. | Exact 32/24 trial awaits owner playtest. |

### V3.4 restart-only toolbar — D174 / V3-F018

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D174; minimal controls | `V3Game.tsx` exposes only Restart in the toolbar; no Help or audio hook, live OS reduced-motion listener. Cancel or Escape resumes a held run; Start fresh resets it. Contextual hints and result/replay remain. | Production build and focused browser checks pass: sole toolbar action, restart hold/cancel/Escape/reset, live OS reduced motion, silent paid victory and replay. Screenshot inspected. | Implemented locally; supersedes earlier toolbar/Help/sound browser scenarios. |

### V3.4 single Active Animation experience — D173 / V3-F017

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D173; sole visitor experience | `GameEntry.tsx` renders V3 directly. Speed, Long and their scoreboard are no longer imported by the entry. Active restart/results contain no mode navigation; Play again resets the same experience. Legacy source remains available in the repository. | Opening browser checks confirm direct entry, one focused start button and no chooser/scoreboard actions. Four paid full-run/replay checks pass, with engine-matched results and no mode-switching actions. | Implemented locally; no deployment. |
| D173; identity and wording | `index.html`, `V3Game.tsx`, `Brand.tsx` use Recon — Active Animation, the retained slogan and approved description. Start/Resume experience and countdown accessibility wording match. | TypeScript/production build, four-size opening checks and journey/Help/replay checks pass. Opening and compact header screenshots inspected. | Delivered; prices and mechanics unchanged. |

### V3.4 later automation price trial — D171 / V3-F015

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D171; longer manual phase | `v3Game.ts` sets Recon 600 / Plus 680; `V3Presentation.tsx` and `v3Guidance.ts` read these values for Help/receipts. Purchase eligibility and lighting already use configuration. Automation effectiveness, worker rules and cash goal stay unchanged. | 169 tests, production build, paid upgrade price/copy/deduction/affordability checks at four desktop sizes; 80 paid/9 delayed/20 capacity benchmark. [Price-trial review](docs/analysis/v3-price-trial-review.md). | Accepted by the owner after playtesting on 2026-10-21; broader user comprehension validation remains separate. |
| D172; possible stronger Plus | Record a stronger, more expensive Plus only if no-Recon wins prove too easy in this trial. | No implementation; exact strength and price not selected. | Closed without implementation under V3-F016 on 2026-10-21; owner accepted current prices and requested no further changes. |

### V3.4 fixed workshop view — D169 / V3-F013

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D169; fixed ecosystem | `V3Board.tsx` removes camera state, zoom/fit buttons and pointer-drag handlers. `v3-game.css` removes grab cursors and control styling. The full-world SVG scales proportionally with the available area; system/feature summary and worker movement remain. | Production build passes. Updated gameplay browser check verifies absent controls, fixed system screen position after drag/wheel and growth, plus four desktop sizes. | Verified locally; four paid runs, victory/replay, takeover and layout checks pass. 1024×768 dense screenshot inspected. Owner review pending. |

### V3.4 direct repair travel — D168 / V3-F012

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D168; useful travel and retained priority | `v3Game.ts` lets unassigned returning developers take the next queued repair from their current position, including immediately after installation/repair. Preserve FIFO builds, P1 resumption, Recon ownership and parked features. | 169 unit tests; five targeted direct-travel tests; paid one-worker browser path and P1 regression; production build. [Direct-repair review](docs/analysis/v3-direct-repair-review.md). | Ready for owner review. |
| D147/D168; truthful movement and economy | Existing routes/speed determine travel; `V3Board.tsx` retains installation release gesture even when the next destination is a repair. | Exact browser coordinates, 2.2s system-to-system walk, installation coin, pause and repair completion; screenshot inspected. 80 paid/9 delayed/20 capacity benchmark regenerated; prior desk-feature results archived. | Verified locally; relative strategy pacing remains for play review. |

### V3.4 automation purchase emphasis — D167 / V3-F011

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D167; primary affordable automation | `V3Game.tsx` derives persistent emphasis directly from purchase eligibility. Recon uses mint lighting; Plus adds gold lighting and decorative sparkles around the module. Other purchase-hint outlines yield while automation is affordable. No price, scheduler or purchasing change. | Production build; paid `tests/v3-upgrade-browser.ts` verifies unavailable → affordable → spending below price → affordable again → purchased for both tiers, single deduction and three unlocked bays. | Ready for owner review. |
| D167; readable, motion-aware presentation | Labels state Ready to automate / Unlock all 3 bays. Existing keyboard focus remains; paused/hidden states hold animation and reduced motion shows static light/sparkles. | Browser checks at 1024×768, 1280×720, 1440×900 and 1920×1080; pause and reduced-motion checks. Recon 1280 and Plus 1024 screenshots visually inspected in `test-results/v3-upgrade/`. No page errors. | Verified locally; human impression still for owner review. |

### V3.4 early hiring guidance — D166 / V3-F010

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D166; capacity guidance | `v3Guidance.ts` recommends an affordable second developer while the first has unfinished construction. System receipts no longer highlight another build. P1, pause, dismissal, hiring acknowledgement and the initial pre-purchase hint are retained. | 57 V3 unit tests, production build and `tests/v3-hiring-browser.ts`: screenshot scenario, single guided target, affordability, successful hire, dismissal and keyboard Tab. Screenshot inspected. | Ready for owner review; no economy/dispatch change. |

### V3.4 desk features — D165 / V3-F009

The owner wants features to use spare capacity and stop delaying early construction. See [desk-feature review](docs/analysis/v3-desk-features-review.md) for current mechanics, screenshots and pacing; the pre-change island benchmark is archived separately.

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D165; feature priority and progress | `v3Game.ts` gives queued builds/repairs priority over every feature phase. Idle developers are preferred; interrupted cards and progress remain parked while higher-priority work runs. P1 can additionally suspend that work. | All four collection/assembly phases × build/repair/P1 tests; nested P1, resume-walk interruption and idle-worker priority checks. | Delivered; owner pacing review pending. |
| D165; desk completion and random allocation | Collect shared blue cards, return to desk, assemble and apply a bonus to a randomly selected installed system immediately. No feature delivery/install trip; broken targets earn zero until repair. Randomness does not change failure draws. | Exact completion income/position, target eligibility, seeded distribution, batching and outage tests; paid browser run matches the engine. | Delivered; candidate value remains +0.25 cr/s. |
| D145/D149/D161/D165; truthful movement and feedback | Real travel from interrupted location to build desk or repair. Saved feature props remain; desk names recipient and system receives a blue cue. Help, counters and result use completed features. | Four-size paid browser screenshots, actual positions, ordinary build preemption, P1 pause, reduced motion, freeze/replay and regression checks. | Verified locally; unassisted visitors remain pending. |
| D156/D158/D165; economy and continuity | Prices, wages, maintenance and system build durations remain unchanged. Earlier feature delivery time is removed. | 162 unit tests, production build, updated 80 paid/9 delayed/20 capacity benchmark. Seed-200 negative-cash recovery retained; original spending burst now solvent. | Simulation evidence; final balance is not human-validated. |

### Initial V3.4 delivery record — 2026-10-20 (opening superseded by D164)

| Requirement reference | Implementation / observable behaviour | Verification evidence | Status / remaining work |
| --- | --- | --- | --- |
| D145/D151/D163; ecosystem, layout and owner spacing feedback | Four uneven fixed islands, soft grouping, dependency wires above Recon, minimum 46-unit housing clearance and loaded paths below the tower. | Geometry/loaded-route tests, dense workshop screenshots and actual walking benchmark in [event review](docs/analysis/v3-event-review.md). | Implemented; owner judgement of grouping/readability pending. |
| D153; attract → orient → start | Living tile, labelled separate paid demo, immediate Start, goal/settings, loop, hidden hold and static reduced motion. | Paid-demo unit replay plus dedicated four-size opening/browser reset checks. | Implemented; unassisted comprehension pending. |
| D133–D144/D161/D162; inherited mechanics | Same costs, wages, dispatch, failures, P1 retention, features and cash-only victory. Actual route lengths change time/cash outcomes. | 155 tests, 80 paid policies, nine delayed starts, 20 capacity fixtures; exact paid browser paths. | Verified locally; new pacing candidate needs human review. |
| D146–D150/D152; busy workshop performance | Existing work/cargo, shelf/coin and real bay cues; paused cargo uses an explicit badge without name-label collision. | Workshop/feature browser checks at four sizes and screenshot inspection. | Implemented; transient worker-to-worker overlaps can still occur in shared aisles. |
| D138/D153; guidance → result → replay | Existing Help/hints, frozen result, separate party, opt-in sound and fresh replay; demo unmounts at Start. | Journey and event browser checks including late unfinished build, freeze and repeated opening. | Verified locally; visitor/spectator sessions remain unperformed. |

Human event validation is tracked explicitly; this delivery does not certify event readiness or final enjoyment. Public score saving remains optional and unimplemented for V3. See the review for commands, pacing comparison, screenshots and outstanding checks.

## Feedback routing and backlog

- **Process immediately:** apply the feedback to the current delivered/in-progress slice, verify the affected behaviour, and update the specification and tracker as needed. Do not defer it solely because its subject normally belongs to another version.
- **Add to backlog:** record the feedback without implementing it now. Assign it to the earliest suitable unfinished version and extend that version's scope. Examples: economy/queue feedback fits V3.1; character/radar/shelf feedback V3.2; guidance/results feedback V3.3; attract-mode/final presentation feedback V3.4.
- If the natural version is already complete, assign deferred work to the next appropriate unfinished version and record which earlier feature it changes. Immediate feedback can reopen the affected slice.
- If the owner does not specify timing, treat a clear request to fix the current slice as immediate. Record exploratory suggestions as proposals, and ask a concise question only when timing or intent materially affects the work.
- Give each backlog item a stable `V3-F###` ID, actionable description, requirement reference, target slice, status and completion evidence. Keep deferred items visible until resolved. A later change superseding an earlier item should mark it as superseded rather than leave contradictory tasks open.
- If feedback does not fit any remaining slice, propose where to place it. Do not silently create V3.5 or expand optional features into committed scope.

| ID | Feedback / desired outcome | Requirement reference | Target slice | Status | Completion evidence |
| --- | --- | --- | --- | --- | --- |
| V3-F026 | Recon’s waiter pops champagne beside the celebrating result crew. | D188; presentation-only victory reward | V3.4 | Complete — owner accepted D193 | Waiter enters, pops champagne and holds a happy pose only for Recon finishes. Paid two/four-developer victories verify cork/spray, hidden hold, static reduced motion and replay; no-Recon routes omit him. Frozen time/cash remain exact. |
| V3-F027 | Identify the workshop areas before play. | D190–D192 supersede rejected D189 banner tour | V3.4 | Complete — owner accepted D193 | Waiting welcome with bold Get your intro button, then the whole-ecosystem pointer for three seconds, two other pointers for two seconds each, and automatic countdown. No second Start button. Banner, navigation and mechanics explanations removed; existing in-run guidance retained. |
| V3-F025 | Visible movement feels jittery despite the new gait. | D184; presentation timing | V3.4 | Complete | Owner reports calmer, smoother movement and faces readable during travel. Browser sampling confirms intermediate visual positions; pause and reduced-motion checks pass. |
| V3-F024 | A waiter brings coffees to the developer desks when Recon is bought. | D183/D187; presentation-only purchase reward | V3.4 | Complete — owner accepted D193 | Waiter serves the desks present at Recon purchase; later hires receive queued one-cup welcomes. Cups remain and Plus does not retrigger a visit. Three sequence tests and updated paid browser checks pass for delivery, holds, reduced motion, four desks and replay; game time/cash match the engine. |
| V3-F023 | Reserve peak-productivity copy for a fast finish; positively recognise other completed runs. | D181; result copy | V3.4 | Complete — owner accepted D193 | Under 3:00 uses peak-productivity copy; other finishes use the healthy-company title. Build, four paid gameplay routes and victory/frozen-result/replay journey pass; cutoff remains a first trial. |
| V3-F022 | Workers slide while walking; grounded celebration tool reads as a broken leg. Add a clearer gait, feet, facial expressions and gentle celebration. | D180; animation and worker presentation | V3.4 | Complete — owner accepted D193 | Alternating steps, loaded/unloaded bob, boots, focused/concerned/happy faces and separated tools implemented. D182 adds smiles during feature work and briefly after completion; the owner accepts the walking motion. D185–D186 replace green caps with short side-parted hair and female characters with tied-back hair. Build, rendered gait/motion-preference checks and full celebration/replay journey pass. |
| V3-F021 | Guided first play, delayed features and muted blue-grey backlog; UT-001. | D178; player journey, guidance, feature release and purchase shelf; reviewed onboarding plan | V3.4, revising V3.3 guidance | Complete | Implemented and locally verified; owner accepted the design and saving-route balance change on 2026-10-21. See the Game design goal achieved assessment log. |
| V3-F001 | Permit visible negative cash while wages/work continue; purchases require enough balance. | Cash-shortage rule, D156 | V3.1 | Complete | Owner confirmed; late-spending regression and benchmark recovery recorded. |
| V3-F002 | Make Recon visually impressive as the central machine. Preserve the worker movement the owner enjoyed. | Recon visual centrepiece; D146, D151; D157 | V3.2 | Complete | Large central radar tower, live failure blips, active repair links and completion cues implemented. Four-size rendered checks pass; Owner accepted the result when requesting V3.3. |
| V3-F003 | Make the one/three concurrent repair positions immediately recognisable as Recon processing slots. | Recon visual centrepiece and animation guide; D134, D151, D157 | V3.2 | Complete | Three numbered physical bays show actual systems/progress and explicit ready/locked states. Paid ownership, stable bay, pause and reduced-motion checks pass. Owner accepted the visual result; uncoached comprehension remains unverified. |
| V3-F004 | Increase the felt cost of developer-only maintenance before Recon, while retaining viable no-Recon wins and beginner playability. | Purpose/game rules/validation; D133, D136–D138, D157–D158 | V3.1 | Complete | Implemented 36/26s intervals after four-candidate comparison. 121 tests, build and production-browser checks pass; see maintenance update. Owner accepted the result and requested V3.2. |
| V3-F005 | Occasional P1 system fires interrupt developers, preserve work progress and resume after urgent repair. Ordinary failures should not interrupt. | Queue, P1 response, local failure, animation and guidance; D139/D144/D148/D161 | V3.3 | Complete | Accepted with advancement to V3.4. Confirmed by owner after recap. Engine, fire/badge, paused cargo/assembly, Recon priority and guidance delivered; see P1 evidence. |
| V3-F006 | Replace avoidable developer idleness with one shared blue feature backlog: top pickup, desk assembly and delivery that raises system income. | Features, capacity, animation, guidance; D133/D136/D145/D149/D162 | V3.3 | Complete | Accepted with advancement to V3.4. Approved trial implemented; see shared feature evidence and current balance results. |
| V3-F007 | Recon feels squeezed between neighbouring systems; make the ecosystem grow into more natural connected groups. | Ecosystem, movement, radar, D145/D151/D163 | V3.4 | Ready for review | Four uneven islands, central clearance and routes below the tower; event review records geometry, rendered evidence and pacing impact. |
| V3-F015 | Recon becomes affordable before players fully experience manual maintenance. Try prices 600 / 680 with the current payoff. | Pacing and purchase copy; D171 | V3.4 | Complete | Owner accepted after playtesting on 2026-10-21. 600/680 prices implemented; effectiveness and cash goal unchanged. 169 tests, build, paid upgrade/gameplay/layout checks and updated benchmark pass. See price-trial review. |
| V3-F016 | If no-Recon wins prove too easy, strengthen Plus and increase its price by a few hundred credits. | Conditional balance follow-up; D172 | V3.4 | Complete | Closed without implementation on 2026-10-21 after owner acceptance of 600/680; no further price or effectiveness changes requested. |
| V3-F014 | Frame the victory headline around optimal productivity instead of the cash target. | Results copy; D170 | V3.4 | Ready for review | “Peak productivity reached!” in `V3Game.tsx`; accessible dialog selectors updated. Copy-only change; win condition unchanged. |
| V3-F013 | The ecosystem does not need separate zoom/pan or Fit workshop controls; keep it fixed. | Workshop layout and interaction; D169 | V3.4 | Ready for review | Camera controls/state/drag handlers removed; full-world responsive SVG retained. Build and four-size paid browser regression pass. |
| V3-F012 | A lone developer walks home after installation despite nearby maintenance waiting; dispatch directly to the repair. | Developer dispatch and movement; D168 | V3.4 | Ready for review | Direct repair routing after installation/repair and during return walks; FIFO, P1 resumption and Recon ownership retained. |
| V3-F011 | Affordable Recon and Plus should light up as the main purchase; Plus should anticipate a celebration. | Purchase shelf, affordability and motion; D167 | V3.4 | Ready for review | Persistent mint Recon / gold Plus emphasis; paid browser checks cover affordability loss/recovery, purchase, pause, reduced motion and four desktop sizes. |
| V3-F010 | At one developer and an unfinished system, highlight Hire developer instead of another Build system purchase. | Early capacity guidance; D166 | V3.4 | Ready for review | Affordable hiring hint implemented and browser-verified; purchase confirmation no longer recommends another system. |
| V3-F009 | Features occupy developers too early; let builds/repairs interrupt them and finish at the desk for a random system. | Feature priority, movement and economy; D165 | V3.4 | Ready for review | Implemented and verified; see desk-feature evidence. No feature delivery trip; saved work resumes after higher-priority jobs. |
| V3-F008 | Live opening preview looks like the game has started; keep only gameplay explanation and Start game. | Opening/player journey, D164 | V3.4 | Ready for review | Static explanation, one button, background hidden until countdown; obsolete demo removed. Opening and journey browser checks cover the revision. |

| V3-F017 | Make V3 the only visitor experience, named Recon — Active Animation, with no mode chooser or mode-switching links. | Entry, branding and replay; D173 | V3.4 | Ready for review | Direct entry, updated title/header/opening and Start experience; legacy sources retained. Build, four-size opening, journey and full-run/replay checks pass. |

| V3-F018 | Keep only Restart in the toolbar. | Toolbar and restart lifecycle; D174 | V3.4 | Ready for review | Removed other controls; silent play, automatic OS reduced motion and safe restart cancellation verified in opening/journey browser checks. |

| V3-F019 | Original Recon prices were preferable; make systems fail a bit faster. | Economy and maintenance; D175 | V3.4 | Ready for review | Restored 180/260; trial 32/24 intervals. Unit/build/benchmark and paid upgrade/full-run browser checks pass. Supersedes V3-F015 pricing. |

| V3-F020 | Show counters on Build system and Hire developer to make remaining growth capacity visible. | Purchase shelf; D176 | V3.4 | Ready for review | Persistent labelled counters added; build and paid purchase/reset/cap/four-size browser checks pass. |

## Optional and conditional scope

Public V3 rankings remain optional. If included by a later owner instruction, add them to V3.4: separate V3 ranking identity, optional nickname/save, replay verification and save-error recovery. Local results and replay already belong to V3.1.

Cash-shortage testing exposed a recoverable deficit. D156 now permits a visible negative balance with continuing wages/work; bankruptcy is not MVP scope. Dependency cascades, extra upgrade categories and a compulsory Recon purchase are not additions implied by “fully featured.”

The numeric configuration now trials D175 (32/24s maintenance, restored 180/260 prices) with P1 severity/priority (D161) and the desk feature trial (D162/D165), with actual outcomes and limitations in the MVP review record; it is not final human-validated balance. Balance and usability are checked throughout delivery, not postponed wholesale to the final slice.
