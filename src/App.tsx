import useChapterSound from './useChapterSound.ts';
import VictorySummary from './VictorySummary.tsx';
import { CHAPTER_COMPLETION_MS, completedChapter, type ChapterCompletion } from './chapterCompletion.ts';
import { CHAPTERS, chapterIndex, nextMove } from './story.ts';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Workspace from './Workspace.tsx';
import EcosystemSession from './EcosystemSession.tsx';
import { RULES, autonomyStatus, act, advance, formatTime, newGame } from './game.ts';
import type { Action } from './game.ts';
import { DEBUG_STARTS, debugGame, type DebugStart } from './debug.ts';

function Modal({ title, children, onDismiss }: { title: string; children: ReactNode; onDismiss: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; const previous = document.activeElement as HTMLElement | null; dialog.showModal(); return () => { dialog.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} className="modal" aria-label={title} onCancel={e => { e.preventDefault(); onDismiss(); }} onKeyDown={e => {
    if (e.key !== 'Tab') return;
    const controls = Array.from(ref.current!.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')).filter(el => el.getClientRects().length > 0);
    const first = controls[0]; const last = controls[controls.length - 1];
    if (first && (e.shiftKey ? document.activeElement === first : document.activeElement === last)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
  }}><h2>{title}</h2>{children}</dialog>;
}

export default function App() {
  const [s, setState] = useState(() => newGame(Math.floor(Math.random() * 0x100000000)));
  const current = useRef(s);
  const [started,setStarted]=useState(false);
  const running=useRef(false);
  const sound=useChapterSound();
  const soundedCompletion=useRef<ChapterCompletion|null>(null);
  const [notice, setNotice] = useState('');
  const [panel, setPanel] = useState<'log' | 'results' | 'restart' | 'debug' | 'autonomy' | 'story' | null>(null);
  const [storyChapter, setStoryChapter] = useState(0);
  const announcedChapter = useRef(-1);
  const instantIntroduction = useRef(true);
  const [completion, setCompletion] = useState<ChapterCompletion | null>(null);
  const [visible, setVisible] = useState(!document.hidden);
  const chapter = chapterIndex(s);
  useEffect(()=>{if(completion&&panel===null&&visible&&soundedCompletion.current!==completion){soundedCompletion.current=completion;sound.play();}},[completion,panel,visible,sound]);
  useEffect(() => {
    const visibility=()=>setVisible(!document.hidden);
    document.addEventListener('visibilitychange',visibility);
    return ()=>document.removeEventListener('visibilitychange',visibility);
  },[]);
  useLayoutEffect(() => {
    if (!visible || panel !== null || completion || chapter <= announcedChapter.current) return;
    if (instantIntroduction.current) {
      instantIntroduction.current=false;
      announcedChapter.current=chapter;
      setStoryChapter(chapter); setPanel('story');
    } else setCompletion(completedChapter(current.current,chapter));
  }, [chapter, panel, completion, visible]);
  useEffect(() => {
    if(!completion || panel!==null || !visible) return;
    // Give the completion feedback visible wall-clock time, independent of 1×/2×.
    const timer=window.setTimeout(()=>{
      const nextChapter=chapterIndex(current.current);
      announcedChapter.current=nextChapter;
      setStoryChapter(nextChapter); setPanel('story'); setCompletion(null);
    },CHAPTER_COMPLETION_MS);
    return ()=>window.clearTimeout(timer);
  },[completion,panel,visible]);
  function openStory() { setCompletion(null); announcedChapter.current = Math.max(announcedChapter.current, chapter); setStoryChapter(chapter); setPanel('story'); }
  const [debugEnabled, setDebugEnabled] = useState(false);
  const logoClicks = useRef({count:0, startedAt:0});
  const clockEpoch = useRef(0);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const rate = useRef<1 | 2>(1);
  const tickClock = useRef<() => void>(() => {});
  function clickLogo() {
    const now = Date.now();
    const sequence = logoClicks.current;
    if (!sequence.count || now - sequence.startedAt > 2000) { sequence.count = 0; sequence.startedAt = now; }
    sequence.count++;
    if (sequence.count === 3) { sequence.count = 0; setDebugEnabled(true); setPanel('debug'); }
  }
  function jumpTo(id: DebugStart) {
    current.current = debugGame(id, current.current.organization.seed);
    running.current=id!=='backend';setStarted(running.current);
    instantIntroduction.current=true; setCompletion(null); announcedChapter.current=chapterIndex(current.current)-1;
    setState(current.current); clockEpoch.current++; tickClock.current(); setPanel(null);
    setNotice(`Debug: ${DEBUG_STARTS.find(item => item.id === id)!.name} started.`);
  }
  function exitDebug() { setDebugEnabled(false); logoClicks.current.count = 0; setPanel(null); }
  function toggleSpeed() {
    // Account for the previous rate before changing it; retain fractional time.
    tickClock.current();
    rate.current = rate.current === 1 ? 2 : 1;
    setSpeed(rate.current);
  }
  function dispatch(action: Action) {
    const result = act(current.current, action);
    current.current = result.state; setState(result.state); setNotice(result.message);
  }
  function startGame(){running.current=true;setStarted(true);clockEpoch.current++;tickClock.current();setPanel(null);}
  function restart() { running.current=false;setStarted(false);instantIntroduction.current=true; setCompletion(null); announcedChapter.current=-1; current.current = newGame(Math.floor(Math.random() * 0x100000000)); setState(current.current); clockEpoch.current++; tickClock.current(); setPanel(null); setNotice('Fresh ecosystem started.'); }
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    let previous = Date.now(); let pendingMs = 0; let epoch = clockEpoch.current;
    function tick() {
      const now = Date.now();
      if(!running.current){previous=now;pendingMs=0;return;}
      if (epoch !== clockEpoch.current) { previous = now; pendingMs = 0; epoch = clockEpoch.current; }
      pendingMs += Math.max(0, now - previous) * rate.current; previous = now;
      // Background browser throttling delays callbacks, not ecosystem time.
      // Process long gaps in bounded batches, retaining the remainder.
      const seconds = Math.min(300, Math.floor(pendingMs / 500) / 2);
      if (seconds) { pendingMs -= seconds * 1000; current.current = advance(current.current, seconds); setState(current.current); }
    }
    tickClock.current = tick;
    const interval = window.setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => { tickClock.current = () => {}; clearInterval(interval); document.removeEventListener('visibilitychange', tick); };
  }, []);
  const Board = s.campaign ? EcosystemSession : Workspace;
  return <div className="app">
    <Board key={clockEpoch.current} state={s} completion={panel===null&&visible?completion:null} dispatch={dispatch} speed={speed} onToggleSpeed={toggleSpeed} onRestart={() => setPanel('restart')} onLog={() => setPanel('log')} onResults={() => setPanel('results')} onStory={openStory} onAutonomy={() => setPanel('autonomy')} onLogo={clickLogo} onDebug={() => setPanel('debug')} debugEnabled={debugEnabled} soundEnabled={sound.enabled} onToggleSound={sound.toggle} />
    <div className="notice" key={notice} role="status" aria-live="polite" aria-atomic="true">{notice}</div>
    {panel === 'story' && <Modal title={storyChapter===5?'Full autonomy achieved':'Your company story'} onDismiss={() => {if(started)setPanel(null);}}>
      <h3 className="story-title">Chapter {storyChapter+1} · {CHAPTERS[storyChapter].title}</h3>
      {storyChapter===5&&s.campaign?.autonomy.victory ? <VictorySummary victory={s.campaign.autonomy.victory}/> : <p className="story-current">{CHAPTERS[storyChapter].story}</p>}
      {storyChapter===0 ? <section className="chapter-rules" aria-label="How to play">
        <h3>How to play</h3>
        <ol>
          <li><strong>Maintain health.</strong> Keep your system at {RULES.healthyThreshold}% or higher.</li>
          <li><strong>Scan for issues.</strong> Click Scan on your system to reveal findings.</li>
          <li><strong>Repair findings.</strong> Click Repair to restore health.</li>
          <li><strong>Reach the target.</strong> Earn {RULES.resultAt/60} healthy minutes to enter the next chapter.</li>
        </ol>
        <p className="opening-medals">Medal targets: Gold ≤25 minutes · Silver ≤30 minutes · Bronze for every later finish.</p>
        <p>Below {RULES.healthyThreshold}%, the goal timer stops. Restore health to resume. You keep the time already earned. Income is reduced by {Math.round((1-RULES.failureIncomeMultiplier)*100)}% until health recovers.</p>
      </section> : storyChapter!==5 && <>
      <ol className="chapter-list">{CHAPTERS.map((chapter,index)=><li key={chapter.title} aria-current={index===storyChapter?'step':undefined} className={index<storyChapter?'completed':''}><span>{index<storyChapter?'✓':String(index+1).padStart(2,'0')}</span><div><strong>{chapter.title}</strong><small>{index===storyChapter?'Current chapter':index<storyChapter?'Reached':chapter.unlock}</small></div></li>)}</ol>
      </>}
      {storyChapter!==5&&<section className="story-advice" aria-label="Next move"><h3>{nextMove(s).title}</h3><p>{nextMove(s).detail}</p></section>}
      <p className="story-live-note">{started?'The ecosystem keeps running while you read.':'Take your time. The ecosystem and medal timer begin when you press Start game.'}</p>
      <button className="primary" onClick={()=>{if(!started)startGame();else setPanel(null);}}>{storyChapter === 0 ? 'Start game' : storyChapter===5 ? 'Keep playing' : 'Start Next Chapter'}</button>
    </Modal>}
    {panel === 'debug' && <Modal title="Debug · choose a starting point" onDismiss={() => setPanel(null)}>
      <p>Jump to any gameplay stage. This replaces the run, keeping its layout and speed. A coached run earns healthy-time goals using paid scans, repairs and upgrades. Credits, work and elapsed time reflect that progress. Later-stage starts show a practice medal preview; restart for an earned medal.</p>
      <div className="debug-levels">{DEBUG_STARTS.map(level => <button key={level.id} onClick={() => jumpTo(level.id)}><span>{level.name}</span><small>{level.hint}</small></button>)}</div>
      <div className="modal-actions"><button onClick={() => setPanel(null)}>Close debug</button><button onClick={exitDebug}>Exit debug mode</button></div>
    </Modal>}
    {panel === 'autonomy' && <Modal title={s.campaign?.autonomy.victory?'Full autonomy achieved':'Full autonomy'} onDismiss={()=>setPanel(null)}>
      {s.campaign?.autonomy.victory&&<VictorySummary victory={s.campaign.autonomy.victory}/>}
      <p>{s.campaign?.autonomy.victory?'Your company maintains all 100 repositories automatically. You can keep playing.':'Maintain all 100 repositories automatically for 60 uninterrupted game seconds. The trial starts and restarts automatically; the ecosystem always keeps running.'}</p>
      {!s.campaign?.autonomy.victory&&<>
      <dl className="autonomy-details"><div><dt>Automatic scans</dt><dd>{autonomyStatus(s).scans} / 100 repos</dd></div><div><dt>Automatic repairs</dt><dd>{autonomyStatus(s).repairs} / 100 repos</dd></div><div><dt>Continuous operation</dt><dd>{Math.min(60,autonomyStatus(s).elapsed)} / 60 seconds</dd></div></dl>
      <p className="autonomy-reason">{s.campaign?.autonomy.victory?`Victory recorded at ${formatTime(s.campaign.autonomy.victory.at)}.`:autonomyStatus(s).reason??'Trial running: let automatic scans and repairs handle the work.'}</p>
      <ul className="autonomy-rules"><li>Average health at least 90%; every repository at least 60%.</li><li>No overdue findings; at least 35 credits available.</li><li>No manual scans or repairs, including running or queued work.</li><li>Complete automatic repairs and start automatic scans during the trial; income must cover scan and repair spending.</li></ul>
      <p>Manual work or a broken condition resets the trial. Purchases are allowed. Victory remains recorded once earned.</p></>}
      <button className="primary" onClick={()=>setPanel(null)}>Back to ecosystem</button>
    </Modal>}
    {panel === 'restart' && <Modal title="Start a fresh ecosystem?" onDismiss={() => setPanel(null)}><p>This replaces the current run. The ecosystem keeps running while you decide.</p><div className="modal-actions"><button onClick={() => setPanel(null)}>Cancel</button><button className="primary" onClick={restart}>Start fresh</button></div></Modal>}
    {panel === 'log' && <Modal title="Operation log" onDismiss={() => setPanel(null)}><p>The ecosystem keeps running.</p><ol className="full-log">{s.events.slice().reverse().map(e => <li key={e.id}><time>{formatTime(e.at)}</time><span>{e.text}</span></li>)}</ol><button className="primary" onClick={() => setPanel(null)}>Close log</button></Modal>}
    {panel === 'results' && <Modal title="Ecosystem milestones" onDismiss={() => setPanel(null)}><p>The ecosystem keeps running. These snapshots record earlier milestones.</p>
      {s.results && <section className="milestone-result"><h3>First {RULES.resultAt/60} healthy minutes</h3><p>Reached at {formatTime(s.results.at)} elapsed · {s.results.health}% health · {s.results.stats.repairs} repairs · {s.results.credits.toFixed(1)} credits</p></section>}
      {s.campaign?.result && <section className="milestone-result"><h3>Release at {formatTime(s.campaign.result.at)}</h3><p>{s.campaign.result.health}% health · {s.campaign.result.resolved}/3 release findings resolved · {s.campaign.result.missed} deadlines missed</p><p>{s.campaign.result.autoScans} automatic scans</p></section>}
      {s.campaign?.autonomy.victory&&<section className="milestone-result autonomy-won"><h3>Full autonomy achieved</h3><VictorySummary victory={s.campaign.autonomy.victory}/><p>{s.campaign.autonomy.victory.duration}s of sustained autonomous operation</p><p>{s.campaign.autonomy.victory.autoScans} automatic scans · {s.campaign.autonomy.victory.autoRepairs} automatic repairs · {s.campaign.autonomy.victory.netIncome.toFixed(2)} credits net operating income</p></section>}
      <button className="primary" onClick={() => setPanel(null)}>Close milestones</button>
    </Modal>}
  </div>;
}
