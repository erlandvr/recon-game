import type {GameState} from './game.ts';
import {SCORE_RULES,scoreName,validSubmission,type ScoreSubmission} from '../supabase/functions/_shared/scoreboard.ts';
export function resultSubmission(s:GameState,runId:string,name:string):ScoreSubmission|null{
 const r=s.speed?.result,v=s.campaign?.autonomy.victory;
 if(!r||!v||v.practice)return null;
 const score:ScoreSubmission={runId,name:scoreName(name),mode:'speed',rulesVersion:SCORE_RULES.id,finishMs:Math.round(r.at*1000),seed:s.organization.seed,covered:r.covered,modules:r.modules,health:r.health,trialSeconds:v.duration,autoScans:v.autoScans,autoRepairs:v.autoRepairs,credits:v.credits,netIncome:v.netIncome,practice:false};
 return validSubmission(score)?score:null;
}
