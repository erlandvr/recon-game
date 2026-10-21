# Shared scoreboard plan

Updated: 2026-10-19\
Status: D131 replay verification is live as of 2026-10-19. D132 restores one ranking for existing and new D129 scores at the owner’s request; verification remains required for new submissions.

Connection verified: 2026-10-13. The `recon-game` project is active in Momos, EU `eu-west-1`. Anonymous sign-in, database migrations and the submission endpoint are configured and verified. Local and GitHub Pages build settings are present. Operations: [supabase/README.md](supabase/README.md).

## Purpose and confirmed direction

Let players on different computers and browsers compare completed game results through a shared scoreboard stored in Supabase. After finishing, players can optionally enter a name and save their score. There is no name request before playing and no automatic result submission.

This records shared results, not resumable game progress. Previous unsaved games cannot be recovered. The scoreboard represents players who choose to submit a completed result, not everyone who has opened or played the game.

## Implemented first release

Speed Game ranks the fastest time to full autonomy. Long Game remains outside this first implementation. D131 uses `speed-d129-verified-v1`, matching the D129 healthy-recovery rules and quarter-second simulation while requiring server replay. Earlier `speed-d129-v1` results share the same public ranking.

### Finish and save

Keep the existing victory summary and add a compact section:

> **Add your score to the scoreboard**\
> Name or nickname: [________________]\
> Your name and finish time will be visible to everyone.\
> **Save score** · **Skip**

- The whole step is optional. A nonblank name is required only when choosing Save score; skipping does not create an anonymous entry.
- Trim surrounding whitespace and accept 1–30 characters. Support ordinary international names and render them as text. Validate the same restrictions on the server.
- Save the original frozen victory result, even if the player subsequently continues practising. Practice must never create a new result or improve the recorded finish.
- Keep Try again, Continue practising and Choose game mode available. Reopening the result can offer saving again if it was skipped.
- Show Saving while a request is pending and Saved only after the backend confirms the stored result. Offer View scoreboard after success.
- A repeated click, reopened result, response lost in transit or retry must not create another entry for the same run.
- Failed saves retain the opted-in submission locally for retry, including after reload. Provide Retry and Discard; do not publish later without a deliberate retry. Local retention begins only when Save score is selected and does not restore gameplay.
- Once saved, the player cannot change that entry in the first version. An operator can remove an unwanted entry through Supabase.

### Scoreboard

Offer View scoreboard on the mode-selection screen and within the finished Speed Game result. Use the existing Recon typography, colors and dialog patterns. Support desktop/laptop keyboard and pointer use.

Display rank, name, precise finish time, medal and date. Show the newest submitted result with a clear highlight and its rank, even when it falls beyond the first page. Provide pagination and Refresh, plus explicit loading, empty and unavailable states. A failed request must not look like an empty board.

Rank submitted runs by finish time, fastest first. Equal exact times share a rank; use server submission time and run ID for stable ordering within ties. Show exact quarter-second precision to match D129 so apparently identical rounded times do not receive unexplained different ranks. Runs longer than five minutes still qualify; D129 medal boundaries are 7:00 / 7:30 / 8:00, with later finishes unmedalled.

**Identity default:** one entry per submitted run. The same nickname may appear more than once. A typed name does not establish identity, so do not merge entries or promise a personal best across devices. A best-per-person board would require an additional identity decision, such as accounts or a recoverable player code. A technical anonymous session is not proof of a unique person.

Separate rankings by game mode and gameplay rules version. Economy, victory or timer changes that affect comparability start a new board version while retaining historical results. Current gameplay is documented in [SPEED_MODE.md](SPEED_MODE.md). D132 combines the two D129 submission versions because their gameplay is identical and the owner trusts existing scores. Historical versions remain closed to new writes.

## Additional Speed Game opening countdown

Confirmed addition: give each fresh Speed Game an emphatic arcade countdown, **3 → 2 → 1 → GO!**, with a sparkling GO! that fades as play begins. Keep this small addition in this plan; it does not depend on Supabase or score submission.

Visual direction approved on 2026-10-12 for the countdown animation only. The example ends after GO! fades and omits illustrative gameplay screens. The example's former post-GO screen is not part of the design; the actual game interface follows [SPEED_GAME_IMPLEMENTATION_PLAN.md](SPEED_GAME_IMPLEMENTATION_PLAN.md).

