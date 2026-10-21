-- D132: the owner trusts existing D129 scores. Rank them with new submissions.
-- Preserve original facts, versions and verification metadata; only reads change.
-- Both D129 request IDs return the same board for compatibility with open tabs.
create or replace function public.scoreboard_page(p_version text, p_page integer default 0, p_highlight uuid default null)
returns jsonb language sql stable security invoker set search_path = '' as $$
 with ranked as (
  select s.*, rank() over(order by s.finish_ms) as rank,
   case when s.finish_ms<=r.gold_ms then 'gold' when s.finish_ms<=r.silver_ms then 'silver' when s.finish_ms<=r.bronze_ms then 'bronze' else null end as medal
  from public.scoreboard_scores s join public.scoreboard_rules r on r.id=s.rules_version
  where case when p_version in ('speed-d129-v1','speed-d129-verified-v1')
   then s.rules_version in ('speed-d129-v1','speed-d129-verified-v1')
   else s.rules_version=p_version end
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
