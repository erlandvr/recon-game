import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {startV3,newV3,buyV3,advanceV3,pauseV3,workerPosition} from '../src/v3Game.ts';
import {workPosition} from '../src/v3World.ts';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const browser=await chromium.launch(),errors:string[]=[];
try{
  const page=await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',(e:Error)=>errors.push(e.message));
  const date=new Date('2026-10-21T10:00:00Z');await page.clock.install({time:date});await page.clock.pauseAt(date);
  await page.goto(process.env.GAME_URL??'http://127.0.0.1:5175/recon-game/');
  const button=(name:string)=>page.getByRole('button',{name,exact:true});
  await button('Get your intro').click();await page.clock.runFor(20000);
  let s=advanceV3(startV3(newV3()),10);await page.locator('[data-purchase="system"]').click();s=buyV3(s,'system');
  async function check(){const w=s.developers[0],p=workerPosition(w);assert.equal(await page.locator('.v3-world [data-worker="0"]').getAttribute('transform'),`translate(${p.x} ${p.y})`);assert.equal(await page.locator('.v3-world [data-worker="0"]').getAttribute('data-phase'),w.phase);assert.equal(Number(await page.locator('.v3-game').getAttribute('data-time')),s.time);assert.ok(Math.abs(Number(await page.locator('.v3-game').getAttribute('data-cash'))-s.cash)<1e-7);}
  async function step(ms:number){await page.clock.runFor(ms);s=advanceV3(s,ms/1000);await check();}
  while(!s.systems[1].installed&&s.time<40)await step(50);
  assert.equal(s.developers[0].phase,'outward');assert.equal(s.developers[0].system,0);assert.deepEqual(workerPosition(s.developers[0]),workPosition(1));assert.equal(s.developers[0].duration,2.2);assert.equal(await page.locator('[data-income-coin]').count(),1);
  await mkdir('test-results/v3-direct-repair',{recursive:true});await page.screenshot({path:'test-results/v3-direct-repair/installation-to-repair.png'});
  await step(1000);await page.screenshot({path:'test-results/v3-direct-repair/between-systems.png'});
  await button('Restart').click();s=pauseV3(s);await step(5000);await button('Keep this workshop').click();s=startV3(s);
  while(s.developers[0].phase==='outward')await step(50);
  assert.equal(s.developers[0].phase,'repair');assert.deepEqual(workerPosition(s.developers[0]),workPosition(0));await step(6000);assert.equal(s.systems[0].broken,false);
  assert.deepEqual(errors,[]);console.log('Paid one-worker install → direct 2.2s repair walk: exact positions, income coin, pause and repair completion pass.');
}finally{await browser.close();}
