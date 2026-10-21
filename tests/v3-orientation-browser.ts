import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url), {chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(), dir='test-results/v3-orientation';
await mkdir(dir,{recursive:true});
const page=await browser.newPage({viewport:{width:1280,height:720}}), errors:string[]=[];
page.on('pageerror',(e:Error)=>errors.push(e.message));
const button=(name:string)=>page.getByRole('button',{name,exact:true});
const step=()=>page.locator('.v3-game').getAttribute('data-tour');
async function held(){
  assert.equal(await page.locator('.v3-game').getAttribute('data-time'),'0');
  assert.equal(await page.locator('.v3-game').getAttribute('data-cash'),'90');
  assert.equal(await page.locator('[data-feature-backlog]').count(),0);
  assert.equal(await page.locator('.v3-purchases button:enabled').count(),0);
}
async function visibility(hidden:boolean){await page.evaluate(h=>{Object.defineProperty(document,'hidden',{configurable:true,value:h});document.dispatchEvent(new Event('visibilitychange'));},hidden);}
async function fresh(){await button('Restart').click();await button('Start fresh').click();assert.equal(await button('Get your intro').count(),1);await held();}
try{
  const date=new Date('2026-10-21T10:00:00Z');await page.clock.install({time:date});await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL??'http://127.0.0.1:5175/');
  await page.clock.runFor(60000);await held();assert.equal(await step(),null);
  assert.equal(await button('Get your intro').evaluate((e:Element)=>e===document.activeElement),true);
  assert.equal(await page.locator('.v3-main').isVisible(),false);
  assert.equal(await button('Start experience').count(),0);
  await button('Get your intro').click();assert.equal(await step(),'systems');
  assert.equal(await page.locator('[data-tour-caption]').innerText(),'Your ecosystem');
  await page.clock.runFor(2999);assert.equal(await step(),'systems');
  await page.clock.runFor(1);assert.equal(await step(),'developers');
  await visibility(true);await page.clock.runFor(10000);assert.equal(await step(),'developers');await held();
  await visibility(false);await page.clock.runFor(2000);assert.equal(await step(),'purchases');
  assert.equal(await page.locator('.v3-purchases').evaluate((e:Element)=>getComputedStyle(e).animationIterationCount),'1');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.v3-purchases').evaluate((e:Element)=>getComputedStyle(e).animationName),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await visibility(true);await page.clock.runFor(10000);assert.equal(await step(),'purchases');await held();
  await visibility(false);await page.clock.runFor(1999);assert.equal(await step(),'purchases');
  await page.clock.runFor(1);assert.equal(await step(),null);assert.equal(await page.locator('.start-count-dialog').count(),1);await held();
  await page.clock.runFor(2999);assert.equal(await page.locator('.v3-game').getAttribute('data-status'),'ready');
  await page.clock.runFor(1);assert.equal(await page.locator('.v3-game').getAttribute('data-status'),'running');
  assert.equal(await page.locator('.v3-game').getAttribute('data-time'),'0');
  await page.clock.runFor(1000);assert.equal(await page.locator('.v3-game').getAttribute('data-time'),'1');
  assert.equal(await page.locator('.v3-footer').getAttribute('data-hint'),'first');
  // Opening and all three locations fit without resizing the workshop between pointers.
  for(const [width,height] of [[1024,768],[1280,720],[1440,900],[1920,1080]]){
    await page.setViewportSize({width,height});await fresh();
    await page.screenshot({path:`${dir}/welcome-${width}.png`});
    await button('Get your intro').click();
    const worldBounds=await page.locator('.v3-world').boundingBox();
    for(const id of ['systems','developers','purchases']){
      assert.deepEqual(await page.locator('.v3-world').boundingBox(),worldBounds);
      assert.equal(await step(),id);
      assert.equal(await page.getByRole('button',{name:/^(Start experience|Back|Next|Pause tour|Continue tour|Replay tour)$/}).count(),0);
      const faults=await page.evaluate(()=>{
        const faults:string[]=[];
        if(document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight)faults.push('page overflow');
        for(const el of document.querySelectorAll('.v3-controls-pointer,.v3-purchases button,.v3-orientation-label')){const r=el.getBoundingClientRect();if(r.left<0||r.top<0||r.right>innerWidth+1||r.bottom>innerHeight+1)faults.push(el.className);}
        return faults;
      });assert.deepEqual(faults,[]);
      await page.screenshot({path:`${dir}/${id}-${width}.png`});
      if(id!=='purchases')await page.clock.runFor(id==='systems'?3000:2000);
    }
  }
  // A restart decision holds the intro and cancellation resumes it without starting twice.
  await button('Restart').click();await page.clock.runFor(10000);await held();assert.equal(await step(),'purchases');
  await button('Keep this workshop').click();await page.clock.runFor(5000);
  assert.equal(await page.locator('.v3-game').getAttribute('data-time'),'0');
  assert.equal(await page.locator('.v3-game').getAttribute('data-status'),'running');
  await page.clock.runFor(1000);await fresh();await page.clock.runFor(60000);await held();assert.equal(await step(),null);
  await button('Get your intro').click();await page.clock.runFor(1000);
  await page.reload();assert.equal(await button('Get your intro').count(),1);assert.equal(await step(),null);await held();
  assert.deepEqual(errors,[]);console.log('Visitor-triggered intro: idle welcome, three timed pointers, automatic countdown/GO, hidden/restart holds, reduced motion, four sizes, refresh and fresh-run reset pass.');
}finally{await browser.close();}
