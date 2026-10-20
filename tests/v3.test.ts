import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceV3, buyV3, earnings, failureInterval, newV3, pauseV3, purchaseInfo, startV3, V3, workerPosition, type V3State} from '../src/v3Game.ts';
import {benchPosition, pathLength, workRoute, WORLD} from '../src/v3World.ts';
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
function until(s: V3State, fn: (s: V3State) => boolean, max = 100) {for (let t = 0; !fn(s) && t < max; t += V3.step) s = advanceV3(s, V3.step); assert.ok(fn(s)); return s;}
function cash(s: V3State, amount = 1100) {s.cash = amount; return s;}
function failure(s: V3State) {s.systems[0].hazard = 1; return advanceV3(s, V3.step);}

test('V3: opening, exact paid purchases, caps, prerequisites, and fresh state', () => {
  const ready = newV3(); assert.equal(buyV3(ready, 'system'), ready); assert.equal(advanceV3(ready, 60), ready);
  let s = startV3(ready); s = buyV3(s, 'system'); assert.equal(s.cash, 45); assert.equal(s.jobs.length, 1);
  assert.equal(buyV3(s, 'developer'), s); assert.equal(buyV3(s, 'plus'), s);
  s = cash(pauseV3(s)); for (let i = 0; i < 20; i++) s = buyV3(s, 'system'); assert.equal(s.systems.length, 12);
  s = cash(s); for (let i = 0; i < 8; i++) s = buyV3(s, 'developer'); assert.equal(s.developers.length, 4);
  assert.equal(purchaseInfo(s, 'developer').reason, 'All 4 workbenches occupied');
  s = buyV3(s, 'recon'); s = buyV3(cash(s), 'plus'); assert.equal(s.recon, 3); assert.equal(buyV3(s, 'plus'), s);
  assert.deepEqual(newV3(), ready);
});
test('V3: assembly, actual path duration, install-before-income, and occupied return', () => {
  let s = buyV3(startV3(newV3()), 'system');
  s.systems[0].threshold = 9999; // Isolate installation accounting from unrelated outages.
  s = advanceV3(s, 5); assert.equal(s.developers[0].phase, 'delivery'); assert.equal(s.systems[1].installed, false);
  close(s.developers[0].duration, pathLength(workRoute(0, 1)) / WORLD.walkSpeed);
  s = until(s, x => x.developers[0].phase === 'install'); assert.equal(earnings(s).gross, 3);
  s = advanceV3(s, 1); assert.equal(s.systems[1].installed, true); assert.equal(earnings(s).gross, 6); assert.equal(s.developers[0].phase, 'return');
  s = buyV3(cash(s), 'system'); assert.equal(s.jobs[0].owner, null);
  s = until(s, x => x.developers[0].phase === 'assembly'); assert.equal(s.developers[0].system, 2);
  close(s.metrics.income - s.metrics.wages, (3 * s.systems[1].installedAt! + 6 * (s.time - s.systems[1].installedAt!)) - .35 * s.time);
});
test('V3: one developer per build, parallel builds after hiring, reservation stable', () => {
  let s = cash(startV3(newV3())); s = buyV3(s, 'developer'); s = buyV3(s, 'system'); s = buyV3(s, 'system');
  assert.deepEqual(s.developers.map(w => w.system), [1, 2]);
  const route = structuredClone(s.developers[0].route); s = buyV3(s, 'system');
  assert.deepEqual(s.developers[0].route, route); assert.equal(s.jobs[2].owner, null);
});
test('V3: FIFO is shared; ordinary maintenance does not interrupt construction', () => {
  let s = cash(startV3(newV3())); s = buyV3(s, 'system'); s = buyV3(s, 'system'); s = failure(s);
  // Keep later random P1s out of this ordinary FIFO contract.
  s.systems.forEach(n => {n.threshold = 9999;});
  assert.equal(s.developers[0].phase, 'assembly'); assert.deepEqual(s.jobs.map(j => j.type), ['build', 'build', 'repair']);
  s = until(s, x => x.developers[0].system === 2); assert.equal(s.developers[0].phase, 'assembly');
  s = until(s, x => x.developers[0].phase === 'outward'); assert.equal(s.developers[0].system, 0);
  let other = cash(startV3(newV3())); other = failure(other); other = buyV3(other, 'system');
  assert.equal(other.jobs[0].type, 'repair'); assert.equal(other.jobs[1].owner, null);
});
test('V3: Recon takes oldest repair during outward travel, retains position, no walking progress', () => {
  let s = failure(cash(startV3(newV3()))); s = advanceV3(s, 2);
  const position = workerPosition(s.developers[0]), travelled = s.developers[0].elapsed;
  s = buyV3(s, 'recon'); const w = s.developers[0];
  assert.equal(w.phase, 'return'); assert.equal(w.job, null); assert.deepEqual(workerPosition(w), position); close(w.duration, travelled);
  assert.equal(s.jobs[0].owner, 'recon'); assert.equal(s.jobs[0].progress, 0);
  s = advanceV3(s, travelled); assert.equal(s.developers[0].phase, 'idle'); assert.deepEqual(workerPosition(s.developers[0]), benchPosition(0));
  close(s.jobs[0].progress, travelled / V3.reconRepair);
});
test('V3: Recon takes over mid-repair, retains partial work and pays only remaining service time', () => {
  let s = failure(cash(startV3(newV3()))); s = until(s, x => x.developers[0].phase === 'repair'); s = advanceV3(s, 3);
  close(s.jobs[0].progress, .5); const position = workerPosition(s.developers[0]);
  s = buyV3(s, 'recon'); close(s.jobs[0].progress, .5); assert.deepEqual(workerPosition(s.developers[0]), position);
  s = advanceV3(s, 1.95); assert.equal(s.systems[0].broken, true);
  s = advanceV3(s, .05); assert.equal(s.systems[0].broken, false); assert.equal(s.developers[0].phase, 'return'); assert.equal(s.metrics.takeovers, 1);
});
test('V3: paused purchases spend but dispatch, travel, ageing and wages wait for resume', () => {
  let s = failure(cash(startV3(newV3()))); s = advanceV3(s, 1); s = pauseV3(s);
  const w = structuredClone(s.developers[0]), oldTime = s.time, oldAge = s.systems[0].age;
  s = buyV3(s, 'recon'); s = buyV3(s, 'system'); s = buyV3(s, 'developer');
  assert.deepEqual(s.developers[0], w); assert.equal(s.jobs[0].owner, 0); assert.equal(s.developers[1].phase, 'idle'); assert.equal(advanceV3(s, 90), s);
  s = startV3(s); assert.equal(s.developers[0].phase, 'return'); assert.equal(s.developers[1].phase, 'assembly'); assert.equal(s.jobs[0].owner, 'recon');
  assert.equal(s.time, oldTime); assert.equal(s.systems[0].age, oldAge);
});
test('V3: 1/3 Recon slots, P1 then oldest repair, exclusive ownership under sustained load', () => {
  let s = cash(startV3(newV3())); s = buyV3(s, 'developer');
  s.systems = Array.from({length: 12}, (_, id) => ({...s.systems[0], id, hazard: 2}));
  s = advanceV3(s, .05); s = buyV3(s, 'recon');
  assert.equal(s.jobs.filter(j => j.owner === 'recon').length, 1); const ordered = [...s.jobs].sort((a, b) => Number(b.priority === 'p1') - Number(a.priority === 'p1') || a.id - b.id);
  assert.equal(ordered[0].owner, 'recon');
  s = buyV3(cash(s), 'plus'); assert.deepEqual(s.jobs.filter(j => j.owner === 'recon').map(j => j.id).sort((a, b) => a - b), ordered.slice(0, 3).map(j => j.id).sort((a, b) => a - b));
  for (let i = 0; i < 200; i++) {
    s = advanceV3(s, .25);
    assert.ok(s.jobs.filter(j => j.owner === 'recon').length <= 3);
    const repairs = s.jobs.filter(j => j.type === 'repair');
    assert.equal(new Set(repairs.map(j => j.system)).size, repairs.length);
    for (const w of s.developers.filter(w => w.job !== null)) assert.equal(s.jobs.find(j => j.id === w.job)?.owner, w.id);
  }
});
test('V3: failures are local and income is binary; age survives repair and demand plateaus', () => {
  let s = cash(startV3(newV3())); s.systems.push({...s.systems[0], id: 1, threshold: 10});
  s = failure(s); assert.equal(earnings(s).gross, 3); assert.equal(s.systems[1].broken, false);
  s = buyV3(s, 'recon'); const beforeAge = s.systems[0].age; s = advanceV3(s, 4);
  close(s.systems[0].age, beforeAge + 4); assert.equal(earnings(s).gross, 6);
  assert.equal(failureInterval(0), 32); assert.equal(failureInterval(90), 24); assert.equal(failureInterval(90000), 24);
});
test('V3: initial failure at 22 seconds, wages include idle and travelling time', () => {
  let s = startV3(newV3()); s = advanceV3(s, 21.95); assert.equal(s.systems[0].broken, false);
  s = advanceV3(s, .05); assert.equal(s.systems[0].broken, true); const expected = 90 + s.metrics.income - s.metrics.wages; close(s.cash, expected); close(s.metrics.wages, 22 * .35);
  s = advanceV3(s, 2); close(s.cash, expected - 2 * .35);
});
test('V3: first cash crossing wins without automation/cap/health gates and freezes everything', () => {
  let s = startV3(newV3()); s.cash = 1199.9;
  s = advanceV3(s, 10); assert.equal(s.status, 'won'); assert.equal(s.result!.at, .05); assert.equal(s.result!.recon, 0); assert.equal(s.result!.systems, 1);
  assert.equal(advanceV3(s, 100), s); assert.equal(buyV3(s, 'system'), s); assert.equal(startV3(s), s);
});
test('V3: determinism across update batches and exact accounting', () => {
  let a = buyV3(startV3(newV3(93)), 'system'), b = structuredClone(a);
  a = advanceV3(a, 120); for (let i = 0; i < 480; i++) b = advanceV3(b, .25);
  assert.deepEqual(a, b); close(a.cash, V3.startCash - V3.systemCost + a.metrics.income - a.metrics.wages);
});

