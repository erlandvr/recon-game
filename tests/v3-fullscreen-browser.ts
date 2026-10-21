import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url), {chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(), errors:string[]=[];
const url=process.env.GAME_URL??'http://127.0.0.1:5176/';
try {
  // Real API acceptance, followed by exit, without resetting or re-entering.
  const p=await browser.newPage({viewport:{width:844,height:390},hasTouch:true});
  p.on('pageerror',(e:Error)=>errors.push(e.message));
  const date=new Date('2026-10-21T10:00:00Z');await p.clock.install({time:date});await p.clock.pauseAt(date);
  await p.goto(url);
  assert.equal(await p.evaluate(()=>document.fullscreenElement),null);
  await p.getByRole('button',{name:'Get your intro',exact:true}).click();
  await p.waitForFunction(()=>document.fullscreenElement===document.documentElement);
  await p.waitForFunction(()=>document.querySelector('.v3-game')?.getAttribute('data-tour')==='systems');
  await p.clock.runFor(11000);
  assert.equal(await p.locator('.v3-game').getAttribute('data-status'),'running');
  const before=await p.locator('.v3-game').getAttribute('data-time');
  await p.evaluate(()=>document.exitFullscreen());
  await p.clock.runFor(1000);
  assert.equal(await p.evaluate(()=>document.fullscreenElement),null);
  assert.equal(Number(await p.locator('.v3-game').getAttribute('data-time')),Number(before)+1);
  await p.close();
  // Unsupported and rejected requests always reach the original intro. Desktop never requests.
  for(const scenario of ['unsupported','rejected','throws','desktop']) {
    const p=await browser.newPage({viewport:{width:844,height:390},hasTouch:scenario!=='desktop'});
    p.on('pageerror',(e:Error)=>errors.push(e.message));
    await p.addInitScript((scenario:string)=>{
      (window as any).fullscreenCalls=0;
      Object.defineProperty(document,'fullscreenEnabled',{value:scenario!=='unsupported'});
      Element.prototype.requestFullscreen=()=>{
        (window as any).fullscreenCalls++;
        if(scenario==='throws')throw new Error('Unavailable');
        return Promise.reject(new Error('Fullscreen declined'));
      };
    },scenario);
    await p.goto(url);await p.getByRole('button',{name:'Get your intro',exact:true}).click();
    await p.waitForFunction(()=>document.querySelector('.v3-game')?.getAttribute('data-tour')==='systems');
    assert.equal(await p.evaluate(()=>(window as any).fullscreenCalls),['rejected','throws'].includes(scenario)?1:0,scenario);
    assert.equal(await p.locator('.v3-game').getAttribute('data-time'),'0');
    await p.close();
  }
  assert.deepEqual(errors,[]);
  console.log('Fullscreen: actual entry from intro tap, play and exit continuity; unsupported, denied, throwing API and desktop fallback pass.');
} finally {await browser.close();}
