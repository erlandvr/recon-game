import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {act,advance,continueSpeedPractice,newSpeedGame} from '../src/game.ts';
import {resultSubmission} from '../src/scoreResult.ts';
import {recordScoreAction} from '../src/scoreReplay.ts';
import {validSubmission} from '../supabase/functions/_shared/scoreboard.ts';
import {REPLAY_LIMITS,validReplayAction} from '../supabase/functions/_shared/replayContract.ts';
import {verifyScore,ReplayBudgetExceeded} from '../supabase/functions/_shared/verifyScore.ts';
import {paidScore} from './helpers/scoreboard.ts';

const legitimate=paidScore();
test('server derives paid victories across purchase routes, pause/planning and long finishes',()=>{
 for(const options of [{route:'all' as const,reaction:3,beforeModel:4},{route:'scanner' as const,reaction:1,beforeModel:3},{route:'master' as const,reaction:5,beforeModel:6},{route:'all' as const,reaction:3,beforeModel:4,startDelay:360}]){
  const {score}=paidScore(options),verified=verifyScore(score);
  assert.ok(verified,JSON.stringify(options));assert.equal(verified.finishMs,score.finishMs);assert.equal(verified.verification,'replay-v1');
  assert.deepEqual(verified,{...score,verification:'replay-v1'});
 }
});
test('rejects the fabricated 60-second incident, five seconds, missing replay and false completion claims',()=>{
 const base=legitimate.score;
 for(const finishMs of [5000,60000]){
  const forged={...base,finishMs,health:100,autoScans:1,autoRepairs:1,credits:35,netIncome:0,trialSeconds:5,replay:[{atMs:0,action:{type:'speed-pause',paused:false}}]};
  assert.ok(validSubmission(forged),'basic fields can still look plausible');assert.equal(verifyScore(forged),null);
 }
 assert.equal(verifyScore({...base,replay:undefined}),null);
 assert.equal(verifyScore({...base,replay:[]}),null);
 assert.equal(verifyScore({...base,rulesVersion:'speed-d129-v1'}),null);
 for(const field of ['finishMs','credits','health','netIncome','autoScans','autoRepairs','trialSeconds'] as const){
  const forged={...base,[field]:base[field]+(field==='finishMs'?250:1)};
  assert.equal(verifyScore(forged),null,field);
 }
 assert.equal(verifyScore({...base,practice:true}),null);
 assert.equal(verifyScore({...base,seed:2}),null);
});
test('legal group commands replay with the same paid costs and completion result',()=>{
 const score=structuredClone(legitimate.score);
 const scan=score.replay.find(e=>e.action.type==='scan')!;
 scan.action={type:'scope',scope:{level:'module',id:'module-1'},operation:'scan'};
 const repair=score.replay.find(e=>e.action.type==='repair-repository')!;
 repair.action={type:'scope',scope:{level:'project',id:'project-1'},operation:'repair'};
 assert.ok(verifyScore(score));
});
test('rejects malformed actions, fabricated purchases, reordered time, paused time and post-victory actions',()=>{
 const base=legitimate.score;
 for(const action of [{type:'debug',credits:10000},{type:'model',model:'base'},{type:'scan',serviceId:'repo-99'},{type:'scan',automated:true},{type:'upgrade',upgrade:'scanning'},{type:'repair',findingId:-1},{type:'speed-pause',paused:'false'},{type:'scope',scope:{level:'module',id:['module-1']},operation:'scan'},{type:'scope',scope:{level:'module',id:'module-1'},operation:'automate'}]){
  assert.equal(validReplayAction(action),false);assert.equal(verifyScore({...base,replay:[{atMs:0,action}]}),null);
 }
 const injected=structuredClone(base);injected.replay.splice(1,0,{atMs:0,action:{type:'model',model:'master'}});assert.equal(verifyScore(injected),null);
 const reordered=structuredClone(base);reordered.replay[0].atMs=250;assert.equal(verifyScore(reordered),null);
 const paused=structuredClone(base);paused.replay.splice(1,0,{atMs:0,action:{type:'speed-pause',paused:true}});assert.equal(verifyScore(paused),null);
 const post=structuredClone(base);post.replay.push({atMs:base.finishMs,action:{type:'speed-pause',paused:true}});assert.equal(verifyScore(post),null);
 const fractional=structuredClone(base);fractional.replay[1].atMs=.1;assert.equal(verifyScore(fractional),null);
 const reversed=structuredClone(base);reversed.replay.reverse();assert.equal(verifyScore(reversed),null);
});
test('resource caps reject long horizons and large logs before simulation',()=>{
 const base=legitimate.score;
 assert.equal(verifyScore({...base,finishMs:REPLAY_LIMITS.maxFinishMs+250}),null);
 assert.equal(verifyScore({...base,replay:Array(REPLAY_LIMITS.maxActions+1).fill(base.replay[0])}),null);
 let elapsed=0;assert.throws(()=>verifyScore(base,()=>elapsed+=REPLAY_LIMITS.maxReplayMs+1),ReplayBudgetExceeded);
});
test('recorder excludes failed clicks and practice; frozen transcript survives practice and is detached on save',()=>{
 const {score,state}=legitimate,replay=structuredClone(score.replay);
 const initial=newSpeedGame(),action={type:'scan'} as const;
 assert.deepEqual(recordScoreAction([],initial,action,act(initial,action)),[]);
 const practice=advance(continueSpeedPractice(state),60),pause={type:'speed-pause',paused:true} as const;
 assert.equal(recordScoreAction(replay,practice,pause,act(practice,pause)),replay);
 const frozen=resultSubmission(practice,score.runId,score.name,replay);assert.deepEqual(frozen,score);
 replay.push({atMs:practice.time*1000,action:pause});assert.deepEqual(frozen,score);
 const capped=Array(REPLAY_LIMITS.maxActions).fill(score.replay[0]);
 const resume={type:'speed-pause',paused:false} as const;assert.equal(recordScoreAction(capped,initial,resume,act(initial,resume)),null);
 assert.equal(resultSubmission(state,randomUUID(),'Too many actions',null),null);
});
