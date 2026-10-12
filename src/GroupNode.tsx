import {useEffect,useRef} from 'react';
import {scopeQuote,fullyAutomated,type Action,type GameState} from './game.ts';
import {serviceFindings,serviceHealth} from './campaign.ts';
import {scopeRepositories,type Scope} from './organization.ts';
import {SPEED} from './speedRules.ts';

type Props={state:GameState;scope:Scope;name:string;dispatch:(action:Action)=>void;onExplore:()=>void;onClose:()=>void};
/** Bundled actions live on the group they affect, like repository controls. */
export default function GroupNode({state:s,scope,name,dispatch,onExplore,onClose}:Props){
 const card=useRef<HTMLElement>(null);
 useEffect(()=>{card.current?.focus({preventScroll:true});},[scope.id,scope.level]);
 const ids=scopeRepositories(s,scope),findings=ids.flatMap(id=>serviceFindings(s,id));
 const average=Math.round(ids.reduce((sum,id)=>sum+serviceHealth(s,id),0)/Math.max(1,ids.length));
 const automated=fullyAutomated(s,ids),locked=!!s.speed&&s.time<SPEED.automationAt;
 const scans=ids.filter(id=>s.campaign?.automated.includes(id)).length,fixes=ids.filter(id=>s.campaign?.remediation.includes(id)).length;
 function action(operation:'scan'|'repair'|'automate'|'auto-repair'){
  const q=scopeQuote(s,scope,operation),label=operation==='scan'?'Scan':operation==='repair'?'Fix':operation==='automate'?'Auto-scans':'Auto-fixes';
  return <button aria-label={`${label} ${scope.level} ${name}`} disabled={!!q.reason} title={q.reason??`${q.actions.length} actions in ${name}. Ordinary costs and shared work slots.`} onClick={()=>dispatch({type:'scope',scope,operation})}><strong>{label} {q.actions.length}</strong><span>{locked&&(operation==='automate'||operation==='auto-repair')?'Unlocks at 02:00':`${q.cost} cr`}</span></button>;
 }
 return <article ref={card} tabIndex={-1} className={`system-card group-card ${average<100?'degraded':''} ${automated?'fully-automated':''}`} aria-label={`${name} ${scope.level} actions`}>
  <div className="system-main"><div className="system-inspect"><strong>{name}</strong><span>{average}% · {ids.length} repos</span><small>{findings.filter(f=>f.known).length} known / {findings.length} open</small></div><div className="group-navigation"><button onClick={onExplore}>{scope.level==='module'?'View repos':'View modules'}</button><button onClick={onClose}>Close</button></div></div>
  <div className="node-actions">{action('scan')}{action('repair')}</div>
  <div className="node-automation"><div className="automation-control">{scans===ids.length?<div className="automation-state"><strong className={automated?'automation-badge':undefined}>✓ {automated?'Automated':'Auto-scans'}</strong><span>{scans}/{ids.length} repos covered</span></div>:action('automate')}</div></div>
  <div className="repair-automation">{fixes===ids.length?<div className="repair-auto-state"><strong>✓ Auto fixes</strong><span>{fixes}/{ids.length} repos covered</span></div>:action('auto-repair')}</div>
 </article>;
}
