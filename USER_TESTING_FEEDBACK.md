# Active Animation user testing feedback

Collect peer feedback on Recon — Active Animation before deciding how to process it. Preserve what people liked, what confused them, and what they would change, including differing views.

## Collection status

- Started: 21 October 2026.
- Status: Collecting feedback. The owner will confirm when all feedback is in.
- Source: The owner will paste peers’ feedback into this chat.
- Feedback submissions recorded: 1. Participant attribution pending.
- Expected participants: To be recorded as names or aliases are provided.
- Shared URL and tested version: Not yet recorded. Add these when available; do not assume every peer tested the same build.

## Feedback register

Assign each distinct point a stable ID starting at UT-001. Keep related points linked to the same participant and response. Preserve independent reports of the same issue so recurrence remains visible.

For each point, record:

- **Participant and date:** Name or alias, plus the feedback date when known.
- **Context:** Player or spectator; device/browser and tested version if supplied.
- **Original feedback:** Keep the peer’s wording. Label an owner paraphrase as a paraphrase.
- **Observation or request:** A concise account of what happened, what worked well, or what the peer wants changed, without assuming a cause or solution.
- **Evidence:** Any supplied screenshot, recording, example or source link.
- **Open questions:** Only the missing details needed to understand the point.

Use “Not provided” for missing context. Peer reports remain reported experiences until separately verified.

### UT-001 — Explain the first steps with a simple welcome tour

- **Participant and date:** Participant not provided. Received through the owner on 21 October 2026; original feedback date not provided.
- **Context:** Player or spectator, device/browser and tested version not provided.
- **Original feedback as supplied:**

  > Voeg een welcome tour toe dat heel simpel de componenten/gameplay uitlegt in eerste stappen? Is wat veel in 1x om mee te zijn.

- **Observation:** There is too much to take in at once when starting the experience.
- **Request:** Add a simple welcome tour that introduces the components and gameplay step by step during the first actions.
- **Evidence:** Feedback pasted in this chat; no screenshot or recording supplied.
- **Open questions:** Which components or first actions were difficult to understand?
- **Status:** Plan refined during the owner's voice review on 21 October 2026: combine softer blue feature styling with delayed introduction of the backlog and feature work after the first purchased system is installed and its income moment is shown. Implemented on `codex/guided-first-play` as D178 / V3-F021 and accepted by the owner in the local playtest (D179). The owner is happy with the later backlog, screen use and highlight timing, accepts the saving-route balance change, and wants to keep the subtle guidance. See the [Game design goal achieved log](V3_DELIVERY.md#owner-assessment-log--v34-game-design-goal-achieved). Validation with an unassisted newcomer remains pending.
- **Plan:** [Plan voor de eerste stappen in Active Animation](docs/analysis/v3-onboarding-plan.md).

#### Comparison with invisible tutorials

Reference: [How to Design a Game That Teaches Itself](https://www.aigamebuilders.com/blog/invisible-tutorials-game-design/). The article advocates constrained first actions, gradual introduction of mechanics, visual teaching and recoverable mistakes.

Historical assessment before D178 implementation, rather than a new observation of the shared deployment:

- The opening explains building, income, hiring, wages, failures, P1s, Recon and features together. All four purchase cards and the full statistics panel appear when play starts (`src/V3Game.tsx`).
- The existing build, installation, breakdown and repair animations provide useful visible consequences. Contextual guidance already responds to actual events (`src/V3Board.tsx`, `src/v3Guidance.ts`).
- The hire hint can supersede the build acknowledgement while the first build is unfinished, once hiring is affordable. Most teaching hints expire after seven or eight active seconds; expiry does not establish understanding (`src/v3Guidance.ts`).
- A developer can start feature work after a short idle delay, before the visitor has made a first purchase. The initial system's failure is scheduled at about 22 active seconds, independently of the visitor's onboarding progress (`src/v3Game.ts`).
- Ordinary repairs are automatic, the opening failure is not a P1, and a negative balance does not end the run. However, the countdown and instruction to reach the target as fast as possible can make initial exploration feel pressured. This is a design hypothesis to test with newcomers.

Proposed direction for discussion: guide the first build through installation and visible income before shifting attention to hiring; explain maintenance when it occurs and Recon when its benefit can be seen. Introduce Plus and feature details later. Preserve alternative purchase strategies and the spectator experience. The subsequent voice review selected delayed feature work for the first implementation, alongside softer feature colours. This changes early balance and requires a new benchmark; first-failure timing remains unchanged.

Validation question: Can an unassisted newcomer explain what their first purchase changed, what a failure does, and what Recon takes over? Completing the run alone would not answer this.

## Processing after collection

Collection remains open. The UT-001 design response is implemented and owner-accepted; its effect on unassisted newcomers still needs observation. Broader grouping and prioritisation still await confirmation that all feedback is in.

## Related project records

- [Current experience specification](V3_MODE.md)
- [Delivery history and existing owner feedback](V3_DELIVERY.md)
- [Human playtest notes](docs/analysis/v3-human-playtest.md) — an earlier observation guide; some prompts refer to controls since removed.
