import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceV3, buyV3, newV3, pauseV3, p1Failure, startV3, V3, workerPosition, type Phase, type V3State} from '../src/v3Game.ts';
import {benchPosition, pathLength, routeBetween, workPosition, workRoute, positionOnPath, WORLD} from '../src/v3World.ts';
import {selectGuidance} from '../src/v3Guidance.ts';
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
function until(s: V3State, condition: (s: V3State) => boolean, seconds = 50) {
  for (let t = 0; !condition(s) && t < seconds; t += V3.step) s = advanceV3(s, V3.step);
  assert.ok(condition(s)); return s;
}
// Isolated scheduling fixtures: no extra failures or target crossing during the assertion.
function fixture(phase: Phase = 'assembly') {
  const s = startV3(newV3()); s.cash = 0;
  s.systems = [0, 1, 2, 3].map(id => ({id, installed: true, broken: id === 1 && ['outward', 'repair'].includes(phase), age: 0, hazard: 0, threshold: 9999, installedAt: 0}));
  const w = s.developers[0]; w.phase = phase; w.system = 1; w.route = workRoute(0, 1);
  if (phase === 'return') w.route.reverse();
  w.duration = ['delivery', 'outward', 'return'].includes(phase) ? pathLength(w.route) / WORLD.walkSpeed : phase === 'install' ? 1 : 5;
  w.elapsed = w.duration / 3;
  if (!['idle', 'return'].includes(phase)) {
    w.job = s.nextJob++;
    s.jobs.push({id: w.job, type: ['outward', 'repair'].includes(phase) ? 'repair' : 'build', system: 1, owner: 0, at: 0, progress: phase === 'repair' ? .4 : 0});
    if (s.jobs[0].type === 'build') s.systems[1].installed = false;
  }
  return s;
}
function emergency(s: V3State, system = 0) {
  s.systems[system].broken = true;
  const id = s.nextJob++;
  s.jobs.push({id, type: 'repair', priority: 'p1', system, owner: null, at: s.time, progress: 0});
  return startV3(pauseV3(s)); // Dispatch at exactly the interruption position/time.
}
for (const phase of ['assembly', 'delivery', 'install', 'outward', 'repair', 'return'] as const) {
  test(`P1: interrupts and restores ${phase} at its exact saved position and progress`, () => {
    let s = fixture(phase); const before = structuredClone(s.developers[0]), from = workerPosition(before);
    s = emergency(s); const urgentId = s.developers[0].job;
    assert.equal(s.developers[0].phase, 'outward'); assert.deepEqual(workerPosition(s.developers[0]), from);
    assert.equal(s.developers[0].suspended!.elapsed, before.elapsed);
    assert.equal(s.jobs.find(j => j.id === before.job)?.owner, before.job === null ? undefined : 0);
    const pausedProgress = s.jobs.find(j => j.id === before.job)?.progress;
    s = until(s, x => x.developers[0].phase === 'repair');
    assert.equal(s.jobs.find(j => j.id === before.job)?.progress, pausedProgress);
    assert.deepEqual(workerPosition(s.developers[0]), workPosition(0));
    s = until(s, x => x.developers[0].phase === 'resume');
    assert.ok(!s.jobs.some(j => j.id === urgentId)); assert.equal(s.systems[0].broken, false);
    assert.equal(s.developers[0].system, before.system);
    const resumeStart = s.time, duration = s.developers[0].duration;
    close(duration, pathLength(s.developers[0].route) / WORLD.walkSpeed);
    s = until(s, x => !x.developers[0].suspended);
    assert.ok(s.time - resumeStart + 1e-8 >= duration);
    assert.equal(s.developers[0].phase, phase); close(s.developers[0].elapsed, before.elapsed);
    assert.deepEqual(workerPosition(s.developers[0]), from);
    assert.equal(s.jobs.find(j => j.id === before.job)?.suspended, undefined);
  });
}
test('P1: path detours stay on connected orthogonal aisles and charge actual distance', () => {
  for (let w = 0; w < 4; w++) for (let system = 0; system < 12; system++) {
    const from = positionOnPath(workRoute(w, system), .37), to = workPosition((system + 5) % 12);
    const route = routeBetween(w, from, to);
    assert.deepEqual(route[0], from); assert.deepEqual(route.at(-1), to);
    route.slice(1).forEach((p, i) => assert.ok(p.x === route[i].x || p.y === route[i].y));
    assert.ok(pathLength(route) >= Math.hypot(from.x - to.x, from.y - to.y) - 1e-7);
  }
});
test('P1: idle developer preferred; one responder per emergency, no nested interruptions', () => {
  let s = fixture(); s.cash = 100; s = buyV3(s, 'developer');
  s = emergency(s); assert.equal(s.jobs.find(j => j.priority === 'p1')!.owner, 1); assert.equal(s.developers[0].phase, 'assembly');
  s = emergency(s, 2); const jobs = s.developers.map(w => w.job);
  s = emergency(s, 3); assert.deepEqual(s.developers.map(w => w.job), jobs);
  assert.equal(s.jobs.filter(j => j.priority === 'p1' && j.owner === null).length, 1);
  s = until(s, x => x.jobs.every(j => j.priority !== 'p1'));
  assert.ok(s.developers.filter(w => w.suspended).length <= 1);
  s = until(s, x => !x.developers[0].suspended); assert.ok(s.events.some(e => e.text === 'Developer 1 resumes paused work'));
  assert.ok(s.systems[1].installed || s.jobs.some(j => j.type === 'build' && j.owner === 0));
});
test('P1: a new emergency during resumption keeps the original saved task', () => {
  let s = emergency(fixture('delivery')); const saved = structuredClone(s.developers[0].suspended);
  s = until(s, x => x.developers[0].phase === 'resume'); s = advanceV3(s, .5);
  const from = workerPosition(s.developers[0]); s = emergency(s, 2);
  assert.deepEqual(s.developers[0].suspended, saved); assert.deepEqual(workerPosition(s.developers[0]), from);
  s = until(s, x => !x.developers[0].suspended); assert.equal(s.developers[0].phase, 'delivery');
  close(s.developers[0].elapsed, saved!.elapsed);
});
test('P1: free Recon bay responds before interrupting developer; busy bay stays occupied', () => {
  let s = fixture(); s.recon = 1; s = emergency(s);
  assert.equal(s.jobs.find(j => j.priority === 'p1')!.owner, 'recon'); assert.equal(s.developers[0].phase, 'assembly');
  s = emergency(s, 2); assert.equal(s.jobs.find(j => j.system === 0)!.owner, 'recon');
  assert.equal(s.jobs.find(j => j.system === 2)!.owner, 0); assert.ok(s.developers[0].suspended);
});
test('P1: Recon takes urgent before older ordinary repairs and retains partial emergency work', () => {
  let s = emergency(fixture('repair')); s = until(s, x => x.developers[0].phase === 'repair');
  s = advanceV3(s, 2); const urgent = s.jobs.find(j => j.priority === 'p1')!, progress = urgent.progress;
  s.cash = V3.reconCost; const from = workerPosition(s.developers[0]); s = buyV3(s, 'recon');
  assert.equal(s.jobs.find(j => j.id === urgent.id)!.owner, 'recon'); close(s.jobs.find(j => j.id === urgent.id)!.progress, progress);
  assert.equal(s.developers[0].phase, 'resume'); assert.deepEqual(workerPosition(s.developers[0]), from);
  s = until(s, x => x.jobs.length === 0 && x.developers[0].phase === 'idle');
  assert.deepEqual(workerPosition(s.developers[0]), benchPosition(0));
});
test('P1: takeover of a suspended ordinary repair never redirects the active responder', () => {
  let s = emergency(fixture('repair')); s.recon = 1;
  // Occupy Recon with the emergency so its next free slot picks the paused ordinary repair.
  // Three bays then take both jobs in a single dispatch; restoring obsolete work must be impossible.
  s.cash = V3.plusCost; const from = workerPosition(s.developers[0]); s = buyV3(s, 'plus');
  assert.deepEqual(workerPosition(s.developers[0]), from);
  assert.ok(s.jobs.every(j => j.owner === 'recon'));
  assert.equal(s.developers[0].suspended, undefined); assert.equal(s.developers[0].phase, 'return');
  s = until(s, x => x.developers[0].phase === 'idle' && x.jobs.length === 0);
  assert.equal(s.developers[0].suspended, undefined);
});
test('P1: ordinary failures never interrupt; emergency, saved work and progress freeze on pause/win', () => {
  let normal = fixture(); normal.systems[0].hazard = 10000; normal = advanceV3(normal, .05);
  assert.equal(normal.developers[0].phase, 'assembly'); assert.equal(normal.jobs.at(-1)!.priority, undefined);
  let s = emergency(fixture('delivery')); const paused = pauseV3(s);
  assert.equal(advanceV3(paused, 100), paused);
  assert.equal(selectGuidance(s, {})!.id, 'p1'); assert.match(selectGuidance(s, {})!.text, /progress/);
  s.cash = 1200; s = advanceV3(s, .05); assert.equal(s.status, 'won');
  assert.equal(advanceV3(s, 100), s); assert.ok(s.developers[0].suspended);
});
test('P1: severity is deterministic, opening is ordinary and later rate is approximately 20%', () => {
  for (let seed = 1; seed <= 100; seed++) assert.equal(p1Failure(seed, 1), false);
  const draws = Array.from({length: 10000}, (_, i) => p1Failure(31, i + 2));
  const rate = draws.filter(Boolean).length / draws.length; assert.ok(rate > .18 && rate < .22);
  assert.deepEqual(draws, Array.from({length: 10000}, (_, i) => p1Failure(31, i + 2)));
});

test('P1: a real failure interrupts before the current task can finish on that tick', () => {
  let s = fixture('assembly');
  const ordinal = Array.from({length: 30}, (_, i) => i + 2).find(n => p1Failure(s.seed, n))!;
  s.metrics.failures = ordinal - 1; s.systems[0].hazard = 10000;
  s.developers[0].elapsed = s.developers[0].duration - V3.step;
  s = advanceV3(s, V3.step);
  assert.equal(s.developers[0].suspended!.phase, 'assembly');
  close(s.developers[0].suspended!.elapsed, V3.assembly - V3.step);
  assert.equal(s.metrics.p1Failures, 1); assert.equal(s.metrics.interruptions, 1);
  assert.equal(s.jobs.find(j => j.system === 0)!.priority, 'p1');
});
