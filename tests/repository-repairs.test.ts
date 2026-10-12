import {test} from 'node:test';
import assert from 'node:assert/strict';
import {act,advance,newGame,repositoryRepairQuote,orderedRepairFindings,knownFindings} from '../src/game.ts';
const revealed=()=>advance(act(advance(newGame(),75),{type:'scan'}).state,3);

test('one repository fix pays once, starts available work and queues the remaining known findings',()=>{
 const s=revealed(),quote=repositoryRepairQuote(s,'backend');assert.equal(quote.findings.length,3);assert.equal(quote.cost,45);
 const r=act(s,{type:'repair-repository',serviceId:'backend'});assert.ok(r.ok);assert.equal(r.state.credits,Math.round((s.credits-45)*100)/100);assert.equal(r.state.jobs.length,1);assert.equal(r.state.queue.length,2);assert.equal(r.state.stats.spent.repairs,45);
 const done=advance(r.state,15);assert.equal(done.stats.repairs,3);assert.equal(done.stats.spent.repairs,45);
});
test('limited credits fix the affordable deadline-first subset and leave the rest available',()=>{
 const s=revealed();s.credits=30;
 s.findings[0].deadline=s.time+60;s.findings[2].deadline=s.time+10;
 const before=structuredClone(s),q=repositoryRepairQuote(s,'backend');
 assert.deepEqual(q.findings.map(f=>f.id),[3,1]);assert.equal(q.cost,30);assert.equal(q.remaining,1);assert.equal(q.total,3);assert.deepEqual(s,before);
 const r=act(s,{type:'repair-repository',serviceId:'backend'});assert.ok(r.ok);assert.equal(r.state.credits,0);
 assert.deepEqual([...r.state.jobs,...r.state.queue].map(j=>j.findingId),[3,1]);assert.equal(r.state.stats.spent.repairs,30);
 r.state.credits=15;assert.deepEqual(repositoryRepairQuote(r.state,'backend').findings.map(f=>f.id),[2]);
});
test('less than one fix leaves credits and findings untouched',()=>{
 const s=revealed();s.credits=14.99;const r=act(s,{type:'repair-repository',serviceId:'backend'});
 assert.equal(r.ok,false);assert.equal(r.state,s);assert.match(r.message,/15 credits/);
 s.credits=15;const q=repositoryRepairQuote(s,'backend');assert.equal(q.cost,15);assert.equal(q.findings.length,1);assert.equal(q.remaining,2);
});
test('repository quote excludes hidden, completed, running, queued and other-repository findings',()=>{
 let s=revealed();s=act(s,{type:'repair',findingId:1}).state;s=act(s,{type:'repair',findingId:2}).state;
 s.findings.push({...s.findings[2],id:90,known:false},{...s.findings[2],id:91,repairedAt:s.time},{...s.findings[2],id:92,serviceId:'auth'});
 const quote=repositoryRepairQuote(s,'backend');assert.deepEqual(quote.findings.map(f=>f.id),[3]);assert.equal(quote.cost,15);
 s=act(s,{type:'repair-repository',serviceId:'backend'}).state;assert.equal(repositoryRepairQuote(s,'backend').findings.length,0);assert.equal(act(s,{type:'repair-repository',serviceId:'backend'}).state,s);
 assert.equal(act(s,{type:'repair-repository',serviceId:'auth'}).ok,false);
});
test('individual submissions move to the bottom in submission order, including queued to active transitions',()=>{
 let s=revealed();s=act(s,{type:'repair',findingId:2}).state;s=act(s,{type:'repair',findingId:1}).state;
 assert.deepEqual(orderedRepairFindings(s,knownFindings(s)).map(f=>f.id),[3,2,1]);
 s=advance(s,5);assert.deepEqual(orderedRepairFindings(s,knownFindings(s)).map(f=>f.id),[3,1]);
});
test('repository fixes accept the exact total and leave queued jobs paid',()=>{
 const s=revealed();s.credits=45;const r=act(s,{type:'repair-repository',serviceId:'backend'});assert.ok(r.ok);assert.equal(r.state.credits,0);assert.equal(r.state.queue.length,2);
});
