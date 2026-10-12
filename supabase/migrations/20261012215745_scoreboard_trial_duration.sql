-- The healthy check may continue past five seconds until both automatic job types have run.
create or replace function public.submit_scoreboard_score(p_owner uuid, p_score jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_run uuid; v_owner uuid; v_ms integer;
begin
 if p_owner is null then raise exception 'Missing player' using errcode='22023'; end if;
 v_run := (p_score->>'runId')::uuid;
 v_ms := (p_score->>'finishMs')::integer;
 if v_run is null or v_ms is null or not coalesce(
   p_score->>'mode' = 'speed' and p_score->>'rulesVersion' = 'speed-d129-v1'
   and (p_score->>'seed')::bigint = 1 and (p_score->>'covered')::integer = 15
   and (p_score->>'modules')::integer = 3 and (p_score->>'health')::numeric between 90 and 100
   and (p_score->>'trialSeconds')::numeric >= 5 and (p_score->>'trialSeconds')::numeric * 1000 <= v_ms and mod((p_score->>'trialSeconds')::numeric * 1000,250) = 0 and (p_score->>'autoScans')::bigint > 0
   and (p_score->>'autoRepairs')::bigint > 0 and (p_score->>'credits')::numeric >= 35
   and (p_score->>'netIncome')::numeric >= 0 and p_score->>'practice' = 'false',false)
 then raise exception 'Invalid result' using errcode='22023'; end if;
 -- Serialize the short transaction so retries and rate caps are atomic.
 perform pg_advisory_xact_lock(73190241);
 select owner_id into v_owner from scoreboard_private.submissions where run_id=v_run;
 if found then
   if v_owner <> p_owner then raise exception 'Run belongs to another player' using errcode='42501'; end if;
   return v_run;
 end if;
 if not exists(select 1 from public.scoreboard_rules where id=p_score->>'rulesVersion' and accepting)
 then raise exception 'This rules version no longer accepts scores' using errcode='22023'; end if;
 if (select count(*) from scoreboard_private.submissions where owner_id=p_owner and submitted_at>now()-interval '1 hour') >= 10
   or (select count(*) from public.scoreboard_scores where submitted_at>now()-interval '5 minutes') >= 120
 then raise exception 'Please wait before saving another score' using errcode='P0001'; end if;
 insert into public.scoreboard_scores(run_id,rules_version,display_name,finish_ms)
 values(v_run,p_score->>'rulesVersion',p_score->>'name',v_ms);
 insert into scoreboard_private.submissions(run_id,owner_id,facts) values(v_run,p_owner,p_score - 'name');
 return v_run;
end; $$;
revoke all on function public.submit_scoreboard_score(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.submit_scoreboard_score(uuid,jsonb) to service_role;
