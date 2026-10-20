import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {advanceV3, buyV3, newV3, pauseV3, startV3, type V3State} from '../src/v3Game.ts';
const require = createRequire(import.meta.url), {chromium} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await chromium.launch(), errors: string[] = [], directory = 'test-results/v3-journey';
await mkdir(directory, {recursive: true});
const page = await browser.newPage({viewport: {width: 1280, height: 720}});
page.on('pageerror', (e: Error) => errors.push(e.message));
page.on('request', (r: any) => {if (/supabase\.co/.test(r.url())) errors.push('Unexpected backend request');});
const button = (name: string) => page.getByRole('button', {name, exact: true});
let s: V3State = newV3();
async function check() {
  const d = await page.locator('.v3-game').evaluate((el: HTMLElement) => ({time: +el.dataset.time!, cash: +el.dataset.cash!, status: el.dataset.status}));
  assert.equal(d.time, s.time); assert.equal(d.status, s.status); assert.ok(Math.abs(d.cash - s.cash) < 1e-6);
}
async function advance(ms: number) {await page.clock.runFor(ms); s = advanceV3(s, ms / 1000); await check();}
async function reset() {await button('Restart').click(); await button('Start fresh').click(); s = newV3(); await check(); await button('Start experience').click(); await page.clock.runFor(3000); s = startV3(s); await check();}
async function fit() {
  const issues = await page.evaluate(() => {
    const issues: string[] = [];
    if (document.documentElement.scrollHeight > innerHeight || document.documentElement.scrollWidth > innerWidth) issues.push('page overflow');
    const modal = document.querySelector('dialog[open]');
    const elements = modal ? [modal, ...modal.querySelectorAll('button')] : [...document.querySelectorAll('.v3-header button,.v3-purchases button,.v3-footer')];
    for (const e of elements) {const r = e.getBoundingClientRect(); if (r.left < 0 || r.top < 0 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) issues.push(e.textContent!);}
    return issues;
  }); assert.deepEqual(issues, []);
}
try {
  const date = new Date('2026-10-20T10:00:00Z'); await page.clock.install({time: date}); await page.clock.pauseAt(date);
  await page.addInitScript(() => {
    const original = AudioContext.prototype.createOscillator; (window as any).v3SoundNotes = 0;
    AudioContext.prototype.createOscillator = function() {(window as any).v3SoundNotes++; return original.call(this);};
  });
  await page.goto(process.env.GAME_URL ?? 'http://127.0.0.1:5175/recon-game/');
  await fit(); assert.equal(await page.evaluate(() => (window as any).v3SoundNotes), 0);
  const opening = page.getByRole('dialog', {name: 'Recon — Active Animation', exact: true});
  assert.equal(await opening.getByRole('button').count(), 1);
  await button('Start experience').click(); await page.clock.runFor(1000);
  assert.equal(await page.locator('[data-theme="workshop"] .lit').count(), 2); await check();
  await page.screenshot({path: `${directory}/countdown.png`});
  await page.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.runFor(10000); await check(); assert.equal(await page.locator('[data-theme="workshop"] .lit').count(), 2);
  await page.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: false}); document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.runFor(2000); s = startV3(s); await check();
  assert.equal(await page.locator('.v3-footer').getAttribute('data-hint'), 'first');
  await advance(5000); assert.match(await page.locator('.v3-footer').innerText(), /saving is allowed/);
  await page.screenshot({path: `${directory}/first-action.png`});
  await page.locator('[data-purchase="developer"]').click(); s = buyV3(s, 'developer'); await check();
  assert.match(await page.locator('.v3-footer').innerText(), /Developer hired · −55 cr/); await advance(5000);
  assert.notEqual(await page.locator('.v3-footer').getAttribute('data-hint'), 'first');
  await button('Restart').click(); s = pauseV3(s); await advance(20000);
  const restart = page.getByRole('dialog', {name: 'Start a fresh workshop?', exact: true});
  await restart.getByRole('button', {name: 'Keep this workshop', exact: true}).focus();
  await page.keyboard.press('Tab'); assert.equal(await restart.getByRole('button', {name: 'Start fresh', exact: true}).evaluate((el: Element) => el === document.activeElement), true);
  await page.keyboard.press('Escape'); s = startV3(s); await check();
  assert.equal(await restart.count(), 0);
  assert.equal(await button('Restart').evaluate((el: Element) => el === document.activeElement), true);
  await reset(); await advance(22000);
  assert.equal(await page.locator('.v3-footer').getAttribute('data-hint'), 'failure'); assert.match(await page.locator('.v3-footer').innerText(), /no income/);
  assert.equal(await page.locator('[data-v3-system][data-guided="true"]').count(), 1); assert.equal(await page.locator('[data-purchase="recon"]').isEnabled(), false);
  await page.screenshot({path: `${directory}/first-failure.png`});
  await button('Dismiss hint').click();
  while (!await page.locator('[data-purchase="recon"]').isEnabled() && s.time < 600) await advance(500);
  assert.equal(await page.locator('.v3-footer').getAttribute('data-hint'), 'recon'); assert.equal(await page.locator('[data-purchase="recon"]').isEnabled(), true);
  await page.screenshot({path: `${directory}/recon-hint.png`}); await button('Dismiss hint').click(); await advance(1000); assert.notEqual(await page.locator('.v3-footer').getAttribute('data-hint'), 'recon');
  await reset();
  let lateBuild = false;
  while (s.status === 'running' && s.time < 400) {
    // A paid saving strategy; add a final build just before winning to exercise safe prop set-down.
    if (s.developers.length < 3 && await page.locator('[data-purchase="developer"]').isEnabled()) {await page.locator('[data-purchase="developer"]').click(); s = buyV3(s, 'developer'); await check();}
    else if (s.developers.length === 3 && (s.systems.length < 4 || !lateBuild && s.cash >= 1140) && await page.locator('[data-purchase="system"]').isEnabled()) {
      if (s.systems.length >= 4) lateBuild = true;
      await page.locator('[data-purchase="system"]').click(); s = buyV3(s, 'system'); await check();
    }
    await advance(1000);
  }
  assert.equal(s.status, 'won'); assert.equal(s.recon, 0); assert.ok(s.jobs.some(j => j.type === 'build'), 'a queued/building job remains unfinished');
  assert.ok(s.developers.some(w => w.phase === 'delivery' || w.phase === 'install'), 'paid victory catches a carried system');
  const frozen = JSON.stringify(s), result = page.getByRole('dialog', {name: 'Peak productivity reached!', exact: true});
  assert.equal(await result.getByRole('button', {name: 'Play again', exact: true}).isEnabled(), true);
  await page.clock.runFor(800); await check(); assert.ok(await result.locator('.v3-dancing').count()); assert.ok(await result.locator('.v3-parked-cargo').count());
  assert.equal(await result.locator('.v3-tool').count(), 0);
  for (const [width, height] of [[1024, 768], [1280, 720], [1440, 900], [1920, 1080]]) {await page.setViewportSize({width, height}); await fit(); await page.screenshot({path: `${directory}/victory-${width}.png`});}
  await page.clock.runFor(10000); await check(); assert.equal(JSON.stringify(s), frozen); assert.equal(await page.evaluate(() => (window as any).v3SoundNotes), 0, 'experience remains silent'); assert.equal(await result.locator('.v3-dancing').count(), 0);
  await button('Inspect workshop').click(); await page.emulateMedia({reducedMotion: 'reduce'});
  assert.equal(await page.locator('.v3-world .v3-dancing').count(), 0);
  await button('View result').click(); await page.screenshot({path: `${directory}/victory-reduced.png`});
  await button('Play again').click(); s = newV3(); await check(); assert.equal(await page.locator('.v3-parked-cargo').count(), 0);
  await button('Start experience').click(); await page.clock.runFor(1000); assert.equal(await page.locator('[data-theme="workshop"]').getAttribute('data-reduced'), 'true'); await page.clock.runFor(2000); s = startV3(s); await check();
  assert.equal(await page.locator('.v3-footer').getAttribute('data-hint'), 'first');
  assert.deepEqual(errors, []); await writeFile(`${directory}/results.json`, JSON.stringify({paidVictory: JSON.parse(frozen).result, remainingJobs: JSON.parse(frozen).jobs, errors, checks: ['hidden countdown and GO', 'first action and alternate purchase', 'restart hold, keyboard trap, Escape resumes and focus', 'real failure and affordable Recon only', 'dismissal', 'paid no-Recon victory during delivery', 'frozen economy during party', 'four-size results', 'static reduced motion and retry']}, null, 2));
  console.log('V3.3 journey checks passed', JSON.parse(frozen).result);
} finally {await browser.close();}
