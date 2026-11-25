-- Social features: follows and Top 3 books. Read and written only by the chillymz-api function (service role).
create table if not exists chillymz.follows (
 follower text not null, followee text not null, created timestamptz not null default now(),
 primary key (follower, followee), check (follower <> followee)
);
create index if not exists follows_followee on chillymz.follows(followee);
create table if not exists chillymz.top_books (
 "user" text not null, slot smallint not null check (slot between 1 and 3), book text not null,
 primary key ("user", slot)
);
alter table chillymz.follows enable row level security;
alter table chillymz.top_books enable row level security;
revoke all on chillymz.follows from public, anon, authenticated;
revoke all on chillymz.top_books from public, anon, authenticated;
grant select, insert, delete on chillymz.follows to service_role;
grant select, insert, delete on chillymz.top_books to service_role;
-- Upserts (follow again, re-save Top 3) need update rights too.
grant update on chillymz.follows to service_role;
grant update on chillymz.top_books to service_role;
