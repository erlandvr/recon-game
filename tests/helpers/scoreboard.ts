import {readFile,readdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {playSpeed} from '../../scripts/speed-benchmark.ts';
import {act,advance,newSpeedGame} from '../../src/game.ts';
import {resultSubmission} from '../../src/scoreResult.ts';
import {recordScoreAction} from '../../src/scoreReplay.ts';
import type {ReplayEvent} from '../../supabase/functions/_shared/replayContract.ts';
import type {ScoreReceipt,ScoreBackend} from '../../supabase/functions/_shared/submitScoreHandler.ts';

export function paidScore(options:Parameters<typeof playSpeed>[0]={route:'all',reaction:3,beforeModel:4}){
 const plan=playSpeed(options);if(!plan.result)throw new Error('Fixture must finish');
 let state=newSpeedGame(),replay:ReplayEvent[]|null=[];
 const actions=[{at:0,action:{type:'speed-pause',paused:false} as const},...plan.actions];
 for(const {at,action} of actions){state=advance(state,at-state.time);const next=act(state,action);replay=recordScoreAction(replay,state,action,next);state=next.state;}
 state=advance(state,plan.result.at-state.time);
 const score=resultSubmission(state,randomUUID(),'Replay test',replay);if(!score)throw new Error('Fixture must have a submission');
 return {score,state,plan};
}
export async function scoreboardDb(){
 const db=new PGlite();
 await db.exec('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon,authenticated,service_role;');
 const directory=new URL('../../supabase/migrations/',import.meta.url);
 for(const name of (await readdir(directory)).filter(n=>n.endsWith('.sql')).sort())await db.exec(await readFile(new URL(name,directory),'utf8'));
 await db.exec('set role service_role');return db;
}
export function databaseBackend(db:PGlite,owner=randomUUID()):ScoreBackend {
 return {
  authenticate:async token=>token==='valid-test-session'?owner:null,
  prepare:async(player,runId)=>(await db.query<{receipt:ScoreReceipt|null}>('select public.prepare_score_verification($1,$2) as receipt',[player,runId])).rows[0].receipt,
  store:async(player,score)=>(await db.query<{receipt:ScoreReceipt}>('select public.submit_verified_score($1,$2) as receipt',[player,JSON.stringify(score)])).rows[0].receipt,
 };
}
