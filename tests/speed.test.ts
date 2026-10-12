import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newGame,newSpeedGame,advance,act,continueSpeedPractice,automationCost,autoRepairCost,upgradeCost,efficiencyQuote,health,income,systemIncome,autonomyStatus,scopeQuote,scanCost,scanDuration,repairDuration,repairCost,type GameState,type Action} from '../src/game.ts';
import {activeServices,serviceHealth,serviceOf} from '../src/campaign.ts';
import {scopeRepositories} from '../src/organization.ts';
import {SPEED,SPEED_MODELS,speedIncidentPeriod} from '../src/speedRules.ts';
import {playSpeed} from '../scripts/speed-benchmark.ts';
function doAction(s:GameState,a:Action){const r=act(s,a);assert.equal(r.ok,true,r.message);return r.state;}
function started(){return doAction(newSpeedGame(),{type:'speed-pause',paused:false});}
function restored(){let s=doAction(started(),{type:'scan'});s=advance(s,3);s=doAction(s,{type:'repair',findingId:1});return advance(s,5);}
const tickCeil=(seconds:number)=>Math.ceil((seconds-1e-7)*2)/2;
function arrive(s:GameState){return advance(s,tickCeil(s.campaign!.nextRepositoryAt-s.time));}
function funded(){const s=restored();s.credits=10000;return s;}

