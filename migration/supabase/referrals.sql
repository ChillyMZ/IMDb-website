-- Invite a friend: who invited whom. One inviter per reader. Service role only.
create table if not exists chillymz.referrals (invitee text primary key, inviter text not null, created timestamptz not null default now(), check (invitee <> inviter));
create index if not exists referrals_inviter on chillymz.referrals(inviter);
alter table chillymz.referrals enable row level security;
revoke all on chillymz.referrals from public, anon, authenticated;
grant select, insert, update, delete on chillymz.referrals to service_role;
