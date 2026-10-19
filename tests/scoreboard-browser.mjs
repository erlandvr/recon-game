import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {playSpeed} from '../scripts/speed-benchmark.ts';
import {createSubmitScoreHandler} from '../supabase/functions/_shared/submitScoreHandler.ts';
import {SCORE_RULES} from '../supabase/functions/_shared/scoreboard.ts';
import {databaseBackend,scoreboardDb} from './helpers/scoreboard.ts';
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`);
const url=process.env.GAME_URL??'http://127.0.0.1:5176',browser=await chromium.launch(),errors=[],requests=[],rows=new Map();
const button=(p,name)=>p.getByRole('button',{name,exact:true}),time=async p=>Number(await p.locator('[data-speed-time]').getAttribute('data-speed-time'));
const db=await scoreboardDb(),backend=databaseBackend(db),submitted=[];
const handler=createSubmitScoreHandler({...backend,authenticate:token=>backend.authenticate(token==='test.session.token'?'valid-test-session':token)});
let loseResponse=true,boardFailure=false,authCalls=0;
async function fresh(motion='no-preference'){
 const p=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:motion});p.on('pageerror',e=>errors.push(e.message));
 await p.route('https://scoreboard-test.invalid/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;requests.push(path);
  const json=body=>route.fulfill({contentType:'application/json',body:JSON.stringify(body)});
  if(path.startsWith('/auth/')){authCalls++;return json({access_token:'test.session.token',refresh_token:'test-refresh',token_type:'bearer',expires_in:3600,user:{id:'73c9aa1d-7760-4c64-b610-1e5f0bf59830',aud:'authenticated',role:'authenticated',is_anonymous:true,created_at:new Date().toISOString()}});}
  if(path.includes('submit-score')){const s=req.postDataJSON();submitted.push(s);const response=await handler(new Request(req.url(),{method:'POST',headers:req.headers(),body:req.postData()}));const result=await response.json();if(response.ok){rows.set(s.runId,result.saved);if(loseResponse){loseResponse=false;return route.abort();}}return route.fulfill({status:response.status,contentType:'application/json',body:JSON.stringify(result)});}
  if(path.includes('scoreboard_page')){if(boardFailure)return route.fulfill({status:503,body:'unavailable'});const input=req.postDataJSON();const result=await db.query('select public.scoreboard_page($1,$2,$3) as page',[input.p_version,input.p_page,input.p_highlight]);return json(result.rows[0].page);}
  return route.abort();
 });
 const start=new Date('2026-10-12T12:00:00Z');await p.clock.install({time:start});await p.clock.pauseAt(start);await p.goto(url);return p;
}
try{
 await mkdir('test-results',{recursive:true});
 for(const motion of ['no-preference','reduce']){
  const p=await fresh(motion);await button(p,'Choose Speed Game').click();await button(p,'LET’S GO').click();
  assert.equal(await p.locator('.start-count-number').innerText(),'3');assert.equal(await time(p),0);
  await p.clock.runFor(1000);assert.equal(await p.locator('.start-count-number').innerText(),'2');
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  await p.clock.runFor(10000);assert.equal(await time(p),0);assert.equal(await p.locator('.start-count-number').innerText(),'2');
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});
  await p.clock.runFor(1000);assert.equal(await p.locator('.start-count-number').innerText(),'1');
  if(motion==='reduce')assert.equal(await p.locator('.start-count-number').evaluate(e=>getComputedStyle(e).animationName),'none');
  await p.clock.runFor(100);await p.locator('.start-count-number').evaluate(el=>el.getAnimations().forEach(a=>{a.pause();a.currentTime=300;}));await p.screenshot({path:`test-results/countdown-${motion}.png`});
  await p.keyboard.press('Escape');assert.ok(await p.locator('.start-count-dialog').evaluate(e=>e.open));
  await p.clock.runFor(900);assert.equal(await time(p),0);assert.equal(await p.locator('.start-count-go').innerText(),'GO!');
  assert.equal(await p.locator('.start-count-overlay').evaluate(e=>getComputedStyle(e).pointerEvents),'none');
  await button(p,'Scan · 5 cr').click();await p.clock.runFor(500);assert.equal(await time(p),.5);
  await p.clock.runFor(300);assert.equal(await p.locator('.start-count-overlay').count(),0);await button(p,'Pause & plan').click();await button(p,'Resume game').click();assert.equal(await p.locator('.start-count-dialog').count(),0);await p.close();
 }
 assert.equal(requests.length,0,'starting and playing never contacts Supabase');
 const p=await fresh();await button(p,'View scoreboard').click();await p.getByText('No scores yet. Finish a Speed Game to add yours.').waitFor();assert.equal(authCalls,0);await button(p,'Close scoreboard').click();
 await button(p,'Choose Speed Game').click();await button(p,'LET’S GO').click();await p.clock.runFor(3000);
 const plan=playSpeed({route:'all',reaction:3,beforeModel:4});
 for(const {at,action} of plan.actions){const delta=at-await time(p);if(delta>0)await p.clock.runFor(delta*1000);
  if(action.type==='speed-pause')await button(p,action.paused?'Pause & plan':'Resume game').click();
  else if(['scan','repair-repository'].includes(action.type)){await p.getByLabel('Find system',{exact:true}).selectOption(action.serviceId??'backend');await p.locator('.sg-system-detail').getByRole('button',{name:action.type==='scan'?/^Scan ·/:/^Fix/}).click();}
  else if(action.type==='upgrade')await button(p,'Buy worker · 150 cr').click();
  else if(action.type==='model')await p.locator(`[data-model="${action.model}"]`).getByRole('button').click();
 }
 if(plan.result.at>await time(p))await p.clock.runFor((plan.result.at-await time(p))*1000);
 await p.getByRole('dialog',{name:'Full autonomy achieved',exact:true}).waitFor();assert.equal(authCalls,0);
 for(const [width,height] of [[1280,800],[800,700]]){await p.setViewportSize({width,height});await p.screenshot({path:`test-results/scoreboard-finish-${width}.png`,animations:'disabled'});assert.ok(await button(p,'Save score').isVisible());assert.ok(await button(p,'Choose game mode').isVisible());}
 await button(p,'Skip').click();assert.equal(authCalls,0);await button(p,'Continue practising').click();await p.clock.runFor(20000);await button(p,'View result').click();
 await p.getByLabel('Name or nickname',{exact:true}).fill('   ');assert.ok(await button(p,'Save score').isDisabled());
 await p.getByLabel('Name or nickname',{exact:true}).fill('Élodie <b>李</b>');await button(p,'Save score').click();await p.getByRole('alert').waitFor();assert.equal(rows.size,1);assert.equal([...rows.values()][0].finish_ms,plan.result.at*1000);
 await p.reload();await p.getByRole('region',{name:'Scores waiting to save'}).waitFor();const beforeRetry=authCalls;await button(p,'Retry save').click();await p.getByRole('region',{name:'Scores waiting to save'}).waitFor({state:'detached'});assert.equal(authCalls,beforeRetry);assert.equal(rows.size,1);assert.deepEqual(submitted[1],submitted[0]);assert.equal(submitted[0].rulesVersion,SCORE_RULES.id);assert.ok(submitted[0].replay.length>10);assert.ok(submitted[0].replay.every(e=>e.atMs<submitted[0].finishMs));
 const other=await fresh();await button(other,'View scoreboard').click();await other.getByRole('rowheader',{name:'Élodie <b>李</b>'}).waitFor();assert.equal(await other.locator('.sb-modal tbody b').count(),0);await other.screenshot({path:'test-results/scoreboard-shared.png'});
 await db.query("insert into public.scoreboard_scores values($1,'speed-d129-v1','Existing player',60000,now())",[crypto.randomUUID()]);await button(other,'Refresh').click();await other.getByRole('rowheader',{name:'Existing player',exact:true}).waitFor();await other.getByRole('rowheader',{name:'Élodie <b>李</b>'}).waitFor();assert.equal(await button(other,'View previous scores').count(),0);assert.equal(await button(other,'View verified scores').count(),0);assert.deepEqual(await other.locator('.sb-modal tbody tr td:first-child').allTextContents(),['1','2']);await other.screenshot({path:'test-results/scoreboard-combined.png'});
 boardFailure=true;await button(other,'Refresh').click();await other.getByRole('alert').waitFor();assert.equal(await other.getByText('No scores yet. Finish a Speed Game to add yours.').count(),0);boardFailure=false;await button(other,'Try again').click();await other.getByRole('rowheader',{name:'Élodie <b>李</b>'}).waitFor();
 await p.evaluate(()=>localStorage.setItem('recon-scoreboard-pending-v1',JSON.stringify([{score:{runId:crypto.randomUUID(),name:'Discard me',mode:'speed',rulesVersion:'old',finishMs:500000,seed:1,covered:15,modules:3,health:90,trialSeconds:5,autoScans:1,autoRepairs:1,credits:50,netIncome:5,practice:false},ownerId:null}])));await p.reload();await button(p,'Retry save').click();await p.getByRole('alert').waitFor();await button(p,'Discard').click();assert.equal(await p.getByRole('region',{name:'Scores waiting to save'}).count(),0);
 assert.deepEqual(errors,[]);await writeFile('test-results/scoreboard-browser.json',JSON.stringify({passed:true,backend:'isolated HTTP handler with authoritative replay and local PostgreSQL; mocked auth',authCalls,rows:rows.size,finishMs:plan.result.at*1000,errors},null,2));console.log('Scoreboard browser checks pass: countdown, hidden tab, reduced motion, opt-in, frozen practice score, lost response, reload retry, cross-session display, text escaping, error and discard.');
}finally{await browser.close();await db.close();}
