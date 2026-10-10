import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, advance, newGame, health, income, knownFindings, scanReason, repairReason, slots, RULES } from '../src/game.ts';
import type { Action, GameState } from '../src/game.ts';
import { activeServices, serviceHealth, serviceOf, serviceFindings, kindOf } from '../src/campaign.ts';
import {timelineFixture} from './fixtures.ts';
const action = (s: GameState, a: Action) => {const result=act(s,a);assert.equal(result.ok,true,result.message);return result.state;};
function expanded(firstScanAt = 150) {
  let s=advance(newGame(),firstScanAt);
  s=advance(action(s,{type:'scan'}),3);s=advance(action(s,{type:'repair',findingId:1}),5);
  s=advance(s,179.5-s.time);s.healthyTime=RULES.resultAt;return advance(s,.5);
}
test('expansion preserves introduction and connects two real systems with aggregate income',()=>{
  let s=expanded();assert.equal(s.time,180);assert.deepEqual(activeServices(s),['backend']);
  const checkpoint=structuredClone(s.results);
  s=advance(s,30);assert.deepEqual(activeServices(s),['backend','frontend','auth']);
  assert.ok(income(s)>1);assert.deepEqual(s.results,checkpoint);
  assert.ok(s.events.some(e=>e.text.includes('Identity supports both')));
});
test('system scans have isolated start-time coverage and can run in parallel',()=>{
  let s=advance(expanded(),60);s=action(s,{type:'upgrade',upgrade:'capacity'});
  s=action(s,{type:'scan',serviceId:'auth'});s=action(s,{type:'scan',serviceId:'backend'});
  assert.equal(s.jobs.length,2);assert.equal(act(s,{type:'scan',serviceId:'auth'}).ok,false);
  const scanned=s.jobs.flatMap(j=>j.capturedIds);s=advance(s,3);
  assert.ok(s.findings.filter(f=>scanned.includes(f.id)).every(f=>f.known));
  assert.ok(serviceFindings(s,'frontend').every(f=>!f.known));
});
test('security warning escalates through shared Identity; repairing it restores dependent health',()=>{
  let s=advance(expanded(),60);const security=s.findings.find(f=>kindOf(f)==='security')!;
  const before=serviceHealth(s,'frontend');s=advance(s,45);
  assert.equal(s.findings.find(f=>f.id===security.id)!.escalated,true);assert.equal(s.campaign!.missed,1);
  assert.ok(serviceHealth(s,'frontend')<before);
  // Isolate dependency recovery from simultaneous routine bugs on Identity/Frontend.
  for(const f of serviceFindings(s,'auth'))if(f.id!==security.id)f.repairedAt=s.time;
  for(const f of serviceFindings(s,'frontend'))f.repairedAt=s.time;
  s.nextBugAt=null;
  s=advance(action(s,{type:'scan',serviceId:'auth'}),3);
  const beforeRepair=serviceHealth(s,'frontend');s=advance(action(s,{type:'repair',findingId:security.id}),5);
  assert.ok(serviceHealth(s,'frontend')>beforeRepair);
});
test('compliance is a timed obligation, costs health only when overdue, and remains recoverable',()=>{
  let s=advance(expanded(),120);const f=s.findings.find(f=>kindOf(f)==='compliance')!;
  assert.equal(f.escalated,false);assert.equal(f.deadline,s.time+60);
  s=advance(s,60);assert.equal(s.findings.find(v=>v.id===f.id)!.escalated,true);
  s=advance(action(s,{type:'scan',serviceId:'frontend'}),3);s=advance(action(s,{type:'repair',findingId:f.id}),5);
  assert.ok(s.findings.find(v=>v.id===f.id)!.repairedAt);
});
test('automation costs 210 per system, activates immediately and does not cover other systems',()=>{
  let s=advance(expanded(),60);const credits=s.credits;
  s=action(s,{type:'automate',serviceId:'auth'});assert.equal(Math.round(s.credits*100),Math.round(credits*100)-21000);assert.deepEqual(s.campaign!.automated,['auth']);
  assert.equal(act(s,{type:'automate',serviceId:'auth'}).state,s);
  s.credits=500;const spent=s.stats.spent.upgrades;s=action(s,{type:'automate',serviceId:'frontend'});
  assert.equal(s.credits,290);assert.equal(s.stats.spent.upgrades,spent+210);
  s=advance(s,0.5);assert.equal(s.jobs[0].serviceId,'auth');assert.equal(s.jobs[0].automated,true);
  s=advance(s,10);assert.ok(s.findings.find(f=>kindOf(f)==='security')!.known);
  assert.equal(s.findings.find(f=>kindOf(f)==='security')!.repairedAt,null);
  assert.ok(s.jobs.every(j=>j.serviceId!=='backend'));
  assert.equal(s.stats.repairs,1);
});
test('automation rejects locked, disconnected and unaffordable purchases without charging',()=>{
  let s=newGame();assert.equal(act(s,{type:'automate',serviceId:'backend'}).state,s);
  s=expanded();assert.equal(act(s,{type:'automate',serviceId:'auth'}).state,s);
  s=advance(s,30);s.credits=209;assert.equal(act(s,{type:'automate',serviceId:'backend'}).state,s);
});
test('automatic scans protect the reserve and resume when income recovers, leaving repairs manual',()=>{
  let s=advance(expanded(),60);s=action(s,{type:'automate',serviceId:'backend'});
  s.credits=24-income(s)/2;s=advance(s,0.5);assert.equal(s.jobs.length,0);
  s.credits=25-income(s)/2;s=advance(s,0.5);assert.equal(s.jobs[0].type,'scan');assert.equal(s.credits,20);
  s=advance(s,3);assert.equal(s.jobs.length,0);assert.ok(knownFindings(s).length>0);
  s.credits=100;s=advance(s,5);assert.equal(s.jobs.length,0);assert.equal(s.stats.repairs,1);
  const target=knownFindings(s)[0];s=action(s,{type:'repair',findingId:target.id});s=advance(s,5);
  assert.equal(s.findings.find(f=>f.id===target.id)!.repairedAt,s.time);assert.equal(s.stats.repairs,2);
});
test('full coached first session recovers a neglected introduction, beats the release without interruptions',()=>{
  let s=expanded(15);
  for(let step=0;step<1600&&!s.campaign!.result;step++){
    if(s.credits>=190&&!s.upgrades.capacity)s=action(s,{type:'upgrade',upgrade:'capacity'});
    if(s.credits>=150&&!s.upgrades.scanning)s=action(s,{type:'upgrade',upgrade:'scanning'});
    if(s.credits>=170&&!s.upgrades.remediation)s=action(s,{type:'upgrade',upgrade:'remediation'});
    for(const id of activeServices(s))if(s.credits>=260&&!s.campaign!.automated.includes(id))s=action(s,{type:'automate',serviceId:id});
    for(let n=0;n<slots(s);n++){
      const f=knownFindings(s).sort((a,b)=>(a.deadline??Infinity)-(b.deadline??Infinity)).find(f=>!repairReason(s,f.id));
      if(f){s=action(s,{type:'repair',findingId:f.id});continue;}
      const id=activeServices(s).find(id=>serviceFindings(s,id).some(f=>!f.known)&&!scanReason(s,id));
      if(id)s=action(s,{type:'scan',serviceId:id});
    }
    s=advance(s, 0.5);
  }
  assert.ok(s.time>540&&s.time<850);assert.equal(s.campaign!.result!.resolved,3);assert.ok(health(s)>=70);
  const result=structuredClone(s.campaign!.result);s=advance(s,15);
  assert.equal(s.time,result!.at+15);assert.deepEqual(s.campaign!.result,result);
});

test('automated scans reveal all finding types but never repair any of them',()=>{
 let s=timelineFixture(360);s.credits=2000;
 for(const id of activeServices(s))s=action(s,{type:'automate',serviceId:id});
 for(let i=0;i<4;i++)s=action(s,{type:'upgrade',upgrade:'capacity'});
 s=advance(s,60);
 const critical=s.findings.filter(f=>kindOf(f)!=='bug');assert.ok(critical.length>=3);
 assert.ok(critical.every(f=>f.known&&f.repairedAt===null));
 assert.equal(s.stats.repairs,0);assert.equal(s.stats.spent.repairs,0);assert.ok(s.findings.every(f=>f.repairedAt===null));assert.ok(s.jobs.every(j=>j.type==='scan'));
});
