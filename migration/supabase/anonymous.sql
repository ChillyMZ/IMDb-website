-- Silent anonymous accounts (made on a visitor's first rating). Hidden from people search and
-- invite rewards until they create a real account.
alter table chillymz.profiles add column if not exists anonymous boolean not null default false;
