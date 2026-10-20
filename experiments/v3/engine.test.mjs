import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState, buy, advance, failSystem, dispatch, counts, summary, interval} from './engine.mjs';
import {run} from './benchmark.mjs';

test('purchases are paid, unavailable purchases do not mutate, cap includes queued builds', () => {
  const s = createState({cap:2,startingCredits:45});
  assert.equal(buy(s,'plus'),false);
  assert.equal(buy(s,'system'),true); assert.equal(s.credits,0);
  const before=structuredClone(s);
  assert.equal(buy(s,'system'),false); assert.deepEqual(s,before);
  assert.equal(buy(s,'hire'),false);
  advance(s,8); assert.equal(counts(s).built,2);
  assert.equal(s.developers.length,1);
});
test('no free developer means purchased construction waits', () => {
  const s=createState({startingCredits:1000,firstGrace:999});
  buy(s,'system'); buy(s,'system');
  advance(s,4);
  assert.ok(s.systems[1].build>0); assert.equal(s.systems[2].build,0);
  advance(s,12); assert.equal(counts(s).built,3);
});
test('Recon takes a walking job immediately and developer walks the travelled distance back', () => {
  const s=createState({startingCredits:1000});
  failSystem(s,0);dispatch(s);advance(s,1);
  assert.equal(s.developers[0].mode,'walk');
  buy(s,'recon');
  assert.equal(s.systems[0].issue.owner,'recon');
  assert.equal(s.developers[0].mode,'return');
  assert.ok(Math.abs(s.developers[0].remaining-1)<1e-8);
  assert.equal(s.handoffs.walk,1);
  advance(s,1); assert.equal(s.developers[0].mode,'idle');
});
test('mid-fix takeover immediately releases developer and preserves completed work', () => {
  const s=createState({startingCredits:1000});
  failSystem(s,0);dispatch(s);advance(s,3);
  assert.equal(s.developers[0].mode,'fix');
  const progress=s.systems[0].issue.progress;
  assert.ok(progress>0);
  buy(s,'recon');
  assert.equal(s.developers[0].mode,'return');
  assert.equal(s.systems[0].issue.progress,progress);
  assert.equal(s.handoffs.fix,1);
  advance(s,1.3); assert.equal(s.systems[0].issue,null);
});
test('Recon Plus is three total slots, ownership stays exclusive', () => {
  const s=createState({startingCredits:1000,developerMaintenance:false,firstGrace:999});
  for(let i=0;i<4;i++)buy(s,'system');
  advance(s,32);
  for(let i=0;i<5;i++)failSystem(s,i);
  buy(s,'recon'); assert.equal(counts(s).reconBusy,1);
  buy(s,'plus'); assert.equal(counts(s).reconBusy,3);
  for(let i=0;i<60;i++){advance(s,.1);assert.ok(counts(s).reconBusy<=3);}
  assert.equal(s.events.filter(e=>e.kind==='repaired').length,5);
});
test('wages continue during all work and after Recon purchase; money ledger balances', () => {
  const s=createState({startingCredits:1000,firstGrace:999});
  buy(s,'hire');buy(s,'system');buy(s,'recon');advance(s,10);
  assert.ok(Math.abs(s.wages-2*.35*10)<1e-8);
  assert.ok(Math.abs(s.credits-(1000+s.earned-s.wages-s.upkeep-s.purchases))<1e-7);
});
test('age increases maintenance to a bounded rate and repair does not rejuvenate a system', () => {
  const s=createState({firstGrace:999});
  assert.equal(interval(s,s.systems[0]),28);
  advance(s,90);assert.equal(interval(s,s.systems[0]),15);
  advance(s,100);assert.equal(interval(s,s.systems[0]),15);
  failSystem(s,0);dispatch(s);advance(s,10);
  assert.equal(s.systems[0].builtAt,0);assert.equal(interval(s,s.systems[0]),15);
});
test('seeded policy runs reproduce all actions and outcomes; finish needs a full window', () => {
  const a=run({policy:'balanced',seed:19}),b=run({policy:'balanced',seed:19});
  assert.deepEqual(a.row,b.row);assert.deepEqual(a.state.actions,b.state.actions);
  assert.ok(a.row.finish!==null);
  const lastBuild=a.state.events.filter(e=>e.kind==='built').at(-1).at;
  assert.ok(a.row.finish-lastBuild>=a.state.config.stableSeconds-.11);
  const before=summary(a.state);advance(a.state,30);assert.deepEqual(summary(a.state),before);
});
test('all policy runs maintain job ownership and preserve the economy', () => {
  for(const policy of ['balanced','hire','expand','recon','overhire']){
    const {state:s}=run({policy,seed:42,reaction:3});
    assert.ok(Math.abs(s.credits-(s.config.startingCredits+s.earned-s.wages-s.upkeep-s.purchases))<1e-6);
    for(const d of s.developers)if(d.mode==='walk'||d.mode==='fix')assert.equal(s.systems[d.target].issue.owner,d.id);
    assert.ok(counts(s).reconBusy<=3);
  }
});
