// Front-page rankings from real reader ratings only (no estimates, no invented activity).
// Chapters are ranked by an IMDb-style weighted score so one enthusiastic vote can't top the chart:
// weighted = (v/(v+m))·R + (m/(v+m))·C, where R = chapter average, v = its votes,
// C = average of all chapters shown, m = votes needed before a chapter's own average dominates.
export type ChapterTotal={book:string;chapter:number;average:number;count:number};
export type RankedChapter=ChapterTotal&{weighted:number};
export const MIN_WEIGHT_VOTES=3;

export function rankChapters(totals:ChapterTotal[],limit=8,m=MIN_WEIGHT_VOTES):RankedChapter[]{
 const rated=totals.filter(t=>t.count>0&&Number.isFinite(t.average));
 if(!rated.length)return [];
 const votes=rated.reduce((a,t)=>a+t.count,0),C=rated.reduce((a,t)=>a+t.average*t.count,0)/votes;
 return rated.map(t=>({...t,weighted:(t.count/(t.count+m))*t.average+(m/(t.count+m))*C}))
  .sort((a,b)=>b.weighted-a.weighted||b.count-a.count||a.chapter-b.chapter).slice(0,limit);
}
