import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceV3, buyV3, newV3, pauseV3, startV3, V3} from '../src/v3Game.ts';
import {guidanceCandidates, selectGuidance} from '../src/v3Guidance.ts';

test('V3 guidance: first action escalates only before a purchase and can be dismissed', () => {
  let s = startV3(newV3()); assert.equal(selectGuidance(s, {})?.id, 'first');
  s = advanceV3(s, 5); assert.match(selectGuidance(s, {})!.text, /saving is allowed/);
  assert.equal(selectGuidance(s, {first: -Infinity, features: -Infinity}), null);
  s = buyV3(s, 'developer'); assert.match(selectGuidance(s, {})!.title, /Developer hired/);
  s = advanceV3(s, 5); assert.equal(selectGuidance(s, {features: -Infinity}), null);
});
test('V3 guidance: ordinary failure is observed, automatic and never interrupts construction', () => {
  let s = buyV3(startV3(newV3()), 'system');
  s = advanceV3(s, 2); s.systems[0].hazard = 1; s = advanceV3(s, .05);
  assert.equal(s.developers[0].phase, 'assembly');
  const h = guidanceCandidates(s).find(h => h.id === 'failure'); assert.match(h!.text, /finish their current job/);
  assert.equal(h!.system, 0); assert.equal(guidanceCandidates(startV3(newV3())).some(h => h.id === 'failure'), false);
});
test('V3 guidance: Recon is suggested only after maintenance and when affordable, once per run', () => {
  let s = startV3(newV3()); s.cash = V3.reconCost + 100;
  assert.equal(guidanceCandidates(s).some(h => h.id === 'recon'), false);
  s = advanceV3(s, 22); assert.equal(selectGuidance(s, {failure: -Infinity})?.id, 'recon');
  assert.equal(selectGuidance(s, {failure: -Infinity, recon: -Infinity, features: -Infinity}), null);
  s.cash = V3.reconCost - 1; assert.equal(guidanceCandidates(s).some(h => h.id === 'recon'), false);
  s.cash = V3.reconCost; s = buyV3(s, 'recon'); assert.equal(guidanceCandidates(s).some(h => h.id === 'recon'), false);
});
test('V3 guidance: paused spending is acknowledged without advancing time, tutorial advice stays quiet', () => {
  let s = pauseV3(startV3(newV3())); assert.deepEqual(guidanceCandidates(s), []);
  s = buyV3(s, 'system'); assert.match(selectGuidance(s, {})!.title, /−45 cr/); assert.equal(s.time, 0);
  s.cash = -1; assert.equal(selectGuidance(s, {features: -Infinity}), null);
});
test('V3 guidance: expires on active time and never survives victory or reset', () => {
  let s = buyV3(startV3(newV3()), 'system'); assert.ok(selectGuidance(s, {}));
  s = advanceV3(s, 12); assert.equal(selectGuidance(s, {hire: 4, features: -Infinity}), null);
  s.cash = 1200; s = advanceV3(s, .05); assert.equal(s.status, 'won'); assert.equal(selectGuidance(s, {features: -Infinity}), null);
  assert.equal(selectGuidance(newV3(), {}), null);
});

test('V3 guidance: one unfinished system prompts an affordable second hire before another build', () => {
  let s = advanceV3(startV3(newV3()), 6); s = buyV3(s, 'system');
  assert.equal(s.systems.length, 2); assert.equal(s.developers.length, 1);
  assert.ok(s.cash >= 55); assert.equal(s.developers[0].phase, 'assembly');
  assert.equal(selectGuidance(s, {})?.target, 'developer');
  assert.equal(selectGuidance(s, {})?.id, 'hire');
  assert.match(selectGuidance(s, {})!.text, /separate work/);
  assert.equal(guidanceCandidates(s).some(h => h.target === 'system'), false);
  assert.notEqual(selectGuidance(s, {hire: -Infinity})?.target, 'developer');
  assert.equal(guidanceCandidates(pauseV3(s)).some(h => h.id === 'hire'), false);
  s = buyV3(s, 'developer'); assert.equal(guidanceCandidates(s).some(h => h.id === 'hire'), false);
});
test('V3 guidance: hiring waits for affordability and yields to P1; no construction means no capacity prompt', () => {
  let s = buyV3(startV3(newV3()), 'system');
  assert.equal(s.cash, 45); assert.equal(guidanceCandidates(s).some(h => h.id === 'hire'), false);
  s = advanceV3(s, 4); assert.equal(selectGuidance(s, {})?.id, 'hire');
  s.jobs.push({id: s.nextJob++, type: 'repair', system: 0, owner: null, progress: 0, at: s.time, priority: 'p1'});
  assert.equal(selectGuidance(s, {})?.id, 'p1');
  s.jobs = []; assert.equal(guidanceCandidates(s).some(h => h.id === 'hire'), false);
});
