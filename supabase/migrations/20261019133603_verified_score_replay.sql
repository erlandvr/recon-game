-- Close the summary-only write path before the new frontend is published.
-- Historical rows remain readable; none can be promoted to the verified board.
update public.scoreboard_rules set accepting=false where id in ('speed-d128-v1','speed-d129-v1');
insert into public.scoreboard_rules values ('speed-d129-verified-v1','Speed Game · verified finishes','speed',true,420000,450000,480000);
drop function public.submit_scoreboard_score(uuid,jsonb);

-- Attempts, including rejected replays, consume a budget before CPU work begins.
create table scoreboard_private.verification_attempts (
 owner_id uuid not null, run_id uuid not null, attempted_at timestamptz not null default now()
);
create index verification_attempt_time on scoreboard_private.verification_attempts(attempted_at);
create index verification_attempt_owner on scoreboard_private.verification_attempts(owner_id,attempted_at);
alter table scoreboard_private.verification_attempts enable row level security;
revoke all on scoreboard_private.verification_attempts from public,anon,authenticated;
grant all on scoreboard_private.verification_attempts to service_role;

create function public.prepare_score_verification(p_owner uuid,p_run uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_owner uuid; v_version text; v_receipt jsonb;
begin
 if p_owner is null or p_run is null then raise exception 'Missing player or run' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(73190241);
 select p.owner_id,s.rules_version,jsonb_build_object('run_id',s.run_id,'display_name',s.display_name,'finish_ms',s.finish_ms,'submitted_at',s.submitted_at)
 into v_owner,v_version,v_receipt from scoreboard_private.submissions p join public.scoreboard_scores s using(run_id) where s.run_id=p_run;
 if found then
  if v_owner<>p_owner then raise exception 'Run belongs to another player' using errcode='42501'; end if;
  if v_version<>'speed-d129-verified-v1' then raise exception 'Historical run cannot be verified' using errcode='22023'; end if;
  return v_receipt;
 end if;
 if not exists(select 1 from public.scoreboard_rules where id='speed-d129-verified-v1' and accepting)
 then raise exception 'This rules version no longer accepts scores' using errcode='22023'; end if;
 delete from scoreboard_private.verification_attempts where attempted_at<now()-interval '1 hour';
 if (select count(*) from scoreboard_private.verification_attempts where owner_id=p_owner and attempted_at>now()-interval '5 minutes')>=10
 or (select count(*) from scoreboard_private.verification_attempts where attempted_at>now()-interval '5 minutes')>=120
 or (select count(*) from scoreboard_private.submissions where owner_id=p_owner and submitted_at>now()-interval '1 hour')>=10
 then raise exception 'Please wait before another verification' using errcode='P0001'; end if;
 insert into scoreboard_private.verification_attempts(owner_id,run_id) values(p_owner,p_run);
 return null;
end; $$;
revoke all on function public.prepare_score_verification(uuid,uuid) from public,anon,authenticated;
grant execute on function public.prepare_score_verification(uuid,uuid) to service_role;

-- Only the trusted Edge Function calls this with facts recomputed by verifyScore.
-- A verification flag from the browser is never forwarded to this function.
create function public.submit_verified_score(p_owner uuid,p_score jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_run uuid; v_owner uuid; v_ms integer; v_version text; v_receipt jsonb;
begin
 if p_owner is null then raise exception 'Missing player' using errcode='22023'; end if;
 v_run:=(p_score->>'runId')::uuid;
 v_ms:=(p_score->>'finishMs')::integer;
 if v_run is null or v_ms is null or not coalesce(
  p_score->>'verification'='replay-v1' and p_score->>'mode'='speed' and p_score->>'rulesVersion'='speed-d129-verified-v1'
  and v_ms between 5000 and 1800000 and mod(v_ms,250)=0
  and (p_score->>'seed')::bigint=1 and (p_score->>'covered')::integer=15 and (p_score->>'modules')::integer=3
  and (p_score->>'health')::numeric between 90 and 100
  and (p_score->>'trialSeconds')::numeric>=5 and (p_score->>'trialSeconds')::numeric*1000<=v_ms and mod((p_score->>'trialSeconds')::numeric*1000,250)=0
  and (p_score->>'autoScans')::bigint>0 and (p_score->>'autoRepairs')::bigint>0
  and (p_score->>'credits')::numeric>=35 and (p_score->>'netIncome')::numeric>=0 and p_score->>'practice'='false'
  and jsonb_typeof(p_score->'replay')='array',false)
 then raise exception 'Invalid verified result' using errcode='22023'; end if;
 if jsonb_array_length(p_score->'replay') not between 1 and 2000 then raise exception 'Invalid replay size' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(73190241);
 select p.owner_id,s.rules_version,jsonb_build_object('run_id',s.run_id,'display_name',s.display_name,'finish_ms',s.finish_ms,'submitted_at',s.submitted_at)
 into v_owner,v_version,v_receipt from scoreboard_private.submissions p join public.scoreboard_scores s using(run_id) where s.run_id=v_run;
 if found then
  if v_owner<>p_owner then raise exception 'Run belongs to another player' using errcode='42501'; end if;
  if v_version<>'speed-d129-verified-v1' then raise exception 'Historical run cannot be verified' using errcode='22023'; end if;
  return v_receipt;
 end if;
 if not exists(select 1 from public.scoreboard_rules where id='speed-d129-verified-v1' and accepting)
 then raise exception 'This rules version no longer accepts scores' using errcode='22023'; end if;
 if not exists(select 1 from scoreboard_private.verification_attempts where owner_id=p_owner and run_id=v_run and attempted_at>now()-interval '5 minutes')
 then raise exception 'Verification was not prepared' using errcode='22023'; end if;
 if (select count(*) from scoreboard_private.submissions where owner_id=p_owner and submitted_at>now()-interval '1 hour')>=10
 or (select count(*) from public.scoreboard_scores where submitted_at>now()-interval '5 minutes')>=120
 then raise exception 'Please wait before saving another score' using errcode='P0001'; end if;
 insert into public.scoreboard_scores(run_id,rules_version,display_name,finish_ms)
 values(v_run,'speed-d129-verified-v1',p_score->>'name',v_ms);
 insert into scoreboard_private.submissions(run_id,owner_id,facts) values(v_run,p_owner,p_score-'name');
 select jsonb_build_object('run_id',run_id,'display_name',display_name,'finish_ms',finish_ms,'submitted_at',submitted_at) into v_receipt
 from public.scoreboard_scores where run_id=v_run;
 return v_receipt;
end; $$;
revoke all on function public.submit_verified_score(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.submit_verified_score(uuid,jsonb) to service_role;
