# Speed Game design and implementation plan

Date: 2026-10-12\
Status: First implementation complete locally; automated engine and browser checks pass. Human playtesting remains.\
Upgrade view approved: 2026-10-12, including in-card system selection and cheaper purchases above the model tree.\
Scope: Replace the existing Speed Game experience. Leave Long Game behavior, presentation and tuning unchanged.

This document records the approved redesign and its implementation checklist. [SPEED_MODE.md](SPEED_MODE.md) describes the implemented rules and links to current calibration. The user authorized implementation on 2026-10-12.

## Healthy recovery and stronger final models (D129, 2026-10-12)

D129: roll back instant golden-map victory. Restore average health ≥90%, each system ≥60%, no overdue/manual work, 35 credits, nonnegative operating income and five stable seconds; both automatic job types must have run. Upgrade final scan/fix job durations from 0.5 to 0.25 seconds and Speed automatic-scan cooldown from 7.5 to 2 seconds. Use quarter-second ticks only in Speed so faster work is real. Keep model prices, incident rate, waves, workers and all Long Game rules unchanged. Show recovery feedback before the restored countdown.

Supersedes D128 golden-map victory.

## Golden-map victory (D128, 2026-10-12)

D128: Speed victory matches the golden map state. All 15 systems must have arrived, been restored and have both scan and fix automation. Health, overdue issues, manual work, credits, prior automatic jobs and operating income do not block victory. Remove the five-second stability trial and its countdown/progress UI. Final-model purchases can finish the run immediately, including while paused; the final restoration can finish it on its completion tick. Preserve frozen results, practice/retry, prices, deterioration, cooldowns and all Long Game rules.

## Doubled deterioration (D127, 2026-10-12)

D127: double Speed system deterioration from the D126 rate, giving a cumulative 3.92× original incident frequency, including first post-restoration grace. User approved halving the Speed automatic-scan cooldown from 15 to 7.5 seconds after unchanged automation failed all 27 benchmark strategies. Keep model prices/benefits, wave timing, damage, the five-second finish check and Long Game unchanged; Long retains its 15-second scan cooldown.

## Additional Speed pressure (D126, 2026-10-12)

D126: increase Speedy Scanner from 175 to 225 credits and Fixing Master from 250 to 300 credits. Raise system issue frequency another 40% relative to D125: the cumulative incident multiplier is 1.96, including first post-restoration grace. Keep intermediate prices, model benefits, waves, the five-second finish check and Long Game unchanged.

## Faster finish and stronger deterioration (D125, 2026-10-12)

D125: shorten the Speed autonomy check from 20 to 5 stable seconds and count automatic scans/fixes already completed during the run, avoiding a wait for another fault. Keep health, coverage, reserve and operating-income requirements. Show a remaining-seconds countdown. Increase recurring system issue frequency by 40% (divide all Speed incident intervals, including first post-restoration grace, by 1.4). Model benefits, issue damage, prices, waves and Long Game remain unchanged.

Supersedes the earlier 20-second trial and incident timings below.

## Doubling waves (D124, 2026-10-12)

D124: replace individual Speed arrivals with doubling waves. Start with Backend; completing its first fix immediately adds two systems, then +4 after 20 active seconds and +8 after another 20. Totals 1 → 3 → 7 → 15. Each wave is free, simultaneous and offline, with existing model coverage inherited. Three groups of five fit the growing map. Add a brief arrival banner and next-wave size/countdown; pause freezes both. Keep models/prices, workers, jobs, incidents, income, trial requirements and Long Game unchanged.

Supersedes the single-arrival timings and twelve-system cap below. The 15-system autonomy target remains the same kind of goal; no new currencies or chapter gates.

## Tripled natural growth (D123, 2026-10-12)

D123: triple Speed system growth from 25 seconds to 25/3 seconds per arrival. Schedule from the previous due time, with a tiny floating-point tolerance, so half-second simulation ticks do not accumulate delay. All 12 systems arrive 92 seconds after first Backend restoration. Pause, models, credits, maintenance and Long Game stay unchanged. All 89 engine tests and production build pass; all 27 fully upgraded policies finish in 121–136.5s. The original duration target is now historical guidance, not verified current pacing.

## Natural arrivals and final-only automation (D122, 2026-10-12)