test('V3: approved negative balance keeps wages and work running and recovers without bailout', () => {
  // Isolate the shortage rule from balance-dependent paid purchase timings.
  let s = advanceV3(startV3(newV3()), V3.openingFailure);
  s.cash = .01;
  const incomeBefore = s.metrics.income, wagesBefore = s.metrics.wages;
  s = advanceV3(s, V3.step);
  assert.ok(s.cash < 0);
  const wages = s.metrics.wages; assert.equal(s.status, 'running'); assert.equal(buyV3(s, 'system'), s);
  s = advanceV3(s, 30);
  assert.ok(s.cash > 0); assert.ok(s.metrics.minCash < 0); assert.ok(s.metrics.wages > wages); assert.equal(s.developers.length, 1);
  close(s.cash, .01 + s.metrics.income - incomeBefore - (s.metrics.wages - wagesBefore));
});


test('V3: purchased systems encounter maintenance during early expansion and recur at mature demand', () => {
  let s = buyV3(startV3(newV3()), 'system');
  s = until(s, x => x.systems[1].broken);
  const operatingTime = s.time - s.systems[1].installedAt!;
  assert.ok(operatingTime >= 23 && operatingTime <= 32, `new-system first failure after ${operatingTime}s`);
  // Isolate a mature machine without travel/repair or cash-goal stopping the observation.
  let mature = startV3(newV3(31)); mature.systems[0].age = 90; mature.metrics.failures = 1;
  mature.systems[0].threshold = 1; mature = advanceV3(mature, 23.95);
  assert.equal(mature.systems[0].broken, false);
  mature = advanceV3(mature, .05); assert.equal(mature.systems[0].broken, true);
});
