import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advance} from '../src/game.ts';
import {activeServices} from '../src/campaign.ts';
import {DEBUG_STARTS,debugGame} from '../src/debug.ts';
test('debug coaches earn actual healthy-time milestones with valid paid-action accounting',()=>{
 for(const checkpoint of DEBUG_STARTS){
  const s=debugGame(checkpoint.id,789);
  assert.ok(Math.abs(s.credits-(40+s.stats.earned-Object.values(s.stats.spent).reduce((a,b)=>a+b,0)))<.001);
  assert.equal(advance(s,.5).time,s.time+.5);assert.match(s.events.at(-1)!.text,/coached run/);
  assert.ok(s.healthyTime<=s.time);if(s.campaign)assert.ok(s.results!.healthyTime>=120);if(s.campaign?.result)assert.ok(s.campaign.result.healthyTime-s.campaign.healthyStartedAt>=360);
 }
});
test('debug supports all checkpoints and deterministic backwards jumps',()=>{
 assert.equal(debugGame('backend',1).time,0);assert.equal(debugGame('growing',1).stage,2);assert.equal(debugGame('full-pace',1).stage,3);
 assert.ok(debugGame('expansion',1).campaign);assert.equal(activeServices(debugGame('connected',1)).length,3);
 assert.equal(debugGame('release',1).campaign!.finalIds.length,3);assert.ok(debugGame('corporate',1).campaign!.result);
 const company=debugGame('company',1);assert.equal(activeServices(company).length,100);assert.ok(company.campaign!.handoverAt!=null);
 assert.deepEqual(debugGame('company',1),company);assert.deepEqual(debugGame('backend',company.organization.seed).organization,company.organization);
});
