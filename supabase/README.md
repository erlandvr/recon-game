# Scoreboard operations

The scoreboard records opted-in Speed Game finishes after replaying their actions on the server. It verifies legal simulation results, not human play, real-world elapsed time or unique identity. It does not save resumable games. Anonymous accounts identify browser retries; nicknames can repeat.

D131 is a repository change awaiting deployment. The prior hosted version accepts self-reported summaries until the migration below is applied.

## Configuration

- Project: `recon-game`, Momos, EU (`eu-west-1`), reference `oqzpwzmsnyfkgblchkbs`.
- Enable **Authentication → Sign In / Providers → Anonymous Sign-Ins**, then save.
- Frontend: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Copy `.env.example` to `.env.local` for development. Only these public settings belong in the browser.
- The GitHub Pages workflow reads the same names from repository Actions variables. Updating variables does not publish the app; a subsequent build must use them.
- The Edge Function uses Supabase-managed server credentials. Never add a secret/service key to a `VITE_` variable or the repository.
- Apply migrations in filename order, then deploy `submit-score` with the entire `_shared` directory, including `engine`. Keep the remote endpoint and browser rules contract in sync. `src/game.ts`, `campaign.ts`, `organization.ts`, `speedRules.ts` and `medals.ts` re-export these same engine modules; do not maintain a separate server copy.

Anonymous authentication initializes only on Save/Retry. Public scoreboard reads need no account. The browser keeps opted-in failed submissions under `recon-scoreboard-pending-v1` and their anonymous session under `recon-scoreboard-auth-v1`. No retries run automatically. Clearing the original session can make a pending result impossible to retry safely; Discard remains available. A saved entry survives deletion of its anonymous account.

## Access and limits

`scoreboard_scores` holds public names, times, versions and server timestamps. `scoreboard_private.submissions` holds ownership, server-derived completion facts and the opted-in replay; public roles have no access. `scoreboard_private.verification_attempts` holds short-lived attempt metadata, also inaccessible to public roles. Both schemas use RLS. The private table deliberately has no public policies: the Supabase advisor's informational “RLS Enabled No Policy” notice is expected for this table. See [the advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Only the Edge Function's server role can call `prepare_score_verification` and `submit_verified_score`. The endpoint obtains the owner from a verified auth token, reserves an attempt, validates the transcript with the shared engine and stores independently computed facts. The client cannot grant itself verification by sending a flag. The old `submit_scoreboard_score` RPC is removed.

A transaction lock makes ownership, duplicate saves and rate caps atomic. Before replay, allow 10 attempts per identity per five minutes and 120 globally per five minutes, counting invalid replays too. Saved-run retries return their receipt before these caps and need no replay. Successful writes retain the existing 10 scores per identity per hour / 120 globally per five minutes caps. Attempt records older than one hour are pruned when preparing a new verification.

Replay bounds: 256 KiB streamed body, 2,000 successful player actions, 30 active minutes, quarter-second timestamps and a one-second processing budget checked between actions and one-second simulation chunks. Exceeding the processing budget returns 422 with an explicit message; retry may help transient load. These conservative bounds leave room below Supabase's [two-second CPU limit](https://supabase.com/docs/guides/functions/limits); local timing is not hosted-runtime certification. Extremely long/complex runs still finish locally but may not qualify for the scoreboard. Limits and rate caps mitigate resource abuse; anonymous users can replace their identity, and valid scripted play remains possible.

Review project Database/Auth/Edge usage and billing limits in the Supabase dashboard. Investigate repeated 429/503 errors before increasing caps. Anonymous signup quotas are independent of score limits. This implementation does not purchase a plan or configure a paid monitoring service.

The security advisor also reports disabled [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). The scoreboard uses anonymous sign-ins and has no password login; review this setting before adding password-based accounts. Performance advisors reported no findings at verification.

## D131 deployment order

