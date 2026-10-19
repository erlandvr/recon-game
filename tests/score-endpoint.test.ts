import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createSubmitScoreHandler} from '../supabase/functions/_shared/submitScoreHandler.ts';
import {REPLAY_LIMITS} from '../supabase/functions/_shared/replayContract.ts';
import {databaseBackend,paidScore,scoreboardDb} from './helpers/scoreboard.ts';

const score=paidScore().score;
const request=(value:unknown,token='valid-test-session')=>new Request('http://local.invalid/submit-score',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(value)});
test('HTTP plus real PostgreSQL rejects forgeries and confirms a legitimate save across retries',async()=>{
 const db=await scoreboardDb();try{
  const owner=randomUUID(),api=databaseBackend(db,owner),handler=createSubmitScoreHandler(api);
  assert.equal((await handler(request(score,'invalid-session'))).status,401);
  assert.equal((await db.query<{n:number}>('select count(*)::int as n from scoreboard_private.verification_attempts')).rows[0].n,0);
  for(const finishMs of [5000,60000]){
   const forged={...score,runId:randomUUID(),finishMs,health:100,autoScans:1,autoRepairs:1,credits:35,netIncome:0,trialSeconds:5,replay:[{atMs:0,action:{type:'speed-pause',paused:false}}]};
   assert.equal((await handler(request(forged))).status,400);
   assert.equal((await handler(request({...forged,verification:'replay-v1'}))).status,400);
  }
  assert.equal((await handler(request({...score,runId:randomUUID(),credits:999999}))).status,400);
  assert.equal((await handler(request({...score,rulesVersion:'speed-d129-v1',replay:undefined}))).status,400);
  assert.equal((await db.query<{n:number}>('select count(*)::int as n from public.scoreboard_scores')).rows[0].n,0);
  const response=await handler(request(score));assert.equal(response.status,200);const receipt=await response.json();assert.equal(receipt.saved.finish_ms,score.finishMs);
  const retry=await handler(request(score));assert.equal(retry.status,200);assert.deepEqual(await retry.json(),receipt);
  assert.equal((await db.query<{n:number}>('select count(*)::int as n from public.scoreboard_scores')).rows[0].n,1);
  const facts=(await db.query<{facts:Record<string,unknown>}>('select facts from scoreboard_private.submissions where run_id=$1',[score.runId])).rows[0].facts;
  assert.equal(facts.verification,'replay-v1');assert.deepEqual(facts.replay,score.replay);assert.equal(facts.credits,score.credits);
  const stranger=createSubmitScoreHandler(databaseBackend(db));assert.equal((await stranger(request(score))).status,409);
  for(let i=0;i<4;i++)assert.equal((await handler(request({...score,runId:randomUUID(),credits:999999}))).status,400);
  assert.equal((await handler(request({...score,runId:randomUUID()}))).status,429);
  assert.equal((await handler(request(score))).status,200);
 }finally{await db.close();}
});
test('HTTP bounds streamed bodies without Content-Length and rejects malformed input before database work',async()=>{
 let calls=0;
 const handler=createSubmitScoreHandler({authenticate:async()=>{calls++;return null;},prepare:async()=>{calls++;return null;},store:async()=>{calls++;throw new Error('unexpected write');}});
 assert.equal((await handler(new Request('http://local.invalid',{method:'OPTIONS'}))).status,204);
 assert.equal((await handler(new Request('http://local.invalid'))).status,405);
 assert.equal((await handler(new Request('http://local.invalid',{method:'POST',body:'{}'}))).status,401);
 for(const body of ['{',JSON.stringify({...score,replay:[]}),JSON.stringify({...score,replay:Array(2001).fill(score.replay[0])}),JSON.stringify({...score,finishMs:1800250})]){
  assert.equal((await handler(new Request('http://local.invalid',{method:'POST',headers:{Authorization:'Bearer test'},body}))).status,400);
 }
 const chunks=[new Uint8Array(REPLAY_LIMITS.maxBytes),new Uint8Array(1)];
 const streamed=new Request('http://local.invalid',{method:'POST',headers:{Authorization:'Bearer test'},duplex:'half',body:new ReadableStream({pull(controller){const next=chunks.shift();if(next)controller.enqueue(next);else controller.close();}})} as RequestInit);
 assert.equal((await handler(streamed)).status,413);
 assert.equal(calls,0);
});
