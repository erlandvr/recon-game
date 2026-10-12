import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'}),errors=[],evidence=[];
page.on('pageerror',e=>errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true});
async function debug(name){if(!await button('Debug').count()){for(let i=0;i<3;i++)await button('Recon logo').click();}else await button('Debug').click();await page.getByRole('button',{name:new RegExp(`^${name} `)}).click();await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();}
async function check(label,focused){
 await page.clock.runFor(34);await page.waitForTimeout(150);
 const issues=await page.evaluate(focused=>{
  const issues=[],cards=[...document.querySelectorAll('.system-card')],box=e=>e.getBoundingClientRect();
  const canvas=document.querySelector('.ecosystem-canvas');
  const visible=cards.filter(e=>!canvas||box(e).right>box(canvas).left&&box(e).left<box(canvas).right&&box(e).bottom>box(canvas).top&&box(e).top<box(canvas).bottom);
  for(const card of visible){const scan=card.querySelector('.node-automation'),repair=card.querySelector('.repair-automation');if(!scan||!repair)continue;
   const a=box(scan),b=box(repair),c=box(card);
   if(b.top<a.bottom-1||Math.abs(a.left-b.left)>1||Math.abs(a.right-b.right)>1)issues.push(`Automations not stacked: ${card.ariaLabel}`);
   for(const el of card.querySelectorAll('button,.automation-state,.fix-auto-state')){const r=box(el);if(r.left<c.left||r.right>c.right||r.bottom>c.bottom||el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2)issues.push(`Control overflow: ${el.textContent}`);}
  }
  for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){const a=box(visible[i]),b=box(visible[j]);if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)issues.push(`Cards overlap: ${visible[i].ariaLabel}, ${visible[j].ariaLabel}`);}
  if(focused){const card=cards.find(e=>e.ariaLabel===`${focused} system`);if(!card)issues.push(`Missing focused card: ${focused}`);else{const c=box(card),v=box(canvas);if(c.top<v.top||c.bottom>v.bottom||c.left<v.left||c.right>v.right)issues.push({clipped:focused,card:c.toJSON(),canvas:v.toJSON()});}}
  const bottom=document.querySelector('.canvas-bottom'),world=document.querySelector('.corporate-ecosystem');if(bottom&&box(bottom).bottom>box(world).bottom)issues.push('Map controls clipped');
  if(document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1)issues.push('Page overflow');
  return issues;
 },focused);
 await page.screenshot({path:`test-results/automation-${label}.png`});assert.deepEqual(issues,[],label);evidence.push(label);
}
try{
 await mkdir('test-results',{recursive:true});await page.clock.install({time:new Date('2026-10-10T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-10T12:00:00Z'));await page.goto(process.env.GAME_URL??'http://127.0.0.1:5173');await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();
 for(const checkpoint of ['Connected systems','Corporate expansion','Autonomy trial']){
  await debug(checkpoint);await page.clock.runFor(100000);if(await button(/^(Start game|Start Next Chapter|Keep playing)$/).isVisible())await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();
  for(const [width,height] of [[1440,1000],[1280,800],[1024,768],[800,700]]){
   await page.setViewportSize({width,height});await page.clock.runFor(50);await page.waitForTimeout(150);
   const corporate=checkpoint!=='Connected systems';if(corporate)await page.getByLabel('Find repository').selectOption('backend');
   await check(`${checkpoint.replaceAll(' ','-')}-${width}`,corporate?'Backend':null);
   if(corporate){await button('Zoom out').click();await check(`zoomed-${checkpoint.replaceAll(' ','-')}-${width}`,null);}
  }
 }
 assert.deepEqual(errors,[]);await writeFile('test-results/automation-layout-browser.json',JSON.stringify({passed:true,evidence,errors},null,2));console.log({passed:true,evidence});
}catch(e){await page.screenshot({path:'test-results/automation-failure.png'});throw e;}finally{await browser.close();}