- Start the sequence after the player presses LET’S GO, including when starting a fresh retry. Do not repeat it when resuming, closing Upgrades or continuing practice.
- Show oversized, bold numbers centered over the visible ecosystem. Give each number a punchy scale-in, brief overshoot and strong glow, building toward a larger GO! with a burst of bright spark particles. Use the existing Recon palette with gold highlights; keep the effect localized rather than flashing the whole screen.
- Proposed timing: one second each for 3, 2 and 1, followed by GO! fading out over roughly 0.8 seconds. Tune the motion during visual review while preserving the start boundary below.
- Freeze the entire simulation, scored timer and gameplay inputs during 3–2–1. **Start the game and timer exactly when GO! appears**, not when the start button is pressed or when the fade finishes. Enable gameplay immediately; the fading GO! and sparks must not intercept clicks or obscure the first system's controls.
- If the browser tab becomes hidden during the countdown, hold the sequence and resume it when visible so the player does not miss the start. Prevent repeated start clicks from launching overlapping countdowns or starting the run twice.
- With reduced motion enabled, retain the same readable 3–2–1–GO! sequence and timing, using static text without scale, bounce or moving sparks. Announce the countdown and start accessibly. Long Game is unchanged.

This refines the start gate described in [SPEED_GAME_IMPLEMENTATION_PLAN.md](SPEED_GAME_IMPLEMENTATION_PLAN.md): the start button begins the countdown; GO! begins scored gameplay.

## Supabase design

The existing website can remain on GitHub Pages. The browser reads leaderboard data from Supabase and sends opted-in results through a controlled submission endpoint.

| Record | Stored information |
| --- | --- |
| Score | Unique run ID, submitting anonymous auth ID, display name, mode, rules version, finish time in integer milliseconds, server submission timestamp |
| Result context | Scenario seed and frozen completion facts needed for basic validation, such as completed autonomy, automated repository/module counts and final health |
| Rules version | Eligible mode/scenario, scoring precision, finish conditions and medal thresholds for that version |

Derive medals and ranks from the stored time and versioned rules. Do not accept a client-supplied rank or medal as authoritative. Do not store email addresses, a full game save or gameplay activity before opt-in as part of this feature. D131 retains opted-in action transcripts privately with the verified completion facts.

### Access and validation

- Allow public reading through a restricted leaderboard query exposing only the fields needed for display, not auth IDs or internal validation data.
- Establish anonymous Supabase authentication only when the player chooses Save score. No registration or password is presented to the player. Preserve sufficient session information for safe retries.
- Submit through an Edge Function or equivalent controlled server endpoint. Validate authentication, name, supported mode/version, finite positive finish time, tick precision and completion facts. Reject unsupported versions and obvious invalid submissions.
- Enable Row Level Security, deny direct browser inserts/updates/deletes, and permit writes only through the controlled endpoint. The frontend uses the project URL and a publishable API key; any secret or elevated database credential stays on the server. The submission endpoint verifies the player's session JWT: the publishable key alone does not establish player identity.
- Use the run ID as an idempotency key. A repeat request from its owner returns the existing saved result; another identity cannot overwrite or claim it. A fresh run receives a fresh ID.
- Add server-side rate limits and request-size limits. An anonymous identity can be replaced, so per-identity limits alone do not prevent abuse.
- D131 replaces summary-only validation with server replay. Record successful actions at quarter-second simulation times, freeze the transcript at first victory, and submit it only on Save/Retry. Replay from a fresh seeded state with the shared engine; reject illegal actions, impossible timing and any mismatch in finish facts. Store the independently calculated result. This proves a legal simulated run, not human play or unique identity.
- Use `speed-d129-verified-v1` for new results. Keep the old write path closed. Rank existing `speed-d129-v1` scores alongside new results without rewriting their original versions or verification facts.
- Bound requests to 256 KiB, 2,000 actions and 30 active minutes, with a one-second processing budget checked during replay. Apply per-owner/global verification-attempt limits before replay, including failures; exempt already-saved retries.

### Availability and operations

Playing and viewing a local victory must remain possible when Supabase is unavailable. A network failure affects saving or loading the scoreboard, not game progression or the frozen result.

Select the Supabase project, region and service plan before provisioning. Configure anonymous sign-in, migrations, read access, the submission endpoint and deployment environment values. Review current quotas and set appropriate usage monitoring during setup; this plan makes no pricing commitment. Keep test scores separate from the public board. Provide an operator procedure for inspecting, exporting and removing entries and choosing the active rules version.

### Verified setup and remaining decisions

Supabase checks and implementation on 2026-10-12/13 confirmed:

