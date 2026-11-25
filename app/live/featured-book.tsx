"use client";
// Home banner for the owner's Book of the week.
import {useEffect,useState} from 'react';
import {apiResponse} from './api-response';
import BookArt from './book-art';

type Book={id:string;title:string;author:string;chapter_count:number;status:string;cover:string};
export type Featured={book:Book;note:string;since:string;ratingsThisWeek:number;readersThisWeek:number;discussions:number};
export function useFeatured(revision=0){
 const [f,setF]=useState<Featured|null>(null);
 useEffect(()=>{let off=false;fetch('/api/featured',{cache:'no-store'}).then(async r=>{const d=await apiResponse<{featured:Featured|null}>(r);if(!off&&r.ok)setF(d.featured)}).catch(()=>{});return ()=>{off=true}},[revision]);
 return f;
}
export default function FeaturedBook({revision,onOpen}:{revision:number;onOpen:(b:Book,discuss?:boolean)=>void}){
 const f=useFeatured(revision);if(!f)return null;
 return <section className="botw" aria-labelledby="botw-title">
  <button type="button" className="botw-cover" onClick={()=>onOpen(f.book)} aria-label={'Open '+f.book.title}><BookArt book={f.book}/></button>
  <div className="botw-body">
   <p className="botw-kicker">Book of the week</p>
   <h2 id="botw-title">{f.book.title}</h2>
   <p className="botw-author">{f.book.author} · {f.book.chapter_count} chapters</p>
   {f.note&&<p className="botw-note">“{f.note}” <span>— ChillyMZ</span></p>}
   <p className="botw-stats">{f.readersThisWeek} {f.readersThisWeek===1?'reader':'readers'} · {f.ratingsThisWeek} {f.ratingsThisWeek===1?'rating':'ratings'} this week · {f.discussions} {f.discussions===1?'discussion':'discussions'}</p>
   <div className="botw-actions"><button className="p-primary" onClick={()=>onOpen(f.book)}>Rate the chapters</button><button onClick={()=>onOpen(f.book,true)}>Join the discussion</button></div>
  </div>
 </section>;
}
