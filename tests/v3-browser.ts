import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {advanceV3, buyV3, newV3, pauseV3, startV3, V3, type V3State} from '../src/v3Game.ts';
import {choosePurchase, type Policy} from '../scripts/v3-benchmark.ts';
const require = createRequire(import.meta.url);
const {chromium} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await chromium.launch();
const errors: string[] = [], completed: unknown[] = [];
const url = process.env.GAME_URL ?? 'http://127.0.0.1:5173';
const directory = 'test-results/v3-mvp';
await mkdir(directory, {recursive: true});
async function open(width = 1440, height = 900, motion = 'no-preference') {
  const page = await browser.newPage({viewport: {width, height}, reducedMotion: motion});
  page.on('pageerror', (e: Error) => errors.push(e.message));
  // V3 play must never submit scores or make other backend requests.
  page.on('request', (r: any) => {if (/supabase\.co/.test(r.url())) errors.push(`Unexpected backend request: ${r.method()} ${r.url()}`);});
  const date = new Date('2026-10-20T10:00:00Z'); await page.clock.install({time: date}); await page.clock.pauseAt(date);
  await page.goto(url); return page;
}
async function check(page: any, s: V3State) {
  const data = await page.locator('.v3-game').evaluate((el: HTMLElement) => ({time: +el.dataset.time!, cash: +el.dataset.cash!, status: el.dataset.status}));
  assert.equal(data.time, s.time); assert.equal(data.status, s.status); assert.ok(Math.abs(data.cash - s.cash) < 1e-6, `cash ${data.cash} != ${s.cash}`);
}
async function fit(page: any) {
  const faults = await page.evaluate(() => {
    const issues: string[] = [];
    if (document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight) issues.push('document overflow');
    for (const el of document.querySelectorAll('.v3-header button,.v3-purchases button,.v3-hud,.v3-crew')) {
      const r = el.getBoundingClientRect(); if (r.x < 0 || r.y < 0 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) issues.push(el.textContent!);
    }
    return issues;
  }); assert.deepEqual(faults, []);
}
try {
  const p = await open(1280, 800, 'reduce');
  assert.equal(await p.locator('[data-purchase="system"]').isVisible(), false);
  assert.equal(await p.locator('[data-purchase="system"]').isEnabled(), false);
  await p.getByRole('button', {name: 'Start experience', exact: true}).click(); await p.clock.runFor(1000);
  await p.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange'));});
  await p.clock.runFor(10000); await check(p, newV3());
  await p.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: false}); document.dispatchEvent(new Event('visibilitychange'));});
  await p.clock.runFor(2000); let s = startV3(newV3()); await check(p, s);
  assert.equal(await p.locator('.start-count-visual').getAttribute('data-reduced'), 'true');
  await p.clock.runFor(50); s = advanceV3(s, .05);
  assert.equal(await p.locator('[data-purchase="system"]').evaluate((el: Element) => el === document.activeElement), true);
  // Restart becomes available after the GO presentation finishes.
  await p.clock.runFor(1000); s = advanceV3(s, 1); await check(p, s);
  const heldPhase = s.developers[0].phase;
  await p.getByRole('button', {name: 'Restart', exact: true}).click(); s = pauseV3(s);
  await p.clock.runFor(15000); await check(p, s); assert.equal(await p.locator('[data-worker="0"]').getAttribute('data-phase'), heldPhase);
  await p.screenshot({path: `${directory}/restart-hold.png`});
  await p.getByRole('button', {name: 'Keep this workshop', exact: true}).click(); s = startV3(s);
  await p.getByRole('button', {name: 'Build system · 45 credits', exact: true}).click(); s = buyV3(s, 'system');
  await p.clock.runFor(6500); s = advanceV3(s, 6.5); await check(p, s);
  assert.equal(await p.locator('[data-worker="0"]').getAttribute('data-phase'), 'delivery');
  assert.equal(await p.locator('.v3-worker-leg').evaluate((el: Element) => getComputedStyle(el).animationName), 'none');
  await p.screenshot({path: `${directory}/first-carry.png`});
  assert.equal(await p.getByRole('button', {name: /Zoom in|Zoom out|Fit workshop/}).count(), 0);
  const machine = p.locator('[data-v3-system="0"]'), fixed = await machine.boundingBox();
  const scene = p.locator('.v3-world > svg'), bounds = await scene.boundingBox();
  await p.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await p.mouse.down(); await p.mouse.move(bounds!.x + bounds!.width / 2 + 100, bounds!.y + bounds!.height / 2 + 50, {steps: 5}); await p.mouse.up();
  await p.mouse.wheel(0, 300);
  assert.deepEqual(await machine.boundingBox(), fixed);
  assert.equal(await scene.evaluate((el: Element) => getComputedStyle(el).cursor), 'default');
  await p.clock.runFor(6000); s = advanceV3(s, 6); await check(p, s);
  assert.deepEqual(await machine.boundingBox(), fixed); await fit(p);
  await p.getByRole('button', {name: 'Restart', exact: true}).click(); await p.getByRole('button', {name: 'Start fresh', exact: true}).click(); await check(p, newV3());
  await p.close();

  for (const policy of ['balanced', 'hire-first', 'small-estate', 'four-developers'] as Policy[]) {
    const p = await open(); await p.getByRole('button', {name: 'Start experience', exact: true}).click(); await p.clock.runFor(3000);
    let s = startV3(newV3()), carryCaptured = false;
    while (s.status === 'running' && s.time < 400) {
      const action = choosePurchase(s, policy);
      if (action && await p.locator(`[data-purchase="${action}"]`).isEnabled()) {await p.locator(`[data-purchase="${action}"]`).click(); s = buyV3(s, action);}
      await p.clock.runFor(1000); s = advanceV3(s, 1); await check(p, s);
      if (!carryCaptured && s.developers.filter(w => w.phase === 'delivery').length >= 2) {await p.screenshot({path: `${directory}/${policy}-parallel.png`}); carryCaptured = true;}
      if (policy === 'balanced' && s.time === 90) {
        await p.getByRole('button', {name: 'Restart', exact: true}).click(); s = pauseV3(s);
        const pose = await p.locator('[data-worker="0"]').getAttribute('transform'); await p.clock.runFor(5000); await check(p, s);
        assert.equal(await p.locator('[data-worker="0"]').getAttribute('transform'), pose);
        for (const [width, height] of [[1024, 768], [1280, 720], [1440, 900], [1920, 1080]]) {await p.setViewportSize({width, height}); await fit(p); await p.screenshot({path: `${directory}/dense-${width}.png`});}
        await p.getByRole('button', {name: 'Keep this workshop', exact: true}).click(); s = startV3(s);
      }
    }
    assert.equal(s.status, 'won'); await p.getByRole('dialog', {name: 'Peak productivity reached!', exact: true}).waitFor();
    await p.clock.runFor(15000); await check(p, s); await p.screenshot({path: `${directory}/${policy}-result.png`});
    assert.equal(await p.getByRole('button', {name: /choose|mode/i}).count(), 0);
    completed.push({policy, result: s.result, takeovers: s.metrics.takeovers});
    await p.getByRole('button', {name: 'Play again', exact: true}).click(); await check(p, newV3()); await p.close();
  }
  // A paid save-only opening eventually has enough cash to buy Recon during maintenance.
  // Exercise both outward and mid-repair takeovers through visible controls.
  for (const takeoverPhase of ['outward', 'repair']) {
    const p = await open(1280, 800); await p.getByRole('button', {name: 'Start experience', exact: true}).click(); await p.clock.runFor(3000);
    let s = startV3(newV3());
    while (!(s.cash >= V3.reconCost && s.developers[0].phase === takeoverPhase) && s.time < 600) {s = advanceV3(s, .5); await p.clock.runFor(500);}
    assert.equal(s.developers[0].phase, takeoverPhase);
    if (takeoverPhase === 'repair') {s = advanceV3(s, 2); await p.clock.runFor(2000);}
    const expectedReturn = s.developers[0].suspended ? 'resume' : 'return';
    const position = await p.locator('[data-worker="0"]').getAttribute('transform');
    await p.locator('[data-purchase="recon"]').click(); s = buyV3(s, 'recon');
    await check(p, s); assert.equal(await p.locator('[data-worker="0"]').getAttribute('data-phase'), expectedReturn);
    assert.equal(await p.locator('[data-worker="0"]').getAttribute('transform'), position);
    await p.screenshot({path: `${directory}/takeover-${takeoverPhase}.png`});
    await p.clock.runFor(5000); s = advanceV3(s, 5); await check(p, s); assert.equal(s.systems[0].broken, false);
    await p.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(`${directory}/browser-results.json`, JSON.stringify({completed, errors, checks: ['countdown hidden hold and GO boundary', 'keyboard focus', 'restart hold and paid travel', 'reduced motion', 'fixed workshop resists drag/wheel and stays positioned during growth', 'four paid browser runs match engine', 'cash-only no-Recon wins', 'desktop viewport fit', 'first result freeze', 'fresh retry', 'no backend requests']}, null, 2));
  console.log('V3 browser checks passed', completed);
} finally {await browser.close();}
