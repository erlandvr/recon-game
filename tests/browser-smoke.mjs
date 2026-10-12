// Continuous-play regression through real controls; no product fixtures or persistence.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_DIR?`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`:'playwright');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});
// Any accidental read/write fails the journey, including access to an old save.
await context.addInitScript(()=>{
 for(const key of ['localStorage','sessionStorage','indexedDB'])Object.defineProperty(window,key,{get(){throw new Error(`Unexpected persistence access: ${key}`)}});
});
const page=await context.newPage();page.setDefaultTimeout(10000);
const errors=[];const evidence=[];page.on('pageerror',e=>errors.push(e.message));
const output=new URL('../test-results/',import.meta.url);await mkdir(output,{recursive:true});
const button=name=>page.getByRole('button',{name,exact:true});
const time=async()=>{const value=await page.locator('.world-time time').innerText();const [m,s]=value.trim().split(':').map(Number);return m*60+s;};
const dismissStory=async()=>{if(await page.locator('.chapter-completion').count()){await page.clock.runFor(3700);await page.waitForTimeout(50);}if(await button(/^(Start game|Start Next Chapter|Keep playing)$/).isVisible())await button(/^(Start game|Start Next Chapter|Keep playing)$/).click();};
const tick=async seconds=>{await page.clock.runFor(seconds*1000);await page.waitForTimeout(50);await dismissStory();};
const jump=async seconds=>{await page.clock.fastForward(seconds*1000);await tick(Math.ceil(seconds/300)/4+1);};
const queue=async()=>Number(await page.locator('[aria-label="Queued actions"] strong').innerText());
async function bounds(label){
 const result=await page.evaluate(()=>{
  const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
  const selectors=['.system-card','.node-actions button','.growth','.map-upgrades','.work-slot','.queue-summary','.add-slot','.node-automation', '.automation-state', '.repair-automation', '.scope-card', '.scope-actions', '.scope-pagination', '.scope-path', '.corporate-growth', '.ecosystem-canvas', '.canvas-toolbar', '.canvas-bottom'];
  const bad=[];
  for(const selector of selectors)for(const e of document.querySelectorAll(selector)){
   if(!visible(e)||e.closest('.ecosystem-canvas'))continue;const r=e.getBoundingClientRect();
   const container=e.closest('.session-network, .corporate-network') ?? (e.matches('.canvas-bottom,.canvas-toolbar,.scope-actions')?e.closest('.corporate-ecosystem'):null);const box=container?.getBoundingClientRect();
   if((box&&(r.top<box.top-1||r.bottom>box.bottom+1))||r.top<0||r.left<0||r.bottom>innerHeight+1||r.right>innerWidth+1||e.scrollWidth>e.clientWidth+2)bad.push({selector,text:e.textContent.slice(0,70),rect:{top:r.top,bottom:r.bottom,containerTop:box?.top,containerBottom:box?.bottom},overflow:e.scrollWidth-e.clientWidth});
  }
  return {pageOverflow:document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1,bad};
 });
 if(result.bad.length)await page.screenshot({path:fileURLToPath(new URL('layout-failure.png',output)),fullPage:true});
 assert.deepEqual(result,{pageOverflow:false,bad:[]},label);evidence.push(label);
 await page.screenshot({path:fileURLToPath(new URL(`${label}.png`,output)),fullPage:true});
}
try{
 await page.clock.install({time:new Date('2026-10-09T10:00:00Z')});await page.clock.pauseAt(new Date('2026-10-09T10:00:00Z'));await page.goto(process.env.GAME_URL||'http://127.0.0.1:5173');await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();await page.waitForTimeout(50);await dismissStory();
 const healthy=async()=>Number(await page.locator('[data-healthy-time]').getAttribute('data-healthy-time'));
 const creditsNow=async()=>Number(await page.locator('[data-credits]').getAttribute('data-credits'));
 const debug=async name=>{if(!await button('Debug').count()){for(let n=0;n<3;n++)await button('Recon logo').click();}else await button('Debug').click();await page.getByRole('button',{name:new RegExp(`^${name} `)}).click();await page.waitForTimeout(100);await dismissStory();};
 assert.equal(await time(),0);assert.equal(await healthy(),0);assert.equal(await page.getByRole('switch').count(),0);
 await bounds('phase5-start');await tick(15);assert.equal(await time(),15);assert.equal(await healthy(),15);
 const firstMoney=await creditsNow();await button('Buy scan efficiency tier 1 for 20 credits').click();assert.equal(await creditsNow(),firstMoney-20);assert.match(await button('Scan Backend').innerText(),/4 cr/);
 await button('Scan Backend').click();await tick(3);assert.equal(await healthy(),18);await button('Fix Backend').click();await tick(5);assert.equal(await healthy(),23);await tick(1);assert.equal(await healthy(),24);
 await button('Double speed').click();await tick(2);assert.equal(await time(),28);assert.equal(await healthy(),28);await button('Double speed').click();
 await button('View log').click();let before=await time();await tick(2);assert.equal(await time(),before+2);await button('Close log').click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 before=await time();await jump(300);assert.ok(await time()>=before+300);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await page.locator('.connection-preview').count(),0);assert.match(await page.locator('.guide h1').innerText(),/Progress on hold/);const held=await healthy(),money=await creditsNow();await tick(5);assert.equal(await healthy(),held);assert.ok(await creditsNow()>money);
 await button('Invest 150 credits').click();assert.equal(await page.locator('.work-slot').count(),2);
 await page.setViewportSize({width:1280,height:800});
 await debug('Ecosystem expansion');assert.equal(await healthy(),0);assert.ok(await time()>=120);assert.equal(await page.locator('.connection-preview').count(),1);await tick(30);assert.equal(await page.getByRole('article',{name:'Identity system',exact:true}).count(),1);
 for(const [w,h] of [[1280,800],[1024,768],[800,700]]){await page.setViewportSize({width:w,height:h});await bounds(`phase5-connected-${w}`);}await page.setViewportSize({width:1280,height:800});
 await button('Milestones').click();assert.match(await page.getByRole('dialog').innerText(),/First 2 healthy minutes/);await button('Close milestones').click();
 // Debug reaches a real healthy-time corporate milestone; leave it unattended to build a queue-test backlog.
 await debug('100-repository company');assert.equal(await page.locator('.work-slot').count(),5);await jump(3000);
 for(const [tier,cost] of [[2,100],[3,500],[4,2500],[5,6000]]){const balance=await creditsNow();await button(`Buy scan efficiency tier ${tier} for ${cost} credits`).click();assert.equal(await creditsNow(),balance-cost);}
 assert.equal(await button('Maximum scan efficiency').isDisabled(),true);
 // The corporate world is one canvas; focus and gestures never replace its topology.
 const focus=async id=>{await page.getByRole('combobox',{name:'Find repository'}).selectOption(id);await page.clock.runFor(34);await page.waitForTimeout(80);};
 const settle=async()=>{await page.clock.runFor(34);await page.waitForTimeout(80);};
 const canvas=page.getByRole('region',{name:'Zoomable ecosystem'});
 const camera=async()=>canvas.evaluate(e=>({x:Number(e.dataset.cameraX),y:Number(e.dataset.cameraY),zoom:Number(e.dataset.zoom)}));
 const credits=async()=>Number(await page.locator('[data-credits]').getAttribute('data-credits'));
 assert.equal(await canvas.locator('.repo-dot').count(),100);
 assert.equal(await page.locator('.scope-card,.scope-pagination').count(),0);
 await focus('backend');await button('Scan Backend').click();await tick(3);await button('Fix Backend').click();
 assert.equal(await page.locator('.work-slot.occupied').count(),5);assert.equal(await queue(),2);
 for(const [w,h] of [[1280,800],[1024,768],[800,700]]){
  await page.setViewportSize({width:w,height:h});await focus('backend');await bounds(`canvas-repo-${w}`);
  const node=await page.getByRole('article',{name:'Backend system',exact:true}).boundingBox(),box=await canvas.boundingBox();assert.ok(node.y>=box.y&&node.y+node.height<=box.y+box.height,JSON.stringify({viewport:[w,h],node,box}));
  if(await button('Work slots').isVisible()){await button('Work slots').click();await bounds(`queue-slots-${w}`);await button('Ecosystem').first().click();}
 }
 await tick(10);assert.equal(await queue(),0);assert.equal(await page.locator('.work-slot.occupied').count(),0);
 await focus('backend');let balance=await credits();await button('Automate Backend scans for 31.5 credits').click();assert.equal(await credits(),Math.round((balance-31.5)*100)/100);
 await focus('auth');balance=await credits();await button('Automate Identity scans for 31.5 credits').click();assert.equal(await credits(),Math.round((balance-31.5)*100)/100);
 await focus('frontend');assert.equal(await button('Automate Frontend scans for 31.5 credits').count(),1);
 assert.equal(await page.getByRole('button',{name:/About .* automatic scans/}).count(),0);assert.equal(await page.getByRole('tooltip').count(),0);
 await page.setViewportSize({width:1280,height:800});await focus('frontend');
 await focus('backend');await page.getByRole('article',{name:'Backend system',exact:true}).locator('.system-inspect').click();assert.equal(await page.locator('.system-actions').count(),0);
 await button('Fit all').click();await settle();const allCamera=await camera();
 for(const [w,h] of [[1280,800],[1024,768],[800,700]]){
  await page.setViewportSize({width:w,height:h});await button('Fit all').click();await settle();await bounds(`canvas-all-${w}`);
  await button('Open Customer platform project').click();await settle();await bounds(`canvas-project-${w}`);
  const labels=await page.locator('.map-group-label').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));for(const [i,a] of labels.entries())for(const b of labels.slice(i+1))assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,`Module labels overlap at ${w}px`);
  await button('View modules').click();await button('Open Core experience module').click();await settle();await bounds(`canvas-module-${w}`);
 }
 await page.setViewportSize({width:1280,height:800});await button('Fit all').click();await settle();
 // Free panning can reach another project's modules without returning through breadcrumbs.
 await button('Open Customer platform project').click();await settle();const firstModules=await page.locator('.map-group-label').allTextContents();
 const panBox=await canvas.boundingBox();await page.mouse.move(panBox.x+20,panBox.y+20);await page.mouse.wheel(350,0);await settle();assert.ok((await page.locator('.map-group-label').allTextContents()).some(name=>!firstModules.includes(name)));
 await button('Fit all').click();await settle();
 assert.equal(await canvas.locator('.repo-dot').count(),100);
 const box=await canvas.boundingBox();const anchor={x:Math.round(box.x+box.width*.55),y:Math.round(box.y+box.height*.4)};
 const beforePan=await camera();await page.mouse.move(anchor.x,anchor.y);await page.mouse.wheel(60,40);await page.waitForFunction(old=>Number(document.querySelector('.ecosystem-canvas').dataset.cameraX)!==old,beforePan.x);
 const afterPan=await camera();assert.equal(afterPan.zoom,beforePan.zoom);assert.ok(Math.abs(afterPan.x-beforePan.x+60)<1);assert.ok(Math.abs(afterPan.y-beforePan.y+40)<1);
 await page.keyboard.down('Control');await page.mouse.wheel(0,-40);await page.keyboard.up('Control');await page.waitForFunction(old=>Number(document.querySelector('.ecosystem-canvas').dataset.zoom)>old,afterPan.zoom);
 const pinched=await camera(),local={x:anchor.x-box.x,y:anchor.y-box.y};assert.ok(Math.abs((local.x-pinched.x)/pinched.zoom-(local.x-afterPan.x)/afterPan.zoom)<1);assert.ok(Math.abs((local.y-pinched.y)/pinched.zoom-(local.y-afterPan.y)/afterPan.zoom)<1);
 assert.equal(await page.evaluate(()=>window.scrollY),0);
 await canvas.focus();const beforeKey=await camera();await page.keyboard.press('ArrowRight');await page.keyboard.press('+');const afterKey=await camera();assert.ok(afterKey.zoom>beforeKey.zoom);await page.keyboard.press('Home');await settle();assert.ok(Math.abs((await camera()).zoom-allCamera.zoom)<.001);
 // Dragging pans the camera, not repositories. Coordinates remain unchanged.
 const topology=await canvas.locator('.repo-dot').evaluateAll(nodes=>nodes.map(n=>[n.getAttribute('cx'),n.getAttribute('cy')]));
 const dragBefore=await camera();await page.mouse.move(box.x+15,box.y+15);await page.mouse.down();await page.mouse.move(box.x+70,box.y+55,{steps:5});await page.mouse.up();const dragAfter=await camera();assert.ok(dragAfter.x>dragBefore.x+40);assert.deepEqual(await canvas.locator('.repo-dot').evaluateAll(nodes=>nodes.map(n=>[n.getAttribute('cx'),n.getAttribute('cy')])),topology);
 // Touch pinch also changes only the camera; cancelling a pointer releases the gesture.
 const cdp=await context.newCDPSession(page);const touchBefore=await camera();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+15,y:box.y+30,id:1},{x:box.x+95,y:box.y+30,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+20,y:box.y+40,id:1},{x:box.x+140,y:box.y+40,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await settle();assert.ok((await camera()).zoom>touchBefore.zoom);await cdp.detach();
 await button('Fit all').click();await button('Open Customer platform project').click();await settle();
 const scanGroup=button('Scan project Customer platform');const groupCost=parseFloat(await scanGroup.locator('span').innerText());const preGroup=await credits();await scanGroup.click();assert.equal(await credits(),Math.round((preGroup-groupCost)*100)/100);assert.equal(await scanGroup.isDisabled(),true);assert.ok(await queue()>0);await tick(30);
 const repairGroup=button('Fix project Customer platform');const repairCost=Number((await repairGroup.locator('span').innerText()).replace(/[^0-9]/g,''));const preRepair=await credits();await repairGroup.click();assert.equal(await credits(),Math.round((preRepair-repairCost)*100)/100);assert.ok(await queue()>0);
 await button('View modules').click();await button('Open Core experience module').click();await settle();const autoModule=button('Auto-scans module Core experience');await autoModule.click();assert.equal(await autoModule.count(),0);assert.ok(await page.locator('.group-card .automation-state').isVisible());
 await button('Customer platform').click();await settle();const autoProject=button('Auto-scans project Customer platform');const projectCost=parseFloat(await autoProject.locator('span').innerText()),preAuto=await credits();await autoProject.click();assert.equal(await credits(),Math.round((preAuto-projectCost)*100)/100);assert.equal(await autoProject.count(),0);assert.ok(await page.locator('.group-card .automation-state').isVisible());
 await button('View modules').click();await button('Open Core experience module').click();assert.ok(await page.locator('.group-card .automation-state').isVisible());
 await jump(600);await focus('repo-100');const generated=await page.locator('option[value="repo-100"]').innerText();assert.ok(!['Backend','Frontend','Identity'].includes(generated));
 await button(`Scan ${generated}`).click();await tick(30);await button(`Fix ${generated}`).click();assert.equal(await page.locator('.system-actions').count(),0);await tick(10);

 evidence.push('Single 100-repository canvas: project/module framing, repository finder, pointer-anchored trackpad zoom, two-axis pan across project boundaries, drag, touch pinch and subsequent clicks, keyboard zoom/pan/Home, stable topology, desktop/phone bounds, original scan/fix/automation controls without scan-info popups, five slots/FIFO queue, exact group costs and overlapping automation.');
 await page.reload();await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();assert.equal(await time(),0);assert.equal(await page.locator('.work-slot').count(),1);assert.equal(await queue(),0);await dismissStory();await tick(2);assert.equal(await time(),2);
 await button('Restart operation').click();await button('Start fresh').click();await button(/^(Start game|Start Next Chapter|Keep playing)$/).waitFor({state:'visible'});await dismissStory();assert.equal(await time(),0);await tick(2);assert.ok(await time()>=1);
 // Direct fixing pays for all affordable findings without opening a popup.
 for(const [w,h] of [[1280,800],[1024,768]]){
  await page.setViewportSize({width:w,height:h});await page.reload();await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();await page.waitForTimeout(80);await dismissStory();await tick(75);await button('Scan Backend').click();await tick(3);
  assert.match(await button('Fix Backend').innerText(),/Fix all \(3\) · 45 cr/);await bounds(`fix-all-${w}`);
  let money=await creditsNow();await button('Fix Backend').click();assert.equal(await creditsNow(),Math.round((money-45)*100)/100);assert.equal(await queue(),2);assert.equal(await page.locator('.system-actions').count(),0);
  await page.reload();await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();await page.waitForTimeout(80);await dismissStory();await tick(75);await button('Scan Backend').click();await tick(3);await button('Invest 150 credits').click();while(await creditsNow()<30)await tick(1);money=await creditsNow();assert.ok(money>=30&&money<45);
  assert.match(await button('Fix Backend').innerText(),/Fix 2\/3 · 30 cr/);await button('Fix Backend').click();assert.equal(await creditsNow(),Math.round((money-30)*100)/100);assert.equal(await page.locator('.system-actions').count(),0);assert.equal(await page.locator('.work-slot.occupied').count(),2);
 }
 evidence.push('Direct Fix starts the affordable subset with exact spending and no details popup; full affordable batches queue overflow.');
 // Healthy-time and live-time reset together; double speed accelerates both when healthy.
 await page.reload();await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();await page.waitForTimeout(80);await dismissStory();assert.equal(await time(),0);assert.equal(await healthy(),0);
 await button('Double speed').click();await tick(5);assert.equal(await time(),10);assert.equal(await healthy(),10);
 await debug('Starting backend');assert.equal(await time(),0);assert.equal(await button('Double speed').getAttribute('aria-pressed'),'true');await tick(1);assert.equal(await time(),2);
 const checkpoints=[['Growing backend',null],['Full-pace backend',null],['Ecosystem expansion',0],['Connected systems',null],['Release challenge',null],['Corporate expansion',0],['100-repository company',null]];
 for(const [name,progress] of checkpoints){await debug(name);if(progress!==null)assert.equal(await healthy(),progress);assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await button('Double speed').getAttribute('aria-pressed'),'true');}
 assert.equal(await page.locator('.story-guide').getAttribute('data-chapter'),'5');
 await button('Debug').click();before=await time();await tick(1);assert.equal(await time(),before+2);await page.keyboard.press('Escape');
 await button('Restart operation').click();await button('Start fresh').click();await button(/^(Start game|Start Next Chapter|Keep playing)$/).waitFor({state:'visible'});await dismissStory();assert.equal(await time(),0);assert.equal(await healthy(),0);assert.equal(await button('Debug').isVisible(),true);
 await button('Debug').click();await button('Exit debug mode').click();assert.equal(await button('Debug').count(),0);
 await page.reload();await page.getByRole('button',{name:'Choose Long Game',exact:true}).click();await page.waitForTimeout(80);await dismissStory();assert.equal(await button('Debug').count(),0);assert.equal(await button('Double speed').getAttribute('aria-pressed'),'false');assert.equal(await healthy(),0);
 // Separate automatic repairs, scope prices and the sustained autonomy finish.
 await page.setViewportSize({width:1280,height:800});await debug('Connected systems');await tick(100);while(await creditsNow()<600)await tick(10);
 let repairFunds=await creditsNow();await button('Automate Backend fixes for 480 credits').click();assert.equal(await creditsNow(),Math.round((repairFunds-480)*100)/100);
 assert.equal(await button('Automate Identity fixes for 480 credits').count(),1);assert.match(await page.getByLabel('Backend automatic fixes',{exact:true}).innerText(),/Needs scan/);
 await button('Scan Backend').click();await tick(3);assert.match(await page.getByLabel('Backend automatic fixes',{exact:true}).innerText(),/Fixing/);await tick(20);assert.equal(await button('Fix Backend').isDisabled(),true);assert.equal(await page.locator('.system-actions').count(),0);
 await debug('100-repository company');await focus('backend');await button('Core experience').click();let q=button('Auto-fixes module Core experience'),charge=parseFloat(await q.locator('span').innerText());repairFunds=await creditsNow();await q.click();assert.equal(await creditsNow(),Math.round((repairFunds-charge)*100)/100);assert.ok(await page.locator('.group-card .repair-auto-state').isVisible());
 await button('Customer platform').click();await settle();q=button('Auto-fixes project Customer platform');charge=parseFloat(await q.locator('span').innerText());repairFunds=await creditsNow();await q.click();assert.equal(await creditsNow(),Math.round((repairFunds-charge)*100)/100);await button('View modules').click();await button('Open Core experience module').click();assert.ok(await page.locator('.group-card .repair-auto-state').isVisible());
 await debug('Autonomy trial');assert.match(await page.locator('.autonomy-progress').innerText(),/100\/100 fully automated/);await button('Autonomy').click();assert.match(await page.getByRole('dialog').innerText(),/60 uninterrupted/);await tick(2);await button('Back to ecosystem').click();
 await focus('backend');for(const [w,h] of [[1280,800],[1024,768],[800,700]]){await page.setViewportSize({width:w,height:h});await focus('backend');await bounds(`automatic-fixes-${w}`);}
 await page.setViewportSize({width:1280,height:800});await tick(180);assert.match(await page.locator('.guide h1').innerText(),/Victory/);assert.equal(await page.getByRole('dialog').count(),0);before=await time();await tick(2);assert.equal(await time(),before+2);
 for(const [w,h] of [[1280,800]]){await page.setViewportSize({width:w,height:h});await bounds(`autonomy-victory-${w}`);await button('Victory').click();assert.match(await page.getByRole('dialog').innerText(),/Full autonomy achieved/);await bounds(`autonomy-details-${w}`);await button('Back to ecosystem').click();}
 await button('Milestones').click();assert.match(await page.getByRole('dialog').innerText(),/Full autonomy achieved/);await button('Close milestones').click();
 await button('Restart operation').click();await button('Start fresh').click();await button(/^(Start game|Start Next Chapter|Keep playing)$/).waitFor({state:'visible'});await dismissStory();assert.equal(await button('Victory').count(),0);
 evidence.push('Separate per-repository automatic fix purchases and status, scan-to-fix completion, overlap-safe scoped purchases, paid Autonomy trial debug start, sustained victory, continued simulation, desktop/phone criteria and immutable milestone presentation.');
 assert.deepEqual(errors,[]);evidence.push('Phase 5: healthy-time hold/resume, live earnings and background catch-up, first efficiency purchase and all five tiers, fractional group prices, coached debug goals, speed/reset and no persistence/browser errors.');
 await writeFile(new URL('continuous-browser.json',output),JSON.stringify({evidence,errors},null,2));console.log(JSON.stringify({passed:true,evidence},null,2));
}finally{await browser.close();}
