import { SPEED, SPEED_EFFICIENCY, SPEED_MEDALS, SPEED_BEATS, type SpeedState } from './speedRules.ts';
import { medalForTime } from './medals.ts';
import { createOrganization, createSpeedOrganization, repository, scopeRepositories, CORPORATE, type Organization, type Scope } from './organization.ts';
import { activeServices, AUTOMATION_COST, AUTO_REPAIR_COST, AUTONOMY_SECONDS, newAutonomy, kindOf, serviceHealth, serviceOf, startCampaign } from './campaign.ts';
import type { Campaign, ServiceId, FindingKind } from './campaign.ts';
/** Deterministic, half-second simulation. No browser or React dependencies. */
export const RULES = {
  startingCredits: 40, scanCost: 5, repairCost: 15, maxSlots: 5,
  tickSeconds: 0.5, scanSeconds: 3, repairSeconds: 5, firstBugAt: 15,
  growthAt: [60, 120], resultAt: 120, healthImpact: 20,
  healthFloor: 20, incomePerSecond: 2, healthyThreshold: 80, baseIncomeShare: 0.75, failureIncomeMultiplier: 0.75,
} as const;

export const UPGRADES = {
  capacity: { name: 'Parallel work', cost: 150, before: '1 work slot', after: '+1 work slot', description: 'Add one shared work slot, up to five in total.' },
  scanning: { name: 'Faster scans', cost: 110, before: '3 seconds', after: '1.5 seconds', description: 'Spend less time discovering what needs attention.' },
  remediation: { name: 'Faster fixes', cost: 130, before: '5 seconds', after: '2.5 seconds', description: 'Restore income sooner and free up your work slot.' },
} as const;
export const EFFICIENCY = [
  { cost: 20, scanCost: 4, setupMultiplier:1 }, { cost: 100, scanCost: 3, setupMultiplier:.95 }, { cost: 500, scanCost: 2, setupMultiplier:.8 },
  { cost: 2500, scanCost: 1, setupMultiplier:.5 }, { cost: 6000, scanCost: 0.25, setupMultiplier:.15 },
] as const;
export const efficiencyTiers = (s:GameState) => s.speed ? SPEED_EFFICIENCY : EFFICIENCY;
export const autoRepairCost = (s:GameState) => s.speed ? SPEED.fixSetup : AUTO_REPAIR_COST;
export const autonomyTarget = (s:GameState) => s.speed ? SPEED.repositories : 100;
export const autonomySeconds = (s:GameState) => s.speed ? SPEED.trialSeconds : AUTONOMY_SECONDS;
export const scanCost = (s: GameState) => s.efficiency ? efficiencyTiers(s)[s.efficiency - 1].scanCost : RULES.scanCost;
export const automationCost = (s: GameState) => Math.round((s.speed?SPEED.scanSetup:AUTOMATION_COST)*(s.efficiency?efficiencyTiers(s)[s.efficiency-1].setupMultiplier:1)*100)/100;
export function efficiencyQuote(s: GameState) {
  const next = efficiencyTiers(s)[s.efficiency];
  return next ? { ...next, automationCost:Math.round((s.speed?SPEED.scanSetup:AUTOMATION_COST)*next.setupMultiplier*100)/100, tier: s.efficiency + 1, payback: Math.ceil(next.cost / (scanCost(s) - next.scanCost)), reason: s.credits < next.cost ? `Need ${next.cost} credits.` : null } : null;
}
export const upgradeCost = (s:GameState,upgrade:Upgrade) => s.speed ? {capacity:100,scanning:70,remediation:90}[upgrade] : UPGRADES[upgrade].cost;
export type Upgrade = keyof typeof UPGRADES;
export type Finding = { id: number; title: string; description: string; bornAt: number; known: boolean; repairedAt: number | null; serviceId?: ServiceId; kind?: FindingKind; deadline?: number; escalated?: boolean };
export type Job = { id: number; type: 'scan' | 'repair'; startedAt: number; endsAt: number; findingId: number | null; capturedIds: number[]; revision: number; serviceId?: ServiceId; automated?: boolean };
export type QueuedAction = { id: number; type: 'scan' | 'repair'; serviceId: ServiceId; findingId: number | null; queuedAt: number };
export type GameEvent = { id: number; at: number; text: string; kind: 'info' | 'warning' | 'success' };
export type Stats = { scans: number; repairs: number; earned: number; spent: { scans: number; repairs: number; upgrades: number }; healthSum: number };
export type Summary = { workSlots?: number; at: number; healthyTime: number; efficiency: number; credits: number; health: number; stage: number; upgrades: Upgrade[]; stats: Stats };
export type GameState = {
  speed?: SpeedState; organization: Organization; practice: boolean; workSlots: number; campaign?: Campaign; time: number; healthyTime: number; efficiency: number; credits: number; stage: number; queue: QueuedAction[];
  firstRepairDone: boolean; nextBugAt: number | null; findings: Finding[]; jobs: Job[];
  upgrades: Record<Upgrade, boolean>; lastScanAt: number | null; scanRevision: number | null;
  revision: number; stats: Stats; events: GameEvent[]; sequence: number;
  results: Summary | null;
};
export type Action = { type: 'repair-repository'; serviceId: ServiceId } | { type: 'efficiency' } | { type: 'scan'; serviceId?: ServiceId } | { type: 'automate'; serviceId: ServiceId } | { type: 'auto-repair'; serviceId: ServiceId } | { type: 'repair'; findingId: number } | { type: 'upgrade'; upgrade: Upgrade } | { type: 'scope'; scope: Scope; operation: 'scan' | 'repair' | 'automate' | 'auto-repair' };
export type ActionResult = { state: GameState; message: string; ok: boolean };

