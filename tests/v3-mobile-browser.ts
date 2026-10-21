import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const require = createRequire(import.meta.url);
const {chromium, webkit} = require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser = await (process.env.BROWSER === 'webkit' ? webkit : chromium).launch();
const dir = `test-results/v3-mobile${process.env.BROWSER === 'webkit' ? '-webkit' : ''}`; await mkdir(dir, {recursive:true});
const errors: string[] = [];
const page = await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
page.on('pageerror',(e:Error)=>errors.push(e.message));
// Exercise the normal-browser fallback at exact viewport sizes; fullscreen has its own flow.
await page.addInitScript(() => Object.defineProperty(document, 'fullscreenEnabled', {value:false}));
const game = page.locator('.v3-game');
const button = (name:string)=>page.getByRole('button',{name,exact:true});
const snapshot = async()=>({time:await game.getAttribute('data-time'),cash:await game.getAttribute('data-cash')});
async function rotate(width:number,height:number) {
  await page.setViewportSize({width,height});
  if(width<height)await page.getByRole('dialog',{name:'Rotate your phone to play'}).waitFor();
  else await page.getByRole('dialog',{name:'Rotate your phone to play'}).waitFor({state:'detached'});
}
async function checkFit() {
  const faults = await page.evaluate(()=>{
    const problems:string[]=[];
    if(document.documentElement.scrollWidth>innerWidth+1||document.documentElement.scrollHeight>innerHeight+1)problems.push('page overflow');
    for(const el of document.querySelectorAll('dialog[open], .v3-purchases button,.v3-hud,.v3-header,.v3-header button,.v3-footer button,.v3-controls-pointer,.v3-orientation-announcement')){
      if(!el.checkVisibility())continue;
      const r=el.getBoundingClientRect();
      if(r.left<-.5||r.top<-.5||r.right>innerWidth+.5||r.bottom>innerHeight+.5)problems.push(`${el.className} outside ${innerWidth}x${innerHeight} viewport: ${JSON.stringify(r.toJSON())}`);
      if(el.tagName==='BUTTON'&&r.height<44)problems.push('small touch target');
    }
    return problems;
  });
  if(faults.length)await page.screenshot({path:`${dir}/fit-failure.png`});
  assert.deepEqual(faults,[]);
}
try {
  const date=new Date('2026-10-21T10:00:00Z');await page.clock.install({time:date});await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL??'http://127.0.0.1:5176/');
  assert.equal(await page.getByRole('dialog',{name:'Rotate your phone to play'}).isVisible(),true);
  await page.clock.runFor(20000);assert.deepEqual(await snapshot(),{time:'0',cash:'90'});
  await page.screenshot({path:`${dir}/portrait.png`});
  await rotate(844,390);await button('Get your intro').click();
  await page.clock.runFor(1000);assert.equal(await game.getAttribute('data-tour'),'systems');await page.screenshot({path:`${dir}/intro-systems.png`});
  await rotate(390,844);await page.clock.runFor(20000);assert.equal(await game.getAttribute('data-tour'),'systems');
  await rotate(844,390);await button('Continue experience').waitFor();
  await page.clock.runFor(5000);assert.deepEqual(await snapshot(),{time:'0',cash:'90'});
  await button('Continue experience').click();await rotate(695,274);await page.clock.runFor(3000);
  await page.screenshot({path:`${dir}/intro-developers.png`});await checkFit();
  await page.clock.runFor(2000);await page.screenshot({path:`${dir}/intro-purchases.png`});await checkFit();
  await page.clock.runFor(2000);
  assert.equal(await page.locator('.start-count-dialog').count(),1);
  await page.clock.runFor(1000);await rotate(390,844);await page.clock.runFor(20000);
  assert.equal(await game.getAttribute('data-status'),'ready');
  assert.equal(await page.locator('.start-count-dialog').getAttribute('open'),null);
  await rotate(844,390);await button('Continue experience').click();await page.clock.runFor(3000);
  assert.equal(await game.getAttribute('data-status'),'running');
  await page.locator('[data-purchase=system]').click();
  const before = await snapshot();await rotate(390,844);const held = await snapshot();
  assert.deepEqual(held,before);await page.clock.runFor(60000);assert.deepEqual(await snapshot(),held);
  await rotate(844,390);await page.clock.runFor(10000);assert.deepEqual(await snapshot(),held);
  await button('Continue experience').click();await page.clock.runFor(1000);
  assert.equal(Number(await game.getAttribute('data-time')),Number(held.time)+1);
  // Rotation and backgrounding must not bypass an outstanding restart decision.
  await button('Restart').click();const paused=await snapshot();
  await rotate(390,844);await page.clock.runFor(10000);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await rotate(844,390);await page.clock.runFor(10000);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await button('Continue experience').click();
  await page.getByRole('dialog',{name:'Start a fresh workshop?'}).waitFor();
  await page.clock.runFor(10000);assert.deepEqual(await snapshot(),paused);
  await button('Keep this workshop').click();await page.clock.runFor(1000);
  assert.equal(Number(await game.getAttribute('data-time')),Number(paused.time)+1);
  for(const [width,height] of [[568,320],[667,280],[695,274],[740,320],[844,390],[932,430],[1024,600]]) {
    await rotate(width,height);await checkFit();
    await page.screenshot({path:`${dir}/playing-${width}x${height}.png`});
  }
  // A complete touch-only run, including all purchases, busy scene and results.
  await rotate(844,390);
  let busyCaptured=false;
  for(let second=0;second<900;second+=2) {
    if(await game.getAttribute('data-status')==='won')break;
    const systems=await page.locator('[data-v3-system]').count();
    const workers=await page.locator('[data-worker]').count();
    const action=workers<4?'developer':systems<12?'system':await page.locator('[data-purchase=recon] .v3-affordability').innerText()!=='Installed'?'recon':'plus';
    const purchase=page.locator(`[data-purchase=${action}]`);
    if(await purchase.isEnabled())await purchase.tap();
    await page.clock.fastForward(2000);
    if(systems===12&&workers===4&&!busyCaptured){busyCaptured=true;await page.screenshot({path:`${dir}/busy-workshop.png`});await rotate(695,274);await checkFit();await page.screenshot({path:`${dir}/busy-small.png`});await rotate(568,320);await checkFit();await page.screenshot({path:`${dir}/busy-narrow.png`});await rotate(844,390);}
  }
  assert.equal(await game.getAttribute('data-status'),'won');
  assert.deepEqual(await page.locator('.v3-recap dd').allTextContents(),['12','3','Recon Plus']);
  await rotate(695,274);await checkFit();await page.screenshot({path:`${dir}/results-small.png`});
  assert.equal(await page.locator('.v3-results').evaluate((e:Element)=>{
    const bounds=e.getBoundingClientRect();
    return [...e.querySelectorAll('button')].every(b=>{const r=b.getBoundingClientRect();return r.top>=bounds.top&&r.bottom<=bounds.bottom;});
  }),true,'Replay actions are visible without scrolling');
  const finished=await snapshot();
  await rotate(390,844);await page.clock.runFor(20000);assert.deepEqual(await snapshot(),finished);
  await rotate(844,390);assert.equal(await button('Continue experience').count(),0);
  for(const [width,height] of [[695,274],[844,390],[932,430],[1024,600]]) {
    await rotate(width,height);await button('Inspect workshop').click();await checkFit();
    assert.equal(await button('View result').count(),1,'Exactly one visible result action at each mobile size');
    await button('View result').click();assert.deepEqual(await snapshot(),finished);
  }
  await button('Play again').click();assert.deepEqual(await snapshot(),{time:'0',cash:'90'});
  await checkFit();
  assert.deepEqual(errors,[]);
  console.log('Mobile: portrait entry, held intro/countdown/game, restart with rotation/backgrounding, explicit resume, seven landscape sizes, touch purchases, full run, result rotation/reopening at four sizes and replay pass.');
} finally {await browser.close();}
