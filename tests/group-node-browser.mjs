import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(),errors=[],evidence=[];
try{
 await mkdir('test-results',{recursive:true});
 for(const [width,height] of [[1280,800],[800,700]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  const button=name=>page.getByRole('button',{name,exact:true}),tick=async n=>{await page.clock.runFor(n*1000);await page.waitForTimeout(40);};
  const credits=async()=>Number(await page.locator('[data-credits]').getAttribute('data-credits'));
  await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));await page.goto('http://127.0.0.1:5173/');await button('Choose Speed Game').click();await button('Start Speed Game').click();
  await button('Scan Backend').click();await tick(3);await button('Fix Backend').click();await tick(17);
  assert.equal(await page.getByRole('dialog').count(),0,'No automation popup at first fix');assert.equal(await page.locator('.scope-actions').count(),0);
  await button('Open Core experience module').click();await tick(1);
  const card=page.getByRole('article',{name:'Core experience module actions'});
  assert.equal(await card.count(),1);assert.ok(await button('Auto-scans module Core experience').isDisabled());assert.match(await card.innerText(),/02:00/);
  const scan=button('Scan module Core experience'),scanCost=Number((await scan.locator('span').innerText()).split(' ')[0]),before=await credits();await scan.click();assert.equal(await credits(),Math.round((before-scanCost)*100)/100);await tick(3);
  const fix=button('Fix module Core experience'),fixCost=Number((await fix.locator('span').innerText()).split(' ')[0]),beforeFix=await credits();await fix.click();assert.equal(await credits(),Math.round((beforeFix-fixCost)*100)/100);await page.waitForTimeout(100);
  const issues=await card.evaluate(el=>{const v=document.querySelector('.ecosystem-canvas').getBoundingClientRect(),c=el.getBoundingClientRect(),scan=el.querySelector('.node-automation').getBoundingClientRect(),fix=el.querySelector('.repair-automation').getBoundingClientRect();return {contained:c.left>=v.left&&c.right<=v.right&&c.top>=v.top&&c.bottom<=v.bottom,stacked:fix.top>=scan.bottom,card:c.toJSON(),viewport:v.toJSON()};});
  await page.screenshot({path:`test-results/group-module-${width}.png`});assert.ok(issues.contained,JSON.stringify(issues));assert.ok(issues.stacked);
  await button('View repos').click();assert.equal(await page.locator('.group-card').count(),0);await button('Your company').click();assert.ok(await page.getByRole('article',{name:'Your company project actions'}).isVisible());await page.screenshot({path:`test-results/group-project-${width}.png`});await button('Close').click();
  await tick(95.5);assert.equal(await page.locator('[data-speed-time]').getAttribute('data-speed-time'),'119.5');assert.equal(await button('Dive Back In').count(),0);await tick(.5);await button('Dive Back In').waitFor();
  const paused=await credits();await tick(30);assert.equal(await page.locator('[data-speed-time]').getAttribute('data-speed-time'),'120');assert.equal(await credits(),paused);await button('Dive Back In').click();
  await button('Open Core experience module').click();await tick(1);
  const auto=button('Auto-scans module Core experience'),cost=Number((await auto.locator('span').innerText()).split(' ')[0]),pre=await credits();assert.ok(await auto.isEnabled());await auto.click();assert.equal(await credits(),Math.round((pre-cost)*100)/100);assert.match(await card.innerText(),/4\/4 repos covered/);await page.screenshot({path:`test-results/group-covered-${width}.png`});
  evidence.push({width,groupScan:true,groupFix:true,scopePurchase:true,unlockAt:120});await page.close();
 }
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));const button=name=>page.getByRole('button',{name,exact:true});
 await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));await page.goto('http://127.0.0.1:5173/');await button('Choose Long Game').click();await button('Start game').click();for(let i=0;i<3;i++)await button('Recon logo').click();await button(/^Autonomy trial /).click();await button('Start Next Chapter').click();
 await page.locator('.map-group-label').first().click();await page.waitForTimeout(60);assert.ok(await page.locator('.group-card.fully-automated').isVisible());await page.screenshot({path:'test-results/group-long-automated.png'});await page.setViewportSize({width:800,height:700});await page.waitForTimeout(100);const contained=await page.locator('.group-card').evaluate(el=>{const c=el.getBoundingClientRect(),v=document.querySelector('.ecosystem-canvas').getBoundingClientRect();return {fits:c.top>=v.top&&c.bottom<=v.bottom,card:c.toJSON(),viewport:v.toJSON()};});await page.screenshot({path:'test-results/group-long-800.png'});assert.ok(contained.fits,JSON.stringify(contained));await button('View modules').click();await page.waitForTimeout(60);await page.locator('.map-group-label').first().click();assert.ok(await button('View repos').isVisible());assert.equal(await page.locator('.scope-actions').count(),0);
 assert.deepEqual(errors,[]);await writeFile('test-results/group-node-browser.json',JSON.stringify({passed:true,evidence,errors},null,2));console.log({passed:true,evidence});
}finally{await browser.close();}
