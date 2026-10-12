import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(),errors=[],evidence=[];
try{
 await mkdir('test-results',{recursive:true});
 for(const [width,height] of [[1280,800],[800,700]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  const button=name=>page.getByRole('button',{name,exact:true}),tick=async n=>{await page.clock.runFor(n*1000);await page.waitForTimeout(30);};
  const credits=async()=>Number(await page.locator('[data-credits]').getAttribute('data-credits'));
  await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));await page.goto(process.env.GAME_URL??'http://127.0.0.1:5173/');await button('Choose Speed Game').click();await button('LET’S GO').click();
  await button('Core experience').click();assert.match(await page.locator('.sg-system-detail').innerText(),/1 connected systems/);
  await button('Scan · 5 cr').click();await tick(3);await button('Fix · 15 cr').click();await tick(5);
  assert.match(await page.locator('.sg-system-detail').innerText(),/3 connected systems/);
  await button('Scan · 10 cr').click();await tick(10);await button('Fix · 30 cr').click();await tick(10);
  assert.equal(await page.getByRole('button',{name:/Auto scans|Auto fixes/}).count(),0);
  while(await credits()<50)await tick(.5);const before=await credits();await page.locator('[data-model="scout"] button').click();assert.equal(await credits(),Math.round((before-50)*100)/100);
  await page.screenshot({path:`test-results/group-speed-${width}.png`});await page.locator('.sg-company').click();assert.ok((await page.locator('.sg-system-detail').innerText()).includes(`${await page.locator('[data-system]').count()} connected systems`));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight));evidence.push({width,paidGroupScan:true,paidGroupFix:true,manualModelUpgrade:true});await page.close();
 }
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));const button=name=>page.getByRole('button',{name,exact:true});
 await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));await page.goto(process.env.GAME_URL??'http://127.0.0.1:5173/');await button('Choose Long Game').click();await button('Start game').click();for(let i=0;i<3;i++)await button('Recon logo').click();await button(/^Autonomy trial /).click();await button('Start Next Chapter').click();
 await page.locator('.map-group-label').first().click();await page.waitForTimeout(60);assert.ok(await page.locator('.group-card.fully-automated').isVisible());await page.screenshot({path:'test-results/group-long-automated.png'});await page.setViewportSize({width:800,height:700});await page.waitForTimeout(100);const contained=await page.locator('.group-card').evaluate(el=>{const c=el.getBoundingClientRect(),v=document.querySelector('.ecosystem-canvas').getBoundingClientRect();return {fits:c.top>=v.top&&c.bottom<=v.bottom,card:c.toJSON(),viewport:v.toJSON()};});await page.screenshot({path:'test-results/group-long-800.png'});assert.ok(contained.fits,JSON.stringify(contained));await button('View modules').click();await page.waitForTimeout(60);await page.locator('.map-group-label').first().click();assert.ok(await button('View repos').isVisible());assert.equal(await page.locator('.scope-actions').count(),0);
 assert.deepEqual(errors,[]);await writeFile('test-results/group-node-browser.json',JSON.stringify({passed:true,evidence,errors},null,2));console.log({passed:true,evidence});
}finally{await browser.close();}
