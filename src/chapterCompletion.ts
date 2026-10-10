import { RULES, levelProgress, type GameState } from './game.ts';

export const CHAPTER_COMPLETION_MS = 2400;
export type ChapterCompletion = { chapter: number; elapsed: number; goal: number | null };
/** Presentation snapshot only: simulation and earned milestones keep advancing. */
export function completedChapter(s: GameState, nextChapter: number): ChapterCompletion {
  const chapter=nextChapter-1;
  const goal=chapter===0?RULES.resultAt:chapter===1?360:null;
  return {chapter,goal,elapsed:goal??levelProgress(s).elapsed};
}
