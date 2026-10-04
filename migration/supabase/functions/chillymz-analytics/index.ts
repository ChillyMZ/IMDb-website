import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {createClient} from 'npm:@supabase/supabase-js@2.117.2';
const SUPABASE_URL=Deno.env.get('SUPABASE_URL')!,SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin=createClient(SUPABASE_URL,SERVICE,{auth:{persistSession:false,autoRefreshToken:false}}),db=admin.schema('chillymz');
class ApiError extends Error{constructor(public status:number,message:string){super(message)}}
function cors(req:Request){const origin=req.headers.get('origin')||'';let allow='';try{const u=new URL(origin);if(origin==='https://chillymz.github.io'||u.hostname.endsWith('.chatgpt.site')||['localhost','127.0.0.1'].includes(u.hostname))allow=origin}catch{}return {'Access-Control-Allow-Origin':allow||'https://chillymz.github.io','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Vary':'Origin'}}
function json(req:Request,data:any,status=200){return Response.json(data,{status,headers:{...cors(req),'Cache-Control':'private, no-store'}})}
function token(req:Request){const h=req.headers.get('authorization')||'';return h.toLowerCase().startsWith('bearer ')?h.slice(7):''}
async function user(req:Request,optional=false){const t=token(req);if(!t){if(optional)return null;throw new ApiError(401,'Sign in first.')}const {data,error}=await admin.auth.getUser(t);if(error||!data.user){throw new ApiError(401,'Your sign-in expired.')}const {data:link,error:le}=await db.rpc('ensure_reader_profile',{p_auth_user:data.user.id,p_name:String(data.user.user_metadata?.full_name||data.user.email?.split('@')[0]||'Reader').slice(0,80)});if(le)throw le;const {data:adm,error:ae}=await db.from('administrators').select('auth_user').eq('auth_user',data.user.id).maybeSingle();if(ae)throw ae;return {id:String(link),admin:!!adm}}
async function limit(id:string){const {data,error}=await db.rpc('consume_rate_limit',{p_key:`${id}:analytics`,p_limit:60,p_seconds:60});if(error)throw error;const r=Array.isArray(data)?data[0]:data;if(!r?.allowed)throw new ApiError(429,'Too many requests. Try again later.')}

import {summarizeVisits} from './summary.ts';
const views=['books','book','chapter','community','diary','profile','submissions','admin','safety','privacy','terms','cookies','other','login'];
const events=['view','heartbeat','exit','rating_saved','discussion_posted','reply_posted','search_empty','signup_started','signup_completed','signin_completed','action_error'];
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
async function handler(req:Request){const u=await user(req,true);
 if(req.method==='POST'){
  if(u?.admin)return json(req,{recorded:false,reason:'owner excluded'});
  if(!req.headers.get('content-type')?.includes('application/json'))throw new ApiError(415,'Send JSON data.');
  const text=await req.text();if(text.length>2500)throw new ApiError(413,'Event too large.');let d:any;try{d=JSON.parse(text)}catch{throw new ApiError(400,'Invalid event.')}
  if(d.consent!==2)return json(req,{recorded:false});
  if(!uuid(d.id)||!uuid(d.visitor)||!uuid(d.session)||!views.includes(d.view)||!events.includes(d.event)||!['mobile','desktop'].includes(d.device))throw new ApiError(400,'Invalid event.');
  if(!Number.isInteger(d.durationMs)||d.durationMs<0||d.durationMs>120000||d.chapter!==undefined&&(!Number.isInteger(d.chapter)||d.chapter<1||d.chapter>500)||d.book!==undefined&&!uuid(d.book))throw new ApiError(400,'Invalid event context.');
  if(d.loadMs!==null&&d.loadMs!==undefined&&(!Number.isInteger(d.loadMs)||d.loadMs<0||d.loadMs>60000))throw new ApiError(400,'Invalid timing.');
  if(['rating_saved','discussion_posted','reply_posted','signup_completed','signin_completed'].includes(d.event)&&!u)return json(req,{recorded:false});
  await limit(u?.id||d.visitor);
  const {error}=await db.from('visit_events').insert({id:d.id,visitor:d.visitor,session:d.session,reader:u?.id||null,event:d.event,view:d.view,book:d.book||null,chapter:d.chapter||null,duration_ms:d.durationMs,device:d.device,source:['direct','internal','instagram','facebook','tiktok','youtube','google','bing','duckduckgo','external'].includes(d.source)?d.source:'external',code:typeof d.code==='string'&&/^[a-z0-9_:-]{1,50}$/i.test(d.code)?d.code:null,load_ms:d.loadMs??null});
  if(error&&error.code!=='23505')throw error;
  // Cleanup also runs without a cron extension, whenever a view starts.
  if(d.event==='view')await db.rpc('prune_visit_events');return json(req,{recorded:true});
 }
 if(req.method!=='GET')throw new ApiError(405,'Method not allowed.');if(!u?.admin)throw new ApiError(403,'Owner access required.');
 const {error:cleanup}=await db.rpc('prune_visit_events');if(cleanup)throw cleanup;
 const [{count:books,error:e1},{count:readers,error:e2},{count:ratings,error:e3},{count:discussions,error:e4},{data:titles,error:e5}]=await Promise.all([db.from('books').select('id',{count:'exact',head:true}).eq('status','approved'),db.from('profiles').select('id',{count:'exact',head:true}),db.from('ratings').select('book',{count:'exact',head:true}),db.from('discussions').select('id',{count:'exact',head:true}),db.from('books').select('id,title')]);if(e1||e2||e3||e4||e5)throw e1||e2||e3||e4||e5;
 const rows:any[]=[];let capped=false;for(let offset=0;offset<20000;offset+=1000){const {data,error}=await db.from('visit_events').select('*').gte('created',new Date(Date.now()-90*86400000).toISOString()).order('created',{ascending:false}).range(offset,offset+999);if(error)throw error;rows.push(...(data||[]));if((data||[]).length<1000)break;if(offset===19000)capped=true}
 const normalized=rows.reverse().map(r=>({...r,duration_ms:undefined,durationMs:r.duration_ms}));return json(req,{platform:{books:books||0,readers:readers||0,ratings:ratings||0,discussions:discussions||0},...summarizeVisits(normalized,Date.now(),Object.fromEntries((titles||[]).map((b:any)=>[b.id,b.title]))),capped,windowDays:90});
}
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors(req)});try{return await handler(req)}catch(e){console.error(e);return json(req,{error:e instanceof ApiError?e.message:'Analytics unavailable.'},e instanceof ApiError?e.status:503)}});
