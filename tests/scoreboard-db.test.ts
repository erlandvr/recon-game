import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {SCORE_RULES,type ScorePage} from '../supabase/functions/_shared/scoreboard.ts';
import {verifyScore} from '../supabase/functions/_shared/verifyScore.ts';
import {databaseBackend,paidScore,scoreboardDb} from './helpers/scoreboard.ts';

const verified=verifyScore(paidScore().score)!;
test('verified storage: least privilege, combined ranking, ties, pagination and idempotency',async()=>{
 const db=await scoreboardDb();try{
  const api=databaseBackend(db),owner=randomUUID(),id=randomUUID();
  // The RPC trusts its service-role caller; gameplay verification is tested at the HTTP boundary.
  const score=(runId=id,finishMs=500250)=>({...verified,runId,finishMs,name:'Élodie 李'});
  const submit=async(data=score(),player=owner)=>{await api.prepare(player,data.runId);return api.store(player,data);};
  const receipt=await submit();assert.deepEqual(await submit(),receipt);
  assert.deepEqual(await submit({...score(),name:'Changed',finishMs:600000}),receipt);
  await assert.rejects(submit(score(),randomUUID()),/another player/);
  await assert.rejects(db.query('select public.submit_scoreboard_score($1,$2)',[owner,JSON.stringify(score())]),/does not exist/);
  await assert.rejects(submit({...score(randomUUID()),rulesVersion:'speed-d129-v1'}),/Invalid verified result/);
  await assert.rejects(api.store(owner,score(randomUUID())),/not prepared/);
  for(const change of [{verification:'browser-claim'},{health:35},{credits:34},{finishMs:1800250},{replay:[]},{replay:null}])await assert.rejects(api.store(owner,{...score(randomUUID()),...change} as typeof verified),/Invalid/);
  // Historical rows are preserved and cannot be promoted through an idempotent retry.
  const legacyId=randomUUID();
  await db.query("insert into public.scoreboard_scores values($1,'speed-d129-v1','Historical',60000,now());",[legacyId]);
  await db.query('insert into scoreboard_private.submissions(run_id,owner_id,facts) values($1,$2,$3)',[legacyId,owner,JSON.stringify({})]);
  await assert.rejects(api.prepare(owner,legacyId),/Historical/);
  await assert.rejects(api.store(owner,score(legacyId)),/Historical/);
  assert.equal((await db.query<{accepting:boolean}>("select accepting from public.scoreboard_rules where id='speed-d129-v1'")).rows[0].accepting,false);
  for(let i=0;i<24;i++)await submit(score(randomUUID(),i<2?100000:100000+i*500),randomUUID());
  const page=async(n=0,version:string=SCORE_RULES.id)=>(await db.query<{page:ScorePage}>('select public.scoreboard_page($1,$2,$3) as page',[version,n,id])).rows[0].page;
  for(const role of ['anon','authenticated']){
   await db.exec(`set role ${role}`);
   const first=await page();assert.equal(first.total,26);assert.equal(first.entries.length,20);assert.deepEqual(first.entries.slice(0,4).map(s=>s.rank),[1,2,2,4]);assert.equal(first.highlight?.rank,26);assert.equal(first.highlight?.medal,null);
   assert.deepEqual(Object.keys(first.entries[0]).sort(),['display_name','finish_ms','medal','rank','run_id','submitted_at']);
   assert.equal((await page(1)).entries.length,6);assert.deepEqual(await page(0,'speed-d129-v1'),first);
   const historical=(await db.query<{page:ScorePage}>('select public.scoreboard_page($1,0,$2) as page',[SCORE_RULES.id,legacyId])).rows[0].page;assert.equal(historical.highlight?.rank,1);assert.equal(historical.highlight?.medal,'gold');
   assert.equal((await page(0,'speed-d128-v1')).total,0);assert.equal((await page(0,'unknown')).total,0);
   await assert.rejects(api.prepare(owner,id),/permission denied/);
   await assert.rejects(api.store(owner,score()),/permission denied/);
   for(const table of ['submissions','verification_attempts'])await assert.rejects(db.query(`select * from scoreboard_private.${table}`),/permission denied/);
   for(const sql of ["insert into public.scoreboard_scores(run_id,rules_version,display_name,finish_ms) values(gen_random_uuid(),'speed-d129-verified-v1','x',1000)","update public.scoreboard_scores set display_name='x'",'delete from public.scoreboard_scores'])await assert.rejects(db.exec(sql),/permission denied/);
  }
  await db.exec('set role service_role');await db.exec('update public.scoreboard_rules set accepting=false');
  assert.deepEqual(await api.prepare(owner,id),receipt,'receipts survive board closure');
  await assert.rejects(submit(score(randomUUID()),randomUUID()),/no longer accepts/);
 }finally{await db.close();}
});
test('attempt rate limits cover failed replays, expire, and exempt saved retries',async()=>{
 const db=await scoreboardDb();try{
  const api=databaseBackend(db),owner=randomUUID();
  await api.prepare(owner,verified.runId);const saved=await api.store(owner,verified);
  for(let i=0;i<9;i++)await api.prepare(owner,randomUUID());
  await assert.rejects(api.prepare(owner,randomUUID()),/Please wait/);
  assert.deepEqual(await api.prepare(owner,verified.runId),saved);
  await db.exec("update scoreboard_private.verification_attempts set attempted_at=now()-interval '6 minutes'");
  await api.prepare(owner,randomUUID());
  for(let i=1;i<120;i++)await api.prepare(randomUUID(),randomUUID());
  await assert.rejects(api.prepare(randomUUID(),randomUUID()),/Please wait/);
  assert.deepEqual(await api.prepare(owner,verified.runId),saved);
  await db.exec("update scoreboard_private.verification_attempts set attempted_at=now()-interval '2 hours'");
  await api.prepare(owner,randomUUID());
  assert.equal((await db.query<{n:number}>('select count(*)::int as n from scoreboard_private.verification_attempts')).rows[0].n,1);
 }finally{await db.close();}
});
test('successful writes retain hourly and global caps, including concurrent duplicate saves',async()=>{
 const db=await scoreboardDb();try{
  const api=databaseBackend(db),owner=randomUUID();
  await api.prepare(owner,verified.runId);
  const [a,b]=await Promise.all([api.store(owner,verified),api.store(owner,verified)]);assert.deepEqual(a,b);
  for(let i=1;i<10;i++){const score={...verified,runId:randomUUID()};await api.prepare(owner,score.runId);await api.store(owner,score);}
  await db.exec("update scoreboard_private.verification_attempts set attempted_at=now()-interval '6 minutes'");
  await assert.rejects(api.prepare(owner,randomUUID()),/Please wait/);
  // Simulate already-verified recent rows to exercise the atomic write cap independently.
  for(let i=10;i<120;i++)await db.query('insert into public.scoreboard_scores values($1,$2,$3,$4,now())',[randomUUID(),SCORE_RULES.id,'Existing verified result',200000]);
  const other=randomUUID(),score={...verified,runId:randomUUID()};await api.prepare(other,score.runId);
  await assert.rejects(api.store(other,score),/Please wait/);
  assert.deepEqual(await api.store(owner,verified),a);
 }finally{await db.close();}
});
