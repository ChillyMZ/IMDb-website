'use client';
// Bell next to the avatar: new followers, replies to your discussions, friends who joined from your
// invite (from the API), plus live nudges (streak at risk, close to the next level). Read state is per browser.
import {useEffect,useRef,useState} from 'react';
import {Bell,UserPlus,MessageCircle,Gift,Flame,TrendingUp,RotateCcw} from 'lucide-react';

type Item={id:string;type:'follow'|'reply'|'invite';at:string;user:string;name:string;post?:string;title?:string};
export type Nudge={id:string;kind:'streak'|'level'|'restore';text:string;action:string;onClick:()=>void};
const ago=(iso:string)=>{const m=Math.max(1,Math.round((Date.now()-Date.parse(iso))/60000));return m<60?m+'m':m<1440?Math.round(m/60)+'h':Math.round(m/1440)+'d'};

export default function NotificationBell({userId,nudges,onOpenReader,onOpenCommunity}:{userId:string;nudges:Nudge[];onOpenReader:(id:string)=>void;onOpenCommunity:()=>void}){
 const [items,setItems]=useState<Item[]>([]),[open,setOpen]=useState(false),[seen,setSeen]=useState<Set<string>>(new Set()),box=useRef<HTMLDivElement>(null);
 const key='cmz-notif-seen-'+userId;
 useEffect(()=>{try{setSeen(new Set(JSON.parse(localStorage.getItem(key)||'[]')))}catch{}},[key]);
 useEffect(()=>{let off=false;const load=()=>fetch('/api/notifications',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(!off&&d?.items)setItems(d.items)}).catch(()=>{});load();const t=setInterval(load,120000);return()=>{off=true;clearInterval(t)}},[userId]);
 useEffect(()=>{if(!open)return;const close=(e:MouseEvent|KeyboardEvent)=>{if(e instanceof KeyboardEvent?e.key==='Escape':!box.current?.contains(e.target as Node))setOpen(false)};document.addEventListener('mousedown',close);document.addEventListener('keydown',close);return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',close)}},[open]);
 const ids=[...nudges.map(n=>n.id),...items.map(i=>i.id)],unread=ids.filter(id=>!seen.has(id)).length;
 function toggle(){const next=!open;setOpen(next);if(next){const all=new Set([...seen,...ids]);setSeen(all);try{localStorage.setItem(key,JSON.stringify([...all].slice(-300)))}catch{}}}
 const icon={follow:UserPlus,reply:MessageCircle,invite:Gift,streak:Flame,level:TrendingUp,restore:RotateCcw};
 return <div className="notif" ref={box}>
  <button type="button" className="notif-bell" aria-label={unread?`Notifications, ${unread} new`:'Notifications'} aria-expanded={open} onClick={toggle}><Bell size={20} aria-hidden="true"/>{unread>0&&<span className="notif-count">{unread>9?'9+':unread}</span>}</button>
  {open&&<div className="notif-panel" role="dialog" aria-label="Notifications">
   <div className="notif-title">Notifications</div>
   {nudges.length>0&&<ul className="notif-list nudges">{nudges.map(n=>{const I=icon[n.kind];return <li key={n.id}><button type="button" onClick={()=>{setOpen(false);n.onClick()}}><span className={'notif-ic '+n.kind}><I size={16}/></span><span className="notif-text">{n.text}<b>{n.action} →</b></span></button></li>})}</ul>}
   {items.length?<ul className="notif-list">{items.map(i=>{const I=icon[i.type];return <li key={i.id} className={seen.has(i.id)?'':'new'}><button type="button" onClick={()=>{setOpen(false);i.type==='reply'?onOpenCommunity():onOpenReader(i.user)}}><span className={'notif-ic '+i.type}><I size={16}/></span><span className="notif-text"><span>{i.type==='follow'?<><b>{i.name}</b> started following you</>:i.type==='reply'?<><b>{i.name}</b> replied to “{i.title}”</>:<><b>{i.name}</b> joined from your invite</>}</span><small>{ago(i.at)} ago</small></span></button></li>})}</ul>
    :nudges.length===0&&<p className="notif-empty">Nothing new yet. Followers, replies and invite sign-ups show up here.</p>}
  </div>}
 </div>;
}
