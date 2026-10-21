import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {advanceV3, buyV3, featuresAvailable, newV3, startV3, type Purchase} from '../src/v3Game.ts';
const require=createRequire(import.meta.url), {chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(), dir='test-results/v3-onboarding', errors:string[]=[];
await mkdir(dir,{recursive:true});
const page=await browser.newPage({viewport:{width:1280,height:720}});
page.on('pageerror',(e:Error)=>errors.push(e.message));
let s=newV3();
const button=(name:string)=>page.getByRole('button',{name,exact:true});
const hint=()=>page.locator('.v3-footer').getAttribute('data-hint');
async function check(){
  const actual=await page.locator('.v3-game').evaluate((e:HTMLElement)=>({time:+e.dataset.time!,cash:+e.dataset.cash!,status:e.dataset.status}));
  assert.equal(actual.time,s.time);assert.ok(Math.abs(actual.cash-s.cash)<1e-6);assert.equal(actual.status,s.status);
  assert.equal(await page.locator('[data-feature-backlog]').count(),featuresAvailable(s)?1:0);
  assert.ok(await page.locator('.v3-purchases [data-guided=true],.v3-world [data-guided=true],[data-guidance-worker=true],[data-guidance-recon=true],[data-guidance-backlog=true],.v3-income[data-guided=true]').count()<=1,'one teaching focus');
}
async function advance(seconds:number){for(let i=0;i<Math.round(seconds/.05);i++){await page.clock.runFor(50);s=advanceV3(s,.05);}await check();}
async function buy(action:Purchase){await page.locator(`[data-purchase=${action}]`).click();s=buyV3(s,action);await check();}
async function reset(){await button('Restart').click();await button('Start fresh').click();s=newV3();await button('Get your intro').click();await page.clock.runFor(10000);s=startV3(s);await check();}
async function fit(){assert.deepEqual(await page.evaluate(()=>{
  const faults:string[]=[];if(document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight)faults.push('page overflow');
  for(const el of document.querySelectorAll('.v3-footer,.v3-footer button,.v3-purchases button,.v3-purchase-receipt')){const r=el.getBoundingClientRect();if(r.left<0||r.top<0||r.right>innerWidth+1||r.bottom>innerHeight+1)faults.push(el.textContent!);}
  return faults;
}),[]);}
try{
  const date=new Date('2026-10-21T10:00:00Z');await page.clock.install({time:date});await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL??'http://127.0.0.1:5175/');
  assert.doesNotMatch(await page.locator('.v3-opening').innerText(),/P1|wages|as fast as/);
  await page.screenshot({path:`${dir}/opening.png`});
  await button('Get your intro').click();await page.clock.runFor(10000);s=startV3(s);await check();
  await buy('system');assert.equal(await hint(),'build');assert.match(await page.locator('[data-purchase=system]').innerText(),/Ordered/);
  await advance(4);assert.equal(await hint(),'build');assert.equal(await page.locator('[data-purchase=developer]').getAttribute('data-guided'),'false');
  await page.screenshot({path:`${dir}/building.png`});
  while(!s.systems[1].installed)await advance(.05);
  assert.equal(await hint(),'installed');await page.screenshot({path:`${dir}/installed.png`});
  await advance(2);assert.equal(await page.locator('.v3-income').getAttribute('data-guided'),'true');
  await page.screenshot({path:`${dir}/income.png`});await advance(1.95);assert.equal(featuresAvailable(s),false);
  await advance(.05);assert.equal(featuresAvailable(s),true);assert.notEqual(await hint(),'installed');
  await page.screenshot({path:`${dir}/features-revealed.png`});
  while(s.time<22)await advance(.05);assert.equal(await hint(),'failure');
  const before=s.time;await advance(1);assert.ok(s.time>before,'explanation never pauses simulation');
  await page.screenshot({path:`${dir}/maintenance.png`});
  await advance(15);
  // Real paid queue: wait until two systems and a hire can all be afforded.
  while(s.cash<145)await advance(.5);
  await buy('system');await buy('system');assert.equal(await hint(),'hire');
  await page.screenshot({path:`${dir}/hiring.png`});await buy('developer');assert.notEqual(await hint(),'hire');
  assert.match(await page.locator('[data-purchase=developer]').innerText(),/Hired/);
  for(const [width,height] of [[1024,768],[1280,720],[1440,900],[1920,1080]]){await page.setViewportSize({width,height});await fit();await page.screenshot({path:`${dir}/workshop-${width}.png`});}
  await page.setViewportSize({width:1280,height:720});
  while(!await page.locator('[data-purchase=recon]').isEnabled())await advance(.5);
  await buy('recon');
  for(let i=0;i<800 && await hint()!=='recon-repair';i++)await advance(.05);
  assert.equal(await hint(),'recon-repair');await page.screenshot({path:`${dir}/recon-handoff.png`});
  await button('Hide guidance').click();assert.equal(await hint(),'');await buy('system');assert.match(await page.locator('[data-purchase=system]').innerText(),/Ordered/);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.v3-game')?.getAttribute('data-reduced')==='true');assert.equal(await page.locator('.v3-game').getAttribute('data-reduced'),'true');await fit();
  await reset();assert.equal(await hint(),'first');assert.equal(await button('Hide guidance').count(),1);
  // Same purchases/times and hidden guidance must yield identical economy and feature release.
  await buy('system');await advance(20);const guided=structuredClone(s);
  await reset();await button('Hide guidance').click();await buy('system');await advance(20);assert.deepEqual(s,guided);assert.equal(await hint(),'');
  await reset();await buy('developer');assert.equal(await hint(),'');await advance(5);assert.equal(await hint(),'first');assert.equal(featuresAvailable(s),false);
  await buy('system');while(!featuresAvailable(s))await advance(.25);await check();
  assert.deepEqual(errors,[]);await writeFile(`${dir}/results.json`,JSON.stringify({checks:['short opening','one focus','build before hire','installation and income exposure','delayed backlog and actual dispatch','first maintenance without pause','paid queue hiring','real Recon repair','four desktop layouts','hidden guidance preserves economy and receipts','replay resets','hire-first','reduced motion'],errors},null,2));
  console.log('Guided first play browser checks passed');
}finally{await browser.close();}
