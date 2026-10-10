import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
await context.addInitScript(()=>{for(const key of ['localStorage','sessionStorage','indexedDB'])Object.defineProperty(window,key,{get(){throw Error(`Unexpected persistence: ${key}`)}});});
const page=await context.newPage(),errors=[],evidence=[];page.on('pageerror',e=>errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true});
const tick=async s=>page.clock.runFor(s*1000);
const chapter=async n=>{await page.getByRole('dialog',{name:n===6?'Full autonomy achieved':'Your company story'}).waitFor();assert.match(await page.locator('.story-title').innerText(),new RegExp(`^Chapter ${n} ·`));};
const close=async()=>button(/^(Start game|Start Next Chapter|Keep playing)$/).click();
async function debug(name,n){if(!await button('Debug').count()){for(let i=0;i<3;i++)await button('Recon logo').click();}else await button('Debug').click();await page.getByRole('button',{name:new RegExp(`^${name} `)}).click();await chapter(n);}
async function layout(name){
 const bad=await page.evaluate(()=>{
  const issues=[],clock=document.querySelector('.timer-controls'),time=clock.querySelector('time').getBoundingClientRect(),speed=clock.querySelector('button').getBoundingClientRect();
  if(speed.left-time.right<12)issues.push(`timer gap ${speed.left-time.right}`);
  const cells=[...document.querySelector('.operation-strip').children];
  for(const el of [...cells,...document.querySelectorAll('.health-status,.health-status strong,.health-status span,dialog[open]')]){
   if(!el.getClientRects().length)continue;const r=el.getBoundingClientRect();
   if(el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2||r.right>innerWidth+1)issues.push({element:el.className,text:el.textContent,overflow:el.scrollWidth-el.clientWidth});
  }
  const world=document.querySelector('.map-world'),children=[...world.children],ticker=document.querySelector('.event-ticker');
  for(let i=0;i<children.length-1;i++)if(children[i].getBoundingClientRect().bottom>children[i+1].getBoundingClientRect().top+1)issues.push('world overlap');
  if(children.at(-1).getBoundingClientRect().bottom>ticker.getBoundingClientRect().top+1)issues.push('ticker overlap');
  for(const el of document.querySelectorAll('.session-network .system-card')){const r=el.getBoundingClientRect(),p=el.parentElement.getBoundingClientRect();if(r.bottom>p.bottom+1||r.top<p.top-1)issues.push({issue:'clipped system',top:r.top,bottom:r.bottom,parentTop:p.top,parentBottom:p.bottom});}
  if(document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1)issues.push('page scroll');
  return issues;
 });
 await page.screenshot({path:`test-results/${name}.png`,fullPage:true});assert.deepEqual(bad,[],name);evidence.push(name);
}
try{
 await page.clock.install({time:new Date('2026-10-10T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-10T12:00:00Z'));await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173');await chapter(1);await layout('chapter-entry-1280');
 await tick(15);assert.equal(await page.locator('.world-time time').innerText(),'00:00');await close();
 assert.equal(await page.locator('.health-status').innerText(),'');await tick(16);assert.equal(Number(await page.locator('[data-healthy-time]').getAttribute('data-healthy-time')),16);await tick(29);
 assert.match(await page.locator('.health-status').innerText(),/System failure[\s\S]*Goal time held/);assert.equal((await page.locator('.income-penalty').innerText()).trim(),'−25%');assert.match(await page.locator('.income-metric dd').innerText(),/1.35/);
 const before=await page.locator('[data-healthy-time]').getAttribute('data-healthy-time');await tick(2);assert.equal(await page.locator('[data-healthy-time]').getAttribute('data-healthy-time'),before);assert.equal(await page.getByRole('dialog').count(),0);
 for(const [w,h] of [[1280,800],[1024,768],[800,700],[390,844]]){await page.setViewportSize({width:w,height:h});await layout(`health-failure-${w}`);}
 await button('Scan Backend').click();await tick(3);await button('Repair Backend').click();await tick(5);assert.equal(await page.locator('.health-status').innerText(),'');assert.equal(await page.locator('.income-penalty').count(),0);assert.match(await page.locator('.income-metric dd').innerText(),/1.90/);await tick(1);assert.ok(Number(await page.locator('[data-healthy-time]').getAttribute('data-healthy-time'))>Number(before));
 await debug('Connected systems',2);await close();await tick(100);assert.match(await page.locator('.health-status').innerText(),/System failure/);
 for(const [w,h] of [[1280,800],[1024,768],[800,700],[390,844]]){await page.setViewportSize({width:w,height:h});await layout(`ecosystem-failure-${w}`);}
 await debug('Corporate expansion',3);await close();assert.match(await page.locator('.chapter-goal').innerText(),/3\/25 repos.*80% needed/);
 await button('View log').click();await tick(132);assert.equal(await page.getByRole('dialog',{name:'Operation log'}).count(),1);await button('Close log').click();await tick(1);
 assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.locator('.story-guide').getAttribute('data-chapter'),'3');assert.match(await page.locator('.chapter-goal').innerText(),/25 repos reached.*Chapter held/);
 for(const [w,h] of [[1280,800],[800,700],[390,844]]){await page.setViewportSize({width:w,height:h});await layout(`chapter-three-held-${w}`);}
 await tick(450);assert.equal(await page.locator('[aria-label="Find repository"] option').count(),101);assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.locator('.story-guide').getAttribute('data-chapter'),'3');
 await debug('100-repository company',5);await close();await tick(100);assert.equal(await page.locator('.story-guide').getAttribute('data-chapter'),'5');assert.equal(await page.getByRole('dialog').count(),0);
 await debug('Autonomy trial',5);await close();await button('View log').click();await tick(180);assert.equal(await page.getByRole('dialog',{name:'Operation log'}).count(),1);await button('Close log').click();await page.locator('.chapter-completion').waitFor();await tick(2.5);await chapter(6);await layout('chapter-victory-390');await close();await tick(2);assert.equal(await page.getByRole('dialog').count(),0);
 await button('Restart operation').click();await button('Start fresh').click();await chapter(1);await page.keyboard.press('Escape');await tick(1);assert.equal(await page.getByRole('dialog').count(),1);assert.equal(await page.locator('.world-time time').innerText(),'00:00');await close();
 assert.deepEqual(errors,[]);await writeFile('test-results/feedback-browser.json',JSON.stringify({passed:true,evidence,errors},null,2));console.log({passed:true,evidence});
}catch(e){await page.screenshot({path:'test-results/feedback-failure.png',fullPage:true});throw e;}finally{await browser.close();}
