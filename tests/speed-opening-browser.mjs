import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`),browser=await chromium.launch(),errors=[];
try{
 await mkdir('test-results',{recursive:true});
 for(const motion of ['no-preference','reduce']){
  const p=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:motion});p.on('pageerror',e=>errors.push(e.message));
  const start=new Date('2026-10-12T12:00:00Z');await p.clock.install({time:start});await p.clock.pauseAt(start);
  await p.goto(process.env.GAME_URL??'http://127.0.0.1:5173');
  const button=name=>p.getByRole('button',{name,exact:true}),cue=p.locator('.sg-opening-cta'),choose=id=>p.getByLabel('Find system',{exact:true}).selectOption(id);
  const expectCue=async locator=>{assert.equal(await cue.count(),1);assert.equal(await locator.evaluate(el=>el.classList.contains('sg-opening-cta')),true);assert.ok(await locator.isEnabled());};
  await button('Choose Speed Game').click();assert.equal(await cue.count(),0,'opening dialog has no play cue');
  await button('LET’S GO').click();await p.clock.runFor(3000);await expectCue(button('Scan · 5 cr'));
  assert.equal(await cue.evaluate(el=>getComputedStyle(el).animationName),motion==='reduce'?'none':'sg-opening-cue');
  await p.screenshot({path:`test-results/speed-opening-scan-${motion}.png`});
  assert.equal(await p.getByLabel('Find system',{exact:true}).locator('option').count(),1);
  await p.getByRole('button',{name:'Pause & plan',exact:true}).click();assert.equal(await cue.count(),0,'paused upgrade view has no cue');
  await button('Resume game').click();await expectCue(button('Scan · 5 cr'));
  // Bundled actions also complete the same opening sequence.
  await p.locator('.sg-company').click();await expectCue(button('Scan · 5 cr'));
  await button('Scan · 5 cr').click();assert.equal(await cue.count(),0,'scan started');
  await p.clock.runFor(3000);await expectCue(button('Fix · 15 cr'));
  await button('Back to system').click();await expectCue(button('Fix 1 · 15 cr'));
  await button('Fix 1 · 15 cr').click();assert.equal(await cue.count(),0,'fix started');
  await p.clock.runFor(5000);assert.equal(await cue.count(),0,'restoration ends opening guidance');
  await p.clock.runFor(8500);assert.equal(await p.locator('[data-system]').count(),3);assert.equal(await cue.count(),0);assert.equal(await p.getByRole('button',{name:/Buy system/}).count(),0);
  await choose('backend');assert.equal(await cue.count(),0);await p.close();
 }
 assert.deepEqual(errors,[]);console.log('Speed opening cues pass: ordered actions, group scan, natural arrival, pause, completion, reduced motion.');
}finally{await browser.close();}