const BUGS = [
  ['Requests getting stuck', 'A request handler leaves connections open. Each unresolved finding costs 20 health points.'],
  ['Cache serving old data', 'New development broke cache refreshes. The service is running, but some responses are outdated.'],
  ['Slow background tasks', 'A background task repeats work unnecessarily and consumes service capacity.'],
  ['Missed notifications', 'A new release drops some notification jobs before delivery.'],
  ['Retries piling up', 'Failed requests retry too often, putting extra pressure on the backend.'],
  ['Incomplete search results', 'An index update skips records, so users cannot find all their data.'],
  ['Reports timing out', 'A report query became slower as the application grew.'],
  ['Uploads failing', 'A new upload path rejects otherwise valid files.'],
];
export const openFindings = (s: GameState) => s.findings.filter(f => f.repairedAt === null);
export const knownFindings = (s: GameState) => openFindings(s).filter(f => f.known);
export const averageHealth = (s: GameState) => activeServices(s).reduce((n, id) => n + serviceHealth(s, id), 0) / activeServices(s).length;
export const health = (s: GameState) => Math.round(averageHealth(s) * 10) / 10;
export const healthyEnough = (s: GameState) => averageHealth(s) >= RULES.healthyThreshold;
export function levelProgress(s: GameState) {
  const c = s.campaign;
  return c?.result ? { name: 'Corporate operation', elapsed: s.healthyTime-c.result.healthyTime, goal: null }
    : c ? { name: 'Ecosystem expansion', elapsed: s.healthyTime-c.healthyStartedAt, goal: 360 }
    : { name: 'First backend', elapsed: s.healthyTime, goal: RULES.resultAt };
}
export const income = (s: GameState) => Math.round(activeServices(s).reduce((n, id) => n + repository(s, id).baseIncome, 0) * (RULES.baseIncomeShare + (1-RULES.baseIncomeShare) * averageHealth(s)/100) * (healthyEnough(s) ? 1 : RULES.failureIncomeMultiplier) * 100) / 100;
export const slots = (s: GameState) => s.workSlots;
export const scanDuration = (s: GameState) => s.upgrades.scanning ? 1.5 : RULES.scanSeconds;
export const repairDuration = (s: GameState) => s.upgrades.remediation ? 2.5 : RULES.repairSeconds;
export const bugInterval = (stage: number) => stage === 3 ? 20 : stage === 2 ? 22.5 : 30;
export const scanStale = (s: GameState) => s.scanRevision !== null && s.scanRevision < s.revision;
export const formatCredits = (credits: number) => credits >= 10000 ? `${(credits / 1000).toFixed(1)}k` : credits.toFixed(1);
export const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
const round = (n: number) => Math.round(n * 100) / 100;
const copy = (s: GameState): GameState => structuredClone(s);
function log(s: GameState, text: string, kind: GameEvent['kind'] = 'info') {
  s.events.push({ id: ++s.sequence, at: s.time, text, kind });
  s.events = s.events.slice(-80);
}
export function newGame(seed = 1): GameState {
  return {
    organization: createOrganization(seed), practice: false, workSlots: 1, time: 0, healthyTime: 0, efficiency: 0, credits: RULES.startingCredits, stage: 1, queue: [],
    firstRepairDone: false, nextBugAt: RULES.firstBugAt, findings: [], jobs: [],
    upgrades: { capacity: false, scanning: false, remediation: false },
    lastScanAt: null, scanRevision: null, revision: 0,
    stats: { scans: 0, repairs: 0, earned: 0, spent: { scans: 0, repairs: 0, upgrades: 0 }, healthSum: 0 },
    events: [{ id: 1, at: 0, text: 'Backend online. Development is underway. Your ecosystem is growing.', kind: 'info' }],
    sequence: 1, results: null,
  };
}
export function scanReason(s: GameState, serviceId: ServiceId = 'backend'): string | null {
  if (!activeServices(s).includes(serviceId)) return 'This system is not connected yet.';
  return ([...s.jobs, ...s.queue].some(j => j.type === 'scan' && (j.serviceId ?? 'backend') === serviceId) ? 'A scan is already running or queued.' : s.credits < scanCost(s) ? `You need ${scanCost(s)} credits. Income will replenish your budget.` : null);
}
export function repairReason(s: GameState, id: number): string | null {
  const f = s.findings.find(item => item.id === id);
  if (!f || !f.known || f.repairedAt !== null) return 'Choose an unresolved finding revealed by a scan.';
  if ([...s.jobs, ...s.queue].some(j => j.findingId === id)) return 'This finding is already being fixed or queued.';
  return (s.credits < RULES.repairCost ? 'You need 15 credits. Income will replenish your budget.' : null);
}
export function upgradeReason(s: GameState, upgrade: Upgrade): string | null {
  if (upgrade === 'capacity' ? slots(s) >= RULES.maxSlots : s.upgrades[upgrade]) return upgrade === 'capacity' ? 'Maximum capacity: 5 work slots.' : 'Installed';
  if (s.credits < upgradeCost(s,upgrade)) return `Save ${Math.ceil(upgradeCost(s,upgrade) - s.credits)} more credits.`;
  return null;
}
export function automationReason(s: GameState, id: ServiceId): string | null {
  if (!s.campaign) return `Automation unlocks after ${RULES.resultAt/60} healthy minutes.`;
  if (!activeServices(s).includes(id)) return 'This system is not connected yet.';
  if (s.campaign.automated.includes(id)) return 'Scans already automated.';
  return s.credits < automationCost(s) ? `Need ${Math.ceil(automationCost(s) - s.credits)} more credits.` : null;
}
export function automationStatus(s: GameState, id: ServiceId): string {
  if (s.jobs.some(j => j.serviceId === id && j.automated && j.type === 'scan')) return 'Scanning';
  const hidden = openFindings(s).some(f => serviceOf(f) === id && !f.known);
  if (s.queue.some(j => j.serviceId === id) || s.jobs.some(j => j.serviceId === id && !j.automated)) return 'Manual work first';
  if (!hidden) return knownFindings(s).some(f => serviceOf(f) === id) ? s.campaign?.remediation.includes(id) ? 'Awaiting fixes' : 'Fix findings' : 'Watching';
  if (s.credits < 20 + scanCost(s)) return 'Waiting for credits';
  if (s.queue.length || s.jobs.length >= slots(s)) return 'Waiting for slot';
  if (s.campaign && s.time < (s.campaign.nextScan[id] ?? 0)) return 'Next scan soon';
  return 'Ready';
}
/** Coverage, not current health: every connected member needs both automations. */
export function fullyAutomated(s: GameState, ids: readonly ServiceId[]): boolean {
  return ids.length > 0 && ids.every(id => !!s.campaign?.automated.includes(id) && s.campaign.remediation.includes(id));
}
export function autoRepairReason(s:GameState,id:ServiceId):string|null {
  if(!s.campaign)return 'Automatic fixes unlock with ecosystem expansion.';
  if(!activeServices(s).includes(id))return 'This system is not connected yet.';
  if(s.campaign.remediation.includes(id))return 'Fixes already automated.';
  return s.credits<autoRepairCost(s)?`Need ${autoRepairCost(s)} credits to automate fixes.`:null;
}
export function autoRepairStatus(s:GameState,id:ServiceId) {
  if(s.jobs.some(j=>j.automated&&j.type==='repair'&&j.serviceId===id))return 'Fixing';
  const findings=knownFindings(s).filter(f=>serviceOf(f)===id&&!s.jobs.some(j=>j.findingId===f.id)&&!s.queue.some(j=>j.findingId===f.id));
  if(!findings.length)return serviceFindingsForAutomation(s,id)?'Needs scan':'Watching';
  if(s.queue.length)return 'Manual work first';
  if(s.credits<20+RULES.repairCost)return 'Waiting for credits';
  if(s.jobs.length>=slots(s))return 'Waiting for slot';
  return 'Ready';
}
const serviceFindingsForAutomation=(s:GameState,id:ServiceId)=>openFindings(s).some(f=>serviceOf(f)===id&&!f.known);
export function autonomyStatus(s:GameState) {
  const c=s.campaign,active=activeServices(s);
  const scans=active.filter(id=>c?.automated.includes(id)).length,repairs=active.filter(id=>c?.remediation.includes(id)).length;
  const target=autonomyTarget(s);
  const reason=active.length<target?`Grow to ${target} repositories.` : scans<target||repairs<target?'Enable scans and fixes for every repository.'
    : s.queue.length||s.jobs.some(j=>!j.automated)?'Wait for manual work to finish.'
    : averageHealth(s)<90?'Restore average health to 90%.'
    : active.some(id=>serviceHealth(s,id)<60)?'Restore every repository to at least 60% health.'
    : openFindings(s).some(f=>f.deadline!==undefined&&f.deadline<=s.time)?'Resolve overdue findings.'
    : s.credits<35?'Rebuild the 35-credit operating reserve.' : null;
  const covered=active.filter(id=>c?.automated.includes(id)&&c?.remediation.includes(id)).length;
  return {scans,repairs,covered,reason,elapsed:c?.autonomy.elapsed??0,victory:c?.autonomy.victory??null};
}
function resetAutonomy(s:GameState,reason:string){
 const c=s.campaign!;if(c.autonomy.victory)return;
 const previous=c.autonomy;
 const lastReset=previous.startedAt!==null?{at:s.time,reason}:previous.lastReset;
 c.autonomy={...newAutonomy(),lastReset};
 if(previous.startedAt!==null)log(s,`Autonomy trial reset: ${reason}`,'warning');
}
function tickAutonomy(s:GameState,eligibleBefore:boolean) {
  const c=s.campaign;if(!c||c.autonomy.victory)return;
  const reason=autonomyStatus(s).reason;
  if(reason){resetAutonomy(s,reason);return;}
  const a=c.autonomy;
  if(a.startedAt===null){a.startedAt=s.time;a.earnedStart=s.stats.earned;a.spentStart=s.stats.spent.scans+s.stats.spent.repairs;a.scansStart=c.autoScans;a.repairsStart=c.autoRepairs;return;}
  if(!eligibleBefore)return;
  a.elapsed+=RULES.tickSeconds;
  if(a.elapsed<autonomySeconds(s))return;
  const netIncome=round(s.stats.earned-a.earnedStart-(s.stats.spent.scans+s.stats.spent.repairs-a.spentStart));
  if(netIncome<0){resetAutonomy(s,'Operating costs exceeded income.');return;}
  if(c.autoScans===a.scansStart||c.autoRepairs===a.repairsStart)return;
  a.victory={at:s.time,medal:s.speed?(SPEED_MEDALS.find(m=>s.time<=m.through)?.id??null):medalForTime(s.time),practice:s.practice,duration:a.elapsed,health:health(s),credits:s.credits,autoScans:c.autoScans-a.scansStart,autoRepairs:c.autoRepairs-a.repairsStart,netIncome};
  log(s,`Full autonomy achieved! All ${autonomyTarget(s)} repositories are maintained by automatic scans and fixes.`,'success');
}
export function scopeQuote(s: GameState, scope: Scope, operation: 'scan' | 'repair' | 'automate' | 'auto-repair') {
  const ids = scopeRepositories(s, scope).filter(id => activeServices(s).includes(id));
  const actions: Action[] = operation === 'scan'
    ? ids.filter(id => openFindings(s).some(f => serviceOf(f) === id && !f.known) && ![...s.jobs, ...s.queue].some(j => j.type === 'scan' && (j.serviceId ?? 'backend') === id)).map(serviceId => ({type:'scan',serviceId}))
    : operation === 'repair'
    ? knownFindings(s).filter(f => ids.includes(serviceOf(f)) && ![...s.jobs, ...s.queue].some(j => j.findingId === f.id)).sort((a,b)=>(a.deadline ?? Infinity)-(b.deadline ?? Infinity) || a.bornAt-b.bornAt).map(f => ({type:'repair',findingId:f.id}))
    : ids.filter(id => !(operation==='automate'?s.campaign?.automated:s.campaign?.remediation)?.includes(id)).map(serviceId => ({type:operation==='automate'?'automate':'auto-repair',serviceId}));
  const cost = actions.length * (operation === 'scan' ? scanCost(s) : operation === 'repair' ? RULES.repairCost : operation === 'automate' ? automationCost(s) : autoRepairCost(s));
  const reason = !s.campaign?.result ? 'Group actions unlock after the release milestone.' : !actions.length ? 'No eligible work in this scope.' : s.credits < cost ? `Need ${cost} credits for ${actions.length} actions.` : null;
  return {actions, cost, reason};
}
/** Unsubmitted findings retain their order; submitted work moves to the end in submission order. */
export function orderedRepairFindings(s: GameState, findings: Finding[]) {
  const orders = new Map([...s.jobs, ...s.queue].filter(j => j.findingId !== null).map(j => [j.findingId, j.id]));
  return [...findings].sort((a,b) => (orders.get(a.id) ?? -1) - (orders.get(b.id) ?? -1));
}
export function repositoryRepairQuote(s: GameState, serviceId: ServiceId) {
  const eligible = knownFindings(s).filter(f => serviceOf(f) === serviceId && ![...s.jobs, ...s.queue].some(j => j.findingId === f.id))
    .sort((a,b) => (a.deadline ?? Infinity) - (b.deadline ?? Infinity) || a.bornAt - b.bornAt || a.id - b.id);
  const findings = eligible.slice(0, Math.max(0, Math.floor(s.credits / RULES.repairCost)));
  const cost = findings.length * RULES.repairCost;
  const reason = !activeServices(s).includes(serviceId) ? 'This system is not connected yet.' : !eligible.length ? 'No known findings awaiting a fix.' : !findings.length ? 'You need 15 credits to fix a finding. Income will replenish your budget.' : null;
  return {findings, cost, reason, total:eligible.length, remaining:eligible.length-findings.length};
}
export function act(state: GameState, action: Action, automated = false): ActionResult {
  if(state.speed?.result&&!state.speed.continuing)return {state,ok:false,message:'Run complete. Try again or continue practising.'};
  if (action.type === 'repair-repository') {
    const quote = repositoryRepairQuote(state, action.serviceId);
    if (quote.reason) return {state, ok:false, message:quote.reason};
    let s = state;
    for (const finding of quote.findings) {
      const next = act(s, {type:'repair', findingId:finding.id});
      if (!next.ok) return {state, ok:false, message:next.message};
      s = next.state;
    }
    const message = `${repository(s, action.serviceId).name}: ${quote.findings.length} fixes submitted. ${quote.cost} credits paid; overflow joins the queue.`;
    log(s, message); return {state:s, ok:true, message};
  }
  if (action.type === 'scope') {
    const quote = scopeQuote(state, action.scope, action.operation);
    if (quote.reason) return {state, ok:false, message:quote.reason};
    let s = state;
    for (const item of quote.actions) {
      const next = act(s, item); if (!next.ok) return {state,ok:false,message:next.message}; s = next.state;
    }
    const message = `${quote.actions.length} ${action.operation === 'auto-repair' ? 'repositories automated for fixes' : action.operation === 'automate' ? 'repositories automated for scans' : `${action.operation === 'repair' ? 'fix' : action.operation} actions submitted`}. ${quote.cost} credits paid. Existing coverage is never charged twice.`;
    log(s, message, 'success'); return {state:s,ok:true,message};
  }
  let reason: string | null = null;
  if (action.type === 'scan') reason = scanReason(state, action.serviceId);
  if (action.type === 'repair') reason = repairReason(state, action.findingId);
  if (action.type === 'upgrade') reason = upgradeReason(state, action.upgrade);
  if (action.type === 'auto-repair') reason = autoRepairReason(state, action.serviceId);
  if (action.type === 'automate') reason = automationReason(state, action.serviceId);
  if (action.type === 'efficiency') { const quote = efficiencyQuote(state); reason = quote ? quote.reason : 'Maximum scan efficiency installed.'; }
  if (reason) return { state, message: reason, ok: false };
  const s = copy(state);
  if(!automated&&(action.type==='scan'||action.type==='repair')&&s.campaign&&!s.campaign.autonomy.victory)resetAutonomy(s,'Manual work interrupted the trial.');
  let message = '';
  switch (action.type) {
    case 'efficiency': {
      const quote = efficiencyQuote(s)!;
      s.credits = round(s.credits - quote.cost); s.stats.spent.upgrades += quote.cost; s.efficiency++;
      message = `Scan efficiency ${s.efficiency}/${efficiencyTiers(s).length} installed. New scans cost ${scanCost(s)} credits; new automatic-scan setups cost ${automationCost(s)} credits per repository.`;
      log(s, message, 'success'); break;
    }
    case 'auto-repair': {
      s.credits=round(s.credits-autoRepairCost(s));s.stats.spent.upgrades+=autoRepairCost(s);s.campaign!.remediation.push(action.serviceId);
      message=`${repository(s,action.serviceId).name}: automatic fixes enabled. ${autoRepairCost(s)} credits paid; each fix costs 15 credits.`;log(s,message,'success');break;
    }
    case 'automate': {
      const cost=automationCost(s);
      s.credits = round(s.credits - cost); s.stats.spent.upgrades = round(s.stats.spent.upgrades+cost);
      s.campaign!.automated.push(action.serviceId);
      message = `${repository(s, action.serviceId).name} scans automated. ${cost} credits paid once. Scans cost ${scanCost(s)} credits. Automatic fixes are purchased separately.`;
      log(s, message, 'success'); break;
    }
    case 'scan': {
      s.credits = round(s.credits - scanCost(s)); s.stats.spent.scans = round(s.stats.spent.scans + scanCost(s));
      const queued = s.jobs.length >= slots(s);
      s.queue.push({ id: ++s.sequence, type: 'scan', serviceId: action.serviceId ?? 'backend', findingId: null, queuedAt: s.time });
      message = `${repository(s, action.serviceId ?? 'backend').name} scan ${queued ? 'queued' : 'started'}. ${scanCost(s)} credits paid.`;
      log(s, message); drainQueue(s); break;
    }
    case 'repair': {
      s.credits = round(s.credits - RULES.repairCost); s.stats.spent.repairs += RULES.repairCost;
      const queued = s.jobs.length >= slots(s);
      s.queue.push({ id: ++s.sequence, type: 'repair', serviceId: serviceOf(s.findings.find(f => f.id === action.findingId)!), findingId: action.findingId, queuedAt: s.time });
      message = `Fix ${queued ? 'queued' : 'started'}. 15 credits paid; health returns on completion.`;
      log(s, message); drainQueue(s); break;
    }
    case 'upgrade':
      s.credits = round(s.credits - upgradeCost(s,action.upgrade));
      s.stats.spent.upgrades += upgradeCost(s,action.upgrade);
      if (action.upgrade === 'capacity') s.workSlots = slots(s) + 1;
      s.upgrades[action.upgrade] = true;
      message = action.upgrade === 'capacity' ? `Work slot added: ${slots(s) - 1} → ${slots(s)} slots. Up to ${slots(s)} jobs can run together.` : `${UPGRADES[action.upgrade].name} installed: ${UPGRADES[action.upgrade].before} → ${UPGRADES[action.upgrade].after}.`;
      log(s, message, 'success'); drainQueue(s); break;
  }
  return { state: s, ok: true, message };
}
/** FIFO orders are prepaid; coverage and duration are determined when a slot opens. */
function drainQueue(s: GameState) {
  while (s.queue.length && s.jobs.length < slots(s)) {
    const order = s.queue.shift()!;
    const duration = order.type === 'scan' ? scanDuration(s) : repairDuration(s);
    s.jobs.push({ id: order.id, type: order.type, serviceId: order.serviceId, findingId: order.findingId, startedAt: s.time, endsAt: s.time + duration, revision: s.revision, capturedIds: order.type === 'scan' ? openFindings(s).filter(f => serviceOf(f) === order.serviceId).map(f => f.id) : [] });
    if (order.queuedAt < s.time) log(s, `Queued ${order.type} started on ${repository(s, order.serviceId).name}.`);
  }
}
function addBug(s: GameState, serviceId: ServiceId = 'backend', kind: FindingKind = 'bug', titleOverride?: string, deadline?: number) {
  const id = s.findings.length + 1;
  const [title, description] = BUGS[(id - 1) % BUGS.length];
  s.findings.push({ id, title: titleOverride ?? title, description: kind === 'security' ? 'Exposed access can escalate at the warned deadline; Identity incidents also affect dependent services.' : kind === 'compliance' ? 'A fictional data-retention obligation. Missing its deadline reduces this service’s health until resolved.' : description, bornAt: s.time, known: false, repairedAt: null, serviceId, kind, ...(deadline ? { deadline, escalated: false } : {}) });
  s.revision++;
  log(s, ` ${repository(s, serviceId).name}: ${kind === 'bug' ? 'development introduced a problem' : `${kind} warning; deadline ${formatTime(deadline!)}`}. Scan to discover its cause.`.trim(), 'warning');
}
function grow(s: GameState) {
  const dueStage = s.time >= RULES.growthAt[1] ? 3 : s.time >= RULES.growthAt[0] ? 2 : 1;
  if (dueStage > s.stage) {
    s.stage = dueStage; s.revision++;
    log(s, `Development stage ${s.stage}: more features, more pressure. New problems will be scheduled ${bugInterval(s.stage)} seconds apart.`, 'warning');
  }
}
export function summary(s: GameState): Summary {
  return { workSlots: slots(s), at: s.time, healthyTime: s.healthyTime, efficiency: s.efficiency, credits: s.credits, health: health(s), stage: s.stage, upgrades: (Object.keys(UPGRADES) as Upgrade[]).filter(key => s.upgrades[key]), stats: structuredClone(s.stats) };
}
/** Continuous half-second simulation; milestone snapshots never stop time. */
export function advance(state: GameState, seconds = 1): GameState {
  const steps = seconds / RULES.tickSeconds;
  if (!Number.isSafeInteger(steps) || seconds < 0) throw new Error('Advance requires nonnegative multiples of half a second.');
  if (seconds === 0) return state;
  const s = copy(state);
  for (let step = 0; step < steps; step++) {
    if(s.speed?.result&&!s.speed.continuing)break;
    const eligibleBefore=!!s.campaign&&autonomyStatus(s).reason===null;
    const currentHealth = health(s);
    const earned = round(income(s) * RULES.tickSeconds);
    s.credits = round(s.credits + earned); s.stats.earned = round(s.stats.earned + earned);
    s.stats.healthSum += currentHealth * RULES.tickSeconds;
    if (s.campaign) s.campaign.extraEarned = round(s.campaign.extraEarned + earned - round((RULES.baseIncomeShare + (1 - RULES.baseIncomeShare) * averageHealth(s) / 100) * (healthyEnough(s) ? 1 : RULES.failureIncomeMultiplier)));
    if (healthyEnough(s)) s.healthyTime += RULES.tickSeconds;
    s.time += RULES.tickSeconds;
    const completed = s.jobs.filter(j => j.endsAt <= s.time);
    s.jobs = s.jobs.filter(j => j.endsAt > s.time);
    for (const job of completed) {
      if (job.type === 'scan') {
        let discovered = 0;
        for (const f of s.findings) {
          if (job.capturedIds.includes(f.id) && f.repairedAt === null && !f.known) { f.known = true; discovered++; }
        }
        s.lastScanAt = job.startedAt; s.scanRevision = job.revision; s.stats.scans++;
        log(s, `Scan complete. ${discovered} new ${discovered === 1 ? 'finding' : 'findings'}; coverage ${formatTime(job.startedAt)}.${scanStale(s) ? ' Development has already made this coverage older.' : ''}`, 'success');
      } else {
        const f = s.findings.find(item => item.id === job.findingId);
        if (f && f.repairedAt === null) {
          f.repairedAt = s.time; s.stats.repairs++;
          if(job.automated&&s.campaign)s.campaign.autoRepairs++;
          s.firstRepairDone = true;
          log(s, `Fixed: ${f.title}. ${repository(s, serviceOf(f)).name} health is now ${serviceHealth(s, serviceOf(f))}%.`, 'success');
        }
      }
    }
    if(!s.speed)grow(s);
    if (s.nextBugAt !== null && s.time >= s.nextBugAt) {
      const systems = activeServices(s);
      addBug(s, systems[s.findings.length % systems.length]); s.nextBugAt = s.time + (s.speed ? (activeServices(s).length===1?22:activeServices(s).length<8?16:8) : s.campaign ? s.campaign.result ? Math.max(2.5, Math.round(150 / activeServices(s).length) / 2) : 25 : bugInterval(s.stage));
    }
    if (!s.speed && RULES.growthAt.some(t => s.time === t - 15)) {
      log(s, `Release forecast: development advances in 15 seconds. Prepare your capacity.`, 'info');
    }
    if (!s.speed && !s.results && s.healthyTime >= RULES.resultAt) {
      s.results = summary(s);
      log(s, `${RULES.resultAt/60} healthy minutes earned. Expansion begins; your ecosystem keeps running.`, 'success');
      startCampaign(s);
    }
    drainQueue(s);
    if(s.speed)speedTick(s);else campaignTick(s);
    // Evaluate after arrivals, escalation and repairs; earned chapters never regress.
    const c=s.campaign;
    if(!s.speed && c?.result && healthyEnough(s)) {
      if(c.repositoryCount>=25 && c.companyAt==null) {
        c.companyAt=s.time;
        log(s, `Chapter 3 complete: 25 repositories connected and ecosystem health at least ${RULES.healthyThreshold}%.`, 'success');
      }
      if(c.repositoryCount>=100 && c.handoverAt==null) {
        c.handoverAt=s.time;
        log(s, `Chapter 4 complete: 100 repositories connected and ecosystem health at least ${RULES.healthyThreshold}%.`, 'success');
      }
    }
    tickAutonomy(s,eligibleBefore);
    if(s.speed&&!s.speed.result&&s.campaign?.autonomy.victory){
      s.speed.result={at:s.time,won:true,covered:autonomyStatus(s).covered,health:health(s),modules:s.organization.modules.filter(m=>m.repositoryIds.every(id=>fullyAutomated(s,[id]))).length};
    }
  }
  return s;
}

