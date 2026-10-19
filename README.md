# Recon Game

A standalone browser management game about keeping a growing software ecosystem healthy. Current rules and scope: [GAME_BRIEF.md](GAME_BRIEF.md).

## Run locally

Use Node.js 22.18+ (or 24+) and npm:

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. Choose **Speed Game** or **Long Game**. Speed Game uses a map that grows in waves of 2, 4 and 8 additions to 15 systems, a persistent model tree beside the map and Pause & plan. Aim for 5–8 active minutes; see [Speed Game rules](SPEED_MODE.md). Reload starts a fresh run.

Speed Game starts with **3–2–1–GO!** after its briefing. After finishing, optionally enter a nickname and save your time to the shared scoreboard. The server replays submitted actions before accepting a score. The default board contains verified finishes; previous scores remain in an unverified archive. View it from the mode-selection or result screen. Skipped scores are never submitted; failed saves remain available for deliberate Retry/Discard after reload. Game progress itself is not saved. Supabase setup and operator instructions: [supabase/README.md](supabase/README.md). Local play works without Supabase; shared saves require the two public values shown in `.env.example`.

The following controls describe **Long Game**. Press **Start game** after reading the rules; simulation and medal time begin together and then continue while the page is open, except during chapter briefings. No accounts, backend or live Recon connection are needed. Each reload starts a fresh run. Normal speed now uses the faster playtested pace with ordinary clock seconds. Use the **1×** button beside the timer to switch to **2×** for faster testing; click again to return to normal speed.

Follow your company from **the first team** to **full autonomy** in the guidance above the map. Each chapter opens its story automatically, starting with your first team. Dismiss it to play, or click the chapter title to reopen it. Chapter briefings pause the whole game, including reopened stories; closing them resumes without counting reading time. Introductions wait behind other open dialogs. The next move points to a named system or offers **Plan investment** during quiet moments; it never spends credits for you. Goals explain the next unlock, and a visible Game paused note makes chapter-reading pauses explicit.

Use **Scan** and **Repair** on each system. **Repair all (N) · total cr** submits all known findings when affordable, using available slots and queuing overflow. If credits cannot cover the total, it opens individual choices without spending. Clicking a system name always opens details. Selected findings move to the bottom, marked Repairing or Queued. Findings stay open while you submit repairs; click outside, Close or Escape to dismiss. Speed upgrades and five **Scan efficiency** tiers sit below the map. Efficiency reduces each new manual/group/automatic scan from 5 credits down to 0.25; each tier shows its price and next scan/setup cost. Tier prices rise: **20 / 100 / 500 / 2,500 / 6,000 credits**. Buy up to **five work slots**, at **150 credits each**, on the right. Full slots put manual actions into the **Queue**, which shows a waiting count and starts work in order as slots free up. Actions are charged once when submitted.

Earn two **healthy minutes** to enter expansion, then six more to reach the release milestone. Goal time counts only while average ecosystem health is at least 80%; earned progress stays when health drops. **System failure / Goal time held · need 80%** beneath ecosystem health explains the hold and clears on recovery. Two healthy minutes may take longer than two elapsed minutes. The secondary elapsed clock, income, jobs and deadlines always continue. Expansion begins automatically when its goal is earned. Frontend and Identity connect, deadlines appear, and each system gains an **Automate scans** action. It enables automatic scans for that system immediately; each additional system needs its own purchase. Each scan costs the current efficiency price, and a 20-credit reserve is protected automatically. Enable **Auto repairs · 480 cr** separately for each repository to repair known findings automatically at 15 credits each. Both automations share spare slots and protect a 20-credit reserve; manual orders come first. Paid remediation tiers and finding bundles stay on hold. Both milestones record results without stopping play. On narrow screens, switch between Ecosystem and Work slots.

After the **release milestone**, the company expands to **100 repositories**: one new repository every six game seconds, reaching the cap **9m 42s after that milestone**. Each run varies module sizes (3–5 repositories) and project sizes (3–5 modules). Explore one connected map: two-finger scroll to pan, pinch to zoom, or click project/module labels to frame that part of the ecosystem. Click a repository node to focus its original actions. **Fit all** restores the overview; **Find repo…** jumps to any connected repository. Zoom buttons and canvas arrow keys, +/− and Home also work. Dragging moves the view, not the repositories. Group Scan/Repair actions submit ordinary paid jobs; group Auto-scans charges only repositories not already covered. New members require their own coverage purchase. Group Auto-repairs likewise purchases only uncovered connected members. Paid remediation bundles remain on hold.

**Full autonomy:** cover all 100 repositories with both automations, then sustain 60 seconds without manual work. Keep average health ≥90%, every repository ≥60%, no overdue findings and at least 35 credits. Automatic scans and completed repairs must demonstrate operation with income covering running costs. The **Autonomy** button explains progress/blockers. Victory is recorded without interrupting play.

For quick testing, **click the Recon logo three times within two seconds**. Choose a starting point, including the **100-repository company** and **Autonomy trial**, then use the **Debug** footer button to jump again. Jumps replace the run with a coached simulation that uses normal paid actions to reach the checkpoint, keeping its layout and speed. Exit debug mode or reload to hide the tools.

## Verification

```sh
npm test          # deterministic engine, queue, accounting and automation
npm run build     # strict TypeScript check and production bundle
npm run preview   # serve the production bundle
node tests/feedback-browser.mjs  # chapter entry, health holds and timer spacing
node tests/chapter-pause-browser.mjs  # chapter pauses, jobs/queue, hidden reading, 2× and restart
node tests/story-browser.mjs  # chapters, guidance and responsive layout; same runtime
node tests/browser-smoke.mjs  # requires Playwright with Chromium and a running preview
```

The browser runner accepts `GAME_URL` and `PLAYWRIGHT_MODULE_DIR` for an externally supplied runtime. It uses accelerated time and real game controls in an isolated context. Reports/screenshots go to ignored `test-results/`.

## Project records

Read [HANDOVER.md](HANDOVER.md), the brief, [BUILD_CHECKLIST.md](BUILD_CHECKLIST.md) and [DECISIONS.md](DECISIONS.md) before continuing work. `src/game.ts`, `src/campaign.ts` and `src/organization.ts` own simulation rules; `src/App.tsx` owns the in-memory lifecycle. The two boards share `src/SystemNode.tsx` for direct system actions.

This is a fictional prototype. Real repository connections, final balancing and endless-mode variety remain later scope.

Finishing polish (D87): medal targets sit beside elapsed time; chapter 5 shows joint automation coverage and trial progress/reset reasons. Efficiency also reduces new scan-automation setup costs from 210 to 31.5 credits by tier 5; tier prices are 20/100/500/2500/6000. Existing coverage is not refunded. Optional chapter sound is off by default in the footer. Calibration: [MEDAL_PLAYTEST.md](MEDAL_PLAYTEST.md). Pending human sessions: [HUMAN_PLAYTEST.md](HUMAN_PLAYTEST.md).

## Publishing

Public repository: https://github.com/erlandvr/recon-game

GitHub Pages address: https://erlandvr.github.io/recon-game/

The `Test and publish game` workflow checks every pull request and publishes successful `main` builds. It runs Node 24, installs the lockfile with `npm ci`, runs engine tests, and builds with the `/recon-game/` asset base. Only `dist` is deployed. In repository Settings → Pages, the source must be GitHub Actions. Local development continues at `/`.

Workflow follows the [Vite GitHub Pages guide](https://vite.dev/guide/static-deploy.html#github-pages). No accounts, server or API credentials are required to play. Runs are kept in memory and reset on reload.