test('Speed starts paused with a complete organization, one owned offline system, and zero income; Long unchanged',()=>{
 const s=newSpeedGame();assert.equal(s.organization.repositories.length,15);assert.deepEqual(s.organization.modules.map(m=>m.repositoryIds.length),[5,5,5]);assert.deepEqual(activeServices(s),['backend']);assert.equal(health(s),0);assert.equal(income(s),0);assert.deepEqual(advance(s,300),s);
 const long=newGame();assert.equal(long.speed,undefined);assert.equal(automationCost(long),210);assert.equal(autoRepairCost(long),480);assert.equal(upgradeCost(long,'capacity'),150);assert.equal(long.findings.length,0);
 assert.equal(automationCost(s),0);assert.equal(autoRepairCost(s),0);assert.equal(efficiencyQuote(s),null);
});
test('first scan reveals but never heals; fix activates and starts income only at completion',()=>{
 let s=started();s=advance(s,900);assert.equal(s.credits,40);assert.equal(s.findings.length,1);s=doAction(s,{type:'scan'});s=advance(s,3);assert.equal(s.findings[0].known,true);assert.equal(health(s),0);assert.equal(income(s),0);s=doAction(s,{type:'repair',findingId:1});s=advance(s,4.5);assert.equal(income(s),0);s=advance(s,.5);assert.equal(s.credits,20);assert.equal(income(s),2);assert.deepEqual(s.speed!.activated,['backend']);s=advance(s,1);assert.equal(s.credits,22);
});
test('first restoration cannot be bankrupted with repeated scans or planning purchases',()=>{
 let s=started();assert.equal(act(s,{type:'automate',serviceId:'backend'}).ok,false);s=doAction(s,{type:'scan'});assert.equal(act(s,{type:'scan'}).ok,false);s=advance(s,3);assert.equal(act(s,{type:'scan'}).ok,false);s=doAction(s,{type:'repair',findingId:1});assert.equal(act(s,{type:'scan'}).ok,false);assert.equal(advance(s,5).speed!.activated.length,1);
});
test('free waves add 2, 4 and 8 systems; the first arrives on the first fix',()=>{
 let s=started();s=advance(s,300);assert.equal(s.speed!.owned.length,1);assert.equal(s.speed!.wave,0);assert.equal(s.campaign!.nextRepositoryAt,Infinity);
 s=restored();assert.equal(s.credits,20);assert.deepEqual(activeServices(s),['backend','frontend','auth']);assert.equal(s.speed!.wave,1);assert.equal(s.speed!.lastWaveAt,8);assert.equal(s.campaign!.nextRepositoryAt,28);assert.equal(serviceHealth(s,'frontend'),0);assert.equal(systemIncome(s,'frontend'),0);assert.equal(s.stats.spent.upgrades,0);
 assert.deepEqual(scopeRepositories(s,{level:'module',id:'module-1'}),['backend','frontend','auth']);
 s=advance(s,19.5);assert.equal(s.speed!.owned.length,3);const funds=s.credits;s=advance(s,.5);assert.equal(s.speed!.owned.length,7);assert.equal(s.credits,funds+1);assert.equal(s.speed!.wave,2);assert.equal(s.campaign!.nextRepositoryAt,48);
 s=advance(s,19.5);assert.equal(s.speed!.owned.length,7);s=advance(s,.5);assert.equal(s.speed!.owned.length,15);assert.equal(s.speed!.wave,3);assert.equal(s.campaign!.nextRepositoryAt,Infinity);assert.equal(new Set(s.speed!.owned).size,15);assert.equal(s.campaign!.repositoryCount,15);
 for(const id of s.speed!.owned.slice(1))assert.equal(s.findings.filter(f=>serviceOf(f)===id).length,1);
 s=advance(s,100);assert.equal(s.speed!.owned.length,15);assert.equal(s.speed!.wave,3);
});
test('planning freezes waves and retains their remaining countdown',()=>{
 let s=advance(restored(),3);s=doAction(s,{type:'speed-pause',paused:true});assert.deepEqual(advance(s,300),s);s=doAction(s,{type:'speed-pause',paused:false});s=advance(s,16.5);assert.equal(s.speed!.owned.length,3);s=advance(s,.5);assert.equal(s.speed!.owned.length,7);
});
test('each branch has two paid stages; coverage includes future systems and cannot be bought separately',()=>{
 for(const [middle,final,other] of [['scout','scanner','specialist'],['specialist','master','scout']] as const){
  let s=funded();assert.equal(act(s,{type:'model',model:final}).ok,false);const funds=s.credits;
  s=doAction(s,{type:'model',model:middle});assert.equal(s.credits,funds-SPEED_MODELS[middle].cost);
  assert.equal(s.campaign!.automated.includes('backend'),false);assert.equal(s.campaign!.remediation.includes('backend'),false);
  assert.equal(act(s,{type:'model',model:middle}).ok,false);assert.equal(act(s,{type:'model',model:other}).ok,true);
  s=arrive(s);assert.equal(s.campaign!.automated.includes('frontend'),false);assert.equal(s.campaign!.remediation.includes('frontend'),false);
  const before=s.credits;s=doAction(s,{type:'model',model:final});assert.equal(before-s.credits,SPEED_MODELS[final].cost);
  s=arrive(s);assert.deepEqual(s.campaign!.automated,final==='scanner'?s.speed!.owned:[]);assert.deepEqual(s.campaign!.remediation,final==='master'?s.speed!.owned:[]);
  const running=advance(s,25);assert.equal(running.speed!.activated.includes('repo-12'),false,'one final model cannot restore a new system alone');
  assert.equal(scanDuration(s),SPEED_MODELS[final].scanSeconds);assert.equal(repairDuration(s),SPEED_MODELS[final].fixSeconds);assert.equal(repairCost(s),SPEED_MODELS[final].fixCost);
  for(const model of [middle,final])assert.equal(act(s,{type:'model',model}).ok,false);
  for(const type of ['automate','auto-repair'] as const){assert.equal(act(s,{type,serviceId:'backend'}).ok,false);assert.ok(scopeQuote(s,{level:'project',id:'project-1'},type).reason);}
 }
});
test('paused purchases freeze simulation and queue dispatch; running work is not retimed, queued work uses new model',()=>{
 let s=funded();s=arrive(s);s=doAction(s,{type:'scan',serviceId:'frontend'});s=doAction(s,{type:'scan',serviceId:'backend'});const end=s.jobs[0].endsAt;s=doAction(s,{type:'speed-pause',paused:true});s=doAction(s,{type:'model',model:'scout'});s=doAction(s,{type:'upgrade',upgrade:'capacity'});assert.equal(s.jobs.length,1);assert.equal(s.queue.length,1);assert.equal(s.jobs[0].endsAt,end);assert.deepEqual(advance(s,600),s);assert.equal(act(s,{type:'scan'}).ok,false);assert.equal(act(s,{type:'scope',scope:{level:'module',id:'module-1'},operation:'repair'}).ok,false);s=doAction(s,{type:'speed-pause',paused:false});s=advance(s,.5);assert.equal(s.jobs.length,2);assert.equal(s.jobs[1].endsAt-s.jobs[1].startedAt,1);
});
test('group manual work remains available; unaffordable bundles reject atomically',()=>{
 let s=funded();s=arrive(s);
 const scope={level:'project' as const,id:'project-1'},quote=scopeQuote(s,scope,'scan');assert.equal(quote.cost,35);s.credits=34;
 const rejected=act(s,{type:'scope',scope,operation:'scan'});assert.equal(rejected.ok,false);assert.deepEqual(rejected.state,s);
 s.credits=35;s=doAction(s,{type:'scope',scope,operation:'scan'});assert.equal(s.credits,0);assert.equal(s.jobs.length+s.queue.length,7);
});
test('neglect remains recoverable and batched advancement matches individual ticks',()=>{
 const start=restored(),batched=advance(start,300);let stepped=start;for(let i=0;i<600;i++)stepped=advance(stepped,.5);assert.deepEqual(stepped,batched);assert.ok(income(batched)>0);assert.ok(batched.credits>100);assert.ok(health(batched)<100);
});
test('paid single and combined model routes finish within the target with no free credits',()=>{
 for(const route of ['scanner','master','all'] as const){
  const r=playSpeed({route,reaction:3});assert.ok(r.result?.won,route);assert.equal(r.result.covered,15);assert.ok(r.result.at>=90&&r.result.at<=480,`${route}: ${r.result.at}`);assert.ok(r.credits>=0);assert.ok(r.actions.every(a=>a.credits>=0));assert.ok(r.modelAt!<=110);assert.ok(r.finalAt!<=250);
 }

});
test('expansion pressure ramps gradually; base workload exceeds two workers at full scale',()=>{
 assert.equal(speedIncidentPeriod(1,0),60/3.92);assert.ok(speedIncidentPeriod(15,240)<speedIncidentPeriod(4,240));assert.ok(Math.abs(speedIncidentPeriod(15,240)-speedIncidentPeriod(15,239))<.1);
 assert.ok(15*(3+5)/speedIncidentPeriod(15,240)>2);assert.ok(15*(.5+.5)/speedIncidentPeriod(15,240)<2);
 const manual=playSpeed({route:'base',reaction:1,maxSeconds:360});assert.equal(manual.result,null);assert.equal(manual.coverage,0);assert.ok(manual.credits>=0,'manual upkeep never overspends');
});
test('Speed requires all systems to arrive, be restored and have both automations',()=>{
 let s=funded();assert.match(autonomyStatus(s).reason!,/arrive/);assert.equal(advance(s,.5).speed!.result,null);
 s=healthySpeed();s.speed!.activated.pop();assert.match(autonomyStatus(s).reason!,/Restore/);assert.equal(advance(s,.5).speed!.result,null);
 for(const kind of ['automated','remediation'] as const){s=healthySpeed();s.campaign![kind].pop();assert.match(autonomyStatus(s).reason!,/Install/);assert.equal(advance(s,.5).speed!.result,null);}
});

