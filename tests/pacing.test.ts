import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, advance, income, newGame, scanDuration, repairDuration } from '../src/game.ts';

test('normal clock and jobs retain their pace while unhealthy level progress holds', () => {
  let s = advance(newGame(), 14);
  assert.equal(s.time, 14); assert.equal(s.credits, 68); assert.equal(s.findings.length, 0);
  s = advance(s); assert.equal(s.time, 15); assert.equal(s.credits, 70); assert.equal(s.findings.length, 1);
  s = advance(act(s, {type:'scan'}).state, 3); assert.equal(s.findings[0].known, true); assert.equal(s.credits, 70.7);
  s = advance(act(s, {type:'repair',findingId:1}).state, 5); assert.equal(s.time, 23); assert.equal(s.credits, 65.2);
  s = advance(s, 156); assert.equal(s.campaign, undefined);
  s = advance(s); assert.equal(s.time,180);assert.equal(s.campaign,undefined);assert.ok(s.healthyTime<180);
  s=advance(s,360);assert.equal(s.time,540);assert.equal(s.campaign,undefined);
});
test('half-second upgrades complete exactly and displayed income matches one elapsed second', () => {
  let s = advance(newGame(), 240); s.credits=1000;
  s = act(s, {type:'upgrade',upgrade:'scanning'}).state;
  s = act(s, {type:'upgrade',upgrade:'remediation'}).state;
  assert.equal(scanDuration(s),1.5);assert.equal(repairDuration(s),2.5);
  s=act(s,{type:'scan'}).state; const before=s.credits, rate=income(s);
  s=advance(s,1);assert.equal(s.stats.scans,0);assert.equal(Math.round((s.credits-before)*100),Math.round(rate*100));
  s=advance(s,.5);assert.equal(s.stats.scans,1);
  const f=s.findings.find(f=>f.known)!;s=act(s,{type:'repair',findingId:f.id}).state;
  s=advance(s,2);assert.equal(s.findings.find(v=>v.id===f.id)!.repairedAt,null);
  s=advance(s,.5);assert.equal(s.findings.find(v=>v.id===f.id)!.repairedAt,s.time);
});
