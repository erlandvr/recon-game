import { repository } from './organization.ts';
import {useEffect,useRef,useState,type Ref} from 'react';
import type { Action, GameState } from './game.ts';
import { automationCost, autoRepairReason, autoRepairStatus, automationReason, automationStatus, repairDuration, repositoryRepairQuote, scanCost, scanDuration, scanReason, slots } from './game.ts';
import { AUTO_REPAIR_COST, kindOf, serviceFindings, serviceHealth } from './campaign.ts';
import type { ServiceId } from './campaign.ts';

type Props = { state: GameState; serviceId: ServiceId; inspect: () => void; dispatch: (action: Action) => void; expanded: boolean; inspectRef?: Ref<HTMLButtonElement>; className?: string };

/** Summary inspection and paid actions are separate native buttons, never nested. */
export default function SystemNode({ state: s, serviceId: id, inspect, dispatch, expanded, inspectRef, className = '' }: Props) {
  const name = repository(s, id).name;
  const findings = serviceFindings(s, id);
  const known = findings.filter(f => f.known);
  const repairs = repositoryRepairQuote(s, id);
  const job = s.jobs.find(j => (j.serviceId ?? 'backend') === id);
  const warning = findings.filter(f => f.deadline).sort((a,b) => a.deadline! - b.deadline!)[0];
  const h = serviceHealth(s, id);
  const scanBlock = scanReason(s, id) ?? (!findings.some(f => !f.known) ? 'No undiscovered problems to scan.' : null);
  const repairBlock = !repairs.findings.length ? known.length ? 'Known findings are already running or queued.' : 'Scan to reveal a finding first.' : null;
  const full = s.jobs.length >= slots(s);
  const queuedScan = s.queue.some(j => j.type === 'scan' && j.serviceId === id);
  const scanJob = s.jobs.find(j => j.type === 'scan' && (j.serviceId ?? 'backend') === id);
  const automated = s.campaign?.automated.includes(id);
  const autoReason = automationReason(s, id);
  const repairsAutomated=s.campaign?.remediation.includes(id),repairAutoReason=autoRepairReason(s,id);
  const completed=s.findings.filter(f=>(f.serviceId??'backend')===id&&f.repairedAt!==null).length;
  const coverage=Number(!!automated)+Number(!!repairsAutomated);
  const previous=useRef({completed,coverage});
  const [feedback,setFeedback]=useState('');
  const feedbackTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{
    const message=coverage>previous.current.coverage?'Automation enabled':completed>previous.current.completed?'Repair complete':'';
    previous.current={completed,coverage};
    if(message){if(feedbackTimer.current)clearTimeout(feedbackTimer.current);setFeedback(message);feedbackTimer.current=setTimeout(()=>setFeedback(''),900);}
  },[completed,coverage]);
  useEffect(()=>()=>{if(feedbackTimer.current)clearTimeout(feedbackTimer.current);},[]);
  return <article data-feedback={feedback||undefined} className={`system-card node-${id} ${h < 100 ? 'degraded' : ''} ${className}`} aria-label={`${name} system`}>
    {feedback&&<span className="visually-hidden" role="status">{name}: {feedback}</span>}
    <div className="system-main"><button ref={inspectRef} className="system-inspect" aria-label={`Inspect ${name}`} aria-expanded={expanded} onClick={inspect}>
      <strong>{name}</strong><span>{h}% · {h === 100 ? 'Healthy' : 'Degraded'}</span>
      <small>{job ? `${job.type === 'scan' ? 'Scanning' : 'Repairing'} · ${job.endsAt - s.time}s` : `${known.length} known / ${findings.length} open`}</small>
      {warning && <small className="node-warning">{kindOf(warning)} · {warning.escalated ? 'overdue' : `${warning.deadline! - s.time}s`}</small>}
    </button>
    </div><div className="node-actions">
      <button aria-label={`Scan ${name}`} disabled={!!scanBlock} title={scanBlock ?? `Scan ${name} · ${scanCost(s)} credits · ${scanDuration(s)}s · one work slot`} onClick={() => dispatch({ type: 'scan', serviceId: id })}>{scanJob ? `Scanning ${scanJob.endsAt - s.time}s` : queuedScan ? 'Queued' : full ? `Queue scan · ${scanCost(s)} cr` : `Scan · ${scanCost(s)} cr`}</button>
      <button aria-label={`Repair ${name}`} disabled={!!repairBlock} title={repairBlock ?? repairs.reason ?? `Repair ${repairs.findings.length} known findings · ${repairs.cost} credits · ${repairDuration(s)}s each. Overflow joins the queue.`} onClick={() => repairs.reason ? inspect() : dispatch({type:'repair-repository',serviceId:id})}>{repairs.findings.length > 1 ? `Repair all (${repairs.findings.length}) · ${repairs.cost} cr` : full && repairs.findings.length ? 'Queue repair · 15 cr' : 'Repair · 15 cr'}</button>
    </div>
    {s.campaign && <div className="node-automation"><div className="automation-control">
      {automated ? <div className="automation-state" aria-label={`${name} automation`}><strong>✓ Auto-scans</strong><span>{automationStatus(s, id)}</span></div> : <button aria-label={`Automate ${name} scans for ${automationCost(s)} credits`} disabled={!!autoReason} title={autoReason ?? undefined} onClick={() => dispatch({type:'automate', serviceId:id})}><strong>Automate scans</strong><span>{automationCost(s)} cr once</span></button>}
    </div></div>}
    {s.campaign&&<div className="repair-automation">{repairsAutomated?<div className="repair-auto-state" aria-label={`${name} automatic repairs`}><strong>✓ Auto repairs</strong><span>{autoRepairStatus(s,id)}</span></div>:<button aria-label={`Automate ${name} repairs for ${AUTO_REPAIR_COST} credits`} disabled={!!repairAutoReason} title={repairAutoReason??'Repairs known findings automatically for 15 credits each, preserving a 20-credit reserve.'} onClick={()=>dispatch({type:'auto-repair',serviceId:id})}>Auto repairs · {AUTO_REPAIR_COST} cr</button>}</div>}
  </article>;
}
