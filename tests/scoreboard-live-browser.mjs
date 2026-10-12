// Explicit opt-in: runs a paid game, submits a clearly marked setup score, and records its IDs for operator cleanup.
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
import {playSpeed} from '../scripts/speed-benchmark.ts';
if(process.env.SCOREBOARD_LIVE_TEST!=='1')throw new Error('Set SCOREBOARD_LIVE_TEST=1 only on a pre-release/test board; clean up recorded test IDs afterwards.');
const require=createRequire(import.meta.url),{chromium}=require(`${process.env.PLAYWRIGHT_MODULE_DIR}/playwright`),browser=await chromium.launch(),errors=[];
const button=(p,name)=>p.getByRole('button',{name,exact:true}),time=async p=>Number(await p.locator('[data-speed-time]').getAttribute('data-speed-time'));
const name=`Setup test ${randomUUID().slice(0,8)}`,evidence={name,passed:false,runId:null,ownerId:null,secondOwnerId:null};let submitted;
try{
 const p=await browser.newPage({viewport:{width:1280,height:800}});p.on('pageerror',e=>errors.push(e.message));
 p.on('request',req=>{if(req.url().includes('/functions/v1/submit-score')&&!submitted){submitted=req.postDataJSON();evidence.runId=submitted.runId;}});
 const start=new Date();await p.clock.install({time:start});await p.clock.pauseAt(start);await p.goto(process.env.GAME_URL??'http://127.0.0.1:5180');await button(p,'Choose Speed Game').click();await button(p,'LET’S GO').click();await p.clock.runFor(3000);
 const plan=playSpeed({route:'all',reaction:3,beforeModel:4});
 for(const {at,action} of plan.actions){const delta=at-await time(p);if(delta>0)await p.clock.runFor(delta*1000);
  if(action.type==='speed-pause')await button(p,action.paused?'Pause & plan':'Resume game').click();
  else if(['scan','repair-repository'].includes(action.type)){await p.getByLabel('Find system',{exact:true}).selectOption(action.serviceId??'backend');await p.locator('.sg-system-detail').getByRole('button',{name:action.type==='scan'?/^Scan ·/:/^Fix/}).click();}
  else if(action.type==='upgrade')await button(p,'Buy worker · 150 cr').click();
  else if(action.type==='model')await p.locator(`[data-model="${action.model}"]`).getByRole('button').click();
 }
 if(plan.result.at>await time(p))await p.clock.runFor((plan.result.at-await time(p))*1000);
 await p.getByLabel('Name or nickname',{exact:true}).fill(name);await button(p,'Save score').click();
 await p.waitForFunction(()=>document.querySelector('.sb-save')?.textContent?.includes('Saved as')||document.querySelector('.sb-save [role=alert]'));
 evidence.ownerId=await p.evaluate(()=>JSON.parse(localStorage.getItem('recon-scoreboard-auth-v1')??'null')?.user?.id??null);
 assert.match(await p.locator('.sb-save').innerText(),/Saved as/);
 await button(p,'View scoreboard').click();await p.locator('.sb-highlight').waitFor();assert.match(await p.locator('.sb-highlight').innerText(),new RegExp(name));
 const other=await browser.newPage();await other.goto(process.env.GAME_URL??'http://127.0.0.1:5180');await button(other,'View scoreboard').click();await other.getByRole('rowheader',{name,exact:true}).waitFor();await other.reload();await button(other,'View scoreboard').click();await other.getByRole('rowheader',{name,exact:true}).waitFor();
 assert.deepEqual(errors,[]);evidence.passed=true;evidence.finishMs=plan.result.at*1000;await p.screenshot({path:'test-results/scoreboard-live.png'});console.log(evidence);
 const api=process.env.VITE_SUPABASE_URL,key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 const checks=await p.evaluate(async({api,key,submitted})=>{
  const token=JSON.parse(localStorage.getItem('recon-scoreboard-auth-v1')).access_token;
  const send=(body,auth=token)=>fetch(api+'/functions/v1/submit-score',{method:'POST',headers:{apikey:key,Authorization:`Bearer ${auth}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const duplicate=await send(submitted),malformed=await send({...submitted,name:''}),oversized=await send({...submitted,name:'x'.repeat(5000)}),unknownVersion=await send({...submitted,rulesVersion:'unsupported'}),badSession=await send(submitted,'invalid');
  const direct=await fetch(api+'/rest/v1/scoreboard_scores',{method:'POST',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({run_id:crypto.randomUUID(),rules_version:submitted.rulesVersion,display_name:'disallowed',finish_ms:1000})});
  return {duplicate:duplicate.status,malformed:malformed.status,oversized:oversized.status,unknownVersion:unknownVersion.status,badSession:badSession.status,direct:direct.status};
 },{api,key,submitted});
 assert.deepEqual(checks,{duplicate:200,malformed:400,oversized:413,unknownVersion:400,badSession:401,direct:403});
 const second=await other.evaluate(async({api,key,submitted})=>{
  const auth=await fetch(api+'/auth/v1/signup',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:'{}'}),session=await auth.json();
  if(!auth.ok)throw Error('Second test identity could not sign in');
  const attempt=await fetch(api+'/functions/v1/submit-score',{method:'POST',headers:{apikey:key,'Content-Type':'application/json',Authorization:`Bearer ${session.access_token}`},body:JSON.stringify(submitted)});return {ownerId:session.user.id,status:attempt.status};
 },{api,key,submitted});evidence.secondOwnerId=second.ownerId;assert.equal(second.status,409);evidence.endpointChecks=checks;console.log('Live endpoint permissions, duplicate handling, wrong-owner conflict and malformed requests pass.');
}finally{await writeFile('test-results/scoreboard-live-browser.json',JSON.stringify(evidence,null,2));await browser.close();}
