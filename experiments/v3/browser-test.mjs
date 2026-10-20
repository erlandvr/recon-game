import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createState,advance,buy,summary} from './engine.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const url=process.env.GAME_URL??'http://127.0.0.1:5183/experiments/v3/';
const browser=await chromium.launch({channel:'chromium',args:['--disable-gpu']}), errors=[],evidence=[];
await mkdir('test-results/v3',{recursive:true});
async function fresh(width=1280,height=900){
 const p=await browser.newPage({viewport:{width,height}});
 p.on('pageerror',e=>errors.push(e.message));await p.goto(url);return p;
}
async function capture(p,name){
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${name}: horizontal overflow`);
 await p.screenshot({path:`test-results/v3/${name}.png`,fullPage:true,animations:'disabled',timeout:15000});
 evidence.push(name);
}
async function download(p,name){
 const promise=p.waitForEvent('download');await p.getByRole('button',{name:'Download run evidence'}).click();
 const d=await promise;const path=`test-results/v3/${name}.json`;await d.saveAs(path);
 const {readFile}=await import('node:fs/promises');return JSON.parse(await readFile(path,'utf8'));
}
try{
 const p=await fresh();
 assert.equal(await p.locator('#credits').innerText(),'90.0');
 await capture(p,'initial-desktop');
 await p.setViewportSize({width:1024,height:768});await capture(p,'initial-laptop');
 await p.setViewportSize({width:1280,height:900});
 await p.getByRole('button',{name:'Start',exact:true}).click();
 await p.getByRole('button',{name:'Build a system',exact:false}).click();
 await p.getByRole('button',{name:'Pause',exact:true}).click();
 const credits=await p.locator('#credits').innerText(),time=await p.locator('#time').innerText();
 await p.waitForTimeout(400);assert.equal(await p.locator('#credits').innerText(),credits);assert.equal(await p.locator('#time').innerText(),time);
 assert.equal(await p.getByRole('button',{name:/Hire a developer/}).isDisabled(),true);
 const manual=await download(p,'manual-purchase');
 assert.equal(manual.actions.length,1);assert.equal(manual.actions[0].action,'system');
 assert.ok(manual.summary.credits<50);assert.equal(manual.summary.built,1);
 await p.getByRole('button',{name:'New run',exact:true}).click();
 assert.equal(await p.locator('#credits').innerText(),'90.0');
 await p.close();
 for(const policy of ['balanced','recon']){
  const p=await fresh();
  await p.locator('#policy').selectOption(policy);await p.locator('#rate').selectOption('12');
  await p.getByRole('button',{name:'Start',exact:true}).click();
  if(policy==='balanced'){
   await p.waitForFunction(()=>Number(document.getElementById('board').dataset.handoffs)>0,null,{timeout:20000});
   await p.getByRole('button',{name:'Pause',exact:true}).click();
   await capture(p,'worker-return');
   await p.emulateMedia({reducedMotion:'reduce'});await capture(p,'reduced-motion');
   await p.getByRole('button',{name:'Resume',exact:true}).click();
  }
  await p.locator('#result').waitFor({state:'visible',timeout:35000});
  await capture(p,`${policy}-finish`);
  const trace=await download(p,policy);
  assert.ok(trace.summary.finish>=100&&trace.summary.finish<=200);
  assert.equal(trace.summary.built,15);assert.equal(trace.summary.recon,2);
  assert.ok(trace.summary.handoffs.walk+trace.summary.handoffs.fix>0);
  // Re-run every paid browser action through the same independent engine.
  const replay=createState(trace.config,trace.summary.seed);
  for(const a of trace.actions){
   advance(replay,a.at-replay.time);
   assert.equal(buy(replay,a.action),true,`${policy}: rejected browser action`);
   assert.ok(Math.abs(replay.credits-a.credits)<1e-6);
  }
  advance(replay,trace.summary.elapsed-replay.time);
  assert.deepEqual(summary(replay),trace.summary,`${policy}: browser and simulation differ`);
  const frozen=await p.locator('#time').innerText();await p.waitForTimeout(250);
  assert.equal(await p.locator('#time').innerText(),frozen);
  evidence.push({policy,finish:trace.summary.finish,handoffs:trace.summary.handoffs,replay:'identical'});
  await p.close();
 }
 assert.deepEqual(errors,[]);
 await writeFile('test-results/v3/browser-report.json',JSON.stringify({passed:true,evidence,errors},null,2)+'\n');
 console.log(JSON.stringify({passed:true,evidence}));
}finally{await browser.close();}
