import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require = createRequire(import.meta.url), {chromium} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await chromium.launch(), errors: string[] = [];
try {
  await mkdir('test-results/v3-mvp', {recursive: true});
  const p = await browser.newPage({viewport: {width: 1024, height: 768}}); p.on('pageerror', (e: Error) => errors.push(e.message));
  const date = new Date('2026-10-20T10:00:00Z'); await p.clock.install({time: date}); await p.clock.pauseAt(date);
  await p.goto(process.env.GAME_URL ?? 'http://127.0.0.1:5174/recon-game/');
  assert.equal(await p.locator('.mode-options').count(), 0);
  await p.screenshot({path: 'test-results/v3-mvp/direct-entry.png'});
  await p.getByRole('button', {name: 'Get your intro', exact: true}).click(); await p.clock.runFor(31000);
  await p.locator('[data-purchase="developer"]').click(); await p.locator('[data-purchase="system"]').click(); await p.locator('[data-purchase="system"]').click();
  // Desk features make this former deficit scenario solvent; the seed-200 negative
  // balance/work/recovery contract is covered in v3.test.ts.
  await p.clock.runFor(30000); assert.ok(Number(await p.locator('.v3-game').getAttribute('data-cash')) > 0);
  await p.screenshot({path: 'test-results/v3-mvp/late-spending-recovery.png'});
  assert.equal(await p.locator('[data-worker]').count(), 2);
  await p.getByRole('button', {name: 'Restart', exact: true}).click(); await p.getByRole('button', {name: 'Start fresh', exact: true}).click();
  await p.getByRole('button', {name: 'Get your intro', exact: true}).click(); await p.clock.runFor(10000);
  // Wait for a real, affordable repair opportunity rather than a tuning-specific timestamp.
  for (let i = 0; i < 1200; i++) {
    const repairing = await p.locator('[data-worker="0"]').getAttribute('data-phase') === 'repair';
    if (repairing && await p.locator('[data-purchase="recon"]').isEnabled()) break;
    await p.clock.runFor(500);
  }
  assert.equal(await p.locator('[data-worker="0"]').getAttribute('data-phase'), 'repair');
  await p.locator('[data-purchase="recon"]').click();
  const overlap = await p.evaluate(() => {
    const a = document.querySelector('[data-v3-system="0"] .v3-system-name')!.getBoundingClientRect();
    const b = document.querySelector('.v3-worker-label')!.getBoundingClientRect();
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }); await p.screenshot({path: 'test-results/v3-mvp/takeover-label-spacing.png'}); assert.equal(overlap, false);
  await p.screenshot({path: 'test-results/v3-mvp/takeover-label-spacing.png'});
  assert.deepEqual(errors, []); console.log('Direct workshop entry, late-spending recovery and takeover label spacing pass.');
} finally {await browser.close();}
