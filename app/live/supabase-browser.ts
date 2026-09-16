const SUPABASE_URL='https://ysxaabrbngghbhfdfcqy.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_ehLRNJ1i5K6QNKYVfVkOZg_CTmzsXrh';
const API_BASE=SUPABASE_URL+'/functions/v1/chillymz-api';
const ADMIN_BASE=SUPABASE_URL+'/functions/v1/chillymz-admin';
const ANALYTICS_BASE=SUPABASE_URL+'/functions/v1/chillymz-analytics';
const SESSION_KEY='chillymz.supabase.session';

type Session={access_token:string;refresh_token?:string;expires_at?:number;expires_in?:number;token_type?:string;user?:unknown};

function basePath(){if(typeof location==='undefined')return '/IMDb-website/';return location.hostname==='chillymz.github.io'?'/IMDb-website/':'/'}
function readSession():Session|null{if(typeof localStorage==='undefined')return null;try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
export function saveSession(s:Session){const next={...s,expires_at:s.expires_at||Math.floor(Date.now()/1000)+(s.expires_in||3600)};localStorage.setItem(SESSION_KEY,JSON.stringify(next));return next}
export function clearSession(){if(typeof localStorage!=='undefined')localStorage.removeItem(SESSION_KEY)}
export function currentSession(){return readSession()}

let originalFetch:typeof window.fetch|undefined;
async function refreshSession(){const s=readSession();if(!s?.refresh_token)return s;if((s.expires_at||0)>Math.floor(Date.now()/1000)+60)return s;const f=originalFetch||window.fetch.bind(window);const r=await f(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});if(!r.ok){clearSession();return null}return saveSession(await r.json())}
export async function authSession(){return refreshSession()}

export function installApiProxy(){
 if(typeof window==='undefined'||(window as any).__chillymzApiProxy)return;
 (window as any).__chillymzApiProxy=true;
 originalFetch=window.fetch.bind(window);
 window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
  const raw=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  let path='';try{path=new URL(raw,location.href).pathname}catch{}
  if(raw.startsWith('/api/')||path.startsWith('/api/')){
   const u=new URL(raw,location.origin),endpoint=u.pathname.replace(/^\/api\//,'');
   const base=endpoint==='analytics'?ANALYTICS_BASE:(endpoint==='admin-test'||endpoint==='catalogue-import')?ADMIN_BASE:API_BASE;
   const target=new URL(base+'/'+endpoint);target.search=u.search;
   const session=await refreshSession();
   const headers=new Headers(input instanceof Request?input.headers:undefined);new Headers(init?.headers).forEach((v,k)=>headers.set(k,v));
   headers.set('apikey',PUBLISHABLE_KEY);if(session?.access_token)headers.set('Authorization','Bearer '+session.access_token);
   return originalFetch!(target.href,{...(input instanceof Request?{method:input.method,body:input.body,credentials:'omit'}:{}),...init,headers});
  }
  return originalFetch!(input as any,init);
 };
 document.addEventListener('click',async e=>{
  const a=(e.target as HTMLElement)?.closest?.('a') as HTMLAnchorElement|null;if(!a)return;
  let u:URL;try{u=new URL(a.href,location.href)}catch{return}if(u.origin!==location.origin)return;
  const pages=location.hostname==='chillymz.github.io';
  const rawPath=pages&&u.pathname.startsWith('/IMDb-website')?u.pathname.slice('/IMDb-website'.length)||'/':u.pathname;
  if(rawPath==='/signout-with-chatgpt'){
   e.preventDefault();const s=readSession();clearSession();
   if(s?.access_token){try{await originalFetch!(SUPABASE_URL+'/auth/v1/logout',{method:'POST',headers:{apikey:PUBLISHABLE_KEY,Authorization:'Bearer '+s.access_token}})}catch{}}
   location.href=basePath();return;
  }
  if(pages&&!u.pathname.startsWith('/IMDb-website')){
   e.preventDefault();const suffix=rawPath==='/'?'':rawPath.replace(/^\//,'');location.href=basePath()+suffix+u.search+u.hash;return;
  }
  if(rawPath==='/'){e.preventDefault();location.href=basePath();}
 });
}

export const supabaseBrowserConfig={url:SUPABASE_URL,publishableKey:PUBLISHABLE_KEY,sessionKey:SESSION_KEY,basePath};
