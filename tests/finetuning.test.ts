import {test} from 'node:test';
import assert from 'node:assert/strict';
import {act,advance,automationCost,autonomyStatus,scopeQuote} from '../src/game.ts';
import {activeServices} from '../src/campaign.ts';
import {timelineFixture} from './fixtures.ts';

test('efficiency discounts new scan setups, including overlapping groups, without refunds',()=>{
 let s=timelineFixture(1122);s.credits=100000;
 const costs=[210,210,199.5,168,105,31.5];
 for(let tier=0;tier<costs.length;tier++){
  assert.equal(automationCost(s),costs[tier]);
  const id=activeServices(s)[tier];const before=s.credits;
  const bought=act(s,{type:'automate',serviceId:id});assert.ok(bought.ok);s=bought.state;assert.equal(s.credits,before-costs[tier]);
  assert.equal(act(s,{type:'automate',serviceId:id}).state,s);
  if(tier<5){const upgraded=act(s,{type:'efficiency'});assert.ok(upgraded.ok);s=upgraded.state;}
 }
 const scope={level:'module' as const,id:s.organization.modules[2].id};const q=scopeQuote(s,scope,'automate');assert.equal(q.cost,q.actions.length*31.5);
 const poor=structuredClone(s);poor.credits=q.cost-.01;assert.equal(act(poor,{type:'scope',scope,operation:'automate'}).state,poor);
 const before=s.credits;s=act(s,{type:'scope',scope,operation:'automate'}).state;assert.equal(s.credits,before-q.cost);assert.equal(scopeQuote(s,scope,'automate').cost,0);
 const repair=act(s,{type:'auto-repair',serviceId:'backend'});assert.ok(repair.ok);assert.equal(s.credits-repair.state.credits,480);
});

test('autonomy counts joint coverage and records one reset reason per interrupted trial',()=>{
 let s=timelineFixture(1122);s.findings=[];s.nextBugAt=null;s.jobs=[];s.queue=[];s.credits=1000;
 const ids=activeServices(s);s.campaign!.automated=ids.slice(0,99);s.campaign!.remediation=ids.slice(1);
 assert.equal(autonomyStatus(s).covered,98);
 s.campaign!.automated=[...ids];s.campaign!.remediation=[...ids];s=advance(s,10);assert.ok(s.campaign!.autonomy.elapsed>0);
 s=act(s,{type:'scan'}).state;assert.equal(s.campaign!.autonomy.elapsed,0);assert.match(s.campaign!.autonomy.lastReset!.reason,/Manual work/);
 const reset=structuredClone(s.campaign!.autonomy.lastReset);s=advance(s,1);assert.deepEqual(s.campaign!.autonomy.lastReset,reset);
 s=advance(s,10);s.campaign!.remediation.pop();s=advance(s,.5);assert.match(s.campaign!.autonomy.lastReset!.reason,/Enable/);
 const latest=structuredClone(s.campaign!.autonomy.lastReset);s=advance(s,5);assert.deepEqual(s.campaign!.autonomy.lastReset,latest);
});