D122: Speed systems now arrive automatically, using Long Game's sequential scheduled-arrival pattern with a 25-second Speed interval. First Backend restoration starts the timer; all 12 arrive in order, free, offline, with future model coverage inherited. Show only connected nodes/groups; Fit all follows growth and manual camera stays preserved. Remove buying systems and the third opening purchase cue; show the next-arrival countdown. Pause freezes growth. Model prices halved to Scout 50, Specialist 90, Scanner 175, Master 250 cr. Intermediates only improve manual work; Scanner automates scans only and Master fixes only. Both finals are required for autonomy. Cumulative ownership, grey unowned models, workers, maintenance, pressure and all Long Game rules remain unchanged.

Supersedes earlier fixed-map system purchases and intermediate automation below. No chapter gates or new growth-progress currency.

## Combined model ownership and lower prices (D121, 2026-10-12)

D121: all four Speed upgrades can be purchased across both branches, with cumulative benefits. Scout 100 cr; Specialist 180 cr; Scanner 350 cr; Master 500 cr. Keep each final model's own predecessor requirement. Effective stats use minimum owned durations/costs and union of automation; buying another model never removes an existing benefit. Both intermediates provide full automation; Scanner adds 0.5s/2cr scans, Master 0.5s/2cr fixes. Finals are optional. Unowned model logos/details are grey regardless of affordability, owned models colourful; buy buttons still show availability. Base is owned initially. Speed state now stores models[], not a single model. Long Game unchanged.

Supersedes earlier exclusive-branch prices and states below. Current balance and limitations: [SPEED_MODE.md](SPEED_MODE.md).

## Minimal opening (D120, 2026-10-12)

Keep only the bouncing SPEED GAME title, SCAN → FIX → EARN → EVOLVE → EXPAND, and LET’S GO. Remove all opening explanation paragraphs. This supersedes earlier opening copy below; initial pause and guided actions stay unchanged.

## Model identities (D119, 2026-10-12)

Replace heavy model-card surfaces with five colourful, original SVG logos inspired by the supplied circuit/AI references. Use a lavender neural core for Model 1, cool scanning identities and warm repair identities; final models gain orbital autonomy arrows. Keep text names, concise benefits, price buttons and explicit branch states. The rendered gallery is in docs/design/model-logos-preview.png; editable assets are in public/model-logos/. No mechanics changes.

## Model tree on the map (D118, 2026-10-12)

Approved and implemented: replace the Upgrades page and per-system automation with Recon Model 1 → Scan Scout → Speedy Scanner, or Recon Model 1 → Repair Specialist → Fixing Master. Scout automates scanning; Specialist automates fixing; either final model automates both. Each purchase covers current and future systems, including initial restoration. One branch, two purchases; no skip/switch/duplicate or confirmation banner. Current costs are 150 + 900 cr and 250 + 1,100 cr respectively.

Keep the compact tree on the left, ecosystem in the centre and workers on the right. Retain a visible Pause & plan control and paused comparison details. The map stays mounted and preserves its camera and selection. Affordability shimmer moves to model buttons. Group actions keep Scan/Fix only. New automation does not dispatch until planning resumes.

Incident frequency rises smoothly with active-system count and elapsed time, capped at a 40-second interval; no instant four-minute failure. Base-model workload eventually exceeds two workers at full scale. Keep income recovery, existing job charges/queues, deadlines, the autonomy proof, initial CTA guidance and Long Game unchanged.

Current tuning and evidence live in [SPEED_MODE.md](SPEED_MODE.md) and [the D118 review](docs/analysis/speed-game-model-tree-review.md). All descriptions below of a separate Upgrades page, individual automation purchases or a single model purchase are historical and superseded by D118.

## Direct model purchase (D116, 2026-10-12)

Choose immediately purchases and installs the selected model. Remove the confirmation banner and Keep comparing / Install step. Keep the price on the button and state the one-model-per-run rule under Recon Model 1. The installed branch and unavailable alternative remain visible. This supersedes the previous confirmation requirement.

## Opening action cues (D114, 2026-10-12)

Guide Scan → Fix → first system purchase with one gentle CTA pulse at a time. Follow actual job completion and affordability; suppress while paused or working. Highlight the relevant map node when the action is outside the current selection, without moving the camera or choosing for the player. Group actions progress the same sequence. End guidance after the first additional system is bought. Reduced motion retains a static outline. Speed Game only; no economy changes.

## Centred page tabs (D113, 2026-10-12)

Map and Upgrades are prominent, centred page tabs on their own row beneath the metrics, with a raised active surface and underline. Keep the pause icon and true tab/panel semantics; arrow keys move focus and Enter/Space activates. Preserve paused planning, map selection and camera. This replaces the former small side buttons. The opening has only LET’S GO; its Choose another mode button was removed at the user's request.

