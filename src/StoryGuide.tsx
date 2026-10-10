import AutonomyProgress from './AutonomyProgress.tsx';
import type { ChapterCompletion } from './chapterCompletion.ts';
import { CHAPTERS, chapterBeat, chapterGoal, chapterIndex, nextMove } from './story.ts';
import type { GameState } from './game.ts';
import type { ServiceId } from './campaign.ts';

export default function StoryGuide({state:s,completion,inspect,locate,onStory,onAutonomy}:{state:GameState;completion?:ChapterCompletion|null;inspect:(id:ServiceId)=>void;locate:(id:ServiceId)=>void;onStory:()=>void;onAutonomy:()=>void}) {
  const chapter=chapterIndex(s), move=nextMove(s);
  function go() {
    if(move.target) (move.coverage?locate:inspect)(move.target);
    else if(move.destination==='autonomy') onAutonomy();
    else onStory();
  }
  if(completion) return <section className="guide story-guide chapter-completion" aria-label="Chapter completed" data-chapter={chapter+1} role="status" aria-live="polite" aria-atomic="true">
    <div className="chapter-line"><span className="completion-check" aria-hidden="true">✓</span><strong>{CHAPTERS[completion.chapter].title}</strong></div>
    <div className="next-move"><h1>Chapter {completion.chapter+1} complete</h1></div>
    <p className="chapter-goal">Goal reached · Next: {CHAPTERS[chapter].title}</p>
  </section>;
  return <section className={`guide story-guide ${chapter===5?'autonomy-won':''}`} aria-label="Current guidance" data-chapter={chapter+1}>
    <div className="chapter-line"><button onClick={onStory} aria-label="Open company story">{String(chapter+1).padStart(2,'0')} · {CHAPTERS[chapter].title} <span aria-hidden>↗</span></button><span className="chapter-beat">{chapterBeat(s)}</span></div>
    <div className="next-move"><h1>{move.title}</h1>{move.action&&<button onClick={go}>{move.action}</button>}</div>
    {chapter===4?<AutonomyProgress state={s}/>:<p className="chapter-goal">{chapterGoal(s)}</p>}
  </section>;
}
