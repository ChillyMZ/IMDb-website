-- Owner-only search insights: what readers type into the book search, with how many books matched.
-- Anonymous on purpose: no reader, visitor or session id is stored. Only sent with analytics consent.
create table if not exists chillymz.search_queries (
 id uuid primary key, query text not null check(char_length(query) between 2 and 80),
 results integer not null check(results between 0 and 100000), created timestamptz not null default now()
);
create index if not exists search_queries_created on chillymz.search_queries(created);
alter table chillymz.search_queries enable row level security;
revoke all on chillymz.search_queries from public,anon,authenticated;
grant select,insert,delete on chillymz.search_queries to service_role;
-- Same 90-day retention as visit analytics (prune_visit_events now clears both).
create or replace function chillymz.prune_visit_events() returns void language sql security invoker set search_path='' as $$
 delete from chillymz.visit_events where created < now()-interval '90 days';
 delete from chillymz.search_queries where created < now()-interval '90 days';
$$;
revoke all on function chillymz.prune_visit_events() from public,anon,authenticated;
grant execute on function chillymz.prune_visit_events() to service_role;
