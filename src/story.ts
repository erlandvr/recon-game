import { activeServices, serviceOf, type ServiceId } from './campaign.ts';
import { RULES, health, autonomyStatus, healthyEnough, income, levelProgress, openFindings, scanCost, UPGRADES, type GameState } from './game.ts';
import { repository } from './organization.ts';

export const CHAPTERS = [
  { title: 'The first team', beat: 'Your team builds the backend. Designers sketch the product.', story: 'One startup. One backend. You’re the Recon operator keeping it healthy while the team prepares its first demo.', unlock: 'Start a company' },
  { title: 'The summit demo', beat: 'The demo won investors. New teams are joining.', story: 'The demo won over investors. New teams are adding a frontend and shared sign-in. More connections mean more ways for trouble to spread—keep the release on track.', unlock: `Earn ${RULES.resultAt/60} healthy minutes` },
  { title: 'Teams of teams', beat: 'The release is live. Teams now own whole modules.', story: 'The release is live. Teams are building whole modules, and repositories are joining fast. Scan and fix across a module to stay ahead of the backlog.', unlock: 'Earn 6 more healthy minutes' },
  { title: 'A growing company', beat: 'Projects multiply. Build an operation that scales with them.', story: '25 repositories—and counting. Maintenance work and compliance deadlines compete for your attention. Build an operation that can handle 100.', unlock: `25 repositories + ≥${RULES.healthyThreshold}% health` },
  { title: 'The handover', beat: '100 repositories. Let the company run without your clicks.', story: '100 repositories. One final test. Automate scans and fixes across the company, then prove the ecosystem can stay healthy and fund its own upkeep.', unlock: `100 repositories + ≥${RULES.healthyThreshold}% health` },
  { title: 'Full autonomy', beat: 'Your team can build what comes next. Recon handles the routine.', story: 'Mission complete. Recon handles routine scans and fixes across 100 repositories. You kept the company running—now the team can build what comes next.', unlock: 'Complete the autonomy trial' },
] as const;

