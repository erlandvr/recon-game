# V3 — current specification

Updated: 2026-10-21. D178 / V3-F021 guided first play is implemented and owner-accepted (D179) on `codex/guided-first-play`.

**Status:** V3.1–V3.3 are accepted locally on `codex/v3`; the owner requested the next slice after reviewing shared features and asking for a more natural ecosystem. V3.4 implements the island-layout refinement (D163 / V3-F007), an explanation-only opening (D164 / V3-F008), and low-priority desk features (D165 / V3-F009). See [delivery status](V3_DELIVERY.md) and [event review](docs/analysis/v3-event-review.md). Unassisted visitor/spectator testing, Safari and final human balance acceptance remain pending. No deployment or public V3 scoring is included.

## Purpose and player goal

V3 is a short game for a venue or one-day event, based on Speed Game. It should communicate Recon's purpose through an animated experience that is enjoyable even for bystanders: developers build income-generating systems, maintenance takes their time, and Recon releases that capacity.

The owner clarified on 2026-10-21 that visitors will already be introduced to Recon and SumZero, and Active Animation is part of a larger event offering. Its role is to reinforce that introduction through visible maintenance relief, rather than explain the entire product independently. The owner describes the current **V3.4** result as **Simple, Lovable and Complete**; see the [assessment log](V3_DELIVERY.md#owner-assessment-log--v34-simple-lovable-and-complete) and D177.

Owner playtest feedback (2026-10-20) calls for a more noticeable developer-capacity squeeze before Recon, while preserving the enjoyable worker movement. The intended contrast is visible maintenance delaying growth and automation restoring capacity. The owner found candidate A too forgiving and approved more frequent maintenance. Candidate B used 36/26-second young/mature operating intervals (D158 / V3-F004), accepted when advancing to V3.2. D175 now trials 32/24 seconds alongside restored 180/260 automation prices. Broader human balance testing remains pending. Keep no-Recon wins viable and test beginner playability alongside stronger pressure.

**Win by reaching a target amount of spendable cash.** Purchases and running costs reduce progress towards that balance but can improve future earnings. Players may save with a small estate or invest in growth and automation. There is no required system count, Recon ownership, health check or stability countdown. Target roughly two to three minutes, with two a very good run; this is a pacing goal, not a timeout. The cash amount remains to be tested.

**Recon — Active Animation** is the sole visitor experience (D173). Open directly on its introduction, retaining “Experience the Benefit of Recon” and the invitation “Discover what your team can do with Recon.” Use a large, bold **Get your intro** button (D191), with Play again on results. The welcome waits for a visitor; one click runs the three location pointers and automatically continues through the countdown into play. Remove the chooser, all mode-switching actions and the old Speed scoreboard entry. Keep Speed and Long source code hidden from visitors. V3 remains an internal implementation name. Support desktop and laptop browsers; mobile remains outside scope.

## Delivery and feedback

Build one playable slice at a time using [V3_DELIVERY.md](V3_DELIVERY.md), the authoritative progress tracker and feedback backlog: **V3.1 Playable MVP → V3.2 The living workshop → V3.3 Understandable without explanation → V3.4 Complete event experience**. When the owner says “start the next slice,” consult that tracker and resume or select the next unfinished slice. Deliver a reviewable result before advancing.

Process feedback immediately when requested, or record it against the appropriate existing version when the owner asks to backlog it. Extend that version's scope and keep current rules, progress and the handover aligned. The agreed baseline can evolve through this feedback; candidate values and conditional scope remain explicitly labelled.

Every slice must follow the [required documentation contract](V3_DELIVERY.md#required-documentation-contract). Read this complete specification and current decisions before implementing; the slice summary alone is insufficient. Each slice links its governing requirements and must record implementation and verification against them before review. Keep authorised requirement changes and delivered behaviour aligned, and explicitly track pending features or deviations rather than silently changing the specification to match code.

## Agreed game rules

| Area | Current rule |
| --- | --- |
| Player actions | Buy developers, systems, Recon and Recon Plus. No separate maintenance-speed upgrade initially. Maintenance and dispatch are automatic; no required system selection or scan/fix buttons. |
| Developers | One developer owns a construction job. Additional developers enable parallel jobs rather than speeding up the same build. Hiring has an upfront cost and developers incur ongoing wages, including while travelling or repairing. Rates remain for tuning. |
| Queue | Construction and ordinary maintenance share an arrival-order developer queue. Ordinary failures do not interrupt system construction or another repair. All queued builds and repairs interrupt feature work, preserving its progress; idle developers take these jobs first. P1 failures take priority and can interrupt it immediately; interrupted work retains its progress and resumes after the urgent repair. No queued-build cancellation/refunds initially. |
| P1 response | A severe local failure shows the system on fire with an explicit P1 label. A free Recon bay responds first; otherwise one developer pauses work and walks to the emergency. Prefer an idle developer, then the nearest eligible developer by actual walking distance. Do not interrupt an existing P1 response. Additional P1s wait in arrival order if every developer and bay is occupied by urgent work. Return to the saved work position before resuming; retain build/repair progress and park carried machines there. These dispatch details implement the confirmed interruption requirement. |
| Construction | Assemble at the assigned developer's workbench, carry to the reserved cluster position, install and connect. The system starts operating and earning immediately at installation completion. After installation, go directly to the next queued repair if one is next in the ordinary queue; otherwise return to the bench. An older queued build still takes precedence and requires the bench (D168). |
| Features | One replenishing column of muted blue-grey “New feature” cards beside all workbenches, introduced four active simulation seconds after the first purchased system (ID 1) is installed (D178). Before that boundary, hide the column and feature counters and dispatch no features. Hint dismissal/visibility never changes this rule; saving without building remains legal. When no queued build or repair needs a developer, they collect a card and build it at their own desk. Desk completion adds a permanent income bonus to a randomly selected installed system; there is no delivery trip. Builds, ordinary repairs and P1s pause any feature phase, preserving its progress and physical position. Clear queued higher-priority work before resuming. |
| Repair travel | After installation or a completed repair, an unassigned developer can head directly to the next queued repair. A return walk can be redirected from its current position. Use actual connected-aisle distance at the same speed. Preserve FIFO, exclusive Recon ownership and P1 saved-work resumption; do not choose an ordinary repair merely because it is closer. |
| System income | Working systems earn their base operating income plus installed feature bonuses; failed systems earn zero until repaired. No partial-income state. Failures stay local: connected systems keep working. |
| Ageing | Maintenance demand increases with system age, then levels off at a ceiling. The curve, clock details and ceiling remain for tuning or specification. |
| Recon | One concurrent maintenance job. Recon Plus has three total concurrent jobs. These concurrency values are the agreed starting direction, subject to balance testing; they do not limit total system ownership to one or three. |
| Recon selection | A free slot takes the oldest outstanding P1 first, then the oldest ordinary maintenance job, whether waiting or assigned to a developer. An occupied Recon bay finishes its current repair. It skips construction and features. A Recon-owned job cannot also be claimed by another developer. |
| Takeover | Recon can take over during the developer's outward walk or repair. The developer immediately stops, turns expressively and walks back without finishing the hammer swing or teleporting. Completed repair work is retained; Recon finishes the remainder at its own speed. Walking is not repair progress. After a P1 takeover, the developer walks back to paused work; if Recon also takes their paused repair, they return to their bench. |
| Cash shortage | A visible negative balance is permitted in the MVP. Wages and work continue; new purchases require enough cash. No bankruptcy, automatic developer removal or bailout. |
| Capacity limit | Keep a finite system cap that Recon Plus can sustainably maintain at maximum age-related demand, with headroom for bursts. Reaching the cap is optional for victory. |

Recon's economic benefit is improved uptime and developer capacity recovered for new systems and income-raising features, potentially avoiding extra hires. It does not remove the wages of existing developers.

## Interface behaviour carried from Speed

- Keep a short opening and explicit start, followed by 3–2–1/GO. Reading and countdown do not consume run time. Simulation and input start at GO; preserve the countdown's hidden-tab hold and reduced-motion alternative. Opening guidance must explain V3's purchases rather than scanning/fixing.
- The toolbar contains only Restart (D174). Its confirmation holds simulation and active time, including wages and work. Keep this workshop or Escape resumes the run; Start fresh returns to the introduction. There is no manual pause/planning or Help action. Keep the experience silent and automatically follow the OS reduced-motion preference, including live changes.
- A fresh load or retry starts a fresh run. First victory freezes the result; practice cannot improve that recorded result.
- Keep essential controls in the viewport. Keep the workshop fixed in place with automatic proportional scaling to the available screen area. No independent zoom, drag-to-pan or fit controls (D169). Nodes are visual feedback, not required action targets.
- Public V3 scoring is a separate scope choice. If included, reuse optional Save/Skip, nickname and retry/discard behaviour with a distinct V3 rules identity and replay verification. V3 times must not enter Speed's ranking.

## Agreed player journey: attraction to replay

The owner accepted this end-to-end journey on 2026-10-20 as the prototype direction. Players skip opening instructions, so the countdown fits the game's artwork and victory includes a happy worker party. Detailed hint wording and timing remain prototype choices. V3.1 implements the run and local results; V3.2 the workshop artwork; V3.3 now adds the lamp countdown, dismissible event-based guidance, Help, factual recap, a presentation-only worker party. D174 later removes Help and opt-in sound from the visitor experience. Following owner feedback, V3.4 replaces its initial live demo with a short gameplay explanation and one Start experience button (D164/D173). See the [journey evidence](docs/analysis/v3-journey-review.md). The complete journey has not been human-validated. Teach through actions and consequences; reading an introduction must not be necessary to begin.

| Stage | What the player sees and does | What the experience teaches |
| --- | --- | --- |
| 1. Attract | Open directly on Recon — Active Animation and its slogan. No chooser or live demo. A welcome modal hides the workshop and waits for an explicit Get your intro click (D191). | The introduction must not look like gameplay has already started. |
| 2. Orient | Show three short location pointers on the still workshop: “Your ecosystem”, “This is where your developers work.” and “These are your game controls.” (D190–D192). After Get your intro, outline the whole ecosystem area for three seconds, then show the developer and game-control pointers for two seconds each before the automatic countdown. Strong sage-green outlines, connector lines and dimmed surroundings identify each target. The purchase group pulses once. There is no second Start experience button, tour banner or Back/Next/Pause/Replay control. Hidden tabs and restart confirmation hold the sequence; reduced motion uses static highlights. No simulation or purchases before GO. | The player recognises the areas; mechanics are explained later through the existing in-game guidance. |
| 3. Start | After all three pointers (seven visible seconds), automatically run the existing 3–2–1/GO countdown on the fresh workshop. The initial Get your intro click is the only required start action. Preserve hidden-tab hold, reduced motion and a single GO boundary for simulation, purchases and timer. | Reading does not consume run time; the run has an unmistakable start. |
| 4. First action | Gently highlight the affordable cube crate with “Build a system.” All legal purchases remain available. On a successful purchase, show a receipt at the purchased control and follow the first purchased system through its queue, assembly, oversized back-carry, installation and income. Reserve four visible active seconds for the installation confirmation, excluding higher-priority interruptions (D178). If the player chooses another purchase, acknowledge that action and adapt instead of forcing the crate. | Buying trades cash now for future capacity or income. A queued purchase has succeeded even when its developer is busy. |
| 5. First maintenance | On an actual failure, the panel opens, the machine stops and the earnings rate drops. Briefly label that machine “Broken: no income.” Show its queued repair or the developer walking over. The opening failure stays ordinary and lets current construction finish. Later P1s show fire and explain the actual interruption and saved work. | Failures cost income and take developers away from new work. Repair is automatic; clicking the broken machine is unnecessary. |
| 6. Meaningful choices | Show brief explanations beside relevant shelf items as their use becomes apparent: “More builders. More wages”; “Recon repairs 1 system at a time”; “Plus repairs 3 at once.” Suggest Recon when maintenance has been observed and it is affordable. If bought, its takeover, developer turn-around and eventual restoration provide the explanation. | Hiring, expansion, saving and automation are choices. Recon recovers capacity without eliminating existing wages. Never require Recon or Plus as a tutorial step or win condition. |
| 7. Independent play | Fade guidance as actions demonstrate understanding. Keep current cash / target, net income per second and elapsed time visible. Make income and wages separately inspectable. Keep Restart available; contextual hints supply in-run guidance. | The player can judge the effect of decisions and recover context without another opening lecture. |
| 8. Victory and celebration | At the first cash-target crossing, freeze the result, economy and gameplay immediately. Then run a brief presentation-only celebration: workers put down tools or safely set down carried props and dance, with a warm light response across the workshop. Reveal the finish time and cash target achieved immediately; results actions remain usable during the party. | They won, and their time is final. Celebration does not finish queued jobs, alter earnings, or add seconds to the score. Reduced motion uses a static celebratory pose. |
| 9. Results and replay | Present Play again as the clear next action, plus a compact factual recap of systems, hires and automation owned. If public V3 scoring is included, offer optional Save score / Skip and View V3 scoreboard; request a nickname only after choosing Save. Preserve the result through save errors and offer retry. | The player sees their outcome and can try a different strategy. A new run resets the game and timer; celebration or practice cannot improve the original result. |

### Guidance behaviour

- Use event-based guidance, not a fixed lecture timeline. The first build, first failure and first Recon purchase happen at different times for different strategies.
- Show one local hint at a time, with a recognisable prop, gesture or state change beside the short text. No flashing across several areas or dependence on colour, sound or animation alone.
- Start with a subtle first-action cue. If the player hesitates for roughly five seconds without a purchase, show a clearer local prompt; this delay is a testing candidate. Once work is underway, waiting for it is legitimate, not evidence that the player is stuck.
- Dismiss a hint when the corresponding action succeeds or it becomes irrelevant. Do not block other controls, silently buy anything, repeat an unaffordable suggestion or pause scoring automatically to display a hint.
- After the first installation confirmation, suggest hiring only when one developer is busy, another build is waiting and hiring is affordable (D178 supersedes D166 priority). Keep all purchases available. Explain separate jobs and the ongoing wage. First ordinary maintenance or urgent P1s may interrupt the build explanation; resume from the actual current state.
- Show the purchase price and hiring wage before spending. Show affordability and capacity limits clearly. Explain cash-target progress honestly: spending can move it backwards.
- Keep the opening explanation and contextual hints; there is no separate Help or Pause & plan control (D174). Cancelling Restart resumes the run; first-action and hesitation help can remain available, especially for a different visitor on the same event device.
- Keep the net-income display truthful throughout coin flights. The animation illustrates a real income change; it must not create a fictional bonus or imply that coins need collecting.

The complete journey includes a scoreboard branch so the intended experience is reviewable. Public V3 rankings remain a separate scope choice; the first prototype can exercise this journey with local results. Do not submit V3 scores to Speed's ranking or show invented live ranks.

### Evidence and how to test this journey

[Andersen et al., CHI 2012](https://grail.cs.washington.edu/projects/game-abtesting/chi2012/) compared eight tutorial designs across three games with over 45,000 players. Tutorial effects depended on complexity: engagement improved in the most complex game but not significantly in the two simpler games. This does not prove that V3 needs no guidance or that this particular flow works. [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/include-interactive-tutorials/) recommends teaching through interaction in gameplay context to reduce the memory burden of a separate instruction screen. That is professional guidance, distinct from experimental evidence.

Our application is to keep the opening light and pair help with the action it explains. Test first-time visitors without verbal coaching, including people who skip every optional explanation. Observe whether they can start, make an intentional purchase, recognise a queued build, understand lost income and developer maintenance, and identify the cash goal and victory. Record hesitation, mistaken repeated clicks, requests for help, first-purchase time and completion time. Ask afterwards what they thought hiring and Recon changed; visible action alone does not establish understanding. Test spectators, reduced motion and repeat runs too. Compare cue variants if confusion persists; neither reading rates nor simulated balance demonstrates successful onboarding.

### V3.3 implementation choices

D178 replaces the earlier expiring lesson sequence. Show one event-based lesson and one visual focus at a time, following the first purchased system. Action hints remain while relevant or until dismissed. Installation and outcome confirmations count visible active exposure; urgent interruptions do not consume that exposure. The first real Recon repair receives a factual handoff explanation, including when Recon was bought early. Feature completion is explained after the first build confirmation; Plus advice needs installed Recon, a repair bottleneck and affordability. Hide guidance affects only presentation for the current run, resets on replay, and never removes essential status or purchase receipts. No lesson pauses gameplay or blocks victory.

The result headline is **“Peak productivity reached!”** (D170). This frames the celebration around productivity; the existing spendable-cash threshold still determines victory. Victory immediately freezes the game. A separate six-second presentation clock parks carried props, puts tools down and runs a brief worker dance before a static happy pose. Reduced motion shows the final pose directly. The result and replay actions stay usable throughout. The experience is silent under D174; the visual journey communicates all information without sound. Results show real run facts and do not submit a public score.

### V3.4 opening feedback

D164 removed the live demo and D178 shortened the opening. The owner rejected D189’s four-stop banner tour as slow, cluttered and too instructional. D190 replaces it with three brief location pointers, two seconds apart: systems, developers and game controls. Use the exact simple labels in the journey table, with clear outlines and adjacent text; dim other areas. There is no introductory Recon explanation or mechanics copy. D191 restores the original waiting welcome modal with a prominent sage-green Get your intro button (D194). It hides the workshop until clicked and stays idle indefinitely. D192 expands the first highlight to the whole ecosystem, labels it “Your ecosystem” and holds it for three seconds; the other pointers remain two seconds each. The click runs this seven-second sequence, then the three-second countdown automatically; there is no second start/skip control. Refresh, Start fresh and Play again return to the welcome modal. The run clock starts only at GO, ten visible seconds after the initial click. Hidden tabs/restart hold progression, resuming gives the current pointer its full three- or two-second duration, and reduced motion replaces the purchase pulse with a static outline. D194 aligns the welcome and pointers with the owner’s reference: sage-green action/highlight accents, cream labels and dark neutral surfaces, with a flat button treatment. Existing first-build guidance, feature gating and economy remain unchanged.

## Ecosystem, workplace and movement

The ecosystem grows into four uneven, softly grouped islands with stable reserved destinations. Recon has a dedicated central clearing: the nearest system housing is 46 world units away, up from 11 in the previous layout. Cross-island dependency wires curve above the tower; loaded western routes pass below it, keeping cargo clear of the radar and repair bays. The world remains 1,180 units wide and now has 535 units of height; all trips charge their actual distance at the existing speed. This implements the owner’s V3.4 spacing/cluster feedback (D163). Shared hubs, such as identity, can visually link several systems. These links show relationships; they do not simulate cascading runtime failures. A broken system's connections dim while the other systems continue earning.

Each developer has a personal workbench on the right. A shared backlog column appears beside the workbenches only after D178 feature release; its space stays reserved to prevent layout movement. All developers collect cards from its top and take them to their own desk; there is no per-developer backlog. The four-developer cap remains. A brief idle transition separates jobs; developers also remain available before D178 feature release. Blue cards, bench parts, a desk completion cue and system bonus counters distinguish features from larger system builds. Use a small original stylised human mechanic, with readable posture and tools rather than an emoji. Exact artwork remains open. The THX/Tex repair scene was welcomed as a performance reference for expressive hands-on work, not as a character design to copy.

Every purchased system has a reserved cluster position and intended connection targets. After bench assembly, the assigned developer visibly leaves the bench and follows a continuous route to that exact installation position. Keep the destination stable during the journey and separate from other active build destinations. Maintenance journeys likewise end at the actual broken machine. Exact placement and route algorithms are implementation choices; manual placement is not required.

The developer **carries the machine on their back**, bending forward under a load roughly two to three times their size. Preserve the visible head, body and feet. Lift/set-down poses and weighty steps should communicate playful effort without introducing additional workers, equipment purchases or hidden gameplay delays.

## Recon visual centrepiece

Recon is the most visually distinctive machine: slightly larger and more high-tech than ordinary systems, while sharing their chunky construction style. Place it prominently as a central feature of the composition, with a rotating radar sweep above three visible processing positions. Show issue blips/pulses and readable job pickup, progress and completion. Base Recon processes one job; Plus processes three concurrently. The remaining positions must not imply active capacity before the upgrade.

The first owner playtest found the MVP centrepiece underwhelming and its small progress bars difficult to recognise as processing slots. V3.2 must make Recon visually distinctive and make each slot’s purpose clear at a glance (V3-F002–003). The V3.2 implementation uses three numbered bays with system names, real repair percentages, moving job tokens and completion checks. Ongoing jobs keep their bay until completion. Preserve clear idle/active/locked states and the real one/three-job capacity.

The sweep communicates monitoring; it does not introduce a separate scan action or make jobs wait for the beam. Actual failures, queue ownership and repair completion drive the feedback. Preserve immediate takeover and partial-progress retention. V3.2 uses a chunky sage tower, circular radar and vertically stacked bays; the owner accepted this artwork when requesting V3.3; keep worker routes clear and provide a reduced-motion equivalent. The earlier spatial study used a right-side Recon placeholder. Current V3.4 geometry and browser checks cover the central radar composition; human readability remains for review.

## Purchase shelf

Replace app-style purchase rectangles with a small workshop supply shelf, distinct from the ecosystem's visual-only system nodes. The owner accepted this game-like direction:

| Purchase | Shelf representation | Purchase feedback |
| --- | --- | --- |
| Hire developer | A recruit/character figure | Show the new developer arriving at an available workbench. |
| Build system | A crate of construction cubes | Send a job into the shared queue; assembly starts only when a developer is available. |
| Buy Recon | A miniature radar unit | Activate the Recon centrepiece and its first processing slot. |
| Upgrade to Plus | An expansion module | Make the three-slot capacity change visible. |

Show persistent **Systems N/12** and **Developers N/4** badges on Build system and Hire developer (D176). Systems count installed, building and queued purchases; developers count the whole team, not only free workers. Counts update on purchase, stay legible when unavailable or full, and reset on a fresh run. They indicate remaining growth capacity, not mandatory victory targets. Associate each badge with its button for assistive technology.

Use one click per purchase, with a clear short action label and gold-piece price. Include the recurring wage in the hire information. The props must remain easy to recognise as controls: consistent hover/focus feedback, visible affordability/cap states and accessible button semantics. Purchase animation must follow successful spending once, without duplicate charges, extra confirmation dialogs or required dragging. Keep the shelf separate from movement routes so the world remains readable.

D178 coordinates purchase emphasis with the active lesson. During guidance only the current target receives a purchase highlight; an affordable Recon or Plus remains available without competing glow when another lesson is active. Outside an active lesson, eligible Recon uses mint lighting and Plus uses gold lighting/sparkles as in D167. Remove effects when no longer affordable or after purchase. Hide guidance restores the ordinary eligible upgrade emphasis, while essential receipts and keyboard focus stay visible.

References researched for this direction: [Kingdom Two Crowns](https://kingdomthegame.com/kingdom-two-crowns/) for its minimal building/recruitment game and coin economy, and [ISLANDERS](https://store.steampowered.com/app/1046030/ISLANDERS/) for selecting buildings from an inventory. [Thronefall](https://store.steampowered.com/app/2239150/Thronefall/) is an additional reference for streamlined kingdom-building. The supply shelf and its four props are our adaptation, not a claim that those games use this exact interface. V3.2 implements original SVG shelf props, recruitment greeting and activation outlines; further art polish remains open to review.

## Animation guide

| Scene | Settled direction | Visual details still to explore |
| --- | --- | --- |
| Queue and assembly | A purchased system waits for a developer, who assembles cubes at their workbench, like Lego. One developer per build. | Waiting-job appearance, individual cube placements, building posture and idle performance. |
| Feature work | One shared column of blue New feature cards; fetch from its top and build at the personal desk. On completion, show the receiving system name at the desk and highlight its feature count. No developer delivery walk. | Pickup and return travel consume real time. Preserve paused cards/parts and progress when builds or repairs need the developer. Walk to the saved position before resuming; the cue must not create extra work or delay income. |
| Delivery | Developer lifts the oversized machine onto their back, leans forward, walks to its reserved spot, sets it down and connects its links. | Exact proportions, gait, lift/set-down motion and clear routes through clusters. |
| Going live | Installed machine lights up and starts earning. Developer grabs a gold piece and tosses it towards the income-per-second display, then heads to the next queued repair or returns to the bench. | Coin shape and arc; proposed arrival bounce, display pulse and rate count-up. Coin flight illustrates the rate change, not a bonus payment or delayed start of income. |
| Failure | Ordinary failures: an anchored machine flickers, moving parts stop and its front panel drops open. It stays in the web with its links attached. Only that system stops earning. | Timing and sound treatment; proposed worker shoulder slump/head shake when taking the maintenance job. |
| P1 emergency | Fire and a P1 badge remain on the anchored failed system until repair completes. Show the paused build at its bench or saved carry position, the responding developer and the walk back to resume. | Gentle flame motion with a static reduced-motion equivalent; no extra damage, spread, repair duration or cost. |
| Repair | Developer walks over, works inside the open panel with a simple tool/hammer action, closes the panel and restores the machine's light and operation. | Tool performance, arrival pose and completion gesture. |
| Recon processing | Prominent chunky radar centrepiece with a rotating sweep, issue blips and three processing positions; one or three jobs active according to tier. | Housing, job representation, pickup and processing performance; preserve route clearance and reduced motion. |
| Takeover and return | Developer immediately breaks off, makes an expressive turn and walks back. Preserve repair progress. The turn-around itself communicates the handoff. | Walking versus mid-repair turnaround poses; no additional handoff banner is needed. |
| Completion | Cash-target victory freezes the original result, followed by a worker dance/party and results/replay. | Exact choreography and duration; keep results actions usable and offer reduced motion. |

D181 / V3-F023 makes the finish title time-based: “Peak productivity reached!” strictly below three minutes; “You built a healthy company!” at three minutes or longer. Use the frozen result time. The three-minute cutoff is a benchmark-informed first trial, not an extra win condition or a compulsory automation purchase.

D180 / V3-F022 adds visible alternating steps, distinct boots and a small body bob during actual travel, including carrying. Stationary work does not walk. D185–D186 replace the green developer caps with a mixed crew: short, side-parted brown hair and tied-back brown hair. The second and fourth developer slots use the female character variant; each appearance remains consistent during work and celebration. Working faces are focused, feature work smiles through collection and assembly and for two active seconds after a completion by that developer. Repair travel/work takes precedence with a concerned expression; celebration smiles. The celebration uses a gentle bounce and raised arms, with grounded tools clearly separated from feet. These are presentation changes only: retain routes, travel speed, job timings, frozen results, hidden-tab hold and static reduced motion.

D183/D187 / V3-F024 adds a coffee welcome after buying Recon. A distinct waiter enters from the bottom-right with a tray, serves one coffee at each developer desk occupied at purchase, and leaves. Every later hire queues a separate one-cup visit after any existing round finishes, preserving earlier cups. Plus does not trigger another visit. Coffee remains until replay. This decorative sequence follows active simulation time, holds with restart/hidden tabs and has no economic or work effects. Reduced motion omits the moving waiter and shows the cups at the scheduled delivery moments. Victory settles all cups and removes the waiter.

D188 / V3-F026 adds a champagne waiter beside the result crew only when Recon was bought. He enters, pops the cork and holds a happy pose on the existing victory presentation clock. Keep results frozen and replay available. Reduced motion uses the final static pose; hidden tabs hold the sequence. No-Recon finishes keep the developer celebration alone.

D184 / V3-F025 smooths visible developer and waiter travel between the existing 50ms simulation updates. Interpolation is presentation-only; pause, hidden tabs, reduced motion and victory settle at the actual state without an ongoing transition.

Animation reflects the real job state. A partially repaired job can take less than the full Recon repair duration; do not discard progress or secretly delay completion to lengthen a scene. Include lift, installation and coin-release gestures in the selected phase durations rather than adding unaccounted worker time. Coin flight can continue visually during the return journey. Its destination display must settle on the actual income rate, including simultaneous failures/completions.

Choose clear visual priorities when several events happen together. Preserve destination stability, reserved control space and reduced-motion equivalents. The key observer test is whether someone who does not touch the controls understands who builds, why building slows, and how Recon helps.

## Prototype tuning candidate

These values use **D175 maintenance tuning** (32/24 seconds), with the **P1 candidate** under D161 and **desk feature candidate** under D162/D165. Feature values are prototype defaults for this trial, not independently agreed final balance. The 20% severity rate is an implementation choice for playtesting, not an owner-selected frequency. See the [maintenance comparison and evidence](docs/analysis/v3-maintenance-review.md) and [current benchmark](docs/analysis/v3-mvp-benchmark.json). D175 restores the original 180/260 prices after the 600/680 trial felt too expensive, and modestly increases maintenance frequency while preserving automation effectiveness. The pre-trial mixed-strategy median was about 2:23; current trial timings are recorded in the benchmark. D175 changes no-Recon pacing too: the hire-first median moves from 144.925s to 154.775s. The exact interval choice remains for owner playtesting. This is simulation evidence, not final balance or human pacing validation. Ordinary bench-to-system path lengths give 1.45–10.65-second walks (median 5.40); P1 detours follow the shortest connected workshop aisles at the same speed, so four–six seconds remains typical guidance rather than a guarantee.

| Setting | Candidate |
| --- | --- |
| Start | One working system, one developer, 90 credits |
| Maximum systems / developers | 12 / four |
| System purchase | 45 credits |
| Developer purchase / wages | 55 credits / 0.35 credits per second |
| Working / failed income per system | Three credits per second / zero |
| Assembly | Five seconds at the workbench |
| Outward delivery or maintenance walk | Four–six seconds, according to distance, with consistent walking speed |
| Installation / activation | One second |
| Return walk | Four–six seconds |
| Construction totals | 10–12 seconds until income begins; 14–18 seconds of developer occupation including return, excluding queue wait |
| Developer repair | Six seconds plus actual travel; direct repair chaining avoids an unnecessary desk return. The previous 14–18s estimate describes a typical isolated bench round trip |
| Recon / Plus purchase | 180 credits / another 260 credits (D175, original prices restored); Recon required before Plus, no recurring fee |
| Recon / Plus capacity | One / three simultaneous jobs |
| Full Recon repair | Four seconds, including pickup, progress and completion; no travel time |
| P1 frequency | Seeded 20% chance per failure after the first ordinary opening failure. Severity uses an independent deterministic hash; it adds no failures and does not change the threshold random stream. |
| Feature release | Four active simulation seconds after the first purchased system is installed. Independent of guidance visibility; no feature work or feature income before release (D178). |
| Feature timing / value | After release, 0.75s idle transition before fetching; real walk to/from the shared top pickup area, 0.35s pickup and 3s desk assembly (systems: 5s). No feature installation/delivery phase. Completion adds 0.25 credits/s while the target works. No extra purchase fee; wages continue. |
| Feature destinations / supply | Randomly choose an installed system at completion, using a seeded stream independent of maintenance randomness. Broken systems are eligible, but their new bonus earns nothing until repaired. No in-flight target reservation. The shared backlog replenishes indefinitely and bonuses stack. |
| Feature priority | All builds and repairs preempt features. Prefer idle developers before interrupting a feature. Preserve pickup/assembly progress, card ownership and the actual paused position, including when a P1 interrupts a build already holding a paused feature. Developers away from their desk walk back before building a system; repairs begin with travel from their actual position. |
| Maintenance frequency | Nominal 32 operating seconds when young, reducing to 24 at maturity; ±15% seeded variation (D175 trial) |
| Ageing plateau | After 90 seconds |
| Opening maintenance event | Around 20–25 seconds into the run; not a defined per-system grace period |
| Cash target | 1,200 spendable credits |

The construction/return cycle delays early revenue and future builds; D168 removes the desk detour when the next queued task is a repair. Test purchase payback, idle waiting and different team sizes, rather than compressing animations solely to retain these numbers. Arrival rates, bursts and peak age must leave Plus useful spare capacity. Long-term capacity is a design check, not an extra player victory condition.

Route geometry and walk duration must agree. A fixed walking speed on paths of different lengths cannot guarantee that every trip takes four–six seconds. Treat this range as the desired typical journey; check actual paths before finalising world scale and timings. The loaded gait can express effort without silently changing simulation speed.

## Layout feasibility study

See the interactive [spatial study](docs/analysis/v3-layout-study.html) and [measurement notes](docs/analysis/v3-layout-review.md). It compares 2.5× and 3× machine height with four workbenches, four developers, three Recon slots, 12 system positions and reserved purchase/HUD space. This is a static layout study using schematic artwork, not the game or a completed animation. Its rectangular purchase placeholders and right-side Recon area predate the accepted shelf and central radar direction; recheck the composition when those are designed.

Start visual development around 2.5× machine-to-developer height. Treat 3× as a stress case. At compact desktop sizes, preserve the worker silhouette and route clearance before adding decorative detail. The ratio describes a consistent sprite-height convention; it does not mean two to three times the width and height of the combined carrying pose.

## Current automation prices and maintenance trial

D175 restores Recon to 180 credits and Plus to another 260 after the owner revised their acceptance of the 600/680 trial. Increase maintenance modestly with nominal operating intervals of 32 seconds for young systems and 24 for mature systems, previously 36/26. This raises nominal hazard by 12.5% and 8.3%; actual failure counts also depend on downtime and purchases. The first failure stays at 22 seconds. Keep current repair speed and one/three-bay capacity.

The exact 32/24 intervals are a playtest candidate chosen within the owner's request, not yet accepted tuning. D172's proposed stronger, pricier Plus remains closed. See the [updated price and maintenance review](docs/analysis/v3-price-trial-review.md).

## Remaining choices and working recommendations

| Topic | Recommendation or next design work |
| --- | --- |
| Recon upgrade structure | Require Recon before Plus; no recurring Recon fee initially. Candidate defaults, not independently confirmed final economy rules. |
| Age clock | Start ageing on installation, advance with active simulation, and do not reset age on repair. Keep age progression distinct from the operating-time failure interval. Recommended default. |
| Gold-state meaning | Omit an extra gold system-status tier initially. The gold piece is an income cue, not permanent automation coverage. Recommended default. |
| Public scoreboard | Begin the prototype with local finish time and retry; defer public V3 rankings until the rules settle. Recommended scope. |
| Artwork and motion | Refine the developer/workbench, radar housing and slot performance, purchase shelf props, routes, simultaneous events and victory scene using the guide above. |
| Numeric tuning | Validate the candidate table, cash target, system cap and any medal thresholds together. |

Cash-shortage testing exposed a brief deficit after legal late purchases. On 2026-10-20 the owner approved a visible negative balance with continuing wages and work for the MVP. Purchases still require enough cash. The original 21-second spending burst is now solvent with desk features. The earlier seed-200 paid deficit no longer occurs under D175. Current benchmark routes remain solvent; an isolated low-cash failure fixture verifies continuing wages/work and recovery. The shortage rule is unchanged. Bankruptcy and developer-removal recovery are not part of the agreed MVP.

## Evidence and validation

### Research-informed rationale

Earlier research supports investigating visible agency, useful choices and learnable challenge; it does not establish that this game is fun or determine its ideal tuning:

- Ryan, Rigby and Przybylski studied perceived autonomy/competence and enjoyment: [The Motivational Pull of Video Games (2006)](https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf).
- Klimmt, Hartmann and Frey studied perceived influence and enjoyment: [Effectance and Control as Determinants of Video Game Enjoyment (2007)](https://journals.sagepub.com/doi/10.1089/cpb.2007.9942).
- Brändle, Wu and Schulz examined difficulty, expectations and engagement: [Leveling up fun (2025)](https://www.nature.com/articles/s41598-025-14628-2).
- Tyack and Mekler caution against shallow applications of self-determination theory: [Self-Determination Theory and HCI Games Research (2024)](https://arxiv.org/abs/2405.12639).

Our design hypothesis is that visible construction/maintenance trade-offs and investment payoffs can support enjoyment. Risks are passive waiting, an obviously dominant purchase path and unreadable overlapping motion. These require human observation, not just simulated finish times.

### Existing sandbox is experimental evidence

The [sandbox guide](experiments/v3/README.md) links reproduction commands and recorded results. Its 144 strategy runs, 77 mature-capacity runs, nine engine tests and two browser routes apply to an older experimental configuration. They do not validate this specification's cash goal, economics, queue, delivery or animation timing. Recorded production tests/build results likewise are not proof of an implemented V3 mode.

Before using that sandbox for current balance, align its victory rule, shared arrival-order queue, zero failed-system income, purchase set, construction/delivery/return phases and candidate costs/timings/caps. Keep old benchmark files as clearly identified evidence, not proposed defaults.

### Next validation pass

1. Align a playable prototype/sandbox with the agreed mechanics and an explicit candidate configuration.
2. Compare saving, expansion, hiring and automation routes, including no-Recon wins. Record cash-target time, system count at victory, workers hired, purchase timings, job occupation, idle waiting and cash shortages.
3. Test fully aged maximum load and bursts independently of the short player run. A quick cash win does not prove sustainable maintenance capacity.
4. Validate animated routes and dense states at desktop/laptop sizes, including multiple simultaneous carries, open repair panels, coin flights, paused scenes and reduced motion.
5. Observe unassisted players and bystanders. Check whether they understand the story, can explain their purchases and want another run. Tune medals only after relevant play evidence.

## Project records

- [Decision register](DECISIONS.md): current V3 decisions D133–D178.
- [Delivery tracker and feedback backlog](V3_DELIVERY.md): slice scope, status and next work.
- [Handover](HANDOVER.md): implementation status and next steps.
- [Sandbox](experiments/v3/README.md): experimental code and historical results.
- [Human playtest approach](HUMAN_PLAYTEST.md): reuse the observation approach, not Long Game's durations or targets.

The animation-led venue direction and candidate revision were recovered from voice chat `01a15a06-5900-7693-91f4-c2dea8165224` at the owner's request. Later accepted choices are consolidated above. V3.1 implementation choices, simulation results and verification are recorded in the delivery tracker and MVP review. Historical sandbox and spatial-study results remain separate evidence.

## Guided first play implementation

D178 / V3-F021 is implemented and accepted by the owner (D179). See [the reviewed plan](docs/analysis/v3-onboarding-plan.md) for flow, alternate routes and acceptance checks. Use muted blue-grey backlog cards, borders and carried parts; retain readable labels and a brief actual completion cue. The refreshed benchmark records the changed early income and task allocation; the owner accepts the slower saving-only route. See the [game design assessment and delivery log](V3_DELIVERY.md#owner-assessment-log--v34-game-design-goal-achieved). Unassisted newcomer comprehension remains to be tested.
