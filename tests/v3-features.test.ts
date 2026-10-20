import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceV3, buyV3, earnings, newV3, pauseV3, startV3, systemIncome, V3, workerPosition, type Phase, type V3State} from '../src/v3Game.ts';
import {backlogPosition, benchPosition} from '../src/v3World.ts';
function until(s: V3State, fn: (s: V3State) => boolean, seconds = 180) {
  for (let t = 0; !fn(s) && t < seconds; t += .05) s = advanceV3(s,.05);
  assert.ok(fn(s),`timed out: ${s.time}, ${s.developers[0].phase}`); return s;
}
function fixture() {const s = startV3(newV3()); s.cash = 0; s.systems[0].threshold = 9999; return s;}
function fail(s: V3State, urgent = false) {
  s.systems[0].broken = true;
  s.jobs.push({id:s.nextJob++,type:'repair',system:0,owner:null,progress:0,at:s.time,priority:urgent?'p1':undefined});
  return startV3(pauseV3(s));
}
test('Desk features: collect at the shared backlog, build at the desk and earn only on completion',()=>{
  let s=until(fixture(),s=>s.developers[0].phase==='pickup');
  assert.deepEqual(workerPosition(s.developers[0]),backlogPosition(0));
  s=until(s,s=>s.developers[0].phase==='assembly');
  assert.deepEqual(workerPosition(s.developers[0]),benchPosition(0)); assert.equal(s.metrics.featuresTaken,1);
  assert.equal(s.developers[0].system,null); assert.equal(s.jobs[0].system,-1);
  s=advanceV3(s,V3.featureAssembly-.05); assert.equal(earnings(s).gross,3);
  s=advanceV3(s,.05); assert.equal(earnings(s).gross,3.25); assert.equal(s.developers[0].phase,'idle');
  assert.deepEqual(workerPosition(s.developers[0]),benchPosition(0)); assert.equal(s.jobs.length,0);
  assert.equal(s.metrics.features,1); assert.equal(s.systems[0].featureBy,0); assert.equal(s.purchases.length,0);
});
for(const phase of ['backlog','pickup','fetch','assembly'] as Phase[]) for(const action of ['build','repair','p1']) {
  test(`Desk features: ${action} immediately pauses ${phase} without lost progress or teleporting`,()=>{
    let s=until(fixture(),s=>s.developers[0].phase===phase);s=advanceV3(s,.05);
    const from=workerPosition(s.developers[0]), elapsed=s.developers[0].elapsed, taken=s.metrics.featuresTaken;
    if(action==='build'){s.cash=100;s=buyV3(s,'system');s.systems[1].threshold=9999;}else s=fail(s,action==='p1');
    assert.deepEqual(workerPosition(s.developers[0]),from);
    assert.equal(s.developers[0].feature,false);assert.equal(s.developers[0].parkedFeature!.phase,phase);
    assert.equal(s.developers[0].parkedFeature!.elapsed,elapsed);assert.equal(s.metrics.features,0);
    const frozen=pauseV3(s);assert.equal(advanceV3(frozen,30),frozen);
    s=until(s,s=>!s.developers[0].parkedFeature);
    assert.equal(s.developers[0].phase,phase);assert.equal(s.developers[0].elapsed,elapsed);
    assert.deepEqual(workerPosition(s.developers[0]),from);assert.equal(s.metrics.featuresTaken,taken);
    s=until(s,s=>s.metrics.features===1);assert.equal(s.metrics.featuresTaken,1);
  });
}
test('Desk features: queued builds and repairs all finish before saved features resume; P1 can interrupt the build',()=>{
  let s=until(fixture(),s=>s.developers[0].phase==='assembly');s=advanceV3(s,.5);s.cash=200;
  s=buyV3(s,'system');s=buyV3(s,'system');s.systems.forEach(n=>n.threshold=9999);
  const feature=structuredClone(s.developers[0].parkedFeature);
  s=advanceV3(s,1);s=fail(s,true);
  assert.equal(s.developers[0].suspended!.feature,false);assert.equal(s.developers[0].suspended!.phase,'assembly');
  s=until(s,s=>s.metrics.repairs===1);s.systems[0].threshold=9999;
  s=until(s,s=>s.systems.every(n=>n.installed));
  assert.equal(s.metrics.features,0);assert.deepEqual(s.developers[0].parkedFeature,feature);
  s=until(s,s=>s.metrics.features===1);assert.equal(s.metrics.repairs,1);
});
test('Desk features: new work also interrupts the walk back to a saved feature',()=>{
  let s=until(fixture(),s=>s.developers[0].phase==='fetch');s=fail(s);
  s=until(s,s=>s.developers[0].phase==='resume-feature');s=advanceV3(s,.1);
  const from=workerPosition(s.developers[0]), saved=structuredClone(s.developers[0].parkedFeature);
  s.cash=100;s=buyV3(s,'system');s.systems[1].threshold=9999;
  assert.deepEqual(workerPosition(s.developers[0]),from);assert.deepEqual(s.developers[0].parkedFeature,saved);
  s=until(s,s=>s.metrics.features===1);assert.ok(s.systems[1].installed);
});
test('Desk features: an idle developer takes ordinary work before another developer pauses a feature',()=>{
  let s=until(fixture(),s=>s.developers[0].phase==='assembly');s.cash=200;s=buyV3(s,'developer');
  const featureId=s.developers[0].job;s=buyV3(s,'system');
  assert.equal(s.developers[0].job,featureId);assert.equal(s.developers[0].parkedFeature,undefined);
  assert.equal(s.developers[1].system,1);
});
test('Desk features: random targets are installed, vary by seed and do not consume failure randomness',()=>{
  function run(seed:number) {
    let s=fixture();s.seed=seed;s.cash=-10000;
    s.systems.push({...s.systems[0],id:1},{...s.systems[0],id:2},{...s.systems[0],id:3,installed:false});
    const rng=s.rng;s=advanceV3(s,400);assert.equal(s.rng,rng);assert.equal(s.systems[3].features,undefined);
    assert.ok(s.systems.slice(0,3).every(n=>(n.features??0)>0));return s;
  }
  const a=run(31),b=run(93);assert.notDeepEqual(a.systems.map(n=>n.features),b.systems.map(n=>n.features));
  let batched=fixture();batched.seed=31;batched.cash=-10000;batched.systems.push({...batched.systems[0],id:1},{...batched.systems[0],id:2},{...batched.systems[0],id:3,installed:false});
  for(let i=0;i<1600;i++)batched=advanceV3(batched,.25);assert.deepEqual(a,batched);
});
test('Desk features: broken installed targets keep bonuses without income; Recon owns repairs only',()=>{
  let s=fixture();s.systems[0].broken=true;s=until(s,s=>s.metrics.features===1);
  assert.equal(s.systems[0].features,1);assert.equal(systemIncome(s.systems[0]),0);
  s=fail(s);s.cash=V3.reconCost;s=buyV3(s,'recon');
  assert.ok(s.jobs.filter(j=>j.owner==='recon').every(j=>j.type==='repair'));
  s=until(s,s=>!s.systems[0].broken);assert.ok(systemIncome(s.systems[0])>=3.25);
});
test('Desk features: no installed target means no new feature; victory freezes parked work and reset clears it',()=>{
  let empty=fixture();empty.systems[0].installed=false;empty=advanceV3(empty,10);assert.equal(empty.jobs.length,0);
  let s=until(fixture(),s=>s.developers[0].phase==='assembly');s.cash=100;s=buyV3(s,'system');
  s.cash=1200;s=advanceV3(s,.05);assert.equal(s.status,'won');assert.equal(advanceV3(s,30),s);
  assert.ok(s.developers[0].parkedFeature);const fresh=newV3();assert.equal(fresh.developers[0].parkedFeature,undefined);assert.equal(fresh.metrics.features,0);
});
