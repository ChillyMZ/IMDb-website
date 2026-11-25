"use client";
// Public reader profile: frame, streak, level, Top 3, badges, followers. Individual scores are never shown.
import {useEffect,useState} from 'react';
import {Flame,UserPlus,UserCheck} from 'lucide-react';
import {apiResponse} from './api-response';
import BookArt from './book-art';
import {BadgeIcon} from './reader-stats';
import {badgesOf,progressOf,streakStatus,flameTier} from './stats';
import {frameFor} from './frames';

type Book={id:string;title:string;author:string;chapter_count:number;status?:string;cover?:string};
type ReaderData={reader:{id:string;name:string;bio:string};ratings:{book:string;chapter:number;score:number;date:string}[];books:Book[];top:string[];followers:number;following:number;followed:boolean;me:boolean;admin?:boolean;badges?:any[]};

export function useReader(id:string,revision=0){
 const [data,setData]=useState<ReaderData|null>(null),[error,setError]=useState('');
 useEffect(()=>{if(!id)return;let off=false;setError('');fetch('/api/reader?id='+encodeURIComponent(id),{cache:'no-store'}).then(async r=>{const d=await apiResponse<ReaderData>(r);if(!r.ok)throw Error((d as any).error||'Could not load this reader.');if(!off)setData(d)}).catch(e=>{if(!off)setError(e instanceof Error?e.message:'Could not load this reader.')});return ()=>{off=true}},[id,revision]);
 return {data,error};
}

export default function ReaderProfile({id,signedIn,onBack,onOpenBook,onSignIn}:{id:string;signedIn:boolean;onBack:()=>void;onOpenBook:(id:string)=>void;onSignIn:()=>void}){
 const [rev,setRev]=useState(0),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 const {data,error}=useReader(id,rev);
 if(error)return <div className="reader-page"><button type="button" className="shop-back" onClick={onBack}>← Back</button><div className="p-panel"><p>{error}</p></div></div>;
 if(!data)return <div className="reader-page"><p role="status">Loading reader…</p></div>;
 const src={user:{admin:!!data.admin},badges:data.badges||null,mine:data.ratings,books:data.books.map(b=>({...b,status:'approved'}))};
 const p=progressOf(src)!,badges=(badgesOf(src)||[]).filter(b=>b.earned),dates=data.ratings.map(r=>r.date),streak=dates.length?streakStatus(dates):null;
 const frame=frameFor(p.level),initial=(data.reader.name||'R').charAt(0).toUpperCase();
 const top=data.top.map(t=>data.books.find(b=>b.id===t)).filter((b):b is Book=>!!b);
 async function follow(){if(!signedIn){onSignIn();return}setBusy(true);setMsg('');try{const r=await fetch('/api/core',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:data!.followed?'unfollow':'follow',user:id})}),d=await r.json();if(!r.ok)throw Error(d.error);setRev(n=>n+1)}catch(e){setMsg(e instanceof Error?e.message:'Could not update.')}finally{setBusy(false)}}
 return <div className="reader-page">
  <button type="button" className="shop-back" onClick={onBack}>← Back</button>
  <section className="p-panel reader-hero">
   <span className="avatar-wrap avatar-wrap-lg"><span className={'profile-avatar frame frame-'+frame.id} aria-hidden="true">{initial}</span>{streak&&streak.current>0&&<span className={'avatar-flame flame-'+flameTier(streak.current).id} aria-label={`${streak.current}-day streak`}><Flame size={16} aria-hidden="true"/>{streak.current}</span>}</span>
   <div className="profile-id"><h1>{data.reader.name}</h1>{data.reader.bio?<p>{data.reader.bio}</p>:null}
    <p className="reader-meta"><b>Level {p.level}</b> · {p.xp.toLocaleString()} XP · {frame.name} frame</p>
    <p className="reader-counts"><span><b>{data.followers}</b> {data.followers===1?'follower':'followers'}</span><span><b>{data.following}</b> following</span><span><b>{data.ratings.length}</b> chapters rated</span></p></div>
   {!data.me&&<button className={data.followed?'reader-follow following':'p-primary reader-follow'} disabled={busy} onClick={follow}>{data.followed?<><UserCheck size={16} aria-hidden="true"/> Following</>:<><UserPlus size={16} aria-hidden="true"/> Follow</>}</button>}
   {msg&&<p role="alert">{msg}</p>}
  </section>
  <section className="p-panel"><h2>Top 3 books</h2>{top.length?<ol className="top3">{top.map((b,i)=><li key={b.id}><button type="button" onClick={()=>onOpenBook(b.id)}><span className="top3-rank">{i+1}</span><span className="top3-cover"><BookArt book={b}/></span><b>{b.title}</b><small>{b.author}</small></button></li>)}</ol>:<p className="p-muted">{data.me?'Pick your Top 3 on your profile.':'No Top 3 picked yet.'}</p>}</section>
  <section className="p-panel"><h2>Badges <span className="rs-sub rs-inline">{badges.length} earned</span></h2>{badges.length?<ul className="reader-badges">{badges.map(b=><li key={b.id} title={b.description}><span className="rs-badge-icon"><BadgeIcon id={b.id} size={18}/></span>{b.name}</li>)}</ul>:<p className="p-muted">No badges yet.</p>}</section>
 </div>;
}
