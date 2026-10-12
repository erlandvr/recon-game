import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:Number(process.env.SPEED_WIDTH??1280),height:Number(process.env.SPEED_HEIGHT??800)}}),errors=[],evidence=[];
page.on('pageerror',e=>errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true});
let briefings=0;
const tick=async n=>{
 if(!await page.locator('[data-speed-time]').count()){if(n>0)await page.clock.runFor(n*1000);await page.waitForTimeout(20);return;}
 const target=await elapsed()+Math.max(0,n);
 if(n>0)await page.clock.runFor(n*1000);await page.waitForTimeout(20);
 if(await button('Dive Back In').isVisible()){
  briefings++;
  const snapshot=async()=>page.locator('.operation-strip').innerText();const before=await snapshot(),at=await elapsed(),count=await page.locator('.repo-dot').count();
  await page.clock.runFor(30000);await page.waitForTimeout(20);assert.equal(await elapsed(),at);assert.equal(await snapshot(),before);assert.equal(await page.locator('.repo-dot').count(),count);
  await check('automation-briefing');await button('Dive Back In').click();
  if(target>at)await tick(target-at);
 }
};
const elapsed=async()=>Number(await page.locator('[data-speed-time]').getAttribute('data-speed-time'));
async function check(label){
 await page.waitForTimeout(300);
 const issues=await page.evaluate(()=>{
  const issues=[],box=e=>e.getBoundingClientRect();
  if(document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1)issues.push('Page overflow');
  const d=document.querySelector('dialog');if(d&&(d.scrollHeight>d.clientHeight+2||box(d).top<0||box(d).bottom>innerHeight))issues.push('Dialog overflow');
  if(!d){
   const map=document.querySelector('.speed-game .ecosystem'),upgrades=document.querySelector('.investments'),guide=document.querySelector('.speed-guide');
   if(map&&upgrades&&box(map).bottom>box(upgrades).top+1)issues.push('Map overlaps upgrades');
   if(map&&guide&&box(guide).bottom>box(map).top+1)issues.push('Guide overlaps map');
   const ticker=document.querySelector('.event-ticker'),bottom=document.querySelector('.canvas-bottom');if(upgrades&&ticker&&box(upgrades).bottom>box(ticker).top+1)issues.push('Upgrades overlap ticker');if(map&&bottom&&box(bottom).bottom>box(map).bottom+1)issues.push('Map controls clipped');
  }
  return issues;
 });await page.screenshot({path:`test-results/speed-${label}.png`});assert.deepEqual(issues,[],label);evidence.push(label);
}
try{
 await mkdir('test-results',{recursive:true});await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));
 await page.goto('http://127.0.0.1:5173/');await check('choice');await button('Choose Speed Game').click();await check('intro');await tick(30);assert.equal(await elapsed(),0);await button('Start Speed Game').click();await check('start');assert.equal(await button('Double speed').count(),0);
 const plan=JSON.parse(await readFile('test-results/speed-plan.json','utf8'));
 let seenPhase=0;
 for(const {at,action} of plan.actions){
  await tick(at-await elapsed());
  if(action.type==='scan'||action.type==='repair-repository'||action.type==='automate'||action.type==='auto-repair'){
   const id=action.serviceId??'backend';
   if(await page.getByLabel('Find repository').count())await page.getByLabel('Find repository').selectOption(id);
   // Repository name comes from the accessible article rendered by the real map.
   const node=page.locator(`.system-card.node-${id}`);await node.waitFor();
   const inside=await node.evaluate(el=>{const c=el.getBoundingClientRect(),v=document.querySelector('.ecosystem-canvas').getBoundingClientRect();return {fits:c.top>=v.top&&c.bottom<=v.bottom,card:c.toJSON(),canvas:v.toJSON()};});assert.ok(inside.fits,`Focused card clipped at ${at}: ${JSON.stringify(inside)}`);
   let target;if(action.type==='scan')target=node.getByRole('button',{name:/^Scan /});
   if(action.type==='repair-repository')target=node.getByRole('button',{name:/^Fix /});
   if(action.type==='automate')target=node.getByRole('button',{name:/^Automate .* scans for/});
   if(action.type==='auto-repair')target=node.getByRole('button',{name:/^Automate .* fixes for/});
   assert.ok(await target.isEnabled(),JSON.stringify({at,action}));await target.click();
  }else if(action.type==='upgrade'){
   await (action.upgrade==='capacity'?button(/^\+ Add work slot/):page.locator('.investments article').filter({hasText:action.upgrade==='scanning'?'Faster scans':'Faster fixes'}).getByRole('button')).click();
  }else if(action.type==='efficiency')await button(/^Buy scan efficiency tier/).click();
  if(at>seenPhase*65){await check(`play-${seenPhase}`);seenPhase++;}
 }
 await tick(plan.result.at-await elapsed());await page.getByRole('dialog',{name:'Full autonomy achieved',exact:true}).waitFor();assert.equal(await elapsed(),plan.result.at);await check('victory');await tick(10);assert.equal(await elapsed(),plan.result.at);
 await button('Continue practising').click();await tick(2);assert.equal(await elapsed(),plan.result.at+2);await button('View result').click();assert.match(await page.locator('.speed-result').innerText(),/Gold medal/i);await button('Back to practice').click();
 assert.equal(briefings,1,'Automation introduction shown once per run');
 await button('New game').click();await button('Restart Speed Game').click();await button('Start Speed Game').click();assert.ok(await button('Scan Backend').isVisible());await tick(600);assert.equal(await elapsed(),600);assert.equal(await page.getByRole('dialog').count(),0);assert.match(await page.locator('.speed-clock').innerText(),/Past 05:00/);await check('past-target');
 await button('Scan Backend').click();await tick(3);await button('Fix Backend').click();await tick(5);assert.equal(briefings,2,'Restart permits a fresh introduction');assert.equal(await elapsed(),608);
 for(const [width,height] of [[1024,768],[800,700]]){await page.setViewportSize({width,height});await page.waitForTimeout(100);await tick(1);await check(`past-target-${width}`);}
 await button('New game').click();await button('Choose game mode').click();await button('Choose Long Game').click();await button('Start game').waitFor();await tick(10);assert.equal(await page.locator('.world-time time').innerText(),'00:00');await button('Start game').click();await tick(2);assert.equal(await page.locator('.world-time time').innerText(),'00:02');assert.ok(await button('Double speed').count());
 assert.deepEqual(errors,[]);await writeFile('test-results/speed-browser.json',JSON.stringify({passed:true,evidence,finish:plan.result.at,errors},null,2));console.log({passed:true,evidence,finish:plan.result.at});
}catch(e){await page.screenshot({path:'test-results/speed-failure.png'});throw e;}finally{await browser.close();}