## Balance display and purchase threshold (D112, 2026-10-12)

Replace the visible credits title with a large gold coin and enlarged balance, retaining accessible text. Remove the additional 20-credit system-purchase reserve after the first activation: Buy becomes enabled at the displayed price. The opening restoration budget remains protected. This supersedes earlier references below to retaining a restoration reserve on every expansion purchase.

## Automation prerequisite removal (D111, 2026-10-12)

Latest feedback supersedes the original fix-first strategy: all models permit scan/fix automation in either order, including group purchases. Remove model/order prerequisites from controls and mechanics copy. Retain ownership, affordability, duplicate-coverage and first-restoration-budget protections.

## Approved interface follow-up (D110, 2026-10-12)

This supersedes the original worker/capacity placement below: show a persistent Workers panel on the map's right, with large worker figures, current jobs/progress, queue count and **Buy worker · 150 cr**. Remove the work-capacity card from Upgrades; keep the existing two-worker limit and shared-job mechanics. Centre and enlarge Scan/Fix below the map and **Back to game · resume** in the paused screen. Remove the map's Automation shortcut. Long Game stays unchanged.

## 1. Intended experience

One broken system sits inside a complete, fixed ecosystem. Scan it, fix it and start earning. Spend income on more systems, optionally upgrade the AI model, and purchase scan and fix automation separately for every system. Win when the entire ecosystem is active and can run autonomously.

The map provides the progression: systems move from unowned to restored to autonomous. There are no chapters, mini-chapters, earned team arrivals or expanding map geometry. Target roughly 5–8 minutes of active play; opening and upgrade-planning time do not count.

## 2. Requirements and planning assumptions

### Confirmed by the user

- Show the whole ecosystem from the start using the Long Game ecosystem's visual language and layout.
- Start with one owned, broken system and enough credits to scan and fix it. It earns money only after restoration.
- Buy additional systems with earned credits. The goal is every system active and autonomous.
- Make the map the main screen, with credits and ecosystem health always visible.
- Move upgrades to a separate tab that replaces the map. Pause the entire game while this tab is open.
- Show a moving magnifier during scans and male/female hammer workers during fixes. Show income with fewer/more tiny coins according to current earning capacity.
- Start with Recon Model 1 and offer a choice between Speedy Scanner and Fixing Master.
- Target Speedy Scanner affordability around 01:30; target the more expensive Fixing Master around 03:00.
- Speedy Scanner is the flexible, safer route. Fixing Master should enable the fastest finishes with strong play, despite the larger saving target. Automation can be bought with Recon Model 1; buying a model is optional.
- D111 supersedes the earlier Fixing Master ordering: either automation may be bought first.
- Scan and fix automation are separate purchases **for each system**, not global coverage purchases.
- Use concise arcade onboarding and a bouncing “— SPEED GAME —” title.
- Present Recon Model 1 above two branches: Speedy Scanner and Fixing Master. Allow only one model upgrade per run.
- Keep upgrade cards brief: model benefits read **3× faster Scanning** and **5× faster Fixing**. Put deeper mechanics behind an optional disclosure.
- Place cheaper automation and work-capacity cards above the model tree. Show automation prices and a **Select System** dropdown within each card; reveal a direct purchase button after selection.
- All changes apply only to Speed Game. Long Game stays as it is.

### Proposed defaults to use for the first prototype

These complete the design where the discussion did not establish an exact rule. Keep them visible as assumptions until confirmed or evaluated in playtesting.

| Topic | Proposed default |
| --- | --- |
| Ecosystem size | Retain the existing 12 systems in three modules. |
| System purchase | Any unowned system can be selected and bought; no chapter prerequisites. A bought system starts offline with a finding that must be scanned and fixed. |
| Model selection | Confirmed: at most one successor model per run. Staying on Recon Model 1 is allowed. No switching or buying both. Explain this before purchase. |
| Automation availability | Confirmed: available with Recon Model 1 as well as either upgrade, subject to ownership and affordability. Remove the current fixed 02:00 unlock and the earlier proposed model prerequisite. |
| Automation ordering | Recon Model 1 and Speedy Scanner allow either purchase first. Fixing Master also allows either purchase first (D111). Proposed transition rule: existing coverage stays enabled when upgrading to Fixing Master. |
| Model effects | Apply globally to that run's manual and automatic jobs. Model ownership never grants free automation coverage. |
| Other upgrades | Replace the separate faster-scan/faster-fix purchases with model choice. The approved view includes work capacity and both automations. A separate scan-efficiency purchase is not part of this first-version view; revisit only through an explicit design decision. |
| Victory | Retain the existing 20-second autonomy proof, adapted to require all 12 systems owned and activated. |
| Time limit | Continue until victory; 5–8 minutes is a pacing target, not a timeout. Recalibrate medals after balancing. |
| Recovery | Preserve a recoverable economy after first activation; do not introduce an unannounced zero-income death spiral. |

