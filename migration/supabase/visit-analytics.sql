-- Owner-only, consent-based navigation and return-visit measurement.
create table if not exists chillymz.visit_events (
 id uuid primary key, visitor uuid not null, session uuid not null,
 reader text, event text not null check(event in ('view','heartbeat','exit','rating_saved','discussion_posted','reply_posted','search_empty','signup_started','signup_completed','signin_completed','action_error')),
 view text not null, book text, chapter integer, duration_ms integer not null default 0 check(duration_ms between 0 and 120000),
 device text not null check(device in ('mobile','desktop')), source text not null,
 code text, load_ms integer, created timestamptz not null default now()
);
create index if not exists visit_events_created on chillymz.visit_events(created);
create index if not exists visit_events_visitor on chillymz.visit_events(visitor,created);
create index if not exists visit_events_reader on chillymz.visit_events(reader,created);
alter table chillymz.visit_events enable row level security;
revoke all on chillymz.visit_events from public,anon,authenticated;
grant select,insert,delete on chillymz.visit_events to service_role;
-- Delete detailed logs after 90 days, including on days with no website visits.
create or replace function chillymz.prune_visit_events() returns void language sql security invoker set search_path='' as $$ delete from chillymz.visit_events where created < now()-interval '90 days'; $$;
revoke all on function chillymz.prune_visit_events() from public,anon,authenticated;
grant execute on function chillymz.prune_visit_events() to service_role;
-- The analytics endpoint also prunes on requests; pg_cron schedules daily cleanup when available.
do $$ begin
 if exists(select 1 from pg_extension where extname='pg_cron') then
  if not exists(select 1 from cron.job where jobname='chillymz-prune-visits') then
   perform cron.schedule('chillymz-prune-visits','17 3 * * *','select chillymz.prune_visit_events()');
  end if;
 end if;
end $$;
