import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const url=process.env.GAME_URL||'http://127.0.0.1:4174/recon-game/';
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(`${r.url()}: ${r.failure()?.errorText}`));
const button=name=>page.getByRole('button',{name,exact:true});
try{
 await page.clock.install({time:new Date('2026-10-10T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-10T12:00:00Z'));
 const response=await page.goto(url);assert.equal(response.status(),200);await button('Start game').waitFor();await page.clock.runFor(10000);assert.equal(await page.locator('.world-time time').innerText(),'00:00');
 assert.ok((await page.locator('script[src]').getAttribute('src')).startsWith('/recon-game/assets/'));
 await button('Start game').click();await page.clock.runFor(15000);await button('Scan Backend').click();await page.clock.runFor(3000);await button('Repair Backend').click();await page.clock.runFor(5000);assert.equal(await page.locator('.world-time time').innerText(),'00:23');assert.match(await page.locator('.node-backend').innerText(),/100%/);
 await mkdir('test-results',{recursive:true});
 for(const [width,height] of [[1280,800],[390,844]]){await page.setViewportSize({width,height});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1),false);await page.screenshot({path:`test-results/published-${width}.png`});}
 assert.deepEqual(errors,[]);await writeFile('test-results/published-browser.json',JSON.stringify({passed:true,url,checks:['production asset base','free rules reading','paid scan and repair','healthy recovery','desktop and phone bounds'],errors},null,2));console.log(`PASS: ${url}`);
}finally{await browser.close()}
