// Build-time data for share-link previews. Scores are fetched once per deploy, so previews show
// ratings as of the last deploy; if the API can't be reached they fall back to cover and title only.
import books from '../books/catalogue.json';
const API='https://ysxaabrbngghbhfdfcqy.supabase.co/functions/v1/chillymz-api';
const KEY='sb_publishable_ehLRNJ1i5K6QNKYVfVkOZg_CTmzsXrh';
export type ShareBook=(typeof books)[number];
export const shareBooks:ShareBook[]=books;
export type Scores={source:'readers'|'chillymz'|'none';values:(number|undefined)[];average?:number;votes:number};
const cache=new Map<string,Promise<Scores>>();
export function scoresFor(b:ShareBook):Promise<Scores>{
 if(!cache.has(b.id))cache.set(b.id,(async()=>{
  try{const r=await fetch(API+'/core?book='+encodeURIComponent(b.id),{headers:{apikey:KEY}});if(!r.ok)throw 0;const d=await r.json();
   const values=Array.from({length:b.chapter_count},()=>undefined as number|undefined);let votes=0;
   if(d.totals?.length){let sum=0;for(const t of d.totals){values[t.chapter-1]=t.average;sum+=t.average;votes+=t.count}return {source:'readers',values,average:sum/d.totals.length,votes}}
   if(d.chillymz?.length){let sum=0;for(const t of d.chillymz){values[t.chapter-1]=t.score;sum+=t.score}return {source:'chillymz',values,average:sum/d.chillymz.length,votes:0}}
  }catch{}
  return {source:'none',values:[],votes:0}})());
 return cache.get(b.id)!}
