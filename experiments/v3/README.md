# V3 balance sandbox

An independent experimental engine and playable browser board. This is a local prototype for evaluating the V3 discussion, not a new production game mode. It does not import the production engine or call Supabase. The existing entry screen and scoreboard are unchanged.

## Relationship to the current specification

[V3_MODE.md](../../V3_MODE.md) is the current design. This sandbox is an older experiment and has not been aligned with it. Its recorded timings do not validate the cash-target game or current animations.

| Area | Sandbox | Current specification |
| --- | --- | --- |
| Victory | Experimental autonomy goal | Spendable cash target only |
| Developer queue | Maintenance before construction | Shared arrival order |
| Failed income | 20% retained | Zero |
| Purchases | Includes maintenance-speed upgrade | Developers, systems, Recon, Plus |
| Construction | Single build phase | Bench assembly, delivery, installation and return |
| Visuals | Basic board and character | Clusters, workbenches, oversized back-carry and readable processing scenes |
| Timing/cap/economy | Values documented below | Latest untested candidate in the [specification](../../V3_MODE.md#prototype-tuning-candidate) |

Keep the existing results as evidence of this experiment. Align and rerun before using it to select current prices, cash target or system cap.

## Run

From the repository root:

```sh
npm run v3:sandbox
```

Open `http://127.0.0.1:5183/experiments/v3/`. Start a manual run, or select a purchase policy and watch its actions. Start/Pause and New run are beside the board. The browser pauses while hidden; playback can be accelerated to 4× or 12×. Download run evidence records all paid actions, events and metrics.

Three environments are available: the candidate, the initial slower-Recon model, and a scenario with faster ageing and more maintenance. Environment and seed changes apply on New run.

```sh
npm run v3:test
npm run v3:benchmark
PLAYWRIGHT_MODULE_DIR=/absolute/path/to/node_modules node experiments/v3/browser-test.mjs
```

The browser test expects Playwright with Chromium and the local server above. Override `GAME_URL` if needed. Screenshots and browser trace downloads are written under ignored `test-results/v3/`.

## Stored experimental configuration

These values describe the stored experiment and reproduce its results. They are not current V3 tuning recommendations.

| Element | Candidate |
| --- | --- |
| Start | One healthy system, one developer, 90 credits |
| System limit | 15, provisional |
| New system | 45 credits; eight seconds of developer construction |
| Developer | 55 credits upfront; 0.35 credits/s wage; maximum six |
| Operating income | 3 credits/s per system; 20% retained during a failure |
| Manual maintenance | Two seconds travel each way; six seconds repair work |
| Recon | 180 credits; one concurrent job; 0.3 credits/s upkeep |
| Recon Plus | Another 260 credits; three total jobs; 0.8 credits/s total upkeep |
| Recon repair work | 1.5 seconds, no travel |
| Optional speed investment | 100 credits; developer and Recon repair rates multiplied by 1.4 |
| Ageing | Repair-to-next-incident interval declines from 28 to 15 seconds over 90 seconds of system age |
| Incident variation | Seeded ±20% interval variation; first incident approximately 16 seconds after construction |
| Experimental victory | Full ecosystem built; Recon installed; last ten seconds average at least 90% operating systems, at most 10% developer time in maintenance/travel, positive net income, nonnegative balance |

Construction can be prepaid and queued. Only an available developer can start it. In this first model, an active construction job is not interrupted by maintenance; idle developers take the oldest unassigned maintenance job before new construction. This differs from the now-agreed shared arrival-order queue; see the current specification.

Recon takes the oldest eligible issue, including one a developer is walking to or repairing. Takeover immediately releases the developer. Completed repair progress is retained; the developer walks back from their current position before becoming available. Wages continue throughout.

Each system has at most one outstanding incident. New incident timing starts after repair, so failure demand is suppressed while a system is already down. This simplifying assumption matters to capacity results. Repair does not reset system age. Ageing eventually stops increasing demand.

No per-job fee is charged; Recon has fixed operating costs instead. Negative cash remains possible and visible, but payroll and work continue in debt. There is no bankruptcy, dismissal or free bailout mechanic. The model therefore does not validate insolvency handling.

## Recorded results for this configuration

The reproducible current benchmark contains **144 strategy runs**: 120 runs across eight policies, three reaction intervals and five seeds; nine delayed starts; and 15 parameter sensitivity runs. It also contains **77 ten-minute capacity runs**: 72 combinations of system count, Recon tier, initial all-system failure and seed, plus five parameter sensitivities.

The six policies that buy both Recon tiers finish all 90 main runs. Their results:

| Policy | Median finish | Range |
| --- | --- | --- |
| Balanced | 2:04.5 | 1:58.9–2:12.9 |
| Hire first | 2:20.9 | 2:07.9–2:23.9 |
| Maintenance speed first | 2:17.9 | 2:11.9–2:27.9 |
| Save for Recon | 2:50.9 | 2:34.9–3:02.9 |
| Expand first | 3:11.9 | 2:46.9–3:57.9 |
| Over-hire | 2:32.9 | 2:06.9–2:42.9 |

These are bounded policies, not an exhaustive search for optimal play. Each policy allows at most one purchase per reaction interval. There is no injected money or free construction.

The developer-only and Recon-only controls do not finish within six minutes. Developer-only cannot win by definition because the experimental goal requires Recon; it is not proof that buying Recon is intrinsically enjoyable or economically essential.

At 15 fully aged systems, Recon Plus without developer repair assistance sustains **90.41–90.75% average uptime** across six runs, including initial all-system failures. Recon alone achieves approximately **67.75–68.22%**. Uptime is measured after a 60-second warm-up through second 600; it is not a minimum for every moment or every ten-second window. Even Plus has temporary bursts of up to six failed systems at this cap.

Eighteen systems remains above 90% on the tested means; 21 and 24 cross below it in some runs. Fifteen is a conservative candidate within this model, not the demonstrated universal maximum. The margin is small and depends on the age curve, service time and the one-incident-per-system assumption.

## What broke or remains uncertain

- The initial model, with three-second Recon repairs, permitted several short wins but only about 82% mature uptime at 12 systems. Its snapshot is preserved.
- Changing candidate Recon repairs to two seconds still permits early finishes, but mature uptime drops to about 87.6% in the checked sensitivity run. A short win is insufficient evidence of sustainable autonomy.
- Increasing mature incident frequency to every 12 seconds drops that mature uptime to about 88.5%.
- Twelve-second construction pushes the save-for-Recon sample to 3:33.9. Growth timing is a stronger pacing lever than small changes to Plus price.
- Delayed starts of 10–30 seconds recover in the tested policies, with finishes from 2:12.9 to 3:05.9. This tests delay, not arbitrary player mistakes.
- Salary pressure is mainly early-game pressure with these numbers. At scale, revenue greatly exceeds wages. No baseline run enters debt; recovery from debt has not been certified.
- Recon-only creates frequent developer cancellations. The proposed expressive handoff might become visually irritating; this needs human observation.
- The sandbox has a custom simple worker, walking and hammer motion, and an expressive turn on takeover. It demonstrates the mechanic; it is not final artwork.

## Recorded verification and evidence

- At the original verification, nine focused engine tests passed: paid purchases/caps, construction capacity, both handoff cases, exclusive ownership, three-slot limit, wage accounting, bounded ageing, deterministic replay and result freeze.
- Two browser policy runs finish at **2:02.9** and **2:50.9**; downloaded paid-action replays exactly reproduce their outcomes and credit balances.
- Browser checks cover a manual paid purchase, pause, reset, frozen results, desktop/laptop overflow and reduced motion. Screenshots were inspected.
- At that verification, all 107 existing product tests and the normal production build passed. They were not rerun for the later documentation cleanup. The sandbox is served by Vite development routing and is not included in the normal published build.

Machine-readable current results: [v3-sandbox-results.json](../../docs/analysis/v3-sandbox-results.json). Initial model: [v3-sandbox-baseline.json](../../docs/analysis/v3-sandbox-baseline.json). Design and research: [V3_MODE.md](../../V3_MODE.md).

Automated completion, money accounting and capacity checks establish feasibility under the stated assumptions. Human enjoyment, clarity, perceived choice and desire to replay remain untested.