Exact prices, income, incident cadence and medal thresholds are tuning outputs, not settled requirements. Affordability times are targets earned through play, not timers that unlock purchases.

## 3. Player flow and interface

### Opening

Show the complete map behind the opening. Do not start simulation or the scored timer until the player selects **LET’S GO**.

Use this proposed copy:

> **— SPEED GAME —**
>
> **One broken system. An entire company to run.**
>
> **SCAN → FIX → EARN → EXPAND**
>
> Restore systems to earn credits. Buy more and automate scanning and fixing on each one.
>
> Buy upgrades in **Upgrades**. The game pauses while you plan.
>
> **Your goal: every system active and autonomous.**
>
> **LET’S GO**

Animate only the title with a small vertical bounce. Keep text and the button still. Stop the bounce after a brief entrance sequence; use a static title for reduced motion. Give the opening proper dialog focus and keyboard behavior.

After dismissal, visually identify the starting system and its Scan action without hiding the rest of the map. Scanning discovers the existing problem; fixing restores operation and starts income. Briefly confirm the consequence: “Backend online · earning credits.”

### Map screen

- Use the available viewport for the ecosystem, beneath a slim header containing credits, health, elapsed time and **Map / Upgrades** tabs.
- Keep owned/active/autonomous counts compact and distinct, for example “Active 5/12 · Autonomous 2/12”. Health is not automation coverage.
- Remove the Speed Game's permanent work-slot sidebar, bottom investment cards, chapter-style guide and arrival ticker. Preserve the information through selected-system controls, a compact capacity/queue indicator and relevant local feedback.
- Keep positions and connections stable. Initial overview and Fit all include all 12 systems; ownership changes never trigger auto-fit. Preserve manual pan/zoom and selection across tab changes.
- Select an unowned node to see purchase cost and expected earning capacity. Select an owned node for Scan, Fix, scan automation and fix automation, with exact prices and unavailable-action reasons.
- Keep group maintenance/automation actions where useful. Group quotes charge each eligible owned system separately and must obey model-specific prerequisites.
- Distinguish unowned, owned/offline and activated systems with labels or icons as well as color. Show degradation independently from activation and gold automation coverage.
- Never label an unowned system as healthy or include it in health averages. An owned, offline system contributes to owned-ecosystem health and must be identifiable as offline.
- Indicate scanning on the affected system. Show the hammer worker only during an actual fix, manual or automatic; queued work has a waiting indicator. Pause work animation when simulation pauses and use a static equivalent with reduced motion.
- Keep the full map recognizable at overview scale, while providing readable selected-node controls without requiring the player to hunt through tiny buttons.

### Upgrades screen

The following layout and interaction were approved through the interactive preview. Keep upgrades visually dominant and detailed strategy information optional.

#### Persistent header and pause feedback

- Replace the map with a full tab panel. Keep credits, ecosystem health, elapsed time and **Map / Ⅱ Upgrades** visible. Put a small pause icon before **Upgrades** on both tabs so the pause behavior is signaled before opening it; use the accessible label **Upgrades — pauses the game**.
- Show a prominent **Ⅱ GAME PAUSED** banner immediately, with **Timer, income and systems are frozen.** Label the frozen timer **paused**.
- Provide **Back to map · resume**. Returning restores the same camera and selected system.
- Purchases deduct credits and change configuration immediately while the game remains paused. No income, jobs, incidents, deadlines or autonomy-trial progress advance during planning.

#### Layout, from top to bottom

1. **Work & automation:** Scan automation, Fix automation, then Work capacity. Use this stable order, progressing from cheaper purchases to the larger capacity investment in the first-version tuning.
2. **AI model:** Recon Model 1 centered above a branching tree connecting Speedy Scanner and Fixing Master. Place both alternatives side by side on supported desktop layouts.
3. **Compare mechanics:** collapsed by default, for players who want to inspect strategy in more detail.

