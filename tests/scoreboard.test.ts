import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {SCORE_RULES,validName,validSubmission,validStoredSubmission,scoreTime,type ScoreSubmission} from '../supabase/functions/_shared/scoreboard.ts';
import {SPEED,SPEED_MEDALS} from '../src/speedRules.ts';
import {newSpeedGame,act,advance,continueSpeedPractice} from '../src/game.ts';
import {playSpeed} from '../scripts/speed-benchmark.ts';
import {resultSubmission} from '../src/scoreResult.ts';
import {paidScore} from './helpers/scoreboard.ts';
export const sample=():ScoreSubmission=>({runId:randomUUID(),name:'Élodie 李',mode:'speed',rulesVersion:SCORE_RULES.id,finishMs:500500,seed:1,covered:15,modules:3,health:95,trialSeconds:5,autoScans:1,autoRepairs:1,credits:35,netIncome:10,practice:false,replay:[{atMs:0,action:{type:'speed-pause',paused:false}}]});
test('score contract matches current engine and supports exact long finishes and international names',()=>{
 assert.equal(SCORE_RULES.repositories,SPEED.repositories);assert.equal(SCORE_RULES.trialSeconds,SPEED.trialSeconds);
 assert.deepEqual([SCORE_RULES.goldMs,SCORE_RULES.silverMs,SCORE_RULES.bronzeMs],SPEED_MEDALS.map(m=>m.through*1000));
 assert.ok(validSubmission(sample()));assert.equal(scoreTime(500500),'08:20.5');assert.equal(scoreTime(500250),'08:20.25');assert.ok(validSubmission({...sample(),finishMs:500250}));
 assert.ok(validSubmission({...sample(),trialSeconds:5.25}));assert.equal(validSubmission({...sample(),trialSeconds:4.75}),false);assert.equal(validSubmission({...sample(),trialSeconds:1000}),false);
 for(const name of ['Élodie 李','<b>name</b>','🚀'.repeat(30)])assert.ok(validName(name));
 for(const name of ['',' ','x'.repeat(31),'a\nb',' a','a\u200bb'])assert.equal(validName(name),false);
 for(const change of [{finishMs:0},{finishMs:NaN},{finishMs:999},{finishMs:Infinity},{covered:14},{rulesVersion:'old'},{practice:true},{health:101},{health:89},{trialSeconds:0},{autoScans:0},{autoRepairs:0},{credits:34},{netIncome:-1},{seed:2},{modules:2}])assert.equal(validSubmission({...sample(),...change}),false,JSON.stringify(change));
 const old={...sample(),rulesVersion:'old',trialSeconds:0,health:35,credits:0,autoScans:0,autoRepairs:0,netIncome:-10};assert.ok(validStoredSubmission(old));assert.equal(validSubmission(old),false);
});
test('paid victory yields a valid frozen submission after continued practice; incomplete and debug runs do not',()=>{
 const plan=playSpeed({route:'all',reaction:3,beforeModel:4});assert.ok(plan.result);
 let s=act(newSpeedGame(),{type:'speed-pause',paused:false}).state;
 for(const item of plan.actions){s=advance(s,item.at-s.time);s=act(s,item.action).state;}
 s=advance(s,plan.result.at-s.time);const id=randomUUID(),replay=paidScore().score.replay,before=resultSubmission(s,id,' Élodie ',replay);assert.ok(before);assert.equal(before.name,'Élodie');
 assert.deepEqual(resultSubmission(advance(continueSpeedPractice(s),60),id,'Élodie',replay),before);
 assert.equal(resultSubmission(newSpeedGame(),randomUUID(),'Player',[]),null);
 s.campaign!.autonomy.victory!.practice=true;assert.equal(resultSubmission(s,id,'Player',replay),null);
});
