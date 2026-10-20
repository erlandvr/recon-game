import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {V3} from '../src/v3Game.ts';
import {mkdir} from 'node:fs/promises';
const require = createRequire(import.meta.url), {chromium} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await chromium.launch(), errors: string[] = [];
try {
  const page = await browser.newPage({viewport: {width: 1280, height: 720}});
  page.on('pageerror', (e: Error) => errors.push(e.message));
  const date = new Date('2026-10-21T10:00:00Z'); await page.clock.install({time: date}); await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL ?? 'http://127.0.0.1:5175/recon-game/');
  const button = (name: string) => page.getByRole('button', {name, exact: true});
  const recon = page.locator('[data-purchase="recon"]'), plus = page.locator('[data-purchase="plus"]');
  const ready = () => page.locator('[data-upgrade-ready]');
  async function afford(el: any) {for (let i=0; !await el.isEnabled() && i<400; i++) await page.clock.runFor(1000); assert.equal(await el.isEnabled(),true);}
  assert.equal(await ready().count(),0);
  await button('Start experience').click(); await page.clock.runFor(4000); assert.equal(await ready().count(),0);
  assert.equal(await recon.getAttribute('aria-label'),'Buy Recon · 180 credits');
  assert.equal(await plus.getAttribute('aria-label'),'Upgrade to Plus · 260 credits');
  await afford(recon); assert.equal(await recon.getAttribute('data-upgrade-ready'),'recon');assert.equal(await ready().count(),1);
  assert.match(await recon.innerText(),/Ready to automate/);assert.equal(await page.locator('.v3-purchases [data-guided="true"]').count(),0);
  await mkdir('test-results/v3-upgrade', {recursive:true});
  await page.screenshot({path:'test-results/v3-upgrade/recon-ready.png'});
  await page.locator('[data-purchase="system"]').click();assert.equal(await ready().count(),0);
  await afford(recon);await recon.click();assert.match(await page.locator('.v3-footer').innerText(),/−180 cr/);assert.equal(await ready().count(),0);assert.equal(await recon.isEnabled(),false);
  await afford(plus);assert.equal(await plus.getAttribute('data-upgrade-ready'),'plus');assert.equal(await ready().count(),1);assert.equal(await page.locator('.v3-upgrade-sparks').count(),1);
  await page.clock.runFor(10000);assert.equal(await plus.getAttribute('data-upgrade-ready'),'plus'); // persists beyond teaching hints
  await button('Restart').click();assert.equal(await plus.evaluate((e:Element)=>getComputedStyle(e).animationPlayState),'paused');
  for (const [width,height] of [[1024,768],[1280,720],[1440,900],[1920,1080]]) {
    await page.setViewportSize({width,height});
    const faults=await page.evaluate(()=>{
      const faults:string[]=[];if(document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight)faults.push('page overflow');
      for(const el of document.querySelectorAll('.v3-purchases button,.v3-upgrade-sparks')){const r=el.getBoundingClientRect();if(r.left<0||r.right>innerWidth||r.top<0||r.bottom>innerHeight)faults.push('control overflow');}
      return faults;
    });assert.deepEqual(faults,[]);await page.screenshot({path:`test-results/v3-upgrade/plus-${width}.png`});
  }
  await page.setViewportSize({width:1280,height:720});await page.emulateMedia({reducedMotion: 'reduce'});
  assert.equal(await plus.evaluate((e:Element)=>getComputedStyle(e).animationName),'none');assert.equal(await page.locator('.v3-upgrade-sparks path').first().evaluate((e:Element)=>getComputedStyle(e).animationName),'none');
  await button('Keep this workshop').click();
  // Spend enough to cross back below the Plus price; light and sparkles track current affordability.
  while(await plus.isEnabled())await page.locator('[data-purchase="system"]').click();
  assert.equal(await ready().count(),0);assert.equal(await page.locator('.v3-upgrade-sparks').count(),0);
  await afford(plus);const before=Number(await page.locator('.v3-game').getAttribute('data-cash'));await plus.click();
  assert.match(await page.locator('.v3-footer').innerText(),/−260 cr/);
  assert.ok(Math.abs(Number(await page.locator('.v3-game').getAttribute('data-cash'))-(before-V3.plusCost))<1e-7);
  assert.equal(await ready().count(),0);assert.equal(await page.locator('.v3-upgrade-sparks').count(),0);assert.equal(await plus.isEnabled(),false);
  assert.equal(await page.locator('.v3-main [data-recon-bay][data-state="locked"]').count(),0);
  assert.deepEqual(errors,[]);console.log('Paid upgrade afford/spend/re-afford/buy states, persistent emphasis, three bays, pause, reduced motion and four desktop sizes pass.');
} finally {await browser.close();}
