import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(),evidence=[],errors=[];
try{
 await mkdir('test-results',{recursive:true});
 for(const [width,height,reduced] of [[1280,800,false],[800,700,true]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});page.on('pageerror',e=>errors.push(e.message));
  const button=name=>page.getByRole('button',{name,exact:true}),tick=async n=>{await page.clock.runFor(n*1000);await page.waitForTimeout(30);};
  await page.clock.install({time:new Date('2026-10-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-12T12:00:00Z'));await page.goto('http://127.0.0.1:5173/');await button('Choose Speed Game').click();await button('Start Speed Game').click();
  const canvas=await page.getByRole('region',{name:'Zoomable ecosystem'}).elementHandle();const camera=()=>page.locator('.ecosystem-canvas').evaluate(el=>({zoom:Number(el.dataset.zoom),x:Number(el.dataset.cameraX),y:Number(el.dataset.cameraY)}));const initialCamera=await camera();
  await button('Scan Backend').click();await tick(3);await button('Fix Backend').click();await tick(5);
  assert.equal(await page.locator('.repo-dot').count(),1);assert.ok(await canvas.evaluate(el=>el===document.querySelector('.ecosystem-canvas')));
  await tick(2.5);assert.equal(await page.locator('.repo-dot').count(),2);await tick(.4);
  const middle=await camera();await tick(.5);const end=await camera();
  assert.notDeepEqual(end,initialCamera,'Arrival reframes the overview');if(!reduced)assert.notDeepEqual(middle,end,'Camera interpolates during arrival');else assert.deepEqual(middle,end);
  await page.getByLabel('Find repository').selectOption('backend');assert.equal(Number(await page.locator('.ecosystem-canvas').getAttribute('data-zoom')),1);
  await tick(4.1);assert.equal(await page.locator('.repo-dot').count(),4);assert.ok(await canvas.evaluate(el=>el===document.querySelector('.ecosystem-canvas')));
  await tick(1);assert.equal(Number(await page.locator('.ecosystem-canvas').getAttribute('data-zoom')),1,'Arrivals preserve repository focus');assert.equal(await page.locator('.scope-path button').count(),3);
  await page.getByLabel('Find repository').selectOption('backend');await tick(1);assert.equal(Number(await page.locator('.ecosystem-canvas').getAttribute('data-zoom')),1,'Ordinary ticks preserve manual focus');
  await page.setViewportSize({width:width+40,height});await page.waitForTimeout(100);await tick(1);assert.equal(Number(await page.locator('.ecosystem-canvas').getAttribute('data-zoom')),1,'Resize preserves manual zoom');await page.setViewportSize({width,height});await page.waitForTimeout(100);await tick(1);
  await page.screenshot({path:`test-results/speed-arrivals-${width}.png`});
  await page.getByLabel('Find repository').selectOption('backend');await page.waitForTimeout(50);
  const issues=await page.evaluate(()=>{
   const issues=[],v=document.querySelector('.ecosystem-canvas').getBoundingClientRect(),c=document.querySelector('.node-backend').getBoundingClientRect();
   if(c.top<v.top||c.bottom>v.bottom||c.left<v.left||c.right>v.right)issues.push({clipped:'Backend',card:c.toJSON(),canvas:v.toJSON()});
   const upgrades=document.querySelector('.investments').getBoundingClientRect(),ticker=document.querySelector('.event-ticker').getBoundingClientRect(),bottom=document.querySelector('.canvas-bottom').getBoundingClientRect(),map=document.querySelector('.ecosystem').getBoundingClientRect();if(upgrades.bottom>ticker.top+1)issues.push('Upgrades overlap ticker');if(bottom.bottom>map.bottom+1)issues.push({clipped:'Map controls',map:map.toJSON(),bottom:bottom.toJSON(),shell:document.querySelector('.ecosystem-canvas-shell').getBoundingClientRect().toJSON(),upgrades:upgrades.toJSON(),ticker:ticker.toJSON()});
   if(document.documentElement.scrollHeight>innerHeight+1||document.documentElement.scrollWidth>innerWidth+1)issues.push('Page overflow');return issues;
  });await page.screenshot({path:`test-results/speed-focused-${width}.png`});assert.deepEqual(issues,[]);evidence.push({width,reduced,middle,end});await page.close();
 }
 assert.deepEqual(errors,[]);await writeFile('test-results/speed-arrivals.json',JSON.stringify({passed:true,evidence,errors},null,2));console.log({passed:true,evidence});
}finally{await browser.close();}
