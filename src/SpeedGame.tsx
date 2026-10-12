import {useEffect,useRef,useState} from 'react';
import {act,advance,newSpeedGame,continueSpeedPractice,autonomyStatus,formatTime,formatCredits,automationCost,autoRepairCost,scanCost,fullyAutomated,upgradeCost,upgradeReason,knownFindings,openFindings,type Action,type GameState} from './game.ts';
import {activeServices,serviceOf,type ServiceId} from './campaign.ts';
import {repository} from './organization.ts';
import {SPEED,SPEED_BEATS,SPEED_MEDALS} from './speedRules.ts';
import {finishTime} from './medals.ts';
import Brand from './Brand.tsx';
import Modal from './Modal.tsx';
import CorporateOverview from './CorporateOverview.tsx';
import Investments from './Investments.tsx';
import HealthMetric from './HealthMetric.tsx';
import IncomeMetric from './IncomeMetric.tsx';
import useChapterSound from './useChapterSound.ts';

function suggested(s:GameState):{title:string;target?:ServiceId}{
 const a=autonomyStatus(s);
 if(a.covered===12)return {title:a.reason??`Hands off. Autonomy trial ${Math.min(20,a.elapsed)}/20s.`};
 const work=[...s.jobs,...s.queue];
 const known=knownFindings(s).filter(f=>!s.campaign?.remediation.includes(serviceOf(f))&&!work.some(j=>j.findingId===f.id)).sort((a,b)=>(a.deadline??Infinity)-(b.deadline??Infinity))[0];
 if(known)return {title:`Fix ${repository(s,serviceOf(known)).name}${known.deadline?' before its deadline':''}.`,target:serviceOf(known)};
 const hidden=openFindings(s).find(f=>!f.known&&!s.campaign?.automated.includes(serviceOf(f))&&!work.some(j=>j.type==='scan'&&j.serviceId===serviceOf(f)));
 if(hidden)return {title:`Scan ${repository(s,serviceOf(hidden)).name}.`,target:serviceOf(hidden)};
 return {title:s.speed!.phase===0?'Your team is working. Fix the revealed finding next.':'Use group actions on the map to cover your team.'};
}

