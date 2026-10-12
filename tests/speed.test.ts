import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newGame,newSpeedGame,advance,act,continueSpeedPractice,automationCost,autoRepairCost,upgradeCost,efficiencyQuote,health,autonomyStatus,scopeQuote} from '../src/game.ts';
import {activeServices} from '../src/campaign.ts';
import {playSpeed} from '../scripts/speed-benchmark.ts';

test('speed mode starts with a real problem and exactly three four-repo modules; long rules stay unchanged',()=>{
 const s=newSpeedGame();assert.equal(s.organization.repositories.length,12);assert.deepEqual(s.organization.modules.map(m=>m.repositoryIds.length),[4,4,4]);assert.equal(s.findings.length,1);assert.equal(health(s),80);assert.equal(s.time,0);
 const long=newGame();assert.equal(long.speed,undefined);assert.equal(long.organization.repositories.length,100);assert.equal(automationCost(long),210);assert.equal(autoRepairCost(long),480);assert.equal(upgradeCost(long,'capacity'),150);assert.equal(long.findings.length,0);
 assert.equal(automationCost(s),80);assert.equal(autoRepairCost(s),140);assert.equal(upgradeCost(s,'capacity'),100);assert.equal(efficiencyQuote(s)?.cost,60);
});
test('five minutes is a target: unhealthy time continues, actions remain available and batching agrees',()=>{
 const s=advance(newSpeedGame(),900);assert.equal(s.time,900);assert.equal(s.speed!.result,null);assert.equal(health(s),20);assert.ok(s.credits>40);assert.ok(s.healthyTime<300);
 assert.equal(advance(s,10).time,910);assert.equal(act(s,{type:'scan'}).ok,true);
 let stepped=newSpeedGame();for(let n=0;n<1800;n++)stepped=advance(stepped,.5);assert.deepEqual(stepped,s);
});
test('a paid run can reach autonomy after five minutes without earning a time medal',()=>{
 const r=playSpeed({reaction:3,efficiency:1,capacity:3,startDelay:300});assert.ok(r.result?.won);assert.ok(r.result.at>300);assert.equal(r.medal,null);
});
test('the first real fix unlocks four repos, group work while automation waits until two minutes',()=>{
 let s=newSpeedGame();s=act(s,{type:'scan'}).state;s=advance(s,3);s=act(s,{type:'repair',findingId:1}).state;s=advance(s,5);
 assert.equal(s.speed!.phase,1);assert.equal(s.time,8);assert.equal(activeServices(s).length,1);s=advance(s,2.5);assert.equal(activeServices(s).length,2);s=advance(s,5);assert.equal(activeServices(s).length,4);assert.ok(s.campaign!.result);assert.equal(s.campaign!.automated.length,0);assert.equal(s.campaign!.remediation.length,0);
 const held=advance(newSpeedGame(),150);assert.equal(held.speed!.phase,0);assert.equal(held.campaign,undefined);
});
test('speed efficiency has two tiers; partial credit and overlapping group purchases keep accounting exact',()=>{
 let s=newSpeedGame();s=act(s,{type:'scan'}).state;s=advance(s,3);s=act(s,{type:'repair',findingId:1}).state;s=advance(s,117);s.credits=1000;
 s=act(s,{type:'efficiency'}).state;s=act(s,{type:'efficiency'}).state;assert.equal(s.efficiency,2);assert.equal(efficiencyQuote(s),null);assert.equal(act(s,{type:'efficiency'}).ok,false);assert.equal(automationCost(s),40);
 const before=s.credits;s=act(s,{type:'automate',serviceId:'backend'}).state;s=act(s,{type:'scope',scope:{level:'module',id:'module-1'},operation:'automate'}).state;assert.equal(before-s.credits,160);assert.equal(s.campaign!.automated.length,4);
 const failed=structuredClone(s);failed.credits=139;assert.equal(act(failed,{type:'auto-repair',serviceId:'backend'}).ok,false);assert.equal(failed.credits,139);
});
test('fresh paid strategies win within the sprint, with slower reactions and ordinary trial work',()=>{
 for(const reaction of [1,5]){const r=playSpeed({reaction,efficiency:1,capacity:3});assert.equal(r.result!.won,true);assert.ok(r.result!.at<=300);assert.equal(r.result!.covered,12);assert.equal(r.result!.modules,3);assert.deepEqual(r.phases.map(p=>p.phase),[0,1,2,3]);}
});
test('speed trial uses 12 repositories and 20 seconds, retains health/deadline/manual-work gates',()=>{
 let s=newSpeedGame();s=act(s,{type:'scan'}).state;s=advance(s,3);s=act(s,{type:'repair',findingId:1}).state;s=advance(s,5);
 s.speed!.phase=3;s.speed!.expansion=null;s.campaign!.repositoryCount=12;s.campaign!.automated=activeServices(s);s.campaign!.remediation=activeServices(s);s.credits=200;
 for(const f of s.findings)f.repairedAt=s.time;
 assert.equal(autonomyStatus(s).reason,null);
 s.jobs.push({id:999,type:'scan',serviceId:'backend',startedAt:s.time,endsAt:s.time+3,findingId:null,capturedIds:[],revision:0});assert.match(autonomyStatus(s).reason!,/manual/);s.jobs=[];
 s.credits=34;assert.match(autonomyStatus(s).reason!,/35/);s.credits=200;
 const finished=advance(s,50),win=finished.campaign!.autonomy.victory!;assert.ok(win);assert.ok(win.duration>=20&&win.duration<60);assert.ok(win.autoScans>0&&win.autoRepairs>0);assert.ok(win.netIncome>=0);
 assert.deepEqual(advance(finished,10),finished);assert.equal(act(finished,{type:'scan'}).ok,false);
 const resumed=continueSpeedPractice(finished);assert.equal(resumed.practice,true);const later=advance(resumed,20);assert.equal(later.time,finished.time+20);assert.deepEqual(later.speed!.result,finished.speed!.result);assert.equal(later.speed!.continuing,true);
});

test('scan and fix automation are blocked individually and in bundles until exactly two active minutes',()=>{
 let s=newSpeedGame();s=act(s,{type:'scan'}).state;s=advance(s,3);s=act(s,{type:'repair',findingId:1}).state;s=advance(s,116.5);s.credits=10000;
 for(const type of ['automate','auto-repair'] as const){assert.equal(act(s,{type,serviceId:'backend'}).ok,false);assert.equal(scopeQuote(s,{level:'module',id:'module-1'},type).reason,'Automation unlocks at 02:00.');assert.equal(act(s,{type:'scope',scope:{level:'module',id:'module-1'},operation:type}).ok,false);}
 assert.equal(s.time,119.5);s=advance(s,.5);
 for(const type of ['automate','auto-repair'] as const){const r=act(s,{type,serviceId:'backend'});assert.equal(r.ok,true);s=r.state;}
});
