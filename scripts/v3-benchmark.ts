import {writeFileSync} from 'node:fs';
import {advanceV3, buyV3, newV3, purchaseInfo, startV3, V3, type Purchase, type V3State} from '../src/v3Game.ts';
import {pathLength, workRoute, WORLD} from '../src/v3World.ts';
export type Policy = 'save' | 'small-estate' | 'expand-only' | 'hire-first' | 'balanced' | 'recon-first' | 'plus-first' | 'four-developers';
export const policies: Policy[] = ['save', 'small-estate', 'expand-only', 'hire-first', 'balanced', 'recon-first', 'plus-first', 'four-developers'];
export function choosePurchase(s: V3State, policy: Policy): Purchase | null {
  const systems = s.systems.length, workers = s.developers.length;
  if (policy === 'save') return null;
  if (policy === 'small-estate') return systems < 4 ? 'system' : null;
  if (policy === 'expand-only') return systems < 12 ? 'system' : null;
  if (policy === 'hire-first') return workers < 3 ? 'developer' : systems < 12 ? 'system' : null;
  if (policy === 'four-developers') return workers < 4 ? 'developer' : systems < 12 ? 'system' : !s.recon ? 'recon' : s.recon < 3 ? 'plus' : null;
  if (policy === 'recon-first') return !s.recon ? 'recon' : systems < 8 ? 'system' : s.recon < 3 ? 'plus' : systems < 12 ? 'system' : null;
  if (policy === 'plus-first') return !s.recon ? 'recon' : s.recon < 3 ? 'plus' : systems < 12 ? 'system' : null;
  return systems < 3 ? 'system' : workers < 2 ? 'developer' : systems < 6 ? 'system' : !s.recon ? 'recon' : systems < 10 ? 'system' : s.recon < 3 ? 'plus' : systems < 12 ? 'system' : null;
}
export function runPolicy(policy: Policy, seed: number, reaction = 1, delay = 0) {
  let s = startV3(newV3(seed));
  while (s.status === 'running' && s.time < 900) {
    const action = s.time >= delay ? choosePurchase(s, policy) : null;
    if (action && !purchaseInfo(s, action).reason) s = buyV3(s, action);
    s = advanceV3(s, reaction);
  }
  return s;
}
export function capacity(seed: number, recon: 1 | 3, burst: boolean) {
  let s = startV3(newV3(seed));
  // Stress fixture, not a paid run: fully aged, maximum estate, no developer assistance.
  s.developers = []; s.recon = recon; s.metrics.failures = 1;
  s.systems = Array.from({length: V3.maxSystems}, (_, id) => ({...s.systems[0], id, age: 90, hazard: burst ? 2 : id / 12, threshold: 1}));
  let operating = 0, samples = 0, maxBroken = 0, peakQueue = 0, settledPeak = 0, burstClearedAt: number | null = null;
  for (let i = 0; i < 2400; i++) {
    s.cash = 0; s = advanceV3(s, .25);
    const broken = s.systems.filter(n => n.broken).length;
    if (burst && burstClearedAt === null && i > 0 && !broken) burstClearedAt = s.time;
    maxBroken = Math.max(maxBroken, broken); peakQueue = Math.max(peakQueue, s.jobs.filter(j => j.owner === null).length);
    if (s.time > 60) {operating += 12 - broken; samples++; settledPeak = Math.max(settledPeak, broken);}
  }
  return {seed, recon, burst, uptimePercent: 100 * operating / (samples * 12), maxBroken, settledPeak, peakQueue, burstClearedAt};
}
if (process.argv[1]?.endsWith('v3-benchmark.ts')) {
  const runs = policies.flatMap(policy => [1, 31, 93, 200, 987].flatMap(seed => [1, 3].map(reaction => {
    const s = runPolicy(policy, seed, reaction);
    return {policy, seed, reaction, result: s.result, systems: s.systems.length, metrics: s.metrics, purchases: s.purchases};
  })));
  const summaries = policies.map(policy => {const data = runs.filter(r => r.policy === policy); const times = data.map(r => r.result?.at ?? 900).sort((a, b) => a - b); return {policy, wins: data.filter(r => r.result).length, min: times[0], median: (times[4] + times[5]) / 2, max: times.at(-1), minCash: Math.min(...data.map(r => r.metrics.minCash))};});
  const capacities = [1, 31, 93, 200, 987].flatMap(seed => ([1, 3] as const).flatMap(tier => [false, true].map(burst => capacity(seed, tier, burst))));
  const delayed = [10, 30, 60].flatMap(delay => ['balanced', 'hire-first', 'recon-first'].map(policy => {const s = runPolicy(policy as Policy, 31, 1, delay); return {policy, delay, result: s.result, minCash: s.metrics.minCash};}));
  const walks = Array.from({length: 4}, (_, w) => Array.from({length: 12}, (_, n) => pathLength(workRoute(w, n)) / WORLD.walkSpeed)).flat().sort((a, b) => a - b);
  let lateSpending = advanceV3(startV3(newV3()), 21);
  for (const action of ['developer', 'system', 'system'] as const) lateSpending = buyV3(lateSpending, action);
  lateSpending = advanceV3(lateSpending, 30);
  const shortageCase = {description: 'Former deficit case, now solvent with desk features: at 21 seconds buy one developer and two systems; continue through second 51.', minimumCash: lateSpending.metrics.minCash, endingCash: lateSpending.cash, rule: 'Owner approved visible negative cash with continuing wages/work on 2026-10-20.'};
  const negativeRun = runs.reduce((lowest, run) => run.metrics.minCash < lowest.metrics.minCash ? run : lowest);
  const negativeBalanceCase = {policy: negativeRun.policy, seed: negativeRun.seed, reaction: negativeRun.reaction, minimumCash: negativeRun.metrics.minCash, result: negativeRun.result};
  const evidence = {shortageCase, negativeBalanceCase, configuration: 'V3.4 D175: restored Recon 180 / Plus 260; modestly faster maintenance 32/24; opening failure 22, automation effectiveness and cash target unchanged, 2026-10-21', rules: V3, walks: {min: walks[0], median: (walks[23] + walks[24]) / 2, max: walks.at(-1)}, summaries, runs, capacities, delayed};
  writeFileSync('docs/analysis/v3-mvp-benchmark.json', JSON.stringify(evidence, null, 2) + '\n');
  console.table(summaries); console.log('Walk seconds:', evidence.walks); console.table(capacities); console.table(delayed.map(r => ({...r, result: r.result?.at})));
}