test('only final models automate their speciality; both finals restore future systems',()=>{
 let s=doAction(funded(),{type:'model',model:'scout'});s=doAction(s,{type:'model',model:'specialist'});s=arrive(s);s=advance(s,20);
 assert.equal(s.findings.find(f=>serviceOf(f)==='frontend')!.known,false);assert.equal(s.jobs.length,0);assert.equal(autonomyStatus(s).covered,0);
 s=doAction(s,{type:'model',model:'scanner'});s=advance(s,5);assert.ok(s.findings.some(f=>serviceOf(f)==='frontend'&&f.known&&f.repairedAt===null));assert.equal(s.speed!.activated.includes('frontend'),false);assert.equal(autonomyStatus(s).covered,0);
 s=doAction(s,{type:'model',model:'master'});s=advance(s,10);assert.ok(s.speed!.activated.includes('frontend'));
 s=advance(s,300);assert.ok(s.speed!.activated.includes('repo-12'));
 let fixOnly=doAction(doAction(funded(),{type:'model',model:'specialist'}),{type:'model',model:'master'});fixOnly=arrive(fixOnly);fixOnly=advance(fixOnly,8);assert.equal(fixOnly.findings.find(f=>serviceOf(f)==='frontend')!.known,false);fixOnly=doAction(fixOnly,{type:'scan',serviceId:'frontend'});fixOnly=advance(fixOnly,5);assert.ok(fixOnly.speed!.activated.includes('frontend'));
 let late=advance(restored(),400);assert.ok(health(late)<50);late=doAction(late,{type:'model',model:'specialist'});late=doAction(late,{type:'model',model:'master'});late=doAction(late,{type:'scan'});late=advance(late,120);assert.ok(late.findings.filter(f=>serviceOf(f)==='backend'&&f.known).every(f=>f.repairedAt!==null),'automatic fixes clear the revealed backlog; new hidden issues still need a scan');assert.ok(late.campaign!.autoRepairs>0);assert.ok(late.credits>=0);
});

