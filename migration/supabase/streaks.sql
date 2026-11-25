-- Streak restores (1 free per calendar month) and web-push subscriptions for streak reminders.
create table if not exists chillymz.streak_restores ("user" text not null, day date not null, created timestamptz not null default now(), primary key ("user", day));
create table if not exists chillymz.push_subscriptions (
 endpoint text primary key, "user" text not null, p256dh text not null, auth text not null,
 tz_offset integer not null default 0, created timestamptz not null default now(), last_sent date
);
create index if not exists push_subscriptions_user on chillymz.push_subscriptions("user");
alter table chillymz.streak_restores enable row level security;
alter table chillymz.push_subscriptions enable row level security;
revoke all on chillymz.streak_restores from public, anon, authenticated;
revoke all on chillymz.push_subscriptions from public, anon, authenticated;
grant select, insert, update, delete on chillymz.streak_restores to service_role;
grant select, insert, update, delete on chillymz.push_subscriptions to service_role;
