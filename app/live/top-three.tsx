"use client";
// Pick up to three favourite books, shown on the public profile.
import {useEffect,useState} from 'react';
import {apiResponse} from './api-response';
import BookArt from './book-art';
import {useReader} from './reader-profile';

type Book={id:string;title:string;author:string;chapter_count:number;cover?:string};
export default function TopThree({me,onSaved,onOpenPublic}:{me:string;onSaved?:()=>void;onOpenPublic:()=>void}){
 const [rev,setRev]=useState(0),{data}=useReader(me,rev);
 const [picks,setPicks]=useState<Book[]|null>(null),[slot,setSlot]=useState(-1),[q,setQ]=useState(''),[results,setResults]=useState<Book[]>([]),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');
 useEffect(()=>{if(data)setPicks(data.top.map(t=>data.books.find(b=>b.id===t)).filter((b):b is Book=>!!b))},[data]);
 useEffect(()=>{if(slot<0){setResults([]);return}const empty=q.trim().length<2;const t=setTimeout(async()=>{try{const r=await fetch('/api/catalogue?'+new URLSearchParams({q:empty?'':q,sort:empty?'Popular':'Title',page:'1'}),{cache:'no-store'}),d=await apiResponse<{books:Book[]}>(r);if(r.ok)setResults(d.books.slice(0,empty?12:6))}catch{}},250);return ()=>clearTimeout(t)},[q,slot]);
 async function save(next:Book[]){setBusy(true);setMsg('');try{const r=await fetch('/api/core',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'top3',books:next.map(b=>b.id)})}),d=await r.json();if(!r.ok)throw Error(d.error);setPicks(next);setSlot(-1);setQ('');setMsg('Top 3 saved.');setRev(n=>n+1);onSaved?.()}catch(e){setMsg(e instanceof Error?e.message:'Could not save.')}finally{setBusy(false)}}
 const list=picks||[];
 return <section className="p-panel profile-top3">
  <div className="top3-head"><h2>Your Top 3</h2><button type="button" className="shop-back" onClick={onOpenPublic}>View public profile →</button></div>
  {data&&<p className="reader-counts"><span><b>{data.followers}</b> {data.followers===1?'follower':'followers'}</span><span><b>{data.following}</b> following</span></p>}
  <ol className="top3 top3-edit">{[0,1,2].map(i=>{const b=list[i];return <li key={i}><button type="button" className={slot===i?'picking':''} onClick={()=>{setSlot(slot===i?-1:i);setQ('')}}><span className="top3-rank">{i+1}</span><span className="top3-cover">{b?<BookArt book={b}/>:<span className="top3-empty">+</span>}</span><b>{b?b.title:'Add a book'}</b>{b&&<small>Tap to change</small>}</button>{b&&<button type="button" className="top3-remove" disabled={busy} aria-label={'Remove '+b.title} onClick={()=>save(list.filter((_,j)=>j!==i))}>Remove</button>}</li>})}</ol>
  {slot>=0&&<div className="top3-search"><label>Find a book for #{slot+1}<input type="search" autoFocus placeholder="Search books or authors…" value={q} onChange={e=>setQ(e.target.value)}/></label>
   {q.trim().length<2&&results.length>0&&<p className="people-label">Popular books</p>}<ul>{results.map(b=><li key={b.id}><button type="button" disabled={busy} onClick={()=>{const next=[...list];if(next.some(x=>x.id===b.id)){setMsg('That book is already in your Top 3.');return}next[slot]=b;save(next.filter(Boolean).slice(0,3))}}><span className="top3-mini"><BookArt book={b}/></span><span><b>{b.title}</b><small>{b.author}</small></span></button></li>)}</ul></div>}
  {msg&&<p role="status" className="p-muted">{msg}</p>}
 </section>;
}
