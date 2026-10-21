import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceV3, buyV3, newV3, pauseV3, startV3} from '../src/v3Game.ts';
import {coffeeVisit} from '../src/v3Coffee.ts';

function reconRun() {
  let s = startV3(newV3());
  s = buyV3(s, 'developer');
  while (s.cash < 235) s = advanceV3(s, 1);
  return buyV3(s, 'recon');
}

test('initial coffee serves the team present at Recon and Plus does not repeat it', () => {
  assert.equal(coffeeVisit(newV3()), null);
  const s = reconRun(), before = structuredClone(s), at = s.time;
  assert.deepEqual(coffeeVisit(s)?.desks, [1, 0]);
  const laterHire = buyV3(s, 'developer');
  assert.equal(laterHire.developers.length, 3);
  assert.deepEqual(coffeeVisit(laterHire)?.desks, [1, 0, 2]);
  assert.deepEqual(coffeeVisit(laterHire)?.waiter, coffeeVisit(s)?.waiter, 'same-time hire queues without changing the active round');
  assert.deepEqual(s, before, 'presentation reads do not mutate the game');
  const served = new Set<number>();
  for (let t = 0; t < 25; t += .05) {
    const visit = coffeeVisit({...s, time: at + t})!;
    for (const desk of served) assert.ok(visit.delivered.includes(desk));
    visit.delivered.forEach(id => served.add(id));
    if (visit.waiter) assert.equal(visit.waiter.remaining, 2 - visit.delivered.length);
  }
  assert.deepEqual([...served], [1, 0]);
  const finished = advanceV3(s, 25);
  assert.equal(coffeeVisit(finished)?.waiter, null);
  assert.deepEqual(coffeeVisit(finished)?.delivered, [1, 0]);
  let upgrade = finished;
  while (upgrade.cash < 260) upgrade = advanceV3(upgrade, 1);
  upgrade = buyV3(upgrade, 'plus');
  assert.equal(upgrade.recon, 3);
  assert.equal(coffeeVisit(upgrade)?.waiter, null, 'Plus does not replay the coffee visit');
});

test('coffee holds with the game, settles at victory and resets with a new run', () => {
  const s = advanceV3(reconRun(), 3);
  const held = pauseV3(s);
  assert.deepEqual(coffeeVisit(advanceV3(held, 10)), coffeeVisit(held));
  const won = {...s, status: 'won' as const};
  assert.deepEqual(coffeeVisit(won)?.delivered, [1, 0]);
  assert.equal(coffeeVisit(won)?.waiter, null);
  assert.equal(coffeeVisit(newV3()), null);
});


test('later hires get individual queued coffee visits without losing existing cups', () => {
  const s = reconRun(), at = s.time;
  const hired = buyV3(s, 'developer');
  assert.equal(hired.developers.length, 3);
  const completed = coffeeVisit(advanceV3(hired, 30))!;
  assert.deepEqual(completed.delivered, [1, 0, 2]);
  assert.equal(completed.waiter, null);
  const seen = new Set<number>();
  for (let t = 0; t < 30; t += .05) {
    const visit = coffeeVisit({...hired, time: at + t})!;
    assert.equal(new Set(visit.delivered).size, visit.delivered.length);
    for (const desk of seen) assert.ok(visit.delivered.includes(desk));
    visit.delivered.forEach(id => seen.add(id));
    if (visit.waiter?.serving?.desk === 2) assert.deepEqual(visit.delivered, [1, 0]);
  }
  let fourth = advanceV3(hired, 30);
  while (fourth.cash < 55) fourth = advanceV3(fourth, 1);
  fourth = buyV3(fourth, 'developer');
  assert.equal(fourth.developers.length, 4);
  assert.deepEqual(coffeeVisit(fourth)?.delivered, [1, 0, 2]);
  assert.ok(coffeeVisit(fourth)?.waiter);
  assert.deepEqual(coffeeVisit(advanceV3(fourth, 20))?.delivered, [1, 0, 2, 3]);
});
