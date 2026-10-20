import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceV3,buyV3,newV3,pauseV3,startV3,V3,workerPosition,type V3State} from '../src/v3Game.ts';
import {benchPosition,workPosition,pathLength,routeBetween,WORLD} from '../src/v3World.ts';
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function until(s:V3State,fn:(s:V3State)=>boolean){for(let i=0;!fn(s)&&i<4000;i++)s=advanceV3(s,.05);assert.ok(fn(s));return s;}
function building(){let s=buyV3(startV3(newV3()),'system');s.systems.forEach(n=>n.threshold=9999);return until(s,s=>s.developers[0].phase==='install');}
function queueRepair(s:V3State,id=0){s.systems[id].broken=true;s.jobs.push({id:s.nextJob++,type:'repair',system:id,owner:null,progress:0,at:s.time});return s;}
test('Direct repair: installation hands off from the installed system, with real shorter travel and no early repair',()=>{
  let s=queueRepair(building());s=advanceV3(s,V3.install);
  const w=s.developers[0],from=workPosition(1),to=workPosition(0);
  assert.equal(w.phase,'outward');assert.equal(w.system,0);assert.deepEqual(workerPosition(w),from);
  assert.ok(s.systems[1].installed);assert.equal(s.jobs[0].progress,0);
  close(w.duration,pathLength(routeBetween(0,from,to))/WORLD.walkSpeed);
  assert.ok(!w.route.some(p=>p.x===benchPosition(0).x&&p.y===benchPosition(0).y));
  const viaDesk=pathLength(routeBetween(0,from,benchPosition(0)))+pathLength(routeBetween(0,benchPosition(0),to));
  assert.ok(pathLength(w.route)<viaDesk);
  s=until(s,s=>s.developers[0].phase==='repair');assert.deepEqual(workerPosition(s.developers[0]),to);assert.equal(s.jobs[0].progress,0);
  s=advanceV3(s,6);assert.equal(s.systems[0].broken,false);
});
test('Direct repair: ordinary failure can redirect a walk home; pause holds position and wages',()=>{
  let s=advanceV3(building(),V3.install+.5);const from=workerPosition(s.developers[0]);
  s=queueRepair(pauseV3(s));const frozen=structuredClone(s);assert.equal(advanceV3(s,10),s);assert.deepEqual(s,frozen);
  s=startV3(s);assert.equal(s.developers[0].phase,'outward');assert.deepEqual(workerPosition(s.developers[0]),from);
});
test('Direct repair: completed repair chains to another without a desk visit',()=>{
  let s=queueRepair(building());s=advanceV3(s,1);s=until(s,s=>s.developers[0].phase==='repair');
  s=queueRepair(s,1);s=advanceV3(s,6);assert.equal(s.developers[0].phase,'outward');assert.equal(s.developers[0].system,1);assert.deepEqual(workerPosition(s.developers[0]),workPosition(0));
});
test('Direct repair: older construction still goes to the desk before a newer repair; Recon keeps exclusive ownership',()=>{
  let s=building();s.cash=100;s=buyV3(s,'system');s=queueRepair(s);s=advanceV3(s,1);
  assert.equal(s.developers[0].phase,'return');assert.equal(s.jobs.find(j=>j.type==='repair')!.owner,null);
  s=until(s,s=>s.developers[0].phase==='assembly');assert.equal(s.developers[0].system,2);assert.deepEqual(workerPosition(s.developers[0]),benchPosition(0));
  let r=queueRepair(building());r.cash=V3.reconCost;r=buyV3(r,'recon');r=advanceV3(r,1);
  assert.equal(r.developers[0].phase,'return');assert.equal(r.jobs[0].owner,'recon');
});
test('Direct repair: Recon takeover of a system-to-system walk returns from the actual point',()=>{
  let s=queueRepair(building());s=advanceV3(s,1.5);const from=workerPosition(s.developers[0]);
  s.cash=V3.reconCost;s=buyV3(s,'recon');assert.deepEqual(workerPosition(s.developers[0]),from);assert.equal(s.developers[0].phase,'return');
  close(s.developers[0].duration,pathLength(routeBetween(0,from,benchPosition(0)))/WORLD.walkSpeed);
});
