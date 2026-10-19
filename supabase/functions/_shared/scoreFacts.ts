import type {GameState} from './engine/game.ts';
import {SCORE_RULES,scoreName,type ScoreFacts} from './scoreboard.ts';

// Called on browser state for preview and independently replayed server state for storage.
export function completedScore(s:GameState,runId:string,name:string):ScoreFacts|null {
 const r=s.speed?.result,v=s.campaign?.autonomy.victory;
 if(!r||!v||v.practice)return null;
 return {runId,name:scoreName(name),mode:'speed',rulesVersion:SCORE_RULES.id,finishMs:Math.round(r.at*1000),seed:s.organization.seed,covered:r.covered,modules:r.modules,health:r.health,trialSeconds:v.duration,autoScans:v.autoScans,autoRepairs:v.autoRepairs,credits:v.credits,netIncome:v.netIncome,practice:false};
}
