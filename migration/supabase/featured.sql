-- Site-wide settings written by the owner (e.g. Book of the week). Service role only.
create table if not exists chillymz.site_settings (key text primary key, value jsonb not null, updated timestamptz not null default now());
alter table chillymz.site_settings enable row level security;
revoke all on chillymz.site_settings from public, anon, authenticated;
grant select, insert, update, delete on chillymz.site_settings to service_role;