Keep the arrangement stable after purchases; do not dynamically reorder cards as affordability changes.

#### Automation cards and direct purchases

- Each card shows the upgrade name, setup price with **per system**, and a compact coverage count such as **0 / 3 systems automated**. The denominator is owned systems, not the whole map.
- Use a dropdown initially titled **Select System**, with owned systems and their individual quotes, for example **Backend · 40 cr**. Do not show Backend as if it were the upgrade's fixed scope.
- Selecting a system does not spend credits or open another card/panel. It updates the quote and reveals **Buy · 40 cr** within that same card.
- Clicking **Buy** immediately purchases that automation for the selected system only. Update credits, coverage and the selected system's **Enabled** state; prevent duplicate charges.
- Both cards select systems independently. Buying scan automation never implies fix automation, and newly bought systems require their own purchases.
- If a purchase is unavailable, show a short reason beside its disabled button, such as **Need 10 more credits**. Keep enabled systems identifiable in the dropdown.
- Before a system is selected, show a **From … cr** price if eligible system prices differ. After selection, always show that system's exact price. The approved three-system preview uses a single early-tier price.
- Recon Model 1 supports these purchases without a model upgrade. Fixing Master also permits scan automation first (D111).

#### Work capacity card

Show **Work capacity**, its price, **shared capacity**, and the concise benefit **1 → 2 slots**. **Buy work slot** makes the purchase directly. Show the installed state afterwards. Additional tiers are not specified by the approved preview.

#### Model tree and direct purchase

- Root: **Recon Model 1 · Installed**, with **Choose one upgrade · only one per run** beneath it. Connect the root visibly to both alternatives so the exclusive choice is immediately clear.
- Cards show the model name, one headline benefit, and the price action: **Speedy Scanner / 3× faster Scanning / Choose · 150 cr** and **Fixing Master / 5× faster Fixing / Choose · 650 cr** at the candidate prices below.
- Choosing a model immediately buys and installs it for the displayed price. No second confirmation step.
- After installation, mark the chosen branch **Installed**, the alternative **Unavailable this run**, and the root **Starting model**. Enforce exclusivity in the engine as well as the UI.
- Do not imply a guaranteed faster finish from Fixing Master. Its advantage depends on play and still needs balance validation.

#### Optional strategy details

**Compare mechanics** reveals a compact comparison of scan/fix duration, recurring job charges and automation purchase order for all three models. A nested **Automation prices per system** disclosure shows tier prices. Explain shared work slots, one-time setup versus recurring job charges, and how model changes affect new versus already-running work. Keep these details off the primary cards.

The preview proposes retaining existing automation after a model change, applying discounts only to new purchases and giving no refunds. Revalidate this transition rule and its economy before implementation; the older economy model did not evaluate automation bought under Recon Model 1.

#### First-version prices shown in the approved preview

These candidates are now implemented for the first playtest. They are not final human-validated balance.

| Purchase / operation | Recon Model 1 | Speedy Scanner | Fixing Master |
| --- | --- | --- | --- |
| Model installation | Starting model | 150 cr | 650 cr |
| Scan job | 3s · 5 cr | 1s · 5 cr | 3s · 5 cr |
| Fix job | 5s · 15 cr | 5s · 15 cr | 1s · 5 cr |
| Scan automation per system, early / middle / late | 40 / 80 / 120 cr | 40 / 80 / 120 cr | 40 / 80 / 120 cr |
| Fix automation per system, early / middle / late | 70 / 140 / 210 cr | 70 / 140 / 210 cr | 50 / 100 / 150 cr |
| Second work slot | 150 cr | 150 cr | 150 cr |

Each system tier contains four systems. Fix automation remains more expensive than scan automation within the same tier, including with Fixing Master. The preview's 185 credits, three owned systems, 90% health and 01:38 timer are illustrative screen state, not starting conditions or measured route outcomes.

### Finish

All 12 systems must be owned, activated and covered by both automations. Retain the health, reserve, overdue-finding, manual-work and actual-automatic-work checks of the existing autonomy trial unless calibration justifies an explicit Speed Game-only revision.

Show “Hands off · autonomy trial 13/20s” and the precise blocking/reset reason. Do not claim victory from gold coverage alone. Freeze the result at victory; retry resets ownership, model, coverage, camera and clock. Continued practice cannot replace the original result.

## 4. Rules and economy work

### Ownership, activation and income