test('all four models combine in either order without losing benefits or charging duplicates',()=>{
 for(const order of [['scout','specialist','scanner','master'],['specialist','master','scout','scanner'],['scout','scanner','specialist','master']] as const){
  let s=funded();const start=s.credits;let spent=0,scan=3,fix=5,scanPrice=5,fixPrice=15;
  for(const model of order){
   const before=structuredClone(s);s=doAction(s,{type:'model',model});spent+=SPEED_MODELS[model].cost;
   assert.equal(s.credits,start-spent);assert.equal(before.speed!.models.includes(model),false,'purchases do not mutate previous state');
   scan=Math.min(scan,SPEED_MODELS[model].scanSeconds);fix=Math.min(fix,SPEED_MODELS[model].fixSeconds);scanPrice=Math.min(scanPrice,SPEED_MODELS[model].scanCost);fixPrice=Math.min(fixPrice,SPEED_MODELS[model].fixCost);
   assert.equal(scanDuration(s),scan);assert.equal(repairDuration(s),fix);assert.equal(scanCost(s),scanPrice);assert.equal(repairCost(s),fixPrice);
   const duplicate=act(s,{type:'model',model});assert.equal(duplicate.ok,false);assert.deepEqual(duplicate.state,s);
  }
  assert.equal(s.speed!.models.length,5);assert.equal(scanDuration(s),.25);assert.equal(repairDuration(s),.25);assert.equal(scanCost(s),2);assert.equal(repairCost(s),2);
 }
});
test('intermediate models remain manual and model prices match current tuning',()=>{
 assert.deepEqual(['scout','specialist','scanner','master'].map(id=>SPEED_MODELS[id as keyof typeof SPEED_MODELS].cost),[50,90,225,300]);
 let s=restored();s.credits=49.99;assert.equal(act(s,{type:'model',model:'scout'}).ok,false);s.credits=50;s=doAction(s,{type:'model',model:'scout'});assert.equal(s.credits,0);
 s.credits=90;s=doAction(s,{type:'model',model:'specialist'});assert.equal(s.credits,0);assert.deepEqual(s.campaign!.automated,[]);assert.deepEqual(s.campaign!.remediation,[]);
 s.credits=200;s=arrive(s);assert.equal(scanDuration(s),1);assert.equal(repairDuration(s),1);s=advance(s,25);assert.equal(s.speed!.activated.includes('frontend'),false);
 const manual=playSpeed({route:'combined',reaction:3,maxSeconds:360});assert.equal(manual.result,null);assert.equal(manual.coverage,0);
});

