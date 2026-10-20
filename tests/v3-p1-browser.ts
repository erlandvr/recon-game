import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {advanceV3, buyV3, newV3, pauseV3, startV3, workerPosition, V3, type V3State} from '../src/v3Game.ts';
const require = createRequire(import.meta.url), {chromium} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await chromium.launch(), errors: string[] = [], directory = 'test-results/v3-p1';
await mkdir(directory, {recursive: true});
const page = await browser.newPage({viewport: {width: 1280, height: 720}});
page.on('pageerror', (e: Error) => errors.push(e.message));
page.on('request', (r: any) => {if (/supabase\.co/.test(r.url())) errors.push('Unexpected backend request');});
const button = (name: string) => page.getByRole('button', {name, exact: true});
let s: V3State = newV3(); let p1HintSeen = false;
async function check() {
  const d = await page.locator('.v3-game').evaluate((el: HTMLElement) => ({time: +el.dataset.time!, cash: +el.dataset.cash!, status: el.dataset.status}));
  assert.equal(d.time, s.time); assert.equal(d.status, s.status); assert.ok(Math.abs(d.cash - s.cash) < 1e-6);
  assert.equal(await page.locator('[data-v3-system][data-p1="true"]').count(), s.jobs.filter(j => j.priority === 'p1').length);
  for (const w of s.developers) {
    const p = workerPosition(w); const worker = page.locator(`.v3-world [data-worker="${w.id}"]`);
    assert.equal(await worker.getAttribute('data-phase'), w.phase);
    assert.equal(await worker.getAttribute('transform'), `translate(${p.x} ${p.y})`);
  }
}
async function advance(ms: number) {await page.clock.runFor(ms); s = advanceV3(s, ms / 1000); await check(); p1HintSeen ||= await page.locator('.v3-footer').getAttribute('data-hint') === 'p1';}
async function buy(action: 'system' | 'recon') {await page.locator(`[data-purchase="${action}"]`).click(); s = buyV3(s, action); await check();}
try {
  const date = new Date('2026-10-20T10:00:00Z'); await page.clock.install({time: date}); await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL ?? 'http://127.0.0.1:5175/recon-game/');
  await button('Start experience').click(); await page.clock.runFor(3000); s = startV3(s);
  while (!(s.developers[0].suspended?.phase === 'delivery' && !s.developers[0].suspended.feature) && s.time < 180) {
    if (s.time >= 34 && (s.time - 34) % 15 === 0 && s.systems.length < 5 && await page.locator('[data-purchase="system"]').isEnabled()) await buy('system');
    await advance(250);
  }
  const interruptedAt = s.time, saved = structuredClone(s.developers[0].suspended);
  assert.equal(saved!.phase, 'delivery'); assert.equal(await page.locator('[data-paused-cargo="0"]').count(), 1);
  assert.equal(p1HintSeen, true, 'first P1 explains interruption once per run');
  assert.match(await page.locator('.v3-crew').innerText(), /P1/);
  await button('Restart').click(); s = pauseV3(s); await advance(20000);
  assert.deepEqual(s.developers[0].suspended, saved);
  assert.equal(await page.locator('.v3-flame').first().evaluate((e: Element) => getComputedStyle(e).animationPlayState), 'paused');
  for (const [width, height] of [[1024, 768], [1280, 720], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({width, height});
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({path: `${directory}/fire-paused-${width}.png`});
  }
  await page.setViewportSize({width: 1280, height: 720}); await page.emulateMedia({reducedMotion: 'reduce'});
  assert.equal(await page.locator('.v3-flame').first().evaluate((e: Element) => getComputedStyle(e).animationName), 'none');
  await button('Keep this workshop').click(); s = startV3(s);
  while (s.developers[0].suspended && s.time < interruptedAt + 90) {assert.deepEqual(s.developers[0].suspended, saved); await advance(250);}
  assert.equal(s.developers[0].suspended, undefined); assert.equal(s.developers[0].phase, 'delivery');
  assert.equal(await page.locator('[data-paused-cargo]').count(), 0);
  assert.ok(s.developers[0].elapsed >= saved!.elapsed && s.developers[0].elapsed < saved!.elapsed + .25 + 1e-8);
  const resumedAt = s.time; await page.screenshot({path: `${directory}/resumed.png`});
  while ((!s.jobs.some(j => j.priority === 'p1' && typeof j.owner === 'number') || s.cash < V3.reconCost) && s.time < resumedAt + 150) await advance(250);
  assert.ok(s.cash >= V3.reconCost); const urgent = s.jobs.find(j => j.priority === 'p1' && typeof j.owner === 'number')!, from = workerPosition(s.developers[0]);
  await buy('recon'); assert.equal(s.jobs.find(j => j.id === urgent.id)!.owner, 'recon');
  assert.deepEqual(workerPosition(s.developers[0]), from);
  assert.equal(await page.locator('[data-recon-bay][data-p1="true"]').count(), 1);
  assert.match((await page.locator('[data-recon-bay][data-p1="true"] .v3-bay-number').textContent())!, /P1/);
  await page.screenshot({path: `${directory}/recon-p1.png`});
  while (s.jobs.some(j => j.id === urgent.id) && s.time < resumedAt + 180) await advance(250);
  assert.equal(s.systems[urgent.system].broken, false);
  assert.equal(await page.locator(`[data-v3-system="${urgent.system}"] .v3-fire`).count(), 0);
  assert.deepEqual(errors, []);
  await writeFile(`${directory}/results.json`, JSON.stringify({interruptedAt, resumedAt, saved, purchases: s.purchases, metrics: s.metrics, errors, checks: ['paid delivery interruption', 'fire and P1 text', 'paused cargo retained', 'pause and four-size fit', 'static reduced motion', 'exact worker positions against engine', 'resume saved delivery', 'paid Recon P1 handoff', 'fire removed only at completion']}, null, 2));
  console.log('P1 paid browser checks passed', {interruptedAt, resumedAt, time: s.time});
} finally {await browser.close();}