Represent ownership explicitly by system ID. The former implementation assumed owned/connected systems were the first N repositories. The replacement uses explicit ownership IDs to support arbitrary purchases.

Use distinct selectors for:

- All map systems: always the full organization.
- Owned systems: eligible for maintenance and included in the player's health metric.
- Activated systems: have completed initial restoration and can earn income.
- Autonomous systems: activated and covered by both purchased automations.

A restored system can later degrade without losing its ownership or initial-activation record. Compute Speed Game income from eligible activated systems, rather than granting base income to every visible system. Preserve the Long Game income formula on its existing path.

Unowned systems generate no work, deadlines, dependency penalties or income. Ignore unowned dependency endpoints in operational calculations. Initialize purchased systems' restoration findings on purchase; do not let hidden pre-purchase findings age. Prevent recurring incidents from making the first restoration unaffordable before the first income stream exists.

Show purchase cost plus a conservative 20-credit restoration budget before buying an offline system (Master actually needs 10 credits). Protect enough funds for the first activation against spending on upgrades or another system; validate that permitted later purchases and ongoing costs cannot permanently strand a run. Keep duplicate purchases, automation on unowned systems and invalid actions impossible at the engine layer.

### Model balance

| Model | Initial effect candidate | Intended trade-off |
| --- | --- | --- |
| Recon Model 1 | Current base durations: 3s scan, 5s fix | Teaches manual operation. |
| Speedy Scanner | Scan 3s → 1s; fix remains 5s | Earlier investment and flexible automation ordering. |
| Fixing Master | Scan remains 3s; fix 5s → 1s | Larger investment and a more demanding manual opening, followed by stronger repair throughput. |

These durations are starting candidates, not verified balance. Keep scan/fix job charges separate from model cost and per-system automation setup. Fix automation remains more expensive than scan automation. Additional efficiency or capacity purchases must not erase the model trade-off.

Apply new model durations to jobs when they start. Do not retroactively complete or retime running jobs; queued work keeps its prepaid charge and uses the model in effect when dispatched. Show this behavior consistently in previews and progress indicators.

Benchmark both routes with actual paid actions, including system purchases, maintenance and reserves. Include deliberate saving for Fixing Master: a policy that always buys the cheapest affordable upgrade cannot evaluate this design.

Track model purchase time, activation times, income, health, manual actions, both automation costs, queue pressure, trial resets and finish time. Compare skilled and slower decision cadences, cautious and aggressive expansion, and reasonable mistakes. Target:

- Speedy Scanner becomes affordable around 90 active seconds on its intended route and supports forgiving completion.
- Fixing Master becomes affordable around 180 active seconds on its intended route and can repay its delay with a faster skilled finish.
- Representative successful play fits roughly 5–8 active minutes; later finishes remain valid.
- Waiting without maintenance does not dominate active play, and the safe route remains worthwhile.

Treat simulation results as reproducible balance evidence, not proof of fun. Confirm readability, perceived difficulty and route preference with human playtesting before finalizing medals.

## 5. Implementation sequence

### Step 1 — Isolate the new rules and record the baseline

- Record current Long Game tests and representative desktop screenshots before shared-code changes.
- Define Speed Game ownership/activation/model state, purchase actions and quote helpers in the existing speed rules boundary or a dedicated Speed Game rules module.
- Keep `GameState.speed` as the mode discriminator unless a concrete migration requires otherwise. Avoid renaming unrelated Long Game identifiers.
- Remove Speed Game reliance on earned phase growth and the 02:00 automation gate. Preserve the equivalent Long Game progression untouched.

**Done when:** state transitions and prices are specified in one place; visible systems no longer imply ownership or earnings.

### Step 2 — Implement the paid lifecycle and model routes

- Add system purchase and first-activation handling; start with only Backend owned and broken.
- Adapt health, income, incident targeting, dependency effects, scope quotes, queue dispatch and automation eligibility to the new selectors.
- Add model purchase, meaningful effects and per-system automation ordering. Share eligibility logic between individual and group actions.
- Preserve manual priority, operating costs, capacity, deadlines and the autonomy proof with Speed Game-specific tuning.
- Add focused engine tests as these rules are introduced.

**Done when:** deterministic paid simulations can complete both routes, including arbitrary purchase order and recovery cases, with no free systems or automation.

### Step 3 — Build the fixed map and minimal game shell

