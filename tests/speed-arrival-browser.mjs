import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(),evidence=[],errors=[];
try{
 await mkdir('test-results',{recursive:true});
 for(const [width,height,reduced] of [[1280,800,false],[800,700,true]]){
  const p=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});p.on('pageerror',e=>errors.push(e.message));
  const date=new Date('2026-10-12T12:00:00Z');await p.clock.install({time:date});await p.clock.pauseAt(date);await p.goto(process.env.GAME_URL??'http://127.0.0.1:5173/');const button=name=>p.getByRole('button',{name,exact:true}),nodes=p.locator('[data-system]');
  await button('Choose Speed Game').click();await button('LET’S GO').click();await p.clock.runFor(3000);assert.equal(await nodes.count(),1);
  const canvas=p.locator('.sg-canvas'),identity=await canvas.elementHandle(),camera=()=>canvas.getAttribute('data-camera');const initial=await camera();
  await button('Scan · 5 cr').click();await p.clock.runFor(3000);await button('Fix 1 · 15 cr').click();await p.clock.runFor(5000);
  assert.equal(await nodes.count(),3);assert.match(await p.locator('.sg-wave-arrival').innerText(),/Wave 1 · \+2 systems connected/);assert.match(await p.locator('.sg-map-bottom').innerText(),/Wave 2 · \+4 in 20s/);await p.clock.runFor(100);assert.notEqual(await camera(),initial);
  if(reduced)assert.equal(await p.locator('.sg-wave-arrival').evaluate(e=>getComputedStyle(e).animationName),'none');
  await canvas.focus();await p.keyboard.press('ArrowLeft');await p.keyboard.press('+');const focused=await camera();await button('Pause & plan').click();await p.clock.runFor(30000);assert.equal(await nodes.count(),3);assert.match(await p.locator('.sg-map-bottom').innerText(),/in 20s/);await button('Resume game').click();assert.equal(await camera(),focused);
  await p.clock.runFor(19900);assert.equal(await nodes.count(),7);assert.match(await p.locator('.sg-wave-arrival').innerText(),/Wave 2 · \+4 systems connected/);assert.equal(await camera(),focused);await p.clock.runFor(20000);assert.equal(await nodes.count(),15);assert.match(await p.locator('.sg-wave-arrival').innerText(),/Wave 3 · \+8 systems connected/);assert.match(await p.locator('.sg-map-bottom').innerText(),/All systems connected/);assert.ok(await identity.evaluate(e=>e===document.querySelector('.sg-canvas')));
  for(let i=0;i<6;i++)await button('Zoom out').click();assert.equal(await p.locator('.sg-system.compact').count(),15);
  await button('Fit all').click();await p.clock.runFor(100);const overlap=await nodes.evaluateAll(es=>es.some((a,i)=>es.slice(i+1).some(b=>{const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return x.left<y.right-1&&x.right>y.left+1&&x.top<y.bottom-1&&x.bottom>y.top+1;})));assert.equal(overlap,false);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight+1));
  await p.screenshot({path:`test-results/speed-waves-${width}.png`});await p.getByLabel('Find system',{exact:true}).selectOption('repo-15');assert.match(await p.locator('.sg-system-detail').innerText(),/Monitor/);await p.close();evidence.push({width,reduced,waves:[2,4,8],total:15,cameraPreserved:true});
 }
 assert.deepEqual(errors,[]);await writeFile('test-results/speed-arrival-browser.json',JSON.stringify({passed:true,evidence,errors},null,2));console.log({passed:true,evidence});
}finally{await browser.close();}
