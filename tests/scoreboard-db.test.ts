import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {SCORE_RULES,type ScorePage} from '../supabase/functions/_shared/scoreboard.ts';

test('Postgres scoreboard: permissions, idempotency, shared ranks, pagination, versions and rate caps',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon,authenticated,service_role;');
  await db.exec(await readFile(new URL('../supabase/migrations/20261012214924_scoreboard.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/20261012215440_speed_d129_healthy_recovery.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/20261012215745_scoreboard_trial_duration.sql',import.meta.url),'utf8'));
  const owner=randomUUID(),id=randomUUID();
  const score=(runId=id,finishMs=500250)=>({runId,name:'Élodie 李',mode:'speed',rulesVersion:SCORE_RULES.id,finishMs,seed:1,covered:15,modules:3,health:95,trialSeconds:5,autoScans:1,autoRepairs:1,credits:35,netIncome:10,practice:false});
  const submit=(data=score(),user=owner)=>db.query('select public.submit_scoreboard_score($1,$2)',[user,JSON.stringify(data)]);
  await db.exec('set role service_role');await submit();await submit();
  await assert.rejects(submit(score(),randomUUID()),/another player/);
  await assert.rejects(submit({...score(randomUUID()),covered:14}),/Invalid result/);
  for(const bad of [{health:35},{trialSeconds:0},{autoScans:0},{autoRepairs:0},{credits:34},{netIncome:-1}])await assert.rejects(submit({...score(randomUUID()),...bad}),/Invalid result/);
  await assert.rejects(submit({...score(randomUUID()),rulesVersion:'old'}),/Invalid result/);
  await assert.rejects(submit({...score(randomUUID()),name:' '}),/check constraint/);
  for(let i=0;i<24;i++)await submit(score(randomUUID(),i<2?100000:100000+i*500),randomUUID());
  const page=async(n=0,version:string=SCORE_RULES.id)=>(await db.query<{page:ScorePage}>('select public.scoreboard_page($1,$2,$3) as page',[version,n,id])).rows[0].page;
  for(const role of ['anon','authenticated']){
   await db.exec(`set role ${role}`);
   const first=await page();assert.equal(first.total,25);assert.equal(first.entries.length,20);assert.deepEqual(first.entries.slice(0,3).map(s=>s.rank),[1,1,3]);assert.equal(first.highlight?.rank,25);assert.equal(first.highlight?.medal,null);
   assert.deepEqual(Object.keys(first.entries[0]).sort(),['display_name','finish_ms','medal','rank','run_id','submitted_at']);
   const second=await page(1);assert.equal(second.entries.length,5);assert.equal(second.entries[0].rank,21);assert.equal((await page(0,'old')).total,0);
   await assert.rejects(submit(),/permission denied/);
   await assert.rejects(db.query('select * from scoreboard_private.submissions'),/permission denied/);
   for(const sql of ["insert into public.scoreboard_scores(run_id,rules_version,display_name,finish_ms) values(gen_random_uuid(),'speed-d128-v1','x',1000)","update public.scoreboard_scores set display_name='x'",'delete from public.scoreboard_scores'])await assert.rejects(db.exec(sql),/permission denied/);
  }
  await db.exec('set role service_role');
  for(let i=0;i<9;i++)await submit(score(randomUUID()));
  await assert.rejects(submit(score(randomUUID())),/Please wait/);await submit();
  await db.exec('update public.scoreboard_rules set accepting=false');await submit();await assert.rejects(submit(score(randomUUID()),randomUUID()),/no longer accepts/);
  await db.exec('update public.scoreboard_rules set accepting=true');
  for(let i=34;i<120;i++)await submit(score(randomUUID()),randomUUID());
  await assert.rejects(submit(score(randomUUID()),randomUUID()),/Please wait/);
  assert.equal((await page()).total,120);
 }finally{await db.close();}
});
