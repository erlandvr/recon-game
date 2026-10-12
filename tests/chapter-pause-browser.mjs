import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true});
const tick=async seconds=>{await page.clock.runFor(seconds*1000);await page.waitForTimeout(20);};
const world=async()=>{const [m,s]=(await page.locator('.world-time time').innerText()).split(':').map(Number);return m*60+s;};
const snapshot=()=>page.evaluate(()=>Object.fromEntries(['.operation-strip','.slot-list','.queue-summary','.system-inspect','.event-ticker','.autonomy-progress'].map(selector=>[selector,[...document.querySelectorAll(selector)].map(e=>e.textContent)])));
async function freeze(label){
 const before=await snapshot();await tick(60);assert.deepEqual(await snapshot(),before,`${label}: simulation changes while reading`);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.clock.fastForward(300000);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 assert.deepEqual(await snapshot(),before,`${label}: hidden reading time catches up`);
 checks.push(label);
}
async function debug(name){
 if(!await button('Debug').count()){for(let i=0;i<3;i++)await button('Recon logo').click();}else await button('Debug').click();
 await page.getByRole('button',{name:new RegExp(`^${name} `)}).click();await page.getByRole('dialog').waitFor();
}
try{
 await mkdir('test-results',{recursive:true});await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));await page.goto(process.env.GAME_URL??'http://127.0.0.1:5173');await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();
 assert.match(await page.getByRole('dialog').innerText(),/new Recon operator/);
 assert.equal(await page.locator('.opening-medals,.chapter-list,.story-advice').count(),0);
 for(const [width,height] of [[1280,800],[800,700]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.getByRole('dialog').evaluate(e=>e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth),false);
  await page.screenshot({path:`test-results/arcade-intro-${width}.png`});
 }
 await freeze('Opening briefing');await page.keyboard.press('Escape');assert.equal(await world(),0);
 await button('Start game').click();await tick(15);assert.match(await page.locator('.next-move h1').innerText(),/First problem detected/);
 await tick(60);await button('Scan Backend').click();await tick(3);await button('Fix Backend').click();assert.match(await page.locator('.queue-summary').innerText(),/2/);
 await tick(1);await button('Open company story').click();await freeze('Reopened briefing with running fix and queued findings');
 const t=await world();await page.keyboard.press('Escape');assert.equal(await world(),t);await tick(1);assert.equal(await world(),t+1);
 // Other dialogs remain live; only chapter briefings suspend the ecosystem.
 await button('View log').click();const logTime=await world();await tick(2);assert.equal(await world(),logTime+2);await button('Close log').click();
 await button('Double speed').click();await debug('Connected systems');await freeze('Chapter 2 at double speed');
 const connectedTime=await world();await button('Start Next Chapter').click();await tick(2);assert.equal(await world(),connectedTime+4);
 await debug('Autonomy trial');await freeze('Chapter 5 automation/trial');await button('Start Next Chapter').click();
 for(let i=0;i<100&&!(await page.getByRole('dialog').count());i++)await tick(2);
 await page.getByRole('dialog',{name:'Full autonomy achieved'}).waitFor();await freeze('Automatic victory chapter');
 await page.screenshot({path:'test-results/arcade-victory-800.png'});
 const victoryTime=await world();await button('Keep playing').click();await tick(2);assert.equal(await world(),victoryTime+4);
 await button('Restart operation').click();await button('Start fresh').click();await freeze('Restart returns to waiting');assert.equal(await world(),0);
 assert.deepEqual(errors,[]);await writeFile('test-results/chapter-pause-browser.json',JSON.stringify({passed:true,checks,errors},null,2));console.log({passed:true,checks});
}catch(e){await page.screenshot({path:'test-results/chapter-pause-failure.png'});throw e;}finally{await browser.close();}
