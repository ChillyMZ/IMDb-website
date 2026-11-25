-- Hourly streak reminders: pg_cron calls the chillymz-reminders function, which sends at ~7pm in each
-- reader's time zone. The shared secret lives in Supabase Vault (also set as the function secret
-- REMINDER_CRON_SECRET, with VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY). Create it once with:
--   select vault.create_secret('<secret>','chillymz_reminder_cron_secret');
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule('chillymz-streak-reminders','5 * * * *', $job$
 select net.http_post(
  url:='https://ysxaabrbngghbhfdfcqy.supabase.co/functions/v1/chillymz-reminders',
  headers:=jsonb_build_object('Content-Type','application/json','x-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='chillymz_reminder_cron_secret')),
  body:='{}'::jsonb, timeout_milliseconds:=30000)
$job$);
