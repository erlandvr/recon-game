import {V3, purchaseInfo, type Purchase, type V3State} from './v3Game.ts';
import {SYSTEM_NAMES} from './v3World.ts';
export type Hint = {id: string; title: string; text: string; target?: Purchase; system?: number; duration: number};
export function guidanceCandidates(s: V3State): Hint[] {
  if (!['running', 'paused'].includes(s.status) || s.cash < 0) return [];
  const hints: Hint[] = [], last = s.purchases.at(-1);
  const urgent = s.jobs.find(j => j.priority === 'p1');
  if (urgent && s.status === 'running') hints.push({id: 'p1', title: `P1 · ${SYSTEM_NAMES[urgent.system]} is on fire`, text: urgent.owner === 'recon' ? 'Recon is handling the emergency. Developers can keep building.' : urgent.owner === null ? 'All developers are handling P1s. This emergency is next in line.' : 'A developer responds immediately. Paused work keeps its progress and resumes after the repair.', system: urgent.system, duration: 8});
  // Once the first builder is occupied, recommend capacity before another system order.
  if (s.status === 'running' && s.developers.length === 1 && s.jobs.some(j => j.type === 'build') && !purchaseInfo(s, 'developer').reason) hints.push({id: 'hire', title: 'Hire another developer', text: 'Your developer is busy building. Another can take separate work: 55 cr to hire, then 0.35 cr/s in wages.', target: 'developer', duration: 7});
  if (last && s.time - last.at < 4.5) {
    const copy = {
      system: ['System ordered · −45 cr', 'Paid once. Your developer assembles, carries and installs it; queued jobs wait their turn.'],
      developer: ['Developer hired · −55 cr', 'More builders. More wages: an extra 0.35 cr/s, even while travelling or repairing.'],
      recon: [`Recon installed · −${V3.reconCost} cr`, 'One repair bay takes over maintenance. Developers resume available work; their wages continue.'],
      plus: [`Recon Plus installed · −${V3.plusCost} cr`, 'All three bays can repair at once. Watch the system names inside Recon.'],
    }[last.action];
    hints.push({id: `purchase-${s.purchases.length}`, title: copy[0], text: copy[1], target: last.action === 'system' ? undefined : last.action, duration: 4.5});
  }
  if (s.status === 'paused') return hints;
  const broken = s.systems.find(n => n.broken && !s.jobs.some(j => j.system === n.id && j.priority === 'p1'));
  if (broken) {
    const job = s.jobs.find(j => j.type === 'repair' && j.system === broken.id);
    hints.push({id: 'failure', title: `${SYSTEM_NAMES[broken.id]} is broken · no income`, text: job?.owner === 'recon' ? 'Recon is repairing it automatically. The other systems keep earning.' : job?.owner === null ? 'Repair is queued. Developers finish their current job first; no clicking needed.' : 'A developer has left building to repair it. Repairs happen automatically.', system: broken.id, duration: 7});
  }
  if (!last && !s.metrics.failures && !purchaseInfo(s, 'system').reason) hints.push({id: 'first', title: 'Build a system', text: s.time < 5 ? 'The cube crate buys your next income source.' : 'Choose the cube crate below. A developer builds it, then it earns 3 cr/s. Hiring or saving is allowed too.', target: 'system', duration: Infinity});
  if (s.metrics.failures && !s.recon && !purchaseInfo(s, 'recon').reason) hints.push({id: 'recon', title: 'Let Recon handle maintenance', text: 'One repair bay frees developers for building. Buy it below, or keep saving towards the cash target.', target: 'recon', duration: 8});
  if (s.recon === 1 && s.jobs.filter(j => j.type === 'repair').length >= 2 && !purchaseInfo(s, 'plus').reason) hints.push({id: 'plus', title: 'Repairs are lining up', text: 'Plus opens all three repair bays. It costs cash now and lets more systems earn sooner.', target: 'plus', duration: 7});
  if (s.metrics.featuresTaken) hints.push({id: 'features', title: 'Free to build new features', text: 'Developers collect blue cards and build at their desks. Each completion adds 0.25 cr/s to a random system. Builds and repairs pause feature work.', duration: 8});
  return hints;
}
export function selectGuidance(s: V3State, shown: Record<string, number>): Hint | null {
  return guidanceCandidates(s).find(h => shown[h.id] === undefined || s.time - shown[h.id] < h.duration) ?? null;
}
