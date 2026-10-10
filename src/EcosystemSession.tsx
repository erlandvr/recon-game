import IncomeMetric from './IncomeMetric.tsx';
import HealthMetric from './HealthMetric.tsx';
import StoryGuide from './StoryGuide.tsx';
import useRepairList from './useRepairList.ts';
import { repository } from './organization.ts';
import { useEffect, useRef, useState } from 'react';
import SystemNode from './SystemNode.tsx';
import Brand from './Brand.tsx';
import ProgressClock from './ProgressClock.tsx';
import Investments from './Investments.tsx';
import CorporateOverview from './CorporateOverview.tsx';
import type { WorkspaceProps } from './Workspace.tsx';
import type { Action } from './game.ts';
import { autonomyStatus, orderedRepairFindings, formatTime, formatCredits, repairDuration, repairReason, scanCost, levelProgress, scanDuration, scanReason, slots, RULES, upgradeReason } from './game.ts';
import { activeServices, kindOf, serviceFindings, serviceHealth } from './campaign.ts';
import type { ServiceId } from './campaign.ts';

export default function EcosystemSession({ state: s, completion, dispatch, speed, onToggleSpeed, onRestart, onLog, onResults, onStory, onAutonomy, onLogo, onDebug, debugEnabled, soundEnabled, onToggleSound }: WorkspaceProps) {
  const c = s.campaign!;
  const [context, setContext] = useState<ServiceId | null>(null);
  const [view, setView] = useState<'ecosystem' | 'capacity'>('ecosystem');
  const [focusRequest, setFocusRequest] = useState<{id:ServiceId} | null>(null);
  const contextRef = useRef<HTMLElement>(null);
  const repairFromList = useRepairList(s, contextRef, dispatch);
  const nodeRefs = useRef<Partial<Record<ServiceId, HTMLButtonElement | null>>>({});
  const systems = activeServices(s);
  const elapsed = s.time - c.startedAt;
  const corporate = !!c.result;
  const autonomy=autonomyStatus(s);
  const remaining = Math.max(0, 360 - levelProgress(s).elapsed);
  const visible = context ? serviceFindings(s, context) : [];
  const known = visible.filter(f => f.known);
  const forecast = elapsed < 30 ? `New systems in ${30-elapsed}s` : elapsed < 60 ? `Identity security review in ${60-elapsed}s` : elapsed < 120 ? `Retention review in ${120-elapsed}s` : elapsed < 180 ? `Shared-access review in ${180-elapsed}s` : elapsed < 300 ? `Final release in ${300-elapsed}s` : remaining ? `Earn ${Math.ceil(remaining)} more healthy seconds` : 'Ecosystem growing';
  useEffect(() => { if (context) contextRef.current?.querySelector<HTMLButtonElement>('button')?.focus(); }, [context]);
  useEffect(() => {
    if (!context) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !contextRef.current?.contains(event.target)) setContext(null);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [context]);
  function closeContext() { const id = context; setContext(null); if (id) nodeRefs.current[id]?.focus(); }
  function run(action: Action) { dispatch(action); if (action.type !== 'repair') setContext(null); }
  function locate(id: ServiceId) { setView('ecosystem'); setContext(null); setFocusRequest({id}); if(!corporate) nodeRefs.current[id]?.focus(); }
  function guidedInspect(id: ServiceId) { setFocusRequest({id}); inspect(id); }
  function inspect(id: ServiceId) { setView('ecosystem'); setContext(id); }

  return <>
    <a className="skip-link" href="#main">Skip to game</a>
    <header className="masthead"><Brand subtitle="Keep the ecosystem alive." onClick={onLogo} /><div className="global-controls"><span className="prototype-tag">Complete first session · v0.2</span><button aria-label="Restart operation" onClick={onRestart}>↻</button></div></header>
    <main id="main">
      <dl className="operation-strip"><ProgressClock state={s} completion={completion} speed={speed} onToggle={onToggleSpeed} /><div><dt>Available credits</dt><dd data-credits={s.credits} title={`${s.credits.toFixed(1)} credits`}>{formatCredits(s.credits)}<small> cr</small></dd></div><HealthMetric state={s} /><IncomeMetric state={s} /><div><dt>Work slots</dt><dd>{s.jobs.length}<small> / {slots(s)} busy</small></dd></div></dl>
      <div className="compact-switch" aria-label="Game views"><button aria-pressed={view==='ecosystem'} onClick={()=>setView('ecosystem')}>Ecosystem</button><button aria-pressed={view==='capacity'} onClick={()=>setView('capacity')}>Work slots</button></div>
      <div className="game-layout map-layout session-layout" data-view={view}>
        <div className="world-column map-world">
          <StoryGuide state={s} completion={completion} inspect={guidedInspect} locate={locate} onStory={onStory} onAutonomy={onAutonomy} />
          <section className={`ecosystem map-ecosystem session-ecosystem ${corporate ? 'corporate-ecosystem' : ''}`} aria-labelledby="ecosystem-title">
            <div className="section-heading"><div><h2 id="ecosystem-title">Your ecosystem</h2><p>{systems.length} connected systems</p></div><span className="stage-label">{autonomy.victory?'Autonomous':corporate?'Corporate':elapsed>=300?'Release':'Expansion'}</span></div>

            {corporate ? <CorporateOverview focusRequest={focusRequest} state={s} dispatch={dispatch} inspect={inspect} selected={context} onNavigate={() => setContext(null)} registerNode={(id,node) => {nodeRefs.current[id]=node;}} /> : <>
            <div className={`session-network ${c.connected?'connected':''}`} aria-label="Connected ecosystem map">
              {c.connected&&<svg className="dependency-lines" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs><path d="M300 75L140 190M300 75L460 190" markerEnd="url(#arrow)"/></svg>}
              {(['backend', 'auth', 'frontend'] as ServiceId[]).filter(id => systems.includes(id)).map(id => <SystemNode key={id} state={s} serviceId={id} inspectRef={el => { nodeRefs.current[id] = el; }} expanded={context === id} inspect={() => inspect(id)} dispatch={dispatch} />)}
              {!c.connected&&<span className="connection-preview">Frontend + Identity<br/>connecting in {30-elapsed}s</span>}
            </div>
            <div className="condition-line"><span>Identity → Backend + Frontend</span><span>{c.connected?'Shared health impact: up to −20':'Prepare capacity'}</span></div>
            <div className="growth"><span>{forecast}</span><strong>{elapsed>=300?`${c.finalIds.filter(id=>s.findings.find(f=>f.id===id)?.repairedAt!==null).length}/3 release findings resolved`:'Healthy income: up to 4.8 cr/s'}</strong></div>
            </>}
            {context&&<section ref={contextRef} className="system-actions" aria-label={`${repository(s, context).name} actions`} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeContext();}}}>
              <div className="system-actions-heading"><h2>{repository(s, context).name}</h2><button aria-label="Close system actions" onClick={closeContext}>×</button></div><p>{serviceHealth(s,context)}% health · {known.length} known findings</p>
              {repository(s,context).dependencies.some(id => systems.includes(id) && serviceHealth(s,id)<100) && <p className="warning-text">A shared dependency is degraded: {repository(s,context).dependencies.filter(id=>systems.includes(id)).map(id=>repository(s,id).name).join(', ')}. Repair upstream findings to recover.</p>}
              {visible.some(f=>!f.known)?<><button className="context-scan" disabled={!!scanReason(s,context)} onClick={()=>run({type:'scan',serviceId:context})}>{s.jobs.length >= slots(s) ? 'Queue scan' : 'Scan'} {repository(s, context).name}<span>{scanCost(s)} cr · {scanDuration(s)}s</span></button><small>{scanReason(s,context)??'Reveal problems present when this scan starts.'}</small></>:<p>No undiscovered local problems.</p>}
              <div className="context-findings">{orderedRepairFindings(s, known).map(f=>{const reason=repairReason(s,f.id);return <article key={f.id}><div><strong>{f.title}</strong><span>{kindOf(f)} · 15 cr · {repairDuration(s)}s</span>{f.deadline&&<span className="warning-text">{f.escalated?'Overdue · repair to recover':`Due ${formatTime(f.deadline)} · ${f.deadline-s.time}s left`}</span>}<small>{f.description}</small></div><button aria-label={`Repair finding ${f.id}`} disabled={!!reason} title={reason??'Repair this finding'} onClick={()=>repairFromList(f.id)}>{s.queue.some(j=>j.findingId===f.id)?'Queued':s.jobs.some(j=>j.findingId===f.id)?'Repairing':s.jobs.length>=slots(s)?'Queue repair':'Repair'}</button>{reason&&<small>{reason}</small>}</article>;})}</div>
              {!known.length&&<p className="context-empty">{visible.length?'Scan to reveal the cause.':'No known unresolved local findings.'}</p>}
            </section>}
          </section>
          <Investments state={s} dispatch={dispatch} />
        </div>
        <aside className="control-column capacity-column" aria-label="Work capacity">
          <div className="section-heading"><h2>Work slots</h2><span className="stage-label">{s.jobs.length} / {slots(s)} busy</span></div>
          <p className="capacity-intro">Manual and automatic jobs share these slots.</p><div className="slot-list" data-count={slots(s)}>{Array.from({length:slots(s)},(_,index)=>{const j=s.jobs[index];return <button className={`work-slot ${j?'occupied':''}`} key={index} aria-label={j?`Inspect work slot ${index+1}`:`Assign work slot ${index+1}`} onClick={()=>inspect(j?.serviceId??'backend')}><div><span>Slot {index+1}</span><strong>{j?'Active':'Available'}</strong></div><h3>{j?`${j.type==='scan'?'Scan':'Repair'} · ${repository(s, j.serviceId??'backend').name}`:'+ Assign work'}</h3>{j?<><div className="job-track"><i style={{width:`${(s.time-j.startedAt)/(j.endsAt-j.startedAt)*100}%`}}/></div><small>{j.endsAt-s.time}s left · {j.automated?'automatic':'manual'}</small></>:<small>Choose a system on the map to start work.</small>}</button>;})}</div><div className="queue-summary" aria-label="Queued actions" title="Actions are paid when queued and start in order as slots open."><span>Queue</span><strong aria-live="polite">{s.queue.length}</strong><small>Starts as slots free up</small></div><div className="add-slot"><button aria-label="Invest 150 credits" disabled={!!upgradeReason(s,'capacity')} onClick={()=>dispatch({type:'upgrade',upgrade:'capacity'})}>{slots(s)>=RULES.maxSlots?'✓ Maximum · 5 work slots':'+ Add work slot · 150 cr'}</button><p>{upgradeReason(s,'capacity')??`${slots(s)} → ${slots(s)+1} work slots. Maximum 5.`}</p></div><p className="session-help">Security: exposure escalates at its deadline. Compliance: overdue obligations reduce health. Repair manually or enable automatic repairs per repository. Scans discover; repairs restore health.</p>
        </aside>
      </div>
      <div className="event-ticker"><time>{formatTime(s.events[s.events.length-1].at)}</time><span>{s.events[s.events.length-1].text}</span><button onClick={onLog}>View log</button></div>
    </main>
    <footer><span>Ecosystem live</span><div className="footer-controls"><button aria-label="Chapter sound" aria-pressed={soundEnabled} onClick={onToggleSound}>Sound {soundEnabled?'on':'off'}</button><button onClick={onAutonomy}>{autonomy.victory?'Victory':'Autonomy'}</button>{debugEnabled && <button onClick={onDebug}>Debug</button>}{s.results && <button onClick={onResults}>Milestones</button>}</div></footer>
  </>;
}
