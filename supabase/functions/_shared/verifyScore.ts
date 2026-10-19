import {act,advance,newSpeedGame} from './engine/game.ts';
import {completedScore} from './scoreFacts.ts';
import {SCORE_RULES,validSubmission,type ScoreSubmission} from './scoreboard.ts';
import {REPLAY_LIMITS} from './replayContract.ts';

export type VerifiedScore = ScoreSubmission & {verification:'replay-v1'};
export class ReplayBudgetExceeded extends Error {}
export function verifyScore(value:unknown,now:()=>number=()=>performance.now()):VerifiedScore|null {
 if(!validSubmission(value))return null;
 const deadline=now()+REPLAY_LIMITS.maxReplayMs;
 const checkBudget=()=>{if(now()>deadline)throw new ReplayBudgetExceeded('Replay exceeded its verification budget');};
 let state=newSpeedGame(SCORE_RULES.seed);
 function advanceTo(target:number){
  while(state.time<target&&!state.speed!.result){
   checkBudget();
   state=advance(state,Math.min(1,target-state.time));
  }
 }
 try {
  for(const event of value.replay){
   checkBudget();
   const target=event.atMs/1000;
   if(state.speed!.result)return null;
   if(target>state.time){
    if(state.speed!.paused)return null;
    advanceTo(target);
   }
   // Actions after a victory, including at its exact tick, cannot change that result.
   if(state.time!==target||state.speed!.result)return null;
   const next=act(state,event.action);
   if(!next.ok)return null;
   state=next.state;
  }
  const remaining=value.finishMs/1000-state.time;
  if(remaining>0&&state.speed!.paused)return null;
  advanceTo(value.finishMs/1000);
  checkBudget();
  const calculated=completedScore(state,value.runId,value.name);
  if(!calculated)return null;
  // Fail closed on timer or state tampering. Store only independently derived facts.
  for(const field of Object.keys(calculated) as (keyof typeof calculated)[])if(calculated[field]!==value[field])return null;
  return {...calculated,replay:value.replay,verification:'replay-v1'};
 } catch(error){if(error instanceof ReplayBudgetExceeded)throw error;return null;}
}
