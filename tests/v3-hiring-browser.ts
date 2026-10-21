import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require = createRequire(import.meta.url), {chromium} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await chromium.launch(), errors: string[] = [];
try {
  const page = await browser.newPage({viewport: {width: 1280, height: 720}});
  page.on('pageerror', (e: Error) => errors.push(e.message));
  const date = new Date('2026-10-21T10:00:00Z'); await page.clock.install({time: date}); await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL ?? 'http://127.0.0.1:5175/recon-game/');
  const button = (name: string) => page.getByRole('button', {name, exact: true});
  const system = page.locator('[data-purchase="system"]'), developer = page.locator('[data-purchase="developer"]');
  await button('Get your intro').click(); await page.clock.runFor(16000);
  assert.match(await system.locator('.v3-purchase-count').innerText(), /Systems\s+1\/12/);
  assert.match(await developer.locator('.v3-purchase-count').innerText(), /Developers\s+1\/4/);
  await system.click(); // One unfinished system, one developer, approximately 61 credits.
  assert.match(await system.locator('.v3-purchase-count').innerText(), /Systems\s+2\/12/); // Includes the unfinished purchase immediately.
  assert.equal(await page.locator('.v3-footer').getAttribute('data-hint'), 'build');
  assert.equal(await developer.getAttribute('data-guided'), 'false');
  assert.equal(await system.getAttribute('data-guided'), 'false');
  assert.equal(await page.locator('.v3-purchases [data-guided="true"]').count(), 0);
  await mkdir('test-results/v3-hiring', {recursive: true}); await page.screenshot({path: 'test-results/v3-hiring/first-build-before-hiring.png'});
  await developer.click(); assert.match(await developer.locator('.v3-purchase-count').innerText(), /Developers\s+2\/4/); assert.match(await developer.innerText(), /Hired/);
  await page.clock.runFor(5000); assert.equal(await developer.getAttribute('data-guided'), 'false');
  await button('Restart').click(); await button('Start fresh').click(); await button('Get your intro').click(); await page.clock.runFor(10000);
  assert.match(await system.locator('.v3-purchase-count').innerText(), /Systems\s+1\/12/);
  assert.match(await developer.locator('.v3-purchase-count').innerText(), /Developers\s+1\/4/);
  await system.click(); assert.equal(await developer.isEnabled(), false); assert.equal(await developer.getAttribute('data-guided'), 'false'); assert.equal(await system.getAttribute('data-guided'), 'false');
  await page.clock.runFor(4000); assert.equal(await developer.getAttribute('data-guided'), 'false');
  await button('Dismiss hint').click(); assert.equal(await developer.getAttribute('data-guided'), 'false');
  await page.clock.runFor(1000); assert.equal(await developer.getAttribute('data-guided'), 'false');
  await system.focus(); await page.keyboard.press('Tab'); assert.equal(await developer.evaluate((el: Element) => el.matches(':focus-visible')), true);
  // Grow through paid purchases to the actual caps, including queued systems.
  for (let attempt=0; attempt<600 && await developer.locator('.v3-purchase-count b').innerText() !== '4/4'; attempt++) {
    if (await developer.isEnabled()) await developer.click();
    else await page.clock.runFor(1000);
  }
  for (let attempt=0; attempt<600 && await system.locator('.v3-purchase-count b').innerText() !== '12/12'; attempt++) {
    if (await system.isEnabled()) await system.click();
    else await page.clock.runFor(1000);
  }
  assert.equal(await system.locator('.v3-purchase-count b').innerText(), '12/12');
  assert.equal(await developer.locator('.v3-purchase-count b').innerText(), '4/4');
  assert.equal(await system.isEnabled(), false); assert.equal(await developer.isEnabled(), false);
  for (const [width,height] of [[1024,768],[1280,720],[1440,900],[1920,1080]]) {
    await page.setViewportSize({width,height});
    for (const control of [system, developer]) {
      const fits = await control.locator('.v3-purchase-count').evaluate((el:Element) => {
        const r=el.getBoundingClientRect(), b=el.closest('button')!.getBoundingClientRect();
        return r.left>=b.left && r.right<=b.right && r.top>=b.top && r.bottom<=b.bottom && r.right<=innerWidth && r.bottom<=innerHeight;
      }); assert.equal(fits,true, `counter fits at ${width}`);
    }
    await page.screenshot({path:`test-results/v3-hiring/counters-${width}.png`});
  }
  assert.deepEqual(errors, []);
  console.log('Build-first guidance, free early hire, receipt, dismissal, keyboard focus and four-size capacity counters pass.');
} finally {await browser.close();}
