/** Compare interval candidates with isolated copies of the same engine; never edit live rules. */
import {readFileSync, writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import type {V3State} from '../src/v3Game.ts';
const root = mkdtempSync(join(tmpdir(), 'recon-v3-maintenance-'));
const engine = readFileSync(new URL('../src/v3Game.ts', import.meta.url), 'utf8');
const benchmark = readFileSync(new URL('./v3-benchmark.ts', import.meta.url), 'utf8');
const configurations = [[60, 40], [45, 30], [36, 26], [30, 24]];
const median = (values: number[]) => {const v = values.toSorted((a, b) => a - b); return (v[Math.floor((v.length - 1) / 2)] + v[Math.floor(v.length / 2)]) / 2;};
const occupation = (s: V3State) => {
  const m = s.metrics, total = m.idle + m.construction + m.maintenance + m.return;
  return {idlePercent: 100 * m.idle / total, maintenanceSeconds: m.maintenance, failures: m.failures, takeovers: m.takeovers};
};
try {
  writeFileSync(join(root, 'v3World.ts'), readFileSync(new URL('../src/v3World.ts', import.meta.url)));
  const comparisons = [];
  for (const [young, mature] of configurations) {
    const id = `${young}-${mature}`;
    const source = engine.replace(/youngInterval: \d+, matureInterval: \d+/, `youngInterval: ${young}, matureInterval: ${mature}`);
    if (!source.includes(`youngInterval: ${young}, matureInterval: ${mature}`)) throw Error('Candidate substitution failed');
    writeFileSync(join(root, `engine-${id}.ts`), source);
    writeFileSync(join(root, `benchmark-${id}.ts`), benchmark.replace('../src/v3Game.ts', `./engine-${id}.ts`).replace('../src/v3World.ts', './v3World.ts'));
    const e = await import(pathToFileURL(join(root, `engine-${id}.ts`)).href);
    const b = await import(pathToFileURL(join(root, `benchmark-${id}.ts`)).href);
    const runs = [];
    for (const policy of b.policies) for (const seed of [1, 31, 93, 200, 987]) for (const reaction of [1, 3]) {
      const s: V3State = b.runPolicy(policy, seed, reaction);
      const firstRecon = s.purchases.find(p => p.action === 'recon');
      let beforeRecon = null;
      if (firstRecon) {
        let replay = e.startV3(e.newV3(seed));
        for (const p of s.purchases) {
          replay = e.advanceV3(replay, p.at - replay.time);
          if (p.action === 'recon') break;
          replay = e.buyV3(replay, p.action);
        }
        beforeRecon = {at: replay.time, ...occupation(replay), outstandingRepairs: replay.jobs.filter((j: any) => j.type === 'repair').length};
      }
      runs.push({policy, seed, reaction, result: s.result, minCash: s.metrics.minCash, ...occupation(s), beforeRecon});
    }
    const summaries = b.policies.map((policy: string) => {
      const group = runs.filter(r => r.policy === policy);
      return {policy, wins: group.filter(r => r.result).length, medianTime: median(group.map(r => r.result?.at ?? 900)), medianIdlePercent: median(group.map(r => r.idlePercent)), medianMaintenance: median(group.map(r => r.maintenanceSeconds)), minCash: Math.min(...group.map(r => r.minCash))};
    });
    const capacities = [1, 31, 93, 200, 987].flatMap(seed => ([1, 3] as const).flatMap(tier => [false, true].map(burst => b.capacity(seed, tier, burst))));
    const plus = capacities.filter(c => c.recon === 3);
    const capacitySummary = {plusUptimeMin: Math.min(...plus.map(c => c.uptimePercent)), plusUptimeMax: Math.max(...plus.map(c => c.uptimePercent)), burstClearMax: Math.max(...plus.filter(c => c.burst).map(c => c.burstClearedAt ?? 600)), nominalDemand: 12 / mature, serviceCapacity: 3 / 4, worstIntervalDemand: 12 / (mature * .85)};
    comparisons.push({young, mature, summaries, runs, capacities, capacitySummary});
    console.log(`Candidate ${id}`); console.table(summaries); console.log(capacitySummary);
  }
  writeFileSync('docs/analysis/v3-maintenance-comparison.json', JSON.stringify({date: '2026-10-20', varied: ['youngInterval', 'matureInterval'], openingFailure: 22, comparisons}, null, 2) + '\n');
} finally {rmSync(root, {recursive: true, force: true});}
