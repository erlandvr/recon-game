import {backlogPosition, backlogRoute, benchPosition, pathLength, pathPrefix, positionOnPath, routeBetween, workPosition, workRoute, WORLD, type Point} from './v3World.ts';

/** V3.3 shared features and P1 feedback on candidate B maintenance. Independent of the historical sandbox and Speed's scoring engine. */
export const V3 = Object.freeze({
  step: .05, startCash: 90, target: 1200, maxSystems: 12, maxDevelopers: 4,
  featureAssembly: 3, featurePickup: .35, featureIncome: .25, featureIdleDelay: .75,
  systemCost: 45, developerCost: 55, wage: .35, income: 3,
  assembly: 5, install: 1, repair: 6, reconRepair: 4, reconCost: 180, plusCost: 260,
  youngInterval: 32, matureInterval: 24, matureAge: 90, openingFailure: 22, p1Chance: .2,
});
export type Purchase = 'system' | 'developer' | 'recon' | 'plus';
export type Phase = 'idle' | 'assembly' | 'delivery' | 'install' | 'outward' | 'repair' | 'return' | 'resume' | 'backlog' | 'pickup' | 'fetch' | 'to-build' | 'resume-feature';
export type System = {id: number; installed: boolean; broken: boolean; age: number; hazard: number; threshold: number; installedAt: number | null; features?: number; featureAt?: number; featureBy?: number};
export type Job = {id: number; type: 'build' | 'repair' | 'feature'; system: number; at: number; owner: number | 'recon' | null; progress: number; priority?: 'p1'; suspended?: boolean};
export type Developer = {id: number; phase: Phase; job: number | null; system: number | null; elapsed: number; duration: number; route: Point[]; turnedAt: number | null; suspended?: SuspendedWork; parkedFeature?: SuspendedWork; feature?: boolean};
export type SuspendedWork = Omit<Developer, 'suspended' | 'parkedFeature'> & {position: Point};
export type V3Result = {at: number; cash: number; systems: number; installed: number; developers: number; recon: number};
export type V3State = {
  status: 'ready' | 'running' | 'paused' | 'won'; time: number; cash: number; seed: number; rng: number;
  systems: System[]; developers: Developer[]; jobs: Job[]; nextJob: number; recon: 0 | 1 | 3; result: V3Result | null;
  events: {at: number; text: string}[]; purchases: {at: number; action: Purchase; cash: number}[];
  metrics: {income: number; wages: number; minCash: number; idle: number; construction: number; maintenance: number; return: number; queueWait: number; jobsStarted: number; failures: number; repairs: number; takeovers: number; p1Failures: number; interruptions: number; features: number; featureWork: number; featuresTaken: number};
};
export function failureInterval(age: number) {
  return V3.youngInterval - (V3.youngInterval - V3.matureInterval) * Math.min(1, Math.max(0, age) / V3.matureAge);
}
function random(s: V3State) { s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0; return s.rng / 4294967296; }
function threshold(s: V3State) { return .85 + random(s) * .3; }
function developer(id: number): Developer {return {id, phase: 'idle', job: null, system: null, elapsed: 0, duration: 0, route: [benchPosition(id)], turnedAt: null};}
export function newV3(seed = 31): V3State {
  // The initial machine's integrated hazard reaches 1 at 22 active seconds.
  return {status: 'ready', time: 0, cash: V3.startCash, seed, rng: seed >>> 0,
    systems: [{id: 0, installed: true, broken: false, age: 0, hazard: 0, threshold: 1, installedAt: 0}],
    developers: [developer(0)], jobs: [], nextJob: 0, recon: 0, result: null, events: [], purchases: [],
    metrics: {income: 0, wages: 0, minCash: V3.startCash, idle: 0, construction: 0, maintenance: 0, return: 0, queueWait: 0, jobsStarted: 0, failures: 0, repairs: 0, takeovers: 0, p1Failures: 0, interruptions: 0, features: 0, featureWork: 0, featuresTaken: 0}};
}
export function systemIncome(node: System) {return node.installed && !node.broken ? V3.income + (node.features ?? 0) * V3.featureIncome : 0;}
export function earnings(s: V3State) {
  const gross = s.systems.reduce((sum, node) => sum + systemIncome(node), 0);
  const wages = s.developers.length * V3.wage;
  return {gross, wages, net: gross - wages};
}
export function purchaseInfo(s: V3State, action: Purchase): {price: number; reason: string | null} {
  const price = {system: V3.systemCost, developer: V3.developerCost, recon: V3.reconCost, plus: V3.plusCost}[action];
  let reason: string | null = null;
  if (s.status === 'ready') reason = 'Available at GO';
  else if (s.status === 'won') reason = 'Run complete';
  else if (action === 'system' && s.systems.length >= V3.maxSystems) reason = 'All 12 positions reserved';
  else if (action === 'developer' && s.developers.length >= V3.maxDevelopers) reason = 'All 4 workbenches occupied';
  else if (action === 'recon' && s.recon) reason = 'Installed';
  else if (action === 'plus' && !s.recon) reason = 'Requires Recon';
  else if (action === 'plus' && s.recon === 3) reason = 'Installed';
  else if (s.cash + 1e-8 < price) reason = `Need ${Math.ceil(price - s.cash)} more credits`;
  return {price, reason};
}
function event(s: V3State, text: string) { s.events.push({at: s.time, text}); if (s.events.length > 60) s.events.shift(); }
function enqueue(s: V3State, type: Job['type'], system: number) {s.jobs.push({id: s.nextJob++, type, system, at: s.time, owner: null, progress: 0});}
export function workerPosition(w: Developer): Point {
  if (['delivery', 'outward', 'return', 'resume', 'backlog', 'fetch', 'to-build', 'resume-feature'].includes(w.phase)) return positionOnPath(w.route, w.duration ? w.elapsed / w.duration : 1);
  if (w.phase === 'pickup') return backlogPosition(w.id);
  return w.phase === 'install' || w.phase === 'repair' ? workPosition(w.system!) : benchPosition(w.id);
}
function phase(w: Developer, next: Phase, duration: number, route = w.route) {w.phase = next; w.elapsed = 0; w.duration = duration; w.route = route;}
function travel(w: Developer, next: Phase, route: Point[]) {phase(w, next, pathLength(route) / WORLD.walkSpeed, route);}
function returnHome(w: Developer, interrupted = false) {
  const path = w.phase === 'outward' ? pathPrefix(w.route, pathLength(w.route) * w.elapsed / w.duration) : w.route;
  travel(w, 'return', path.slice().reverse()); w.job = null;
  if (!interrupted) w.turnedAt = null;
}
/** Severity uses a separate deterministic stream; it never changes failure timing. */
export function p1Failure(seed: number, ordinal: number) {
  if (ordinal === 1) return false; // Keep the opening maintenance lesson ordinary.
  let n = (seed ^ Math.imul(ordinal, 0x9e3779b9)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 0x21f0aaad);
  n = Math.imul(n ^ (n >>> 15), 0x735a2d97);
  return ((n ^ (n >>> 15)) >>> 0) / 4294967296 < V3.p1Chance;
}
function snapshot(w: Developer): SuspendedWork {
  const {suspended: _urgent, parkedFeature: _feature, ...work} = w;
  return {...work, route: w.route.map(p => ({...p})), position: workerPosition(w)};
}
function parkFeature(s: V3State, w: Developer) {
  if (!w.parkedFeature) w.parkedFeature = snapshot(w);
  const job = s.jobs.find(j => j.id === w.parkedFeature!.job);
  if (job) job.suspended = true;
  w.feature = false;
}
/** Independent deterministic selection: feature allocation never consumes failure randomness. */
function finishFeature(s: V3State, w: Developer) {
  const targets = s.systems.filter(n => n.installed);
  let n = (s.seed ^ Math.imul(s.metrics.features + 1, 0x85ebca6b)) >>> 0;
  n = Math.imul(n ^ (n >>> 16), 0x7feb352d);
  n = Math.imul(n ^ (n >>> 15), 0x846ca68b);
  const target = targets[Math.floor(((n ^ (n >>> 16)) >>> 0) / 4294967296 * targets.length)];
  target.features = (target.features ?? 0) + 1; target.featureAt = s.time; target.featureBy = w.id;
  s.metrics.features++;
  event(s, `Feature completed at desk for system ${target.id + 1} · +${V3.featureIncome} credits/s when working`);
  s.jobs = s.jobs.filter(j => j.id !== w.job);
  w.job = null; w.system = null; w.feature = false;
  phase(w, 'idle', 0, [benchPosition(w.id)]);
}
function savedWorkValid(s: V3State, w: Developer) {
  return w.suspended && (w.suspended.job === null || s.jobs.some(j => j.id === w.suspended!.job && j.owner === w.id));
}
function leaveRepair(s: V3State, w: Developer, urgent: boolean, takeover = false) {
  const from = workerPosition(w);
  if (savedWorkValid(s, w)) {
    travel(w, 'resume', routeBetween(w.id, from, w.suspended!.position)); w.job = null; w.system = w.suspended!.system; w.feature = w.suspended!.feature;
  } else if (urgent || w.suspended) {
    delete w.suspended;
    travel(w, 'return', routeBetween(w.id, from, benchPosition(w.id))); w.job = null;
  } else {travel(w, 'return', routeBetween(w.id, from, benchPosition(w.id))); w.job = null;}
  w.turnedAt = takeover ? s.time : null;
}
function reconDispatch(s: V3State, urgentOnly = false) {
  let slots = s.recon - s.jobs.filter(j => j.owner === 'recon').length;
  const repairs = s.jobs.filter(j => j.type === 'repair' && (!urgentOnly || j.priority === 'p1'))
    .sort((a, b) => Number(b.priority === 'p1') - Number(a.priority === 'p1') || a.id - b.id);
  for (const job of repairs) {
    if (slots <= 0) break;
    if (job.owner === 'recon') continue;
    if (typeof job.owner === 'number') {
      const w = s.developers[job.owner];
      // Taking a paused repair must not pull its developer off an active emergency.
      if (w.job === job.id) leaveRepair(s, w, job.priority === 'p1', true);
      s.metrics.takeovers++;
    } else {s.metrics.queueWait += s.time - job.at; s.metrics.jobsStarted++;}
    const previousOwner = job.owner;
    job.owner = 'recon'; delete job.suspended; slots--;
    if (typeof previousOwner === 'number') {
      const w = s.developers[previousOwner];
      if (w.suspended?.job === job.id) {
        // No need to retrieve a repair that Recon has taken over.
        delete w.suspended;
        if (w.phase === 'resume') {travel(w, 'return', routeBetween(w.id, workerPosition(w), benchPosition(w.id))); w.job = null;}
      }
    }
  }
}
function urgentDispatch(s: V3State) {
  reconDispatch(s, true);
  for (const job of s.jobs.filter(j => j.priority === 'p1' && j.owner === null)) {
    const candidates = s.developers.filter(w => !s.jobs.some(j => j.id === w.job && j.priority === 'p1'))
      .map(w => ({w, route: routeBetween(w.id, workerPosition(w), workPosition(job.system))}))
      .sort((a, b) => Number(b.w.phase === 'idle') - Number(a.w.phase === 'idle') || pathLength(a.route) - pathLength(b.route) || a.w.id - b.w.id);
    const selected = candidates[0];
    if (!selected) break;
    const {w, route} = selected;
    if (w.feature) {
      parkFeature(s, w); s.metrics.interruptions++;
      event(s, `Developer ${w.id + 1} pauses feature work for P1`);
    } else if (w.phase !== 'idle' && !w.suspended) {
      w.suspended = snapshot(w);
      const paused = s.jobs.find(j => j.id === w.job);
      if (paused) paused.suspended = true;
      s.metrics.interruptions++;
      event(s, `Developer ${w.id + 1} pauses work for P1 on system ${job.system + 1}`);
    }
    job.owner = w.id; w.job = job.id; w.system = job.system; w.feature = false; w.turnedAt = s.time;
    s.metrics.queueWait += s.time - job.at; s.metrics.jobsStarted++;
    travel(w, 'outward', route);
  }
}
/** Features yield to all unclaimed builds/repairs. Existing non-feature work stays FIFO, except P1. */
function dispatch(s: V3State) {
  urgentDispatch(s);
  reconDispatch(s);
  // Prefer already free workers; only interrupt feature work if queued work still needs capacity.
  const workers = [...s.developers].sort((a, b) => Number(b.phase === 'idle') - Number(a.phase === 'idle') || a.id - b.id);
  for (const w of workers) {
    const job = s.jobs.find(j => j.owner === null && j.type !== 'feature');
    // An unassigned walk home is not useful work: take the next repair from here.
    // Preserve FIFO and P1 resumption; construction still needs the bench.
    const canReroute = w.phase === 'return' && w.job === null && !w.suspended && job?.type === 'repair';
    if (w.phase !== 'idle' && !(w.feature && job) && !canReroute) continue;
    if (job) {
      const from = workerPosition(w);
      if (w.feature) parkFeature(s, w);
      w.feature = false; job.owner = w.id; w.job = job.id; w.system = job.system; w.turnedAt = null;
      s.metrics.queueWait += s.time - job.at; s.metrics.jobsStarted++;
      if (job.type === 'build') {
        const home = routeBetween(w.id, from, benchPosition(w.id));
        if (pathLength(home) < 1e-6) phase(w, 'assembly', V3.assembly, workRoute(w.id, job.system));
        else travel(w, 'to-build', home);
      } else travel(w, 'outward', routeBetween(w.id, from, workPosition(job.system)));
      continue;
    }
    if (w.parkedFeature) {
      w.feature = true; w.job = null; w.system = null;
      travel(w, 'resume-feature', routeBetween(w.id, workerPosition(w), w.parkedFeature.position));
      continue;
    }
    if (w.elapsed < V3.featureIdleDelay || !s.systems.some(n => n.installed)) continue;
    // No destination is reserved: select a random installed system only when the desk work finishes.
    enqueue(s, 'feature', -1);
    const feature = s.jobs.at(-1)!; feature.owner = w.id;
    w.job = feature.id; w.system = null; w.feature = true; w.turnedAt = null;
    travel(w, 'backlog', backlogRoute(w.id));
  }
}
export function buyV3(state: V3State, action: Purchase): V3State {
  const info = purchaseInfo(state, action);
  if (info.reason) return state;
  const s = structuredClone(state); s.cash = Math.max(0, s.cash - info.price);
  s.metrics.minCash = Math.min(s.metrics.minCash, s.cash);
  s.purchases.push({at: s.time, action, cash: s.cash});
  if (action === 'system') {
    const id = s.systems.length;
    s.systems.push({id, installed: false, broken: false, age: 0, hazard: 0, threshold: threshold(s), installedAt: null});
    enqueue(s, 'build', id); event(s, `System ${id + 1} purchased · added to the work queue`);
  } else if (action === 'developer') {s.developers.push(developer(s.developers.length)); event(s, 'Developer hired · wages increase by 0.35/s');}
  else {s.recon = action === 'recon' ? 1 : 3; event(s, action === 'recon' ? 'Recon installed · 1 repair slot' : 'Recon Plus installed · 3 repair slots');}
  if (s.status === 'running') dispatch(s);
  return s;
}
export function startV3(state: V3State): V3State {
  if (state.status !== 'ready' && state.status !== 'paused') return state;
  const s = structuredClone(state); s.status = 'running'; dispatch(s); return s;
}
export function pauseV3(state: V3State): V3State {return state.status === 'running' ? {...state, status: 'paused'} : state;}
function repairDone(s: V3State, job: Job) {
  const node = s.systems[job.system]; node.broken = false; node.hazard = 0; node.threshold = threshold(s);
  s.jobs = s.jobs.filter(j => j.id !== job.id); s.metrics.repairs++; event(s, `System ${node.id + 1} repaired · income restored`);
}
function tick(s: V3State) {
  const dt = V3.step, income = earnings(s);
  s.time = Math.round((s.time + dt) * 100) / 100;
  s.cash += income.net * dt; s.metrics.income += income.gross * dt; s.metrics.wages += income.wages * dt;
  s.metrics.minCash = Math.min(s.metrics.minCash, s.cash);
  if (s.cash + 1e-8 >= V3.target) {
    s.status = 'won'; s.result = {at: s.time, cash: s.cash, systems: s.systems.length, installed: s.systems.filter(n => n.installed).length, developers: s.developers.length, recon: s.recon};
    event(s, 'Cash target reached · result frozen'); return;
  }
  // Age advances through outages; failure demand advances only while operating.
  for (const node of s.systems) {
    if (!node.installed) continue;
    node.age += dt;
    if (node.broken) continue;
    node.hazard += dt / (node.id === 0 && s.metrics.failures === 0 ? V3.openingFailure : failureInterval(node.age));
    if (node.hazard + 1e-8 >= node.threshold) {
      node.broken = true; enqueue(s, 'repair', node.id); s.metrics.failures++;
      if (p1Failure(s.seed, s.metrics.failures)) {s.jobs.at(-1)!.priority = 'p1'; s.metrics.p1Failures++;}
      event(s, `System ${node.id + 1} ${s.jobs.at(-1)!.priority === 'p1' ? 'P1 emergency' : 'broken'} · no income until repaired`);
    }
  }
  dispatch(s); // All queued higher-priority work stops feature progress before this tick advances.
  for (const w of s.developers) {
    const category = w.phase === 'idle' ? 'idle' : ['return', 'resume'].includes(w.phase) ? 'return' : w.feature ? 'featureWork' : ['outward', 'repair'].includes(w.phase) ? 'maintenance' : 'construction';
    s.metrics[category] += dt;
    if (w.phase === 'idle') {w.elapsed += dt; continue;}
    w.elapsed += dt;
    const job = s.jobs.find(j => j.id === w.job);
    if (w.phase === 'repair' && job) job.progress = Math.min(1, job.progress + dt / V3.repair);
    if (w.phase === 'repair' ? job && job.progress >= 1 - 1e-8 : w.elapsed >= w.duration - 1e-8) {
      if (w.phase === 'backlog') phase(w, 'pickup', V3.featurePickup);
      else if (w.phase === 'pickup') {s.metrics.featuresTaken++; travel(w, 'fetch', backlogRoute(w.id).slice().reverse());}
      else if (w.phase === 'fetch') phase(w, 'assembly', V3.featureAssembly, [benchPosition(w.id)]);
      else if (w.phase === 'to-build') phase(w, 'assembly', V3.assembly, workRoute(w.id, w.system!));
      else if (w.phase === 'assembly') {if (w.feature) finishFeature(s, w); else travel(w, 'delivery', w.route);}
      else if (w.phase === 'delivery') phase(w, 'install', V3.install);
      else if (w.phase === 'outward') phase(w, 'repair', V3.repair);
      else if (w.phase === 'install') {
        const node = s.systems[w.system!];
        node.installed = true; node.installedAt = s.time; event(s, `System ${node.id + 1} installed · earning 3 credits/s`);
        s.jobs = s.jobs.filter(j => j.id !== w.job);
        returnHome(w);
      } else if (w.phase === 'repair' && job) {repairDone(s, job); leaveRepair(s, w, job.priority === 'p1');}
      else if (w.phase === 'resume-feature') {
        const saved = w.parkedFeature!;
        const paused = s.jobs.find(j => j.id === saved.job);
        if (paused) delete paused.suspended;
        const {position: _position, ...restored} = saved;
        Object.assign(w, restored); delete w.parkedFeature;
        event(s, `Developer ${w.id + 1} resumes feature work`);
      }
      else if (w.phase === 'resume') {
        if (savedWorkValid(s, w)) {
          const saved = w.suspended!;
          const paused = s.jobs.find(j => j.id === saved.job);
          if (paused) delete paused.suspended;
          const {position: _position, ...restored} = saved;
          Object.assign(w, restored); delete w.suspended;
          event(s, `Developer ${w.id + 1} resumes paused work`);
        } else {delete w.suspended; travel(w, 'return', routeBetween(w.id, workerPosition(w), benchPosition(w.id)));}
      }
      else if (w.phase === 'return') {phase(w, 'idle', 0, [benchPosition(w.id)]); w.system = null; w.feature = false; w.turnedAt = null;}
    }
  }
  for (const job of s.jobs.filter(j => j.owner === 'recon')) {
    job.progress = Math.min(1, job.progress + dt / V3.reconRepair);
    if (job.progress >= 1 - 1e-8) repairDone(s, job);
  }
  dispatch(s);
}
/** Fixed 50 ms steps make browser play and offline strategy runs reproducible. */
export function advanceV3(state: V3State, seconds: number): V3State {
  if (state.status !== 'running' || seconds <= 0 || !Number.isFinite(seconds)) return state;
  const s = structuredClone(state);
  const steps = Math.floor((seconds + 1e-8) / V3.step);
  for (let i = 0; i < steps && s.status === 'running'; i++) tick(s);
  return s;
}
