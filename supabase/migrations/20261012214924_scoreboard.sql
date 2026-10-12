-- Public result data is separated from submission ownership and validation facts.
create schema if not exists scoreboard_private;
revoke all on schema scoreboard_private from public, anon, authenticated;
grant usage on schema scoreboard_private to service_role;

create table public.scoreboard_rules (
 id text primary key, label text not null, mode text not null check (mode = 'speed'),
 accepting boolean not null default true,
 gold_ms integer not null, silver_ms integer not null, bronze_ms integer not null,
 check (gold_ms <= silver_ms and silver_ms <= bronze_ms)
);
insert into public.scoreboard_rules values ('speed-d128-v1','Speed Game · golden systems v1','speed',true,420000,450000,480000);
alter table public.scoreboard_rules enable row level security;
revoke all on public.scoreboard_rules from anon, authenticated;
grant select on public.scoreboard_rules to anon, authenticated;
grant all on public.scoreboard_rules to service_role;
create policy scoreboard_rules_read on public.scoreboard_rules for select to anon, authenticated using (true);

create table public.scoreboard_scores (
 run_id uuid primary key,
 rules_version text not null references public.scoreboard_rules(id),
 display_name text not null check (display_name = btrim(display_name) and char_length(display_name) between 1 and 30 and display_name !~ '[[:cntrl:]]'),
 finish_ms integer not null check (finish_ms > 0 and finish_ms % 500 = 0),
 submitted_at timestamptz not null default now()
);
create index scoreboard_order on public.scoreboard_scores(rules_version, finish_ms, submitted_at, run_id);
create index scoreboard_submitted on public.scoreboard_scores(submitted_at);
alter table public.scoreboard_scores enable row level security;
revoke all on public.scoreboard_scores from anon, authenticated;
grant select on public.scoreboard_scores to anon, authenticated;
grant all on public.scoreboard_scores to service_role;
create policy scoreboard_scores_read on public.scoreboard_scores for select to anon, authenticated using (true);

create table scoreboard_private.submissions (
 run_id uuid primary key references public.scoreboard_scores(run_id) on delete cascade,
 -- Do not cascade-delete public scores when anonymous accounts are cleaned up.
 owner_id uuid not null, facts jsonb not null, submitted_at timestamptz not null default now()
);
create index scoreboard_owner_time on scoreboard_private.submissions(owner_id, submitted_at);
alter table scoreboard_private.submissions enable row level security;
revoke all on scoreboard_private.submissions from public, anon, authenticated;
grant all on scoreboard_private.submissions to service_role;

-- This privileged write API is available only to the server, never the browser.
-- SECURITY INVOKER preserves role permissions; no public SECURITY DEFINER bypass.
create function public.submit_scoreboard_score(p_owner uuid, p_score jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_run uuid; v_owner uuid; v_ms integer;
begin
 if p_owner is null then raise exception 'Missing player' using errcode='22023'; end if;
 v_run := (p_score->>'runId')::uuid;
 v_ms := (p_score->>'finishMs')::integer;
 if v_run is null or v_ms is null or not coalesce(
   p_score->>'mode' = 'speed' and p_score->>'rulesVersion' = 'speed-d128-v1'
   and (p_score->>'seed')::bigint = 1 and (p_score->>'covered')::integer = 15
   and (p_score->>'modules')::integer = 3 and (p_score->>'health')::numeric between 0 and 100
   and (p_score->>'trialSeconds')::numeric = 0 and (p_score->>'autoScans')::bigint >= 0
   and (p_score->>'autoRepairs')::bigint >= 0 and (p_score->>'credits')::numeric >= 0
   and p_score->>'netIncome' is not null and p_score->>'practice' = 'false',false)
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

-- Stable ordering, competition ranks for exact ties, and an independent highlight.
create function public.scoreboard_page(p_version text, p_page integer default 0, p_highlight uuid default null)
returns jsonb language sql stable security invoker set search_path = '' as $$
 with ranked as (
  select s.*, rank() over(order by s.finish_ms) as rank,
   case when s.finish_ms<=r.gold_ms then 'gold' when s.finish_ms<=r.silver_ms then 'silver' when s.finish_ms<=r.bronze_ms then 'bronze' else null end as medal
  from public.scoreboard_scores s join public.scoreboard_rules r on r.id=s.rules_version
  where s.rules_version=p_version
 ), page_rows as (
  select run_id,display_name,finish_ms,submitted_at,rank,medal from ranked
  order by finish_ms,submitted_at,run_id limit 20 offset greatest(0,least(coalesce(p_page,0),1000000))*20
 ), highlighted as (
  select run_id,display_name,finish_ms,submitted_at,rank,medal from ranked where run_id=p_highlight
 )
 select jsonb_build_object('entries',coalesce((select jsonb_agg(to_jsonb(p) order by p.finish_ms,p.submitted_at,p.run_id) from page_rows p),'[]'::jsonb),
  'total',(select count(*) from ranked),'page',greatest(0,least(coalesce(p_page,0),1000000)),'pageSize',20,
  'highlight',(select to_jsonb(h) from highlighted h));
$$;
revoke all on function public.scoreboard_page(text,integer,uuid) from public;
grant execute on function public.scoreboard_page(text,integer,uuid) to anon, authenticated, service_role;
