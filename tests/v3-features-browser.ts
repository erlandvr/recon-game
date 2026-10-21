import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {advanceV3, buyV3, featuresAvailable, newV3, pauseV3, startV3, systemIncome, workerPosition, type V3State} from '../src/v3Game.ts';
import {choosePurchase} from '../scripts/v3-benchmark.ts';
const require = createRequire(import.meta.url), {chromium} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await chromium.launch(), errors: string[] = [], directory = 'test-results/v3-desk-features';
await mkdir(directory, {recursive: true});
const page = await browser.newPage({viewport: {width: 1280, height: 720}});
page.on('pageerror', (e: Error) => errors.push(e.message));
page.on('request', (r: any) => {if (/supabase\.co/.test(r.url())) errors.push('Unexpected backend request');});
const button = (name: string) => page.getByRole('button', {name, exact: true});
let s: V3State = newV3(); const captured = new Set<string>();
async function check() {
  const d = await page.locator('.v3-game').evaluate((el: HTMLElement) => ({time: +el.dataset.time!, cash: +el.dataset.cash!, status: el.dataset.status}));
  assert.equal(d.time, s.time); assert.equal(d.status, s.status); assert.ok(Math.abs(d.cash - s.cash) < 1e-6);
  assert.equal(await page.locator('.v3-main [data-feature-backlog]').count(), featuresAvailable(s) ? 1 : 0);
  assert.equal(await page.locator('.v3-main [data-backlog-card]').count(), featuresAvailable(s) ? 6 : 0);
  if (featuresAvailable(s)) assert.match((await page.locator('.v3-main [data-backlog-card="0"]').textContent())!, new RegExp(`#${s.metrics.featuresTaken + 1}$`));
  assert.ok(s.jobs.filter(j => j.type === 'feature').every(j => j.system === -1));
  for (const w of s.developers) {
    if (w.feature) {assert.equal(w.system,null); assert.ok(!['delivery','install'].includes(w.phase));}
    const p = workerPosition(w), el = page.locator(`.v3-main .v3-world [data-worker="${w.id}"]`);
    assert.equal(await el.getAttribute('data-phase'), w.phase);
    assert.equal(await el.getAttribute('transform'), `translate(${p.x} ${p.y})`);
    assert.equal(await el.getAttribute('data-feature'), String(!!w.feature));
  }
  for (const n of s.systems) {
    const node = page.locator(`.v3-main [data-v3-system="${n.id}"]`);
    if (n.features) assert.equal(await node.locator('[data-system-features]').getAttribute('data-system-features'), String(n.features));
    if (n.installed && !n.broken) assert.match((await node.locator('.v3-system-state').textContent())!, new RegExp(`\\+${systemIncome(n).toFixed((n.features ?? 0) % 4 ? 2 : 0).replace('.', '\\.')} credits/s`));
  }
}
async function capture(name: string) {if (!captured.has(name)) {captured.add(name); await page.screenshot({path: `${directory}/${name}.png`});}}
async function fit() {
  const issues = await page.evaluate(() => {
    const problems: string[] = []; if (document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth) problems.push('page overflow');
    for (const selector of ['[data-feature-backlog]', '.v3-crew', '.v3-purchases']) {
      const r = document.querySelector(selector)!.getBoundingClientRect(); if (r.x < 0 || r.y < 0 || r.right > innerWidth || r.bottom > innerHeight) problems.push(selector);
    }
    const stack = document.querySelector('[data-feature-backlog]')!.getBoundingClientRect();
    for (const bench of document.querySelectorAll('.v3-bench')) if (bench.getBoundingClientRect().right >= stack.left) problems.push('backlog overlaps bench');
    for (const card of document.querySelectorAll('[data-backlog-card]')) {
      const shell = card.querySelector('rect')!.getBoundingClientRect(), label = card.querySelector('.v3-backlog-title')!.getBoundingClientRect();
      if (label.left < shell.left || label.right > shell.right || label.top < shell.top || label.bottom > shell.bottom) problems.push('feature label outside card');
    }
    return problems;
  }); assert.deepEqual(issues, []);
}
try {
  const date = new Date('2026-10-20T10:00:00Z'); await page.clock.install({time: date}); await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL ?? 'http://127.0.0.1:5175/recon-game/');
  await button('Get your intro').click(); await page.clock.runFor(10000); s = startV3(s);
  await check();
  await page.locator('[data-purchase="system"]').click();s=buyV3(s,'system');
  while (s.time < 100 && !(s.developers[0].feature && s.developers[0].phase === 'fetch')) {await page.clock.runFor(50);s=advanceV3(s,.05);await check();for(const w of s.developers)if(w.feature)await capture(w.phase);}
  const interruptedPosition=workerPosition(s.developers[0]);
  await page.locator('[data-purchase="system"]').click();s=buyV3(s,'system');
  assert.equal(s.developers[0].phase,'to-build');assert.equal(s.developers[0].parkedFeature?.phase,'fetch');
  assert.deepEqual(workerPosition(s.developers[0]),interruptedPosition);assert.equal(s.metrics.features,0);await check();await capture('build-preempts-feature');
  while (s.status === 'running' && s.time < 350) {
    if (Number.isInteger(s.time)) {
      // Leave space for feature work before expanding, so a real P1 can interrupt it.
      const action = !captured.has('p1-feature')
        ? s.systems.length < 3 ? 'system' : null
        : choosePurchase(s, 'four-developers');
      if (action && await page.locator(`[data-purchase="${action}"]`).isEnabled()) {await page.locator(`[data-purchase="${action}"]`).click(); s = buyV3(s, action);}
    }
    await page.clock.runFor(250); s = advanceV3(s, .25); await check();
    for (const phase of ['backlog', 'pickup', 'fetch', 'assembly']) if (s.developers.some(w => w.feature && w.phase === phase)) await capture(phase);
    if (s.systems.some(n => n.featureAt === s.time)) {
      const n=s.systems.find(n=>n.featureAt===s.time)!;
      assert.equal(await page.locator(`[data-v3-system="${n.id}"]`).getAttribute('data-feature-received'),'true');
      assert.ok(await page.locator('.v3-feature-finished').count()>0);await capture('desk-completion');
    }
    if (s.metrics.features) await capture('income-increase');
    if (s.developers.some(w => w.parkedFeature && s.jobs.find(j => j.id === w.job)?.priority === 'p1') && !captured.has('p1-feature')) {
      await capture('p1-feature'); await button('Restart').click(); s = pauseV3(s);
      const frozen = await page.locator('.v3-main [data-feature-backlog]').innerHTML(); await page.clock.runFor(20000); await check(); assert.equal(await page.locator('.v3-main [data-feature-backlog]').innerHTML(), frozen);
      for (const [width, height] of [[1024, 768], [1280, 720], [1440, 900], [1920, 1080]]) {await page.setViewportSize({width, height}); await fit(); await capture(`paused-${width}`);}
      await page.setViewportSize({width: 1280, height: 720}); await page.emulateMedia({reducedMotion: 'reduce'}); await button('Keep this workshop').click(); s = startV3(s);
    }
    if (s.recon && s.developers.some(w => w.feature)) await capture('recon-frees-features');
  }
  assert.equal(s.status, 'won'); assert.ok(s.metrics.features > 0);
  for (const name of ['backlog', 'pickup', 'fetch', 'assembly', 'build-preempts-feature', 'p1-feature', 'income-increase', 'desk-completion', 'recon-frees-features']) assert.ok(captured.has(name), `${name}: ${JSON.stringify({time:s.time,metrics:s.metrics,purchases:s.purchases})}`);
  const finished = JSON.stringify(s); await page.clock.runFor(10000); await check(); assert.equal(JSON.stringify(s), finished);
  assert.match(await page.locator('.v3-run-recap').innerText(), new RegExp(`Features completed\\s+${s.metrics.features}`));
  await button('Play again').click(); s = newV3(); await check(); assert.equal(await page.locator('.v3-main [data-system-features]').count(), 0);
  assert.deepEqual(errors, []); await writeFile(`${directory}/results.json`, JSON.stringify({result: JSON.parse(finished).result, metrics: JSON.parse(finished).metrics, captured: [...captured], errors}, null, 2));
  console.log('Paid shared-feature browser checks passed', JSON.parse(finished).result, 'features:', JSON.parse(finished).metrics.features);
} finally {await browser.close();}
