import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true}),credits=async()=>Number(await page.locator('[data-credits]').getAttribute('data-credits'));
try{
 await mkdir('test-results',{recursive:true});await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/');
 const primary=await button('Start game').evaluate(e=>getComputedStyle(e).backgroundColor);await button('Start game').click();
 const summary=page.locator('.system-inspect');assert.equal(await summary.evaluate(e=>e.tagName),'DIV');await summary.click();assert.equal(await page.locator('.system-actions').count(),0);
 assert.notEqual(await summary.evaluate(e=>getComputedStyle(e).backgroundColor),primary);
 assert.notEqual(await button('Open company story').evaluate(e=>getComputedStyle(e).backgroundColor),primary);
 assert.notEqual(await button('Recon logo').evaluate(e=>getComputedStyle(e).backgroundColor),primary);assert.notEqual(await page.locator('.work-slot').first().evaluate(e=>getComputedStyle(e).backgroundColor),primary);
 await page.clock.runFor(75000);assert.equal(await button('Scan Backend').evaluate(e=>getComputedStyle(e).backgroundColor),primary);
 await button('Scan Backend').click();await page.clock.runFor(3000);await button('Invest 150 credits').click();while(await credits()<30)await page.clock.runFor(1000);
 const money=await credits();assert.ok(money<45);assert.match(await button('Fix Backend').innerText(),/Fix 2\/3 · 30 cr/);
 await button('Fix Backend').click();assert.equal(await credits(),Math.round((money-30)*100)/100);assert.equal(await page.locator('.work-slot.occupied').count(),2);assert.equal(await page.locator('.system-actions').count(),0);assert.equal(await button('Fix Backend').isDisabled(),true);
 await page.clock.runFor(15000);assert.equal(await button('Fix Backend').isEnabled(),true);await button('Fix Backend').click();await page.clock.runFor(5000);
 await button('Find Backend').click();assert.equal(await page.getByRole('article',{name:'Backend system',exact:true}).evaluate(e=>e===document.activeElement),true);
 for(const [width,height] of [[1280,800],[1024,768],[800,700]]){await page.setViewportSize({width,height});await page.screenshot({path:`test-results/direct-actions-${width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight),false);}
 assert.equal(/\brepair(?:s|ed|ing)?\b/i.test(await page.locator('body').innerText()),false);assert.deepEqual(errors,[]);
 await writeFile('test-results/direct-actions-browser.json',JSON.stringify({passed:true,errors},null,2));console.log({passed:true,errors});
}finally{await browser.close();}
