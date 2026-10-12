import {test} from 'node:test';
import assert from 'node:assert/strict';
import {act,advance,newGame,slots} from '../src/game.ts';
import type {GameState,Action} from '../src/game.ts';
import {timelineFixture} from './fixtures.ts';
const action=(s:GameState,a:Action)=>{const r=act(s,a);assert.equal(r.ok,true,r.message);return r.state;};
const funded=()=>timelineFixture(1500);
const scanned=()=>advance(action(funded(),{type:'scan'}),3);
const known=(s:GameState)=>s.findings.filter(f=>f.known&&f.repairedAt===null);
function ledger(s:GameState){
 assert.equal(Math.round(s.credits*100),Math.round((40+s.stats.earned-Object.values(s.stats.spent).reduce((a,b)=>a+b,0))*100));
 for(const type of ['scan','repair'] as const){const key=type==='scan'?'scans':'repairs';assert.equal(s.stats.spent[key],(s.stats[key]+[...s.jobs,...s.queue].filter(j=>j.type===type).length)*(type==='scan'?5:15));}
}
test('four paid capacity purchases reach five; limit and budget reject without spending',()=>{
 let s=funded();const credits=s.credits;
 for(let n=2;n<=5;n++){s=action(s,{type:'upgrade',upgrade:'capacity'});assert.equal(slots(s),n);assert.equal(Math.round(s.credits*100),Math.round(credits*100)-15000*(n-1));ledger(s);}
 assert.equal(act(s,{type:'upgrade',upgrade:'capacity'}).state,s);
 assert.equal(act(newGame(),{type:'upgrade',upgrade:'capacity'}).ok,false);
});
test('five fixes run; sixth and seventh queue FIFO, prepaid once, then start on completion',()=>{
 let s=scanned();for(let n=0;n<4;n++)s=action(s,{type:'upgrade',upgrade:'capacity'});
 const ids=known(s).slice(0,7).map(f=>f.id);assert.equal(ids.length,7);const credits=s.credits;
 for(const id of ids)s=action(s,{type:'repair',findingId:id});
 assert.equal(s.jobs.length,5);assert.deepEqual(s.queue.map(j=>j.findingId),ids.slice(5));assert.equal(s.credits,credits-105);ledger(s);
 assert.equal(act(s,{type:'repair',findingId:ids[5]}).state,s);
 s=advance(s,5);assert.equal(s.queue.length,0);assert.deepEqual(s.jobs.map(j=>j.findingId),ids.slice(5));assert.equal(s.stats.repairs,5);ledger(s);
 s=advance(s,5);assert.equal(s.stats.repairs,7);assert.equal(s.jobs.length,0);ledger(s);
});
test('queue also works with one slot; buying capacity immediately starts its first order',()=>{
 let s=scanned();const ids=known(s).slice(0,3).map(f=>f.id);
 for(const id of ids)s=action(s,{type:'repair',findingId:id});
 assert.equal(s.queue.length,2);const time=s.time;
 s=action(s,{type:'upgrade',upgrade:'capacity'});assert.equal(s.jobs.length,2);assert.equal(s.jobs[1].startedAt,time);assert.equal(s.queue.length,1);ledger(s);
});
test('queued scan captures findings and upgraded duration when it actually starts',()=>{
 let s=advance(action(advance(newGame(),15),{type:'scan'}),3);
 s=advance(s,24.5); // 42.5: next bug at 45; repair frees the slot at 47.5.
 s.credits+=100;s.stats.earned+=100; // funded fixture for a speed upgrade
 s=action(s,{type:'repair',findingId:1});s=action(s,{type:'scan'});
 assert.equal(s.queue.length,1);assert.equal(act(s,{type:'scan'}).state,s);
 s=action(s,{type:'upgrade',upgrade:'scanning'});s=advance(s,5);
 assert.equal(s.jobs[0].startedAt,47.5);assert.equal(s.jobs[0].endsAt,49);assert.ok(s.jobs[0].capturedIds.includes(2));
 s=advance(s,1.5);assert.equal(s.findings[1].known,true);ledger(s);
});
test('manual queue starts before automatic scans and scan-only work respects shared capacity',()=>{
 let s=scanned();s.credits+=1000;s.stats.earned+=1000;
 for(let n=0;n<4;n++)s=action(s,{type:'upgrade',upgrade:'capacity'});
 const ids=known(s).slice(0,6).map(f=>f.id);
 for(const findingId of ids)s=action(s,{type:'repair',findingId});
 for(const serviceId of ['backend','frontend','auth'] as const)s=action(s,{type:'automate',serviceId});
 s=advance(s,.5);assert.equal(s.jobs.length,5);assert.equal(s.queue.length,1);assert.equal(s.campaign!.autoScans,0);
 s=advance(s,4.5);assert.equal(s.jobs[0].findingId,ids[5]);assert.ok(!s.jobs[0].automated);assert.equal(s.queue.length,0);
 const automatic=s.jobs.filter(j=>j.automated);assert.ok(automatic.length>=2);assert.ok(automatic.every(j=>j.type==='scan'));
 assert.equal(new Set(automatic.map(j=>j.serviceId)).size,automatic.length);assert.ok(s.jobs.length<=5);ledger(s);
});
test('insufficient funds and unrevealed fixes cannot enter the queue',()=>{
 let s=advance(newGame(),15);assert.equal(act(s,{type:'repair',findingId:1}).state,s);
 s=advance(action(s,{type:'scan'}),3);s=action(s,{type:'repair',findingId:1});s.credits=4;
 assert.equal(act(s,{type:'scan'}).state,s);assert.equal(s.queue.length,0);
});
test('unhealthy level progress holds while world time, development and earnings continue',()=>{
 const s=advance(newGame(),600);assert.equal(s.time,600);assert.equal(s.stage,3);assert.equal(s.healthyTime,45);assert.equal(s.campaign,undefined);assert.ok(s.findings.length>10);assert.ok(s.credits>600);
 let single=newGame();for(let n=0;n<6;n++)single=advance(single,100);assert.deepEqual(single,s);
});
