import {writeFileSync, mkdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createState, advance, summary, DEFAULTS, failSystem, dispatch} from './engine.mjs';
import {decide, POLICIES} from './policies.mjs';

export function run({policy = 'balanced', reaction = 2, seed = 1, config = {}, limit = 360, delay = 0} = {}) {
  const s = createState(config, seed);
  let next = delay;
  while (!s.result && s.time < limit) {
    if (s.time + 1e-8 >= next) { decide(s, policy); next += reaction; }
    advance(s, s.config.tick);
  }
  return {state: s, row: {policy, reaction, delay, ...summary(s)}};
}
export function soak({cap = 12, seed = 1, slots = 2, burst = false, config = {}, seconds = 600} = {}) {
  const s = createState({...config, cap, developerMaintenance: false}, seed);
  s.credits = 1000; s.recon = slots;
  s.systems = Array.from({length: cap}, (_, id) => ({
    id, builtAt: -s.config.matureAge, build: 1, issue: null,
    nextIssue: 1 + (id / cap) * s.config.oldInterval,
  }));
  if (burst) { s.systems.forEach(x => failSystem(s, x.id)); dispatch(s); }
  advance(s, seconds, {continueAfterWin: true});
  const tail = s.samples.filter(x => x.at >= 60);
  return {cap, seed, recon: slots, burst, uptime: tail.reduce((n, x) => n + x.uptime, 0) / tail.length,
    initialBurstClearedAt: burst ? s.samples.find(x => x.failed === 0)?.at ?? null : null,
    maxFailed: Math.max(...tail.map(x => x.failed)),
    averageFailed: tail.reduce((n, x) => n + x.failed, 0) / tail.length,
    credits: s.credits, developerMaintenance: summary(s).developerMaintenance};
}
export function aggregate(rows) {
  return Object.keys(POLICIES).map(policy => {
    const group = rows.filter(x => x.policy === policy), wins = group.filter(x => x.finish !== null);
    const times = wins.map(x => x.finish).sort((a,b)=>a-b);
    return {policy, runs: group.length, wins: wins.length,
      min: times[0] ?? null, median: times.length ? times[Math.floor(times.length/2)] : null,
      max: times.at(-1) ?? null, inTarget: times.filter(t=>t>=120&&t<=180).length,
      handoffs: group.reduce((n,x)=>n+x.handoffs.walk+x.handoffs.fix,0)};
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rows = [];
  for (const policy of Object.keys(POLICIES))
    for (const reaction of [1, 3, 5]) for (const seed of [1, 7, 19, 42, 101])
      rows.push(run({policy, reaction, seed}).row);
  const capacity = [];
  for (const cap of [9, 12, 15, 18, 21, 24]) for (const slots of [1, 2])
    for (const burst of [false, true]) for (const seed of [1, 7, 19])
      capacity.push(soak({cap, slots, burst, seed}));
  const recovery = [10, 20, 30].flatMap(delay => ['balanced','hire','recon'].map(policy => run({policy, delay, reaction:3}).row));
  const sensitivity = [
    {name:'double-wages', config:{wage:DEFAULTS.wage*2}},
    {name:'faster-ageing', config:{matureAge:45}},
    {name:'more-maintenance', config:{oldInterval:12}},
    {name:'slower-Recon', config:{reconFixSeconds:2}},
    {name:'slower-construction', config:{constructionSeconds:12}},
  ].map(x => ({name:x.name, config:x.config, runs:['balanced','hire','recon'].map(policy=>run({policy,reaction:3,config:x.config}).row),
    soak:soak({cap:DEFAULTS.cap,config:x.config})}));
  const output = {model: 'v3-sandbox-2', defaults: DEFAULTS,
    kind: 'Scripted experimental simulation; not human enjoyment evidence',
    strategies: aggregate(rows), rows, capacity, recovery, sensitivity};
  mkdirSync('docs/analysis', {recursive: true});
  writeFileSync('docs/analysis/v3-sandbox-results.json', JSON.stringify(output, null, 2) + '\n');
  console.table(output.strategies);
  console.table([9,12,15,18,21,24].map(cap => {
    const group = capacity.filter(x=>x.cap===cap&&x.recon===2);
    return {cap, minMatureUptime: Math.min(...group.map(x=>x.uptime)), maxMatureFailed: Math.max(...group.map(x=>x.maxFailed))};
  }));
}