/** Campaign events follow the continuous ecosystem timeline. */
function campaignTick(s: GameState) {
  const c = s.campaign; if (!c) return;
  const elapsed = s.time - c.startedAt;
  if (elapsed === 15) log(s, 'Release forecast: Frontend and shared Identity connect in 15 seconds. Identity supports both services.');
  if (elapsed === 30) { c.connected = true; c.repositoryCount = 3; log(s, 'Frontend and Identity connected. Identity health affects Backend and Frontend. Automate each system directly on the map.', 'success'); }
  if (elapsed === 60) addBug(s, 'auth', 'security', 'Exposed sign-in token', s.time + 45);
  if (elapsed === 120) addBug(s, 'frontend', 'compliance', 'Data-retention review', s.time + 60);
  if (elapsed === 180) addBug(s, 'auth', 'security', 'Shared access policy drift', s.time + 45);
  if (elapsed === 270) log(s, 'Final release in 30 seconds. Prepare to scan all three systems and resolve the release findings before the release milestone.', 'warning');
  if (elapsed === 300) {
    addBug(s, 'backend', 'bug', 'Release: stalled request queue');
    addBug(s, 'auth', 'security', 'Release: shared access exposure', s.time + 45);
    addBug(s, 'frontend', 'compliance', 'Release: retention obligation', s.time + 60);
    c.finalIds = s.findings.slice(-3).map(f => f.id);
    log(s, `Final release is live. Scan each system, resolve all three release findings and keep average health at least ${RULES.healthyThreshold}% to earn level progress.`, 'warning');
  }
  for (const f of openFindings(s)) {
    if (f.deadline && !f.escalated && s.time >= f.deadline) {
      f.escalated = true; c.missed++;
      log(s, `${repository(s, serviceOf(f)).name}: ${kindOf(f)} deadline missed. Scan and fix to recover${serviceOf(f) === 'auth' ? '; dependent services are affected' : ''}.`, 'warning');
    }
  }
  if (s.healthyTime - c.healthyStartedAt >= 360 && !c.result) {
    c.result = { at: s.time, healthyTime: s.healthyTime, health: health(s), total: c.finalIds.length, resolved: c.finalIds.filter(id => s.findings.find(f => f.id === id)?.repairedAt !== null).length, missed: c.missed, autoScans: c.autoScans };
    c.nextRepositoryAt = s.time + CORPORATE.repositoryInterval;
    log(s, 'Six healthy expansion minutes earned. Release milestone recorded. Corporate expansion begins: new repositories join every 6 seconds, up to 100. Explore their modules and projects.', 'success');
  }
  if (c.result && s.time >= c.nextRepositoryAt && c.repositoryCount < CORPORATE.maxRepositories) {
    const repo = s.organization.repositories[c.repositoryCount];
    c.repositoryCount++; c.nextRepositoryAt = s.time + CORPORATE.repositoryInterval;
    c.nextScan[repo.id] = s.time;
    addBug(s, repo.id);
    const module = s.organization.modules.find(m => m.id === repo.moduleId)!;
    log(s, `${repo.name} joined ${module.name}. ${c.repositoryCount}/100 repositories connected.`, 'info');
    if (c.repositoryCount === CORPORATE.maxRepositories) log(s, 'Corporate scale reached: 100 repositories. Growth in repository count is complete; development and maintenance continue.', 'success');
  }
  automationTick(s);
}
function automationTick(s:GameState){
  // Manual queue first; alternate discovery and resolution so neither can starve.
  for(let attempt=0;attempt<slots(s);attempt++){
    if(s.queue.length||s.jobs.length>=slots(s))break;
    const finding=s.credits>=20+RULES.repairCost?knownFindings(s).filter(f=>s.campaign!.remediation.includes(serviceOf(f))&&!repairReason(s,f.id)).sort((a,b)=>(a.deadline??Infinity)-(b.deadline??Infinity)||a.bornAt-b.bornAt)[0]:undefined;
    const target=s.credits>=20+scanCost(s)?s.campaign!.automated.filter(id=>s.time>=(s.campaign!.nextScan[id]??0)&&!scanReason(s,id)&&serviceFindingsForAutomation(s,id)).sort((a,b)=>(s.campaign!.nextScan[a]??0)-(s.campaign!.nextScan[b]??0))[0]:undefined;
    const repair=!!finding&&(!target||finding.deadline!==undefined||s.campaign!.nextAutomation==='repair');
    if(!repair&&!target)break;
    const next=act(s,repair?{type:'repair',findingId:finding!.id}:{type:'scan',serviceId:target!},true);
    if(!next.ok)break;
    Object.assign(s,next.state);s.jobs[s.jobs.length-1].automated=true;
    s.campaign!.nextAutomation=repair?'scan':'repair';
    if(!repair){s.campaign!.nextScan[target!]=s.time+15;s.campaign!.autoScans++;}
  }
}