1. Review/apply `migrations/20261019133603_verified_score_replay.sql` to the intended project. It preserves all scores, closes both historical boards, creates `speed-d129-verified-v1`, and removes the unsafe write RPC. Old browser tabs can no longer save summary-only scores. There is a short save outage until the new function/frontend are available; playing and reading scores still work.
2. Deploy `submit-score` from this checkout, including `_shared/engine`, `_shared/replayContract.ts`, `_shared/scoreFacts.ts`, `_shared/scoreboard.ts`, `_shared/verifyScore.ts` and `_shared/submitScoreHandler.ts`. Keep JWT verification enabled. Use the Supabase CLI or the plugin; never deploy only `index.ts` with old shared files.
3. Check database/function logs and advisors, then merge/publish the frontend. The GitHub Pages workflow publishes frontend assets only; **merging the PR does not deploy Supabase**.
4. In an isolated test/pre-release project, run the opt-in live browser check and verify a played result, same-owner retry, wrong-owner conflict, forbidden direct write, and historical/verified separation. Then smoke-check the published site. Clean up only the test IDs reported by the script.

Rollback: keep historical writes closed. To temporarily stop new saves, set `accepting=false` for `speed-d129-verified-v1`; reads and already-saved receipts remain available. Do not restore the old summary-only RPC or mark historical rows verified. Pending old-version submissions cannot be promoted; players may discard them and start a fresh run. The unverified archive remains accessible through **View previous scores**.

## Inspect, export and moderate

Use Supabase's Table Editor or SQL Editor with operator access. For example:

```sql
select run_id, rules_version, display_name, finish_ms, submitted_at
from public.scoreboard_scores
order by submitted_at desc;
```

Export this public selection as CSV from the dashboard query results. Do not include the private ownership table in public exports. To remove a selected entry, verify its run ID and name first, then delete that exact row through the Table Editor. Its private submission is deleted automatically. Removing an entry does not remove other runs with the same nickname.

## Gameplay rules changes

Do not mix incomparable gameplay on one board. Add a new explicit rules ID and thresholds in a migration, update the shared contract and validation, disable new writes for the previous version, and deploy the server before publishing the new frontend. Keep historical score rows. Validate an actual paid victory against `resultSubmission`, not an invented finish fixture alone. The scoreboard test suite checks engine timing and medal boundaries against the contract.

## Verification

- `npm test`: engine tests plus real PostgreSQL in PGlite for permissions, duplicate retries, ownership, ranks/ties, pagination, versions and rate limits; no cloud score writes.
- `npm run build -- --base=/recon-game/`: production path and TypeScript checks.
- `tests/scoreboard-browser.mjs`: point `GAME_URL` at a local build configured with `https://scoreboard-test.invalid` and any public test key. Requests are intercepted locally, authentication is mocked, and submissions use the actual HTTP handler, replay verifier and a PGlite database. No cloud data is created. Covers the countdown, hidden tab, reduced motion, optional saving, frozen result after practice, lost response, identical reload/retry, verified/archive separation, text escaping and failures.
- `tests/scoreboard-live-browser.mjs`: explicit `SCOREBOARD_LIVE_TEST=1` only against a test or pre-release board. Plays a real paid route and saves a marked setup result; verifies it in two independent browser contexts. It records only the run ID and test account ID in ignored `test-results/scoreboard-live-browser.json`. Remove exactly those test records/accounts after testing, before launching the public board. Never bulk-delete scores or accounts.
- Browser scripts require `PLAYWRIGHT_MODULE_DIR` pointing to a directory containing Playwright. Test server builds must stay stable during a run; concurrent gameplay edits can invalidate timing and rule assertions.

Local D131 verification: 107 automated tests pass, the production-base build passes, and Chromium saved a played 144-second run through the actual verifier/local database, retried after reload without a duplicate, and displayed a separate historical archive. Screenshots were inspected at 1280×800 and 800×700. The hosted D131 function has not been deployed or tested by the implementation task.

No operator moderation UI, resumable games, permanent account login or anti-bot proof is included.
