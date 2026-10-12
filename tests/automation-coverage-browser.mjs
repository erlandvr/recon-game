import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));const button=name=>page.getByRole('button',{name,exact:true});
async function debug(name){if(!await button('Debug').count()){for(let n=0;n<3;n++)await button('Recon logo').click();}else await button('Debug').click();await page.getByRole('button',{name:new RegExp(`^${name} `)}).click();await button('Start Next Chapter').click();}
try{
 await mkdir('test-results',{recursive:true});await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));await page.goto('http://127.0.0.1:5173/');await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();await button('Start game').click();assert.equal(await page.locator('.fully-automated').count(),0);
 await debug('Connected systems');assert.equal(await page.locator('.fully-automated').count(),0);
 await debug('Autonomy trial');await page.waitForTimeout(100);
 const groups=page.locator('.map-group-label');assert.ok(await groups.count()>0);assert.equal(await groups.count(),await page.locator('.map-group-label.fully-automated').count());assert.equal(await groups.count(),await groups.locator('.automation-badge').count());assert.equal(await groups.first().evaluate(el=>getComputedStyle(el,'::before').borderTopStyle),'solid');
 await page.screenshot({path:'test-results/automated-projects.png'});
 await groups.first().click();await page.waitForTimeout(100);assert.ok(await page.locator('.map-group-label.fully-automated .automation-badge').count()>0);await page.screenshot({path:'test-results/automated-modules.png'});
 await page.getByLabel('Find repository').selectOption('backend');await page.waitForTimeout(100);const card=page.getByRole('article',{name:'Backend system',exact:true});assert.match(await card.getAttribute('class'),/fully-automated/);assert.equal(await card.locator('.automation-badge').innerText(),'✓ Automated');await page.screenshot({path:'test-results/automated-repository.png'});
 await button('Zoom out').click();await page.waitForTimeout(100);assert.ok(await page.locator('.map-repo-label.fully-automated .automation-badge').count()>0);
 assert.deepEqual(errors,[]);await writeFile('test-results/automation-coverage-browser.json',JSON.stringify({passed:true,errors},null,2));console.log({passed:true,errors});
}finally{await browser.close();}