| Item | Verified state |
| --- | --- |
| Plugin connection | Installed and authenticated; project and organization listing calls succeeded. |
| Accessible organization | Momos (`hyptcjknhthhupontloz`). |
| Project | `recon-game` (`oqzpwzmsnyfkgblchkbs`), EU `eu-west-1`, healthy. Created by the user through the dashboard. |
| Scoreboard backend | Three migrations applied, anonymous sign-in verified, `submit-score` deployed with JWT verification. Public reads and restricted writes verified. |

The organization and EU region were approved by the user. The connector's project-cost operation was unavailable, so the user created the project and saved Anonymous Sign-Ins through the dashboard. No plan upgrade was purchased by this work.

Local `.env.local` and GitHub repository build variables contain only the project URL and publishable key. The live acceptance test played a paid run, saved a marked setup score, read it from a second independent browser and after reload, then removed exactly that setup score and its test accounts. Existing player scores were retained. No Git push or website deployment was performed.

Verification: 97 automated tests and production-base build pass; isolated browser tests cover the optional form, no auth before opt-in, lost-response retry after reload, practice snapshots, text escaping, unavailable/empty states and countdown behavior. Live endpoint tests confirm duplicate saves return 200, invalid versions/names 400, oversized bodies 413, invalid sessions 401, direct table inserts 403 and another owner's retry 409. Local PostgreSQL tests additionally cover rate limits, rank ties and pagination.

Broader regression limit: the Long Game browser suite flags connected-system card clipping at 1024 pixels. An isolated build without scoreboard UI/styles reproduces the identical bounds failure; this pre-existing layout remains outside this feature. Security advisors report the intentional private-table/no-policy notice and disabled leaked-password protection (this feature uses anonymous accounts, without passwords). Performance advisors report no findings.

## Implementation sequence

1. Freeze the first scoreboard rules version and finish-result contract against the current or newly approved Speed Game rules. Add the opening countdown with simulation, input and timer activation at GO!.
2. Confirm the Supabase organization, region and service plan; create the dedicated project and arrange test isolation. Add migrations, restricted leaderboard reads, anonymous submission authentication and an idempotent server submission endpoint. Test permissions and failure responses before connecting the UI.
3. Add the optional finish form, submission states and local retry handling. Keep original result identity stable across result reopening and continued practice.
4. Add the paginated shared scoreboard and links from the entry and victory screens. Match the existing design and preserve game timing.
5. Verify locally and against a separate Supabase test environment. Configure the intended deployment and verify the shared flow across two independent browser sessions before declaring it live.
6. Update the game brief, decision log, checklist and handover with the implemented behavior and actual verification evidence.

## Acceptance checks

- Each fresh Speed Game shows 3–2–1 and a sparkling GO!; the simulation and timer remain frozen until GO! appears, then gameplay is usable throughout its fade.
- Countdown timing, hidden-tab handling, repeated start clicks and reduced-motion presentation work correctly. Resuming or continuing practice does not replay the sequence, and Long Game is unchanged.
- A player starts and finishes without entering a name or submitting player/result data to Supabase.
- Skipping saves nothing; choosing Save with a valid name publishes exactly the frozen result and shows confirmed success.
- The saved entry appears from a different browser/computer and remains after reload.
- Whitespace-only and overlong names are rejected; international names render correctly and markup is displayed as text.
- Duplicate clicks, lost responses, retries and reopening a result produce one row per run; another identity cannot overwrite it.
- Failed submissions remain retryable after reload and can be discarded; retry never shows success without backend confirmation.
- Faster times sort first, quarter-second differences are visible, ties share rank, and pagination preserves order and rank numbering.
- The submitted run can be located beyond the first page. Identical nicknames remain separate entries.
- Post-five-minute finishes qualify; practice continuation does not alter the original result. Debug/practice-generated victories are ineligible.
- Versions and modes are isolated, including old browser tabs submitting after a rules update.
- Direct writes and unauthorized updates/deletes fail; public reads expose only intended fields. Rate limiting and malformed requests are exercised against the backend.
- Scoreboard errors, empty states, retry controls and keyboard focus work at supported desktop/laptop sizes. Existing Speed Game completion and Long Game smoke checks still pass.

## References

- Current result lifecycle: [src/SpeedGame.tsx](src/SpeedGame.tsx), [src/game.ts](src/game.ts), [src/speedRules.ts](src/speedRules.ts).
- Existing rules and proposed changes: [SPEED_MODE.md](SPEED_MODE.md), [SPEED_GAME_IMPLEMENTATION_PLAN.md](SPEED_GAME_IMPLEMENTATION_PLAN.md).
- [Supabase anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous).
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Supabase publishable and secret API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys).
