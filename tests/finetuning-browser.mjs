import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 window.audioNotes=0;window.AudioContext=class {
  state='suspended';currentTime=0;destination={};
  async resume(){this.state='running'} async suspend(){this.state='suspended'} async close(){this.state='closed'}
  createOscillator(){return {frequency:{value:0},connect(){},disconnect(){},start(){window.audioNotes++},stop(){}}}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
 };
});
const button=name=>page.getByRole('button',{name,exact:true});const tick=async s=>{await page.clock.runFor(s*1000);await page.waitForTimeout(20)};
try{
 await page.clock.install({time:new Date('2026-10-10T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-10T12:00:00Z'));await page.goto('http://127.0.0.1:5173');await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();
 const credits=await page.locator('.operation-strip').innerText();await tick(90);await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('dialog').count(),1);assert.equal(await page.locator('.operation-strip').innerText(),credits);assert.equal(await page.locator('.world-time time').innerText(),'00:00');
 await button('Start game').click();assert.equal(await button('Chapter sound').getAttribute('aria-pressed'),'false');assert.match(await page.locator('.medal-target').innerText(),/Gold/);
 await tick(15);await button('Scan Backend').click();await tick(3);await button('Fix Backend').click();await tick(5);
 assert.equal(await page.locator('.system-card').getAttribute('data-feedback'),'Fix complete');assert.equal(await page.locator('.system-card').evaluate(e=>getComputedStyle(e).animationName),'none');await tick(1);assert.equal(await page.locator('.system-card').getAttribute('data-feedback'),null);
 await button('Chapter sound').click();assert.equal(await button('Chapter sound').getAttribute('aria-pressed'),'true');
 const progress=async()=>Number(await page.locator('[data-healthy-time]').getAttribute('data-healthy-time'));
 for(let n=0;n<100&&(await progress())<120;n++){
  if(await button('Scan Backend').isEnabled()){await button('Scan Backend').click();await tick(3)}
  if(await button('Fix Backend').isEnabled()){await button('Fix Backend').click();await tick(5)}
  if(await progress()<120)await tick(Math.min(5,120-await progress()));
 }
 assert.equal(await page.evaluate(()=>window.audioNotes),3);await tick(5);assert.equal(await page.evaluate(()=>window.audioNotes),3);
 await button('Start Next Chapter').click();await button('Chapter sound').click();assert.equal(await button('Chapter sound').getAttribute('aria-pressed'),'false');
 await button('Open company story').click();const before=await page.locator('.world-time time').innerText();await tick(2);assert.equal(await page.locator('.world-time time').innerText(),before);await page.keyboard.press('Escape');
 await button('Restart operation').click();await button('Start fresh').click();await tick(20);assert.equal(await page.locator('.world-time time').innerText(),'00:00');
 await button('Start game').click();await page.clock.fastForward(1500*1000);await tick(2);assert.match(await page.locator('.medal-target').innerText(),/Silver/);
 await page.clock.fastForward(300*1000);await tick(2);assert.match(await page.locator('.medal-target').innerText(),/Bronze/);
 for(let i=0;i<3;i++)await button('Recon logo').click();await page.getByRole('button',{name:/^Connected systems /}).click();await button('Start Next Chapter').click();await tick(100);
 await button('Automate Backend scans for 210 credits').click();await page.waitForTimeout(50);assert.equal(await page.locator('.node-backend').getAttribute('data-feedback'),'Automation enabled');await tick(1);assert.equal(await page.locator('.node-backend').getAttribute('data-feedback'),null);
 assert.deepEqual(errors,[]);await writeFile('test-results/finetuning-browser.json',JSON.stringify({passed:true,checks:['opening waits without earnings or elapsed time','Escape cannot skip start','fix feedback and reduced motion','sound opt-in, once per completion, opt-out','later story pauses','restart returns to waiting','medal targets advance to silver and bronze','automation purchase confirmation'],errors},null,2));console.log('Finetuning browser checks passed');
}finally{await browser.close()}
