"use client";
import {useEffect,useState} from 'react';
import {apiResponse} from './api-response';
import BookArt from './book-art';
import {scoreBand} from './score-bands';
import {rankChapters,type ChapterTotal,type RankedChapter} from './highlights';

type HomeBook={id:string;title:string;author:string;chapter_count:number;status:string;cover:string;average?:number;votes?:number};
type Props={onOpen:(book:HomeBook,chapter?:number)=>void};

// Top 3 chapters from live reader ratings (books come from the Popular sort). Hidden until there is real data.
export default function HomeHighlights({onOpen}:Props){
 const [books,setBooks]=useState<HomeBook[]>([]),[chapters,setChapters]=useState<RankedChapter[]>([]);
 useEffect(()=>{const abort=new AbortController();(async()=>{try{
  const r=await fetch('/api/catalogue?'+new URLSearchParams({q:'',sort:'Popular',page:'1'}),{signal:abort.signal,cache:'no-store'}),d=await apiResponse<{books:HomeBook[]}>(r);if(!r.ok)return;
  const rated=d.books.filter(b=>(b.votes||0)>0);setBooks(rated.slice(0,6));
  // Chapter scores for the most-rated books (each request is the same public data a book page loads).
  const totals=(await Promise.all(rated.slice(0,5).map(async b=>{try{const c=await fetch('/api/core?book='+encodeURIComponent(b.id),{signal:abort.signal,cache:'no-store'}),j=await apiResponse<{totals:ChapterTotal[]}>(c);return c.ok?j.totals:[]}catch{return []}}))).flat();
  setChapters(rankChapters(totals,3));
 }catch{/* highlights are optional; the catalogue below still works */}})();return()=>abort.abort()},[]);
 if(!books.length||!chapters.length)return null;
 const byId=new Map(books.map(b=>[b.id,b]));
 return <div className="home-highlights">
  {chapters.length>0&&<section aria-labelledby="top-chapters"><div className="hh-head"><h2 id="top-chapters">Top chapters right now</h2><span>Ranked by reader score. Chapters with more votes count for more.</span></div>
   <ol className="hh-chapters">{chapters.map((c,i)=>{const b=byId.get(c.book),band=scoreBand(c.average);if(!b)return null;return <li key={c.book+c.chapter}><button type="button" onClick={()=>onOpen(b,c.chapter)}>
    <span className="hh-rank">{i+1}</span><span className="hh-cover"><BookArt book={b}/></span>
    <span className="hh-text"><b>Chapter {c.chapter}</b><small>{b.title}</small></span>
    <span className="hh-score"><b style={{background:band?.color,color:band?.text}}>{c.average.toFixed(1)}</b><small>{c.count} {c.count===1?'vote':'votes'}</small></span>
   </button></li>})}</ol></section>}
 </div>;
}
