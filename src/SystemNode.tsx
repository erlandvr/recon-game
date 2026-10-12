import { SPEED } from './speedRules.ts';
import { repository } from './organization.ts';
import {useEffect,useRef,useState,type Ref} from 'react';
import type { Action, GameState } from './game.ts';
import { automationCost, autoRepairCost, autoRepairReason, autoRepairStatus, automationReason, automationStatus, repairDuration, repositoryRepairQuote, scanCost, scanDuration, scanReason, slots } from './game.ts';
import { kindOf, serviceFindings, serviceHealth } from './campaign.ts';
import type { ServiceId } from './campaign.ts';

type Props = { state: GameState; serviceId: ServiceId; dispatch: (action: Action) => void; nodeRef?: Ref<HTMLElement>; className?: string };

/** System status is read-only; paid actions live directly on the map. */
export default function SystemNode({ state: s, serviceId: id, dispatch, nodeRef, className = '' }: Props) {
  const name = repository(s, id).name;
  const findings = serviceFindings(s, id);
  const known = findings.filter(f => f.known);
  const repairs = repositoryRepairQuote(s, id);
  const job = s.jobs.find(j => (j.serviceId ?? 'backend') === id);
  const warning = findings.filter(f => f.deadline).sort((a,b) => a.deadline! - b.deadline!)[0];
  const h = serviceHealth(s, id);
  const scanBlock = scanReason(s, id) ?? (!findings.some(f => !f.known) ? 'No undiscovered problems to scan.' : null);
  const repairBlock = repairs.reason;
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
    const message=coverage>previous.current.coverage?'Automation enabled':completed>previous.current.completed?'Fix complete':'';
    previous.current={completed,coverage};
    if(message){if(feedbackTimer.current)clearTimeout(feedbackTimer.current);setFeedback(message);feedbackTimer.current=setTimeout(()=>setFeedback(''),900);}
  },[completed,coverage]);
  useEffect(()=>()=>{if(feedbackTimer.current)clearTimeout(feedbackTimer.current);},[]);
  return <article ref={nodeRef} tabIndex={-1} data-feedback={feedback||undefined} className={`system-card node-${id} ${h < 100 ? 'degraded' : ''} ${coverage===2?'fully-automated':''} ${className}`} aria-label={`${name} system`}>
    {feedback&&<span className="visually-hidden" role="status">{name}: {feedback}</span>}
    <div className="system-main"><div className="system-inspect">
      <strong>{name}</strong><span>{h}% · {h === 100 ? 'Healthy' : 'Degraded'}</span>
      <small>{job ? `${job.type === 'scan' ? 'Scanning' : 'Fixing'} · ${job.endsAt - s.time}s` : `${known.length} known / ${findings.length} open`}</small>
      {warning && <small className="node-warning">{kindOf(warning)} · {warning.escalated ? 'overdue' : `${warning.deadline! - s.time}s`}</small>}
    </div>
    </div><div className="node-actions">
      <button aria-label={`Scan ${name}`} disabled={!!scanBlock} title={scanBlock ?? `Scan ${name} · ${scanCost(s)} credits · ${scanDuration(s)}s · one work slot`} onClick={() => dispatch({ type: 'scan', serviceId: id })}>{scanJob ? `Scanning ${scanJob.endsAt - s.time}s` : queuedScan ? 'Queued' : full ? `Queue scan · ${scanCost(s)} cr` : `Scan · ${scanCost(s)} cr`}</button>
      <button aria-label={`Fix ${name}`} disabled={!!repairBlock || !!repairs.reason} title={repairBlock ?? repairs.reason ?? `Fix ${repairs.findings.length} known findings · ${repairs.cost} credits · ${repairDuration(s)}s each. Earliest deadlines first. ${repairs.remaining ? `${repairs.remaining} findings wait for more credits. ` : ''}Overflow joins the queue.`} onClick={() => dispatch({type:'repair-repository',serviceId:id})}>{repairs.remaining && repairs.findings.length ? `Fix ${repairs.findings.length}/${repairs.total} · ${repairs.cost} cr` : repairs.findings.length > 1 ? `Fix all (${repairs.findings.length}) · ${repairs.cost} cr` : full && repairs.findings.length ? 'Queue fix · 15 cr' : 'Fix · 15 cr'}</button>
    </div>
    {s.campaign && <div className="node-automation"><div className="automation-control">
      {automated ? <div className="automation-state" aria-label={`${name} automation`}><strong className={coverage===2?'automation-badge':undefined}>{coverage===2?'✓ Automated':'✓ Auto-scans'}</strong><span>{automationStatus(s, id)}</span></div> : <button aria-label={`Automate ${name} scans for ${automationCost(s)} credits`} disabled={!!autoReason} title={autoReason ?? undefined} onClick={() => dispatch({type:'automate', serviceId:id})}><strong>Automate scans</strong><span>{s.speed&&s.time<SPEED.automationAt?'Unlocks at 02:00':`${automationCost(s)} cr once`}</span></button>}
    </div></div>}
    {s.campaign&&<div className="repair-automation">{repairsAutomated?<div className="repair-auto-state" aria-label={`${name} automatic fixes`}><strong>✓ Auto fixes</strong><span>{autoRepairStatus(s,id)}</span></div>:<button aria-label={`Automate ${name} fixes for ${autoRepairCost(s)} credits`} disabled={!!repairAutoReason} title={repairAutoReason??'Fixes known findings automatically for 15 credits each, preserving a 20-credit reserve.'} onClick={()=>dispatch({type:'auto-repair',serviceId:id})}>{s.speed&&s.time<SPEED.automationAt?'Auto fixes · 02:00':`Auto fixes · ${autoRepairCost(s)} cr`}</button>}</div>}
  </article>;
}