- Implemented: reuse ecosystem camera helpers and visual language in a dedicated `SpeedMap.tsx`, using the approved fixed company → three modules → four systems layout. Shared Long Game geometry remains unchanged. Render every system from initial load.
- Separate map-visible membership from actionable owned membership. Add Speed Game-specific node rendering/configuration without changing Long Game defaults.
- Add the slim metrics/tabs header, selected-node purchase/maintenance controls, compact work feedback and worker animation.
- Preserve camera, focus and selection when systems change state or tabs switch. Use SPEED GAME as the displayed title and update the mode entry with the new duration expectation; leave Long Game entry content alone.

**Done when:** the entire map is visible from the start, state changes are legible, controls fit supported desktop sizes, and purchases do not shift the map.

### Step 4 — Implement the upgrade tab and exact pause behavior

- Build the approved card order, in-card system dropdowns and direct purchases, model tree, direct model purchase and optional mechanics disclosure specified above.
- Centralize Speed Game pause reasons: opening, Upgrades and frozen victory. Keep ordinary map inspection live; preserve restart/help behavior unless explicitly revised.
- Flush active time up to the tab-open event, then freeze every simulation subsystem. Clear/rebase wall-clock bookkeeping on resume while preserving fractional active time.
- Keep purchases functional while paused; forbid background simulation dispatch and prevent hidden-tab catch-up for the paused interval.
- Preserve the map instance or lift camera/selection state outside the tab panels. Guard against zero-size layout observers resetting a hidden map.
- Pause the trial and work animation, not just the displayed timer. Repeated tab changes must neither lose earned progress nor create free work or income.

**Done when:** snapshots remain identical throughout a long planning pause except for explicit purchases, and returning resumes from the correct instant and camera.

### Step 5 — Add arcade onboarding and finish feedback

- Implement the concise opening copy, title bounce, reduced-motion behavior and start gate.
- Add first-restoration/income feedback and clear autonomous coverage states.
- Adapt the trial and result views to the new ownership rules. Remove obsolete chapter, joining-team, fixed-unlock and five-minute-only wording from Speed Game.

**Done when:** a new player can identify the first action, income loop, model tab, pause rule and final goal from the opening and immediate feedback.

### Step 6 — Calibrate, replay and document

- Extend `scripts/speed-benchmark.ts` for system purchases and both model strategies; do not reuse the old expansion policy as balance proof.
- Tune the coupled economy, then replay representative paid routes through the real UI. Include realistic decision delays and paused upgrade visits.
- Set medal thresholds only after observing the new completion-time distribution; preserve a finish beyond the targets.
- Run Long Game regression checks and inspect the final diff for shared defaults or unscoped CSS changes.
- Update `SPEED_MODE.md`, the mode section of `GAME_BRIEF.md`, `DECISIONS.md`, `BUILD_CHECKLIST.md` and `HANDOVER.md` with actual implementation and verification evidence. Keep this plan marked with progress rather than treating planned work as delivered.

**Done when:** both routes are demonstrated through paid play, the Long Game regression boundary holds, and remaining balance/UX uncertainties are stated honestly.

## 6. Expected code touchpoints

| Area | Existing files / intended responsibility |
| --- | --- |
| Entry and lifecycle | `src/GameEntry.tsx`, `src/SpeedGame.tsx`: mode copy, start gate, tabs, pause controller, results. Split focused Speed Game components as needed. |
| Rules and actions | `src/speedRules.ts`, `src/game.ts`: ownership, activation, model rules, purchases, income and automation checks. Branch explicitly by mode. |
| System selection | `src/campaign.ts`, `src/organization.ts`: owned/operational selectors and scope membership, preserving Long Game behavior. |
| Map | New `src/SpeedMap.tsx` uses `src/ecosystemMap.ts` camera helpers and fixed preview geometry. Shared Long Game views are unchanged. |
| Node controls | `src/SystemNode.tsx`, `src/GroupNode.tsx` or Speed Game-specific variants: purchase states, model-aware quotes, worker feedback. |
| Upgrades | New Speed Game upgrade panel; retain `src/Investments.tsx` behavior for Long Game. |
| Styling | Scope new styles to the Speed Game root or a dedicated stylesheet. Reuse existing brand tokens. |
| Verification | Speed engine/browser tests, new ownership/model/pause cases, benchmark policies and existing Long Game regressions. |

Implementation: `activeServices` and `scopeRepositories` branch on explicit Speed Game ownership. `SpeedMap.tsx` renders the full organization independently. `CorporateOverview.tsx`, `SystemNode.tsx`, `GroupNode.tsx` and shared map geometry remain unchanged for Long Game.

