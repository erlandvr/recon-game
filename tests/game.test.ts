import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, advance, health, income, newGame, scanStale, slots, UPGRADES } from '../src/game.ts';
import type { GameState, Action } from '../src/game.ts';

const running = newGame;
function action(s: GameState, a: Action) { const result = act(s, a); assert.equal(result.ok, true, result.message); return result.state; }
function firstRepair(): GameState {
  let s = advance(running(), 15);
  s = advance(action(s, { type: 'scan' }), 3);
  return advance(action(s, { type: 'repair', findingId: 1 }), 5);
}
test('first loop: income, symptoms, discovery, spending and fix completion', () => {
  let s = advance(running(), 15);
  assert.equal(s.credits, 70); assert.equal(health(s), 80); assert.equal(s.findings[0].known, false);
  const before = s;
  s = action(s, { type: 'scan' }); assert.equal(s.credits, 65); assert.equal(health(s), 80);
  assert.equal(before.jobs.length, 0, 'actions must not mutate caller state');
  s = advance(s, 2.5); assert.equal(s.findings[0].known, false);
  s = advance(s, 0.5); assert.equal(s.findings[0].known, true); assert.equal(s.credits, 70.7);
  s = action(s, { type: 'repair', findingId: 1 }); assert.equal(s.credits, 55.7);
  s = advance(s, 4.5); assert.equal(health(s), 80);
  s = advance(s, 0.5); assert.equal(health(s), 100); assert.equal(s.credits, 65.2); assert.equal(s.nextBugAt, 45);
  assert.equal(s.stats.repairs, 1);
});
test('scan captures start-time coverage and later development stays hidden', () => {
  let s = advance(running(), 14);
  s = advance(action(s, { type: 'scan' }), 3);
  assert.equal(s.findings[0].known, false); assert.equal(s.lastScanAt, 14); assert.equal(scanStale(s), true);
  s = advance(action(s, { type: 'scan' }), 3);
  assert.equal(s.findings[0].known, true); assert.equal(scanStale(s), false);
});
test('rescans preserve discovery and never resurrect fixed findings', () => {
  let s = firstRepair();
  s = advance(action(s, { type: 'scan' }), 3);
  assert.equal(s.findings.length, 1); assert.equal(s.findings[0].repairedAt, 23); assert.equal(s.stats.repairs, 1);
  s = advance(s, 30);
  s = advance(action(s, { type: 'scan' }), 3);
  s = advance(action(s, { type: 'scan' }), 3);
  assert.equal(s.findings.filter(f => f.known && f.repairedAt === null).length, 1);
});
test('unknown and duplicate fixes reject; full slots accept a distinct queued scan', () => {
  let s = advance(running(), 15);
  assert.equal(act(s, { type: 'repair', findingId: 1 }).ok, false);
  s = action(s, { type: 'scan' });
  assert.equal(act(s, { type: 'scan' }).state, s);
  s = advance(s, 3); s = action(s, { type: 'repair', findingId: 1 });
  assert.equal(act(s, { type: 'repair', findingId: 1 }).ok, false); assert.equal(act(s, { type: 'scan' }).ok, true);
});
test('growth respects already scheduled bug; forecasts appear fifteen seconds ahead', () => {
  let s = advance(firstRepair(), 37);
  assert.equal(s.time, 60); assert.equal(s.stage, 2); assert.equal(s.findings.length, 2); assert.equal(s.nextBugAt, 75);
  assert.ok(s.events.some(e => e.at === 45 && e.text.includes('forecast')));
  s = advance(s, 15); assert.equal(s.findings.length, 3); assert.equal(s.nextBugAt, 97.5);
  s = advance(s, 45); assert.equal(s.stage, 3); assert.equal(s.nextBugAt, 140);
  s = advance(s, 20); assert.equal(s.nextBugAt, 160);
});
test('investments change behavior; jobs in flight keep purchased duration', () => {
  for (const upgrade of Object.keys(UPGRADES) as (keyof typeof UPGRADES)[]) {
    let s = advance(running(), 300);
    s = action(s, { type: 'scan' }); const end = s.jobs[0].endsAt;
    const before = s.credits;
    s = action(s, { type: 'upgrade', upgrade });
    assert.equal(s.credits, before - UPGRADES[upgrade].cost); assert.equal(s.jobs[0].endsAt, end);
    if (upgrade !== 'capacity') assert.equal(act(s, { type: 'upgrade', upgrade }).ok, false);
    s = advance(s, 3);
    s = action(s, { type: 'repair', findingId: 1 });
    assert.equal(s.jobs[0].endsAt - s.time, upgrade === 'remediation' ? 2.5 : 5);
    if (upgrade === 'capacity') { assert.equal(slots(s), 2); s = action(s, { type: 'scan' }); assert.equal(s.jobs.length, 2); }
    else {
      s = advance(s, 5); s = action(s, { type: 'scan' });
      assert.equal(s.jobs[0].endsAt - s.time, upgrade === 'scanning' ? 1.5 : 3);
    }

  }
});
test('half-second and batched advances are deterministic and inputs immutable', () => {
  const start = firstRepair(); let single = start;
  for (let n = 0; n < 300; n++) single = advance(single, 0.5);
  assert.deepEqual(single, advance(start, 150)); assert.equal(start.time, 23);
  assert.throws(() => advance(start, 0.75));
});
