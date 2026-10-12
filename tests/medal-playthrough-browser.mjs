// Replay the benchmark through visible, ordinary paid controls. No injected game state.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {automationCost,newGame,advance,act,UPGRADES,efficiencyQuote} from '../src/game.ts';
import {repository} from '../src/organization.ts';
import {serviceOf} from '../src/campaign.ts';
import {finishTime} from '../src/medals.ts';
const data=JSON.parse(await readFile(process.env.MEDAL_PLAN||'test-results/medal-slots3-eff2-auto1-1.json','utf8'));
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
await context.addInitScript(seed=>{Math.random=()=>seed/0x100000000;for(const key of ['localStorage','sessionStorage','indexedDB'])Object.defineProperty(window,key,{get(){throw Error('Unexpected persistence');}});},data.report.seed);
const page=await context.newPage();page.setDefaultTimeout(7000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true});
let expected=newGame(data.report.seed),now=0;
async function dismiss(){const next=button(/^(Start game|Start Next Chapter)$/);if(await next.isVisible())await next.click();}
async function to(at){if(at>now){await page.clock.runFor((at-now)*1000);expected=advance(expected,at-now);now=at;}await dismiss();}
try{
 await mkdir('test-results',{recursive:true});await page.clock.install({time:new Date('2026-10-10T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-10T12:00:00Z'));await page.goto('http://127.0.0.1:5173');await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();await dismiss();
 for(const [index,item] of data.plan.entries()){
  await to(item.at);const a=item.action;
  const id=a.serviceId??(a.type==='repair'?serviceOf(expected.findings.find(f=>f.id===a.findingId)):'backend');
  const name=repository(expected,id).name;
  if(['scan','repair','repair-repository','automate','auto-repair'].includes(a.type)&&expected.campaign?.result){await page.getByLabel('Find repository').selectOption(id);await page.waitForTimeout(10);}
  if(a.type==='efficiency'){const q=efficiencyQuote(expected);await button(`Buy scan efficiency tier ${q.tier} for ${q.cost} credits`).click();}
  else if(a.type==='upgrade')await button(`Invest ${UPGRADES[a.upgrade].cost} credits`).click();
  else if(a.type==='scan')await button(`Scan ${name}`).click();
  else if(a.type==='repair-repository')await button(`Fix ${name}`).click();
  else if(a.type==='automate')await button(`Automate ${name} scans for ${automationCost(expected)} credits`).click();
  else if(a.type==='auto-repair')await button(`Automate ${name} fixes for 480 credits`).click();
  else if(a.type==='repair'){await button(`Inspect ${name}`).click();await button(`Fix finding ${a.findingId}`).click();await page.keyboard.press('Escape');}
  else throw Error(`Unexpected action ${a.type}`);
  const result=act(expected,a);assert.ok(result.ok);expected=result.state;
  if(index%100===0){assert.equal(Number(await page.locator('[data-credits]').getAttribute('data-credits')),expected.credits);console.log(`Paid actions ${index}/${data.plan.length}; elapsed ${now}s`);}
 }
 await to(data.report.finish+3);await page.getByRole('dialog',{name:'Full autonomy achieved',exact:true}).waitFor();
 const result=page.getByRole('region',{name:'Autonomy result'});
 assert.equal(await result.locator('time').innerText(),finishTime(data.report.finish));assert.match(await result.innerText(),/Gold medal/);assert.doesNotMatch(await result.innerText(),/Practice|preview/);
 const frozen=await result.locator('time').innerText();await to(now+90);assert.equal(await result.locator('time').innerText(),frozen);
 for(const [width,height] of [[1280,800],[800,700],[390,844]]){await page.setViewportSize({width,height});await page.waitForTimeout(100);const overflow=await page.getByRole('dialog').evaluate(e=>({x:e.scrollWidth>e.clientWidth+1,y:e.scrollHeight>e.clientHeight+1}));assert.deepEqual(overflow,{x:false,y:false});await page.screenshot({path:`test-results/medal-earned-${width}.png`});}
 await button('Keep playing').click();await button('Victory').click();assert.equal(await result.locator('time').innerText(),frozen);await button('Back to ecosystem').click();
 await button('Restart operation').click();await button('Start fresh').click();await button('Start game').waitFor();assert.equal(await page.locator('.victory-summary').count(),0);
 assert.deepEqual(errors,[]);await writeFile('test-results/medal-playthrough-browser.json',JSON.stringify({passed:true,seed:data.report.seed,finish:data.report.finish,actions:data.plan.length,errors},null,2));console.log('PASS: fresh paid browser run, earned medal, frozen time, reopen, responsive layouts, restart.');
}catch(e){await page.screenshot({path:'test-results/medal-playthrough-failure.png'});throw e;}finally{await browser.close();}
