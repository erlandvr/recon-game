# V3.3 player journey review

2026-10-20 · local `codex/v3` · Ready for review.

**Historical delivery evidence before D161/P1.** Current interruption rules and verification are in the [P1 review](v3-p1-review.md); the pre-P1 numeric baseline is preserved in [candidate B data](v3-mvp-benchmark-b.json).

The owner accepted V3.2 and requested the third slice. This implements the opening, guidance and local finish portions of D153/D160 while preserving D138 purchase freedom, D144 dispatch, D147 truthful income and D152 purchase feedback. The attract demo and final event validation remain V3.4. Public V3 ranking is not included.

## Implementation

- `StartCountdown.tsx` has an opt-in workshop theme; its default remains Speed's arcade style. Three lamps light during 3–2–1, then GO. The existing hidden-tab hold, three-second start, focus transfer and 0.8-second nonblocking GO remain. Reading and countdown cost no game time. Reduced motion uses static numbers/lamps.
- `v3Guidance.ts` selects a single event-based hint. The first crate cue becomes more explicit after five active seconds without a purchase. Any successful alternative purchase ends that cue. Purchase acknowledgements name the cost and resulting work/wages/bay capacity. The first actual failure explains zero income and the real repair owner or queue. Recon advice requires observed maintenance and affordability; hiring and Plus advice require relevant queues and affordability. Hints are dismissible and expire on active simulation time. Once acknowledged/dismissed, teaching hints do not repeat in that run. Retry resets them.
- `V3Guidance.tsx` stores only presentation history. The cue lives directly below the shelf and highlights its matching prop; failure guidance highlights the actual broken machine. No timer pauses automatically, purchase is forced, charge duplicated or job interrupted. Below-zero cash keeps its existing explanatory message. Paused purchases are acknowledged, while other teaching cues stay quiet.
- Help is deliberate: opening it settles elapsed time and pauses the workshop. It explains the cash goal, four purchases, wages, shared queue, automatic repairs, negative cash and legal no-Recon play. Close/Escape returns focus and leaves planning paused; Resume game explicitly resumes. Native dialog semantics retain keyboard containment. Prices, gross income, wages, net earnings and active time remain visible in the game.
- Results appear at the first cash crossing with the final time, installed systems, hires, automation, earned income, wages, investment and completed repairs. Replay/inspect/mode actions are available immediately. `V3Presentation.tsx` has a separate six-second presentation clock; workers park carried props, lay down tools and dance, then hold a happy pose. The frozen world also uses celebratory poses and warm lighting. No queue, cash, age or score advances. Reduced motion sets props down and shows raised arms without dancing. Hidden tabs hold presentation time too.
- Session-only finish sound is off by default. An explicit Sound toggle reuses the existing opt-in audio hook and its short three-note chime; there is no autoplay or sound-dependent information. Sound and reduced-motion controls are available in the opening and header. No network or score submission is added.

## Evidence

- **126 automated tests pass**, including five new guidance tests: alternative purchases, hesitation/dismissal, actual failure during construction, affordable observed-maintenance advice, paused spending and reset/victory boundaries.
- Production-base build passes.
- Full existing V3 production-browser suite passes. Exact finish time/cash still match candidate B: mixed 2:09.75, hire-only 2:59.75, small-estate/no-Recon 4:51.25 and four developers 4:16.35. Both handoffs, hidden countdown, pause-and-buy, camera retention, negative balance/recovery, frozen results/retry, mode entry and Long entry remain green. No V3 backend requests occurred.
- Speed opening browser checks pass in normal and reduced motion with the default arcade countdown and existing opening guidance.
- Focused journey check: **passes**. The paid three-developer/four-system route buys a fifth system just before victory and finishes at **4:08.90**, with four installed and the fifth still carried. It exercises lamps/hidden hold/GO, first-action escalation, an alternative hire, help pause/keyboard/Escape/focus, actual failure and affordability-gated Recon advice, dismissal, a legal no-Recon finish during delivery, frozen cash/time and unfinished construction throughout the party, opt-in sound, reduced motion, reset and four result sizes.
- Rendered countdown, first action, failure cue, 1024/1280 help, four-developer results and the final 1024px carried-prop celebration inspected. Result controls fit at 1024×768, 1280×720, 1440×900 and 1920×1080. The sound check confirms silence before opt-in and exactly one three-note finish chime; listening quality remains a human check. Screenshots and machine-readable evidence live in ignored `test-results/v3-journey/`; existing paid screenshots are in `test-results/v3-mvp/`.

The delivery-at-victory case uses ordinary paid purchases found through deterministic model replay. No cash injection, forced failure or mechanic change is needed. The resulting fifth system remains unfinished after the party; model and browser cash/time continue to match exactly.

Reproduce against a production preview (substitute its printed port):

```sh
npm run build -- --base=/recon-game/
PLAYWRIGHT_MODULE_DIR=/Users/erland/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules GAME_URL=http://127.0.0.1:5175/recon-game/ npm run v3:journey:browser
```

## Human validation still required

Technical checks establish event/timing correctness, accessible control behaviour and viewport bounds. They do not prove that a novice understands the game or that the party feels satisfying. Use the separate [V3 observation sheet](v3-human-playtest.md); no human sessions were conducted for this slice. Safari, physical trackpad use, listening evaluation and a full accessibility audit remain unperformed. Existing balance limitations for slow strategies remain documented; this slice does not retune them.

No merge, push or deployment was performed. V3.4 is the next slice after owner review; do not advance automatically.
