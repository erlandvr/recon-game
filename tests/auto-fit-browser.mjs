import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(),evidence=[],errors=[];
try{
 for(const reduced of [false,true]){
  const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:reduced?'reduce':'no-preference'});
  page.on('pageerror',e=>errors.push(e.message));
  const button=name=>page.getByRole('button',{name,exact:true});
  const tick=async seconds=>{await page.clock.runFor(seconds*1000);await page.waitForTimeout(40);};
  await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));
  await page.goto('http://127.0.0.1:5173/');await button('Choose Long Game').click();await button('Start game').click();
  for(let i=0;i<3;i++)await button('Recon logo').click();
  await button(/^Corporate expansion /).click();await button('Start Next Chapter').click();await tick(1);
  const canvas=page.locator('.ecosystem-canvas'),count=await page.locator('.repo-dot').count();
  await page.getByLabel('Find repository').selectOption('backend');assert.equal(Number(await canvas.getAttribute('data-zoom')),1);
  for(let i=0;i<120&&await page.locator('.repo-dot').count()===count;i++)await tick(.5);
  assert.ok(await page.locator('.repo-dot').count()>count,'A real corporate growth event occurred');await tick(1);
  assert.equal(Number(await canvas.getAttribute('data-zoom')),1,'Growth preserves focused repo');
  assert.equal(await page.locator('.scope-path button').count(),3,'Focused breadcrumb remains');
  await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(100);await tick(1);assert.equal(Number(await canvas.getAttribute('data-zoom')),1,'Resize preserves focus');
  await button('Fit all').click();await tick(1);
  const fittedCount=await page.locator('.repo-dot').count();
  for(let i=0;i<120&&await page.locator('.repo-dot').count()===fittedCount;i++)await tick(.5);
  assert.ok(await page.locator('.repo-dot').count()>fittedCount);await tick(1);
  assert.equal(await page.locator('.scope-path button').count(),1);
  const contained=await canvas.evaluate(el=>{const v=el.getBoundingClientRect();return [...el.querySelectorAll('.repo-dot')].every(dot=>{const r=dot.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return x>=v.left&&x<=v.right&&y>=v.top&&y<=v.bottom;});});assert.ok(contained,'Fit all re-enables automatic framing of new repositories');
  await button('Zoom in').click();const manualZoom=Number(await canvas.getAttribute('data-zoom')),manualCount=await page.locator('.repo-dot').count();
  for(let i=0;i<120&&await page.locator('.repo-dot').count()===manualCount;i++)await tick(.5);
  assert.ok(await page.locator('.repo-dot').count()>manualCount);await tick(1);assert.equal(Number(await canvas.getAttribute('data-zoom')),manualZoom,'Manual zoom survives growth');
  await page.screenshot({path:`test-results/auto-fit-long-${reduced?'reduced':'animated'}.png`});evidence.push({mode:'long',reduced,growth:true,resize:true});await page.close();
 }
 assert.deepEqual(errors,[]);await writeFile('test-results/auto-fit-browser.json',JSON.stringify({passed:true,evidence,errors},null,2));console.log({passed:true,evidence});
}finally{await browser.close();}