test('a delayed first fix anchors wave timing, and final automation covers every member of a wave',()=>{
 let s=advance(started(),100);s=doAction(s,{type:'scan'});s=advance(s,3);s=doAction(s,{type:'repair',findingId:1});s=advance(s,5);assert.equal(s.speed!.lastWaveAt,108);assert.equal(s.campaign!.nextRepositoryAt,128);
 s.credits=10000;for(const model of ['scout','specialist','scanner','master'] as const)s=doAction(s,{type:'model',model});
 s=advance(s,40);assert.equal(s.speed!.owned.length,15);assert.deepEqual(s.campaign!.automated,s.speed!.owned);assert.deepEqual(s.campaign!.remediation,s.speed!.owned);assert.equal(s.speed!.lastWaveAt,148);
});

test('Speed incidents are twice as frequent as D126, including first post-restoration incidents',()=>{
 const s=restored();assert.equal(s.speed!.nextIncident.backend,s.time+32/3.92);
 for(const [active,time] of [[1,0],[7,120],[15,240]]){
  const previous=Math.max(40,60-Math.max(0,active-3)*1.5-Math.min(8,Math.max(0,time-90)*8/150))/1.96;
  assert.ok(Math.abs(speedIncidentPeriod(active,time)*2-previous)<1e-9);
 }
 let f=doAction(s,{type:'scan',serviceId:'frontend'});f=advance(f,3);f=doAction(f,{type:'repair-repository',serviceId:'frontend'});f=advance(f,5);
 assert.equal(f.speed!.nextIncident.frontend,f.time+60/3.92);
});
function healthySpeed(){
 const s=funded();s.speed!.owned=s.organization.repositories.map(r=>r.id);s.speed!.activated=[...s.speed!.owned];s.speed!.wave=3;s.campaign!.nextRepositoryAt=Infinity;s.campaign!.repositoryCount=15;
 s.campaign!.automated=[...s.speed!.owned];s.campaign!.remediation=[...s.speed!.owned];s.findings=[];s.jobs=[];s.queue=[];s.speed!.nextIncident=Object.fromEntries(s.speed!.owned.map(id=>[id,Infinity]));return s;
}
function goldenUnhealthySpeed(){
 const s=healthySpeed(),template=newSpeedGame().findings[0];
 s.findings=s.speed!.owned.flatMap((serviceId,i)=>Array.from({length:5},(_,j)=>({...template,id:i*5+j+1,serviceId,known:true,repairedAt:null,kind:'compliance' as const,deadline:0,escalated:true})));
 s.credits=0;s.campaign!.autoScans=0;s.campaign!.autoRepairs=0;return s;
}
test('gold coverage alone cannot win at low health, with overdue work or without reserve',()=>{
 const unhealthy=goldenUnhealthySpeed();assert.match(autonomyStatus(unhealthy).reason!,/90%/);assert.equal(advance(unhealthy,5).speed!.result,null);
 const reserve=healthySpeed();reserve.credits=34;assert.match(autonomyStatus(reserve).reason!,/35/);
 const manual=healthySpeed();manual.jobs.push({id:999,type:'scan',serviceId:'backend',startedAt:manual.time,endsAt:manual.time+10,findingId:null,capturedIds:[],revision:0});assert.match(autonomyStatus(manual).reason!,/manual/);
});
test('Speed requires five healthy seconds and prior automatic scans and fixes; pause and victory freeze time',()=>{
 for(const [scans,fixes] of [[0,0],[1,0],[0,1]]){const s=healthySpeed();s.campaign!.autoScans=scans;s.campaign!.autoRepairs=fixes;assert.equal(advance(s,10).speed!.result,null);}
 let s=healthySpeed();s.campaign!.autoScans=1;s.campaign!.autoRepairs=1;s=advance(s,.25);const start=s.time;
 s=doAction(s,{type:'speed-pause',paused:true});assert.deepEqual(advance(s,60),s);s=doAction(s,{type:'speed-pause',paused:false});
 s=advance(s,4.75);assert.equal(s.speed!.result,null);s=advance(s,.25);assert.equal(s.speed!.result!.at,start+5);assert.equal(s.campaign!.autonomy.victory!.duration,5);
 assert.deepEqual(advance(s,100),s);assert.equal(act(s,{type:'scan'}).ok,false);const practice=advance(continueSpeedPractice(s),20);assert.deepEqual(practice.speed!.result,s.speed!.result);assert.equal(practice.time,s.time+20);
 let interrupted=healthySpeed();interrupted.campaign!.autoScans=1;interrupted.campaign!.autoRepairs=1;interrupted=advance(interrupted,3);interrupted.campaign!.remediation.pop();interrupted=advance(interrupted,.25);assert.equal(interrupted.campaign!.autonomy.elapsed,0);assert.equal(interrupted.speed!.result,null);
});
test('both final models visibly recover a neglected ecosystem under full pressure, even with one worker',()=>{
 for(const workSlots of [1,2]){
  let s=goldenUnhealthySpeed();s.speed!.models=['base'];s.campaign!.automated=[];s.campaign!.remediation=[];s.credits=1500;s.workSlots=workSlots;
  s.speed!.nextIncident=Object.fromEntries(s.speed!.owned.map((id,i)=>[id,s.time+1+i*.25]));s=doAction(s,{type:'speed-pause',paused:true});
  for(const model of ['scout','specialist','scanner','master'] as const)s=doAction(s,{type:'model',model});
  assert.equal(s.speed!.result,null);assert.ok(health(s)<60);assert.deepEqual(advance(s,60),s);s=doAction(s,{type:'speed-pause',paused:false});
  const start=s.time;s=advance(s,10);assert.equal(s.speed!.result,null);assert.ok(health(s)>20,'recovery is visible before victory');s=advance(s,80);
  assert.ok(s.speed!.result,'automatic work recovers the backlog');assert.ok(s.speed!.result!.health>=90);assert.ok(s.speed!.result!.at>start+5);assert.ok(s.speed!.owned.every(id=>serviceHealth(s,id)>=60));assert.ok(s.campaign!.autoScans>0&&s.campaign!.autoRepairs>0);
 }
});
test('final model jobs complete in a quarter second and automatic scans can repeat after two seconds',()=>{
 let s=doAction(funded(),{type:'model',model:'scout'});s=doAction(s,{type:'model',model:'scanner'});s=advance(s,.25);
 const scan=s.jobs.find(j=>j.automated&&j.type==='scan');assert.ok(scan);assert.equal(scan.endsAt-scan.startedAt,.25);assert.equal(s.campaign!.nextScan[scan.serviceId!]-scan.startedAt,2);
 s=advance(s,.25);assert.ok(s.findings.some(f=>serviceOf(f)===scan.serviceId&&f.known));s=doAction(s,{type:'model',model:'specialist'});s=doAction(s,{type:'model',model:'master'});s=advance(s,.25);
 const fix=s.jobs.find(j=>j.automated&&j.type==='repair');assert.ok(fix);assert.equal(fix.endsAt-fix.startedAt,.25);s=advance(s,.25);assert.ok(s.findings.find(f=>f.id===fix.findingId)!.repairedAt!==null);
 assert.throws(()=>advance(newGame(),.25),'Long Game retains half-second ticks');
});
