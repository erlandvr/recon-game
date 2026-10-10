import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const browser=await chromium.launch({headless:true});
const evidence=[],errors=[];
try {
 for(const reduced of [false,true]) {
  const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const button=name=>page.getByRole('button',{name,exact:true});
  const tick=async seconds=>{await page.clock.runFor(seconds*1000);await page.waitForTimeout(25);};
  const progress=async()=>Number(await page.locator('[data-healthy-time]').getAttribute('data-healthy-time'));
  const world=async()=>page.locator('.world-time time').innerText();
  await page.clock.install({time:new Date('2026-10-10T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-10T12:00:00Z'));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173');await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();
  assert.equal(await page.locator('.chapter-completion').count(),0);
  const speed=reduced?2:1;if(reduced)await button('Double speed').click();
  // Earn the first milestone through ordinary paid scans and repairs.
  for(let n=0;n<80&&(await progress())<110;n++) {
   if(await button('Scan Backend').isEnabled()) {await button('Scan Backend').click();await tick(3/speed);}
   if(await button('Repair Backend').isEnabled()) {await button('Repair Backend').click();await tick(5/speed);}
   if(await progress()<110)await tick(Math.min(5,110-await progress())/speed);
  }
  assert.ok(await progress()>=110&&await progress()<120);assert.match(await page.locator('.progress-clock dt').innerText(),/Almost there/);
  await page.screenshot({path:`test-results/chapter-near-${reduced?'reduced':'motion'}.png`});
  await tick((120-await progress())/speed);await page.locator('.chapter-completion').waitFor();
  assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await progress(),120);assert.match(await page.locator('.clock-complete dt').innerText(),/Chapter 1 complete/);
  assert.equal(await page.locator('.session-track i').evaluate(e=>e.style.width),'100%');
  const animation=await page.locator('.clock-complete').evaluate(e=>getComputedStyle(e).animationName);assert.equal(animation==='none',reduced);
  for(const [width,height] of [[1280,800],[800,700],[390,844]]) {
   await page.setViewportSize({width,height});
   const issues=await page.evaluate(()=>{
    const out=[];for(const e of document.querySelectorAll('.clock-complete,.chapter-completion,.chapter-completion h1,.chapter-completion p')) {
     const r=e.getBoundingClientRect();if(r.right>innerWidth+1||r.bottom>innerHeight+1||e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2)out.push(e.className);
    }
    if(document.documentElement.scrollHeight>innerHeight+1)out.push('page scroll');return out;
   });assert.deepEqual(issues,[]);
   await page.screenshot({path:`test-results/chapter-complete-${reduced?'reduced':'motion'}-${width}.png`});
  }
  const before=await world();await tick(1);assert.notEqual(await world(),before);assert.equal(await progress(),120);assert.equal(await page.getByRole('dialog').count(),0);
  if(!reduced) {
   await tick(1);assert.equal(await page.getByRole('dialog').count(),0);
   await tick(.5);await page.getByRole('dialog',{name:'Your company story'}).waitFor();assert.match(await page.locator('.story-title').innerText(),/Chapter 2/);
   await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();assert.equal(await page.locator('.chapter-completion').count(),0);
   await tick(3);assert.equal(await page.getByRole('dialog').count(),0);
   evidence.push('Paid first chapter: near-goal cue, 02:00 full clock, visible animation, 2.4-second delay, live world and once-only introduction.');
  } else {
   await button('View log').click();await tick(4);assert.equal(await page.getByRole('dialog',{name:'Operation log'}).count(),1);
   await button('Close log').click();await page.locator('.chapter-completion').waitFor();await tick(1);assert.equal(await page.getByRole('dialog').count(),0);
   await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await tick(4);assert.equal(await page.getByRole('dialog').count(),0);
   await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await page.locator('.chapter-completion').waitFor();await tick(1);assert.equal(await page.getByRole('dialog').count(),0);
   await button('Restart operation').click();await button('Start fresh').click();await page.getByRole('dialog',{name:'Your company story'}).waitFor();assert.match(await page.locator('.story-title').innerText(),/Chapter 1/);await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();await tick(3);assert.equal(await page.getByRole('dialog').count(),0);
   evidence.push('Reduced motion and 2×: same readable interval; other dialogs/hidden page defer feedback; restart cancels the old pending modal.');
  }
  await context.close();
 }
 assert.deepEqual(errors,[]);await writeFile('test-results/completion-browser.json',JSON.stringify({passed:true,evidence,errors},null,2));console.log({passed:true,evidence});
}finally {await browser.close();}
