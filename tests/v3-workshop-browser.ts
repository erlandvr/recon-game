import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {advanceV3, buyV3, newV3, startV3, type V3State} from '../src/v3Game.ts';
import {choosePurchase} from '../scripts/v3-benchmark.ts';
const require = createRequire(import.meta.url), {chromium} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await chromium.launch(), errors: string[] = [];
const directory = 'test-results/v3-workshop';
await mkdir(directory, {recursive: true});
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
page.on('pageerror', (e: Error) => errors.push(e.message));
let s: V3State = startV3(newV3()), oldBays = new Map<number, number>();
const captured = new Set<string>();
async function check() {
  const bays = await page.locator('.v3-main [data-recon-bay]').evaluateAll((els: Element[]) => els.map(el => ({slot: +(el.getAttribute('data-recon-bay')!), state: el.getAttribute('data-state'), system: el.getAttribute('data-system'), text: el.textContent})));
  assert.equal(bays.length, 3);
  const jobs = s.jobs.filter(j => j.owner === 'recon');
  assert.equal(bays.filter((b: any) => b.state === 'repairing').length, jobs.length);
  assert.equal(bays.filter((b: any) => b.state !== 'locked').length, s.recon);
  for (const job of jobs) {
    const bay = bays.find((b: any) => b.system === String(job.system)); assert.ok(bay);
    assert.match(bay.text, new RegExp(`Repairing ${Math.floor(job.progress * 100)}%`));
    if (oldBays.has(job.id)) assert.equal(bay.slot, oldBays.get(job.id), 'ongoing jobs must not jump between bays');
  }
  oldBays = new Map(jobs.map(j => [j.id, bays.find((b: any) => b.system === String(j.system)).slot]));
  const data = await page.locator('.v3-game').evaluate((el: HTMLElement) => ({time: +el.dataset.time!, cash: +el.dataset.cash!}));
  assert.equal(data.time, s.time); assert.ok(Math.abs(data.cash - s.cash) < 1e-6);
  const recent = s.systems.filter(n => n.installedAt !== null && n.installedAt > 0 && s.time - n.installedAt < 1.2);
  assert.equal(await page.locator('[data-income-coin]').count(), recent.length, 'coin follows actual installation only');
}
async function screenshot(name: string) {await page.screenshot({path: `${directory}/${name}.png`}); captured.add(name);}
try {
  const date = new Date('2026-10-20T10:00:00Z'); await page.clock.install({time: date}); await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL ?? 'http://127.0.0.1:5175/recon-game/');
  await page.getByRole('button', {name: 'Get your intro', exact: true}).click(); await page.clock.runFor(10000);
  await check(); await screenshot('offline');
  while (s.status === 'running' && s.time < 320) {
    const action = choosePurchase(s, 'balanced');
    if (action && Number.isInteger(s.time) && await page.locator(`[data-purchase="${action}"]`).isEnabled()) {await page.locator(`[data-purchase="${action}"]`).click(); s = buyV3(s, action); await check();}
    await page.clock.runFor(250); s = advanceV3(s, .25); await check();
    if (!captured.has('income-flight') && await page.locator('[data-income-coin]').count()) await screenshot('income-flight');
    if (!captured.has('one-bay') && s.recon === 1 && s.jobs.some(j => j.owner === 'recon')) await screenshot('one-bay');
    if (!captured.has('completed') && await page.locator('[data-recon-completion]').count()) await screenshot('completed');
    if (!captured.has('three-bays') && s.jobs.filter(j => j.owner === 'recon').length === 3) {
      await screenshot('three-bays');
      await page.getByRole('button', {name: 'Restart', exact: true}).click();
      const before = await page.locator('.v3-recon').innerHTML();
      await page.clock.runFor(8000); assert.equal(await page.locator('.v3-recon').innerHTML(), before, 'pause freezes radar, bay progress and completion motion');
      for (const [width, height] of [[1024, 768], [1280, 720], [1440, 900], [1920, 1080]]) {
        await page.setViewportSize({width, height}); await screenshot(`three-bays-${width}`);
        const issues = await page.evaluate(() => {
          const issues: string[] = [];
          for (const el of document.querySelectorAll('.v3-purchases button,.v3-header button,[data-recon-bay]')) {
            const r = el.getBoundingClientRect(); if (r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight) issues.push(el.textContent!);
          }
          for (const el of document.querySelectorAll('[data-recon-bay]')) {
            const shell = el.querySelector('rect')!.getBoundingClientRect();
            for (const text of el.querySelectorAll('text')) {const r = text.getBoundingClientRect(); if (r.left < shell.left || r.right > shell.right || r.top < shell.top || r.bottom > shell.bottom) issues.push(text.textContent!);}
          }
          const benches = [...document.querySelectorAll('.v3-bench')];
          for (let i = 0; i < 3; i++) {const text = benches[i].querySelector('.v3-bench-job'); if (text && text.getBoundingClientRect().bottom > benches[i + 1].getBoundingClientRect().top) issues.push('overlapping bench labels');}
          return issues;
        }); assert.deepEqual(issues, []);
      }
      await page.setViewportSize({width: 1440, height: 900});
      await page.emulateMedia({reducedMotion: 'reduce'});
      await screenshot('reduced-motion');
      await page.getByRole('button', {name: 'Keep this workshop', exact: true}).click();
      const radar = await page.locator('[data-radar-sweep]').getAttribute('transform');
      await page.clock.runFor(1000); s = advanceV3(s, 1); await check();
      assert.equal(await page.locator('[data-radar-sweep]').getAttribute('transform'), radar, 'reduced motion keeps radar static while real repairs progress');
      await page.emulateMedia({reducedMotion: 'no-preference'});
    }
  }
  for (const name of ['income-flight', 'one-bay', 'three-bays', 'completed']) assert.ok(captured.has(name), `missing paid scenario: ${name}`);
  assert.equal(s.status, 'won'); assert.deepEqual(errors, []);
  await page.getByRole('button', {name: 'Play again', exact: true}).click();
  assert.equal(await page.locator('.v3-main [data-recon-bay][data-state="locked"]').count(), 3);
  assert.equal(await page.locator('[data-recon-completion],[data-income-coin]').count(), 0);
  await writeFile(`${directory}/results.json`, JSON.stringify({result: s.result, checks: ['real paid base and three-bay capacity', 'stable job positions and retained percentages', 'actual installation coins', 'completion cue', 'pause freeze', 'four viewport bounds and bay text', 'reduced motion', 'fresh reset'], screenshots: [...captured], errors}, null, 2));
  console.log('V3.2 paid workshop checks passed', s.result, [...captured]);
} finally {await browser.close();}
