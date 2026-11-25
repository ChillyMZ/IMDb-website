'use client';
// "Remind me before my streak ends": web push via the service worker in public/sw.js.
// iPhone only allows web push once the site is added to the home screen.
import {useEffect,useState} from 'react';
import {Bell,BellOff} from 'lucide-react';
import {supabaseBrowserConfig} from './supabase-browser';
const VAPID_PUBLIC='BLsCpmDkRj_1624ZsgCFFlLRe8witxA5k-BHW98wO8RSDY7I6K_VUUPK2byZbsmMOttppklVHTShjuvbULkvFzw';
type State='loading'|'unsupported'|'ios-install'|'denied'|'off'|'on'|'busy';
const key=(b64:string)=>{const p='='.repeat((4-b64.length%4)%4),raw=atob((b64+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0))};
async function registration(){const base=supabaseBrowserConfig.basePath();return navigator.serviceWorker.register(base+'sw.js',{scope:base})}
const post=(body:unknown)=>fetch('/api/core',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

export default function PushReminders({member,onSignIn}:{member:boolean;onSignIn:()=>void}){
 const [state,setState]=useState<State>('loading'),[msg,setMsg]=useState('');
 useEffect(()=>{(async()=>{
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),standalone=window.matchMedia('(display-mode: standalone)').matches||(navigator as any).standalone===true;
  if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){setState(ios&&!standalone?'ios-install':'unsupported');return}
  if(Notification.permission==='denied'){setState('denied');return}
  try{const r=await navigator.serviceWorker.getRegistration(supabaseBrowserConfig.basePath());const sub=await r?.pushManager.getSubscription();setState(sub?'on':'off')}catch{setState('off')}
 })()},[]);
 async function enable(){setState('busy');setMsg('');try{
  const perm=await Notification.requestPermission();if(perm!=='granted'){setState(perm==='denied'?'denied':'off');return}
  const reg=await registration();await navigator.serviceWorker.ready;
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key(VAPID_PUBLIC)});const j=sub.toJSON();
  const r=await post({action:'push-subscribe',endpoint:j.endpoint,p256dh:j.keys?.p256dh,auth:j.keys?.auth,tz:-new Date().getTimezoneOffset()});if(!r.ok)throw Error((await r.json().catch(()=>({}))).error||'Could not turn on reminders.');
  setState('on');setMsg('Done. We’ll nudge you in the evening if you haven’t read yet.');
 }catch(e){setState('off');setMsg(e instanceof Error?e.message:'Could not turn on reminders.')}}
 async function disable(){setState('busy');setMsg('');try{const r=await navigator.serviceWorker.getRegistration(supabaseBrowserConfig.basePath());const sub=await r?.pushManager.getSubscription();if(sub){await post({action:'push-unsubscribe',endpoint:sub.endpoint}).catch(()=>{});await sub.unsubscribe()}setState('off');setMsg('Reminders are off.')}catch{setState('on')}}
 return <section className="p-panel push-reminders">
  <div className="pr-head"><span className="pr-icon" aria-hidden="true">{state==='on'?<Bell size={20}/>:<BellOff size={20}/>}</span><div><h2>Streak reminders</h2><p className="p-muted">One notification around 7pm, only on days you haven’t rated yet and have a streak to lose.</p></div></div>
  {!member?<><p>Create a free account to get streak reminders.</p><button className="p-primary" onClick={onSignIn}>Create free account</button></>:
   state==='loading'?null:
   state==='ios-install'?<p><b>On iPhone:</b> tap the Share button, then <b>Add to Home Screen</b>. Open ChillyMZ from your home screen and turn reminders on here.</p>:
   state==='unsupported'?<p>This browser can’t show reminders. Try Chrome, Edge, Firefox, or Safari on a Mac or iPhone home screen.</p>:
   state==='denied'?<p>Notifications are blocked for this site. Allow them in your browser’s site settings, then come back here.</p>:
   state==='on'?<button onClick={disable}>Turn off reminders</button>:
   <button className="p-primary" disabled={state==='busy'} onClick={enable}>{state==='busy'?'Turning on…':'Remind me before my streak ends'}</button>}
  {msg&&<p className="pr-msg" role="status">{msg}</p>}
 </section>;
}
