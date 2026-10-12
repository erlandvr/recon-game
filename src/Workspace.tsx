import type { ChapterCompletion } from './chapterCompletion.ts';
import IncomeMetric from './IncomeMetric.tsx';
import HealthMetric from './HealthMetric.tsx';
import StoryGuide from './StoryGuide.tsx';
import { useRef, useState } from 'react';
import SystemNode from './SystemNode.tsx';
import Brand from './Brand.tsx';
import ProgressClock from './ProgressClock.tsx';
import Investments from './Investments.tsx';
import type { GameState, Action } from './game.ts';
import { bugInterval, formatTime, formatCredits, health, knownFindings, openFindings, RULES, scanStale, slots, upgradeReason } from './game.ts';

export type WorkspaceProps = {
  state: GameState; completion?: ChapterCompletion | null; dispatch: (action: Action) => void;
  soundEnabled: boolean; onToggleSound: () => void;
  speed: 1 | 2; onToggleSpeed: () => void;
  onRestart: () => void; onLogo: () => void; onDebug: () => void; debugEnabled: boolean;
  onStory: () => void; onLog: () => void; onResults: () => void; onAutonomy: () => void;
};

export default function Workspace({ state: s, completion, dispatch, speed, onToggleSpeed, onRestart, onLog, onResults, onStory, onAutonomy, onLogo, onDebug, debugEnabled, soundEnabled, onToggleSound }: WorkspaceProps) {
  const [compactView, setCompactView] = useState<'ecosystem' | 'capacity'>('ecosystem');
  const nodeRef = useRef<HTMLElement>(null);
  const findings = knownFindings(s);
  const h = health(s);
  const scanJob = s.jobs.find(j => j.type === 'scan');
  const nextStage = s.stage === 1 ? 60 : 120;
  const coverage = s.lastScanAt === null ? 'Unscanned' : scanStale(s) ? 'Older coverage' : `Covered ${formatTime(s.lastScanAt)}`;
  const capacityBlock = upgradeReason(s, 'capacity');
  const lastEvent = s.events[s.events.length - 1];

  function locateSystem() { setCompactView('ecosystem'); nodeRef.current?.focus(); }

  return <>
    <a className="skip-link" href="#main">Skip to game</a>
    <header className="masthead"><Brand subtitle="Keep the system alive." onClick={onLogo} /><div className="global-controls"><span className="prototype-tag">First playable · v0.1</span><button onClick={onRestart} aria-label="Restart operation" title="Restart operation">↻</button></div></header>
    <main id="main">
      <dl className="operation-strip"><ProgressClock state={s} completion={completion} speed={speed} onToggle={onToggleSpeed} /><div><dt>Available credits</dt><dd className="credit-value" data-credits={s.credits} title={`${s.credits.toFixed(1)} credits`}>{formatCredits(s.credits)}<small> cr</small></dd></div><HealthMetric state={s} /><IncomeMetric state={s} /><div><dt>Work slots</dt><dd>{s.jobs.length}<small> / {slots(s)} busy</small></dd></div></dl>
      <div className="compact-switch" aria-label="Game views"><button aria-pressed={compactView === 'ecosystem'} onClick={() => setCompactView('ecosystem')}>Ecosystem</button><button aria-pressed={compactView === 'capacity'} onClick={() => setCompactView('capacity')}>Work slots ({s.jobs.length}/{slots(s)})</button></div>
      <div className="game-layout map-layout" data-view={compactView}>
        <div className="world-column map-world">
          <StoryGuide state={s} completion={completion} inspect={locateSystem} locate={locateSystem} onStory={onStory} onAutonomy={onAutonomy} />
          <section className={`ecosystem map-ecosystem ${h < 100 ? 'is-degraded' : ''} ${scanJob ? 'is-scanning' : ''}`} aria-labelledby="ecosystem-title">
            <div className="section-heading"><div><h2 id="ecosystem-title">Your ecosystem</h2><p>One backend · internal components</p></div><span className="stage-label">Stage {s.stage} / 3</span></div>

            <div className="network map-network" aria-label="Interactive backend map">
              <svg className="network-wires" viewBox="0 0 700 350" preserveAspectRatio="none" aria-hidden="true"><path d="M350 175H150V80H80M350 175H550V80H620M350 175H150V270H80M350 175H550V270H620" />{s.stage > 1 && <path d="M350 175V30M350 175V320" />}<ellipse className="orbit" cx="350" cy="175" rx="110" ry="115" />{scanJob && <ellipse className="scan-ring" cx="350" cy="175" rx="150" ry="130" />}</svg>
              <span className="component-badge requests">Requests</span><span className="component-badge data">Data</span><span className="component-badge tasks">Tasks</span><span className="component-badge cache">Cache</span>
              {s.stage > 1 && <><span className="component-badge search">Search</span><span className="component-badge reports">Reports</span></>}{s.stage > 2 && <><span className="component-badge extra-left">Uploads</span><span className="component-badge extra-right">Alerts</span></>}
              <SystemNode state={s} serviceId="backend" nodeRef={nodeRef} className="intro-system-card" dispatch={dispatch} />
            </div>
            <div className="condition-line"><span className={h < 100 ? 'warning-text' : 'sage-text'}>{h === 100 ? '● No symptoms' : `● ${openFindings(s).length} unresolved · ${findings.length} known`}</span><span>{coverage}</span></div>
            <div className="growth"><span>{s.time < 15 ? `First problem in ${15 - s.time}s` : s.stage === 3 ? 'Full development pace' : `Next release in ${nextStage - s.time}s`}</span><strong>{`Problems every ${bugInterval(s.stage)}s`}</strong></div>

          </section>
          <Investments state={s} dispatch={dispatch} />
        </div>
        <aside className="control-column capacity-column" aria-label="Work capacity"><div className="section-heading"><h2>Work slots</h2><span className="stage-label">{s.jobs.length} / {slots(s)} busy</span></div><p className="capacity-intro">Each scan or fix occupies one slot.</p><div className="slot-list" data-count={slots(s)}>{Array.from({ length: slots(s) }, (_, index) => { const job = s.jobs[index]; return <button className={`work-slot ${job ? 'occupied' : ''}`} key={job?.id ?? `slot-${index}`} onClick={locateSystem} aria-label={job ? `Inspect work slot ${index + 1}` : `Assign work slot ${index + 1}`}><div><span>Slot {index + 1}</span><strong>{job ? 'Active' : 'Available'}</strong></div><h3>{job ? job.type === 'scan' ? 'Scanning Backend' : `Fixing finding ${job.findingId}` : '+ Assign work'}</h3>{job ? <><div className="job-track"><i style={{ width: `${(s.time - job.startedAt) / (job.endsAt - job.startedAt) * 100}%` }} /></div><small>{job.endsAt - s.time}s remaining · click to find system</small></> : <small>A scan or fix starts after you choose it.</small>}</button>; })}</div><div className="queue-summary" aria-label="Queued actions" title="Actions are paid when queued and start in order as slots open."><span>Queue</span><strong aria-live="polite">{s.queue.length}</strong><small>Starts as slots free up</small></div><div className="add-slot"><button disabled={!!capacityBlock} aria-label="Invest 150 credits" onClick={() => dispatch({ type: 'upgrade', upgrade: 'capacity' })}>{slots(s) >= RULES.maxSlots ? '✓ Maximum · 5 work slots' : '+ Add work slot · 150 cr'}</button><p>{capacityBlock ?? `${slots(s)} → ${slots(s) + 1} work slots. Maximum 5.`}</p></div><details className="capacity-help"><summary>How to work</summary><div><ol><li>Use Scan on Backend to reveal a problem.</li><li>Use Fix to resolve known findings.</li><li>Invest in speed or more work slots.</li></ol><p>Every scan or fix uses one work slot. Connected systems arrive after {RULES.resultAt/60} healthy minutes.</p></div></details></aside>
      </div>
      <div className="event-ticker"><time>{formatTime(lastEvent.at)}</time><span>{lastEvent.text}</span><button onClick={onLog}>View log</button></div>
    </main>
    <footer><span>Ecosystem live</span><div className="footer-controls"><button aria-label="Chapter sound" aria-pressed={soundEnabled} onClick={onToggleSound}>Sound {soundEnabled?'on':'off'}</button>{debugEnabled && <button onClick={onDebug}>Debug</button>}{s.results && <button onClick={onResults}>Milestones</button>}</div></footer>
  </>;
}
