import {purchaseInfo, type Purchase, type V3State} from './v3Game.ts';
import {SYSTEM_NAMES} from './v3World.ts';
export type Hint = {id: string; title: string; text: string; target?: Purchase; system?: number; worker?: number; bench?: number; focus?: 'income' | 'recon' | 'backlog'; duration: number};
export type GuidanceProgress = {at: number; running: boolean; active: string | null; viewed: Record<string, number>; dismissed: string[]; hidden: boolean};
export function newGuidance(): GuidanceProgress {return {at: 0, running: false, active: null, viewed: {}, dismissed: [], hidden: false};}
function available(h: Hint, p: GuidanceProgress) {return !p.dismissed.includes(h.id) && (p.viewed[h.id] ?? 0) + 1e-8 < h.duration;}
export function purchaseReceipt(s: V3State, action: Purchase): string | null {
  const purchase = s.purchases.filter(p => p.action === action).at(-1);
  if (!purchase || s.time - purchase.at >= 4.5) return null;
  const price = purchaseInfo(s, action).price;
  return {system: `Ordered · −${price} cr`, developer: `Hired · −${price} cr`, recon: `Installed · −${price} cr`, plus: `Upgraded · −${price} cr`}[action];
}
export function guidanceCandidates(s: V3State, p: GuidanceProgress = newGuidance()): Hint[] {
  if (s.status !== 'running' || s.cash < 0) return [];
  const hints: Hint[] = [], first = s.systems[1];
  const urgent = s.jobs.find(j => j.priority === 'p1');
  if (urgent) hints.push({id: 'p1', title: `P1 · ${SYSTEM_NAMES[urgent.system]} is on fire`, text: urgent.owner === 'recon' ? 'Recon is handling the emergency. Developers can take other work.' : urgent.owner === null ? 'All developers are handling P1s. This emergency is next in line.' : 'A developer responds immediately. Paused work keeps its progress and resumes after the repair.', system: urgent.system, duration: 8});
  if (s.firstReconRepair) {
    const job = s.jobs.find(j => j.owner === 'recon');
    hints.push({id: 'recon-repair', title: job ? 'Recon is handling repairs' : 'Recon has handled its first repair', text: 'Automated repairs leave developers available for other work. Their wages continue.', focus: 'recon', duration: 7});
  }
  if (s.metrics.failures) {
    const broken = s.systems.find(n => n.broken);
    const job = broken && s.jobs.find(j => j.type === 'repair' && j.system === broken.id);
    hints.push({id: 'failure', title: broken ? `${SYSTEM_NAMES[broken.id]} is broken · no income` : 'Repair complete · income restored', text: !broken ? 'The failed system stopped earning. Repairs happen automatically; no clicking needed.' : job?.owner === 'recon' ? 'Recon is repairing it automatically. The other systems keep earning.' : job?.owner === null ? 'Repair is queued. Developers finish their current job first; no clicking needed.' : 'A developer is busy repairing this system instead of building. Repairs happen automatically.', system: broken?.id, duration: 7});
  }
  if (first && !first.installed) {
    const job = s.jobs.find(j => j.type === 'build' && j.system === first.id);
    const worker = typeof job?.owner === 'number' ? s.developers[job.owner] : undefined;
    const building = worker?.job === job?.id && !job?.suspended;
    const delivery = building && ['delivery', 'install'].includes(worker!.phase);
    hints.push({id: 'build', title: !building ? 'System ordered · waiting its turn' : delivery ? 'Your system is on its way' : 'Your developer is building', text: !building ? 'Your order is paid. It will continue when a developer is available.' : delivery ? 'Follow your developer to the installation. This system earns after it is connected.' : 'One developer assembles this system, then carries it into place.', bench: building && !delivery ? worker?.id : undefined, worker: delivery ? worker?.id : undefined, system: !building ? first.id : undefined, duration: Infinity});
  }
  if (first?.installed) hints.push({id: 'installed', title: 'System installed', text: first.broken ? 'This system is installed, but currently broken. Its income returns after repair.' : 'It earns 3 credits per second while working. Your net earnings also include wages and other systems.', system: (p.viewed.installed ?? 0) < 2 - 1e-8 || first.broken ? first.id : undefined, focus: (p.viewed.installed ?? 0) >= 2 - 1e-8 && !first.broken ? 'income' : undefined, duration: 4});
  if (first?.installed && s.developers.length === 1 && s.developers[0].phase !== 'idle' && s.jobs.some(j => j.type === 'build' && j.owner === null) && !purchaseInfo(s, 'developer').reason) hints.push({id: 'hire', title: 'Work is waiting', text: 'Another developer can take a separate job: 55 cr to hire, then 0.35 cr/s in wages.', target: 'developer', duration: Infinity});
  if (s.metrics.failures && !s.recon && !purchaseInfo(s, 'recon').reason) hints.push({id: 'recon', title: 'Let Recon handle maintenance', text: 'One repair bay frees developers for building. Buy it below, or keep saving towards the cash target.', target: 'recon', duration: Infinity});
  if (s.recon === 1 && s.jobs.filter(j => j.type === 'repair').length >= 2 && !purchaseInfo(s, 'plus').reason) hints.push({id: 'plus', title: 'Repairs are lining up', text: 'Plus opens all three repair bays. It costs cash now and lets more systems earn sooner.', target: 'plus', duration: Infinity});
  if (!first && !purchaseInfo(s, 'system').reason) hints.push({id: 'first', title: 'Build a system', text: s.time < 5 ? 'Your developer installs it, then it earns income.' : 'Choose the cube crate below. Hiring or saving is allowed too.', target: 'system', duration: Infinity});
  if (s.metrics.features) hints.push({id: 'features', title: 'A new feature is complete', text: 'Blue cards become features at a developer’s desk. Each completion adds 0.25 cr/s to a system while it works. Builds and repairs come first.', focus: 'backlog', duration: 8});
  return hints;
}
export function selectGuidance(s: V3State, p: GuidanceProgress = newGuidance()): Hint | null {
  return p.hidden ? null : guidanceCandidates(s, p).find(h => available(h, p)) ?? null;
}
/** Count only exposure of the active lesson, not time spent behind another lesson or a held run. */
export function advanceGuidance(s: V3State, previous: GuidanceProgress): GuidanceProgress {
  if (s.status === 'ready' || s.time < previous.at) return newGuidance();
  const p = {...previous, at: s.time, running: s.status === 'running', viewed: {...previous.viewed}};
  if (previous.active && previous.running && !previous.hidden) p.viewed[previous.active] = (p.viewed[previous.active] ?? 0) + Math.max(0, s.time - previous.at);
  p.active = selectGuidance(s, p)?.id ?? null;
  return p;
}
export function dismissGuidance(s: V3State, p: GuidanceProgress): GuidanceProgress {
  const hint = selectGuidance(s, p);
  return hint ? {...p, active: null, dismissed: [...p.dismissed, hint.id]} : p;
}