/** Story follows earned game state, including restart and debug jumps. No second clock. */
export function chapterIndex(s: GameState): number {
  if (s.campaign?.autonomy.victory) return 5;
  if (!s.campaign) return 0;
  if (!s.campaign.result) return 1;
  return s.campaign.handoverAt != null ? 4 : s.campaign.companyAt != null ? 3 : 2;
}
export function chapterBeat(s: GameState): string {
  if (!s.campaign && s.stage === 2) return 'The demo gains search and reports. Your first users are watching.';
  if (!s.campaign && s.stage === 3) return 'The summit is close. Prove the backend is ready.';
  return CHAPTERS[chapterIndex(s)].beat;
}
export function chapterGoal(s: GameState): string {
  const progress = levelProgress(s);
  if (progress.goal) {
    const left = Math.ceil(progress.goal - progress.elapsed);
    return `${left}s healthy time → ${s.campaign ? 'company release + module actions' : 'new teams + automation'}. ${healthyEnough(s) ? `Health ≥${RULES.healthyThreshold}% earns progress.` : `Below ${RULES.healthyThreshold}%: progress held; ecosystem live.`}`;
  }
  const a = autonomyStatus(s);
  if (a.victory) return 'Victory earned. Keep playing; your company stays live.';
  const chapter=chapterIndex(s);
  if(chapter<4) {
    const target=chapter===2?25:100, count=s.campaign!.repositoryCount;
    const repos=count>=target?`${target} repos reached`:`${count}/${target} repos`;
    return `${repos} · Health ${health(s)}% / ${RULES.healthyThreshold}% needed${count>=target&&!healthyEnough(s)?' · Chapter held':''}`;
  }
  return `Autonomy ${Math.min(60,a.elapsed)}/60s · Scans ${a.scans}/100 · Fixes ${a.repairs}/100`;
}
export type NextMove = { title: string; detail: string; target?: ServiceId; coverage?: boolean; destination?: 'investments' | 'autonomy'; action?: string };
export function nextMove(s: GameState): NextMove {
  const autonomy = autonomyStatus(s);
  if (autonomy.victory) return { title: 'Victory · Your company runs itself.', detail: 'The trial is complete. You can keep playing.', destination: 'autonomy', action: 'View victory' };
  // Do not coach players into manual work that would reset a fully covered trial.
  if (autonomy.scans === 100 && autonomy.repairs === 100) return { title: autonomy.reason ?? 'Let automation prove itself.', detail: autonomy.reason ?? 'Leave routine work to Recon for 60 continuous seconds. Purchases are allowed.', destination: 'autonomy', action: 'View trial' };
  const work = [...s.jobs, ...s.queue];
  const pending = openFindings(s).filter(f => !work.some(j => j.findingId === f.id)).sort((a,b) => (a.deadline ?? Infinity)-(b.deadline ?? Infinity) || a.bornAt-b.bornAt);
  const known = pending.find(f => f.known && !s.campaign?.remediation.includes(serviceOf(f)));
  const hidden = pending.find(f => !f.known && !s.campaign?.automated.includes(serviceOf(f)) && !work.some(j => j.type === 'scan' && (j.serviceId ?? 'backend') === serviceOf(f)));
  const finding = known ?? hidden;
  if (finding) {
    const target = serviceOf(finding), name = repository(s, target).name;
    const cost = finding.known ? 15 : scanCost(s);
    const eta = Math.ceil(Math.max(0,cost-s.credits)/income(s));
    return { title: `${!healthyEnough(s)&&chapterIndex(s)<4 ? 'Progress on hold · ' : !s.firstRepairDone&&!finding.known&&!s.campaign ? 'First problem detected · ' : ''}${finding.known ? 'Fix' : 'Scan'} ${name}.`, target, action: `Find ${name}`, detail: eta ? `Income is still running. About ${eta}s to afford ${finding.known?'one fix':'a scan'} (${cost} cr).` : finding.known ? `${finding.deadline ? 'Deadline finding: ' : ''}fix restores health. One fix costs 15 cr; Fix shows the affordable count and price.` : 'Symptoms are visible. A scan reveals their cause; fixes restore health.' };
  }
  if (work.length || pending.length) return { title: 'Work is underway. Your team is on it.', detail: `${s.jobs.length} running · ${s.queue.length} queued. Fixes restore health on completion; income keeps arriving. ${s.queue.length && s.workSlots<5 ? 'Another work slot costs 150 cr and helps clear overlapping work.' : 'Use the gap to compare speed, capacity and scan savings below the map.'}`, destination:'investments', action:'Plan investment' };
  const uncovered = s.campaign && activeServices(s).find(id => !s.campaign!.automated.includes(id) || !s.campaign!.remediation.includes(id));
  if (uncovered) return {title:'Hand over routine work, one system at a time.', detail:'Automatic scans reveal findings; automatic fixes resolve them. Buy each separately on the system.', target:uncovered, coverage:true, action:`Find ${repository(s,uncovered).name}`};
  const reserve = scanCost(s)+15;
  const upgrade = !s.upgrades.remediation ? UPGRADES.remediation : !s.upgrades.scanning ? UPGRADES.scanning : null;
  return {title: !s.firstRepairDone ? 'Prepare your first demo.' : 'Caught up. Prepare for the next release.', detail: upgrade ? `Keep ${reserve} cr for a scan and fix. ${upgrade.name} costs ${upgrade.cost} cr${s.credits < upgrade.cost+reserve ? `; about ${Math.ceil((upgrade.cost+reserve-s.credits)/income(s))}s to buy with that reserve` : ' and is affordable with that reserve'}. Efficiency reduces scan cost, not fix time.` : `Keep ${reserve} cr for a scan and fix. Extra slots help when work overlaps; efficiency pays back through repeated scans.`, destination:'investments', action:'Plan investment'};
}
