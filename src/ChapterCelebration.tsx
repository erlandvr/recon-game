import type { CSSProperties } from 'react';
import { CHAPTER_COMPLETION_MS, type ChapterCompletion } from './chapterCompletion.ts';
import { CHAPTERS } from './story.ts';
import { formatTime } from './game.ts';

/** Visual companion to StoryGuide's live announcement; it never steals focus. */
export default function ChapterCelebration({ completion }: { completion: ChapterCompletion }) {
  return <div className="chapter-celebration" aria-hidden="true" style={{'--celebration-duration':`${CHAPTER_COMPLETION_MS}ms`} as CSSProperties}>
    <div className="celebration-content">
      <div className="celebration-emblem">
        <svg viewBox="0 0 160 160" className="celebration-ring"><circle className="celebration-ring-track" cx="80" cy="80" r="68"/><circle className="celebration-ring-fill" cx="80" cy="80" r="68" pathLength="100"/><path className="celebration-tick" d="m52 80 19 19 38-40" pathLength="100"/></svg>
        {Array.from({length:12},(_,i)=><i key={i} className="celebration-spark" style={{rotate:`${i*30}deg`}}/>)}
      </div>
      <p className="celebration-achievement">{completion.goal?`${formatTime(completion.goal)} healthy time achieved`:'Goal achieved'}</p>
      <h2>Chapter {completion.chapter+1} complete!</h2>
      <p className="celebration-chapter">{CHAPTERS[completion.chapter].title}</p>
      <p className="celebration-next">Up next · {CHAPTERS[completion.chapter+1].title}</p>
    </div>
  </div>;
}