## 7. Acceptance and verification checklist

### Rules

- [x] All 12 systems exist on the initial map; exactly one is owned and none earn before the first restoration.
- [x] Starting funds guarantee the required first scan and fix; allowed purchases cannot prevent the first activation.
- [x] Scan reveals an existing finding; Fix completes before activation/income begins.
- [x] Arbitrary purchase order works; unowned systems are excluded from health, work, income, incidents and operational dependency penalties.
- [x] Model choice, costs and effects are enforced by the engine, including running/queued-job behavior.
- [x] Recon Model 1 can buy automation without a model upgrade or fixed time gate; Recon Model 1 and Speedy Scanner permit either order.
- [x] All models allow either automation first, individually or through groups; existing coverage stays enabled (D111).
- [x] Each system pays for both automations; model upgrades and new system purchases never grant free coverage.
- [x] All-owned/all-activated coverage, health, reserve and actual automatic work are required for the trial and victory.
- [x] Retry resets the full run; practice preserves the original result.

### Interface and timing

- [x] Opening is concise and identifies Upgrades as a paused planning space; title motion does not move the instructions or CTA.
- [x] Credits and ecosystem health remain visible on both tabs.
- [x] Cheaper automation/capacity cards appear above the exclusive model tree; card benefits stay brief and mechanics details start collapsed.
- [x] Automation dropdown selection changes only the quote; Buy charges exactly once for the selected system without opening a second panel. Different selections, prices, insufficient funds and already-enabled states work correctly.
- [x] Choose directly installs the selected model for its displayed price; the visible one-model rule and engine prevent a second model purchase (D116).
- [x] Map positions, camera and selection survive purchases, work completion and tab switches.
- [x] Worker appears for running fixes, not queued jobs; pause and reduced motion are represented correctly.
- [x] Upgrades freezes jobs, income, incidents, deadlines, health changes, queues, trial and elapsed time, including when the browser is hidden.
- [x] Purchases during pause spend only quoted credits; repeated tab switching causes no catch-up, duplicate ticks or lost fractional time.
- [x] Keyboard users can open systems, buy upgrades, change tabs and return to a meaningful focus target. Disabled actions have understandable reasons.
- [x] Inspect desktop/laptop layouts at 1440×1000, 1280×800, 1024×768 and 800×700, including selected nodes, upgrade comparisons and results. Mobile remains out of scope.

### Balance and regression

- [x] Benchmark both routes with paid actions and realistic decision cadences; retain reports with exact tuning and policies.
- [x] Recalibrate with Model 1 automation, including staying on Model 1, early automation before saving for a model, and carrying scan-only coverage into Fixing Master. Do not reuse the earlier model-gated economy results as proof for these routes.
- [x] Replay both complete routes through the UI: Scanner 473.5s and Master 431.5s, with wallet parity, frozen result, practice and retry. Late finishes and recovery are covered in engine policies/tests.
- [ ] Observe a human late finish and recovery from a reasonable mistake.
- [ ] Human playtesting checks comprehension and fun separately from automated correctness.
- [x] Run `npm test` and `npm run build -- --base=/recon-game/` plus relevant Speed Game and Long Game browser journeys.
- [x] Long Game retains its chapter flow, growth, income/prices, upgrades, automation rules, pause behavior, speed toggle, map interactions and medals.
- [x] Update documentation with actual results; do not cite historical benchmarks as evidence for the redesigned mode.

## 8. Scope boundary

The subsequent user instruction authorizes local implementation of this plan. Publishing or deployment has not been requested.

The planned implementation does not add mini-chapters, an online leaderboard, accounts, save migration, a global automation purchase or a Long Game redesign. Keep existing user assets untouched. Additional mechanics should only be introduced if they are necessary to make the agreed loop playable and are recorded explicitly.

## 9. Implementation evidence

84 tests and production-base build pass. Paid browser Scanner/Master finishes are 473.5s / 431.5s; fixed map, four desktop layouts, paused upgrades, focus/confirmation/quotes and Long Game regressions pass. The dedicated Speed map uses fixed preview geometry with existing camera helpers; it does not modify shared Long Game layout. Worker emoji plus drawn hammer/magnifier are first-version artwork.

Current costs and provisional medals: [SPEED_MODE.md](SPEED_MODE.md). Detailed results, benchmark limits and remaining human observations: [implementation balance review](docs/analysis/speed-game-implementation-review.md). Earlier Python/model-gated experiments are retained as historical analysis, not current evidence.
