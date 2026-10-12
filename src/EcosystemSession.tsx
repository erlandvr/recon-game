import IncomeMetric from './IncomeMetric.tsx';
import HealthMetric from './HealthMetric.tsx';
import StoryGuide from './StoryGuide.tsx';
import { repository } from './organization.ts';
import { useEffect, useRef, useState } from 'react';
import SystemNode from './SystemNode.tsx';
import Brand from './Brand.tsx';
import ProgressClock from './ProgressClock.tsx';
import Investments from './Investments.tsx';
import CorporateOverview from './CorporateOverview.tsx';
import type { WorkspaceProps } from './Workspace.tsx';
import { autonomyStatus, formatTime, formatCredits, levelProgress, slots, RULES, upgradeReason } from './game.ts';
import { activeServices } from './campaign.ts';
import type { ServiceId } from './campaign.ts';

export default function EcosystemSession({ state: s, completion, dispatch, speed, onToggleSpeed, onRestart, onLog, onResults, onStory, onAutonomy, onLogo, onDebug, debugEnabled, soundEnabled, onToggleSound }: WorkspaceProps) {
  const c = s.campaign!;
  const [view, setView] = useState<'ecosystem' | 'capacity'>('ecosystem');
  const [focusRequest, setFocusRequest] = useState<{id:ServiceId} | null>(null);
  const nodeRefs = useRef<Partial<Record<ServiceId, HTMLElement | null>>>({});
  const systems = activeServices(s);
  const elapsed = s.time - c.startedAt;
  const corporate = !!c.result;
  const autonomy=autonomyStatus(s);
  const remaining = Math.max(0, 360 - levelProgress(s).elapsed);
  const forecast = elapsed < 30 ? `New systems in ${30-elapsed}s` : elapsed < 60 ? `Identity security review in ${60-elapsed}s` : elapsed < 120 ? `Retention review in ${120-elapsed}s` : elapsed < 180 ? `Shared-access review in ${180-elapsed}s` : elapsed < 300 ? `Final release in ${300-elapsed}s` : remaining ? `Earn ${Math.ceil(remaining)} more healthy seconds` : 'Ecosystem growing';
  function locate(id: ServiceId) { setView('ecosystem'); setFocusRequest({id}); nodeRefs.current[id]?.focus(); }
  useEffect(() => { if(focusRequest) nodeRefs.current[focusRequest.id]?.focus(); }, [focusRequest]);

  return <>
    <a className="skip-link" href="#main">Skip to game</a>
    <header className="masthead"><Brand subtitle="Keep the ecosystem alive." onClick={onLogo} /><div className="global-controls"><span className="prototype-tag">Complete first session · v0.2</span><button aria-label="Restart operation" onClick={onRestart}>↻</button></div></header>
    <main id="main">
      <dl className="operation-strip"><ProgressClock state={s} completion={completion} speed={speed} onToggle={onToggleSpeed} /><div><dt>Available credits</dt><dd data-credits={s.credits} title={`${s.credits.toFixed(1)} credits`}>{formatCredits(s.credits)}<small> cr</small></dd></div><HealthMetric state={s} /><IncomeMetric state={s} /><div><dt>Work slots</dt><dd>{s.jobs.length}<small> / {slots(s)} busy</small></dd></div></dl>
      <div className="compact-switch" aria-label="Game views"><button aria-pressed={view==='ecosystem'} onClick={()=>setView('ecosystem')}>Ecosystem</button><button aria-pressed={view==='capacity'} onClick={()=>setView('capacity')}>Work slots</button></div>
      <div className="game-layout map-layout session-layout" data-view={view}>
        <div className="world-column map-world">
          <StoryGuide state={s} completion={completion} inspect={locate} locate={locate} onStory={onStory} onAutonomy={onAutonomy} />
          <section className={`ecosystem map-ecosystem session-ecosystem ${corporate ? 'corporate-ecosystem' : ''}`} aria-labelledby="ecosystem-title">
            <div className="section-heading"><div><h2 id="ecosystem-title">Your ecosystem</h2><p>{systems.length} connected systems</p></div><span className="stage-label">{autonomy.victory?'Autonomous':corporate?'Corporate':elapsed>=300?'Release':'Expansion'}</span></div>

            {corporate ? <CorporateOverview focusRequest={focusRequest} state={s} dispatch={dispatch} registerNode={(id,node) => {nodeRefs.current[id]=node;}} /> : <>
            <div className={`session-network ${c.connected?'connected':''}`} aria-label="Connected ecosystem map">
              {c.connected&&<svg className="dependency-lines" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z"/></marker></defs><path d="M300 75L140 190M300 75L460 190" markerEnd="url(#arrow)"/></svg>}
              {(['backend', 'auth', 'frontend'] as ServiceId[]).filter(id => systems.includes(id)).map(id => <SystemNode key={id} state={s} serviceId={id} nodeRef={el => { nodeRefs.current[id] = el; }} dispatch={dispatch} />)}
              {!c.connected&&<span className="connection-preview">Frontend + Identity<br/>connecting in {30-elapsed}s</span>}
            </div>
            <div className="condition-line"><span>Identity → Backend + Frontend</span><span>{c.connected?'Shared health impact: up to −20':'Prepare capacity'}</span></div>
            <div className="growth"><span>{forecast}</span><strong>{elapsed>=300?`${c.finalIds.filter(id=>s.findings.find(f=>f.id===id)?.repairedAt!==null).length}/3 release findings resolved`:'Healthy income: up to 4.8 cr/s'}</strong></div>
            </>}

          </section>
          <Investments state={s} dispatch={dispatch} />
        </div>
        <aside className="control-column capacity-column" aria-label="Work capacity">
          <div className="section-heading"><h2>Work slots</h2><span className="stage-label">{s.jobs.length} / {slots(s)} busy</span></div>
          <p className="capacity-intro">Manual and automatic jobs share these slots.</p><div className="slot-list" data-count={slots(s)}>{Array.from({length:slots(s)},(_,index)=>{const j=s.jobs[index];return <button className={`work-slot ${j?'occupied':''}`} key={index} aria-label={j?`Inspect work slot ${index+1}`:`Assign work slot ${index+1}`} onClick={()=>locate(j?.serviceId??'backend')}><div><span>Slot {index+1}</span><strong>{j?'Active':'Available'}</strong></div><h3>{j?`${j.type==='scan'?'Scan':'Fix'} · ${repository(s, j.serviceId??'backend').name}`:'+ Assign work'}</h3>{j?<><div className="job-track"><i style={{width:`${(s.time-j.startedAt)/(j.endsAt-j.startedAt)*100}%`}}/></div><small>{j.endsAt-s.time}s left · {j.automated?'automatic':'manual'}</small></>:<small>Choose a system on the map to start work.</small>}</button>;})}</div><div className="queue-summary" aria-label="Queued actions" title="Actions are paid when queued and start in order as slots open."><span>Queue</span><strong aria-live="polite">{s.queue.length}</strong><small>Starts as slots free up</small></div><div className="add-slot"><button aria-label="Invest 150 credits" disabled={!!upgradeReason(s,'capacity')} onClick={()=>dispatch({type:'upgrade',upgrade:'capacity'})}>{slots(s)>=RULES.maxSlots?'✓ Maximum · 5 work slots':'+ Add work slot · 150 cr'}</button><p>{upgradeReason(s,'capacity')??`${slots(s)} → ${slots(s)+1} work slots. Maximum 5.`}</p></div><p className="session-help">Security: exposure escalates at its deadline. Compliance: overdue obligations reduce health. Fix manually or enable automatic fixes per repository. Scans discover; fixes restore health.</p>
        </aside>
      </div>
      <div className="event-ticker"><time>{formatTime(s.events[s.events.length-1].at)}</time><span>{s.events[s.events.length-1].text}</span><button onClick={onLog}>View log</button></div>
    </main>
    <footer><span>Ecosystem live</span><div className="footer-controls"><button aria-label="Chapter sound" aria-pressed={soundEnabled} onClick={onToggleSound}>Sound {soundEnabled?'on':'off'}</button><button onClick={onAutonomy}>{autonomy.victory?'Victory':'Autonomy'}</button>{debugEnabled && <button onClick={onDebug}>Debug</button>}{s.results && <button onClick={onResults}>Milestones</button>}</div></footer>
  </>;
}
