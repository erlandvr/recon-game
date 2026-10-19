import type {GameState} from './game.ts';
import {validSubmission,type ScoreSubmission} from '../supabase/functions/_shared/scoreboard.ts';
import {completedScore} from '../supabase/functions/_shared/scoreFacts.ts';
import type {ReplayEvent} from '../supabase/functions/_shared/replayContract.ts';
export function resultSubmission(s:GameState,runId:string,name:string,replay:ReplayEvent[]|null):ScoreSubmission|null{
 const facts=completedScore(s,runId,name);
 if(!facts||!replay)return null;
 const score={...facts,replay:structuredClone(replay)};
 return validSubmission(score)?score:null;
}
