# Scoreboard operations

The scoreboard records opted-in Speed Game finishes. It does not save games or verify that browser-reported gameplay is genuine. Anonymous accounts identify retries from a browser, not unique people. Nicknames can repeat.

## Configuration

- Project: `recon-game`, Momos, EU (`eu-west-1`), reference `oqzpwzmsnyfkgblchkbs`.
- Enable **Authentication → Sign In / Providers → Anonymous Sign-Ins**, then save.
- Frontend: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Copy `.env.example` to `.env.local` for development. Only these public settings belong in the browser.
- The GitHub Pages workflow reads the same names from repository Actions variables. Updating variables does not publish the app; a subsequent build must use them.
- The Edge Function uses Supabase-managed server credentials. Never add a secret/service key to a `VITE_` variable or the repository.
- Migration filenames match the versions recorded by the live Supabase migration history. Apply migrations in filename order, then deploy `submit-score` with its sibling `_shared/scoreboard.ts`. Keep the remote endpoint and browser rules contract in sync.

Anonymous authentication initializes only on Save/Retry. Public scoreboard reads need no account. The browser keeps opted-in failed submissions under `recon-scoreboard-pending-v1` and their anonymous session under `recon-scoreboard-auth-v1`. No retries run automatically. Clearing the original session can make a pending result impossible to retry safely; Discard remains available. A saved entry survives deletion of its anonymous account.

## Access and limits

`scoreboard_scores` holds public names, times, versions and server timestamps. `scoreboard_private.submissions` holds ownership and completion facts; public roles have no access. Both schemas use RLS. The private table deliberately has no public policies: the Supabase advisor's informational “RLS Enabled No Policy” notice is expected for this table. See [the advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Only the Edge Function's server role can call `submit_scoreboard_score`. It obtains the owner ID from a verified auth token, validates the request, and confirms the stored row before returning success. A transaction lock makes run IDs and rate caps atomic. Limits: 4 KiB request body, 10 new scores per identity per hour, 120 new scores globally per five minutes. Retries of an existing run do not consume these caps. These limits reduce accidental/low-volume abuse; they do not make the game cheat-proof.

Review project Database/Auth/Edge usage and billing limits in the Supabase dashboard. Investigate repeated 429/503 errors before increasing caps. Anonymous signup quotas are independent of score limits. This implementation does not purchase a plan or configure a paid monitoring service.

The security advisor also reports disabled [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). The scoreboard uses anonymous sign-ins and has no password login; review this setting before adding password-based accounts. Performance advisors reported no findings at verification.

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
- `tests/scoreboard-browser.mjs`: point `GAME_URL` at a local build configured with `https://scoreboard-test.invalid` and any public test key. HTTP routes are mocked; no cloud data is created. Covers the countdown, hidden tab, reduced motion, optional saving, frozen result after practice, lost response, reload/retry, text escaping and failures.
- `tests/scoreboard-live-browser.mjs`: explicit `SCOREBOARD_LIVE_TEST=1` only against a test or pre-release board. Plays a real paid route and saves a marked setup result; verifies it in two independent browser contexts. It records only the run ID and test account ID in ignored `test-results/scoreboard-live-browser.json`. Remove exactly those test records/accounts after testing, before launching the public board. Never bulk-delete scores or accounts.
- Browser scripts require `PLAYWRIGHT_MODULE_DIR` pointing to a directory containing Playwright. Test server builds must stay stable during a run; concurrent gameplay edits can invalidate timing and rule assertions.

No operator moderation UI, resumable games, account login, or authoritative replay validation is included in this first release.
