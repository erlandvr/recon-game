import {MEDALS} from './medals.ts';
import SpeedControl from './SpeedControl.tsx';
import type { ChapterCompletion } from './chapterCompletion.ts';
import { RULES, formatTime, healthyEnough, levelProgress, type GameState } from './game.ts';
export default function ProgressClock({state:s,completion,speed,onToggle}:{state:GameState;completion?:ChapterCompletion|null;speed:1|2;onToggle:()=>void}) {
  const victory=s.campaign?.autonomy.victory;
  const medal=MEDALS.find(m=>victory?m.id===victory.medal:s.time<=m.through)!;
  const target=Number.isFinite(medal.through)?`${medal.name} ≤${medal.through/60}m`:'Bronze · finish';
  const progress=completion??levelProgress(s),healthy=healthyEnough(s);
  const near=!completion&&healthy&&progress.goal!==null&&progress.goal-progress.elapsed<=10;
  const percent=completion?100:progress.goal?Math.min(100,progress.elapsed/progress.goal*100):100;
  return <div className={`progress-clock ${completion?'clock-complete':near?'clock-near':''}`}>
    <dt>{completion?`Chapter ${completion.chapter+1} complete`:`${near?'Almost there':'Healthy time'}${progress.goal?` · ${progress.goal/60}m goal`:''}`}</dt>
    <dd className="timer-controls"><time data-healthy-time={progress.elapsed}>{formatTime(progress.elapsed)}</time><SpeedControl speed={speed} onToggle={onToggle}/></dd>
    <div className="world-time"><span><span className="elapsed-label">Elapsed </span><time aria-label="Total elapsed game time">{formatTime(s.time)}</time></span><span className="medal-target" aria-label={victory?`${medal.name} medal ${victory.practice?'preview':'earned'}`:`Medal target: ${target}`}>{victory?`${medal.name} ✓`:target}</span></div>
    <div className={`session-track ${!completion&&!healthy?'progress-held':''}`} title={completion?'Chapter goal reached':healthy?`Average health at least ${RULES.healthyThreshold}%`:`Progress held: restore average health to ${RULES.healthyThreshold}%`}><i style={{width:`${percent}%`}}/></div>
  </div>;
}
