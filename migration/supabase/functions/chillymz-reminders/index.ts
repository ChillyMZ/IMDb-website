// Streak reminders. Called hourly by pg_cron (with a shared secret); sends one web push per
// subscribed reader per day, around 7pm their time, when they have a streak and haven't been active today.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {createClient} from 'npm:@supabase/supabase-js@2.117.2';
import webpush from 'npm:web-push@3.6.7';
import {localDay,shouldRemind,reminderText} from './streak.ts';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}}).schema('chillymz');
webpush.setVapidDetails('https://chillymz.github.io/IMDb-website/',Deno.env.get('VAPID_PUBLIC_KEY')!,Deno.env.get('VAPID_PRIVATE_KEY')!);
const SITE='https://chillymz.github.io/IMDb-website/';

Deno.serve(async req=>{
 if(req.headers.get('x-cron-secret')!==Deno.env.get('REMINDER_CRON_SECRET'))return new Response('Forbidden',{status:403});
 const body=await req.json().catch(()=>({})),dry=!!body.dry,now=Date.now();
 const {data:subs,error}=await db.from('push_subscriptions').select('*');if(error)return Response.json({error:error.message},{status:500});
 // Owner check that sending works end to end: {"test":"<endpoint>"} pushes a test message to that one subscription.
 if(typeof body.test==='string'){const s=(subs||[]).find((x:any)=>x.endpoint===body.test);if(!s)return Response.json({error:'No such subscription.'},{status:404});try{const r=await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},JSON.stringify({title:'ChillyMZ reminders are on',body:'This is a test notification.',url:SITE}),{TTL:600});return Response.json({status:r.statusCode})}catch(e:any){return Response.json({error:String(e?.body||e?.message),status:e?.statusCode},{status:502})}}
 const users=[...new Set((subs||[]).map((s:any)=>s.user))];if(!users.length)return Response.json({subscriptions:0,sent:0});
 const since=new Date(now-400*86400000).toISOString();
 const [r,d,c,v,x]=await Promise.all([
  db.from('ratings').select('user,date').in('user',users).gte('date',since),
  db.from('discussions').select('user,created').in('user',users).gte('created',since),
  db.from('comments').select('user,created').in('user',users).gte('created',since),
  db.from('chapter_reviews').select('user,updated').in('user',users).gte('updated',since),
  db.from('streak_restores').select('user,day').in('user',users)]);
 const fail=[r,d,c,v,x].find(q=>q.error);if(fail)return Response.json({error:fail.error!.message},{status:500});
 const acts=new Map<string,string[]>();const add=(u:string,t:string)=>{const a=acts.get(u)||[];a.push(t);acts.set(u,a)};
 for(const q of r.data||[])add(q.user,q.date);for(const q of d.data||[])add(q.user,q.created);for(const q of c.data||[])add(q.user,q.created);for(const q of v.data||[])add(q.user,q.updated);
 const restores=new Map<string,string[]>();for(const q of x.data||[]){const a=restores.get(q.user)||[];a.push(String(q.day));restores.set(q.user,a)}
 let sent=0,removed=0,checked=0;const due:any[]=[];
 for(const s of subs||[]){checked++;const days=new Set([...(acts.get(s.user)||[]).map(t=>localDay(t,s.tz_offset)),...(restores.get(s.user)||[])]);
  const go=shouldRemind({now,tz:s.tz_offset,days,lastSent:s.last_sent?String(s.last_sent):null});if(go)due.push({s,...go})}
 if(dry)return Response.json({subscriptions:checked,due:due.length});
 for(const {s,today,streak} of due){
  try{await webpush.sendNotification({endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},JSON.stringify({...reminderText(streak),url:SITE,tag:'streak'}),{TTL:4*3600,urgency:'normal'});sent++;
   await db.from('push_subscriptions').update({last_sent:today}).eq('endpoint',s.endpoint)}
  catch(e:any){if(e?.statusCode===404||e?.statusCode===410){await db.from('push_subscriptions').delete().eq('endpoint',s.endpoint);removed++}else console.error('push failed',e?.statusCode,e?.body||e?.message)}}
 return Response.json({subscriptions:checked,due:due.length,sent,removed});
});
