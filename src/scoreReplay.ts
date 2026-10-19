import type {Action,ActionResult,GameState} from './game.ts';
import {REPLAY_LIMITS,type ReplayEvent} from '../supabase/functions/_shared/replayContract.ts';

// Keep the transcript outside GameState: simulation copies must not copy the growing log.
export function recordScoreAction(replay:ReplayEvent[]|null,before:GameState,action:Action,result:ActionResult):ReplayEvent[]|null {
 if(!replay||before.speed?.result||!result.ok)return replay;
 if(replay.length>=REPLAY_LIMITS.maxActions||before.time*1000>REPLAY_LIMITS.maxFinishMs)return null;
 replay.push({atMs:Math.round(before.time*1000),action:structuredClone(action)});
 return replay;
}