export default function SpeedGame({onChooseMode}:{onChooseMode:()=>void}){
 const [s,setState]=useState(()=>newSpeedGame());const current=useRef(s);
 const running=useRef(false),epoch=useRef(0);
 const [panel,setPanel]=useState<'intro'|'automation'|'restart'|'autonomy'|null>('intro');
 const [runId,setRunId]=useState(0);
 const automationBriefed=useRef(false);
 const [resultOpen,setResultOpen]=useState(false),[notice,setNotice]=useState('');
 const [focusRequest,setFocusRequest]=useState<{id:ServiceId}|null>(null);
 const nodeRefs=useRef<Partial<Record<ServiceId,HTMLElement|null>>>({});
 const sound=useChapterSound(),lastPhase=useRef(0);
 const tickClock=useRef(()=>{});
 function install(next:GameState){current.current=next;setState(next);}
 function dispatch(action:Action){tickClock.current();const r=act(current.current,action);install(r.state);setNotice(r.message);}
 function start(){running.current=true;epoch.current++;tickClock.current();setPanel(null);}
 function restart(){automationBriefed.current=false;setRunId(n=>n+1);running.current=false;epoch.current++;install(newSpeedGame());setResultOpen(false);setPanel('intro');lastPhase.current=0;setNotice('');setFocusRequest(null);}
 function locate(id:ServiceId){setFocusRequest({id});nodeRefs.current[id]?.focus();}
 useEffect(()=>{if(focusRequest)nodeRefs.current[focusRequest.id]?.focus();},[focusRequest]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(timer);},[notice]);
 useEffect(()=>{if(s.speed!.phase>lastPhase.current){lastPhase.current=s.speed!.phase;sound.play();}},[s.speed!.phase,sound]);
 const result=s.speed!.result;
 useEffect(()=>{if(result&&!s.speed!.continuing){setPanel(null);setResultOpen(true);}},[result,s.speed!.continuing]);
 useEffect(()=>{
  let previous=Date.now(),pending=0,version=epoch.current;
  function tick(){
   const now=Date.now();
   if(!running.current||current.current.speed!.result&&!current.current.speed!.continuing){previous=now;pending=0;return;}
   if(version!==epoch.current){version=epoch.current;previous=now;pending=0;}
   pending+=Math.max(0,now-previous);previous=now;
   const seconds=Math.min(300,Math.floor(pending/500)/2);
   if(seconds){
    pending-=seconds*1000;
    let next=current.current,left=seconds;
    // Stop on the exact unlock tick, even after a large/background clock jump.
    while(left>0){
     const step=automationBriefed.current?left:.5;
     next=advance(next,step);left-=step;
     if(!automationBriefed.current&&next.campaign){
      automationBriefed.current=true;running.current=false;pending=0;epoch.current++;
      setPanel('automation');break;
     }
    }
    install(next);
   }
  }
  tickClock.current=tick;const interval=setInterval(tick,250);document.addEventListener('visibilitychange',tick);
  return()=>{clearInterval(interval);document.removeEventListener('visibilitychange',tick);tickClock.current=()=>{};};
 },[]);
 const sprint=s.speed!,phase=SPEED_BEATS[sprint.phase],a=autonomyStatus(s),next=suggested(s),active=activeServices(s);
 const practice=sprint.continuing,overTarget=s.time>SPEED.target,medal=s.campaign?.autonomy.victory?.medal;
 const lastReset=s.campaign?.autonomy.lastReset;
 const phaseGoal=sprint.phase===1?`Automatic scans ${Math.min(2,s.campaign?.automated.length??0)}/2 · Fixes ${Math.min(4,s.stats.repairs)}/4 to unlock the next team.`:phase.goal;
 const trialDetail=a.covered===12?(a.reason??'Hands off. Recon is proving it can run the company.'):phaseGoal;
 return <div className="app speed-game">
  <a className="skip-link" href="#main">Skip to game</a>
  <header className="masthead"><Brand subtitle="Beat five minutes to full autonomy." onClick={()=>{}}/><div className="global-controls"><span>{practice?'Practice · unranked':'Speed Game'}</span><button onClick={()=>setPanel('restart')}>New game</button></div></header>
  <main id="main">
   <dl className="operation-strip"><div className={`speed-clock ${overTarget?'gold-text':''}`}><dt>{practice?'Practice elapsed':result?'Finish time':'Time to autonomy'}</dt><dd data-speed-time={s.time}>{result&&!practice?finishTime(result.at):formatTime(s.time)}</dd><small>{practice?'Original result retained':result?'Run complete':overTarget?'Past 05:00 · keep going':'Target: under 05:00'}</small></div><div><dt>Available credits</dt><dd data-credits={s.credits}>{formatCredits(s.credits)}<small> cr</small></dd></div><HealthMetric state={s}/><IncomeMetric state={s}/><div><dt>Automated</dt><dd>{a.covered}<small> / 12</small></dd></div></dl>
   <div className="game-layout map-layout session-layout">
    <div className="world-column map-world">
     <section className="speed-guide" aria-label="Current assignment">
      <div className="section-heading"><h2>{s.campaign?.autonomy.victory?'Full autonomy':phase.title}</h2><button onClick={()=>setPanel('autonomy')}>Victory goal</button></div>
      <p>{sprint.expansion?`New team connecting · ${active.length}/${sprint.expansion.target} repositories online` : trialDetail}</p><div className="speed-coverage" aria-label="Automation coverage">{s.organization.modules.map(m=><span key={m.id} className={fullyAutomated(s,m.repositoryIds)?'gold-text':''}>{m.name} · {m.repositoryIds.filter(id=>fullyAutomated(s,[id])).length}/4</span>)}</div>
      <div className="job-track" role="progressbar" aria-label={a.covered===12?'Autonomy trial':'Full automation'} aria-valuemin={0} aria-valuemax={a.covered===12?20:12} aria-valuenow={a.covered===12?Math.min(20,a.elapsed):a.covered}><i style={{width:`${a.covered===12?Math.min(100,a.elapsed/20*100):a.covered/12*100}%`}}/></div>
      <div className="speed-next"><span>{lastReset&&s.time-lastReset.at<8?`Trial reset: ${lastReset.reason}`:next.title}</span>{next.target&&<button onClick={()=>locate(next.target!)}>Find system</button>}</div>
     </section>
     <section className={`ecosystem map-ecosystem session-ecosystem corporate-ecosystem`} aria-label="Your ecosystem">
      <CorporateOverview key={runId} focusRequest={focusRequest} state={s} dispatch={dispatch} registerNode={(id,node)=>{nodeRefs.current[id]=node;}}/>
     </section>
     <Investments state={s} dispatch={dispatch}/>
    </div>
    <aside className="control-column capacity-column" aria-label="Work capacity"><div className="section-heading"><h2>Work slots</h2><span>{s.jobs.length}/{s.workSlots} busy</span></div>
     <div className="slot-list" data-count={s.workSlots}>{Array.from({length:s.workSlots},(_,index)=>{const job=s.jobs[index];return <button key={index} className={`work-slot ${job?'occupied':''}`} onClick={()=>locate(job?.serviceId??next.target??'backend')}><div><span>Slot {index+1}</span><strong>{job?'Active':'Available'}</strong></div><h3>{job?`${job.type==='scan'?'Scan':'Fix'} · ${repository(s,job.serviceId??'backend').name}`:'+ Assign work'}</h3>{job&&<><div className="job-track"><i style={{width:`${(s.time-job.startedAt)/(job.endsAt-job.startedAt)*100}%`}}/></div><small>{job.endsAt-s.time}s · {job.automated?'automatic':'manual'}</small></>}</button>;})}</div>
     <div className="queue-summary"><span>Queue</span><strong>{s.queue.length}</strong><small>Starts as slots free up</small></div><div className="add-slot"><button disabled={!!upgradeReason(s,'capacity')} onClick={()=>dispatch({type:'upgrade',upgrade:'capacity'})}>{s.workSlots===5?'✓ Five work slots':`+ Add work slot · ${upgradeCost(s,'capacity')} cr`}</button></div>
     <p className="speed-tip">Scans reveal findings. Fixes restore health. Automate both to turn systems gold.</p>
    </aside>
   </div>
   <div className="event-ticker" role="status"><span key={sprint.phase} className={s.time-sprint.phaseAt<7?'speed-beat':''}>{s.time-sprint.phaseAt<7?`✓ ${phase.story}`:notice||s.events[s.events.length-1].text}</span></div>
  </main>
  <footer><span>{practice?'Practice · no new medal':`${active.length}/12 repositories · Gold ≤4:00 · Silver ≤4:30`}</span><div className="footer-controls"><button aria-pressed={sound.enabled} onClick={sound.toggle}>Sound {sound.enabled?'on':'off'}</button>{result&&<button onClick={()=>setResultOpen(true)}>View result</button>}</div></footer>
  {panel==='intro'&&<Modal title="Beat five minutes. Make it autonomous." className="chapter-modal" onDismiss={()=>{}}><p>You’re SumZero’s Recon operator. Keep the company healthy while new teams join.</p><section className="chapter-rules arcade-rules"><h3>SCAN → FIX → AUTOMATE</h3><p>Grow to <strong>12 repositories</strong>. Automate scans and fixes, then let Recon run them for <strong>20 seconds</strong>.</p></section><p>Aim for under five minutes. Keep playing until autonomy, however long it takes.</p><button className="primary start-game-button" onClick={start}>Start Speed Game</button><button className="mode-back" onClick={onChooseMode}>Choose another mode</button></Modal>}
  {panel==='automation'&&<Modal title="Let Recon do the routine work" className="chapter-modal automation-briefing" onDismiss={()=>{}}>
   <p>Your first fix unlocked automation. Buy it directly on each repository, or use the team buttons.</p>
   <section className="chapter-rules"><p><strong>Auto scans</strong> discover new findings for you. Setup costs {automationCost(s)} credits per repo.</p><p><strong>Auto fixes</strong> resolve discovered findings. Setup costs {autoRepairCost(s)} credits per repo.</p><p>Jobs still use work slots and credits: {scanCost(s)} per scan, 15 per fix. Scan efficiency upgrades reduce scan costs.</p></section>
   <p>Automate both to turn a system gold. Cover all 12, then let Recon prove itself for 20 seconds.</p><p className="game-paused">Game paused. Reading time does not count.</p>
   <button className="primary start-game-button" onClick={start}>Dive Back In</button>
  </Modal>}
  {panel==='autonomy' &&<Modal title="Your autonomy target" onDismiss={()=>setPanel(null)}><p>Automate scans and fixes on all 12 repositories. Sustain these conditions for 20 seconds:</p><ul><li>Average health ≥90%, every repository ≥60%.</li><li>No overdue findings. Keep 35 credits in reserve.</li><li>No manual work running or queued.</li><li>Automatic scans and fixes must do real work; income covers upkeep.</li></ul><p>{a.reason??`Trial: ${Math.min(20,a.elapsed)}/20s. Leave the work to Recon.`}</p><p>Manual work or a broken condition resets the trial. Purchases are allowed. Your finish timer keeps running while this is open.</p><button onClick={()=>setPanel(null)}>Back to game</button></Modal>}
  {panel==='restart'&&<Modal title="Start another run?" onDismiss={()=>setPanel(null)}><p>This replaces this run. Your finish timer keeps running while you decide.</p><div className="modal-actions"><button onClick={()=>setPanel(null)}>Cancel</button><button onClick={restart}>Restart Speed Game</button><button onClick={onChooseMode}>Choose game mode</button></div></Modal>}
  {resultOpen&&result&&<Modal title="Full autonomy achieved" className="chapter-modal speed-result" onDismiss={()=>{if(practice)setResultOpen(false);}}>
   {medal&&<div className={`speed-medal medal-${medal}`}><span aria-hidden="true">✦</span><h3>{medal} medal</h3></div>}<p>Your company runs itself. {result.at<=SPEED.target?'You beat the five minute target.':'Autonomy achieved. Try to beat five minutes next time.'}</p>
   <dl className="speed-result-stats"><div><dt>Time to autonomy</dt><dd>{finishTime(result.at)}</dd></div><div><dt>Autonomous modules</dt><dd>{result.modules}/3</dd></div><div><dt>Final health</dt><dd>{result.health}%</dd></div></dl>
   <ul className="medal-thresholds">{SPEED_MEDALS.map(m=><li key={m.id}><strong>{m.name}</strong><span>≤{finishTime(m.through)}</span></li>)}</ul>
   <div className="modal-actions"><button onClick={restart}>Try again</button><button onClick={()=>{install(continueSpeedPractice(current.current));epoch.current++;tickClock.current();setResultOpen(false);}}>Continue practising</button><button onClick={onChooseMode}>Choose game mode</button></div>
   {practice&&<button onClick={()=>setResultOpen(false)}>Back to practice</button>}
  </Modal>}
 </div>;
}
