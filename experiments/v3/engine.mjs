// Independent experimental model. No imports from, or writes to, the shipped game.
export const DEFAULTS = Object.freeze({
  tick: .1, cap: 15, startingCredits: 90, startingDevelopers: 1,
  hireCost: 55, wage: .35, maxDevelopers: 6,
  systemCost: 45, income: 3, failedIncomeShare: .2, constructionSeconds: 8,
  travelSeconds: 2, developerFixSeconds: 6, reconFixSeconds: 1.5,
  reconCost: 180, plusCost: 260, reconUpkeep: .3, plusUpkeep: .8,
  youngInterval: 28, oldInterval: 15, matureAge: 90, firstGrace: 16,
  speedCost: 100, speedMultiplier: 1.4,
  stableSeconds: 10, winUptime: .9, winDeveloperMaintenance: .1,
  developerMaintenance: true,
});
export function random(s) {
  s.rng = (Math.imul(1664525, s.rng) + 1013904223) >>> 0;
  return s.rng / 4294967296;
}
export function interval(s, system) {
  const age = Math.max(0, s.time - system.builtAt);
  const c = s.config;
  return c.youngInterval + (c.oldInterval - c.youngInterval) * Math.min(1, age / c.matureAge);
}
export function reconSlots(s) { return s.recon === 2 ? 3 : s.recon === 1 ? 1 : 0; }
export function log(s, kind, details = {}) {
  s.events.push({at: s.time, kind, ...details});
}
export function createState(config = {}, seed = 1) {
  const c = {...DEFAULTS, ...config};
  const s = {
    config: c, seed, rng: seed >>> 0, time: 0, credits: c.startingCredits,
    earned: 0, wages: 0, upkeep: 0, purchases: 0, recon: 0, speed: false,
    systems: [{id: 0, builtAt: 0, build: 1, issue: null, nextIssue: c.firstGrace}],
    developers: [], events: [], actions: [], samples: [], history: [],
    nextIssueId: 1, stable: 0, result: null, totalSystemSeconds: 0,
    healthySystemSeconds: 0, developerSeconds: {idle: 0, build: 0, walk: 0, fix: 0, return: 0},
    handoffs: {walk: 0, fix: 0}, firstRecon: null, firstPlus: null, minCredits: c.startingCredits,
  };
  for (let i = 0; i < c.startingDevelopers; i++) s.developers.push(newDeveloper(i));
  return s;
}
function newDeveloper(id) { return {id, mode: 'idle', target: null, remaining: 0, tripDuration: 0, turnAt: -100}; }
export function counts(s) {
  const built = s.systems.filter(x => x.build >= 1);
  return {
    built: built.length, total: s.systems.length,
    failed: built.filter(x => x.issue).length,
    reconBusy: built.filter(x => x.issue?.owner === 'recon').length,
    building: s.developers.filter(d => d.mode === 'build').length,
  };
}
export function economy(s) {
  const n = counts(s), c = s.config;
  const gross = (n.built - n.failed + n.failed * c.failedIncomeShare) * c.income;
  const wages = s.developers.length * c.wage;
  const upkeep = s.recon === 2 ? c.plusUpkeep : s.recon === 1 ? c.reconUpkeep : 0;
  return {gross, wages, upkeep, net: gross - wages - upkeep};
}
export function quote(s, action) {
  const c = s.config;
  if (action === 'hire') return {cost: c.hireCost, reason: s.developers.length >= c.maxDevelopers ? 'Developer limit reached' : null};
  if (action === 'system') return {cost: c.systemCost, reason: s.systems.length >= c.cap ? 'Ecosystem limit reached' : null};
  if (action === 'recon') return {cost: c.reconCost, reason: s.recon ? 'Recon already installed' : null};
  if (action === 'plus') return {cost: c.plusCost, reason: s.recon !== 1 ? 'Requires Recon; one upgrade only' : null};
  if (action === 'speed') return {cost: c.speedCost, reason: s.speed ? 'Speed upgrade installed' : null};
  return {cost: Infinity, reason: 'Unknown action'};
}
export function buy(s, action) {
  const q = quote(s, action);
  if (s.result || q.reason || s.credits + 1e-9 < q.cost) return false;
  s.credits -= q.cost; s.purchases += q.cost;
  s.actions.push({at: s.time, action, cost: q.cost, credits: s.credits});
  if (action === 'hire') s.developers.push(newDeveloper(s.developers.length));
  if (action === 'system') s.systems.push({id: s.systems.length, builtAt: null, build: 0, issue: null, nextIssue: Infinity});
  if (action === 'recon') { s.recon = 1; s.firstRecon = s.time; }
  if (action === 'plus') { s.recon = 2; s.firstPlus = s.time; }
  if (action === 'speed') s.speed = true;
  log(s, 'purchase', {action});
  dispatch(s);
  return true;
}
export function failSystem(s, id) {
  const system = s.systems[id];
  if (!system || system.build < 1 || system.issue) return false;
  system.issue = {id: s.nextIssueId++, born: s.time, progress: 0, owner: null};
  // One outstanding maintenance incident per system. Time to next incident
  // is scheduled after recovery; backlog is measured in affected systems.
  log(s, 'failure', {system: id});
  return true;
}
function returnHome(s, dev, takeover = false) {
  const prior = dev.mode;
  const travelled = prior === 'walk' ? Math.max(0, s.config.travelSeconds - dev.remaining) : s.config.travelSeconds;
  dev.remaining = travelled; dev.tripDuration = travelled; dev.mode = travelled > 0 ? 'return' : 'idle';
  dev.turnAt = takeover ? s.time : -100;
  if (dev.mode === 'idle') dev.target = null;
}
export function dispatch(s) {
  let free = reconSlots(s) - counts(s).reconBusy;
  // Oldest issue first, including work owned by a walking or fixing developer.
  const issues = s.systems.filter(x => x.issue && x.issue.owner !== 'recon')
    .sort((a, b) => a.issue.born - b.issue.born || a.id - b.id);
  for (const system of issues) {
    if (free <= 0) break;
    const previous = system.issue.owner;
    if (typeof previous === 'number') {
      const d = s.developers[previous];
      if (d.mode === 'walk' || d.mode === 'fix') {
        s.handoffs[d.mode]++;
        log(s, 'handoff', {developer: d.id, system: system.id, from: d.mode, progress: system.issue.progress});
        returnHome(s, d, true);
      }
    }
    system.issue.owner = 'recon'; free--;
  }
  for (const d of s.developers) {
    if (d.mode !== 'idle') continue;
    const failure = s.config.developerMaintenance
      ? s.systems.filter(x => x.issue?.owner === null).sort((a, b) => a.issue.born - b.issue.born || a.id - b.id)[0]
      : null;
    if (failure) {
      failure.issue.owner = d.id; d.mode = 'walk'; d.target = failure.id;
      d.remaining = s.config.travelSeconds; d.tripDuration = s.config.travelSeconds;
      continue;
    }
    const construction = s.systems.find(x => x.build < 1 && !s.developers.some(other => other.mode === 'build' && other.target === x.id));
    if (construction) { d.mode = 'build'; d.target = construction.id; }
  }
}
function repair(s, system) {
  log(s, 'repaired', {system: system.id, by: system.issue.owner});
  system.issue = null;
  system.nextIssue = s.time + interval(s, system) * (.8 + random(s) * .4);
}
export function advance(s, seconds, {continueAfterWin = false} = {}) {
  const steps = Math.round(seconds / s.config.tick);
  for (let k = 0; k < steps; k++) {
    if (s.result && !continueAfterWin) break;
    const c = s.config, dt = c.tick;
    dispatch(s);
    const n = counts(s), money = economy(s);
    s.time = Math.round((s.time + dt) * 1e8) / 1e8;
    s.earned += money.gross * dt; s.wages += money.wages * dt; s.upkeep += money.upkeep * dt;
    s.credits += money.net * dt; // Debt stays visible; no free bailout or wage forgiveness.
    s.minCredits = Math.min(s.minCredits, s.credits);
    s.totalSystemSeconds += n.built * dt;
    s.healthySystemSeconds += (n.built - n.failed) * dt;
    let maintenance = 0;
    for (const d of s.developers) {
      s.developerSeconds[d.mode] += dt;
      if (['walk', 'fix', 'return'].includes(d.mode)) maintenance++;
      if (d.mode === 'build') {
        const system = s.systems[d.target];
        system.build = Math.min(1, system.build + dt / c.constructionSeconds);
        if (system.build >= 1 - 1e-9) {
          system.build = 1; system.builtAt = s.time; system.nextIssue = s.time + c.firstGrace * (.8 + random(s) * .4);
          log(s, 'built', {system: system.id}); d.mode = 'idle'; d.target = null;
        }
      } else if (d.mode === 'walk' || d.mode === 'return') {
        d.remaining = Math.max(0, d.remaining - dt);
        if (d.remaining <= 1e-9) {
          if (d.mode === 'walk') d.mode = 'fix';
          else { d.mode = 'idle'; d.target = null; }
        }
      } else if (d.mode === 'fix') {
        const system = s.systems[d.target];
        if (system.issue?.owner !== d.id) throw new Error('Developer fixing without job ownership');
        system.issue.progress += dt * (s.speed ? c.speedMultiplier : 1) / c.developerFixSeconds;
        if (system.issue.progress >= 1 - 1e-9) { repair(s, system); returnHome(s, d); }
      }
    }
    for (const system of s.systems) {
      if (system.issue?.owner === 'recon') {
        system.issue.progress += dt * (s.speed ? c.speedMultiplier : 1) / c.reconFixSeconds;
        if (system.issue.progress >= 1 - 1e-9) repair(s, system);
      }
      if (system.build >= 1 && !system.issue && s.time + 1e-9 >= system.nextIssue) failSystem(s, system.id);
    }
    dispatch(s);
    const current = counts(s);
    const sample = {at: s.time, credits: s.credits, built: current.built,
      uptime: current.built ? (current.built - current.failed) / current.built : 0,
      maintenance: maintenance / s.developers.length, net: money.net,
      failed: current.failed, reconBusy: current.reconBusy};
    s.history.push(sample);
    while (s.history[0]?.at < s.time - c.stableSeconds + dt / 2) s.history.shift();
    if (Math.round(s.time / dt) % Math.round(1 / dt) === 0) s.samples.push(sample);
    const avg = key => s.history.reduce((sum, x) => sum + x[key], 0) / s.history.length;
    const ready = s.history.length >= Math.round(c.stableSeconds / dt)
      && s.history.every(x => x.built === c.cap) && s.recon > 0
      && avg('uptime') >= c.winUptime && avg('maintenance') <= c.winDeveloperMaintenance
      && avg('net') > 0 && s.credits >= 0;
    s.stable = ready ? c.stableSeconds : 0;
    if (ready && !s.result) {
      s.result = {at: s.time, uptime: avg('uptime'), maintenance: avg('maintenance'), net: avg('net')};
      log(s, 'finish', s.result);
    }
  }
  return s;
}
export function summary(s) {
  const developerTotal = Object.values(s.developerSeconds).reduce((a, b) => a + b, 0);
  return {
    seed: s.seed, finish: s.result?.at ?? null, elapsed: s.time, ...counts(s),
    developers: s.developers.length, recon: s.recon, speed: s.speed,
    firstRecon: s.firstRecon, firstPlus: s.firstPlus, credits: s.credits,
    earned: s.earned, wages: s.wages, upkeep: s.upkeep, purchases: s.purchases,
    minCredits: s.minCredits, handoffs: {...s.handoffs},
    uptime: s.totalSystemSeconds ? s.healthySystemSeconds / s.totalSystemSeconds : 1,
    developerMaintenance: developerTotal ? (s.developerSeconds.walk + s.developerSeconds.fix + s.developerSeconds.return) / developerTotal : 0,
    developerBuilding: developerTotal ? s.developerSeconds.build / developerTotal : 0,
    decisions: s.actions.length, result: s.result,
  };
}
