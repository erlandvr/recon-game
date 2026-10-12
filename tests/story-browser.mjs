import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
await context.addInitScript(()=>{for(const k of ['localStorage','sessionStorage','indexedDB'])Object.defineProperty(window,k,{get(){throw Error(`Unexpected storage: ${k}`)}});});
const page=await context.newPage(),errors=[],evidence=[];page.on('pageerror',e=>errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true});
const dismissStory=async()=>{if(await page.locator('.chapter-completion').count()){await page.clock.runFor(3700);}await button(/^(Start game|Start Next Chapter|Keep playing)$/).waitFor({state:'visible'});await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();};
const tick=async s=>page.clock.runFor(s*1000);
async function debug(name){if(!await button('Debug').count()){for(let n=0;n<3;n++)await button('Recon logo').click();}else await button('Debug').click();await page.getByRole('button',{name:new RegExp(`^${name} `)}).click();await dismissStory();}
async function bounds(label){
 const issues=await page.evaluate(()=>{
  const bad=[];if(document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1)bad.push('page overflow');
  for(const e of document.querySelectorAll('.story-guide,.chapter-line,.chapter-goal,.next-move,.system-card,.growth,.map-upgrades,.canvas-bottom,.scope-actions,dialog[open]')){
   if(!e.getClientRects().length||e.closest('.ecosystem-canvas'))continue;
   const r=e.getBoundingClientRect(),parent=e.closest('.session-network,.corporate-ecosystem'),p=parent?.getBoundingClientRect();
   if(r.bottom>innerHeight+1||r.right>innerWidth+1||r.left<0||e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2||(p&&(r.top<p.top-1||r.bottom>p.bottom+1)))bad.push({text:e.textContent.slice(0,65),selector:e.className,top:r.top,bottom:r.bottom,parent:p?.bottom,scroll:e.scrollHeight-e.clientHeight});
  }
  const world=document.querySelector('.map-world'),ticker=document.querySelector('.event-ticker');
  if(world?.getClientRects().length){const children=[...world.children];for(let i=0;i<children.length-1;i++)if(children[i].getBoundingClientRect().bottom>children[i+1].getBoundingClientRect().top+1)bad.push('overlapping world sections');if(children.at(-1).getBoundingClientRect().bottom>ticker.getBoundingClientRect().top+1)bad.push('investments overlap event ticker');}
  return bad;
 });
 await page.screenshot({path:`test-results/${label}.png`,fullPage:true});assert.deepEqual(issues,[],label);evidence.push(label);
}
try{
 await mkdir('test-results',{recursive:true});await page.clock.install({time:new Date('2026-10-10T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-10T12:00:00Z'));await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173/');
 assert.equal(await page.locator('.story-guide').getAttribute('data-chapter'),'1');await dismissStory();
 for(const [w,h] of [[1280,800],[800,700]]){await page.setViewportSize({width:w,height:h});await bounds(`story-start-${w}`);await button('Plan investment').click();assert.match(await page.getByRole('dialog').innerText(),/Keep 20 cr/);await bounds(`story-plan-${w}`);await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();}
 await tick(15);await button('Find Backend').click();assert.equal(await page.getByRole('article',{name:'Backend system',exact:true}).evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('.system-actions').count(),0);
 await button('Open company story').click();await tick(3);assert.equal(await page.locator('.world-time time').innerText(),'00:15');await page.keyboard.press('Escape');assert.equal(await button('Open company story').evaluate(e=>e===document.activeElement),true);
 for(const [name,chapter] of [['Growing backend',1],['Connected systems',2],['Corporate expansion',3],['100-repository company',5],['Autonomy trial',5]]){
  await debug(name);assert.equal(await page.locator('.story-guide').getAttribute('data-chapter'),String(chapter));
  if(name==='Connected systems'){await button('Find Backend').click();assert.equal(await page.getByRole('article',{name:'Backend system',exact:true}).evaluate(e=>e===document.activeElement),true);}
  if(name==='Corporate expansion'){await button('Find Backend').click();await page.clock.runFor(34);await page.getByRole('article',{name:'Backend system',exact:true}).waitFor({state:'visible'});assert.equal(await page.getByRole('article',{name:'Backend system',exact:true}).isVisible(),true);assert.equal(await page.locator('.system-actions').count(),0);}

  for(const [w,h] of [[1280,800],[1024,768],[800,700]]){await page.setViewportSize({width:w,height:h});await bounds(`story-${name.replaceAll(' ','-')}-${w}`);}
 }
 assert.equal(await button('Find Backend').count(),0);await tick(180);assert.equal(await page.locator('.story-guide').getAttribute('data-chapter'),'6');
 await dismissStory();await button('Open company story').click();assert.equal(await page.locator('.victory-summary').count(),1);await bounds('story-victory-phone');await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();
 await debug('Starting backend');assert.equal(await page.locator('.story-guide').getAttribute('data-chapter'),'1');
 assert.deepEqual(errors,[]);await writeFile('test-results/story-browser.json',JSON.stringify({passed:true,evidence,errors},null,2));console.log(JSON.stringify({passed:true,evidence,errors}));
}catch(error){await page.screenshot({path:'test-results/story-failure.png',fullPage:true});throw error;}finally{await browser.close();}
