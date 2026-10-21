import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {advanceV3, buyV3, newV3, pauseV3, startV3, type Purchase} from '../src/v3Game.ts';
const require = createRequire(import.meta.url), {chromium} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await chromium.launch(), page = await browser.newPage({viewport: {width: 1280, height: 720}});
const dir = 'test-results/v3-coffee', errors: string[] = [];
await mkdir(dir, {recursive: true});
page.on('pageerror', (e: Error) => errors.push(e.message));
let s = newV3();
const button = (name: string) => page.getByRole('button', {name, exact: true});
async function check() {
  const actual = await page.locator('.v3-game').evaluate((e: HTMLElement) => ({time: +e.dataset.time!, cash: +e.dataset.cash!, status: e.dataset.status}));
  assert.equal(actual.time, s.time); assert.equal(actual.status, s.status); assert.ok(Math.abs(actual.cash - s.cash) < 1e-6);
  assert.equal(await page.locator('.v3-world [data-worker]').count(), s.developers.length, 'waiter is not a developer');
}
async function advance(seconds: number) {await page.clock.runFor(seconds * 1000); s = advanceV3(s, seconds); await check();}
async function buy(action: Purchase) {while (!await page.locator(`[data-purchase=${action}]`).isEnabled()) await advance(5); await page.locator(`[data-purchase=${action}]`).click(); s = buyV3(s, action); await check();}
async function reset() {await button('Restart').click(); await button('Start fresh').click(); s = newV3(); assert.equal(await page.locator('.v3-coffee-visit').count(), 0); await button('Get your intro').click(); await page.clock.runFor(10000); s = startV3(s); await check();}
try {
  const date = new Date('2026-10-21T10:00:00Z'); await page.clock.install({time: date}); await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL ?? 'http://127.0.0.1:5175/');
  await button('Get your intro').click(); await page.clock.runFor(10000); s = startV3(s);
  await buy('developer'); assert.equal(await page.locator('[data-coffee-waiter]').count(), 0);
  await buy('recon'); assert.equal(await page.locator('[data-coffee-waiter]').count(), 1);
  await advance(2); const pose = await page.locator('[data-coffee-waiter]').getAttribute('transform');
  await page.screenshot({path: `${dir}/arrival.png`});
  await button('Restart').click(); s = pauseV3(s); await advance(3);
  assert.equal(await page.locator('[data-coffee-waiter]').getAttribute('transform'), pose);
  await button('Keep this workshop').click(); s = startV3(s);
  await page.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.runFor(3000); await check(); assert.equal(await page.locator('[data-coffee-waiter]').getAttribute('transform'), pose);
  await page.evaluate(() => {Object.defineProperty(document, 'hidden', {configurable: true, value: false}); document.dispatchEvent(new Event('visibilitychange'));});
  for (let i = 0; i < 200 && !await page.locator('[data-coffee-waiter][data-serving]').count(); i++) await advance(.05);
  assert.equal(await page.locator('[data-coffee-waiter]').getAttribute('data-serving'), '1');
  await advance(.6); await page.screenshot({path: `${dir}/serving.png`});
  await advance(15); assert.equal(await page.locator('[data-coffee-waiter]').count(), 0); assert.equal(await page.locator('[data-coffee-desk]').count(), 2);
  await buy('developer'); assert.equal(await page.locator('[data-coffee-desk]').count(), 2); assert.equal(await page.locator('[data-coffee-waiter]').count(), 1, 'later hire gets a fresh welcome'); await advance(15); assert.equal(await page.locator('[data-coffee-desk]').count(), 3); assert.equal(await page.locator('[data-coffee-waiter]').count(), 0);
  await buy('plus'); assert.equal(await page.locator('[data-coffee-waiter]').count(), 0); assert.equal(await page.locator('[data-coffee-desk]').count(), 3);
  await reset();
  for (let i = 0; i < 3; i++) await buy('developer');
  await buy('recon'); await advance(3);
  await page.setViewportSize({width: 1024, height: 768}); await page.screenshot({path: `${dir}/four-desks-serving-1024.png`});
  await advance(15); assert.equal(await page.locator('[data-coffee-desk]').count(), 4); assert.equal(await page.locator('[data-coffee-waiter]').count(), 0);
  await page.screenshot({path: `${dir}/four-coffees-1024.png`});
  await reset(); await page.emulateMedia({reducedMotion: 'reduce'}); await page.waitForFunction(() => document.querySelector('.v3-game')?.getAttribute('data-reduced') === 'true');
  await buy('recon'); assert.equal(await page.locator('[data-coffee-waiter]').count(), 0); await advance(15); assert.equal(await page.locator('[data-coffee-desk]').count(), 1);
  assert.deepEqual(errors, []); await writeFile(`${dir}/results.json`, JSON.stringify({checks: ['paid Recon triggers once', 'waiter never counts as a developer', 'unchanged engine time/cash', 'restart and hidden hold', 'sequential serving', 'cups persist', 'later hire receives coffee; Plus does not repeat', 'four-desk compact view', 'replay clears', 'static reduced motion'], errors}, null, 2));
  console.log('Coffee visit browser checks passed');
} finally {await browser.close();}