export function newSpeedGame(seed=1):GameState {
  const s=newGame(seed);s.organization=createSpeedOrganization(seed);
  s.speed={phase:0,phaseAt:0,complianceAt:null,result:null,continuing:false,expansion:null};
  s.nextBugAt=22;addBug(s);return s;
}
export function continueSpeedPractice(state:GameState):GameState {
  if(!state.speed?.result||state.speed.continuing)return state;
  const s=copy(state);s.speed!.continuing=true;s.practice=true;return s;
}
function speedTick(s:GameState){
  const sprint=s.speed!;
  if(!s.campaign&&s.firstRepairDone){
    s.results=summary(s);startCampaign(s);s.campaign!.connected=true;
    s.campaign!.result={at:s.time,healthyTime:s.healthyTime,health:health(s),resolved:1,total:1,missed:0,autoScans:0};
    connectSpeedTeam(s,4,1);
  }
  const c=s.campaign;if(!c)return;
  if(!sprint.expansion&&sprint.phase===1&&c.automated.length>=2&&s.stats.repairs>=4){
    connectSpeedTeam(s,8,2);sprint.complianceAt=s.time+15;
    log(s,'Compliance review in 15 seconds. Be ready to scan Commerce.','warning');
  }
  if(!sprint.expansion&&sprint.phase===2&&fullyAutomated(s,s.organization.modules[0].repositoryIds))connectSpeedTeam(s,12,3);
  if(sprint.expansion&&s.time>=sprint.expansion.nextAt){
    const repo=s.organization.repositories[c.repositoryCount];c.repositoryCount++;
    if((c.repositoryCount-1)%2===1)addBug(s,repo.id);
    log(s,`${repo.name} connected. ${c.repositoryCount}/12 repositories online.`,'success');
    if(c.repositoryCount>=sprint.expansion.target)sprint.expansion=null;
    else sprint.expansion.nextAt=s.time+2.5;
  }
  if(sprint.complianceAt!==null&&s.time>=sprint.complianceAt){
    addBug(s,'repo-5','compliance','Customer data retention review',s.time+40);sprint.complianceAt=null;
  }
  for(const f of openFindings(s))if(f.deadline&&!f.escalated&&s.time>=f.deadline){f.escalated=true;c.missed++;log(s,'Compliance deadline missed. Fix the finding to recover.','warning');}
  automationTick(s);
}
function connectSpeedTeam(s:GameState,count:number,phase:1|2|3){
  s.speed!.phase=phase;s.speed!.phaseAt=s.time;
  s.speed!.expansion={target:count,nextAt:s.time+2.5};
  log(s,`${SPEED_BEATS[phase].title}. A new team is joining, one repository at a time.`,'success');
}
