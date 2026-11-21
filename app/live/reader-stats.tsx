"use client";
import {useMemo,useState} from 'react';
import {scoreBand} from './score-bands';
import {nextUnrated} from './reading-links';
import {readerStats,type MineRating,type Progress,type StatsBook,type StatsEntry} from './stats';
import {shareStatsCard} from './stats-card';

type Props={name:string;progress?:Progress|null;mine:MineRating[];books:StatsBook[];onOpen:(book:string,chapter:number)=>void;onBrowse:()=>void};

const Score=({value}:{value:number})=>{const b=scoreBand(value);return <span className="rs-score" style={{background:b?.color,color:b?.text}}>{value.toFixed(1)}</span>};

// Level bar: progress within the current level, plus how much of today's XP allowance is used.
const Level=({p}:{p:Progress})=><div className="rs-level">
 <div className="rs-level-top"><span className="rs-level-badge">Level {p.level}</span><b>{p.xp} XP</b><span className="rs-sub">{p.nextXp-p.xp} XP to Level {p.level+1}</span></div>
 <progress value={p.xp-p.levelXp} max={p.nextXp-p.levelXp} aria-label={`Level ${p.level} progress`}/>
 <small>Today: {p.ratingsToday} of {p.ratingCap} chapters earning XP · 10 XP per chapter, 25 per review, 50 for finishing a book</small>
</div>;

export default function ReaderStats({name,progress,mine,books,onOpen,onBrowse}:Props){
 const s=useMemo(()=>readerStats(mine,books),[mine,books]);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[showAll,setShowAll]=useState(false);
 const canShare=typeof navigator!=='undefined'&&typeof navigator.share==='function';
 const chapterRow=(r:StatsEntry,extra?:string)=><button type="button" className="rs-chapter" onClick={()=>onOpen(r.book,r.chapter)}><Score value={r.score}/><span><span className="rs-name">{r.title}</span><span className="rs-sub">Chapter {r.chapter}{extra?' · '+extra:''}</span></span></button>;
 async function card(preferShare:boolean){
  setBusy(true);setMessage('');
  try{const how=await shareStatsCard(name,s,preferShare);setMessage(how==='shared'?'Stats card shared.':'Stats card downloaded. Post it anywhere!')}
  catch(e){if(!(e instanceof DOMException&&e.name==='AbortError'))setMessage(e instanceof Error?e.message:'Could not create the image.')}
  finally{setBusy(false)}
 }
 if(!s.total)return <section className="reader-stats"><div className="rs-head"><div><span className="eyebrow">YOUR READING STATS</span><h1>Your stats</h1></div></div><div className="p-panel"><p>Rate your first chapter and your reading stats will appear here: favourite chapters, harshest takes, streaks and a card you can share.</p><button className="p-primary" onClick={onBrowse}>Find a book to rate</button></div></section>;
 const recent=showAll?s.recent:s.recent.slice(0,15);
 return <section className="reader-stats">
  <div className="rs-head">
   <div><span className="eyebrow">YOUR READING STATS</span><h1>{name||'Reader'}’s chapter story</h1></div>
   <div className="rs-actions">
    {canShare&&<button className="p-primary" disabled={busy} onClick={()=>card(true)}>Share stats card</button>}
    <button className={canShare?'':'p-primary'} disabled={busy} onClick={()=>card(false)}>{busy?'Creating image…':'Download stats card'}</button>
   </div>
  </div>
  {message&&<p role="status" className="rs-message">{message}</p>}
  {progress&&<Level p={progress}/>}
  <div className="rs-tiles">
   <div className="rs-tile"><b>{s.total}</b><span>{s.total===1?'chapter rated':'chapters rated'}</span></div>
   <div className="rs-tile"><b>{s.books}</b><span>{s.books===1?'book':'books'}</span>{s.finished>0&&<small>{s.finished} finished</small>}</div>
   <div className="rs-tile"><b>{s.average?.toFixed(2)??'—'}</b><span>average score</span></div>
   <div className="rs-tile"><b>{s.current}</b><span>day streak</span><small>Best: {s.best} {s.best===1?'day':'days'}</small></div>
  </div>
  <div className="rs-pair">
   {s.kindest&&<article className="p-panel"><h2>Kindest score</h2>{chapterRow(s.kindest)}</article>}
   {s.harshest&&<article className="p-panel"><h2>Harshest take</h2>{chapterRow(s.harshest)}</article>}
  </div>
  <article className="p-panel"><h2>Favourite chapters</h2><ol className="rs-list">{s.favourites.map(r=><li key={r.book+r.chapter}>{chapterRow(r)}</li>)}</ol></article>
  <article className="p-panel"><h2>Your score mix</h2>
   <div className="rs-mix" role="img" aria-label={s.bands.filter(b=>b.count).map(b=>b.label+': '+b.count).join(', ')}>{s.bands.filter(b=>b.count).map(b=><i key={b.min} style={{flexGrow:b.count,background:b.color}}/>)}</div>
   <ul className="rs-legend">{s.bands.map(b=><li key={b.min}><i style={{background:b.color}}/>{b.label}<b>{b.count}</b></li>)}</ul>
  </article>
  <article className="p-panel"><h2>Your books</h2>{s.progress.map(p=>{const next=nextUnrated(p.book.chapter_count,mine.filter(r=>r.book===p.book.id));return <button type="button" key={p.book.id} className="rs-book" onClick={()=>onOpen(p.book.id,next)}><span className="rs-name">{p.book.title}</span><span className="rs-sub">{p.finished?'Finished · ':''}{p.rated} / {p.book.chapter_count} chapters · avg {p.average.toFixed(1)}</span><progress value={p.rated} max={p.book.chapter_count}/>{next>0&&<span className="rs-next">Continue · Chapter {next}</span>}</button>})}</article>
  <article className="p-panel"><h2>Diary</h2><ol className="rs-list">{recent.map(r=><li key={r.book+r.chapter}>{chapterRow(r,new Date(r.date).toLocaleDateString())}</li>)}</ol>{s.recent.length>15&&<button type="button" onClick={()=>setShowAll(v=>!v)}>{showAll?'Show fewer':'Show all '+s.recent.length+' ratings'}</button>}</article>
 </section>;
}
